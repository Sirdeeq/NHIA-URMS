import React from "react";
import PageLayout from "../components/PageLayout";
import CustomTable, { CustomTableField } from "@/components/CustomTable";

export function AssetConversionView() {
  const conversions = [
    { refNo: "CONV-001", grnRef: "GRN-2026-004", item: "Dell PowerEdge Server Rack", qtyConverted: 2, convertedTo: "ASSET_REGISTER", date: "2026-02-02" },
  ];

  const fields: CustomTableField[] = [
    { title: "Conversion Ref", value: "refNo", className: "font-mono font-bold text-slate-800" },
    { title: "GRN Source Ref", value: "grnRef", className: "font-mono" },
    { title: "Item Name", value: "item" },
    { title: "Qty Converted", value: "qtyConverted", className: "text-right font-bold" },
    { title: "Target Register", value: "convertedTo" },
    { title: "Conversion Date", value: "date" },
  ];

  return (
    <PageLayout
      title="Store Stock to Capital Asset Conversion"
      description="Conversion of pre-verified delivered inventory into capital asset master register"
    >
      <CustomTable data={conversions} fields={fields} filter={true} pageSize={10} />
    </PageLayout>
  );
}

export default AssetConversionView;
