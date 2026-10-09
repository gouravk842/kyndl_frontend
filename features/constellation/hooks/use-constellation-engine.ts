"use client";

import { useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  SkyConfig,
  Star,
  WishConfig,
} from "@/features/constellation/config";
import {
  cameraHome,
  clampCamera,
  type FieldCamera,
  fieldPresence,
  PRESENCE_GLINT,
} from "@/features/constellation/lib/field";
import { storyOrder } from "@/features/constellation/lib/layout";
import {
  type Cloud,
  generateClouds,
  generateGrass,
  generateRidge,
  type GrassBlade,
  paintClouds,
  paintCouple,
  paintGrass,
  paintGround,
  paintHorizon,
  paintMilkyWay,
  paintMountains,
  paintRooftop,
  paintShore,
  paintTree,
} from "@/features/constellation/lib/scene";
import { glyphSlots } from "@/features/constellation/lib/shapes";
import {
  applyCamera,
  type BgStar,
  type Camera,
  edgesOf,
  ENTRANCE_MS,
  generateBackgroundStars,
  identityCamera,
  makeRng,
  paintBackgroundStars,
  paintKinship,
  paintNebula,
  paintShootingStar,
  paintSky,
  paintStar,
  type ShootingStar,
  spawnShootingStar,
  starScreen,
} from "@/features/constellation/lib/sky";

const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
/** Frame-rate-independent easing factor for an exponential approach. */
const approach = (dt: number, k: number): number => 1 - Math.exp(-dt * k);

const KEEPSAKE_ENTRANCE_MS = 900;
const PARALLAX_BG = 22;
const PARALLAX_NEBULA = 12;
const WISH_CATCH_RADIUS = 34;
/** How wide the finale shape is, in viewport percent, while the stars hold it. */
const SHAPE_SPAN = 42;

function centroidOf(stars: { x: number; y: number }[]): {
  x: number;
  y: number;
} {
  if (stars.length === 0) return { x: 50, y: 36 };
  let x = 0;
  let y = 0;
  for (const star of stars) {
    x += star.x;
    y += star.y;
  }
  return { x: x / stars.length, y: y / stars.length };
}

type TourState = "idle" | "playing" | "paused";

type EngineOptions = {
  /** Fired whenever a star's memory actually opens (tour or tap) — the host
   * uses it to persist which stars have been cleared. */
  onOpen?: (id: number) => void;
  /** Gate for the cinematic tour: may it auto-open this star? Returns false for
   * a star still hidden behind an unsolved challenge or unmet requirement, so
   * the tour pans past it without spoiling the memory. Defaults to always. */
  canOpen?: (id: number) => boolean;
  /** Stars already read on this device. Seeded into the lit set, not including
   * stars that ask again every visit. */
  rememberedIds?: ReadonlySet<number>;
  /** When set, the host owns the camera (the builder board). */
  viewCamera?: FieldCamera | null;
  /** fileId → URL, so a near star can wear its photo. */
  assets?: Record<string, string>;
  /** Return visits open on the newest star. First visits open on the oldest. */
  focusNewest?: boolean;
};

/**
 * The brain of the Constellation. Owns interaction state (opened / active /
 * hovered), the ceremony timeline, the cinematic tour camera, and parallax —
 * all on one rAF loop that
 * reads live state through refs so opening a star never restarts it.
 */
