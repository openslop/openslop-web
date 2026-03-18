"use client";

import { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
  Cell,
  ZAxis,
  ComposedChart,
  Rectangle,
  PieChart,
  Pie,
} from "recharts";

import {
  COLORS,
  AI_COLORS,
  FONT,
  fmtNum,
  buildCategoryColorMap,
} from "./chartTheme";

// ── Verdict box ──────────────────────────────────────────────────────────────

const VERDICT_STYLES: Record<
  string,
  { accent: string; bg: string; label: string }
> = {
  positive: {
    accent: COLORS.emerald,
    bg: "rgba(52,211,153,0.06)",
    label: "TAKEAWAY",
  },
  warning: {
    accent: COLORS.amber,
    bg: "rgba(251,191,36,0.06)",
    label: "WATCH OUT",
  },
  negative: {
    accent: COLORS.rose,
    bg: "rgba(251,113,133,0.06)",
    label: "AVOID",
  },
  neutral: {
    accent: COLORS.cyan,
    bg: "rgba(34,211,238,0.06)",
    label: "KEY INSIGHT",
  },
};

export function Verdict({
  type = "neutral",
  title,
  body,
}: {
  type?: "positive" | "warning" | "negative" | "neutral";
  title: string;
  body: string;
}) {
  const style = VERDICT_STYLES[type] || VERDICT_STYLES.neutral;
  return (
    <div
      style={{
        fontFamily: FONT,
        background: style.bg,
        borderLeft: `3px solid ${style.accent}`,
        borderRadius: "0 8px 8px 0",
        padding: "14px 18px",
        marginTop: 16,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: style.accent,
          marginBottom: 4,
        }}
      >
        {style.label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: COLORS.white,
          marginBottom: body ? 6 : 0,
        }}
      >
        {title}
      </div>
      {body && (
        <div style={{ fontSize: 13, color: COLORS.labelText, lineHeight: 1.5 }}>
          {body}
        </div>
      )}
    </div>
  );
}

// ── Shared tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  labelFormatter,
  valueFormatter,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  labelFormatter?: (p: Record<string, unknown>) => string;
  valueFormatter?: (key: string, val: unknown) => string | null;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload ?? {};
  return (
    <div
      style={{
        background: "#18181b",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: FONT,
        fontSize: 13,
        color: COLORS.white,
        lineHeight: 1.6,
      }}
    >
      {labelFormatter && (
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          {labelFormatter(data)}
        </div>
      )}
      {valueFormatter
        ? Object.entries(data).map(([k, v]) => {
            const formatted = valueFormatter(k, v);
            if (!formatted) return null;
            return <div key={k}>{formatted}</div>;
          })
        : payload.map((p, i) => (
            <div key={i} style={{ color: p.color || COLORS.white }}>
              {p.name}:{" "}
              {typeof p.value === "number" ? fmtNum(p.value) : p.value}
            </div>
          ))}
    </div>
  );
}

// ── Shared wrapper ────────────────────────────────────────────────────────────

