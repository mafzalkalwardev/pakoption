"use client";

import * as React from "react";

/**
 * Reads `prefers-reduced-motion` once and exposes it to the whole tree.
 *
 * CSS already neutralises transitions globally (see globals.css), but that is
 * not enough: GSAP timelines and Framer variants run in JS and would still
 * animate. Every animated component reads this flag and renders its final
 * state directly when motion is reduced.
 */

const ReducedMotionContext = React.createContext(false);

export function useReducedMotion() {
  return React.useContext(ReducedMotionContext);
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <ReducedMotionContext.Provider value={reduced}>
      {children}
    </ReducedMotionContext.Provider>
  );
}
