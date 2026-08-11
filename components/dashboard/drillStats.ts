import type { DrillParams } from "./useDashboardDrill";
import type { DrillRow } from "./DashboardDrillPanel";

export type DrillStatChip = {
  key: string;
  label: string;
  value: string | number;
  /** Apply filters and re-fetch records at current geo scope */
  filter?: DrillParams;
  /** Drill using the same logic as clicking a table row */
  row?: DrillRow;
};

const isBreakdownRow = (meta?: string | null) =>
  !!meta && /^(zone:|state:|segment:|report_type:)/.test(meta);

const parseCount = (status?: string | null) => {
  const n = parseInt(String(status ?? ""), 10);
  return Number.isFinite(n) ? n : null;
};

/** Build clickable summary stats from the current drill result set */
export function computeDrillStats(rows: DrillRow[]): DrillStatChip[] {
  if (!rows.length) return [];

  const breakdown = rows.every((r) => isBreakdownRow(r.meta));

  if (breakdown) {
    const total = rows.reduce((sum, r) => sum + (parseCount(r.status) ?? 0), 0);
    const kind = rows[0]?.meta?.startsWith("zone:")
      ? "zones"
      : rows[0]?.meta?.startsWith("state:")
        ? "states"
        : rows[0]?.meta?.startsWith("report_type:")
          ? "report types"
          : rows[0]?.meta?.startsWith("segment:")
            ? "categories"
            : "items";

    const chips: DrillStatChip[] = [
      { key: "total", label: "Total records", value: total },
      { key: "count", label: kind === "zones" ? "Zones" : kind === "states" ? "States" : "Groups", value: rows.length },
    ];

    [...rows]
      .sort((a, b) => (parseCount(b.status) ?? 0) - (parseCount(a.status) ?? 0))
      .slice(0, 4)
      .forEach((row) => {
        chips.push({
          key: `row-${row.id}`,
          label: row.title.length > 18 ? `${row.title.slice(0, 16)}…` : row.title,
          value: parseCount(row.status) ?? row.status ?? "—",
          row,
        });
      });

    return chips;
  }

  // Detail record list — group by status (+ zones when mixed)
  const chips: DrillStatChip[] = [
    { key: "all", label: "All records", value: rows.length },
  ];

  const byStatus = new Map<string, number>();
  rows.forEach((r) => {
    const st = (r.status || "other").toLowerCase();
    byStatus.set(st, (byStatus.get(st) || 0) + 1);
  });

  [...byStatus.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([status, count]) => {
      if (status === "other") return;
      chips.push({
        key: `status-${status}`,
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        filter: { status },
      });
    });

  const byZone = new Map<string, { count: number; zone_id?: string | number | null }>();
  rows.forEach((r) => {
    if (!r.zone_name) return;
    const cur = byZone.get(r.zone_name) || { count: 0, zone_id: r.zone_id };
    cur.count += 1;
    if (r.zone_id) cur.zone_id = r.zone_id;
    byZone.set(r.zone_name, cur);
  });

  if (byZone.size > 1) {
    [...byZone.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .forEach(([zoneName, info]) => {
        chips.push({
          key: `zone-${zoneName}`,
          label: zoneName.split(" ")[0],
          value: info.count,
          ...(info.zone_id ? { filter: { zone_id: String(info.zone_id) } } : {}),
        });
      });
  }

  const byState = new Map<string, { count: number; state_id?: string | number | null }>();
  rows.forEach((r) => {
    if (!r.state_name) return;
    const cur = byState.get(r.state_name) || { count: 0, state_id: r.state_id };
    cur.count += 1;
    if (r.state_id) cur.state_id = r.state_id;
    byState.set(r.state_name, cur);
  });

  if (byState.size > 1 && byState.size <= 8) {
    [...byState.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .forEach(([stateName, info]) => {
        chips.push({
          key: `state-${stateName}`,
          label: stateName.length > 14 ? `${stateName.slice(0, 12)}…` : stateName,
          value: info.count,
          ...(info.state_id ? { filter: { state_id: String(info.state_id) } } : {}),
        });
      });
  }

  return chips.slice(0, 8);
}
