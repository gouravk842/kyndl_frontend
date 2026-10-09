"use client";

import { useEffect, useRef, useState } from "react";

export function useHostSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0, ready: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const next = {
        w: Math.max(rect.width, 1),
        h: Math.max(rect.height, 1),
        ready: rect.width > 8 && rect.height > 8,
      };
      setSize((prev) =>
        prev.w === next.w && prev.h === next.h && prev.ready === next.ready
          ? prev
          : next,
      );
    };
    const onResize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(el);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return { ref, size };
}
