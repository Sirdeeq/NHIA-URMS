import React from "react";
import PageLayout from "../components/PageLayout";
import CustomTable, { CustomTableField } from "@/components/CustomTable";

export function CategoriesView() {
  const categories = [
    { code: "CAT-01", name: "Land & Buildings", subcategories: "3 Sub-categories", count: 12 },
    { code: "CAT-02", name: "Office Furniture & Fittings", subcategories: "5 Sub-categories", count: 310 },
    { code: "CAT-03", name: "Computer Equipment", subcategories: "8 Sub-categories", count: 420 },
    { code: "CAT-04", name: "Plant & Machinery", subcategories: "4 Sub-categories", count: 45 },
    { code: "CAT-05", name: "Motor Vehicles", subcategories: "2 Sub-categories", count: 28 },
  ];

  const fields: CustomTableField[] = [
    { title: "Category Code", value: "code", className: "font-mono font-bold text-slate-800" },
    { title: "Major Category Name", value: "name" },
    { title: "Sub-Categories", value: "subcategories" },
    { title: "Registered Items Count", value: "count", className: "text-right font-bold" },
  ];

  return (
    <PageLayout
      title="Asset Categories & Sub-Categories"
      description="IPSAS 31 compliant public sector asset categorization ledger"
    >
      <CustomTable data={categories} fields={fields} filter={true} pageSize={10} />
    </PageLayout>
  );
}

export default CategoriesView;