function ChartCard({
  children,
  minHeight = 420,
}: {
  children: React.ReactNode;
  minHeight?: number;
}) {
  return (
    <div
      style={{
        width: "100%",
        minHeight,
        background: COLORS.bg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: "20px 4px 8px 0",
        marginTop: 8,
        marginBottom: 8,
        overflowX: "auto",
      }}
    >
      {children}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface CategoryStat {
  category: string;
  channels: number;
  total_subscribers: number;
  avg_subscribers: number;
  median_subscribers: number;
  ai_full_pct: number;
  ai_partial_pct: number;
  ai_minimal_pct: number;
  opportunity_score: number;
  crowded_score: number;
}

interface BucketStat {
  bucket: string;
  count: number;
  full: number;
  partial: number;
  minimal: number;
  unknown: number;
}

interface RankPoint {
  rank: number;
  percentile: number;
  subscribers: number;
}

interface TrendPoint {
  index: number;
  subscribers: number;
  rolling_avg_subscribers: number;
}

interface RawChannel {
  channel: string;
  ai_use: string;
  subscribers: number;
  category: string;
}

// ── Opportunity score → color interpolation ───────────────────────────────────

function scoreColor(score: number, min: number, max: number): string {
  // Apply power curve (t^3) so differences at the high end are much more visible
  const tLinear = Math.max(0, Math.min(1, (score - min) / (max - min)));
  const t = tLinear * tLinear * tLinear;
  // Low scores: dim muted slate-red, high scores: bright saturated emerald
  // 3-stop gradient: #6b5a6e (low) -> #7c3aed (mid) -> #22d3ee (high)
  let r: number, g: number, b: number;
  if (t < 0.5) {
    const s = t * 2; // 0..1 within first half
    r = Math.round(107 + (124 - 107) * s);
    g = Math.round(90 + (58 - 90) * s);
    b = Math.round(110 + (237 - 110) * s);
  } else {
    const s = (t - 0.5) * 2; // 0..1 within second half
    r = Math.round(124 + (34 - 124) * s);
    g = Math.round(58 + (211 - 58) * s);
    b = Math.round(237 + (238 - 237) * s);
  }
  return `rgb(${r},${g},${b})`;
}

// ── 1. Niche landscape (bubble scatter) ───────────────────────────────────────

function NicheLandscape({ data }: { data: CategoryStat[] }) {
  const minScore = Math.min(...data.map((d) => d.opportunity_score));
  const maxScore = Math.max(...data.map((d) => d.opportunity_score));

  return (
    <ChartCard minHeight={520}>
      <ResponsiveContainer width="100%" height={520}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
          <CartesianGrid stroke={COLORS.gridStroke} strokeDasharray="3 3" />
          <XAxis
            dataKey="channels"
            type="number"
            name="Channels"
            tick={{ fill: COLORS.axisText, fontSize: 12, fontFamily: FONT }}
            axisLine={{ stroke: COLORS.gridStroke }}
            tickLine={false}
            label={{
              value: "Number of Channels →",
              position: "insideBottom",
              offset: -18,
              fill: COLORS.labelText,
              fontSize: 12,
              fontFamily: FONT,
            }}
          />
          <YAxis
            dataKey="avg_subscribers"
            type="number"
            name="Avg Subscribers"
            tickFormatter={fmtNum}
            tick={{ fill: COLORS.axisText, fontSize: 12, fontFamily: FONT }}
            axisLine={{ stroke: COLORS.gridStroke }}
            tickLine={false}
            label={{
              value: "Avg Subscribers →",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fill: COLORS.labelText,
              fontSize: 12,
              fontFamily: FONT,
            }}
          />
          <ZAxis
            dataKey="opportunity_score"
            type="number"
            domain={[minScore, maxScore]}
            range={[200, 1800]}
          />
          <RechartsTooltip
            cursor={{ fill: "rgba(255,255,255,0.06)" }}
            content={
              <ChartTooltip
                labelFormatter={(p) => p.category as string}
                valueFormatter={(k, v) => {
                  if (k === "category") return null;
                  if (k === "channels") return `Channels: ${v}`;
                  if (k === "avg_subscribers")
                    return `Avg subs: ${fmtNum(v as number)}`;
                  if (k === "opportunity_score")
                    return `Opportunity: ${(v as number).toFixed(1)}`;
                  if (k === "total_subscribers")
                    return `Total subs: ${fmtNum(v as number)}`;
                  return null;
                }}
              />
            }
          />
          <Scatter data={data} shape="circle">
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={scoreColor(entry.opportunity_score, minScore, maxScore)}
                fillOpacity={0.6}
                stroke={scoreColor(entry.opportunity_score, minScore, maxScore)}
                strokeOpacity={0.85}
                strokeWidth={1.5}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── 2. AI mix (horizontal stacked bars) ───────────────────────────────────────

function AiMixChart({ data }: { data: CategoryStat[] }) {
  // Sort by opportunity score descending
  const sorted = [...data]
    .filter((d) => d.channels >= 3)
    .sort((a, b) => b.opportunity_score - a.opportunity_score);

  return (
    <ChartCard minHeight={Math.max(420, sorted.length * 28 + 80)}>
      <ResponsiveContainer
        width="100%"
        height={Math.max(420, sorted.length * 28 + 80)}
      >
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
        >
          <CartesianGrid
            stroke={COLORS.gridStroke}
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: COLORS.axisText, fontSize: 12, fontFamily: FONT }}
            axisLine={{ stroke: COLORS.gridStroke }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fill: COLORS.white, fontSize: 11, fontFamily: FONT }}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <RechartsTooltip
            cursor={{ fill: "rgba(255,255,255,0.06)" }}
            content={
              <ChartTooltip
                labelFormatter={(p) => p.category as string}
                valueFormatter={(k, v) => {
                  if (k === "ai_full_pct") return `Full AI: ${v}%`;
                  if (k === "ai_partial_pct") return `Partial AI: ${v}%`;
                  if (k === "ai_minimal_pct") return `Minimal AI: ${v}%`;
                  return null;
                }}
              />
            }
          />
          <Legend
            wrapperStyle={{
              fontFamily: FONT,
              fontSize: 12,
              color: COLORS.labelText,
            }}
          />
          <Bar
            dataKey="ai_full_pct"
            name="Full AI"
            stackId="ai"
            fill={AI_COLORS.Full}
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="ai_partial_pct"
            name="Partial AI"
            stackId="ai"
            fill={AI_COLORS.Partial}
          />
          <Bar
            dataKey="ai_minimal_pct"
            name="Minimal AI"
            stackId="ai"
            fill={AI_COLORS.Minimal}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── 3. Subscriber buckets (grouped bar) ───────────────────────────────────────

function SubscriberBuckets({ data }: { data: BucketStat[] }) {
  return (
    <ChartCard>
      <ResponsiveContainer width="100%" height={420}>
        <BarChart
          data={data}
          margin={{ top: 30, right: 30, bottom: 30, left: 20 }}
        >
          <CartesianGrid stroke={COLORS.gridStroke} strokeDasharray="3 3" />
          <XAxis
            dataKey="bucket"
            tick={{ fill: COLORS.axisText, fontSize: 11, fontFamily: FONT }}
            axisLine={{ stroke: COLORS.gridStroke }}
            tickLine={false}
            label={{
              value: "Subscriber Range",
              position: "insideBottom",
              offset: -18,
              fill: COLORS.labelText,
              fontSize: 12,
              fontFamily: FONT,
            }}
          />
          <YAxis
            tick={{ fill: COLORS.axisText, fontSize: 12, fontFamily: FONT }}
            axisLine={{ stroke: COLORS.gridStroke }}
            tickLine={false}
            label={{
              value: "Channels",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fill: COLORS.labelText,
              fontSize: 12,
              fontFamily: FONT,
            }}
          />
          <RechartsTooltip
            cursor={{ fill: "rgba(255,255,255,0.06)" }}
            content={
              <ChartTooltip
                labelFormatter={(p) => p.bucket as string}
                valueFormatter={(k, v) => {
                  if (k === "bucket" || k === "count") return null;
                  if (k === "full") return `Full AI: ${v}`;
                  if (k === "partial") return `Partial AI: ${v}`;
                  if (k === "minimal") return `Minimal AI: ${v}`;
                  if (k === "unknown" && (v as number) > 0)
                    return `Unknown: ${v}`;
                  return null;
                }}
              />
            }
          />
          <Legend
            verticalAlign="top"
            wrapperStyle={{
              fontFamily: FONT,
              fontSize: 12,
              color: COLORS.labelText,
              paddingBottom: 8,
            }}
          />
          <Bar
            dataKey="full"
            name="Full AI"
            fill={AI_COLORS.Full}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="partial"
            name="Partial AI"
            fill={AI_COLORS.Partial}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="minimal"
            name="Minimal AI"
            fill={AI_COLORS.Minimal}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── 4. Rank curve (area-line) ─────────────────────────────────────────────────

function RankCurve({ data }: { data: RankPoint[] }) {
  return (
    <ChartCard>
      <ResponsiveContainer width="100%" height={420}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, bottom: 20, left: 20 }}
        >
          <defs>
            <linearGradient id="rankGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.violet} stopOpacity={0.3} />
              <stop offset="100%" stopColor={COLORS.violet} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={COLORS.gridStroke} strokeDasharray="3 3" />
          <XAxis
            dataKey="rank"
            tick={{ fill: COLORS.axisText, fontSize: 12, fontFamily: FONT }}
            axisLine={{ stroke: COLORS.gridStroke }}
            tickLine={false}
            label={{
              value: "Channel Rank",
              position: "insideBottom",
              offset: -10,
              fill: COLORS.labelText,
              fontSize: 12,
              fontFamily: FONT,
            }}
          />
          <YAxis
            tickFormatter={fmtNum}
            tick={{ fill: COLORS.axisText, fontSize: 12, fontFamily: FONT }}
            axisLine={{ stroke: COLORS.gridStroke }}
            tickLine={false}
            label={{
              value: "Subscribers",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fill: COLORS.labelText,
              fontSize: 12,
              fontFamily: FONT,
            }}
          />
          <RechartsTooltip
            cursor={{ fill: "rgba(255,255,255,0.06)" }}
            content={
              <ChartTooltip
                labelFormatter={(p) => `Rank #${p.rank}`}
                valueFormatter={(k, v) => {
                  if (k === "subscribers")
                    return `Subscribers: ${fmtNum(v as number)}`;
                  if (k === "percentile") return `Top ${v}%`;
                  return null;
                }}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="subscribers"
            stroke={COLORS.violet}
            strokeWidth={2}
            dot={false}
            fillOpacity={1}
            fill="url(#rankGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── 5. Collection trend (dual line) ───────────────────────────────────────────

function CollectionTrend({ data }: { data: TrendPoint[] }) {
  return (
    <ChartCard>
      <ResponsiveContainer width="100%" height={420}>
        <LineChart
          data={data}
          margin={{ top: 30, right: 30, bottom: 30, left: 20 }}
        >
          <CartesianGrid stroke={COLORS.gridStroke} strokeDasharray="3 3" />
          <XAxis
            dataKey="index"
            tick={{ fill: COLORS.axisText, fontSize: 12, fontFamily: FONT }}
            axisLine={{ stroke: COLORS.gridStroke }}
            tickLine={false}
            label={{
              value: "Collection Index (time proxy)",
              position: "insideBottom",
              offset: -18,
              fill: COLORS.labelText,
              fontSize: 12,
              fontFamily: FONT,
            }}
          />
          <YAxis
            tickFormatter={fmtNum}
            tick={{ fill: COLORS.axisText, fontSize: 12, fontFamily: FONT }}
            axisLine={{ stroke: COLORS.gridStroke }}
            tickLine={false}
            label={{
              value: "Subscribers",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fill: COLORS.labelText,
              fontSize: 12,
              fontFamily: FONT,
            }}
          />
          <RechartsTooltip
            cursor={{ fill: "rgba(255,255,255,0.06)" }}
            content={
              <ChartTooltip
                labelFormatter={(p) => `#${p.index}`}
                valueFormatter={(k, v) => {
                  if (k === "subscribers")
                    return `Subscribers: ${fmtNum(v as number)}`;
                  if (k === "rolling_avg_subscribers")
                    return `Rolling avg: ${fmtNum(v as number)}`;
                  return null;
                }}
              />
            }
          />
          <Legend
            verticalAlign="top"
            wrapperStyle={{
              fontFamily: FONT,
              fontSize: 12,
              color: COLORS.labelText,
              paddingBottom: 8,
            }}
          />
          <Line
            type="monotone"
            dataKey="subscribers"
            name="Subscribers"
            stroke={COLORS.slate}
            strokeWidth={1}
            dot={false}
            strokeOpacity={0.5}
          />
          <Line
            type="monotone"
            dataKey="rolling_avg_subscribers"
            name="Rolling Average"
            stroke={COLORS.emerald}
            strokeWidth={2.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── 6. Subscriber distribution per category (box plot) ────────────────────────

interface DistributionRow {
  category: string;
  min: number;
  p25: number;
  median: number;
  p75: number;
  max: number;
  avg: number;
  channels: number;
  // Computed fields for the stacked range rendering
  baseToP25: number;
  p25ToMedian: number;
  medianToP75: number;
  p75ToMax: number;
}

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

function computeDistributions(channels: RawChannel[]): DistributionRow[] {
  const grouped: Record<string, number[]> = {};
  for (const ch of channels) {
    if (!grouped[ch.category]) grouped[ch.category] = [];
    grouped[ch.category].push(ch.subscribers);
  }

  return Object.entries(grouped)
    .map(([category, subs]) => {
      const sorted = [...subs].sort((a, b) => a - b);
      const n = sorted.length;
      const min = sorted[0];
      const max = sorted[n - 1];
      const p25 = quantile(sorted, 0.25);
      const med = quantile(sorted, 0.5);
      const p75 = quantile(sorted, 0.75);
      const avg = subs.reduce((a, b) => a + b, 0) / n;

      return {
        category,
        min,
        p25,
        median: med,
        p75,
        max,
        avg,
        channels: n,
        baseToP25: p25 - min,
        p25ToMedian: med - p25,
        medianToP75: p75 - med,
        p75ToMax: max - p75,
      };
    })
    .filter((d) => d.channels >= 3)
    .sort((a, b) => b.median - a.median);
}

// Custom bar shape for the whisker (min–p25 and p75–max)
function WhiskerBar(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  const { x = 0, y = 0, width = 0, height = 0 } = props;
  if (width <= 0) return null;
  const cy = y + height / 2;
  return (
    <line
      x1={x}
      y1={cy}
      x2={x + width}
      y2={cy}
      stroke={COLORS.labelText}
      strokeWidth={1.5}
      strokeDasharray="3 2"
    />
  );
}

function IqrBar({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  category = "",
  colorMap,
  opacity,
  radius,
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  category?: string;
  colorMap: Record<string, string>;
  opacity: number;
  radius: [number, number, number, number];
}) {
  if (width <= 0) return null;
  return (
    <Rectangle
      x={x}
      y={y + 2}
      width={width}
      height={height - 4}
      fill={colorMap[category] || COLORS.violet}
      fillOpacity={opacity}
      radius={radius}
    />
  );
}

function SubDistributionChart({
  data,
  colorMap,
}: {
  data: DistributionRow[];
  colorMap: Record<string, string>;
}) {
  const chartHeight = Math.max(480, data.length * 34 + 80);

  return (
    <ChartCard minHeight={chartHeight}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
        >
          <CartesianGrid
            stroke={COLORS.gridStroke}
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            scale="log"
            domain={[1, "auto"]}
            tickFormatter={fmtNum}
            tick={{ fill: COLORS.axisText, fontSize: 12, fontFamily: FONT }}
            axisLine={{ stroke: COLORS.gridStroke }}
            tickLine={false}
            allowDataOverflow
            label={{
              value: "Subscribers (log scale)",
              position: "insideBottom",
              offset: -10,
              fill: COLORS.labelText,
              fontSize: 12,
              fontFamily: FONT,
            }}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fill: COLORS.white, fontSize: 11, fontFamily: FONT }}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <RechartsTooltip
            cursor={{ fill: "rgba(255,255,255,0.06)" }}
            content={
              <ChartTooltip
                labelFormatter={(p) => p.category as string}
                valueFormatter={(k, v) => {
                  if (k === "min") return `Min: ${fmtNum(v as number)}`;
                  if (k === "p25") return `P25: ${fmtNum(v as number)}`;
                  if (k === "median") return `Median: ${fmtNum(v as number)}`;
                  if (k === "p75") return `P75: ${fmtNum(v as number)}`;
                  if (k === "max") return `Max: ${fmtNum(v as number)}`;
                  if (k === "avg") return `Avg: ${fmtNum(v as number)}`;
                  if (k === "channels") return `Channels: ${v}`;
                  return null;
                }}
              />
            }
          />
          {/* Whisker: min to p25 */}
          <Bar
            dataKey="baseToP25"
            stackId="dist"
            fill="transparent"
            shape={<WhiskerBar />}
          />
          {/* IQR: p25 to median */}
          <Bar
            dataKey="p25ToMedian"
            stackId="dist"
            isAnimationActive={false}
            shape={(props) => (
              <IqrBar
                {...props}
                colorMap={colorMap}
                opacity={0.7}
                radius={[3, 0, 0, 3]}
              />
            )}
          />
          {/* IQR: median to p75 */}
          <Bar
            dataKey="medianToP75"
            stackId="dist"
            isAnimationActive={false}
            shape={(props) => (
              <IqrBar
                {...props}
                colorMap={colorMap}
                opacity={0.4}
                radius={[0, 3, 3, 0]}
              />
            )}
          />
          {/* Whisker: p75 to max */}
          <Bar
            dataKey="p75ToMax"
            stackId="dist"
            fill="transparent"
            shape={<WhiskerBar />}
          />
          {/* Median marker */}
          <Scatter
            dataKey="median"
            fill={COLORS.white}
            shape="diamond"
            legendType="diamond"
            name="Median"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── 7. Niche ranking by total subscribers ─────────────────────────────────────

interface NicheRankRow {
  category: string;
  total_subscribers: number;
  channels: number;
  avg_subscribers: number;
}

function NicheRankingChart({
  data,
  colorMap,
}: {
  data: NicheRankRow[];
  colorMap: Record<string, string>;
}) {
  const chartHeight = Math.max(480, data.length * 34 + 80);

  return (
    <ChartCard minHeight={chartHeight}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
        >
          <CartesianGrid
            stroke={COLORS.gridStroke}
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            tickFormatter={fmtNum}
            tick={{ fill: COLORS.axisText, fontSize: 12, fontFamily: FONT }}
            axisLine={{ stroke: COLORS.gridStroke }}
            tickLine={false}
            label={{
              value: "Total Subscribers",
              position: "insideBottom",
              offset: -10,
              fill: COLORS.labelText,
              fontSize: 12,
              fontFamily: FONT,
            }}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fill: COLORS.white, fontSize: 11, fontFamily: FONT }}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <RechartsTooltip
            cursor={{ fill: "rgba(255,255,255,0.06)" }}
            content={
              <ChartTooltip
                labelFormatter={(p) => p.category as string}
                valueFormatter={(k, v) => {
                  if (k === "total_subscribers")
                    return `Total: ${fmtNum(v as number)}`;
                  if (k === "channels") return `Channels: ${v}`;
                  if (k === "avg_subscribers")
                    return `Avg: ${fmtNum(v as number)}`;
                  return null;
                }}
              />
            }
          />
          <Bar dataKey="total_subscribers" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={colorMap[entry.category] || COLORS.violet}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── 8. Niche recommendations (best / underserved / crowded) ───────────────────

interface RecommendationRow {
  category: string;
  value: number;
  channels: number;
  label: string;
}

function RecommendationsChart({
  title,
  data,
  valueLabel,
  valueFormatter,
  barColor,
}: {
  title: string;
  data: RecommendationRow[];
  valueLabel: string;
  valueFormatter: (v: number) => string;
  barColor: string;
}) {
  const chartHeight = Math.max(280, data.length * 38 + 60);

  return (
    <div
      style={{
        background: COLORS.bg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px 8px",
          fontSize: 13,
          fontWeight: 600,
          color: COLORS.white,
          fontFamily: FONT,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        {title}
      </div>
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 360 }}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
            >
              <CartesianGrid
                stroke={COLORS.gridStroke}
                strokeDasharray="3 3"
                horizontal={false}
              />
              <XAxis
                type="number"
                tickFormatter={(v) => valueFormatter(v)}
                tick={{ fill: COLORS.axisText, fontSize: 11, fontFamily: FONT }}
                axisLine={{ stroke: COLORS.gridStroke }}
                tickLine={false}
                label={{
                  value: valueLabel,
                  position: "insideBottom",
                  offset: -4,
                  fill: COLORS.labelText,
                  fontSize: 11,
                  fontFamily: FONT,
                }}
              />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fill: COLORS.white, fontSize: 11, fontFamily: FONT }}
                axisLine={false}
                tickLine={false}
                width={120}
              />
              <RechartsTooltip
                cursor={{ fill: "rgba(255,255,255,0.06)" }}
                content={
                  <ChartTooltip
                    labelFormatter={(p) => p.category as string}
                    valueFormatter={(k, v) => {
                      if (k === "value")
                        return `${valueLabel}: ${valueFormatter(v as number)}`;
                      if (k === "channels") return `Channels: ${v}`;
                      if (k === "label") return v as string;
                      return null;
                    }}
                  />
                }
              />
              <Bar
                dataKey="value"
                fill={barColor}
                radius={[0, 4, 4, 0]}
                fillOpacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function NicheRecommendations({ data }: { data: CategoryStat[] }) {
  const filtered = data.filter((d) => d.channels >= 3);

  const mostCrowded = [...filtered]
    .sort((a, b) => b.channels - a.channels)
    .slice(0, 8)
    .map((d) => ({
      category: d.category,
      value: d.channels,
      channels: d.channels,
      label: `Crowded score: ${d.crowded_score.toFixed(1)}`,
    }));

  const leastCrowded = [...filtered]
    .sort((a, b) => a.channels - b.channels)
    .slice(0, 8)
    .map((d) => ({
      category: d.category,
      value: d.channels,
      channels: d.channels,
      label: `Avg subs: ${fmtNum(d.avg_subscribers)}`,
    }));

  const highestSubs = [...filtered]
    .sort((a, b) => b.avg_subscribers - a.avg_subscribers)
    .slice(0, 8)
    .map((d) => ({
      category: d.category,
      value: d.avg_subscribers,
      channels: d.channels,
      label: `${d.channels} channels`,
    }));

  const lowestSubs = [...filtered]
    .sort((a, b) => a.avg_subscribers - b.avg_subscribers)
    .slice(0, 8)
    .map((d) => ({
      category: d.category,
      value: d.avg_subscribers,
      channels: d.channels,
      label: `${d.channels} channels`,
    }));

  // Efficiency: avg subs per channel divided by crowded score (higher = better payoff relative to competition)
  const efficiency = [...filtered]
    .map((d) => ({
      ...d,
      efficiency: d.avg_subscribers / Math.max(d.crowded_score, 0.1),
    }))
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 8)
    .map((d) => ({
      category: d.category,
      value: d.efficiency,
      channels: d.channels,
      label: `${fmtNum(d.avg_subscribers)} avg / ${d.crowded_score.toFixed(
        1,
      )} crowded`,
    }));

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        marginTop: 8,
        marginBottom: 8,
      }}
    >
      <RecommendationsChart
        title="Most crowded niches"
        data={mostCrowded}
        valueLabel="Channels"
        valueFormatter={(v) => v.toString()}
        barColor={COLORS.rose}
      />
      <RecommendationsChart
        title="Least crowded niches"
        data={leastCrowded}
        valueLabel="Channels"
        valueFormatter={(v) => v.toString()}
        barColor={COLORS.emerald}
      />
      <RecommendationsChart
        title="Highest avg subscriber count"
        data={highestSubs}
        valueLabel="Avg Subscribers"
        valueFormatter={fmtNum}
        barColor={COLORS.cyan}
      />
      <RecommendationsChart
        title="Lowest avg subscriber count"
        data={lowestSubs}
        valueLabel="Avg Subscribers"
        valueFormatter={fmtNum}
        barColor={COLORS.amber}
      />
      <RecommendationsChart
        title="Best payoff-to-competition ratio"
        data={efficiency}
        valueLabel="Efficiency (avg subs / crowded score)"
        valueFormatter={fmtNum}
        barColor={COLORS.violet}
      />
    </div>
  );
}

// ── Data loader + exports ─────────────────────────────────────────────────────

function useChartData() {
  const [data, setData] = useState<{
    categories: CategoryStat[];
    buckets: BucketStat[];
    rank: RankPoint[];
    trend: TrendPoint[];
    channels: RawChannel[];
  } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/data/category_stats.json").then((r) => r.json()),
      fetch("/data/subscriber_buckets.json").then((r) => r.json()),
      fetch("/data/rank_curve.json").then((r) => r.json()),
      fetch("/data/collection_trend.json").then((r) => r.json()),
      fetch("/data/aitubers-analysis-data.json").then((r) => r.json()),
    ]).then(([categories, buckets, rank, trend, full]) =>
      setData({ categories, buckets, rank, trend, channels: full.channels }),
    );
  }, []);

  return data;
}

// ── Individual exports for inline MDX usage ───────────────────────────────────

export function NicheLandscapeChart() {
  const data = useChartData();
  if (!data)
    return (
      <ChartCard minHeight={520}>
        <Skeleton />
      </ChartCard>
    );
  return <NicheLandscape data={data.categories} />;
}

export function AiMixChartBlock() {
  const data = useChartData();
  if (!data)
    return (
      <ChartCard>
        <Skeleton />
      </ChartCard>
    );
  return <AiMixChart data={data.categories} />;
}

export function SubscriberBucketsChart() {
  const data = useChartData();
  if (!data)
    return (
      <ChartCard>
        <Skeleton />
      </ChartCard>
    );
  return <SubscriberBuckets data={data.buckets} />;
}

export function RankCurveChart() {
  const data = useChartData();
  if (!data)
    return (
      <ChartCard>
        <Skeleton />
      </ChartCard>
    );
  return <RankCurve data={data.rank} />;
}

export function CollectionTrendChart() {
  const data = useChartData();
  if (!data)
    return (
      <ChartCard>
        <Skeleton />
      </ChartCard>
    );
  return <CollectionTrend data={data.trend} />;
}

export function SubDistributionChartBlock() {
  const data = useChartData();
  if (!data)
    return (
      <ChartCard minHeight={480}>
        <Skeleton />
      </ChartCard>
    );
  const distributions = computeDistributions(data.channels);
  const allCats = [...new Set(data.channels.map((c) => c.category))];
  const colorMap = buildCategoryColorMap(allCats);
  return <SubDistributionChart data={distributions} colorMap={colorMap} />;
}

export function NicheRecommendationsBlock() {
  const data = useChartData();
  if (!data)
    return (
      <ChartCard>
        <Skeleton />
      </ChartCard>
    );
  return <NicheRecommendations data={data.categories} />;
}

export function KeyStatsBlock() {
  const data = useChartData();
  if (!data) return null;

  const totalChannels = data.channels.length;
  const totalSubs = data.channels.reduce((a, c) => a + c.subscribers, 0);
  const fullAi = data.channels.filter((c) => c.ai_use === "Full").length;
  const partialAi = data.channels.filter((c) => c.ai_use === "Partial").length;
  const minimalAi = data.channels.filter((c) => c.ai_use === "Minimal").length;
  const categories = new Set(data.channels.map((c) => c.category)).size;
  const topCategory = [...data.categories].sort(
    (a, b) => b.opportunity_score - a.opportunity_score,
  )[0];

  const stats: { label: string; value: string; color: string }[] = [
    {
      label: "Channels analyzed",
      value: totalChannels.toString(),
      color: COLORS.white,
    },
    {
      label: "Total subscribers",
      value: fmtNum(totalSubs),
      color: COLORS.cyan,
    },
    { label: "Categories", value: categories.toString(), color: COLORS.white },
    {
      label: "Full AI",
      value: `${((fullAi / totalChannels) * 100).toFixed(0)}%`,
      color: COLORS.violet,
    },
    {
      label: "Partial AI",
      value: `${((partialAi / totalChannels) * 100).toFixed(0)}%`,
      color: COLORS.cyan,
    },
    {
      label: "Minimal AI",
      value: `${((minimalAi / totalChannels) * 100).toFixed(0)}%`,
      color: COLORS.amber,
    },
    {
      label: "Top opportunity",
      value: topCategory?.category || "-",
      color: COLORS.emerald,
    },
  ];

  const links = [
    {
      label: "Dataset on GitHub",
      href: "https://github.com/openslop/aitubers-dataset",
      icon: "\u{1F4CA}",
      external: true,
    },
    {
      label: "Full channel list",
      href: "#raw-dataset",
      icon: "\u{1F4CB}",
      external: false,
    },
  ];

  return (
    <div style={{ fontFamily: FONT, marginTop: 12, marginBottom: 12 }}>
      {/* Quick links */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            {...(link.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              background: "rgba(167,139,250,0.1)",
              border: "1px solid rgba(167,139,250,0.25)",
              borderRadius: 8,
              color: COLORS.violet,
              fontSize: 13,
              fontWeight: 500,
              fontFamily: FONT,
              textDecoration: "none",
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(167,139,250,0.2)";
              e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(167,139,250,0.1)";
              e.currentTarget.style.borderColor = "rgba(167,139,250,0.25)";
            }}
          >
            <span>{link.icon}</span>
            {link.label}
            {link.external && (
              <span style={{ fontSize: 11, opacity: 0.6 }}>{"\u2197"}</span>
            )}
          </a>
        ))}
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 8,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: COLORS.bg,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: COLORS.axisText,
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {s.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NicheRankingChartBlock() {
  const data = useChartData();
  if (!data)
    return (
      <ChartCard minHeight={480}>
        <Skeleton />
      </ChartCard>
    );
  const allCats = [...new Set(data.channels.map((c) => c.category))];
  const colorMap = buildCategoryColorMap(allCats);
  const nicheData: NicheRankRow[] = data.categories
    .map((c) => ({
      category: c.category,
      total_subscribers: c.total_subscribers,
      channels: c.channels,
      avg_subscribers: c.avg_subscribers,
    }))
    .sort((a, b) => b.total_subscribers - a.total_subscribers);
  return <NicheRankingChart data={nicheData} colorMap={colorMap} />;
}

// ── 9. Niche leaderboard ──────────────────────────────────────────────────────

function opportunityColor(score: number): string {
  if (score >= 9) return COLORS.emerald;
  if (score >= 8) return COLORS.cyan;
  if (score >= 7) return COLORS.amber;
  return COLORS.axisText;
}

function opportunityBg(score: number): string {
  if (score >= 9) return "rgba(52,211,153,0.10)";
  if (score >= 8) return "rgba(34,211,238,0.08)";
  if (score >= 7) return "rgba(251,191,36,0.06)";
  return "transparent";
}

function crowdedLabel(score: number): { text: string; color: string } {
  if (score >= 2) return { text: "High", color: COLORS.rose };
  if (score >= 1.5) return { text: "Medium", color: COLORS.amber };
  return { text: "Low", color: COLORS.emerald };
}

function verdictLabel(cat: CategoryStat): { text: string; color: string } {
  if (cat.opportunity_score >= 8.5 && cat.channels <= 12)
    return { text: "Start here", color: COLORS.emerald };
  if (cat.opportunity_score >= 8) return { text: "Strong", color: COLORS.cyan };
  if (cat.crowded_score >= 2) return { text: "Crowded", color: COLORS.rose };
  if (cat.opportunity_score >= 7)
    return { text: "Viable", color: COLORS.amber };
  return { text: "Risky", color: COLORS.axisText };
}

function NicheLeaderboard({ data }: { data: CategoryStat[] }) {
  const sorted = [...data]
    .filter((d) => d.channels >= 2)
    .sort((a, b) => b.opportunity_score - a.opportunity_score);

  return (
    <div
      style={{
        background: COLORS.bg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: FONT,
        marginTop: 8,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          padding: "14px 20px 10px",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.white }}>
          Niche Leaderboard
        </span>
        <span style={{ fontSize: 12, color: COLORS.axisText }}>
          {sorted.length} niches ranked by opportunity score
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            minWidth: 700,
            borderCollapse: "collapse",
            fontSize: 13,
            lineHeight: 1.4,
          }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {[
                { label: "#", align: "left" as const },
                { label: "Niche", align: "left" as const },
                { label: "AI Mix", align: "left" as const },
                { label: "Competition", align: "center" as const },
                { label: "Verdict", align: "center" as const },
                { label: "Opportunity", align: "right" as const },
                { label: "Channels", align: "right" as const },
                { label: "Avg Subs", align: "right" as const },
                { label: "Median Subs", align: "right" as const },
              ].map((h) => (
                <th
                  key={h.label}
                  style={{
                    padding: "10px 12px",
                    textAlign: h.align,
                    fontWeight: 500,
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: COLORS.axisText,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((cat, i) => {
              const crowd = crowdedLabel(cat.crowded_score);
              const verdict = verdictLabel(cat);
              return (
                <tr
                  key={cat.category}
                  style={{
                    borderBottom: `1px solid ${COLORS.border}`,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.04)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Rank */}
                  <td
                    style={{
                      padding: "10px 12px",
                      color: COLORS.axisText,
                      fontSize: 12,
                    }}
                  >
                    {i + 1}
                  </td>
                  {/* Niche */}
                  <td
                    style={{
                      padding: "10px 12px",
                      fontWeight: 500,
                      color: COLORS.white,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat.category}
                  </td>
                  {/* AI Mix bar */}
                  <td style={{ padding: "10px 12px", minWidth: 100 }}>
                    <div
                      style={{
                        display: "flex",
                        height: 8,
                        borderRadius: 4,
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      {cat.ai_full_pct > 0 && (
                        <div
                          style={{
                            width: `${cat.ai_full_pct}%`,
                            background: AI_COLORS.Full,
                            opacity: 0.8,
                          }}
                        />
                      )}
                      {cat.ai_partial_pct > 0 && (
                        <div
                          style={{
                            width: `${cat.ai_partial_pct}%`,
                            background: AI_COLORS.Partial,
                            opacity: 0.8,
                          }}
                        />
                      )}
                      {cat.ai_minimal_pct > 0 && (
                        <div
                          style={{
                            width: `${cat.ai_minimal_pct}%`,
                            background: AI_COLORS.Minimal,
                            opacity: 0.8,
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: COLORS.axisText,
                        marginTop: 3,
                      }}
                    >
                      {cat.ai_full_pct > 0 && (
                        <span style={{ color: AI_COLORS.Full }}>
                          {cat.ai_full_pct.toFixed(0)}%F
                        </span>
                      )}
                      {cat.ai_partial_pct > 0 && (
                        <span
                          style={{ marginLeft: 4, color: AI_COLORS.Partial }}
                        >
                          {cat.ai_partial_pct.toFixed(0)}%P
                        </span>
                      )}
                      {cat.ai_minimal_pct > 0 && (
                        <span
                          style={{ marginLeft: 4, color: AI_COLORS.Minimal }}
                        >
                          {cat.ai_minimal_pct.toFixed(0)}%M
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Competition */}
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 10px",
                        borderRadius: 100,
                        fontSize: 11,
                        fontWeight: 500,
                        color: crowd.color,
                        background: `${crowd.color}15`,
                        border: `1px solid ${crowd.color}30`,
                      }}
                    >
                      {crowd.text}
                    </span>
                  </td>
                  {/* Verdict */}
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 12px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        color: verdict.color,
                        background: `${verdict.color}12`,
                        border: `1px solid ${verdict.color}25`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {verdict.text}
                    </span>
                  </td>
                  {/* Opportunity score */}
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontWeight: 700,
                        fontSize: 13,
                        fontVariantNumeric: "tabular-nums",
                        color: opportunityColor(cat.opportunity_score),
                        background: opportunityBg(cat.opportunity_score),
                      }}
                    >
                      {cat.opportunity_score.toFixed(1)}
                    </span>
                  </td>
                  {/* Channels */}
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                      color: COLORS.labelText,
                    }}
                  >
                    {cat.channels}
                  </td>
                  {/* Avg subs */}
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                      color: COLORS.labelText,
                    }}
                  >
                    {fmtNum(cat.avg_subscribers)}
                  </td>
                  {/* Median subs */}
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                      color: COLORS.labelText,
                    }}
                  >
                    {fmtNum(cat.median_subscribers)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Legend */}
      <div
        style={{
          padding: "10px 20px 14px",
          borderTop: `1px solid ${COLORS.border}`,
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          fontSize: 11,
          color: COLORS.axisText,
        }}
      >
        <span>
          <span style={{ color: COLORS.emerald, fontWeight: 600 }}>
            Start here
          </span>{" "}
          = high opportunity, low competition
        </span>
        <span>
          <span style={{ color: COLORS.cyan, fontWeight: 600 }}>Strong</span> =
          high opportunity
        </span>
        <span>
          <span style={{ color: COLORS.amber, fontWeight: 600 }}>Viable</span> =
          decent potential
        </span>
        <span>
          <span style={{ color: COLORS.rose, fontWeight: 600 }}>Crowded</span> =
          needs differentiation
        </span>
        <span
          style={{ borderLeft: `1px solid ${COLORS.border}`, paddingLeft: 16 }}
        >
          <span style={{ color: AI_COLORS.Full, fontWeight: 600 }}>F</span> =
          Full AI
        </span>
        <span>
          <span style={{ color: AI_COLORS.Partial, fontWeight: 600 }}>P</span> =
          Partial AI
        </span>
        <span>
          <span style={{ color: AI_COLORS.Minimal, fontWeight: 600 }}>M</span> =
          Minimal AI
        </span>
      </div>
    </div>
  );
}

// ── 10. AI headroom analysis ──────────────────────────────────────────────────

interface HeadroomRow {
  category: string;
  non_full_pct: number;
  avg_subscribers: number;
  channels: number;
  headroom_score: number;
  ai_partial_pct: number;
  ai_minimal_pct: number;
}

function AiHeadroomScatter({ data }: { data: HeadroomRow[] }) {
  return (
    <ChartCard minHeight={480}>
      <ResponsiveContainer width="100%" height={480}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
          <CartesianGrid stroke={COLORS.gridStroke} strokeDasharray="3 3" />
          <XAxis
            dataKey="non_full_pct"
            type="number"
            name="Non-Full AI %"
            domain={[0, 70]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: COLORS.axisText, fontSize: 12, fontFamily: FONT }}
            axisLine={{ stroke: COLORS.gridStroke }}
            tickLine={false}
            label={{
              value: "Non-Full AI Adoption (%)",
              position: "insideBottom",
              offset: -16,
              fill: COLORS.labelText,
              fontSize: 12,
              fontFamily: FONT,
            }}
          />
          <YAxis
            dataKey="avg_subscribers"
            type="number"
            name="Avg Subscribers"
            tickFormatter={fmtNum}
            tick={{ fill: COLORS.axisText, fontSize: 12, fontFamily: FONT }}
            axisLine={{ stroke: COLORS.gridStroke }}
            tickLine={false}
            label={{
              value: "Avg Subscribers",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fill: COLORS.labelText,
              fontSize: 12,
              fontFamily: FONT,
            }}
          />
          <ZAxis dataKey="headroom_score" type="number" range={[200, 1400]} />
          <RechartsTooltip
            cursor={{ fill: "rgba(255,255,255,0.06)" }}
            content={
              <ChartTooltip
                labelFormatter={(p) => p.category as string}
                valueFormatter={(k, v) => {
                  if (k === "category" || k === "headroom_score") return null;
                  if (k === "non_full_pct") return `Non-Full AI: ${v}%`;
                  if (k === "avg_subscribers")
                    return `Avg subs: ${fmtNum(v as number)}`;
                  if (k === "channels") return `Channels: ${v}`;
                  if (k === "ai_partial_pct") return `Partial: ${v}%`;
                  if (k === "ai_minimal_pct") return `Minimal: ${v}%`;
                  return null;
                }}
              />
            }
          />
          <Scatter data={data} shape="circle">
            {data.map((entry, i) => {
              // Color by headroom: high non-full + high subs = bright emerald, low = dim
              const t = Math.min(1, entry.headroom_score / 10);
              const color =
                t > 0.6
                  ? COLORS.emerald
                  : t > 0.3
                    ? COLORS.cyan
                    : COLORS.violet;
              return (
                <Cell
                  key={i}
                  fill={color}
                  fillOpacity={0.6}
                  stroke={color}
                  strokeOpacity={0.85}
                  strokeWidth={1.5}
                />
              );
            })}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function AiHeadroomRanking({ data }: { data: HeadroomRow[] }) {
  const sorted = [...data].sort((a, b) => b.headroom_score - a.headroom_score);
  const chartHeight = Math.max(380, sorted.length * 34 + 60);

  return (
    <ChartCard minHeight={chartHeight}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
        >
          <CartesianGrid
            stroke={COLORS.gridStroke}
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            tickFormatter={(v) => v.toFixed(1)}
            tick={{ fill: COLORS.axisText, fontSize: 12, fontFamily: FONT }}
            axisLine={{ stroke: COLORS.gridStroke }}
            tickLine={false}
            label={{
              value: "AI Headroom Score",
              position: "insideBottom",
              offset: -10,
              fill: COLORS.labelText,
              fontSize: 12,
              fontFamily: FONT,
            }}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fill: COLORS.white, fontSize: 11, fontFamily: FONT }}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <RechartsTooltip
            cursor={{ fill: "rgba(255,255,255,0.06)" }}
            content={
              <ChartTooltip
                labelFormatter={(p) => p.category as string}
                valueFormatter={(k, v) => {
                  if (k === "headroom_score")
                    return `Headroom: ${(v as number).toFixed(1)}`;
                  if (k === "non_full_pct") return `Non-Full AI: ${v}%`;
                  if (k === "avg_subscribers")
                    return `Avg subs: ${fmtNum(v as number)}`;
                  if (k === "channels") return `Channels: ${v}`;
                  return null;
                }}
              />
            }
          />
          <Bar dataKey="headroom_score" radius={[0, 4, 4, 0]}>
            {sorted.map((entry, i) => {
              const t =
                entry.headroom_score /
                Math.max(...sorted.map((d) => d.headroom_score));
              const color =
                t > 0.6
                  ? COLORS.emerald
                  : t > 0.3
                    ? COLORS.cyan
                    : COLORS.labelText;
              return <Cell key={i} fill={color} fillOpacity={0.8} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function TopNonFullChannels({ channels }: { channels: RawChannel[] }) {
  const nonFull = channels
    .filter((c) => c.ai_use === "Partial" || c.ai_use === "Minimal")
    .sort((a, b) => b.subscribers - a.subscribers)
    .slice(0, 15);

  function extractHandle(url: string): string {
    const match = url.match(/@(.+?)(?:[/?#]|$)/);
    return match
      ? match[1]
      : url.replace(/https?:\/\/(www\.)?youtube\.com\//, "");
  }

  return (
    <div
      style={{
        background: COLORS.bg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: FONT,
        marginTop: 8,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          padding: "14px 20px 10px",
          borderBottom: `1px solid ${COLORS.border}`,
          fontSize: 14,
          fontWeight: 600,
          color: COLORS.white,
        }}
      >
        Top Partial & Minimal AI channels by subscribers
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            minWidth: 580,
            borderCollapse: "collapse",
            fontSize: 13,
            lineHeight: 1.4,
          }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {["#", "Channel", "Subscribers", "AI Use", "Category"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 14px",
                      textAlign: h === "Subscribers" ? "right" : "left",
                      fontWeight: 500,
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
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
            {nonFull.map((ch, i) => {
              const handle = extractHandle(ch.channel);
              const aiColor =
                ch.ai_use === "Partial" ? COLORS.cyan : COLORS.amber;
              return (
                <tr
                  key={ch.channel}
                  style={{
                    borderBottom: `1px solid ${COLORS.border}`,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.04)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "8px 14px",
                      color: COLORS.axisText,
                      fontSize: 12,
                    }}
                  >
                    {i + 1}
                  </td>
                  <td style={{ padding: "8px 14px" }}>
                    <a
                      href={ch.channel}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: COLORS.white,
                        textDecoration: "none",
                        fontWeight: 500,
                        borderBottom: "1px dashed rgba(255,255,255,0.2)",
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
                  </td>
                  <td
                    style={{
                      padding: "8px 14px",
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                      fontWeight: 600,
                      color: COLORS.cyan,
                    }}
                  >
                    {fmtNum(ch.subscribers)}
                  </td>
                  <td style={{ padding: "8px 14px" }}>
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
                  <td
                    style={{
                      padding: "8px 14px",
                      color: COLORS.labelText,
                      fontSize: 12,
                    }}
                  >
                    {ch.category}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AiHeadroomSection() {
  const data = useChartData();
  if (!data)
    return (
      <ChartCard minHeight={480}>
        <Skeleton />
      </ChartCard>
    );

  const filtered = data.categories.filter((c) => c.channels >= 3);
  const maxSubs = Math.max(...filtered.map((c) => c.avg_subscribers));

  const headroomData: HeadroomRow[] = filtered
    .map((c) => {
      const nonFullPct = 100 - c.ai_full_pct;
      // Score: normalized avg subs * non-full percentage weight
      // Niches with 0% non-full get 0 headroom
      const subsNorm =
        Math.log10(Math.max(c.avg_subscribers, 1)) /
        Math.log10(Math.max(maxSubs, 1));
      const headroom = subsNorm * (nonFullPct / 100) * 10;
      return {
        category: c.category,
        non_full_pct: Math.round(nonFullPct * 10) / 10,
        avg_subscribers: c.avg_subscribers,
        channels: c.channels,
        headroom_score: Math.round(headroom * 100) / 100,
        ai_partial_pct: c.ai_partial_pct,
        ai_minimal_pct: c.ai_minimal_pct,
      };
    })
    .filter((d) => d.non_full_pct > 0);

  return (
    <>
      <AiHeadroomScatter data={headroomData} />
      <AiHeadroomRanking data={headroomData} />
      <TopNonFullChannels channels={data.channels} />
    </>
  );
}

// ── Headline findings ────────────────────────────────────────────────────────

function FindingCardShell({
  title,
  subtitle,
  color,
  bg,
  children,
}: {
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          padding: "14px 18px 10px",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color }}>{title}</div>
        <div style={{ fontSize: 11, color: COLORS.axisText, marginTop: 2 }}>
          {subtitle}
        </div>
      </div>
      <div style={{ padding: "10px 18px 14px" }}>{children}</div>
    </div>
  );
}

// Card 1 — Lollipop chart
function GoldRushCard({
  data,
}: {
  data: { category: string; ratio: number; channels: number }[];
}) {
  const maxVal = Math.max(...data.map((d) => d.ratio), 1);
  return (
    <FindingCardShell
      title="Where's the gold rush?"
      subtitle="Highest subscriber-to-channel ratio (≥3 ch)"
      color={COLORS.emerald}
      bg="rgba(52,211,153,0.04)"
    >
      {data.map((d, i) => (
        <div
          key={d.category}
          style={{
            marginBottom: i < data.length - 1 ? 10 : 0,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 4,
            }}
          >
            <span
              style={{ fontSize: 12, color: COLORS.white, fontWeight: 500 }}
            >
              {d.category}
            </span>
            <span
              style={{
                fontSize: 11,
                color: COLORS.axisText,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmtNum(d.ratio)} per ch · {d.channels} ch
            </span>
          </div>
          <div
            style={{
              position: "relative",
              height: 12,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                width: `${(d.ratio / maxVal) * 100}%`,
                height: 2,
                background: COLORS.emerald,
                opacity: 0.5,
                borderRadius: 1,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${(d.ratio / maxVal) * 100}%`,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: COLORS.emerald,
                transform: "translateX(-50%)",
              }}
            />
          </div>
        </div>
      ))}
    </FindingCardShell>
  );
}

// Card 2 — Donut chart
function CrowdedDonutCard({
  data,
}: {
  data: { category: string; channels: number }[];
}) {
  const DONUT_COLORS = [
    COLORS.violet,
    COLORS.cyan,
    COLORS.emerald,
    COLORS.amber,
    COLORS.rose,
    COLORS.slate,
  ];
  return (
    <FindingCardShell
      title="How crowded is it, really?"
      subtitle="Channel distribution across niches"
      color={COLORS.cyan}
      bg="rgba(34,211,238,0.04)"
    >
      <div style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="channels"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={75}
              innerRadius={40}
              strokeWidth={1}
              stroke="rgba(0,0,0,0.6)"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label={(props: any) => {
                const {
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                  category,
                } = props;
                if (percent < 0.06) return null;
                const rad = Math.PI / 180;
                const radius = outerRadius + (outerRadius - innerRadius) * 0.35;
                const x = cx + radius * Math.cos(-midAngle * rad);
                const y = cy + radius * Math.sin(-midAngle * rad);
                return (
                  <text
                    x={x}
                    y={y}
                    fill={COLORS.axisText}
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                    style={{ fontSize: 9, fontFamily: FONT }}
                  >
                    {category}
                  </text>
                );
              }}
              labelLine={false}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                  opacity={0.8}
                />
              ))}
            </Pie>
            <RechartsTooltip
              content={
                <ChartTooltip
                  labelFormatter={(p) => p.category as string}
                  valueFormatter={(k, v) => {
                    if (k === "channels") return `Channels: ${v}`;
                    return null;
                  }}
                />
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </FindingCardShell>
  );
}

// Card 3 — Stacked horizontal segment bars
function AiMixCard({ buckets }: { buckets: BucketStat[] }) {
  return (
    <FindingCardShell
      title="Does going full AI pay off?"
      subtitle="AI mix by subscriber tier"
      color={COLORS.violet}
      bg="rgba(167,139,250,0.04)"
    >
      {buckets.map((b, i) => {
        const total = b.full + b.partial + b.minimal + b.unknown;
        if (total === 0) return null;
        const fullPct = (b.full / total) * 100;
        const partialPct = (b.partial / total) * 100;
        const minimalPct = (b.minimal / total) * 100;
        return (
          <div
            key={b.bucket}
            style={{ marginBottom: i < buckets.length - 1 ? 8 : 0 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 3,
              }}
            >
              <span
                style={{ fontSize: 11, color: COLORS.white, fontWeight: 500 }}
              >
                {b.bucket}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: COLORS.axisText,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {total} channels
              </span>
            </div>
            <div
              style={{
                display: "flex",
                height: 10,
                borderRadius: 5,
                overflow: "hidden",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <div
                style={{
                  width: `${fullPct}%`,
                  background: COLORS.violet,
                  opacity: 0.8,
                }}
                title={`Full AI: ${fullPct.toFixed(0)}%`}
              />
              <div
                style={{
                  width: `${partialPct}%`,
                  background: COLORS.cyan,
                  opacity: 0.8,
                }}
                title={`Partial AI: ${partialPct.toFixed(0)}%`}
              />
              <div
                style={{
                  width: `${minimalPct}%`,
                  background: COLORS.amber,
                  opacity: 0.8,
                }}
                title={`Minimal AI: ${minimalPct.toFixed(0)}%`}
              />
            </div>
          </div>
        );
      })}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 10,
          fontSize: 10,
          color: COLORS.axisText,
        }}
      >
        <span>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: 2,
              background: COLORS.violet,
              marginRight: 4,
              verticalAlign: "middle",
            }}
          />
          Full
        </span>
        <span>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: 2,
              background: COLORS.cyan,
              marginRight: 4,
              verticalAlign: "middle",
            }}
          />
          Partial
        </span>
        <span>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: 2,
              background: COLORS.amber,
              marginRight: 4,
              verticalAlign: "middle",
            }}
          />
          Minimal
        </span>
      </div>
    </FindingCardShell>
  );
}

// Card 4 — Vertical bar chart (color-coded, no x-axis labels)
const ODDS_PALETTE = [
  COLORS.rose,
  COLORS.violet,
  COLORS.cyan,
  COLORS.emerald,
  COLORS.amber,
  COLORS.fuchsia,
];

function RealisticOddsCard({
  data,
}: {
  data: { category: string; ratio: number }[];
}) {
  return (
    <FindingCardShell
      title="What are my realistic odds?"
      subtitle="Median-to-average ratio (closer to 1 = fairer)"
      color={COLORS.rose}
      bg="rgba(251,113,133,0.04)"
    >
      <div style={{ width: "100%", height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 4, bottom: 0, left: -20 }}
          >
            <XAxis dataKey="category" hide />
            <YAxis
              tick={{ fill: COLORS.axisText, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              domain={[0, "auto"]}
              tickFormatter={(v: number) => v.toFixed(1)}
            />
            <Bar dataKey="ratio" radius={[3, 3, 0, 0]}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={ODDS_PALETTE[i % ODDS_PALETTE.length]}
                  opacity={0.85}
                />
              ))}
            </Bar>
            <RechartsTooltip
              cursor={{ fill: "rgba(255,255,255,0.06)" }}
              content={
                <ChartTooltip
                  labelFormatter={(p) => p.category as string}
                  valueFormatter={(k, v) => {
                    if (k === "category") return null;
                    return `Median/Avg: ${(v as number).toFixed(3)}`;
                  }}
                />
              }
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "4px 10px",
          marginTop: 6,
          fontSize: 10,
          color: COLORS.axisText,
        }}
      >
        {data.map((d, i) => (
          <span
            key={d.category}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: 2,
                background: ODDS_PALETTE[i % ODDS_PALETTE.length],
                flexShrink: 0,
              }}
            />
            {d.category}
          </span>
        ))}
      </div>
    </FindingCardShell>
  );
}

// Card 5 — Scatter plot
function SupplyDemandCard({
  data,
  topOpportunity,
}: {
  data: { category: string; channels: number; avgSubs: number }[];
  topOpportunity: string[];
}) {
  return (
    <FindingCardShell
      title="Where's nobody looking?"
      subtitle="Supply (channels) vs demand (avg subs)"
      color={COLORS.cyan}
      bg="rgba(34,211,238,0.04)"
    >
      <div style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, bottom: 4, left: -10 }}>
            <XAxis
              dataKey="channels"
              type="number"
              name="Channels"
              tick={{ fill: COLORS.axisText, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              label={{
                value: "Channels",
                position: "insideBottom",
                offset: -2,
                fill: COLORS.axisText,
                fontSize: 9,
              }}
            />
            <YAxis
              dataKey="avgSubs"
              type="number"
              name="Avg Subs"
              tick={{ fill: COLORS.axisText, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => fmtNum(v)}
            />
            <Scatter data={data}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    topOpportunity.includes(d.category)
                      ? COLORS.emerald
                      : COLORS.cyan
                  }
                  opacity={topOpportunity.includes(d.category) ? 1 : 0.4}
                  r={topOpportunity.includes(d.category) ? 6 : 4}
                />
              ))}
            </Scatter>
            <RechartsTooltip
              content={
                <ChartTooltip
                  labelFormatter={(p) => p.category as string}
                  valueFormatter={(k, v) => {
                    if (k === "category") return null;
                    if (k === "channels") return `Channels: ${v}`;
                    if (k === "avgSubs")
                      return `Avg subs: ${fmtNum(v as number)}`;
                    return null;
                  }}
                />
              }
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          fontSize: 10,
          color: COLORS.axisText,
          marginTop: 4,
        }}
      >
        <span>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: COLORS.emerald,
              marginRight: 4,
              verticalAlign: "middle",
            }}
          />
          Top opportunity
        </span>
        <span>
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: COLORS.cyan,
              opacity: 0.4,
              marginRight: 4,
              verticalAlign: "middle",
            }}
          />
          Other niches
        </span>
      </div>
    </FindingCardShell>
  );
}

// Card 6 — Stat list with warning indicators
function TrapNichesCard({
  data,
}: {
  data: {
    category: string;
    avg: number;
    median: number;
    gap: number;
  }[];
}) {
  return (
    <FindingCardShell
      title="Which niches are a trap?"
      subtitle="Highest avg-to-median gap (winner-take-all)"
      color={COLORS.amber}
      bg="rgba(251,191,36,0.04)"
    >
      {data.map((d, i) => (
        <div
          key={d.category}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 0",
            borderBottom:
              i < data.length - 1 ? `1px solid ${COLORS.border}` : "none",
          }}
        >
          <span
            style={{
              fontSize: 14,
              width: 20,
              textAlign: "center",
              flexShrink: 0,
            }}
          >
            {d.gap >= 100 ? "🔴" : d.gap >= 20 ? "🟠" : "🟡"}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                color: COLORS.white,
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {d.category}
            </div>
            <div style={{ fontSize: 10, color: COLORS.axisText }}>
              avg {fmtNum(d.avg)} · med {fmtNum(d.median)}
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.amber,
              fontVariantNumeric: "tabular-nums",
              flexShrink: 0,
            }}
          >
            {d.gap.toFixed(0)}x gap
          </div>
        </div>
      ))}
    </FindingCardShell>
  );
}

export function HeadlineFindingsBlock() {
  const data = useChartData();
  if (!data)
    return (
      <ChartCard minHeight={400}>
        <Skeleton />
      </ChartCard>
    );

  const cats = data.categories.filter((c) => c.channels >= 3);

  // Card 1: Gold rush — payoff-to-competition ratio
  const goldRush = [...cats]
    .map((c) => ({
      category: c.category,
      ratio: Math.round(c.avg_subscribers / c.channels),
      channels: c.channels,
    }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 5);

  // Card 2: Crowded donut — all niches by channel count
  const donutData = [...cats]
    .sort((a, b) => b.channels - a.channels)
    .map((c) => ({ category: c.category, channels: c.channels }));

  // Card 3: AI mix — bucket data
  const buckets = data.buckets;

  // Card 4: Realistic odds — median-to-average ratio (closer to 1 = better)
  const realisticOdds = [...cats]
    .filter((c) => c.avg_subscribers > 0)
    .map((c) => ({
      category: c.category,
      ratio: c.median_subscribers / c.avg_subscribers,
    }))
    .sort((a, b) => b.ratio - a.ratio);

  // Card 5: Supply vs demand scatter
  const scatterData = cats.map((c) => ({
    category: c.category,
    channels: c.channels,
    avgSubs: c.avg_subscribers,
  }));
  const topOpportunity = [...cats]
    .sort((a, b) => b.opportunity_score - a.opportunity_score)
    .slice(0, 3)
    .map((c) => c.category);

  // Card 6: Trap niches — highest avg-to-median gap
  const trapNiches = [...cats]
    .filter((c) => c.median_subscribers > 0)
    .map((c) => ({
      category: c.category,
      avg: c.avg_subscribers,
      median: c.median_subscribers,
      gap: c.avg_subscribers / c.median_subscribers,
    }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 5);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 12,
        marginTop: 12,
        marginBottom: 12,
      }}
    >
      <GoldRushCard data={goldRush} />
      <CrowdedDonutCard data={donutData} />
      <AiMixCard buckets={buckets} />
      <RealisticOddsCard data={realisticOdds} />
      <SupplyDemandCard data={scatterData} topOpportunity={topOpportunity} />
      <TrapNichesCard data={trapNiches} />
    </div>
  );
}

export function NicheLeaderboardBlock() {
  const data = useChartData();
  if (!data)
    return (
      <ChartCard>
        <Skeleton />
      </ChartCard>
    );
  return (
    <div id="niche-leaderboard">
      <NicheLeaderboard data={data.categories} />
    </div>
  );
}

// ── Pie chart: niches by channel count ───────────────────────────────────────

const RADIAN = Math.PI / 180;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, category } =
    props;
  if (percent < 0.04) return null; // skip tiny slices
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const name = category as string;
  return (
    <text
      x={x}
      y={y}
      fill={COLORS.white}
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily={FONT}
      fontSize={10}
      fontWeight={600}
    >
      {name?.length > 14 ? name.slice(0, 12) + "…" : name}
    </text>
  );
}

function NicheSharePie({
  data,
  colorMap,
}: {
  data: CategoryStat[];
  colorMap: Record<string, string>;
}) {
  const sorted = [...data].sort((a, b) => b.channels - a.channels);

  return (
    <ChartCard minHeight={440}>
      <div
        style={{
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 13,
          color: COLORS.labelText,
          paddingTop: 4,
          paddingBottom: 2,
        }}
      >
        Share of channels by niche (out of 333)
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={sorted}
            dataKey="channels"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={150}
            innerRadius={50}
            strokeWidth={1}
            stroke="rgba(0,0,0,0.6)"
            label={PieLabel}
            labelLine={false}
          >
            {sorted.map((entry, i) => (
              <Cell
                key={i}
                fill={colorMap[entry.category] || COLORS.violet}
                fillOpacity={0.85}
              />
            ))}
          </Pie>
          <RechartsTooltip
            cursor={{ fill: "rgba(255,255,255,0.06)" }}
            content={
              <ChartTooltip
                labelFormatter={(p) => p.category as string}
                valueFormatter={(k, v) => {
                  if (k === "channels") return `Channels: ${v}`;
                  if (k === "total_subscribers")
                    return `Total subs: ${fmtNum(v as number)}`;
                  if (k === "avg_subscribers")
                    return `Avg subs: ${fmtNum(v as number)}`;
                  return null;
                }}
              />
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function NicheSharePieChart() {
  const data = useChartData();
  if (!data)
    return (
      <ChartCard minHeight={440}>
        <Skeleton />
      </ChartCard>
    );
  const allCats = [...new Set(data.channels.map((c) => c.category))];
  const colorMap = buildCategoryColorMap(allCats);
  return <NicheSharePie data={data.categories} colorMap={colorMap} />;
}

// ── Marimekko chart: width = channels, height = total subs ───────────────────

function NicheMarimekko({
  data,
  colorMap,
}: {
  data: CategoryStat[];
  colorMap: Record<string, string>;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const sorted = [...data].sort(
    (a, b) => b.total_subscribers - a.total_subscribers,
  );
  const totalChannels = sorted.reduce((a, c) => a + c.channels, 0);
  const maxSubs = Math.max(...sorted.map((c) => c.total_subscribers));

  const chartWidth = 100; // percentage
  const chartHeight = 360;
  const marginTop = 50;
  const marginBottom = 40;
  const usableHeight = chartHeight - marginTop - marginBottom;

  // Build columns: x position and width as percentages
  const columns: {
    cat: CategoryStat;
    xPct: number;
    wPct: number;
    hPct: number;
  }[] = [];
  let cumPct = 0;
  for (const cat of sorted) {
    const wPct = (cat.channels / totalChannels) * chartWidth;
    const hPct = cat.total_subscribers / maxSubs;
    columns.push({ cat, xPct: cumPct, wPct, hPct });
    cumPct += wPct;
  }

  const hoveredData = hovered
    ? sorted.find((c) => c.category === hovered)
    : null;

  return (
    <ChartCard minHeight={chartHeight + 20}>
      <div
        style={{
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 13,
          color: COLORS.labelText,
          paddingTop: 4,
          paddingBottom: 6,
        }}
      >
        Niche size map — width = channels, height = total subscribers
      </div>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: chartHeight,
          paddingLeft: 12,
          paddingRight: 12,
        }}
      >
        {/* Y axis labels */}
        <div
          style={{
            position: "absolute",
            left: 12,
            top: marginTop,
            height: usableHeight,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          {[1, 0.75, 0.5, 0.25, 0].map((frac) => (
            <span
              key={frac}
              style={{
                fontFamily: FONT,
                fontSize: 10,
                color: COLORS.axisText,
              }}
            >
              {fmtNum(maxSubs * frac)}
            </span>
          ))}
        </div>

        {/* Chart area */}
        <div
          style={{
            position: "absolute",
            left: 52,
            right: 12,
            top: marginTop,
            height: usableHeight,
            borderBottom: `1px solid ${COLORS.gridStroke}`,
            borderLeft: `1px solid ${COLORS.gridStroke}`,
          }}
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((frac) => (
            <div
              key={frac}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: `${frac * 100}%`,
                borderTop: `1px dashed ${COLORS.gridStroke}`,
              }}
            />
          ))}

          {/* Bars */}
          {columns.map(({ cat, xPct, wPct, hPct }) => (
            <div
              key={cat.category}
              style={{
                position: "absolute",
                left: `${xPct}%`,
                width: `${wPct}%`,
                bottom: 0,
                height: `${hPct * 100}%`,
                background: colorMap[cat.category] || COLORS.violet,
                opacity: hovered
                  ? hovered === cat.category
                    ? 0.9
                    : 0.25
                  : 0.7,
                borderRight: "1px solid rgba(0,0,0,0.4)",
                transition: "opacity 0.15s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                setHovered(cat.category);
                const rect = (
                  e.currentTarget.parentElement as HTMLElement
                ).getBoundingClientRect();
                const barRect = e.currentTarget.getBoundingClientRect();
                setTooltipPos({
                  x: barRect.left - rect.left + barRect.width / 2,
                  y: barRect.top - rect.top - 8,
                });
              }}
              onMouseLeave={() => {
                setHovered(null);
                setTooltipPos(null);
              }}
            >
              {/* Label inside bar if wide enough */}
              {wPct > 6 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 4,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    fontFamily: FONT,
                    fontSize: 9,
                    fontWeight: 600,
                    color: COLORS.white,
                    textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    padding: "0 2px",
                  }}
                >
                  {cat.category}
                </div>
              )}
            </div>
          ))}

          {/* Tooltip */}
          {hoveredData && tooltipPos && (
            <div
              style={{
                position: "absolute",
                left: tooltipPos.x,
                top: tooltipPos.y,
                transform: "translate(-50%, -100%)",
                background: "#18181b",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                padding: "10px 14px",
                fontFamily: FONT,
                fontSize: 13,
                color: COLORS.white,
                lineHeight: 1.6,
                pointerEvents: "none",
                zIndex: 10,
                whiteSpace: "nowrap",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {hoveredData.category}
              </div>
              <div>Channels: {hoveredData.channels}</div>
              <div>Total subs: {fmtNum(hoveredData.total_subscribers)}</div>
              <div>Avg subs: {fmtNum(hoveredData.avg_subscribers)}</div>
            </div>
          )}
        </div>

        {/* X axis label */}
        <div
          style={{
            position: "absolute",
            left: 52,
            right: 12,
            bottom: 4,
            textAlign: "center",
            fontFamily: FONT,
            fontSize: 12,
            color: COLORS.labelText,
          }}
        >
          ← fewer channels · more channels →
        </div>
      </div>
    </ChartCard>
  );
}

export function NicheMarimekkoChart() {
  const data = useChartData();
  if (!data)
    return (
      <ChartCard minHeight={420}>
        <Skeleton />
      </ChartCard>
    );
  const allCats = [...new Set(data.channels.map((c) => c.category))];
  const colorMap = buildCategoryColorMap(allCats);
  return <NicheMarimekko data={data.categories} colorMap={colorMap} />;
}

function Skeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: 380,
        color: COLORS.axisText,
        fontFamily: FONT,
        fontSize: 14,
      }}
    >
      Loading chart...
    </div>
  );
}

// ── Default export (all charts, kept for backwards compat) ────────────────────

export default function AiTubersCharts() {
  const data = useChartData();
  if (!data)
    return (
      <ChartCard minHeight={520}>
        <Skeleton />
      </ChartCard>
    );

  return (
    <>
      <NicheLandscape data={data.categories} />
      <AiMixChart data={data.categories} />
      <SubscriberBuckets data={data.buckets} />
      <RankCurve data={data.rank} />
      <CollectionTrend data={data.trend} />
    </>
  );
}