export function useConstellationEngine(
  config: SkyConfig,
  options: EngineOptions = {},
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = useReducedMotion() ?? false;

  const [openedIds, setOpenedIds] = useState<Set<number>>(() => new Set());
  const rememberedIds = options.rememberedIds;
  const litIds = useMemo(() => {
    if (!rememberedIds || rememberedIds.size === 0) return openedIds;
    let changed = false;
    const next = new Set(openedIds);
    for (const id of rememberedIds) {
      if (!next.has(id)) {
        next.add(id);
        changed = true;
      }
    }
    return changed ? next : openedIds;
  }, [openedIds, rememberedIds]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);
  const [started, setStarted] = useState(false);
  const [touring, setTouring] = useState(false);
  const [tourPaused, setTourPaused] = useState(false);
  const [caughtWish, setCaughtWish] = useState<WishConfig | null>(null);
  const home0 = cameraHome(config.stars, false);
  const [camera, setCamera] = useState<FieldCamera>(home0);
  const [shaping, setShaping] = useState(false);

  const authored = useMemo(
    () => config.stars.filter((star) => !star.reply),
    [config.stars],
  );
  const total = authored.length;
  const allOpened =
    total === 0 || authored.every((star) => litIds.has(star.id));
  const activeStar = useMemo<Star | null>(
    () => config.stars.find((s) => s.id === activeId) ?? null,
    [config.stars, activeId],
  );

  // ── refs the rAF loop reads without being a dependency ──
  const openedRef = useRef(litIds);
  const hoveredRef = useRef(hoveredId);
  const activeRef = useRef(activeId);
  const allOpenedRef = useRef(allOpened);
  // Host callbacks read live from the rAF loop / openStar without re-subscribing.
  const onOpenRef = useRef(options.onOpen);
  const canOpenRef = useRef(options.canOpen);
  const viewCameraRef = useRef(options.viewCamera);
  const assetsRef = useRef(options.assets ?? {});
  const photosRef = useRef<Map<number, CanvasImageSource>>(new Map());
  const cameraRef = useRef<FieldCamera>(home0);
  const cameraTargetRef = useRef<FieldCamera | null>(null);
  const flareRef = useRef<Map<number, number>>(new Map());
  const publishedCameraRef = useRef<FieldCamera>(home0);
  const pannedRef = useRef(false);
  const focusApplied = useRef<boolean | null>(null);
  useEffect(() => {
    openedRef.current = litIds;
    hoveredRef.current = hoveredId;
    activeRef.current = activeId;
    allOpenedRef.current = allOpened;
    onOpenRef.current = options.onOpen;
    canOpenRef.current = options.canOpen;
    viewCameraRef.current = options.viewCamera;
    assetsRef.current = options.assets ?? {};
    if (options.viewCamera != null) cameraRef.current = options.viewCamera;
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
    flareRef.current.set(id, performance.now());
    setOpenedIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    onOpenRef.current?.(id);
  }, []);

  const panBy = useCallback(
    (dxPx: number, dyPx: number, widthPx: number, heightPx: number) => {
      if (widthPx <= 0 || heightPx <= 0 || viewCameraRef.current != null)
        return;
      const cur = cameraRef.current;
      const next = clampCamera(
        {
          x: cur.x - (dxPx / widthPx) * 100,
          y: cur.y - (dyPx / heightPx) * 100,
        },
        config.stars,
      );
      pannedRef.current = true;
      cameraRef.current = next;
      cameraTargetRef.current = null;
      setCamera(next);
    },
    [config.stars],
  );

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

  const focusNewest = options.focusNewest ?? false;
  // First visit rests on the oldest figure. A later visit opens on the newest,
  // unless the viewer has already dragged the sky themselves.
  useLayoutEffect(() => {
    if (viewCameraRef.current != null) return;
    if (pannedRef.current && focusApplied.current !== null) return;
    if (focusApplied.current === focusNewest) return;
    focusApplied.current = focusNewest;
    const next = cameraHome(config.stars, focusNewest);
    cameraRef.current = next;
    cameraTargetRef.current = null;
    publishedCameraRef.current = next;
    setCamera(next);
  }, [focusNewest, config]);

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
    const byId = new Map(config.stars.map((s) => [s.id, s]));
    const tourStars = storyOrder(config.stars.filter((star) => !star.reply));
    const edges = edgesOf(config);
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
    let sawIncomplete = !allOpenedRef.current;
    let ceremonyPhase: "idle" | "gather" | "hold" | "release" | "done" = "idle";
    let ceremonyElapsed = 0;
    let ceremonyAmount = 0;
    let ember = 0;
    let wash = 0;
    const shapeAt = new Map<number, { x: number; y: number }>();
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
          if (tour.index >= tourStars.length) {
            tour.state = "idle";
            setTouring(false);
            closeStar();
          } else {
            const star = tourStars[tour.index];
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

      // The field camera. Tour and an open star glide in both axes. A drag
      // cancels the glide. The builder passes viewCamera.
      const touringFocus =
        tour.state !== "idle" &&
        tour.index >= 0 &&
        tour.index < tourStars.length
          ? tourStars[tour.index]
          : null;
      const openFocus =
        touringFocus ??
        (activeRef.current != null
          ? (byId.get(activeRef.current) ?? null)
          : null);
      if (!allOpenedRef.current) sawIncomplete = true;
      if (
        ceremonyPhase === "idle" &&
        sawIncomplete &&
        allOpenedRef.current &&
        activeRef.current == null &&
        tour.state === "idle"
      ) {
        const authored = config.stars.filter((star) => !star.reply);
        const home = centroidOf(authored);
        const slots = reduceMotion
          ? []
          : glyphSlots(config.finale, authored.length);
        if (
          !reduceMotion &&
          slots.length === authored.length &&
          authored.length > 0
        ) {
          shapeAt.clear();
          authored.forEach((star, index) => {
            const point = slots[index] ?? { x: 0, y: 0 };
            shapeAt.set(star.id, {
              x: home.x + point.x * SHAPE_SPAN,
              y: home.y + point.y * SHAPE_SPAN,
            });
          });
          ceremonyPhase = "gather";
          ceremonyElapsed = 0;
          ceremonyAmount = 0;
          if (viewCameraRef.current == null) cameraTargetRef.current = home;
          setShaping(true);
        } else {
          ceremonyPhase = "done";
          ember = 0.42;
        }
      }
      if (ceremonyPhase === "gather") {
        ceremonyElapsed += dt;
        ceremonyAmount = easeOutCubic(clamp01(ceremonyElapsed / 2.2));
        ember = ceremonyAmount * 0.7;
        if (ceremonyElapsed >= 2.2) {
          ceremonyPhase = "hold";
          ceremonyElapsed = 0;
          ceremonyAmount = 1;
        }
      } else if (ceremonyPhase === "hold") {
        ceremonyElapsed += dt;
        ceremonyAmount = 1;
        ember = 0.7;
        if (ceremonyElapsed >= 1.8) {
          ceremonyPhase = "release";
          ceremonyElapsed = 0;
        }
      } else if (ceremonyPhase === "release") {
        ceremonyElapsed += dt;
        const settled = easeOutCubic(clamp01(ceremonyElapsed / 2.2));
        ceremonyAmount = 1 - settled;
        ember = 0.7 + (0.42 - 0.7) * settled;
        if (ceremonyElapsed >= 2.2) {
          ceremonyPhase = "done";
          ceremonyAmount = 0;
          ember = 0.42;
          setShaping(false);
        }
      }
      if (viewCameraRef.current != null) {
        cameraRef.current = viewCameraRef.current;
      } else {
        const dest = openFocus
          ? { x: openFocus.x, y: openFocus.y }
          : cameraTargetRef.current;
        let cur = cameraRef.current;
        if (dest) {
          cur = reduceMotion
            ? dest
            : {
                x: cur.x + (dest.x - cur.x) * approach(dt, 1.6),
                y: cur.y + (dest.y - cur.y) * approach(dt, 1.6),
              };
          if (!openFocus && Math.hypot(dest.x - cur.x, dest.y - cur.y) < 0.2) {
            cameraTargetRef.current = null;
          }
        }
        cur = clampCamera(cur, config.stars);
        cameraRef.current = cur;
        const published = publishedCameraRef.current;
        if (Math.hypot(cur.x - published.x, cur.y - published.y) > 0.4) {
          publishedCameraRef.current = cur;
          setCamera(cur);
        }
      }
      const camNow = cameraRef.current;
      camera = identityCamera(width, height);

      // parallax + finale easing
      const pk = approach(dt, 4);
      parallax.x += (parallaxTarget.x - parallax.x) * pk;
      parallax.y += (parallaxTarget.y - parallax.y) * pk;
      finale +=
        ((allOpenedRef.current ? 1 : 0) - finale) * Math.min(dt * 2.5, 1);

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
        { x: 50, y: 30 },
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
      const tile = ((camNow.x % 100) + 100) % 100;
      const shift = (tile / 100) * width;
      ctx.save();
      ctx.translate(
        -shift + parallax.x * PARALLAX_BG,
        parallax.y * PARALLAX_BG,
      );
      paintBackgroundStars(ctx, bgStars, width, height, t, reduceMotion);
      ctx.translate(width, 0);
      paintBackgroundStars(ctx, bgStars, width, height, t, reduceMotion);
      ctx.restore();

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

      const paintAt = (star: { id: number; x: number; y: number }) => {
        const home = starScreen(star, width, height, camNow);
        const dest = shapeAt.get(star.id);
        if (!dest || ceremonyAmount <= 0.001) return home;
        const there = starScreen(dest, width, height, camNow);
        return {
          x: home.x + (there.x - home.x) * ceremonyAmount,
          y: home.y + (there.y - home.y) * ceremonyAmount,
        };
      };

      // Kinship is a wash, and only while a memory is open.
      const openId = activeRef.current;
      wash += ((openId == null ? 0 : 1) - wash) * approach(dt, 3.2);
      if (wash > 0.02 && openId != null) {
        const breath = reduceMotion ? 1 : 0.72 + Math.sin(t * 1.5) * 0.28;
        const fromStar = byId.get(openId);
        if (fromStar) {
          const fromAt = paintAt(fromStar);
          for (const [fromId, toId] of edges) {
            const otherId =
              fromId === openId ? toId : toId === openId ? fromId : null;
            if (otherId == null) continue;
            const other = byId.get(otherId);
            if (!other) continue;
            paintKinship(
              ctx,
              fromAt,
              paintAt(other),
              wash * breath,
              config.lineColor,
            );
          }
        }
      }

      // named stars — only those near the camera. During the finale they
      // drift onto the shape, then home. The offset is paint-only.
      const opened = openedRef.current;
      const nowMs = performance.now();
      config.stars.forEach((star, i) => {
        const at = paintAt(star);
        if (at.x < -80 || at.x > width + 80 || at.y < -80 || at.y > height + 80)
          return;
        const stagger = Math.min(i, 12) / 12;
        const appear = reduceMotion
          ? entranceStart == null
            ? 0
            : 1
          : clamp01((entrance - stagger * 0.5) / 0.5);
        const hovered = hoveredRef.current === star.id;
        const active = activeRef.current === star.id;
        const near = fieldPresence(star, camNow);
        const presence = Math.max(
          near,
          hovered || active ? 1 : 0,
          !star.reply && ceremonyAmount > 0 ? ceremonyAmount : 0,
        );
        const flaredAt = flareRef.current.get(star.id);
        const flare =
          flaredAt == null ? 0 : clamp01(1 - (nowMs - flaredAt) / 700);
        const photo =
          near >= PRESENCE_GLINT ? photosRef.current.get(star.id) : null;
        paintStar(ctx, star, width, height, {
          appear: appear * presence * (star.reply ? 0.72 : 1),
          opened: opened.has(star.id),
          hovered,
          active,
          t,
          at,
          flare,
          glint: photo,
          reply: star.reply,
          ember: star.reply ? 0 : ember,
        });
      });

      ctx.restore(); // ← back to screen space (camera undone)

      // ── foreground scene, drawn in screen space over the sky ──
      if (config.scene.enabled) {
        const s = config.scene;
        // Lying on your back: the earth is only the bottom edge of your vision,
        // even if an older sky stored a higher horizon.
        const groundY = height * (Math.max(s.groundLevel, 90) / 100);
        const fgScale = (height / 780) * 0.92;

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
          height * 0.035,
          "#08090e",
        );
        paintMountains(
          ctx,
          width,
          height,
          groundY,
          ridgeFront,
          groundY,
          height * 0.02,
          s.silhouette,
        );
        const ground = s.ground ?? "meadow";
        if (ground === "rooftop") {
          paintRooftop(ctx, width, height, groundY, s.silhouette);
        } else if (ground === "shore") {
          paintShore(ctx, width, height, groundY, s.silhouette, t);
        } else {
          paintGround(ctx, width, height, groundY, s.silhouette);
          paintTree(
            ctx,
            width * 0.08,
            groundY,
            fgScale * 0.42,
            reduceMotion ? 0 : Math.sin(windPhase * 0.6) * gust,
            s.silhouette,
          );
          paintCouple(ctx, width * 0.5, groundY, fgScale, s.silhouette, height);
          paintGrass(
            ctx,
            width,
            height,
            groundY,
            Math.min((s.grassBand / 100) * height, height * 0.1),
            grass,
            t,
            windPhase,
            gust,
            reduceMotion,
            s.silhouette,
            s.flowerColor,
          );
        }
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
      setShaping(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, reduceMotion, total]);

  useEffect(() => {
    let cancelled = false;
    const assets = options.assets ?? {};
    const loaded = new Map<number, CanvasImageSource>();
    for (const star of config.stars) {
      const url = star.image?.fileId
        ? assets[star.image.fileId]
        : (star.imageUrl ?? null);
      if (!url) continue;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (cancelled) return;
        loaded.set(star.id, img);
        photosRef.current = new Map(loaded);
      };
      img.src = url;
    }
    photosRef.current = loaded;
    return () => {
      cancelled = true;
    };
  }, [config.stars, options.assets]);

  return {
    canvasRef,
    reduceMotion,
    openedIds: litIds,
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
    camera: options.viewCamera ?? camera,
    panBy,
    shaping,
  };
}
