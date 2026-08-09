import React from "react";
import PageLayout from "../../components/PageLayout";
import CustomTable, { CustomTableField } from "@/components/CustomTable";
import { Badge } from "@/components/ui/badge";

export function ExceptionsView() {
  const exceptions = [
    { expNo: "EXP-2026-001", type: "LOCATION_MISMATCH", expected: "Room 102", found: "Room 304", status: "OPEN", date: "2026-02-05" },
    { expNo: "EXP-2026-002", type: "CUSTODIAN_MISMATCH", expected: "Mr. Adams", found: "Mrs. Okon", status: "INVESTIGATING", date: "2026-02-06" },
  ];

  const fields: CustomTableField[] = [
    { title: "Exception No", value: "expNo", className: "font-mono font-bold text-slate-800" },
    { title: "Discrepancy Type", value: "type" },
    { title: "Expected Value", value: "expected" },
    { title: "Found Value", value: "found" },
    { title: "Flagged Date", value: "date" },
    {
      title: "Resolution Status",
      value: "status",
      custom: true,
      component: (item) => (
        <Badge className={item.status === "OPEN" ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-amber-100 text-amber-800 border-amber-200"}>
          {item.status}
        </Badge>
      ),
    },
  ];

  return (
    <PageLayout
      title="Discrepancy Exceptions & Audit Flags"
      description="Exception logs for unlocated assets, location mismatches, and custodian variances"
    >
      <CustomTable data={exceptions} fields={fields} filter={true} pageSize={10} />
    </PageLayout>
  );
}

export default ExceptionsView;
