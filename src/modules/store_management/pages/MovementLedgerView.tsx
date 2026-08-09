import React from "react";
import PageLayout from "../components/PageLayout";
import CustomTable, { CustomTableField } from "@/components/CustomTable";

export function MovementLedgerView() {
  const movements = [
    { movementId: "MOV-001", assetRef: "NHIA/HQ/001", from: "HQ Main Office", to: "Kano Zonal Office", date: "2026-02-09", officer: "Musa Ibrahim" },
    { movementId: "MOV-002", assetRef: "NHIA/HQ/002", from: "Store Depot", to: "Room 102", date: "2026-02-08", officer: "Ahmadu Bello" },
  ];

  const fields: CustomTableField[] = [
    { title: "Movement ID", value: "movementId", className: "font-mono font-bold text-slate-800" },
    { title: "Asset Ref", value: "assetRef", className: "font-mono font-bold text-sky-700" },
    { title: "From Location", value: "from" },
    { title: "To Location", value: "to" },
    { title: "Movement Date", value: "date" },
    { title: "Dispatch Officer", value: "officer" },
  ];

  return (
    <PageLayout
      title="Master Asset Movement Ledger"
      description="Historical log of all physical relocations, custodian transfers, and site dispatches"
    >
      <CustomTable data={movements} fields={fields} filter={true} pageSize={10} />
    </PageLayout>
  );
}

export default MovementLedgerView;
