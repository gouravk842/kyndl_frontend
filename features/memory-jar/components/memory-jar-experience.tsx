"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  JAR_CONFIG,
  type JarConfig,
  type JarNote,
  type MediaRef,
} from "@/features/memory-jar/config";

import { BackgroundMusic } from "./background-music";
import { FoldedNote } from "./folded-note";
import { GlassJar } from "./glass-jar";
import { OpenNoteCard } from "./open-note-card";

/**
 * Scatter the slips across the lower two-thirds of the jar so they overlap like
 * a real pile. Deterministic (seeded by each note's rotation/id) so the layout
 * is stable between renders and SSR. Lower slips get a higher stack order, the
 * way the front of a pile sits over the back.
 */
function layoutNotes(notes: JarNote[]) {
  return notes.map((note, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const jitterX = note.rotation * 0.25 + (note.id % 2 ? 1.5 : -1.5);
    const jitterY = note.id % 3 ? -1.5 : 1.5;
    const left = 20 + col * 16 + jitterX;
    const top = 54 + row * 10 + jitterY;
    return { note, position: { left: `${left}%`, top: `${top}%`, z: Math.round(top) } };
  });
}

/**
 * The interactive jar. Reads its content from {@link MemoryJarExperienceProps.config},
 * which defaults to the bundled sample so the marketing page renders without
 * wiring. The builder passes its live draft here for an in-place preview.
 */
type MemoryJarExperienceProps = {
  config?: JarConfig;
  /** Resolved media URLs keyed by fileId (note photos + jar music). */
  assets?: Record<string, string>;
  /** Whether to mount the looping background music (off for hidden instances). */
  playMusic?: boolean;
};

