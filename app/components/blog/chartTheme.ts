// Shared theme tokens, palettes, and formatters for chart/table components.

export const COLORS = {
  bg: "rgba(255,255,255,0.03)",
  bgHover: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.08)",
  gridStroke: "rgba(255,255,255,0.06)",
  axisText: "#71717a",
  labelText: "#a1a1aa",
  white: "#e4e4e7",
  violet: "#a78bfa",
  violetDim: "rgba(167,139,250,0.6)",
  purple: "#7c3aed",
  indigo: "#818cf8",
  cyan: "#22d3ee",
  emerald: "#34d399",
  amber: "#fbbf24",
  rose: "#fb7185",
  fuchsia: "#e879f9",
  slate: "#94a3b8",
};

export const AI_COLORS: Record<string, string> = {
  Full: COLORS.violet,
  Partial: COLORS.cyan,
  Minimal: COLORS.amber,
  Unknown: COLORS.slate,
};

export const FONT = "var(--font-geist-sans), sans-serif";

export const CATEGORY_PALETTE = [
  "#a78bfa", // violet
  "#22d3ee", // cyan
  "#34d399", // emerald
  "#fbbf24", // amber
  "#fb7185", // rose
  "#818cf8", // indigo
  "#e879f9", // fuchsia
  "#f97316", // orange
  "#38bdf8", // sky
  "#a3e635", // lime
  "#2dd4bf", // teal
  "#c084fc", // purple
  "#f472b6", // pink
  "#facc15", // yellow
  "#60a5fa", // blue
  "#4ade80", // green
  "#fb923c", // orange-light
  "#94a3b8", // slate
  "#a1a1aa", // zinc
  "#d946ef", // magenta
  "#67e8f9", // cyan-light
];

export function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return n.toLocaleString();
}

export function extractHandle(url: string): string {
  const match = url.match(/@(.+?)(?:[/?#]|$)/);
  return match
    ? match[1]
    : url.replace(/https?:\/\/(www\.)?youtube\.com\//, "");
}

export function buildCategoryColorMap(
  categories: string[],
): Record<string, string> {
  const sorted = [...categories].sort();
  const map: Record<string, string> = {};
  sorted.forEach((cat, i) => {
    map[cat] = CATEGORY_PALETTE[i % CATEGORY_PALETTE.length];
  });
  return map;
}
