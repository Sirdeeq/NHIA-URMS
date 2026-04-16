import * as React from "react";
import {
  Home, FileText, CheckSquare, Compass, Database, Archive, Shield,
  Bell, Settings, LogOut, ChevronDown, ChevronRight, TrendingUp,
  Clock, AlertCircle, Plus, Search, Filter, Download, BarChart3,
  Map as MapIcon, Flag, History, Users, Activity, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line
} from "recharts";

import ReportEntry from "./ReportEntry";
import ReportPreview from "./ReportPreview";
import ZonalReview from "./ZonalReview";
import ZonalCompose from "./ZonalCompose";
import DGCEOPanel from "./DGCEOPanel";
import SDOPerformance from "./SDOPerformance";
import AnnualReportForm from "./AnnualReportForm";
import AnnualReportsList from "./AnnualReportsList";
import AnnualReportDetail from "./AnnualReportDetail";
import StockVerificationPage from "./StockVerificationPage";
import StockVerificationsList from "./StockVerificationsList";
import StockAssetManager from "./StockAssetManager";
import FinanceMonthlyForm from "./monthly/FinanceMonthlyForm";
import AdminMonthlyForm from "./monthly/AdminMonthlyForm";
import ProgrammesMonthlyForm from "./monthly/ProgrammesMonthlyForm";
import OutreachMonthlyForm from "./monthly/OutreachMonthlyForm";
import SqaMonthlyForm from "./monthly/SqaMonthlyForm";
import ComplaintsMonthlyForm from "./monthly/ComplaintsMonthlyForm";
import MonthlyReportsList from "./monthly/MonthlyReportsList";
import DeptMonthlyPage from "./monthly/DeptMonthlyPage";
import SidebarNav from "./SidebarNav";
import AdminSettingsPage from "./admin/AdminSettingsPage";
import ZonalDirectorDashboard from "./ZonalDirectorDashboard";
import StateOfficeDashboard from "./StateOfficeDashboard";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "state-officer" | "zonal-coordinator" | "state-coordinator" | "sdo" | "hq-department" | "audit" | "dg-ceo" | "admin";
type View = "home" | "report-entry" | "report-preview" | "zonal-review" | "zonal-compose" | "annual-report" | "annual-reports-list" | "annual-report-detail" | "settings" | "stock-verification" | "stock-verifications-list" | "stock-assets" | "finance-monthly" | "admin-monthly" | "programmes-monthly" | "outreach-monthly" | "sqa-monthly" | "complaints-monthly" | "monthly-reports-list";
interface DashboardProps { role: Role; access?: import("@/src/access/types").AccessEntry[]; functionalities?: string; onLogout: () => void; }

// ─── Mock data ────────────────────────────────────────────────────────────────
const CHART_DATA = [
  { name: "Jan", reports: 42, approved: 38 },
  { name: "Feb", reports: 35, approved: 30 },
  { name: "Mar", reports: 58, approved: 52 },
  { name: "Apr", reports: 74, approved: 68 },
  { name: "May", reports: 51, approved: 47 },
  { name: "Jun", reports: 89, approved: 82 },
];

const ZONE_DATA = [
  { zone: "South West", compliance: 98, reports: 18, color: "#25a872" },
  { zone: "North West", compliance: 95, reports: 19, color: "#25a872" },
  { zone: "North Central", compliance: 92, reports: 14, color: "#3b82f6" },
  { zone: "North East", compliance: 88, reports: 10, color: "#f59e0b" },
  { zone: "South East", compliance: 75, reports: 9,  color: "#ef4444" },
  { zone: "Lagos Zone", compliance: 96, reports: 5,  color: "#25a872" },
];

const RECENT_ACTIVITY = [
  { id: 1, action: "Report Submitted",  user: "SO · Lagos",    time: "2 hrs ago",  status: "Pending",   type: "report"    },
  { id: 2, action: "Directive Created", user: "HQ Admin",      time: "4 hrs ago",  status: "Active",    type: "directive" },
  { id: 3, action: "Report Approved",   user: "Zonal Director",time: "1 day ago",  status: "Completed", type: "approved"  },
  { id: 4, action: "Audit Flagged",     user: "Audit Team",    time: "2 days ago", status: "Flagged",   type: "audit"     },
];

