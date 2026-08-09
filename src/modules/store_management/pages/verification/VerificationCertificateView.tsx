import React from "react";
import PageLayout from "../../components/PageLayout";
import CustomTable, { CustomTableField } from "@/components/CustomTable";
import { Badge } from "@/components/ui/badge";

export function VerificationCertificateView() {
  const certs = [
    { certNo: "CERT-2026-001", assetRef: "NHIA/HQ/001", category: "Office Equipment", status: "ISSUED", date: "2026-02-01", verifiedBy: "Auditor John" },
    { certNo: "CERT-2026-002", assetRef: "NHIA/HQ/002", category: "Computer Hardware", status: "ISSUED", date: "2026-02-03", verifiedBy: "Auditor Mary" },
  ];

  const fields: CustomTableField[] = [
    { title: "Cert No", value: "certNo", className: "font-mono font-bold text-slate-800" },
    { title: "Asset Ref", value: "assetRef", className: "font-mono" },
    { title: "Category", value: "category" },
    { title: "Verified By", value: "verifiedBy" },
    { title: "Issued Date", value: "date" },
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
      title="Asset Verification Certificates"
      description="Official clearance and audit certificates issued after physical verification"
    >
      <CustomTable data={certs} fields={fields} filter={true} pageSize={10} />
    </PageLayout>
  );
}

export default VerificationCertificateView;
