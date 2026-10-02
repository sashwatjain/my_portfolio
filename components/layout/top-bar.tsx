"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";

import {
  PAGES,
  PAGE_KEYS,
  resolveTheme,
  sectionsForPage,
  SITE,
  type PageKey,
} from "@/data/site";
import { usePageTransition } from "@/components/layout/page-transition";
import { cn } from "@/lib/utils";

/**
 * Shared shell header. Contains a profile slot and the Career/Studio switch —
 * the latter is a *navigation* control, not a theme toggle: choosing a side
 * routes you to that page, and the theme follows the route.
 *
 * Kept deliberately restrained: it shrinks and blurs on scroll and does nothing
 * else. Motion budget belongs to the sections.
 */
export const TopBar = () => {
  const pathname = usePathname();

  const page = resolveTheme(pathname);
  const sections = sectionsForPage(page);

  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Any navigation closes the mobile sheet.
  React.useEffect(() => setOpen(false), [pathname]);

  const profileImage = page === "studio" ? SITE.profile.studioImage : SITE.profile.careerImage;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        scrolled
          ? "border-b border-divider bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-background/40 backdrop-blur-sm",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 transition-[height] duration-300",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <Link
          className="flex shrink-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          href={PAGES[page].href}
        >
          <span
            className={cn(
              "portrait-glow relative shrink-0 overflow-hidden rounded-full border border-divider bg-content2 transition-[width,height] duration-300",
              scrolled ? "size-10" : "size-12",
            )}
          >
            <Image
              fill
              priority
              alt=""
              className="object-cover"
              sizes="48px"
              src={profileImage}
            />
          </span>

          <span className="hidden text-sm font-semibold tracking-tight text-ink-strong sm:block">
            {SITE.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {sections
            .filter((section) => section.id !== "hero")
            .map((section) => (
              <a
                key={section.id}
                className="rounded-small px-3 py-2 text-sm text-ink-body transition-colors hover:text-ink-strong"
                href={`#${section.id}`}
              >
                {section.label}
              </a>
            ))}
        </nav>

        <div className="flex items-center gap-3">
          <PageSwitch active={page} />

          <button
            aria-expanded={open}
            aria-label="Toggle navigation"
            className="flex size-9 items-center justify-center rounded-small border border-divider text-ink-body md:hidden"
            type="button"
            onClick={() => setOpen((value) => !value)}
          >
            <Icon aria-hidden className="size-4" icon={open ? "lucide:x" : "lucide:menu"} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            animate={{ height: "auto", opacity: 1 }}
            className="overflow-hidden border-t border-divider bg-background md:hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <ul className="mx-auto flex w-full max-w-6xl flex-col px-6 py-3">
              {sections
                .filter((section) => section.id !== "hero")
                .map((section) => (
                  <li key={section.id}>
                    <a
                      className="flex items-center gap-3 py-3 text-sm text-ink-body"
                      href={`#${section.id}`}
                    >
                      <Icon aria-hidden className="size-4" icon={section.icon} />
                      {section.label}
                    </a>
                  </li>
                ))}
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
};

/**
 * Career / Studio switch. Built from PAGES so adding a third page is a data
 * edit, not a component edit.
 *
 * Cross-page clicks are intercepted so the wipe in PageTransitionProvider can
 * play first; same-page clicks fall through to Next's own Link handling.
 */
const PageSwitch = ({ active }: { active: PageKey }) => {
  const [hovered, setHovered] = React.useState<PageKey | null>(null);
  const { navigate } = usePageTransition();

  // The pill slides under whichever item is active or hovered.
  const indicator = hovered ?? active;
  const index = PAGE_KEYS.indexOf(indicator);

  return (
    <div
      className="relative flex items-center rounded-full border border-divider bg-content1 p-1"
      onMouseLeave={() => setHovered(null)}
    >
      <motion.span
        aria-hidden
        animate={{ left: `calc(${index} * 50% + 4px)`, width: "calc(50% - 8px)" }}
        className="absolute top-1 bottom-1 rounded-full bg-primary/12"
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
      />

      {PAGE_KEYS.map((key) => {
        const item = PAGES[key];
        const isActive = key === active;

        return (
          <Link
            key={key}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              isActive ? "text-primary" : "text-ink-body hover:text-ink-strong",
            )}
            href={item.href}
            onClick={(event) => {
              if (isActive) return;

              event.preventDefault();
              navigate(key);
            }}
            onMouseEnter={() => setHovered(key)}
          >
            <Icon aria-hidden className="size-3.5" icon={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
};