export function MemoryJarExperience({
  config = JAR_CONFIG,
  assets = {},
  playMusic = true,
}: MemoryJarExperienceProps) {
  const reduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState<number | null>(null);
  const [opened, setOpened] = useState<Set<number>>(() => new Set());

  const urlFor = useCallback(
    (ref: MediaRef | null | undefined) => (ref ? assets[ref.fileId] ?? null : null),
    [assets],
  );

  const placed = useMemo(() => layoutNotes(config.notes), [config.notes]);
  const total = config.notes.length;
  const allOpened = total > 0 && opened.size === total;
  const openNote = config.notes.find((n) => n.id === openId) ?? null;
  const openIndex = openNote
    ? config.notes.findIndex((n) => n.id === openNote.id)
    : -1;
  const openedNotes = config.notes.filter((n) => opened.has(n.id));
  const musicUrl = urlFor(config.music);

  // The lid lifts off the rim then settles — a one-shot "unseal" played each
  // time a fresh slip is taken out of the jar (not when reopening from the list).
  const lidControls = useAnimationControls();
  const pulseLid = useCallback(() => {
    if (reduceMotion) return;
    void (async () => {
      await lidControls.start({
        y: "-70%",
        rotate: -11,
        transition: { duration: 0.3, ease: "easeOut" },
      });
      await lidControls.start({
        y: "0%",
        rotate: 0,
        transition: { delay: 0.1, duration: 0.32, ease: "easeIn" },
      });
    })();
  }, [reduceMotion, lidControls]);

  const handleOpen = useCallback(
    (id: number) => {
      const isFresh = !opened.has(id);
      setOpenId(id);
      if (isFresh) {
        setOpened((prev) => new Set(prev).add(id));
        pulseLid();
      }
    },
    [opened, pulseLid],
  );

  // Autoplay — sit back and let the jar open each scroll for you. It steps
  // through the notes in order, unsealing the lid and unrolling one scroll at a
  // time, then stops on the last. Pausing or closing a scroll ends the tour.
  const [autoplaying, setAutoplaying] = useState(false);
  useEffect(() => {
    // The button that flips this on is gated on `total > 0`, so `notes` is
    // never empty here.
    if (!autoplaying) return;
    const notes = config.notes;
    let idx = 0;
    let timer: ReturnType<typeof setTimeout>;
    const showNext = () => {
      const note = notes[idx];
      if (!note) {
        setAutoplaying(false);
        return;
      }
      setOpenId(note.id);
      setOpened((prev) =>
        prev.has(note.id) ? prev : new Set(prev).add(note.id),
      );
      pulseLid();
      idx += 1;
      timer = setTimeout(showNext, 3400);
    };
    timer = setTimeout(showNext, 500);
    return () => clearTimeout(timer);
  }, [autoplaying, config.notes, pulseLid]);

  const closeNote = useCallback(() => {
    setOpenId(null);
    setAutoplaying(false);
  }, []);

  // Step to the scroll at `index` (used by the open card's ← / → arrows). Any
  // manual navigation cancels an in-progress auto-play tour.
  const showAt = useCallback(
    (index: number) => {
      const note = config.notes[index];
      if (!note) return;
      setAutoplaying(false);
      setOpenId(note.id);
      setOpened((prev) =>
        prev.has(note.id) ? prev : new Set(prev).add(note.id),
      );
      pulseLid();
    },
    [config.notes, pulseLid],
  );

  return (
    <div className="flex w-full flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-12">
      {/* LEFT — the jar and its messages */}
      <div className="relative flex w-full max-w-md flex-col items-center">
        {/* ambient candle glow behind the jar */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[20%] -z-10 h-[440px] w-[440px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,196,140,0.55) 0%, rgba(255,170,110,0.22) 45%, transparent 70%)",
          }}
          animate={
            reduceMotion
              ? undefined
              : allOpened
                ? { scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }
                : { opacity: 0.8 }
          }
          transition={
            allOpened
              ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.6 }
          }
        />

        <p className="font-hand mb-2 text-center text-xl text-[#c1502f] sm:text-2xl">
          For {config.recipientName}
        </p>

        {/* the jar — `isolate` keeps the slips' z-indices from leaking out.
            Width is capped by viewport height (aspect 3/4) so the whole jar
            fits in a single screen without scrolling. */}
        <motion.div
          className="isolate"
          style={{ width: "min(78vw, 380px, calc((100svh - 21rem) * 0.75))" }}
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <GlassJar
            jarLabel={
              allOpened ? "all out — every word is yours" : config.jarLabel
            }
            lidControls={lidControls}
            notesSlot={
              <AnimatePresence>
                {placed
                  .filter(({ note }) => !opened.has(note.id))
                  .map(({ note, position }, i) => (
                    <FoldedNote
                      key={note.id}
                      note={note}
                      index={i}
                      position={position}
                      onOpen={() => handleOpen(note.id)}
                    />
                  ))}
              </AnimatePresence>
            }
          />
        </motion.div>

        {/* opening / closing message */}
        <motion.div
          className="mt-4 text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 1, duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {allOpened ? (
              <motion.p
                key="closing"
                className="font-hand text-xl text-[#3a2a25] sm:text-2xl"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {config.closingMessage}
              </motion.p>
            ) : (
              <motion.p
                key="opening"
                className="text-base leading-relaxed text-[#92786c]"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {config.openingMessage}
              </motion.p>
            )}
          </AnimatePresence>

          <p className="mt-3 text-xs font-medium tracking-[0.18em] text-[#c1502f]/70 uppercase">
            {opened.size} of {total} opened
          </p>

          {total > 0 && (
            <button
              type="button"
              onClick={() => setAutoplaying((v) => !v)}
              aria-label={
                autoplaying ? "Pause auto-play" : "Auto-play every scroll"
              }
              aria-pressed={autoplaying}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#e6d2ba] bg-white/80 px-4 py-2 text-sm font-medium text-[#5b4233] shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:text-[#3a2a25]"
            >
              {autoplaying ? (
                <>
                  <Pause className="size-4 text-[#c1502f]" />
                  Playing…
                </>
              ) : (
                <>
                  <Play className="size-4 text-[#c1502f]" />
                  {allOpened ? "Play again" : "Open them for me"}
                </>
              )}
            </button>
          )}
        </motion.div>
      </div>

      {/* RIGHT — the letters she's taken out; tap any to read it again */}
      <AnimatePresence>
        {openedNotes.length > 0 ? (
          <motion.aside
            className="w-full max-w-md lg:mt-20 lg:w-64 lg:shrink-0 lg:self-start"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            aria-label="Letters you've opened"
          >
            <p className="mb-3 text-center text-xs font-medium tracking-[0.2em] text-[#92786c] uppercase lg:text-left">
              Letters you{"’"}ve opened
            </p>
            <ul className="flex flex-wrap justify-center gap-2.5 lg:flex-col lg:flex-nowrap lg:items-stretch">
              <AnimatePresence>
                {openedNotes.map((note) => (
                  <motion.li
                    key={note.id}
                    layout={!reduceMotion}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(note.id)}
                      aria-label={`Read note ${note.id} again: ${note.title}`}
                      className="font-hand group flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-base lowercase text-[#5a4636] shadow-[1px_2px_5px_rgba(60,40,25,0.18)] outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#FF7A59]"
                      style={{
                        background: `linear-gradient(160deg, ${note.paperTone} 0%, #f3e8d6 100%)`,
                      }}
                    >
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5 shrink-0"
                      >
                        <path
                          d="M12 21s-7-4.6-9.3-9.1C1.2 8.7 2.7 5.5 6 5.5c2 0 3.2 1.2 4 2.4.8-1.2 2-2.4 4-2.4 3.3 0 4.8 3.2 3.3 6.4C19 16.4 12 21 12 21Z"
                          fill="rgba(193,24,48,0.35)"
                          stroke="rgba(193,24,48,0.5)"
                          strokeWidth="1.4"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="truncate">{note.title}</span>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {/* the unfolded note, centred above everything */}
      <AnimatePresence>
        {openNote ? (
          <OpenNoteCard
            key={openNote.id}
            note={openNote}
            imageUrl={urlFor(openNote.image)}
            onClose={closeNote}
            position={openIndex + 1}
            total={total}
            onPrev={openIndex > 0 ? () => showAt(openIndex - 1) : undefined}
            onNext={
              openIndex < total - 1 ? () => showAt(openIndex + 1) : undefined
            }
          />
        ) : null}
      </AnimatePresence>

      {/* looping background music, if the jar has a track */}
      {playMusic && musicUrl ? <BackgroundMusic src={musicUrl} /> : null}
    </div>
  );
}
