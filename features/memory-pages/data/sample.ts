import type { MemoryPagesDoc } from "../types";

/**
 * The marketing-preview + builder-starter album. Mirrors the "movie filming
 * locations" reference: a desk full of polaroids, each with a place caption, a
 * bold title, and a short description. No `photo` refs (the sample renders the
 * empty photo slots) so it needs no uploaded files to show off the layout.
 */
export const sampleAlbum: MemoryPagesDoc = {
  title: "Where the Movies Were Made",
  subtitle: "the real places behind the scenes",
  coverColor: "#3a2a25",
  pages: [
    {
      id: "p1",
      layout: "duo",
      theme: "paper",
      entries: [
        {
          id: "e1",
          title: "Inception (2010)",
          caption: "University College London, England",
          body: "Christopher Nolan turned ordinary spaces into dream worlds. One of the film's reality-bending moments was filmed here.",
        },
        {
          id: "e2",
          title: "Jaws (1975)",
          caption: "Martha's Vineyard, Massachusetts, USA",
          body: "Long before anyone entered the water, this quiet beach town became the setting for cinema's most famous shark attack.",
        },
      ],
    },
    {
      id: "p2",
      layout: "single",
      theme: "paper",
      entries: [
        {
          id: "e3",
          title: "The Grand Budapest Hotel (2014)",
          caption: "Görlitz, Germany",
          body: "Wes Anderson's pastel hotel was built inside a long-abandoned department store, dressed frame by symmetrical frame.",
        },
      ],
    },
  ],
};
