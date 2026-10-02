"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { PAGES, resolveTheme, type PageKey } from "@/data/site";

type Phase = "idle" | "in" | "out";

type TransitionContext = {
  /** Routes to `key`, playing the wipe first. Falls back to router.push. */
  navigate: (key: PageKey) => void;
};

const Ctx = React.createContext<TransitionContext | null>(null);

export const usePageTransition = () => {
  const ctx = React.useContext(Ctx);

  if (!ctx) {
    throw new Error("usePageTransition must be used inside <PageTransitionProvider>");
  }

  return ctx;
};

/**
 * The Career <-> Studio morph.
 *
 * Career and Studio are separate route groups, so their layouts — and any state
 * inside them — are torn down on navigation. This provider therefore lives in the
 * ROOT layout, which does not remount, and owns the overlay itself. Sequence:
 *
 *   1. start navigation while the overlay begins to cover the current page
 *   2. reveal the destination as soon as its route is ready
 *   3. remove the overlay after a short fade-out
 *
 * Reduced motion skips the wipe and navigates immediately. If the router stalls,
 * a timeout reveals the page rather than leaving the overlay stuck.
 */
export const PageTransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();

  const [target, setTarget] = React.useState<PageKey | null>(null);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const navigationStartedAt = React.useRef(0);

  React.useEffect(() => {
    if (phase === "idle") return;

    if (phase === "in") {
      const destinationReached = target !== null && resolveTheme(pathname) === target;
      const delay = destinationReached
        ? Math.max(0, 120 - (Date.now() - navigationStartedAt.current))
        : 1_500;
      const reveal = setTimeout(() => setPhase("out"), delay);

      return () => clearTimeout(reveal);
    }

    const done = setTimeout(() => setPhase("idle"), 240);

    return () => clearTimeout(done);
  }, [phase, target, pathname]);

  const navigate = React.useCallback(
    (key: PageKey) => {
      if (phase !== "idle") return;

      if (reduced) {
        router.push(PAGES[key].href);

        return;
      }

      navigationStartedAt.current = Date.now();
      setTarget(key);
      setPhase("in");
      router.push(PAGES[key].href);
    },
    [phase, reduced, router],
  );

  const value = React.useMemo(() => ({ navigate }), [navigate]);

  const page = target ? PAGES[target] : null;

  return (
    <Ctx.Provider value={value}>
      {children}

      <AnimatePresence>
        {phase !== "idle" && page ? (
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[90] overflow-hidden"
          >
            <motion.div
              animate={{ opacity: phase === "in" ? 1 : 0 }}
              className="absolute inset-0"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              style={{ backgroundColor: page.wipe }}
              transition={{ duration: phase === "in" ? 0.16 : 0.24, ease: [0.65, 0, 0.35, 1] }}
            />

            {/* Accent sweep, so the wipe reads as a transition and not a flash. */}
            <motion.div
              animate={
                phase === "in"
                  ? { scaleX: 1, opacity: 1 }
                  : { scaleX: 1, opacity: 0 }
              }
              className="absolute inset-y-0 w-full origin-left"
              exit={{ opacity: 0 }}
              initial={{ scaleX: 0, opacity: 0 }}
              style={{
                background: `linear-gradient(90deg, transparent, ${page.accent}22, transparent)`,
              }}
              transition={{ duration: phase === "in" ? 0.2 : 0.18, ease: "easeOut" }}
            />
          </div>
        ) : null}
      </AnimatePresence>
    </Ctx.Provider>
  );
};