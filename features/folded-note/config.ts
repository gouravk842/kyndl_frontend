/**
 * Folded Note — schoolyard pass-the-note. Reactions are local reveals.
 */

export type NoteReactions = {
  yes: string;
  no: string;
  maybe: string;
};

export type FoldedNoteConfig = {
  title: string;
  fromName: string;
  toName: string;
  question: string;
  body: string;
  reactions: NoteReactions;
};

export type NoteChoice = keyof NoteReactions;

export const FOLDED_NOTE_CONFIG: FoldedNoteConfig = {
  title: "Pass this note",
  fromName: "Me",
  toName: "You",
  question: "Do you like me?",
  body: "I've been meaning to ask… check a box and fold it back?",
  reactions: {
    yes: "Okay I am actually floating. Text me when you can.",
    no: "Still friends? Cool. I ate ice cream about it already.",
    maybe: "Maybe is a plot twist I can work with. Talk soon?",
  },
};

export function starterDoc(): FoldedNoteConfig {
  return {
    ...FOLDED_NOTE_CONFIG,
    reactions: { ...FOLDED_NOTE_CONFIG.reactions },
  };
}
