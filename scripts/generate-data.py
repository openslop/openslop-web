#!/usr/bin/env python3
"""Regenerate all JSON data files from the AI Tubers Google Sheet."""

import json
import subprocess
import sys
import statistics
import math
from datetime import datetime, timezone

SHEET_ID = "1qeFJIdkKwMUp1OsXFwoMPtIXU8yEAU4cUed2T7Ewbqw"
ACCOUNT = "nadeem.umair123@gmail.com"
OUT_DIR = "/home/umair/Documents/personal-projects/openslop-web/public/data"

def fetch_sheet():
    """Fetch all rows from Sheet1 via gog CLI."""
    result = subprocess.run(
        ["gog", "sheets", "get", SHEET_ID, "Sheet1!A1:Z2000", "--json", "--account", ACCOUNT],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"Error fetching sheet: {result.stderr}", file=sys.stderr)
        sys.exit(1)
    return json.loads(result.stdout)

def parse_subscribers(raw):
    """Parse subscriber string like '35,600,000' or '1.2M' into int."""
    if not raw or raw.strip() == "":
        return 0
    raw = raw.strip().replace(",", "")
    try:
        if raw.upper().endswith("M"):
            return int(float(raw[:-1]) * 1_000_000)
        elif raw.upper().endswith("K"):
            return int(float(raw[:-1]) * 1_000)
        else:
            return int(float(raw))
    except (ValueError, TypeError):
        return 0

def median(values):
    if not values:
        return 0
    return statistics.median(values)