const activityDot: Record<string, string> = {
  report: "bg-blue-500", directive: "bg-amber-500",
  approved: "bg-emerald-500", audit: "bg-rose-500",
};

// ─── Sidebar nav items per role ───────────────────────────────────────────────
function getMenuItems(role: Role, view: View, setView: (v: View) => void) {
  const all = [
    { icon: <Home className="w-4 h-4" />,       label: "Dashboard",         active: view === "home",                 onClick: () => setView("home"),                 roles: "all"          },
    { icon: <Flag className="w-4 h-4" />,        label: "Directives",        active: false,                           onClick: undefined,                             roles: "dg-ceo,admin" },
    { icon: <FileText className="w-4 h-4" />,    label: "National Reports",  active: false,                           onClick: undefined,                             roles: "dg-ceo,admin" },
    { icon: <MapIcon className="w-4 h-4" />,     label: "Zonal Performance", active: false,                           onClick: undefined,                             roles: "dg-ceo,admin" },
    { icon: <FileText className="w-4 h-4" />,    label: "Submit Report",     active: view === "report-entry",         onClick: () => setView("report-entry"),         roles: "!dg-ceo"      },
    { icon: <FileText className="w-4 h-4" />,    label: "Annual Report",     active: view === "annual-report",        onClick: () => setView("annual-report"),        roles: "!dg-ceo"      },
    { icon: <History className="w-4 h-4" />,     label: "My Submissions",    active: view === "annual-reports-list",  onClick: () => setView("annual-reports-list"),  roles: "!dg-ceo"      },
    { icon: <CheckSquare className="w-4 h-4" />, label: "Review Reports",    active: view === "zonal-review",         onClick: () => setView("zonal-review"),         roles: "!dg-ceo"      },
    { icon: <Compass className="w-4 h-4" />,     label: "Directives",        active: false,                           onClick: undefined,                             roles: "!dg-ceo"      },
    { icon: <Database className="w-4 h-4" />,    label: "HQ Data",           active: false,                           onClick: undefined,                             roles: "all"          },
    { icon: <Shield className="w-4 h-4" />,      label: "Audit & Compliance",active: false,                           onClick: undefined,                             roles: "dg-ceo,audit,admin" },
    { icon: <Archive className="w-4 h-4" />,     label: "Archive",           active: false,                           onClick: undefined,                             roles: "all"          },
    { icon: <Bell className="w-4 h-4" />,        label: "Notifications",     active: false,                           onClick: undefined,                             roles: "all"          },
    { icon: <Settings className="w-4 h-4" />,    label: "Settings",          active: view === "settings",             onClick: () => setView("settings"),             roles: "admin"        },
    { icon: <Settings className="w-4 h-4" />,    label: "Settings",          active: false,                           onClick: undefined,                             roles: "!admin"       },
  ];
  return all.filter(item => {
    if (item.roles === "all") return true;
    if (item.roles === "!dg-ceo") return role !== "dg-ceo";
    if (item.roles === "!admin")  return role !== "admin";
    return item.roles.split(",").includes(role);
  });
}

