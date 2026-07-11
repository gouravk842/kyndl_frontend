"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  SkyConfig,
  Star,
  WishConfig,
} from "@/features/constellation/config";
import {
  type Cloud,
  generateClouds,
  generateGrass,
  generateRidge,
  type GrassBlade,
  groundLevelPx,
  paintClouds,
  paintCouple,
  paintGrass,
  paintGround,
  paintHorizon,
  paintMilkyWay,
  paintMountains,
  paintTree,
} from "@/features/constellation/lib/scene";
import { resolveFinaleGlyph } from "@/features/constellation/lib/shapes";
import {
  applyCamera,
  type BgStar,
  type Camera,
  constellationCenter,
  type EdgeRender,
  edgesOf,
  ENTRANCE_MS,
  generateBackgroundStars,
  identityCamera,
  makeRng,
  paintBackgroundStars,
  paintEdges,
  paintHiddenShape,
  paintNebula,
  paintShootingStar,
  paintSky,
  paintStar,
  type ShootingStar,
  spawnShootingStar,
  starToPixel,
  type Vec,
} from "@/features/constellation/lib/sky";

const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
/** Frame-rate-independent easing factor for an exponential approach. */
const approach = (dt: number, k: number): number => 1 - Math.exp(-dt * k);

const KEEPSAKE_ENTRANCE_MS = 900;
const TOUR_ZOOM = 1.7;
const PARALLAX_BG = 22;
const PARALLAX_NEBULA = 12;
const WISH_CATCH_RADIUS = 34;

type TourState = "idle" | "playing" | "paused";

type EngineOptions = {
  /** Fired whenever a star's memory actually opens (tour or tap) — the host
   * uses it to persist which stars have been cleared. */
  onOpen?: (id: number) => void;
  /** Gate for the cinematic tour: may it auto-open this star? Returns false for
   * a star still hidden behind an unsolved challenge or unmet requirement, so
   * the tour pans past it without spoiling the memory. Defaults to always. */
  canOpen?: (id: number) => boolean;
};

/**
 * The brain of the Constellation. Owns interaction state (opened / active /
 * hovered), the ceremony timeline, the cinematic tour camera, parallax, the
 * draw-itself edge reveal, and the finale ignite — all on one rAF loop that
 * reads live state through refs so opening a star never restarts it.
 */
