"use client";

import { useEffect, useMemo, useState } from "react";

// ── Theme (matches AiTubersCharts) ────────────────────────────────────────────

const COLORS = {
  bg: "rgba(255,255,255,0.03)",
  bgHover: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.08)",
  axisText: "#71717a",
  labelText: "#a1a1aa",
  white: "#e4e4e7",
  violet: "#a78bfa",
  cyan: "#22d3ee",
  amber: "#fbbf24",
  slate: "#94a3b8",
};

const AI_COLORS: Record<string, string> = {
  Full: COLORS.violet,
  Partial: COLORS.cyan,
  Minimal: COLORS.amber,
};

// Stable category → color map
const CATEGORY_PALETTE = [
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

// ── Types ─────────────────────────────────────────────────────────────────────

interface Channel {
  channel: string;
  ai_use: string;
  subscribers: number;
  category: string;
  description: string;
  corrected_description?: string;
}

interface AnalysisData {
  channels: Channel[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractHandle(url: string): string {
  const match = url.match(/@(.+?)(?:[/?#]|$)/);
  return match ? match[1] : url;
}

function fmtSubs(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

function subColor(n: number): string {
  if (n >= 5_000_000) return "#a78bfa";
  if (n >= 1_000_000) return "#818cf8";
  if (n >= 500_000) return "#22d3ee";
  if (n >= 100_000) return "#34d399";
  if (n >= 50_000) return "#fbbf24";
  if (n >= 10_000) return "#fb923c";
  return COLORS.axisText;
}

function subBgColor(n: number): string {
  if (n >= 5_000_000) return "rgba(167,139,250,0.12)";
  if (n >= 1_000_000) return "rgba(129,140,248,0.10)";
  if (n >= 500_000) return "rgba(34,211,238,0.10)";
  if (n >= 100_000) return "rgba(52,211,153,0.08)";
  if (n >= 50_000) return "rgba(251,191,36,0.08)";
  if (n >= 10_000) return "rgba(249,115,22,0.06)";
  return "transparent";
}

// ── Component ─────────────────────────────────────────────────────────────────

const COLLAPSED_ROWS = 5;

export default function AiTubersDataTable() {
  const [data, setData] = useState<Channel[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterAi, setFilterAi] = useState<string>("all");

  useEffect(() => {
    fetch("/data/aitubers-analysis-data.json")
      .then((r) => r.json())
      .then((d: AnalysisData) => {
        const sorted = [...d.channels].sort(
          (a, b) => b.subscribers - a.subscribers,
        );
        setData(sorted);
      });
  }, []);

  const categories = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map((c) => c.category))].sort();
  }, [data]);

  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((cat, i) => {
      map[cat] = CATEGORY_PALETTE[i % CATEGORY_PALETTE.length];
    });
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((c) => {
      if (filterCategory !== "all" && c.category !== filterCategory)
        return false;
      if (filterAi !== "all" && c.ai_use !== filterAi) return false;
      return true;
    });
  }, [data, filterCategory, filterAi]);

  const visible = expanded ? filtered : filtered.slice(0, COLLAPSED_ROWS);
  const hiddenCount = filtered.length - COLLAPSED_ROWS;

  if (!data) {
    return (
      <div
        style={{
          background: COLORS.bg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          padding: 40,
          textAlign: "center",
          color: COLORS.axisText,
          fontFamily: "var(--font-geist-sans), sans-serif",
          fontSize: 14,
        }}
      >
        Loading channel data...
      </div>
    );
  }

  return (
    <div
      style={{
        background: COLORS.bg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}
    >
      {/* Header + filters */}
      <div
        style={{
          padding: "16px 20px 12px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.white,
            marginRight: "auto",
          }}
        >
          {filtered.length} channels
          <span
            style={{
              fontWeight: 400,
              color: COLORS.axisText,
              marginLeft: 8,
              fontSize: 13,
            }}
          >
            sorted by subscribers
          </span>
        </div>

        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setExpanded(false);
          }}
          style={{
            background: "#1e1e22",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 6,
            color: COLORS.white,
            colorScheme: "dark",
            padding: "5px 10px",
            fontSize: 12,
            fontFamily: "inherit",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={filterAi}
          onChange={(e) => {
            setFilterAi(e.target.value);
            setExpanded(false);
          }}
          style={{
            background: "#1e1e22",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 6,
            color: COLORS.white,
            colorScheme: "dark",
            padding: "5px 10px",
            fontSize: 12,
            fontFamily: "inherit",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="all">All AI use</option>
          <option value="Full">Full AI</option>
          <option value="Partial">Partial AI</option>
          <option value="Minimal">Minimal AI</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
            lineHeight: 1.4,
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              {["#", "Channel", "Subscribers", "Category", "AI Use"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 14px",
                      textAlign: h === "Subscribers" ? "right" : "left",
                      fontWeight: 500,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: COLORS.axisText,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {visible.map((ch) => {
              const handle = extractHandle(ch.channel);
              const catColor = categoryColorMap[ch.category] || COLORS.slate;
              const aiColor = AI_COLORS[ch.ai_use] || COLORS.slate;
              const globalRank = data.indexOf(ch) + 1;

              return (
                <tr
                  key={ch.channel}
                  style={{
                    borderBottom: `1px solid ${COLORS.border}`,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = COLORS.bgHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Rank */}
                  <td
                    style={{
                      padding: "8px 14px",
                      color: COLORS.axisText,
                      fontVariantNumeric: "tabular-nums",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {globalRank}
                  </td>

                  {/* Channel name */}
                  <td
                    style={{
                      padding: "8px 14px",
                      maxWidth: 260,
                    }}
                  >
                    <a
                      href={ch.channel}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: COLORS.white,
                        textDecoration: "none",
                        fontWeight: 500,
                        borderBottom: `1px dashed rgba(255,255,255,0.2)`,
                        transition: "color 0.15s, border-color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = COLORS.violet;
                        e.currentTarget.style.borderColor = COLORS.violet;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = COLORS.white;
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.2)";
                      }}
                    >
                      {handle}
                    </a>
                    {ch.description && (
                      <div
                        style={{
                          fontSize: 11,
                          color: COLORS.axisText,
                          marginTop: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 240,
                        }}
                      >
                        {ch.corrected_description || ch.description}
                      </div>
                    )}
                  </td>

                  {/* Subscribers */}
                  <td
                    style={{
                      padding: "8px 14px",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                        color: subColor(ch.subscribers),
                        background: subBgColor(ch.subscribers),
                      }}
                    >
                      {fmtSubs(ch.subscribers)}
                    </span>
                  </td>

                  {/* Category */}
                  <td
                    style={{
                      padding: "8px 14px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        color: catColor,
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: catColor,
                          flexShrink: 0,
                          opacity: 0.8,
                        }}
                      />
                      {ch.category}
                    </span>
                  </td>

                  {/* AI Use */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 10px",
                        borderRadius: 100,
                        fontSize: 11,
                        fontWeight: 500,
                        color: aiColor,
                        background: `${aiColor}15`,
                        border: `1px solid ${aiColor}30`,
                      }}
                    >
                      {ch.ai_use}
                    </span>
                  </td>
                </tr>
              );
            })}

            {/* Summary row when collapsed */}
            {!expanded && hiddenCount > 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: 0,
                    position: "relative",
                  }}
                >
                  {/* Fade-out gradient */}
                  <div
                    style={{
                      position: "absolute",
                      top: -60,
                      left: 0,
                      right: 0,
                      height: 60,
                      background:
                        "linear-gradient(to bottom, transparent, rgba(10,10,10,0.95))",
                      pointerEvents: "none",
                    }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Expand/collapse */}
      {filtered.length > COLLAPSED_ROWS && (
        <div
          style={{
            padding: "12px 20px 16px",
            textAlign: "center",
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "rgba(167,139,250,0.1)",
              border: `1px solid rgba(167,139,250,0.25)`,
              borderRadius: 8,
              color: COLORS.violet,
              padding: "8px 24px",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
              transition:
                "background 0.15s, border-color 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(167,139,250,0.25)";
              e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)";
              e.currentTarget.style.boxShadow =
                "0 0 16px rgba(167,139,250,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(167,139,250,0.1)";
              e.currentTarget.style.borderColor = "rgba(167,139,250,0.25)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {expanded
              ? "Show less"
              : `Show all ${filtered.length} channels (+${hiddenCount} more)`}
          </button>
        </div>
      )}
    </div>
  );
}
