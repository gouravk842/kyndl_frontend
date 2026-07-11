"use client";

import { creationService } from "@/services/creations/creation.service";

import { SAMPLE_PROPOSAL } from "../config";
import type { MomentDoc } from "../types";
import { MomentPlayer } from "./moment-player";

/**
 * Audience-facing mount for a Moment. Wires the engine's `submit` to the public
 * respond endpoint so a recipient's answer (and optional note) reaches the
 * creator. Used by the public-viewer registry; `token` is the share token.
 */
export function MomentViewer({
  content,
  assets,
  token,
}: {
  content: unknown;
  assets: Record<string, string>;
  token?: string;
}) {
  const doc = (content as MomentDoc) ?? SAMPLE_PROPOSAL;

  const submit = token
    ? async (payload: { answer: "yes" | "no"; note: string; responderName: string }) => {
        await creationService.respond(token, {
          answer: payload.answer,
          note: payload.note,
          responder_name: payload.responderName,
        });
      }
    : undefined;

  return <MomentPlayer doc={doc} assets={assets} submit={submit} />;
}
