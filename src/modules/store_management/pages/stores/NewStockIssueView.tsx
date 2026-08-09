import React, { useState } from "react";
import PageLayout from "../../components/PageLayout";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/src/store/store";
import { addStockIssue } from "@/src/store/slices/storeManagementSlice";
import { useNavigate } from "react-router-dom";
import { Send, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewStockIssueView() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({
    issueNumber: `SIV-${Date.now().toString().slice(-4)}`,
    department: "Finance & Admin",
    recipientName: "",
    issueDate: new Date().toISOString().split("T")[0],
    issuedBy: "Store Officer",
    remarks: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(addStockIssue(formData));
    navigate("/store-management/stores/issues");
  };

  return (
    <PageLayout
      title="New Stock Requisition & Issue Voucher"
      description="Issue store consumables and stationeries to department officers"
      back={true}
      backTo="/store-management/stores/issues"
    >
      <form onSubmit={handleSubmit} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs max-w-2xl">
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Issue Voucher Number</label>
          <input
            type="text"
            required
            value={formData.issueNumber}
            onChange={(e) => setFormData({ ...formData, issueNumber: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Requesting Department *</label>
          <input
            type="text"
            required
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Recipient Name *</label>
          <input
            type="text"
            required
            placeholder="Officer Name"
            value={formData.recipientName}
            onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white font-semibold">
            <Save className="w-4 h-4 mr-1" /> Save Voucher
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}

export default NewStockIssueView;
