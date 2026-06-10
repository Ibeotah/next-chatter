// hooks/useOnClickOutside.ts
"use client";

import { useEffect, type RefObject } from "react";

/**
 * Calls `handler` when a click or touch event occurs outside of `ref`.
 * Compatible with React 19 where useRef<T>(null) returns RefObject<T | null>.
 */
export function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,  // ← accepts T | null (React 19 compatible)
  handler: () => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) return;
      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener, { passive: true });

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}