// ─── Role helpers ─────────────────────────────────────────────────────────────
function getRoleLabel(r: Role) {
  const map: Record<Role, string> = {
    "state-officer": "State Officer", "zonal-coordinator": "Zonal Coordinator",
    "state-coordinator": "State Coordinator",
    "sdo": "SDO / DGO", "hq-department": "HQ Department",
    "audit": "Audit Team", "dg-ceo": "DG / CEO", "admin": "Administrator",
  };
  return map[r] ?? "User";
}
function getUserInfo(r: Role) {
  const map: Record<Role, { name: string; initials: string; email: string; dept: string }> = {
    "state-officer":     { name: "State Officer",      initials: "SO",  email: "so@nhia.gov.ng",  dept: "State Office"       },
    "zonal-coordinator": { name: "Zonal Coordinator",  initials: "ZC",  email: "zc@nhia.gov.ng",  dept: "Zonal Coordination" },
    "state-coordinator": { name: "State Coordinator",  initials: "SC",  email: "sc@nhia.gov.ng",  dept: "State Coordination" },
    "sdo":               { name: "SDO / DGO",          initials: "SDO", email: "sdo@nhia.gov.ng", dept: "State Directorate"  },
    "hq-department":     { name: "HQ Department",      initials: "HQ",  email: "hq@nhia.gov.ng",  dept: "Headquarters"       },
    "audit":             { name: "Audit Team",         initials: "AUD", email: "audit@nhia.gov.ng",dept: "Audit & Compliance" },
    "dg-ceo":            { name: "DG / CEO",           initials: "DG",  email: "dg@nhia.gov.ng",  dept: "Executive Office"   },
    "admin":             { name: "Administrator",      initials: "ADM", email: "admin@nhia.gov.ng",dept: "System Admin"       },
  };
  return map[r];
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ title, value, trend, trendUp, icon, tint, sub }: {
  title: string; value: string; trend: string; trendUp?: boolean;
  icon: React.ReactNode; tint: string; sub?: string;
}) {
  return (
    <div className={`${tint} rounded-2xl p-5 border border-white/60 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
          trendUp ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
        }`}>
          <TrendingUp className={`w-3 h-3 ${!trendUp ? "rotate-180" : ""}`} />
          {trend}
        </span>
      </div>
      <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      <p className="text-sm font-semibold text-slate-700 mt-1">{title}</p>
      {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Role panels ─────────────────────────────────────────────────────────────
function StateOfficerPanel({ onNewReport, onAnnualReport, onViewSubmissions }: { onNewReport: () => void; onAnnualReport: () => void; onViewSubmissions: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <Plus className="w-5 h-5" />,      title: "Submit New Report",   desc: "Start a fresh monthly submission",    action: onNewReport,       primary: true  },
          { icon: <BarChart3 className="w-5 h-5" />, title: "Annual State Report", desc: "Submit the annual data form",         action: onAnnualReport,    primary: false },
          { icon: <FileText className="w-5 h-5" />,  title: "My Submissions",      desc: "View all your submitted reports",     action: onViewSubmissions, primary: false },
        ].map(c => (
          <button key={c.title} onClick={c.action}
            className={`flex flex-col items-start p-5 rounded-2xl border text-left group transition-all hover:shadow-md ${
              c.primary ? "bg-[#145c3f] text-white border-[#0f3d2e]" : "bg-white border-[#d4e8dc] hover:border-[#25a872]"
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
              c.primary ? "bg-white/20" : "bg-[#e8f5ee] text-[#145c3f]"
            }`}>
              {c.icon}
            </div>
            <p className={`text-sm font-bold ${c.primary ? "text-white" : "text-slate-800"}`}>{c.title}</p>
            <p className={`text-xs mt-0.5 ${c.primary ? "text-white/70" : "text-slate-500"}`}>{c.desc}</p>
          </button>
        ))}
      </div>
      <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-800">Assigned Directives</CardTitle>
          <CardDescription>Tasks from HQ / Zonal office</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-[#f0fdf7]">
              <TableHead className="text-xs font-bold text-slate-600">Directive</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Deadline</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              <TableRow className="hover:bg-[#f0fdf7] transition-colors">
                <TableCell className="text-sm font-medium">Q1 Enrollment Data Verification</TableCell>
                <TableCell className="text-sm text-slate-500">Oct 25, 2025</TableCell>
                <TableCell><Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">Pending</Badge></TableCell>
              </TableRow>
              <TableRow className="hover:bg-[#f0fdf7] transition-colors">
                <TableCell className="text-sm font-medium">Monthly Financial Reconciliation</TableCell>
                <TableCell className="text-sm text-slate-500">Oct 30, 2025</TableCell>
                <TableCell><Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Submitted</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ZonalDirectorPanel({ onReviewReports }: { onReviewReports: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <CheckSquare className="w-5 h-5" />, title: "Review Reports", desc: "Validate state submissions", action: onReviewReports, primary: true },
          { icon: <Compass className="w-5 h-5" />, title: "Issue Directive", desc: "Send instructions to states", action: undefined, primary: false },
          { icon: <BarChart3 className="w-5 h-5" />, title: "Zonal Analytics", desc: "View performance trends", action: undefined, primary: false },
        ].map(c => (
          <button key={c.title} onClick={c.action}
            className={`flex flex-col items-start p-5 rounded-2xl border text-left group transition-all hover:shadow-md ${
              c.primary ? "bg-[#145c3f] text-white border-[#0f3d2e]" : "bg-white border-[#d4e8dc] hover:border-[#25a872]"
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
              c.primary ? "bg-white/20" : "bg-[#e8f5ee] text-[#145c3f]"
            }`}>{c.icon}</div>
            <p className={`text-sm font-bold ${c.primary ? "text-white" : "text-slate-800"}`}>{c.title}</p>
            <p className={`text-xs mt-0.5 ${c.primary ? "text-white/70" : "text-slate-500"}`}>{c.desc}</p>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">State Reporting Compliance</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8f5ee" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5a7a6a" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5a7a6a" }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid #d4e8dc", fontSize: 12 }} />
                <Bar dataKey="reports"  fill="#d1f5e4" radius={[6,6,0,0]} />
                <Bar dataKey="approved" fill="#25a872" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Zonal Commentary</CardTitle>
            <CardDescription className="text-xs">Oversight notes for HQ</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea className="w-full h-[160px] p-3 rounded-xl border border-[#d4e8dc] bg-[#f4f7f5] resize-none text-sm focus:ring-2 focus:ring-[#25a872] outline-none transition-all placeholder:text-slate-400"
              placeholder="Enter zonal performance summary..." />
            <Button className="mt-3 bg-[#145c3f] hover:bg-[#0f3d2e] text-white rounded-xl text-sm h-9">Submit Commentary</Button>
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">State Reports Queue</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-[#f0fdf7]">
              <TableHead className="text-xs font-bold text-slate-600">State</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Report Type</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Date</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Status</TableHead>
              <TableHead className="text-right text-xs font-bold text-slate-600">Action</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {["Lagos", "Ogun", "Oyo"].map(state => (
                <TableRow key={state} className="hover:bg-[#f0fdf7] transition-colors">
                  <TableCell className="text-sm font-semibold">{state}</TableCell>
                  <TableCell className="text-sm text-slate-600">Monthly Operations</TableCell>
                  <TableCell className="text-sm text-slate-500">Oct 12, 2025</TableCell>
                  <TableCell><Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">Pending Review</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-[#145c3f] hover:bg-[#e8f5ee]">Review</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function HQPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-800">Departmental Data Analysis</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl border-[#d4e8dc] hover:bg-[#e8f5ee]">
            <Filter className="w-3.5 h-3.5 mr-1.5" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs rounded-xl border-[#d4e8dc] hover:bg-[#e8f5ee]">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export
          </Button>
        </div>
      </div>
      <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-[#f0fdf7]">
              <TableHead className="text-xs font-bold text-slate-600">Zone</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">State</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Metric</TableHead>
              <TableHead className="text-right text-xs font-bold text-slate-600">Value</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {[1,2,3,4,5].map(i => (
                <TableRow key={i} className="hover:bg-[#f0fdf7] transition-colors">
                  <TableCell className="text-sm">South West</TableCell>
                  <TableCell className="text-sm">Lagos</TableCell>
                  <TableCell className="text-sm text-slate-600">Claims Processed</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">1,240,000</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function AuditPanel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="kpi-blue rounded-2xl p-5 border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Critical Flags</span>
          </div>
          <p className="text-3xl font-black text-slate-900">12</p>
          <p className="text-xs text-slate-500 mt-1">Inconsistencies in last 24h</p>
        </div>
        <div className="kpi-amber rounded-2xl p-5 border border-amber-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center">
              <Flag className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Verification</span>
          </div>
          <p className="text-3xl font-black text-slate-900">45</p>
          <p className="text-xs text-slate-500 mt-1">Reports requiring manual audit</p>
        </div>
      </div>
      <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Audit Log</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-[#f0fdf7]">
              <TableHead className="text-xs font-bold text-slate-600">Report ID</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Submitted By</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Status</TableHead>
              <TableHead className="text-xs font-bold text-slate-600">Flags</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              <TableRow className="hover:bg-[#f0fdf7] transition-colors">
                <TableCell className="font-mono text-xs font-bold text-[#145c3f]">REP-2025-001</TableCell>
                <TableCell className="text-sm">Kano State</TableCell>
                <TableCell><Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px]">Flagged</Badge></TableCell>
                <TableCell className="text-xs text-rose-600 font-medium">Stock Mismatch</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ role, access = [], functionalities = "", onLogout }: DashboardProps) {
  const [view, setView] = React.useState<View>(role === "admin" ? "home" : "home");
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [selectedReportRef, setSelectedReportRef] = React.useState<string | null>(null);
  const [selectedVerifId, setSelectedVerifId] = React.useState<number | null>(null);
  const userInfo = getUserInfo(role);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4f7f5]">

      {/* ── Sidebar ── */}
      <aside className={`sidebar-gradient flex flex-col transition-all duration-300 shrink-0 ${sidebarOpen ? "w-60" : "w-16"}`}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-center px-3 border-b border-white/10">
          {sidebarOpen
            ? <img src="/logo.png" alt="NHIA" className="h-12 w-auto object-contain" />
            : <img src="/logo.png" alt="NHIA" className="h-8 w-8 object-contain" />
          }
        </div>

        {/* Profile block */}
        {sidebarOpen && (
          <div className="mx-3 mt-4 mb-2 p-3 rounded-xl bg-white/10 border border-white/10">
            <div className="flex items-center gap-2.5">
              <Avatar className="w-9 h-9 border-2 border-white/30">
                <AvatarImage src={`https://picsum.photos/seed/${userInfo.initials}/200`} />
                <AvatarFallback className="bg-[#25a872] text-white text-xs font-bold">{userInfo.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{userInfo.name}</p>
                <p className="text-[10px] text-white/50 truncate">{userInfo.dept}</p>
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25a872]/30 text-[#6ddba8] border border-[#25a872]/30">
                {getRoleLabel(role)}
              </span>
            </div>
          </div>
        )}

        {/* Nav */}
        <SidebarNav role={role} access={access} view={view} setView={(v) => setView(v as View)} sidebarOpen={sidebarOpen} />

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:bg-rose-500/20 hover:text-rose-300 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span className="text-xs font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top navbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#d4e8dc] flex items-center justify-between px-6 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(o => !o)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-[#e8f5ee] hover:text-[#145c3f] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect y="2" width="16" height="1.5" rx="0.75" fill="currentColor"/>
                <rect y="7.25" width="11" height="1.5" rx="0.75" fill="currentColor"/>
                <rect y="12.5" width="16" height="1.5" rx="0.75" fill="currentColor"/>
              </svg>
            </button>
            <Separator orientation="vertical" className="h-5 bg-[#d4e8dc]" />
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {view === "home" ? "Dashboard Overview" : view === "report-entry" ? "Submit Report" : view === "zonal-review" ? "Review Reports" : "Dashboard"}
              </p>
              <p className="text-[10px] text-slate-400">NHIA Reporting Management Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="Search reports, directives..."
                className="pl-9 pr-4 py-2 bg-[#f4f7f5] border border-[#d4e8dc] rounded-xl text-xs w-56 focus:ring-2 focus:ring-[#25a872] outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-[#e8f5ee] hover:text-[#145c3f] transition-colors border border-[#d4e8dc]">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-[#e8f5ee] transition-colors outline-none cursor-pointer border border-[#d4e8dc]">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={`https://picsum.photos/seed/${userInfo.initials}/200`} />
                  <AvatarFallback className="bg-[#25a872] text-white text-[10px] font-bold">{userInfo.initials}</AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-slate-800 leading-none">{userInfo.name}</p>
                  <p className="text-[10px] text-slate-400">{userInfo.email}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl border-[#d4e8dc]">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-slate-500">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#d4e8dc]" />
                  <DropdownMenuItem className="text-xs rounded-lg">Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem className="text-xs rounded-lg">Security</DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#d4e8dc]" />
                  <DropdownMenuItem onClick={onLogout} className="text-xs text-rose-600 rounded-lg">Logout</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Watermark */}
          <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-0" style={{ left: sidebarOpen ? "240px" : "64px" }}>
            <img src="/logo.png" alt="" aria-hidden className="w-[50vw] max-w-xl opacity-[0.03] select-none" />
          </div>

          <AnimatePresence mode="wait">
            {view === "home" ? (
              <motion.div key="home" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="relative z-10 p-6 max-w-7xl mx-auto space-y-6"
              >
                {/* Page header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                      Good morning, {userInfo.initials} 👋
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">Here's your NHIA Reporting Management Dashboard overview for today.</p>
                  </div>
                </div>

                {/* KPI row — hidden for SDO, Zonal Coordinator, and State Officer (have their own KPIs) */}
                {role !== "sdo" && role !== "zonal-coordinator" && role !== "state-officer" && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KPICard title="Reports Submitted" value="124" trend="+12%" trendUp icon={<FileText className="w-5 h-5 text-blue-600" />} tint="kpi-blue" sub="This month" />
                  <KPICard title="Pending Review"    value="18"  trend="-5%"  icon={<Clock className="w-5 h-5 text-amber-600" />}  tint="kpi-amber" sub="Awaiting action" />
                  <KPICard title="Open Directives"   value="06"  trend="+2"   trendUp icon={<Compass className="w-5 h-5 text-[#145c3f]" />} tint="kpi-green" sub="Active tasks" />
                  <KPICard title="Compliance Rate"   value="98.2%" trend="+0.4%" trendUp icon={<CheckSquare className="w-5 h-5 text-purple-600" />} tint="kpi-purple" sub="National average" />
                </div>
                )}

                {/* Main grid */}
                {role === "sdo" ? (
                  /* SDO: full-width performance dashboard */
                  <motion.div key={role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <SDOPerformance />
                  </motion.div>
                ) : role === "zonal-coordinator" ? (
                  /* Zonal Coordinator: same zone + state drill-down dashboard as Zonal Director */
                  <motion.div key={role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <ZonalDirectorDashboard
                      zoneName="South West"
                      onReviewReports={() => setView("zonal-review")}
                    />
                  </motion.div>
                ) : role === "state-officer" ? (
                  /* State Officer: state performance + department drill-down */
                  <motion.div key={role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <StateOfficeDashboard
                      stateName="Lagos"
                      zoneName="South West"
                      onNewReport={() => setView("report-entry")}
                      onAnnualReport={() => setView("annual-report")}
                      onViewSubmissions={() => setView("annual-reports-list")}
                      onNewSubmission={(targetView) => setView(targetView as View)}
                    />
                  </motion.div>
                ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-6">
                    {/* Chart */}
                    <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-bold text-slate-800">Reports by Zone</CardTitle>
                          <CardDescription className="text-xs">Submitted vs Approved — 2025</CardDescription>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#d1f5e4] inline-block" />Submitted</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#25a872] inline-block" />Approved</span>
                        </div>
                      </CardHeader>
                      <CardContent className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={CHART_DATA} barSize={14} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8f5ee" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5a7a6a" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "#5a7a6a" }} axisLine={false} tickLine={false} />
                            <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid #d4e8dc", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
                            <Bar dataKey="reports"  fill="#d1f5e4" radius={[6,6,0,0]} />
                            <Bar dataKey="approved" fill="#25a872" radius={[6,6,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Zonal performance */}
                    <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-slate-800">Zonal Performance</CardTitle>
                        <CardDescription className="text-xs">Compliance rates across geopolitical zones</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {ZONE_DATA.map(z => (
                          <div key={z.zone} className="flex items-center gap-3">
                            <p className="text-xs font-semibold text-slate-700 w-32 shrink-0 truncate">{z.zone}</p>
                            <div className="flex-1 h-2 bg-[#e8f5ee] rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${z.compliance}%`, backgroundColor: z.color }} />
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-10 text-right">{z.compliance}%</span>
                            <Badge className="text-[9px] px-1.5 py-0 bg-[#e8f5ee] text-[#145c3f] border-[#d4e8dc] w-14 justify-center">
                              {z.reports} rpts
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Role panel */}
                    <motion.div key={role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                      {role === "state-coordinator" && <StateOfficerPanel onNewReport={() => setView("report-entry")} onAnnualReport={() => setView("annual-report")} onViewSubmissions={() => setView("annual-reports-list")} />}
                      {role === "dg-ceo"         && <DGCEOPanel />}
                      {role === "hq-department"  && <HQPanel />}
                      {role === "audit"          && <AuditPanel />}
                    </motion.div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-5">
                    {/* Recent activity */}
                    <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-[#25a872]" /> Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {RECENT_ACTIVITY.map((a, idx) => (
                            <div key={a.id} className="flex gap-3 relative">
                              {idx !== RECENT_ACTIVITY.length - 1 && (
                                <div className="absolute left-[11px] top-7 w-[2px] h-7 bg-[#e8f5ee]" />
                              )}
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${activityDot[a.type]}`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 leading-tight">{a.action}</p>
                                <p className="text-[10px] text-slate-500">{a.user}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[10px] text-slate-400">{a.time}</span>
                                  <Badge className={`text-[9px] px-1.5 py-0 h-4 ${
                                    a.status === "Completed" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                    a.status === "Pending"   ? "bg-amber-100  text-amber-700  border-amber-200"  :
                                    a.status === "Flagged"   ? "bg-rose-100   text-rose-700   border-rose-200"   :
                                    "bg-blue-100 text-blue-700 border-blue-200"
                                  }`}>{a.status}</Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-4 text-xs text-slate-500 hover:text-[#145c3f] hover:bg-[#e8f5ee] rounded-xl h-8">
                          View All Activity
                        </Button>
                      </CardContent>
                    </Card>

                    {/* System health */}
                    <div className="rounded-2xl p-5 overflow-hidden relative" style={{ background: "linear-gradient(135deg,#145c3f 0%,#0f3d2e 100%)" }}>
                      <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
                      <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#25a872]/20 rounded-full -ml-8 -mb-8 blur-xl" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-[#6ddba8]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">System Health</p>
                            <p className="text-[10px] text-white/50">All systems operational</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {[
                            { label: "Data Sync",    val: 100 },
                            { label: "API Gateway",  val: 98  },
                            { label: "Report Queue", val: 87  },
                          ].map(s => (
                            <div key={s.label}>
                              <div className="flex justify-between text-[10px] text-white/70 mb-1">
                                <span>{s.label}</span><span className="font-bold text-white">{s.val}%</span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[#25a872] rounded-full" style={{ width: `${s.val}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-white/40 mt-4">Last sync: 2 minutes ago</p>
                      </div>
                    </div>

                    {/* Top performing */}
                    <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold text-slate-800">Top Performing</CardTitle>
                        <CardDescription className="text-xs">Highest compliance zones</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2.5">
                        {ZONE_DATA.filter(z => z.compliance >= 92).slice(0, 3).map((z, i) => (
                          <div key={z.zone} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f0fdf7] border border-[#d4e8dc]">
                            <span className="w-5 h-5 rounded-full bg-[#25a872] text-white text-[10px] font-black flex items-center justify-center shrink-0">{i+1}</span>
                            <p className="text-xs font-semibold text-slate-800 flex-1 truncate">{z.zone}</p>
                            <span className="text-xs font-black text-[#145c3f]">{z.compliance}%</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
                )} {/* end role !== "sdo" ternary */}
              </motion.div>
            ) : view === "report-entry" ? (
              <ReportEntry onBack={() => setView("home")} onPreview={() => setView("report-preview")} />
            ) : view === "report-preview" ? (
              <ReportPreview onBack={() => setView("report-entry")} onEditSection={() => setView("report-entry")} onSubmit={() => setView("home")} />
            ) : view === "zonal-review" ? (
              <ZonalReview onCompose={() => setView("zonal-compose")} />
            ) : view === "annual-report" ? (
              <AnnualReportForm onBack={() => setView("home")} onSubmit={(_refId) => setView("annual-reports-list")} />
            ) : view === "annual-reports-list" ? (
              <AnnualReportsList
                onBack={() => setView("home")}
                onNewReport={() => setView("annual-report")}
                onViewReport={(refId) => { setSelectedReportRef(refId); setView("annual-report-detail"); }}
              />
            ) : view === "annual-report-detail" ? (
              <AnnualReportDetail
                referenceId={selectedReportRef!}
                onBack={() => setView("annual-reports-list")}
              />
            ) : view === "stock-verification" ? (
              <StockVerificationPage onBack={() => setView("stock-verifications-list")} />
            ) : view === "stock-verifications-list" ? (
              <StockVerificationsList
                onBack={() => setView("home")}
                onNew={() => setView("stock-verification")}
                onView={(id) => { setSelectedVerifId(id); setView("stock-verification"); }}
              />
            ) : view === "stock-assets" ? (
              <StockAssetManager onBack={() => setView("home")} />
            ) : view === "finance-monthly" ? (
              <DeptMonthlyPage dept="finance" title="Finance Monthly Reports" section="finance"
                onBack={() => setView("home")} defaultZoneId={null} defaultStateId={null}
                FormComponent={FinanceMonthlyForm} />
            ) : view === "admin-monthly" ? (
              <DeptMonthlyPage dept="finance" title="Admin / HR Monthly Reports" section="admin"
                onBack={() => setView("home")} defaultZoneId={null} defaultStateId={null}
                FormComponent={AdminMonthlyForm} />
            ) : view === "programmes-monthly" ? (
              <DeptMonthlyPage dept="programmes" title="Enrolment Monthly Reports" section="enrolment"
                onBack={() => setView("home")} defaultZoneId={null} defaultStateId={null}
                FormComponent={ProgrammesMonthlyForm} />
            ) : view === "outreach-monthly" ? (
              <DeptMonthlyPage dept="programmes" title="Outreach Monthly Reports" section="outreach"
                onBack={() => setView("home")} defaultZoneId={null} defaultStateId={null}
                FormComponent={OutreachMonthlyForm} />
            ) : view === "sqa-monthly" ? (
              <DeptMonthlyPage dept="sqa" title="HMO/HCP Quality Assurance Monthly Reports" section="sqa"
                onBack={() => setView("home")} defaultZoneId={null} defaultStateId={null}
                FormComponent={SqaMonthlyForm} />
            ) : view === "complaints-monthly" ? (
              <DeptMonthlyPage dept="sqa" title="Enrollee Complaints Monthly Reports" section="complaints"
                onBack={() => setView("home")} defaultZoneId={null} defaultStateId={null}
                FormComponent={ComplaintsMonthlyForm} />
            ) : view === "monthly-reports-list" ? (
              <MonthlyReportsList
                onBack={() => setView("home")}
                onNew={(dept) => setView(`${dept === "finance" ? "finance" : dept === "sqa" ? "sqa" : "programmes"}-monthly` as View)}
                defaultStateId={null}
              />
            ) : view === "settings" ? (
              <AdminSettingsPage />
            ) : (
              <ZonalCompose onBack={() => setView("zonal-review")} onForward={() => setView("home")} />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
