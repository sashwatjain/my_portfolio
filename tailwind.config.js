import { heroui } from "@heroui/react";

/**
 * Two themes, one per page.
 *
 * career extends "dark"   (near-black + red)   -> "/"
 * studio extends "light"  (warm cream + amber) -> "/studio"
 *
 * HeroUI emits `.career` / `[data-theme="career"]` selectors. Those variables
 * cascade, which is why `data-theme` can sit on the SiteShell wrapper rather
 * than on <html> — see components/layout/site-shell.tsx.
 *
 * The `--ink-*` and `--accent-2` custom properties are defined in
 * app/globals.css under the same selectors, and exposed as Tailwind colours
 * (`text-ink-body`, `bg-accent-2`, ...). They exist because HeroUI's
 * `foreground-500` / `foreground-600` are fixed opacity multipliers, which gave
 * body copy too little contrast on the near-black canvas. Use these tokens for
 * text; use HeroUI's for surfaces, borders and status.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./data/**/*.{js,ts,jsx,tsx}",
		"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			animation: {
				"gradient-pan": "gradient 9s linear infinite",
				orbit: "orbit calc(var(--duration)*1s) linear infinite",
				"fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
				drift: "drift 18s ease-in-out infinite alternate",
				"float-slow": "float-slow 7s ease-in-out infinite",
				"spin-slow": "spin 26s linear infinite",
			},
			keyframes: {
				orbit: {
					"0%": {
						transform: "rotate(calc(var(--angle)*1deg)) translateY(calc(var(--radius)*px)) rotate(calc(var(--angle)*-1deg))",
					},
					"100%": {
						transform: "rotate(calc(var(--angle)*1deg + 360deg)) translateY(calc(var(--radius)*px)) rotate(calc(var(--angle)*-1deg - 360deg))",
					},
				},
				gradient: {
					"0%": { backgroundPosition: "0% 50%" },
					"50%": { backgroundPosition: "100% 50%" },
					"100%": { backgroundPosition: "0% 50%" },
				},
				"fade-up": {
					from: { opacity: "0", transform: "translateY(16px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				drift: {
					from: { transform: "translate3d(0, 0, 0) scale(1)" },
					to: { transform: "translate3d(3%, -4%, 0) scale(1.12)" },
				},
				"float-slow": {
					"0%, 100%": { transform: "translateY(0) rotate(var(--tilt, 0deg))" },
					"50%": { transform: "translateY(-10px) rotate(var(--tilt, 0deg))" },
				},
			},
			colors: {
				ink: {
					strong: "rgb(var(--ink-strong) / <alpha-value>)",
					body: "rgb(var(--ink-body) / <alpha-value>)",
					muted: "rgb(var(--ink-muted) / <alpha-value>)",
				},
				"accent-2": "rgb(var(--accent-2) / <alpha-value>)",
			},
			// Anchored sections must clear the sticky top bar.
			scrollMargin: { top: "6rem" },
		},
	},
	plugins: [
		heroui({
			themes: {
				career: {
					extend: "dark",
					layout: {
						borderWidth: { small: "1px", medium: "1px", large: "1px" },
						radius: { small: "0.375rem", medium: "0.5rem", large: "0.75rem" },
					},
					colors: {
						background: "#070708",
						foreground: "#F5F5F5",
						focus: "#FF2438",
						content1: "#0E0E11",
						content2: "#161619",
						content3: "#1F1F24",
						content4: "#2A2A31",
						divider: "#282830",
						primary: {
							50: "#FFF1F2",
							100: "#FFE4E6",
							200: "#FECDD3",
							300: "#FDA4AF",
							400: "#FF5C6B",
							500: "#FF2438",
							600: "#E01B2D",
							700: "#B81221",
							800: "#8E0D19",
							900: "#6E0913",
							DEFAULT: "#FF2438",
							foreground: "#FFFFFF",
						},
					},
				},
				studio: {
					extend: "light",
					layout: {
						borderWidth: { small: "1px", medium: "1px", large: "1px" },
						radius: { small: "0.75rem", medium: "1rem", large: "1.5rem" },
					},
					colors: {
						background: "#FFF9EE",
						foreground: "#191512",
						focus: "#FF9F1C",
						content1: "#FFFFFF",
						content2: "#FFF4E2",
						content3: "#FCE9CB",
						content4: "#F6D6A6",
						divider: "#EEDFC6",
						primary: {
							50: "#FFF8EC",
							100: "#FFEED0",
							200: "#FFDD9E",
							300: "#FFC55C",
							400: "#FFB23A",
							500: "#FF9F1C",
							600: "#E0870A",
							700: "#B56B08",
							800: "#8A520B",
							900: "#6B3F0C",
							DEFAULT: "#FF9F1C",
							foreground: "#191512",
						},
					},
				},
			},
		}),
	],
};