"use client";

import dynamic from "next/dynamic";

// react-pageflip touches the DOM on mount, so the book is client-only.
// `ssr: false` must live inside a Client Component (Next 16 rule).
const BookViewer = dynamic(
  () => import("./viewer/book-viewer").then((m) => m.BookViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[620px] items-center justify-center">
        <p className="animate-pulse font-cursive text-2xl text-[#C75B39]">
          opening the book…
        </p>
      </div>
    ),
  },
);

export function ScrapbookExperience() {
  return <BookViewer />;
}
