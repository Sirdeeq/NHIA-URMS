import React from "react";
import PageLayout from "../../components/PageLayout";
import CustomTable, { CustomTableField } from "@/components/CustomTable";
import { Badge } from "@/components/ui/badge";

export function UserManagementView() {
  const users = [
    { staffId: "NHIA-001", name: "Ahmadu Bello", role: "Store Officer", office: "HQ Main Office", status: "ACTIVE" },
    { staffId: "NHIA-002", name: "Funke Adebayo", role: "Zonal Auditor", office: "Lagos Zonal Office", status: "ACTIVE" },
  ];

  const fields: CustomTableField[] = [
    { title: "Staff ID", value: "staffId", className: "font-mono font-bold text-slate-800" },
    { title: "Full Name", value: "name" },
    { title: "Assigned Role", value: "role" },
    { title: "Assigned Office", value: "office" },
    {
      title: "Status",
      value: "status",
      custom: true,
      component: (item) => (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
          {item.status}
        </Badge>
      ),
    },
  ];

  return (
    <PageLayout
      title="Asset Management (SVO) User Permissions"
      description="Configure role-based access for store officers, auditors, and custodians"
    >
      <CustomTable data={users} fields={fields} filter={true} pageSize={10} />
    </PageLayout>
  );
}

export default UserManagementView;
