import * as React from "react";
import {
  ArrowLeft, Plus, Search,
  RefreshCw, FileText, Eye,
  ChevronRight, Loader2,
  CheckCircle2, Clock, XCircle, Send
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { annualReportApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Report {
  reference_id: string;
  reporting_year: number;
  state: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  submitted_by: string | null;
  updated_by: string | null;
  approved_budget: string | null;
  total_amount_utilized: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AnnualReportsListProps {
  onBack: () => void;
  onNewReport: () => void;
  onViewReport: (referenceId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<Report["status"], { label: string; className: string; icon: React.ReactNode }> = {
  draft:        { label: "Draft",        className: "bg-slate-100 text-slate-600 border-slate-200",   icon: <FileText className="w-3 h-3" /> },
  submitted:    { label: "Submitted",    className: "bg-blue-100 text-blue-700 border-blue-200",      icon: <Send className="w-3 h-3" /> },
  under_review: { label: "Under Review", className: "bg-amber-100 text-amber-700 border-amber-200",   icon: <Clock className="w-3 h-3" /> },
  approved:     { label: "Approved",     className: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected:     { label: "Rejected",     className: "bg-rose-100 text-rose-700 border-rose-200",      icon: <XCircle className="w-3 h-3" /> },
};

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

const YEARS = ["2025","2024","2023","2022"];

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NG", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatNaira(val: string | null) {
  if (!val) return "—";
  return `N ${Number(val).toLocaleString()}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnnualReportsList({ onBack, onNewReport, onViewReport }: AnnualReportsListProps) {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [search, setSearch] = React.useState("");
  const [filterYear, setFilterYear] = React.useState("all");
  const [filterState, setFilterState] = React.useState("all");
  const [filterStatus, setFilterStatus] = React.useState("all");

  const fetchReports = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await annualReportApi.list({
        year: filterYear !== "all" ? filterYear : undefined,
        state: filterState !== "all" ? filterState : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      });
      setReports(res.data as Report[]);
    } catch (err: any) {
      toast.error("Failed to load reports", { description: err.message });
    } finally {
      setLoading(false);
    }
  }, [filterYear, filterState, filterStatus]);

  React.useEffect(() => { fetchReports(); }, [fetchReports]);

  // Client-side search filter on top of server filters
  const filtered = reports.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.reference_id.toLowerCase().includes(q) ||
      r.state.toLowerCase().includes(q) ||
      String(r.reporting_year).includes(q)
    );
  });

  // Summary counts
  const counts = React.useMemo(() => ({
    total:       reports.length,
    submitted:   reports.filter(r => r.status === "submitted").length,
    under_review:reports.filter(r => r.status === "under_review").length,
    approved:    reports.filter(r => r.status === "approved").length,
    draft:       reports.filter(r => r.status === "draft").length,
  }), [reports]);

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      {/* Header */}
      <div className="bg-white border-b border-border/50 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Annual Reports</h2>
            <p className="text-xs text-muted-foreground">All submitted annual state reports</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            className="bg-orange-action hover:bg-orange-600 gap-2 shadow-lg shadow-orange-500/20"
            onClick={onNewReport}
          >
            <Plus className="w-4 h-4" /> New Report
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-7xl mx-auto p-8 space-y-6">

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Reports",  value: counts.total,        color: "bg-slate-50 border-slate-200",     text: "text-slate-700" },
              { label: "Submitted",      value: counts.submitted,    color: "bg-blue-50 border-blue-200",       text: "text-blue-700"  },
              { label: "Under Review",   value: counts.under_review, color: "bg-amber-50 border-amber-200",     text: "text-amber-700" },
              { label: "Approved",       value: counts.approved,     color: "bg-emerald-50 border-emerald-200", text: "text-emerald-700"},
            ].map(c => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-5 border ${c.color}`}
              >
                <p className={`text-3xl font-black ${c.text}`}>{c.value}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">{c.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <Card className="rounded-2xl border-[#d4e8dc]">
            <CardContent className="pt-5 pb-4">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by reference, state..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-[130px]"><SelectValue placeholder="Year" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="State" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {NIGERIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                {(filterYear !== "all" || filterState !== "all" || filterStatus !== "all" || search) && (
                  <Button variant="ghost" size="sm" className="text-slate-500 gap-1"
                    onClick={() => { setFilterYear("all"); setFilterState("all"); setFilterStatus("all"); setSearch(""); }}>
                    <XCircle className="w-3.5 h-3.5" /> Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="rounded-2xl border-[#d4e8dc] shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#d4e8dc]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">
                  {loading ? "Loading..." : `${filtered.length} report${filtered.length !== 1 ? "s" : ""} found`}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm">Loading reports...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                  <FileText className="w-10 h-10 opacity-30" />
                  <p className="text-sm font-medium">No reports found</p>
                  <p className="text-xs">Try adjusting your filters or submit a new report</p>
                  <Button variant="outline" size="sm" onClick={onNewReport} className="mt-2 gap-2">
                    <Plus className="w-4 h-4" /> New Report
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#f0fdf7] hover:bg-[#f0fdf7]">
                      <TableHead className="text-xs font-bold text-slate-600">Reference ID</TableHead>
                      <TableHead className="text-xs font-bold text-slate-600">State</TableHead>
                      <TableHead className="text-xs font-bold text-slate-600">Year</TableHead>
                      <TableHead className="text-xs font-bold text-slate-600">Approved Budget</TableHead>
                      <TableHead className="text-xs font-bold text-slate-600">Amount Utilized</TableHead>
                      <TableHead className="text-xs font-bold text-slate-600">Submitted By</TableHead>
                      <TableHead className="text-xs font-bold text-slate-600">Date</TableHead>
                      <TableHead className="text-xs font-bold text-slate-600">Status</TableHead>
                      <TableHead className="text-right text-xs font-bold text-slate-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((report, i) => {
                      const sc = STATUS_CONFIG[report.status];
                      return (
                        <motion.tr
                          key={report.reference_id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-[#f8fdfb] transition-colors border-b border-slate-100 last:border-0"
                        >
                          <TableCell>
                            <span className="font-mono text-xs font-bold text-primary">{report.reference_id}</span>
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-slate-800">{report.state}</TableCell>
                          <TableCell className="text-sm text-slate-600">{report.reporting_year}</TableCell>
                          <TableCell className="text-sm text-slate-600">{formatNaira(report.approved_budget)}</TableCell>
                          <TableCell className="text-sm text-slate-600">{formatNaira(report.total_amount_utilized)}</TableCell>
                          <TableCell className="text-sm text-slate-500">{report.submitted_by || "—"}</TableCell>
                          <TableCell className="text-xs text-slate-400">{formatDate(report.createdAt)}</TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] px-2 py-0.5 flex items-center gap-1 w-fit border ${sc.className}`}>
                              {sc.icon} {sc.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost" size="sm"
                                className="h-7 w-7 p-0 text-slate-400 hover:text-primary hover:bg-primary/10"
                                onClick={() => onViewReport(report.reference_id)}
                                title="View report"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                             
                            </div>
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
  );
}
