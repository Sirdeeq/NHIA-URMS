import React from "react";
import PageLayout from "../components/PageLayout";
import CustomTable, { CustomTableField } from "@/components/CustomTable";

export function AdjustmentsView() {
  const adjustments = [
    { adjNo: "ADJ-001", item: "A4 Printing Paper", type: "WRITE_OFF", qty: 2, reason: "Damaged during water leak", date: "2026-02-01", approvedBy: "Store Manager" },
    { adjNo: "ADJ-002", item: "Stapler Heavy Duty", type: "FOUND_STOCK", qty: 1, reason: "Surplus during audit count", date: "2026-02-04", approvedBy: "Auditor John" },
  ];

  const fields: CustomTableField[] = [
    { title: "Adjustment Ref", value: "adjNo", className: "font-mono font-bold text-slate-800" },
    { title: "Stock Item", value: "item" },
    { title: "Adjustment Type", value: "type" },
    { title: "Qty Adjusted", value: "qty", className: "text-right font-bold" },
    { title: "Reason", value: "reason" },
    { title: "Approved By", value: "approvedBy" },
    { title: "Date", value: "date" },
  ];

  return (
    <PageLayout
      title="Store Stock Adjustments & Reconciliations"
      description="Stock write-offs, audit findings reconciliation, and inventory quantity corrections"
    >
      <CustomTable data={adjustments} fields={fields} filter={true} pageSize={10} />
    </PageLayout>
  );
}

export default AdjustmentsView;
