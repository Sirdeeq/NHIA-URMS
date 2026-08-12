import * as React from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";

export const COLORS = ["#25a872", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

/** Scope labels for unit-head dashboards (SERVICOM, Stock Verification, SOC/Zones) */
export function getUnitHeadScope(
  unitName: string,
  defaultStateId?: string | null,
  defaultZoneId?: string | null,
) {
  if (defaultStateId) {
    return {
      short: "State",
      headline: `${unitName} — state view`,
      drillSubtitle: `Filtered to one state within ${unitName}`,
    };
  }
  if (defaultZoneId) {
    return {
      short: "Zonal",
      headline: `${unitName} — zonal view`,
      drillSubtitle: `All states in zone under ${unitName}`,
    };
  }
  return {
    short: "National",
    headline: `${unitName} — unit head overview`,
    drillSubtitle: `Aggregated across all states & zones under ${unitName}`,
  };
}

export function ClickableKpi({
  label, value, icon, onClick, drillable = true,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  onClick?: () => void;
  drillable?: boolean;
}) {
  const Tag = drillable && onClick ? "button" : "div";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Tag
        type={Tag === "button" ? "button" : undefined}
        onClick={onClick}
        className={`rounded-2xl p-4 border bg-white border-[#d4e8dc] text-left w-full ${
          drillable && onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group" : ""
        }`}
      >
        <div className="mb-2">{icon}</div>
        <p className="text-xl font-black text-slate-800">{value}</p>
        <p className="text-[10px] font-semibold text-slate-500 mt-1 leading-tight">{label}</p>
        {drillable && onClick && (
          <p className="text-[9px] text-[#25a872] font-semibold mt-1.5 flex items-center gap-0.5">
            Click to drill down <ChevronRight className="w-3 h-3" />
          </p>
        )}
      </Tag>
    </motion.div>
  );
}

export function DrillHint({ onClick, label = "View details" }: { onClick?: () => void; label?: string }) {
  if (!onClick) return null;
  return (
    <button type="button" onClick={onClick}
      className="text-[10px] font-bold text-[#145c3f] px-2.5 py-1 rounded-lg bg-[#e8f5ee] hover:bg-[#d4e8dc] transition-colors flex items-center gap-1">
      {label} <ChevronRight className="w-3 h-3" />
    </button>
  );
}
