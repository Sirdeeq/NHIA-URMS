import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { stockApi } from "@/lib/api";
import PageLayout from "../../components/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Download, CheckCircle2 } from "lucide-react";
import { isCapitalPrimaryCategory } from "../../lib/storeOptions";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

function verdictLabel(verdict?: string) {
  if (verdict === "VERIFIED_PASSED") return "Verified & Passed";
  if (verdict === "PARTIAL_PASS") return "Partial Pass";
  return verdict || "Failed";
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 mb-1">{label}</p>
      <p className="text-[12px] font-medium text-slate-900 border-b border-slate-300 pb-1.5 min-h-[24px] leading-snug">
        {children || "—"}
      </p>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <h2 className="text-[11px] font-bold text-[#145c3f] border-b border-slate-300 pb-1 mb-2.5">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}

export default function SupplyVerificationDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as any)?.from as string | undefined;
  const justCreated = Boolean((location.state as any)?.justCreated);
  const printRef = useRef<HTMLDivElement>(null);
  const [record, setRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await stockApi.getSupplyVerification(id);
        if (!cancelled) setRecord(res.data || null);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load certificate");
        if (!cancelled) setRecord(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const lineItems: any[] = Array.isArray(record?.lineItems)
    ? record.lineItems
    : record?.suppliedItemName
      ? [
          {
            description: record.suppliedItemName,
            quantityDelivered: record.suppliedQuantity,
            unitPrice: 0,
          },
        ]
      : [];

  const lineTotal = lineItems.reduce(
    (sum, row) => sum + Number(row.quantityDelivered || 0) * Number(row.unitPrice || 0),
    0
  );

  const handleDownload = async () => {
    if (!printRef.current || !record) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const usableW = pageW - margin * 2;
      const imgH = (canvas.height * usableW) / canvas.width;
      let heightLeft = imgH;
      let position = margin;

      pdf.addImage(img, "PNG", margin, position, usableW, imgH);
      heightLeft -= pageH - margin * 2;

      while (heightLeft > 0) {
        position = margin - (imgH - heightLeft);
        pdf.addPage();
        pdf.addImage(img, "PNG", margin, position, usableW, imgH);
        heightLeft -= pageH - margin * 2;
      }

      pdf.save(`${record.supplyRefNo || "supply-certificate"}.pdf`);
      toast.success("Certificate downloaded");
    } catch (err: any) {
      toast.error(err?.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Supply Verification Certificate" description="Loading…">
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading certificate…
        </div>
      </PageLayout>
    );
  }

  if (!record) {
    return (
      <PageLayout
        title="Certificate Not Found"
        description="This supply verification could not be loaded"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => (fromPath ? navigate(fromPath) : navigate(-1))}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to list
          </Button>
        }
      >
        <p className="text-sm text-slate-500">
          No certificate found for reference <span className="font-mono">{id}</span>.
        </p>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Certificate of Completion"
      description={record.supplyRefNo}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => (fromPath ? navigate(fromPath) : navigate(-1))}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
          </Button>
          <Button
            size="sm"
            className="text-xs bg-[#145c3f] hover:bg-[#0f3d2e] text-white"
            disabled={downloading}
            onClick={handleDownload}
          >
            {downloading ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5 mr-1" />
            )}
            Download PDF
          </Button>
          {(record.classification === "ASSET_REGISTER" || isCapitalPrimaryCategory(record.goodsCategory)) && (
            <Button
              size="sm"
              className="text-xs bg-[#145c3f] hover:bg-[#0f3d2e] text-white"
              onClick={() =>
                navigate("/store-management/assets/register", {
                  state: {
                    fromSupplyVerification: record,
                    prefill: {
                      name: lineItems[0]?.description || record.suppliedItemName,
                      primaryCategory: record.goodsCategory,
                      subCategory: record.storeSubcategory,
                      specificType: lineItems[0]?.description || record.suppliedItemName,
                      acquisitionCost: lineItems[0]?.unitPrice,
                      zone_id: record.zone_id,
                      state_id: record.state_id,
                      department_id: record.department_id,
                      unit_id: record.unit_id,
                      zone_name: record.zone_name,
                      state_name: record.state_name,
                      facilitySite: "State Office",
                      specificLocation: record.storeLocation,
                    },
                  },
                })
              }
            >
              Capitalise to Asset Register
            </Button>
          )}
          {record.classification === "STORE_INVENTORY" && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => navigate("/store-management/inventory/items")}
            >
              View Inventory Catalog
            </Button>
          )}
        </div>
      }
    >
      {justCreated && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold text-emerald-900">
            Certificate saved — download PDF when ready.
          </p>
        </div>
      )}

      {/* A4 document surface */}
      <div className="flex justify-center bg-[#e8ebe9] py-6 px-3">
        <div
          id="print-area"
          ref={printRef}
          className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 border border-slate-300"
          style={{
            fontFamily: "Georgia, 'Times New Roman', Times, serif",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div className="px-10 py-9 sm:px-12 sm:py-10">
            {/* Letterhead */}
            <header className="text-center border-b-2 border-[#145c3f] pb-4 mb-5">
              <p
                className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#145c3f]"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                National Health Insurance Authority
              </p>
              <h1 className="mt-2 text-[17px] sm:text-lg font-bold text-slate-900 leading-snug text-balance">
                Stock Verification Certificate of Completion
              </h1>
              <p
                className="mt-1.5 text-[11px] text-slate-600"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                For Supply / Works / Services
              </p>
            </header>

            {/* Meta strip */}
            <div
              className="grid grid-cols-3 gap-4 mb-5 text-[12px] pb-4 border-b border-slate-200"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              <div>
                <p className="text-[9px] uppercase tracking-wide text-slate-500 mb-0.5">Control Number</p>
                <p className="font-mono font-bold text-[#145c3f] text-[13px]">{record.supplyRefNo}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-slate-500 mb-0.5">Certificate Date</p>
                <p className="font-semibold text-slate-900">{record.certificateDate || "—"}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wide text-slate-500 mb-0.5">Verification Status</p>
                <p className="font-semibold text-slate-900">{verdictLabel(record.verdict)}</p>
              </div>
            </div>

            <Section number="1" title="Location">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Zone">{record.zone_name || "—"}</Field>
                <Field label="State">{record.state_name || "—"}</Field>
                <Field label="Department">{record.department_name || "—"}</Field>
                <Field label="Unit">{record.unit_name || "—"}</Field>
              </div>
            </Section>

            <Section number="2" title="Classification">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Nature">{record.supplyNature || "Goods"}</Field>
                <Field label="Primary Category">{record.goodsCategory || "—"}</Field>
                <Field label="Sub Category">{record.storeSubcategory || "—"}</Field>
                <Field label="State office store">{record.storeLocation || record.state_name || "—"}</Field>
                <Field label="Post-Verification Route">
                  {record.classification === "STORE_INVENTORY" ? "Store Inventory" : "Asset Register"}
                </Field>
                <Field label="Approval Status">{record.approvalStatus || "PENDING"}</Field>
              </div>
            </Section>

            <Section number="3" title="Transaction & Contract Details">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Instrument of Procurement">{record.procurementInstrument}</Field>
                <Field label="Procurement Date">{record.procurementDate}</Field>
                <Field label="Purchase Order Reference">{record.purchaseOrderRef}</Field>
                <Field label="Contractor Name">{record.supplierName}</Field>
                <Field label="Contractor Address" className="col-span-2">
                  {record.contractorAddress}
                </Field>
                <Field label="Store Receipt Voucher (SRV) No.">{record.srvNo}</Field>
                <Field label="SRV Date">{record.srvDate}</Field>
              </div>
            </Section>

            <Section number="4" title="Verification & Compliance">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Physical Condition">{record.physicalCondition}</Field>
                <Field label="Verification Verdict">{verdictLabel(record.verdict)}</Field>
                <Field label="Specification Conformity">
                  {record.specificationMatch === false ? "No" : "Yes"}
                </Field>
                <Field label="Price Conformance">
                  {record.priceConformance === false ? "No" : "Yes"}
                </Field>
              </div>
            </Section>

            <Section number="5" title="Line Items / Deliverables">
              <table
                className="w-full text-left text-[11px] border border-slate-300"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-300">
                    <th className="px-2.5 py-2 font-bold text-slate-700">Control No.</th>
                    <th className="px-2.5 py-2 font-bold text-slate-700">Item Description</th>
                    <th className="px-2.5 py-2 font-bold text-slate-700 text-right">Qty</th>
                    <th className="px-2.5 py-2 font-bold text-slate-700 text-right">Unit Price (₦)</th>
                    <th className="px-2.5 py-2 font-bold text-slate-700 text-right">Line Total (₦)</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-2.5 py-3 text-center text-slate-400">
                        No line items recorded
                      </td>
                    </tr>
                  )}
                  {lineItems.map((row, i) => {
                    const qty = Number(row.quantityDelivered || 0);
                    const price = Number(row.unitPrice || 0);
                    return (
                      <tr key={i} className="border-b border-slate-200">
                        <td className="px-2.5 py-2 font-mono text-slate-600">{record.supplyRefNo}</td>
                        <td className="px-2.5 py-2 font-semibold text-slate-900">{row.description}</td>
                        <td className="px-2.5 py-2 text-right font-mono">{qty}</td>
                        <td className="px-2.5 py-2 text-right font-mono">{price.toLocaleString()}</td>
                        <td className="px-2.5 py-2 text-right font-mono font-bold">
                          {(qty * price).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {lineItems.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50">
                      <td colSpan={4} className="px-2.5 py-2 text-right font-bold text-slate-700">
                        Total
                      </td>
                      <td className="px-2.5 py-2 text-right font-mono font-bold text-[#145c3f]">
                        ₦{lineTotal.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </Section>

            <Section number="6" title="Sign-off & Signature Record">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-8">
                <Field label="Verifying Officer">{record.verifiedBy}</Field>
                <Field label="Officer Designation">{record.officerDesignation}</Field>
                <Field label="Sign-off Date">{record.signOffDate}</Field>
                <Field label="Remarks">{record.remarks || "—"}</Field>
              </div>

              <div
                className="grid grid-cols-2 gap-12 mt-2 pt-2"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                <div>
                  <div className="border-b border-slate-800 h-12" />
                  <p className="mt-2 text-[10px] font-semibold text-slate-600">
                    Verifying Officer Signature & Date
                  </p>
                </div>
                <div>
                  <div className="border-b border-slate-800 h-12" />
                  <p className="mt-2 text-[10px] font-semibold text-slate-600">
                    Approving Officer Signature & Date
                  </p>
                </div>
              </div>
            </Section>

            <footer
              className="mt-8 pt-3 border-t border-slate-300 text-center text-[9px] text-slate-500"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              This document is an official NHIA stock verification record.
              Control No. {record.supplyRefNo}.
            </footer>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
