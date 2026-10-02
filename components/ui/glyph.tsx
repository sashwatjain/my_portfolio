import { Icon } from "@iconify/react";

import { cn } from "@/lib/utils";

type GlyphProps = {
  /** An Iconify id (`"lucide:rocket"`) or a literal character (a Notion emoji). */
  icon?: string;
  className?: string;
};

/**
 * Renders a `ContentItem.icon`, which is not always an Iconify id — Notion
 * page icons are emoji. Anything containing a colon is treated as an Iconify id,
 * anything else is rendered as the glyph it is.
 */
export const Glyph = ({ icon, className }: GlyphProps) => {
  if (!icon) return null;

  if (!icon.includes(":")) {
    return (
      <span aria-hidden className={cn("leading-none", className)}>
        {icon}
      </span>
    );
  }

  return <Icon aria-hidden className={cn("shrink-0", className)} icon={icon} />;
};