def main():
    data = fetch_sheet()
    rows = data.get("values", [])

    # Find header row (row 3 in sheet, typically index 2)
    # Skip rows until we find one that looks like headers
    header_idx = None
    for i, row in enumerate(rows):
        if row and len(row) >= 2 and "Channel" in str(row[0]) and "AI Use" in str(row[1]):
            header_idx = i
            break
    
    if header_idx is None:
        # Fallback: assume row index 2 (sheet row 3)
        header_idx = 2

    headers = rows[header_idx] if header_idx < len(rows) else []
    print(f"Headers at index {header_idx}: {headers}")

    # Parse data rows
    channels = []
    for i in range(header_idx + 1, len(rows)):
        row = rows[i]
        if not row or not row[0] or not row[0].strip():
            continue
        
        channel_url = row[0].strip() if len(row) > 0 else ""
        ai_use = row[1].strip() if len(row) > 1 else ""
        subs_raw = row[2].strip() if len(row) > 2 else "0"
        category = row[3].strip() if len(row) > 3 else ""
        description = row[4].strip() if len(row) > 4 else ""
        emails = row[5].strip() if len(row) > 5 else ""

        # Skip non-URL rows
        if not channel_url.startswith("http"):
            continue

        subs = parse_subscribers(subs_raw)

        channels.append({
            "channel": channel_url,
            "ai_use": ai_use,
            "subscribers": subs,
            "subscribers_raw": subs_raw,
            "category": category,
            "description": description,
            "emails": emails,
            "row_number": i + 1  # 1-indexed sheet row
        })

    print(f"Parsed {len(channels)} channels")

    # --- Generate aitubers-raw-structured.json ---
    raw_structured = {
        "source_sheet_id": SHEET_ID,
        "range": f"Sheet1!A1:Z{len(rows)}",
        "header_row_number": header_idx + 1,
        "header": headers[:6] if len(headers) >= 6 else headers,
        "record_count": len(channels),
        "records": [
            {
                "row_number": c["row_number"],
                "channel": c["channel"],
                "ai_use": c["ai_use"],
                "subscribers_raw": c["subscribers_raw"],
                "category_raw": c["category"],
                "description_raw": c["description"],
                "emails_raw": c["emails"],
                "corrected_description_raw": "",
                "raw_cells": [c["channel"], c["ai_use"], c["subscribers_raw"], c["category"], c["description"], c["emails"]]
            }
            for c in channels
        ]
    }

    # --- AI use distribution ---
    ai_dist = {}
    for c in channels:
        use = c["ai_use"] if c["ai_use"] in ("Full", "Minimal", "Partial") else "Unknown"
        ai_dist[use] = ai_dist.get(use, 0) + 1

    channels_with_subs = [c for c in channels if c["subscribers"] > 0]

    # --- Category stats ---
    cat_map = {}
    for c in channels:
        cat = c["category"] or "Uncategorized"
        if cat not in cat_map:
            cat_map[cat] = []
        cat_map[cat].append(c)

    category_stats = []
    for cat, chans in cat_map.items():
        subs_list = [c["subscribers"] for c in chans]
        total_subs = sum(subs_list)
        avg_subs = round(total_subs / len(chans), 2) if chans else 0
        med_subs = median(subs_list)
        n = len(chans)

        full_count = sum(1 for c in chans if c["ai_use"] == "Full")
        partial_count = sum(1 for c in chans if c["ai_use"] == "Partial")
        minimal_count = sum(1 for c in chans if c["ai_use"] == "Minimal")

        full_pct = round(full_count / n * 100, 2) if n else 0
        partial_pct = round(partial_count / n * 100, 2) if n else 0
        minimal_pct = round(minimal_count / n * 100, 2) if n else 0

        # Opportunity score: high avg subs + high AI full % + low competition
        # Formula: log10(avg_subs+1) * (full_pct/100) * (10 / (log2(n+1)+1))
        log_avg = math.log10(avg_subs + 1) if avg_subs > 0 else 0
        crowded = round(math.log2(n + 1) + 1, 2) if n > 0 else 1
        opp = round(log_avg * (full_pct / 100) * (10 / crowded), 2) if crowded > 0 else 0

        category_stats.append({
            "category": cat,
            "channels": n,
            "total_subscribers": total_subs,
            "avg_subscribers": avg_subs,
            "median_subscribers": med_subs,
            "ai_full_pct": full_pct,
            "ai_partial_pct": partial_pct,
            "ai_minimal_pct": minimal_pct,
            "opportunity_score": opp,
            "crowded_score": crowded
        })

    category_stats.sort(key=lambda x: x["opportunity_score"], reverse=True)

    # --- Subscriber buckets ---
    buckets_def = [
        ("0-10k", 0, 10000),
        ("10k-50k", 10000, 50000),
        ("50k-100k", 50000, 100000),
        ("100k-500k", 100000, 500000),
        ("500k-1M", 500000, 1000000),
        ("1M+", 1000000, float("inf")),
    ]
    subscriber_buckets = []
    for label, lo, hi in buckets_def:
        in_bucket = [c for c in channels if lo <= c["subscribers"] < hi]
        subscriber_buckets.append({
            "bucket": label,
            "count": len(in_bucket),
            "full": sum(1 for c in in_bucket if c["ai_use"] == "Full"),
            "partial": sum(1 for c in in_bucket if c["ai_use"] == "Partial"),
            "minimal": sum(1 for c in in_bucket if c["ai_use"] == "Minimal"),
            "unknown": sum(1 for c in in_bucket if c["ai_use"] not in ("Full", "Partial", "Minimal")),
        })

    # --- Rank curve (sorted by subs desc) ---
    sorted_channels = sorted(channels, key=lambda c: c["subscribers"], reverse=True)
    rank_curve = []
    for i, c in enumerate(sorted_channels):
        rank_curve.append({
            "rank": i + 1,
            "percentile": round((i + 1) / len(sorted_channels) * 100, 2),
            "subscribers": c["subscribers"]
        })

    # --- Collection trend (index + rolling avg) ---
    collection_trend = []
    running_sum = 0
    for i, c in enumerate(sorted_channels):
        running_sum += c["subscribers"]
        collection_trend.append({
            "index": i + 1,
            "subscribers": c["subscribers"],
            "rolling_avg_subscribers": round(running_sum / (i + 1))
        })

    # --- Timestamps ---
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    meta = {"generated_at": now, "source_sheet": SHEET_ID}

    # --- Analysis data (combined) ---
    analysis_data = {
        "meta": meta,
        "summary": {
            "channels_cleaned": len(channels),
            "channels_with_subscribers": len(channels_with_subs),
            "ai_use_distribution": ai_dist
        },
        "category_stats": category_stats,
        "channels": [
            {
                "channel": c["channel"],
                "ai_use": c["ai_use"],
                "subscribers": c["subscribers"],
                "category": c["category"],
                "description": c["description"],
                "corrected_description": ""
            }
            for c in channels
        ]
    }

    # --- Analysis summary ---
    analysis_summary = {
        "generated_at": now,
        "source_sheet": SHEET_ID,
        "rows_total_raw": len(channels),
        "channels_cleaned": len(channels),
        "channels_with_subscribers": len(channels_with_subs),
        "ai_use_distribution": ai_dist,
        "top_recommendations": category_stats
    }

    # --- Write all files ---
    def write_json(filename, data):
        path = f"{OUT_DIR}/{filename}"
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        print(f"Wrote {path}")

    write_json("aitubers-raw-structured.json", raw_structured)
    write_json("aitubers-analysis-data.json", analysis_data)
    write_json("analysis_summary.json", analysis_summary)
    write_json("category_stats.json", category_stats)
    write_json("subscriber_buckets.json", subscriber_buckets)
    write_json("rank_curve.json", rank_curve)
    write_json("collection_trend.json", collection_trend)

    # --- Verification ---
    print(f"\n=== VERIFICATION ===")
    print(f"Total channels: {len(channels)}")
    print(f"With subscribers: {len(channels_with_subs)}")
    print(f"AI distribution: {ai_dist}")
    print(f"Categories: {len(category_stats)}")
    bucket_total = sum(b["count"] for b in subscriber_buckets)
    print(f"Bucket total: {bucket_total} (should equal {len(channels)})")
    ai_total = sum(ai_dist.values())
    print(f"AI use total: {ai_total} (should equal {len(channels)})")

if __name__ == "__main__":
    main()
