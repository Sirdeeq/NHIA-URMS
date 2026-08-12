import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { stockApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import PageLayout from "@/components/PageLayout";

export default function PhysicalAssetVerificationDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [record, setRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await stockApi.getPhysicalVerification(id);
        if (!cancelled) setRecord(res.data || null);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load verification");
        if (!cancelled) setRecord(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const items: any[] = Array.isArray(record?.items) ? record.items : [];
  const exceptions = items.filter(
    (i) => Number(i.variance || 0) !== 0 || String(i.condition).toUpperCase() === "MISSING"
  );

  const handlePrint = () => window.print();

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
      const margin = 10;
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
      pdf.save(`${record.referenceNo || "physical-verification"}.pdf`);
      toast.success("Downloaded");
    } catch (err: any) {
      toast.error(err?.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const approve = async () => {
    if (!record?.id) return;
    setApproving(true);
    try {
      const res = await stockApi.updatePhysicalVerification(record.id, { status: "APPROVED" });
      setRecord(res.data);
      toast.success("Verification approved");
    } catch (err: any) {
      toast.error(err?.message || "Approve failed");
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Physical Verification" description="Loading…">
        <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
        </div>
      </PageLayout>
    );
  }

  if (!record) {
    return (
      <PageLayout
        title="Not found"
        description="Physical verification could not be loaded"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/store-management/verification/verify")}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
          </Button>
        }
      >
        <p className="text-sm text-slate-600">No record for {id}.</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Physical Verification Report"
      description={record.referenceNo}
      actions={
        <div className="flex gap-2 no-print">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/store-management/verification/verify")}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
          </Button>
          <Button variant="outline" size="sm" className="text-xs" disabled={downloading} onClick={handleDownload}>
            {downloading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1" />}
            Download PDF
          </Button>
          <Button size="sm" className="text-xs bg-[#145c3f] hover:bg-[#0f3d2e] text-white" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5 mr-1" /> Print
          </Button>
          {record.status === "SUBMITTED" && (
            <Button size="sm" variant="outline" className="text-xs" disabled={approving} onClick={approve}>
              {approving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
              Approve
            </Button>
          )}
        </div>
      }
    >
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex justify-center bg-slate-100/80 py-6 print:bg-white print:py-0">
        <div
          id="print-area"
          ref={printRef}
          className="w-full max-w-[210mm] bg-white border border-slate-200 shadow-sm print:shadow-none print:border-0"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          <div className="px-10 py-9">
            <header className="text-center border-b-2 border-[#145c3f] pb-4 mb-5">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#145c3f]" style={{ fontFamily: "system-ui, sans-serif" }}>
                National Health Insurance Authority
              </p>
              <h1 className="mt-2 text-lg font-bold">Physical Asset Verification Report</h1>
              <p className="mt-1 text-[11px] text-slate-600" style={{ fontFamily: "system-ui, sans-serif" }}>
                Master Register stocktaking
              </p>
            </header>

            <div className="grid grid-cols-2 gap-3 mb-5 text-[12px]" style={{ fontFamily: "system-ui, sans-serif" }}>
              <p><span className="text-slate-500">Reference: </span><span className="font-mono font-bold text-[#145c3f]">{record.referenceNo}</span></p>
              <p><span className="text-slate-500">Date: </span><span className="font-semibold">{record.verificationDate || "—"}</span></p>
              <p><span className="text-slate-500">Type: </span><span className="capitalize font-semibold">{record.stocktakingType}</span></p>
              <p><span className="text-slate-500">Status: </span><span className="font-semibold">{record.status}</span></p>
              <p><span className="text-slate-500">Zone: </span><span className="font-semibold">{record.zone_name || "—"}</span></p>
              <p><span className="text-slate-500">State: </span><span className="font-semibold">{record.state_name || "—"}</span></p>
              <p><span className="text-slate-500">Department: </span><span className="font-semibold">{record.department_name || "—"}</span></p>
              <p><span className="text-slate-500">Unit: </span><span className="font-semibold">{record.unit_name || "—"}</span></p>
            </div>

            <table className="w-full text-left text-[11px] border border-slate-300 mb-5" style={{ fontFamily: "system-ui, sans-serif" }}>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-300">
                  <th className="p-2">Tag</th>
                  <th className="p-2">Asset</th>
                  <th className="p-2 text-right">Book</th>
                  <th className="p-2 text-right">Physical</th>
                  <th className="p-2 text-right">Var</th>
                  <th className="p-2">Condition</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-b border-slate-200">
                    <td className="p-2 font-mono">{row.assetNumber}</td>
                    <td className="p-2 font-semibold">{row.assetName}</td>
                    <td className="p-2 text-right font-mono">{row.bookBalance}</td>
                    <td className="p-2 text-right font-mono">{row.physicalCount}</td>
                    <td className="p-2 text-right font-mono font-bold">{row.variance}</td>
                    <td className="p-2">{row.condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-[12px] mb-6" style={{ fontFamily: "system-ui, sans-serif" }}>
              Counted: <strong>{items.length}</strong> · Exceptions: <strong>{exceptions.length}</strong>
            </p>

            <div className="grid grid-cols-2 gap-10 text-[11px]" style={{ fontFamily: "system-ui, sans-serif" }}>
              <div>
                <p className="font-semibold mb-6">{record.storeKeeper || "—"}</p>
                <div className="border-b border-slate-800 h-8" />
                <p className="mt-2 text-slate-600">Store Keeper / Verifying Officer</p>
              </div>
              <div>
                <p className="font-semibold mb-6">{record.auditOfficer || "—"}</p>
                <div className="border-b border-slate-800 h-8" />
                <p className="mt-2 text-slate-600">Audit Officer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