export function useConstellationEngine(
  config: SkyConfig,
  options: EngineOptions = {},
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = useReducedMotion() ?? false;

  const [openedIds, setOpenedIds] = useState<Set<number>>(() => new Set());
  const [activeId, setActiveId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);
  const [started, setStarted] = useState(false);
  const [touring, setTouring] = useState(false);
  const [tourPaused, setTourPaused] = useState(false);
  const [caughtWish, setCaughtWish] = useState<WishConfig | null>(null);

  const total = config.stars.length;
  const allOpened = openedIds.size === total;
  const activeStar = useMemo<Star | null>(
    () => config.stars.find((s) => s.id === activeId) ?? null,
    [config.stars, activeId],
  );

  // ── refs the rAF loop reads without being a dependency ──
  const openedRef = useRef(openedIds);
  const hoveredRef = useRef(hoveredId);
  const activeRef = useRef(activeId);
  const allOpenedRef = useRef(allOpened);
  // Host callbacks read live from the rAF loop / openStar without re-subscribing.
  const onOpenRef = useRef(options.onOpen);
  const canOpenRef = useRef(options.canOpen);
  useEffect(() => {
    openedRef.current = openedIds;
    hoveredRef.current = hoveredId;
    activeRef.current = activeId;
    allOpenedRef.current = allOpened;
    onOpenRef.current = options.onOpen;
    canOpenRef.current = options.canOpen;
  });

  const startedRef = useRef(false);
  const ceremonialRef = useRef(true);
  const entranceStartRef = useRef<number | null>(null);
  const tourRef = useRef<{ state: TourState; index: number; elapsed: number }>({
    state: "idle",
    index: -1,
    elapsed: 0,
  });
  const shootingRef = useRef<ShootingStar[]>([]);

  const openStar = useCallback((id: number) => {
    setActiveId(id);
    setOpenedIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    onOpenRef.current?.(id);
  }, []);

  const closeStar = useCallback(() => setActiveId(null), []);

  // ── ceremony ──
  const begin = useCallback((ceremonial: boolean) => {
    if (startedRef.current) return;
    startedRef.current = true;
    ceremonialRef.current = ceremonial;
    entranceStartRef.current = performance.now();
    setStarted(true);

    // iOS gates device-tilt behind a permission prompt that must come from a
    // gesture — this call rides the entrance tap.
    const DOE = window.DeviceOrientationEvent as
      | (typeof window.DeviceOrientationEvent & {
          requestPermission?: () => Promise<PermissionState>;
        })
      | undefined;
    if (DOE && typeof DOE.requestPermission === "function") {
      void DOE.requestPermission().catch(() => {});
    }
  }, []);

  // ── tour controls ──
  const startTour = useCallback(() => {
    tourRef.current = { state: "playing", index: -1, elapsed: Infinity };
    setTouring(true);
    setTourPaused(false);
  }, []);
  const pauseTour = useCallback(() => {
    if (tourRef.current.state !== "playing") return;
    tourRef.current.state = "paused";
    setTourPaused(true);
  }, []);
  const resumeTour = useCallback(() => {
    if (tourRef.current.state !== "paused") return;
    tourRef.current.state = "playing";
    setTourPaused(false);
  }, []);
  const stopTour = useCallback(() => {
    tourRef.current = { state: "idle", index: -1, elapsed: 0 };
    setTouring(false);
    setTourPaused(false);
    closeStar();
  }, [closeStar]);

  const dismissWish = useCallback(() => setCaughtWish(null), []);

  // ── catch a wish star (called from a pointer handler in screen space) ──
  const tryCatchWish = useCallback(
    (clientX: number, clientY: number) => {
      if (!config.wish || tourRef.current.state !== "idle") return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const stars = shootingRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (!s || !s.catchable) continue;
        if (Math.hypot(s.x - x, s.y - y) <= WISH_CATCH_RADIUS) {
          stars.splice(i, 1);
          setCaughtWish(config.wish);
          return;
        }
      }
    },
    [config.wish],
  );

  // ── the render loop ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();

    const bgStars: BgStar[] = generateBackgroundStars(
      config.backgroundStarCount,
      makeRng(0x5eed ^ config.backgroundStarCount),
    );
    const rng = makeRng(0xc0ffee);
    const center = constellationCenter(config);
    const byId = new Map(config.stars.map((s) => [s.id, s]));
    const edges = edgesOf(config);
    const glyph = config.finale.glyph
      ? resolveFinaleGlyph(config.finale)
      : null;
    const litMap = new Map<string, number>();
    shootingRef.current = [];

    // dusk-meadow scene geometry (seeded once, normalized so resizes are free)
    const ridgeBack: number[] = generateRidge(28, 0x1d11, 0.34);
    const ridgeFront: number[] = generateRidge(38, 0x2e22, 0.52);
    const grass: GrassBlade[] = generateGrass(150, 0x3f33);
    const clouds: Cloud[] = generateClouds(5, 0x4a44);

    let camera: Camera = identityCamera(width, height);
    const parallax = { x: 0, y: 0 };
    const parallaxTarget = { x: 0, y: 0 };
    let finale = 0;
    let glyphAlpha = 0;
    let shootingCount = 0;
    let enteredFired = false;

    const start = performance.now();
    let last = start;
    let nextShootingAt =
      start + ENTRANCE_MS + config.shootingStarFrequency * (0.5 + rng());

    const onPointer = (e: PointerEvent) => {
      if (reduceMotion) return;
      parallaxTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      parallaxTarget.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (reduceMotion || e.gamma == null || e.beta == null) return;
      parallaxTarget.x = Math.max(-1, Math.min(1, e.gamma / 35));
      parallaxTarget.y = Math.max(-1, Math.min(1, (e.beta - 45) / 35));
    };
    window.addEventListener("pointermove", onPointer);
    window.addEventListener("deviceorientation", onTilt);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => resize())
        : null;
    ro?.observe(canvas);

    let raf = 0;
    const frame = (now: number) => {
      const t = (now - start) / 1000;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // entrance progress (only after begin())
      const entranceStart = entranceStartRef.current;
      const dur = ceremonialRef.current ? ENTRANCE_MS : KEEPSAKE_ENTRANCE_MS;
      const entrance =
        entranceStart == null
          ? 0
          : reduceMotion
            ? 1
            : easeOutCubic(clamp01((now - entranceStart) / dur));
      if (!enteredFired && entrance >= 1 && entranceStart != null) {
        enteredFired = true;
        setEntered(true);
      }

      // tour timeline
      const tour = tourRef.current;
      if (tour.state === "playing") {
        tour.elapsed += dt * 1000;
        if (tour.elapsed >= config.tour.perStarMs) {
          tour.index += 1;
          if (tour.index >= config.stars.length) {
            tour.state = "idle";
            setTouring(false);
            closeStar();
          } else {
            const star = config.stars[tour.index];
            // Respect gates: pan to a still-locked star but don't spoil it.
            if (star && (canOpenRef.current?.(star.id) ?? true)) {
              openStar(star.id);
            } else {
              closeStar();
            }
            tour.elapsed = 0;
          }
        }
      }

      // camera easing toward the focused star (or home)
      const focus =
        tour.state !== "idle" &&
        !reduceMotion &&
        tour.index >= 0 &&
        tour.index < config.stars.length
          ? config.stars[tour.index]
          : null;
      const targetCam: Camera = focus
        ? { ...starToPixel(focus, width, height), zoom: TOUR_ZOOM }
        : identityCamera(width, height);
      if (reduceMotion) {
        camera = targetCam;
      } else {
        const k = approach(dt, 4);
        camera = {
          x: camera.x + (targetCam.x - camera.x) * k,
          y: camera.y + (targetCam.y - camera.y) * k,
          zoom: camera.zoom + (targetCam.zoom - camera.zoom) * k,
        };
      }

      // parallax + finale easing
      const pk = approach(dt, 4);
      parallax.x += (parallaxTarget.x - parallax.x) * pk;
      parallax.y += (parallaxTarget.y - parallax.y) * pk;
      finale +=
        ((allOpenedRef.current ? 1 : 0) - finale) * Math.min(dt * 2.5, 1);
      glyphAlpha +=
        ((allOpenedRef.current ? 1 : 0) - glyphAlpha) * Math.min(dt * 1.4, 1);
      const finalePulse = reduceMotion
        ? finale
        : finale * (0.7 + Math.sin(t * 1.2) * 0.3);

      // a slow wind that moves the grass, flowers, tree and clouds
      const windPhase = t * config.scene.windSpeed;
      const gust = reduceMotion ? 1 : 0.6 + 0.4 * Math.sin(t * 0.13);

      // ── paint ──
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);
      paintSky(ctx, width, height, config); // screen space — always fills

      ctx.save();
      applyCamera(ctx, camera, width, height); // world space

      paintNebula(
        ctx,
        center,
        width,
        height,
        config.nebulaColor,
        1 + finale * 0.8,
        {
          x: parallax.x * PARALLAX_NEBULA,
          y: parallax.y * PARALLAX_NEBULA,
        },
      );
      if (config.scene.enabled) {
        paintMilkyWay(ctx, width, height, t, reduceMotion);
      }
      paintBackgroundStars(ctx, bgStars, width, height, t, reduceMotion, {
        x: parallax.x * PARALLAX_BG,
        y: parallax.y * PARALLAX_BG,
      });

      // shooting / wish stars
      if (!reduceMotion) {
        const enteredNow = entrance >= 1;
        if (
          enteredNow &&
          config.shootingStarFrequency > 0 &&
          now >= nextShootingAt
        ) {
          const wantsWish =
            !!config.wish &&
            shootingCount % 4 === 3 &&
            !shootingRef.current.some((s) => s.catchable);
          shootingRef.current.push(spawnShootingStar(rng, width, wantsWish));
          shootingCount += 1;
          nextShootingAt =
            now + config.shootingStarFrequency * (0.6 + rng() * 0.8);
        }
        const live = shootingRef.current;
        for (let i = live.length - 1; i >= 0; i--) {
          const s = live[i];
          if (!s) continue;
          s.life += dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          if (s.life >= s.maxLife || s.y > height + 40) {
            live.splice(i, 1);
            continue;
          }
          paintShootingStar(ctx, s);
        }
      }

      // edges — build render state from opened set + entrance/reveal rules
      const drawn = entrance * edges.length;
      const renders: EdgeRender[] = [];
      edges.forEach(([fromId, toId], i) => {
        const from = byId.get(fromId);
        const to = byId.get(toId);
        if (!from || !to) return;
        const a = starToPixel(from, width, height);
        const b = starToPixel(to, width, height);
        let litAmount: number;
        let ghostAlpha = 0;
        if (config.revealEdgesOnOpen) {
          const key = `${fromId}-${toId}`;
          const target =
            openedRef.current.has(fromId) && openedRef.current.has(toId)
              ? 1
              : 0;
          const cur = litMap.get(key) ?? 0;
          const next = cur + (target - cur) * approach(dt, 3.5);
          litMap.set(key, next);
          litAmount = next;
          ghostAlpha = config.ghostEdges ? entrance : 0;
        } else {
          litAmount = clamp01(drawn - i);
        }
        renders.push({ from: a, to: b, litAmount, ghostAlpha });
      });
      const dashOffset = reduceMotion ? 0 : (t * 14) % 1000;
      paintEdges(
        ctx,
        renders,
        config.lineStyle,
        config.lineColor,
        finalePulse,
        dashOffset,
      );

      // finale glyph, ignited over the centroid
      if (glyph) {
        const cpx: Vec = {
          x: (center.x / 100) * width,
          y: (center.y / 100) * height,
        };
        const size =
          glyph.kind === "text"
            ? Math.min(width, height) * 0.16
            : Math.min(width, height) * 0.34;
        paintHiddenShape(
          ctx,
          glyph,
          cpx,
          size,
          glyphAlpha,
          config.finale.color,
        );
      }

      // named stars
      const opened = openedRef.current;
      config.stars.forEach((star, i) => {
        const stagger = i / Math.max(total, 1);
        const appear = reduceMotion
          ? entranceStart == null
            ? 0
            : 1
          : clamp01((entrance - stagger * 0.5) / 0.5);
        paintStar(ctx, star, width, height, {
          appear,
          opened: opened.has(star.id),
          hovered: hoveredRef.current === star.id,
          active: activeRef.current === star.id,
          t,
        });
      });

      ctx.restore(); // ← back to screen space (camera undone)

      // ── foreground scene, drawn in screen space over the sky ──
      if (config.scene.enabled) {
        const s = config.scene;
        const groundY = groundLevelPx(s, height);
        const fgScale = height / 780;

        paintHorizon(ctx, width, height, groundY, s.horizonGlow, s.horizonHaze);
        paintClouds(
          ctx,
          width,
          height,
          groundY,
          clouds,
          t,
          windPhase,
          s.cloudTint,
        );
        // back ridge: taller, hazier; front ridge: lower, darkest
        paintMountains(
          ctx,
          width,
          height,
          groundY,
          ridgeBack,
          groundY,
          height * 0.12,
          "#0b1530",
        );
        paintMountains(
          ctx,
          width,
          height,
          groundY,
          ridgeFront,
          groundY,
          height * 0.07,
          s.silhouette,
        );
        paintGround(ctx, width, height, groundY, s.silhouette);
        paintTree(
          ctx,
          width * 0.1,
          groundY,
          fgScale * 1.4,
          reduceMotion ? 0 : Math.sin(windPhase * 0.6) * gust,
          s.silhouette,
        );
        paintCouple(ctx, width * 0.5, groundY, fgScale, s.silhouette);
        paintGrass(
          ctx,
          width,
          height,
          groundY,
          (s.grassBand / 100) * height,
          grass,
          t,
          windPhase,
          gust,
          reduceMotion,
          s.silhouette,
          s.flowerColor,
        );
      }

      ctx.restore(); // ← back to identity (dpr undone)
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onTilt);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, reduceMotion, total]);

  return {
    canvasRef,
    reduceMotion,
    openedIds,
    activeId,
    activeStar,
    hoveredId,
    setHoveredId,
    openStar,
    closeStar,
    allOpened,
    entered,
    total,
    // ceremony + tour
    started,
    begin,
    touring,
    tourPaused,
    startTour,
    pauseTour,
    resumeTour,
    stopTour,
    // wish
    caughtWish,
    dismissWish,
    tryCatchWish,
  };
}
