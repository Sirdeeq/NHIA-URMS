import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { stockApi } from "@/lib/api";
import CustomTable, { CustomTableField } from "@/components/CustomTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PackageCheck, Plus, Download, Eye } from "lucide-react";
import PageLayout from "../components/PageLayout";
import ListSearchBar from "../components/ListSearchBar";

export default function SupplyVerificationView({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await stockApi.getSupplyVerifications();
        if (!cancelled) {
          setVerifications(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error("Failed to load supply verifications:", err);
        if (!cancelled) setVerifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return verifications;
    return verifications.filter((v) =>
      [v.supplyRefNo, v.supplierName, v.goodsCategory, v.storeSubcategory, v.suppliedItemName, v.storeLocation, v.verdict]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [verifications, q]);

  const openCertificate = (item: any) => {
    navigate(`/store-management/verification/supply/${item.id}`, {
      state: { from: "/store-management/verification/supply" },
    });
  };

  const fields: CustomTableField[] = [
    { title: "Control No.", value: "supplyRefNo", className: "font-mono font-bold text-slate-800" },
    { title: "Supplier", value: "supplierName" },
    { title: "Major Category", value: "goodsCategory" },
    { title: "Subcategory", value: "storeSubcategory" },
    { title: "Item", value: "suppliedItemName" },
    { title: "Qty", value: "suppliedQuantity", className: "text-right font-bold" },
    { title: "State Store", value: "storeLocation" },
    {
      title: "Route",
      value: "classification",
      custom: true,
      component: (item) => (
        <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px]">
          {item.classification === "STORE_INVENTORY" ? "Store Inventory" : "Asset Register"}
        </Badge>
      ),
    },
    {
      title: "Verdict",
      value: "verdict",
      custom: true,
      component: (item) => (
        <Badge
          className={
            item.verdict === "VERIFIED_PASSED"
              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
              : item.verdict === "PARTIAL_PASS"
                ? "bg-amber-100 text-amber-800 border-amber-200"
                : "bg-rose-100 text-rose-800 border-rose-200"
          }
        >
          {item.verdict === "VERIFIED_PASSED"
            ? "Passed"
            : item.verdict === "PARTIAL_PASS"
              ? "Partial"
              : item.verdict || "Failed"}
        </Badge>
      ),
    },
    {
      title: "Certificate",
      value: "id",
      custom: true,
      component: (item) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-[10px] font-bold"
          onClick={(e) => {
            e.stopPropagation();
            openCertificate(item);
          }}
        >
          <Eye className="h-3 w-3 mr-1" /> View
        </Button>
      ),
    },
  ];

  return (
    <PageLayout
      title={
        <span className="flex items-center gap-2">
          <PackageCheck className="w-5 h-5 text-[#25a872]" /> Verification of Supply
        </span>
      }
      description="Inspection certificates — open a row to view full certificate details"
      actions={
        <>
          <Button variant="outline" size="sm" className="text-xs h-9 border-slate-200">
            <Download className="w-4 h-4 mr-1.5" /> Export Log
          </Button>
          <Button
            size="sm"
            className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white text-xs h-9 font-semibold"
            onClick={() => {
              if (onNavigate) onNavigate("store-supply-verification-new");
              else navigate("/store-management/verification/supply/new", {
                state: { from: "/store-management/verification/supply" },
              });
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Verification Certificate
          </Button>
        </>
      }
    >
      <ListSearchBar
        value={q}
        onChange={(v) => {
          const next = new URLSearchParams(searchParams);
          if (v) next.set("q", v); else next.delete("q");
          setSearchParams(next, { replace: true });
        }}
        placeholder="Search control no, supplier, item, store…"
        id="supply-search"
      />
      <CustomTable
        data={filtered}
        fields={fields}
        filter={false}
        loading={loading}
        pageSize={15}
        message="No supply verification records found"
      />
    </PageLayout>
  );
}
