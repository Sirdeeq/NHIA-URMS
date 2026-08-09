import React from "react";
import PageLayout from "../../components/PageLayout";
import CustomTable, { CustomTableField } from "@/components/CustomTable";

export function AuditView() {
  const auditLogs = [
    { id: "LOG-1001", action: "ASSET_REGISTERED", entity: "StoreAsset", performedBy: "Musa Ibrahim", timestamp: "2026-02-09 10:15", details: "Registered HP LaserJet Printer" },
    { id: "LOG-1002", action: "TRANSFER_INITIATED", entity: "AssetTransfer", performedBy: "Ahmadu Bello", timestamp: "2026-02-09 11:20", details: "Transfer to Kano Zonal Office" },
  ];

  const fields: CustomTableField[] = [
    { title: "Log ID", value: "id", className: "font-mono font-bold text-slate-800" },
    { title: "Action", value: "action", className: "font-bold text-sky-700" },
    { title: "Target Entity", value: "entity" },
    { title: "Performed By", value: "performedBy" },
    { title: "Timestamp", value: "timestamp", className: "font-mono" },
    { title: "Audit Details", value: "details" },
  ];

  return (
    <PageLayout
      title="System Audit Trail & Security Logs"
      description="Immutable security log of asset transfers, verifications, and store movements"
    >
      <CustomTable data={auditLogs} fields={fields} filter={true} pageSize={10} />
    </PageLayout>
  );
}

export default AuditView;
