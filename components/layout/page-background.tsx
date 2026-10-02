import { PAGES, type PageKey } from "@/data/site";

/**
 * Route-aware ambient background. Both variants are decorative, sit behind
 * everything at z-0, and never intercept pointer events.
 *
 * A server component: the theme is known at render time, so this ships no
 * JavaScript at all. All colours are literal because these are fixed decorative
 * gradients per theme, not theme-resolved UI.
 */
export const PageBackground = ({ theme }: { theme: PageKey }) => {
  if (PAGES[theme].theme === "studio") {
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Film grain over the cream canvas — this is what makes studio feel
            tactile rather than corporate. */}
        <div className="grain absolute inset-0" />

        <div
          className="absolute -left-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-primary/25 blur-[120px] animate-drift"
          style={{ zIndex: 2 }}
        />
        <div
          className="absolute -bottom-48 right-[-10rem] h-[40rem] w-[40rem] rounded-full bg-accent-2/15 blur-[130px] animate-drift"
          style={{ animationDelay: "-7s", zIndex: 2 }}
        />
        <div
          className="absolute left-1/3 top-1/2 h-[26rem] w-[26rem] rounded-full bg-primary/12 blur-[110px] animate-drift"
          style={{ animationDelay: "-13s", zIndex: 2 }}
        />
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Faint vignette so the edges fall away on the near-black canvas. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,36,56,0.14),transparent_58%)]" />
      <div className="absolute -left-40 top-24 h-[32rem] w-[32rem] rounded-full bg-primary/[0.09] blur-[140px]" />
      <div className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-accent-2/[0.06] blur-[140px]" />

      {/* Sparse static starfield, deterministic so it never re-randomises. */}
      <div className="absolute inset-0">
        {STARS.map((star) => (
          <span
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              height: star.size,
              left: `${star.x}%`,
              opacity: star.opacity,
              top: `${star.y}%`,
              width: star.size,
            }}
          />
        ))}
      </div>

      {/* Hairline grid, barely there. */}
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.035) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse at 50% 20%, black, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 20%, black, transparent 78%)",
        }}
      />
    </div>
  );
};

/**
 * Fixed coordinates (not random) so server and client render identically —
 * random values would cause a hydration mismatch.
 */
const STARS = Array.from({ length: 90 }, (_, index) => {
  // Cheap deterministic pseudo-random from the index.
  const seed = (index * 9301 + 49297) % 233280;

  return {
    id: index,
    x: (seed % 1000) / 10,
    y: ((seed * 7) % 1000) / 10,
    size: index % 17 === 0 ? 2 : 1,
    opacity: index % 5 === 0 ? 0.28 : 0.14,
  };
});