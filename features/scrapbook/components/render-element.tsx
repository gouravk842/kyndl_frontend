import type { PageElementContent } from "../types";
import { AudioKeepsake } from "./elements/audio-keepsake";
import { Decoration } from "./elements/decoration";
import { HandwrittenNote } from "./elements/handwritten-note";
import { MemoryCard } from "./elements/memory-card";
import { PolaroidPhoto } from "./elements/polaroid-photo";
import { ScratchCard } from "./elements/scratch-card";
import { SecretNote } from "./elements/secret-note";
import { VideoKeepsake } from "./elements/video-keepsake";

/** Maps a page element to its component. Shared by the book and the builder. */
export function renderElement(el: PageElementContent) {
  switch (el.kind) {
    case "photo":
      return (
        <PolaroidPhoto
          src={el.src}
          alt={el.alt}
          caption={el.caption}
          style={el.style}
        />
      );
    case "note":
      return (
        <HandwrittenNote
          text={el.text}
          font={el.font}
          ink={el.ink}
          draw={el.draw}
        />
      );
    case "memoryCard":
      return (
        <MemoryCard
          body={el.body}
          date={el.date}
          place={el.place}
          variant={el.variant}
        />
      );
    case "decoration":
      return <Decoration type={el.type} label={el.label} color={el.color} />;
    case "audio":
      return <AudioKeepsake title={el.title} src={el.src} player={el.player} />;
    case "video":
      return (
        <VideoKeepsake
          title={el.title}
          src={el.src}
          poster={el.poster}
          frame={el.frame}
        />
      );
    case "secret":
      return <SecretNote message={el.message} teaser={el.teaser} />;
    case "scratch":
      return <ScratchCard prompt={el.prompt} reveal={el.reveal} />;
    default:
      return null;
  }
}
