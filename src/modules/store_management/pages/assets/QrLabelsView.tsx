import React from "react";
import PageLayout from "../../components/PageLayout";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { QrCode, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QrLabelsView() {
  const { assets } = useSelector((s: RootState) => s.asset);

  return (
    <PageLayout
      title="Asset QR Code & Barcode Labels"
      description="Printable barcode and QR audit tags for physical asset verification"
      actions={
        <Button onClick={() => window.print()} className="bg-sky-600 hover:bg-sky-700 text-white text-xs h-8 font-semibold">
          <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Sheet
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-2">
        {assets.map((asset: any) => (
          <div key={asset.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900">{asset.name}</p>
              <p className="font-mono text-[11px] font-bold text-sky-700">{asset.assetNumber}</p>
              <p className="text-[10px] text-slate-500">{asset.department || "Admin"}</p>
            </div>
            <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 shrink-0">
              <QrCode className="h-10 w-10 text-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

export default QrLabelsView;
