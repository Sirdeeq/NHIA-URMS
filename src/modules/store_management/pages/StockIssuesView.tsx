import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/store";
import { fetchStockIssues } from "@/src/store/slices/storeManagementSlice";
import CustomTable, { CustomTableField } from "@/components/CustomTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, Plus, Download } from "lucide-react";
import PageLayout from "../components/PageLayout";

export default function StockIssuesView({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const { stockIssues, loading } = useSelector((s: RootState) => s.storeManagement);

  useEffect(() => {
    dispatch(fetchStockIssues());
  }, [dispatch]);

  const fields: CustomTableField[] = [
    { title: "Voucher No", value: "issueNumber", className: "font-mono font-bold text-slate-800" },
    { title: "Requesting Department", value: "department" },
    { title: "Recipient Officer", value: "recipientName" },
    { title: "Issue Date", value: "issueDate" },
    { title: "Issued By", value: "issuedBy" },
    {
      title: "Status",
      value: "status",
      custom: true,
      component: (item) => (
        <Badge className="bg-[#25a872]/15 text-[#145c3f] border-[#25a872]/30">
          {item.status || "APPROVED"}
        </Badge>
      ),
    },
  ];

  return (
    <PageLayout
      title={
        <span className="flex items-center gap-2">
          <Send className="w-5 h-5 text-[#25a872]" /> Stock Issue Vouchers (SIV)
        </span>
      }
      description="Store requisitions and store stock issue vouchers"
      actions={
        <>
          <Button variant="outline" size="sm" className="text-xs h-9 border-slate-200">
            <Download className="w-4 h-4 mr-1.5" /> Export Issue Log
          </Button>
          <Button size="sm" className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white text-xs h-9 font-semibold">
            <Plus className="w-4 h-4 mr-1.5" /> New Stock Requisition
          </Button>
        </>
      }
    >
      <CustomTable
        data={stockIssues}
        fields={fields}
        filter={true}
        loading={loading}
        pageSize={15}
        message="No stock issue vouchers found"
      />
    </PageLayout>
  );
}
