import * as React from "react";
import {
  ArrowLeft, Plus, RefreshCw, Eye, Loader2,
  FileText, CheckCircle2, Send, X, XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { monthlyApi, type MonthlyDept } from "@/lib/api";
import { MONTHS, YEARS } from "./MonthlyFormShell";

// ─── Status config ────────────────────────────────────────────────────────────

const SC = {
  draft:     { label: "Draft",     cls: "bg-slate-100 text-slate-600 border-slate-200",       icon: <FileText className="w-3 h-3" /> },
  submitted: { label: "Submitted", cls: "bg-blue-100 text-blue-700 border-blue-200",          icon: <Send className="w-3 h-3" /> },
  approved:  { label: "Approved",  cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
};

function safeDate(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
}

function naira(v: any) {
  if (!v || Number(v) === 0) return "—";
  return `₦ ${Number(v).toLocaleString()}`;
}

function num(v: any) {
  if (!v || Number(v) === 0) return "—";
  return Number(v).toLocaleString();
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-slate-800">{value || "—"}</span>
    </div>
  );
}

function DetailPanel({ record, onClose }: { record: any; onClose: () => void }) {
  const sc = SC[record.status as keyof typeof SC] ?? SC.draft;
  const monthName = MONTHS.find(m => m.v === String(record.reporting_month))?.l ?? String(record.reporting_month);

  // Build field list dynamically from the record — skip meta fields
  const SKIP = new Set(["id","reference_id","state_id","reporting_year","reporting_month","submitted_by","status","section","createdAt","updatedAt","created_at","updated_at","state"]);
  const LABELS: Record<string, string> = {
    staff_no: "Staff No.", total_vehicles: "Total Vehicles",
    approved_budget: "Approved Budget (₦)", total_amount_utilized: "Total Amount Utilized (₦)",
    igr_amount: "IGR Amount (₦)",
    total_indebtedness: "Total Indebtedness (₦)", amount_recovered: "Amount Recovered (₦)",
    reconciliation_meetings: "Reconciliation Meetings",
    gifship_enrolments: "GIFSHIP Enrolments", gifship_premium: "Premium on GIFSHIP (₦)",
    ops_count: "OPS", fsship_new_enrolments: "New Enrolments / Mop-up (FSSHIP)",
    extra_dependants: "Extra Dependants", extra_dependant_premium: "Premium on Extra-Dependant (₦)",
    additional_dependants: "Additional Dependants", change_of_provider: "Change of Provider",
    bhcpf_beneficiaries: "BHCPF Beneficiaries", bhcpf_facilities: "BHCPF Accredited Facilities",
    tiship_lives: "TISHIP Lives", mha_lives: "MHA Lives", sshia_lives: "SSHIA Lives",
    stakeholder_meetings: "Stakeholder Meetings", media_appearances: "Media Appearances",
    marketing_sensitization: "Marketing / Sensitization Events",
    total_hcf_under_nhia: "Total HCF Under NHIA", total_accredited_hcf: "Total Accredited HCFs",
    cemonc_accredited_hcf: "Accredited CEmONC HCFs", cemonc_beneficiaries: "CEmONC Beneficiaries",
    ffp_accredited_facilities: "Accredited FFP Facilities", ffp_beneficiaries: "FFP Beneficiaries",
    qa_conducted: "QA Conducted (HCFs)", accreditation_requests: "Accreditation Requests",
    accreditation_conducted: "Accreditation Conducted",
    mystery_shopping_visited: "Mystery Shopping — Visited", mystery_shopping_complied: "Mystery Shopping — Complied",
    mystery_shopping_non_complied: "Mystery Shopping — Non-Complied",
    complaints_registered: "Complaints Registered", complaints_resolved: "Complaints Resolved",
    complaints_escalated: "Complaints Escalated",
  };
  const NAIRA_FIELDS = new Set(["approved_budget","total_amount_utilized","igr_amount","total_indebtedness","amount_recovered","gifship_premium","extra_dependant_premium"]);

  const dataFields = Object.keys(record).filter(k => !SKIP.has(k));

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
    >
      {/* Panel header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="font-mono text-sm font-bold text-primary">{record.reference_id}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {record.state?.description ?? `State ${record.state_id}`} · {monthName} {record.reporting_year}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-[10px] px-2 py-0.5 flex items-center gap-1 border ${sc.cls}`}>
            {sc.icon} {sc.label}
          </Badge>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-6 py-4">
        {/* Meta */}
        <div className="space-y-0 mb-4">
          <DetailRow label="Submitted By" value={record.submitted_by ?? "—"} />
          <DetailRow label="Date Submitted" value={safeDate(record.createdAt)} />
          <DetailRow label="Last Updated" value={safeDate(record.updatedAt)} />
        </div>

        <Separator className="my-3" />

        {/* Data fields */}
        <div className="space-y-0">
          {dataFields.map(k => {
            const label = LABELS[k] ?? k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
            const raw = record[k];
            const value = NAIRA_FIELDS.has(k) ? naira(raw) : num(raw);
            return <DetailRow key={k} label={label} value={value} />;
          })}
        </div>
      </ScrollArea>
    </motion.div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  dept: MonthlyDept;
  title: string;
  section: string;
  onBack: () => void;
  defaultStateId?: string | null;
  defaultZoneId?:  string | null;
  FormComponent: React.ComponentType<{
    onBack: () => void;
    defaultZoneId?:  string | null;
    defaultStateId?: string | null;
    onSubmitted?: () => void;
  }>;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DeptMonthlyPage({ dept, title, section, onBack, defaultStateId, defaultZoneId, FormComponent }: Props) {
  const [mode,       setMode]       = React.useState<"list" | "form">("list");
  const [records,    setRecords]    = React.useState<any[]>([]);
  const [loading,    setLoading]    = React.useState(true);
  const [selected,   setSelected]   = React.useState<any | null>(null);

  // Filters
  const [filterYear,  setFilterYear]  = React.useState("all");
  const [filterMonth, setFilterMonth] = React.useState("all");
  const [filterStatus,setFilterStatus]= React.useState("all");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await monthlyApi[dept].list({
        state_id: defaultStateId ?? undefined,
        section,
        year:   filterYear   !== "all" ? filterYear   : undefined,
        month:  filterMonth  !== "all" ? filterMonth  : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      });
      setRecords(res.data);
    } catch (err: any) {
      toast.error("Failed to load reports", { description: err.message });
    } finally { setLoading(false); }
  }, [dept, section, defaultStateId, filterYear, filterMonth, filterStatus]);

  React.useEffect(() => { load(); }, [load]);

  const counts = React.useMemo(() => ({
    total:     records.length,
    draft:     records.filter(r => r.status === "draft").length,
    submitted: records.filter(r => r.status === "submitted").length,
    approved:  records.filter(r => r.status === "approved").length,
  }), [records]);

  const hasFilters = filterYear !== "all" || filterMonth !== "all" || filterStatus !== "all";

  // ── List view ──────────────────────────────────────────────────────────────
  if (mode === "list") {
    return (
      <>
        <div className="flex flex-col h-full bg-slate-50/30">
          {/* Header */}
          <div className="bg-white border-b border-border/50 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                <p className="text-xs text-muted-foreground">Monthly submissions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
              </Button>
              <Button className="bg-orange-action hover:bg-orange-600 gap-2 shadow-lg shadow-orange-500/20"
                onClick={() => setMode("form")}>
                <Plus className="w-4 h-4" /> New Report
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="max-w-6xl mx-auto p-8 space-y-6">

              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total",     value: counts.total,     color: "bg-slate-50 border-slate-200",     text: "text-slate-700"  },
                  { label: "Draft",     value: counts.draft,     color: "bg-slate-50 border-slate-200",     text: "text-slate-500"  },
                  { label: "Submitted", value: counts.submitted, color: "bg-blue-50 border-blue-200",       text: "text-blue-700"   },
                  { label: "Approved",  value: counts.approved,  color: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
                ].map(c => (
                  <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl p-5 border ${c.color}`}>
                    <p className={`text-3xl font-black ${c.text}`}>{c.value}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-1">{c.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Filters */}
              <div className="flex flex-row gap-3 items-center bg-white rounded-2xl border border-[#d4e8dc] px-5 py-4">
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="flex-1 min-w-0"
                    displayValue={filterYear === "all" ? "All Years" : filterYear}>
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="flex-1 min-w-0"
                    displayValue={filterMonth === "all" ? "All Months" : (MONTHS.find(m => m.v === filterMonth)?.l ?? filterMonth)}>
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {MONTHS.map(m => <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="flex-1 min-w-0"
                    displayValue={filterStatus === "all" ? "All Statuses" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>

                {hasFilters && (
                  <Button variant="ghost" size="sm" className="text-slate-500 gap-1 shrink-0"
                    onClick={() => { setFilterYear("all"); setFilterMonth("all"); setFilterStatus("all"); }}>
                    <XCircle className="w-3.5 h-3.5" /> Clear
                  </Button>
                )}
              </div>

              {/* Table */}
              <Card className="rounded-2xl border-[#d4e8dc] shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-[#d4e8dc]">
                  <CardTitle className="text-sm font-bold">
                    {loading ? "Loading..." : `${records.length} report${records.length !== 1 ? "s" : ""}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Loading reports...</span>
                    </div>
                  ) : records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                      <FileText className="w-10 h-10 opacity-30" />
                      <p className="text-sm font-medium">{hasFilters ? "No reports match your filters" : "No reports yet"}</p>
                      {!hasFilters && (
                        <Button variant="outline" size="sm" onClick={() => setMode("form")} className="mt-2 gap-2">
                          <Plus className="w-4 h-4" /> New Report
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#f0fdf7] hover:bg-[#f0fdf7]">
                          <TableHead className="text-xs font-bold text-slate-600">Reference</TableHead>
                          <TableHead className="text-xs font-bold text-slate-600">State</TableHead>
                          <TableHead className="text-xs font-bold text-slate-600">Year</TableHead>
                          <TableHead className="text-xs font-bold text-slate-600">Month</TableHead>
                          <TableHead className="text-xs font-bold text-slate-600">Submitted By</TableHead>
                          <TableHead className="text-xs font-bold text-slate-600">Date</TableHead>
                          <TableHead className="text-xs font-bold text-slate-600">Status</TableHead>
                          <TableHead className="text-right text-xs font-bold text-slate-600">View</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.map((r, i) => {
                          const sc = SC[r.status as keyof typeof SC] ?? SC.draft;
                          const monthName = MONTHS.find(m => m.v === String(r.reporting_month))?.l ?? String(r.reporting_month);
                          return (
                            <motion.tr key={r.id}
                              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className="hover:bg-[#f8fdfb] transition-colors border-b border-slate-100 last:border-0">
                              <TableCell>
                                <span className="font-mono text-xs font-bold text-primary">{r.reference_id}</span>
                              </TableCell>
                              <TableCell className="text-sm font-semibold text-slate-800">
                                {r.state?.description ?? `State ${r.state_id}`}
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">{r.reporting_year}</TableCell>
                              <TableCell className="text-sm text-slate-600">{monthName}</TableCell>
                              <TableCell className="text-sm text-slate-500">{r.submitted_by ?? "—"}</TableCell>
                              <TableCell className="text-xs text-slate-400">{safeDate(r.createdAt)}</TableCell>
                              <TableCell>
                                <Badge className={`text-[10px] px-2 py-0.5 flex items-center gap-1 w-fit border ${sc.cls}`}>
                                  {sc.icon} {sc.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm"
                                  className="h-7 w-7 p-0 text-slate-400 hover:text-primary hover:bg-primary/10"
                                  onClick={() => setSelected(r)}>
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

            </div>
          </ScrollArea>
        </div>

        {/* Detail slide-over */}
        <AnimatePresence>
          {selected && (
            <>
              {/* Backdrop */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelected(null)} />
              <DetailPanel record={selected} onClose={() => setSelected(null)} />
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // ── Form view ──────────────────────────────────────────────────────────────
  return (
    <AnimatePresence mode="wait">
      <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
        <FormComponent
          onBack={() => setMode("list")}
          defaultZoneId={defaultZoneId}
          defaultStateId={defaultStateId}
          onSubmitted={() => { setMode("list"); load(); }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
