import React from "react";
import PageLayout from "../../components/PageLayout";
import CustomTable, { CustomTableField } from "@/components/CustomTable";

export function OfficesView() {
  const offices = [
    { code: "OFF-HQ-01", name: "National Headquarters", type: "HQ", location: "Abuja FCT", state: "FCT" },
    { code: "OFF-ZO-01", name: "South West Zonal Office", type: "ZONAL_OFFICE", location: "Lagos State", state: "Lagos" },
    { code: "OFF-SO-01", name: "Kano State Office", type: "STATE_OFFICE", location: "Kano State", state: "Kano" },
  ];

  const fields: CustomTableField[] = [
    { title: "Office Code", value: "code", className: "font-mono font-bold text-slate-800" },
    { title: "Office Name", value: "name" },
    { title: "Office Type", value: "type" },
    { title: "Physical Location", value: "location" },
    { title: "State", value: "state" },
  ];

  return (
    <PageLayout
      title="NHIA Offices & Operating Locations"
      description="Registered headquarters, zonal offices, state offices, and field centers"
    >
      <CustomTable data={offices} fields={fields} filter={true} pageSize={10} />
    </PageLayout>
  );
}

export default OfficesView;
