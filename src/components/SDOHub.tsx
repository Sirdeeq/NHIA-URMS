import * as React from "react";
import {
  Activity, ArrowRight, BarChart3, Bell, Briefcase, Building2,
  CheckCircle2, ChevronRight, Clock, Database, Download, Eye,
  FileText, Filter, Flag, Home, Layers, LayoutDashboard, Lock,
  LogOut, MapPin, MessageSquare, MoreHorizontal, Plus, Radio,
  RefreshCw, Search, Send, Settings, Shield, ShieldAlert, Star,
  TrendingUp, UserCheck, Users, Zap, AlertTriangle, CheckSquare,
  Network, ToggleLeft, ToggleRight, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import SDOPerformance from "./SDOPerformance";

// ─── Design tokens ────────────────────────────────────────────────────────────
const PRIMARY = "#1E3A8A";
const ACCENT  = "#F97316";

// ─── Mock data ────────────────────────────────────────────────────────────────
const KPI_DATA = [
  { label: "Incoming Reports", sub: "From state offices", value: 142, status: "green",  icon: <FileText  className="w-5 h-5" />, trend: "+8 today"   },
  { label: "Zonal Aggregated", sub: "Reports compiled",   value: 38,  status: "yellow", icon: <Layers    className="w-5 h-5" />, trend: "4 pending"  },
  { label: "Active Directives", sub: "From DG/CEO",       value: 6,   status: "red",    icon: <Flag      className="w-5 h-5" />, trend: "2 urgent"   },
  { label: "Pending Feedback",  sub: "Awaiting response", value: 21,  status: "yellow", icon: <RefreshCw className="w-5 h-5" />, trend: "3 overdue"  },
];

const STATUS_DOT: Record<string, string> = {
  green: "bg-emerald-500", yellow: "bg-amber-500", red: "bg-rose-500",
};
const STATUS_BADGE: Record<string, string> = {
  green:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  yellow: "bg-amber-50  text-amber-700  border-amber-200",
  red:    "bg-rose-50   text-rose-700   border-rose-200",
};

const STATE_REPORTS = [
  { id: "REP-901", state: "Lagos",   zone: "SW", type: "Monthly Ops",  status: "Pending",  date: "Apr 14, 2026" },
  { id: "REP-902", state: "Kano",    zone: "NW", type: "Financial",    status: "Reviewed", date: "Apr 14, 2026" },
  { id: "REP-903", state: "Plateau", zone: "NC", type: "Enrolment",    status: "Pending",  date: "Apr 13, 2026" },
  { id: "REP-904", state: "Enugu",   zone: "SE", type: "Monthly Ops",  status: "Approved", date: "Apr 13, 2026" },
  { id: "REP-905", state: "Borno",   zone: "NE", type: "Emergency",    status: "Flagged",  date: "Apr 12, 2026" },
  { id: "REP-906", state: "Ogun",    zone: "SW", type: "Audit",        status: "Pending",  date: "Apr 12, 2026" },
  { id: "REP-907", state: "Kaduna",  zone: "NW", type: "Monthly Ops",  status: "Reviewed", date: "Apr 11, 2026" },
];

const STOCK_DATA = [
  { facility: "LUTH Lagos",       state: "Lagos",   status: "Verified", issues: "None"           },
  { facility: "AKTH Kano",        state: "Kano",    status: "Pending",  issues: "Stock mismatch" },
  { facility: "JUTH Jos",         state: "Plateau", status: "Flagged",  issues: "Missing records"},
  { facility: "UNTH Enugu",       state: "Enugu",   status: "Verified", issues: "None"           },
  { facility: "UMTH Maiduguri",   state: "Borno",   status: "Pending",  issues: "Awaiting docs"  },
];

const STOCK_TREND = [
  { month: "Nov", verified: 40, pending: 12, flagged: 5 },
  { month: "Dec", verified: 52, pending: 9,  flagged: 3 },
  { month: "Jan", verified: 61, pending: 14, flagged: 7 },
  { month: "Feb", verified: 58, pending: 10, flagged: 4 },
  { month: "Mar", verified: 70, pending: 8,  flagged: 2 },
  { month: "Apr", verified: 65, pending: 11, flagged: 6 },
];

const SERVICOM_DATA = [
  { facility: "LUTH Lagos",     zone: "SW", rating: 4.5, comment: "Excellent service delivery" },
  { facility: "AKTH Kano",      zone: "NW", rating: 3.2, comment: "Long waiting times reported" },
  { facility: "JUTH Jos",       zone: "NC", rating: 4.1, comment: "Good but needs more staff"   },
  { facility: "UNTH Enugu",     zone: "SE", rating: 2.8, comment: "Multiple complaints logged"  },
  { facility: "UMTH Maiduguri", zone: "NE", rating: 3.9, comment: "Improving steadily"          },
];

const SERVICOM_TREND = [
  { month: "Nov", score: 3.6 }, { month: "Dec", score: 3.8 },
  { month: "Jan", score: 3.5 }, { month: "Feb", score: 4.0 },
  { month: "Mar", score: 4.2 }, { month: "Apr", score: 3.9 },
];

const PROJECTS = [
  { id: "PRJ-01", title: "Q4 Enrolment Audit",        zones: "All Zones", deadline: "Apr 30", status: "Active",    progress: 65 },
  { id: "PRJ-02", title: "Facility Accreditation",     zones: "SW, SS",   deadline: "May 15", status: "Delayed",   progress: 30 },
  { id: "PRJ-03", title: "Staff ID Harmonization",     zones: "HQ",       deadline: "Mar 31", status: "Completed", progress: 100},
  { id: "PRJ-04", title: "Emergency Fund Review",      zones: "NE, NW",   deadline: "May 10", status: "Active",    progress: 45 },
  { id: "PRJ-05", title: "Digital Claims Integration", zones: "All Zones",deadline: "Jun 01", status: "Active",    progress: 20 },
];

const PROJECT_LOG = [
  { time: "Apr 14", event: "PRJ-01 progress updated to 65%", by: "SDO Admin" },
  { time: "Apr 13", event: "PRJ-02 flagged as Delayed",      by: "DG Office" },
  { time: "Apr 12", event: "PRJ-03 marked Completed",        by: "HQ HR"     },
  { time: "Apr 11", event: "PRJ-04 zones expanded to NW",    by: "SDO Admin" },
];

const ACTIVITY_FEED = [
  { id: 1, event: "Report submitted",       detail: "Lagos State · Monthly Ops",    time: "Just now",   type: "report"    },
  { id: 2, event: "Directive responded",    detail: "DIR-042 · South West Zone",    time: "3 mins ago", type: "directive" },
  { id: 3, event: "Audit flagged",          detail: "REP-905 · Borno State",        time: "8 mins ago", type: "audit"     },
  { id: 4, event: "Report submitted",       detail: "Kano State · Financial",       time: "15 mins ago",type: "report"    },
  { id: 5, event: "Feedback loop closed",   detail: "DIR-039 · HQ HR Dept",         time: "22 mins ago",type: "directive" },
  { id: 6, event: "Audit flagged",          detail: "REP-891 · Enugu State",        time: "31 mins ago",type: "audit"     },
];

const ACCESS_ROLES = [
  {
    role: "Zonal Directors", count: 6, color: "bg-blue-100 text-blue-800",
    perms: { view: true, edit: true,  approve: false },
  },
  {
    role: "HQ Departments",  count: 5, color: "bg-purple-100 text-purple-800",
    perms: { view: true, edit: false, approve: false },
  },
  {
    role: "DGO / Audit",     count: 2, color: "bg-red-100 text-red-800",
    perms: { view: true, edit: true,  approve: true  },
  },
  {
    role: "SDO Staff",       count: 8, color: "bg-emerald-100 text-emerald-800",
    perms: { view: true, edit: true,  approve: true  },
  },
];

const FLOW_NODES = [
  { id: "states", label: "State Offices", sub: "36",   color: PRIMARY,   icon: <Building2 className="w-4 h-4" /> },
  { id: "sdo",    label: "SDO",           sub: "Hub",  color: ACCENT,    icon: <Radio     className="w-4 h-4" /> },
  { id: "zonal",  label: "Zonal Offices", sub: "6",    color: PRIMARY,   icon: <MapPin    className="w-4 h-4" /> },
  { id: "hq",     label: "HQ Depts",      sub: "5",    color: PRIMARY,   icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "dgo",    label: "DGO",           sub: "Exec", color: "#7C3AED", icon: <Shield    className="w-4 h-4" /> },
];

const SIDEBAR_ITEMS = [
  { id: "overview",      label: "Dashboard",        icon: <Home         className="w-4 h-4" /> },
  { id: "state",         label: "State Coordination",icon: <Building2   className="w-4 h-4" /> },
  { id: "stock",         label: "Stock Verification",icon: <BarChart3   className="w-4 h-4" /> },
  { id: "servicom",      label: "SERVICOM",          icon: <Star        className="w-4 h-4" /> },
  { id: "projects",      label: "Special Projects",  icon: <Briefcase   className="w-4 h-4" /> },
  { id: "linkage",       label: "Data Linkage",      icon: <Network     className="w-4 h-4" /> },
  { id: "access",        label: "Access Control",    icon: <Lock        className="w-4 h-4" /> },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const reportStatusColor: Record<string, string> = {
  Pending:  "bg-amber-50  text-amber-700  border-amber-200",
  Reviewed: "bg-blue-50   text-blue-700   border-blue-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Flagged:  "bg-rose-50   text-rose-700   border-rose-200",
};

const stockStatusColor: Record<string, string> = {
  Verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending:  "bg-amber-50  text-amber-700  border-amber-200",
  Flagged:  "bg-rose-50   text-rose-700   border-rose-200",
};

const projectStatusColor: Record<string, string> = {
  Active:    "bg-blue-500",
  Delayed:   "bg-rose-500",
  Completed: "bg-emerald-500",
};

const activityColor: Record<string, string> = {
  report:    "bg-blue-50   text-blue-600",
  directive: "bg-orange-50 text-orange-500",
  audit:     "bg-rose-50   text-rose-500",
};

const activityIcon: Record<string, React.ReactNode> = {
  report:    <FileText   className="w-3.5 h-3.5" />,
  directive: <Flag       className="w-3.5 h-3.5" />,
  audit:     <ShieldAlert className="w-3.5 h-3.5" />,
};

// ─── Data Flow Diagram ────────────────────────────────────────────────────────

function DataFlowDiagram({ onNodeClick, activeNode }: { onNodeClick: (id: string) => void; activeNode: string | null }) {
  return (
    <div className="relative w-full h-44 flex items-center">
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            <line
              x1={`${10 + i * 22}%`} y1="45%" x2={`${28 + i * 22}%`} y2="45%"
              stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 4"
            />
            <circle r="4" fill={ACCENT} opacity="0.85">
              <animateMotion dur={`${1.6 + i * 0.35}s`} repeatCount="indefinite"
                path={`M ${10 + i * 22}% 45% L ${28 + i * 22}% 45%`} />
            </circle>
          </g>
        ))}
      </svg>
      <div className="relative z-10 w-full flex items-center justify-between px-4">
        {FLOW_NODES.map((node) => (
          <button key={node.id} onClick={() => onNodeClick(node.id)} className="flex flex-col items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg relative transition-all ${
                activeNode === node.id ? "ring-4 ring-offset-2 ring-orange-400 scale-110" : ""
              }`}
              style={{ backgroundColor: node.color }}
            >
              <div className="text-white">{node.icon}</div>
              {node.id === "sdo" && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-white animate-pulse" />
              )}
            </motion.div>
            <div className="text-center">
              <p className="text-[11px] font-bold text-slate-800 leading-tight">{node.label}</p>
              <p className="text-[9px] text-muted-foreground">{node.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Network Diagram (Data Linkage) ──────────────────────────────────────────

function NetworkDiagram({ onNodeClick, activeNode }: { onNodeClick: (id: string) => void; activeNode: string | null }) {
  const nodes = [
    { id: "sdo",    label: "SDO",           cx: 50, cy: 50, r: 28, color: ACCENT   },
    { id: "states", label: "State Offices", cx: 15, cy: 25, r: 20, color: PRIMARY  },
    { id: "zonal",  label: "Zonal Offices", cx: 85, cy: 25, r: 20, color: PRIMARY  },
    { id: "hq",     label: "HQ Depts",      cx: 15, cy: 75, r: 20, color: PRIMARY  },
    { id: "dgo",    label: "DGO",           cx: 85, cy: 75, r: 20, color: "#7C3AED"},
  ];
  const edges = [
    ["states","sdo"],["sdo","zonal"],["sdo","hq"],["sdo","dgo"],["zonal","hq"],["hq","dgo"]
  ];
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  const NODE_INFO: Record<string, string> = {
    sdo:    "Central hub · 142 reports in transit · 6 active directives",
    states: "36 state offices · 142 reports submitted · 4 pending",
    zonal:  "6 zones · 38 aggregated reports · 2 awaiting review",
    hq:     "5 departments · Receiving disaggregated data · 3 pending",
    dgo:    "Executive oversight · 6 active directives · Full access",
  };

  return (
    <div className="w-full">
      <svg viewBox="0 0 100 100" className="w-full h-64">
        {edges.map(([a, b]) => {
          const na = nodeMap[a], nb = nodeMap[b];
          return (
            <line key={`${a}-${b}`}
              x1={`${na.cx}%`} y1={`${na.cy}%`}
              x2={`${nb.cx}%`} y2={`${nb.cy}%`}
              stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="2 1"
            />
          );
        })}
        {nodes.map(node => (
          <g key={node.id} onClick={() => onNodeClick(node.id)} className="cursor-pointer">
            <circle
              cx={`${node.cx}%`} cy={`${node.cy}%`} r={`${node.r * 0.6}%`}
              fill={node.color} opacity={activeNode === node.id ? 1 : 0.85}
              stroke={activeNode === node.id ? ACCENT : "white"}
              strokeWidth={activeNode === node.id ? "0.8" : "0.4"}
            />
            <text x={`${node.cx}%`} y={`${node.cy + 0.5}%`}
              textAnchor="middle" dominantBaseline="middle"
              fill="white" fontSize="2.8" fontWeight="bold"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      <AnimatePresence>
        {activeNode && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-bold text-slate-900">{FLOW_NODES.find(n => n.id === activeNode)?.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{NODE_INFO[activeNode]}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onNodeClick(activeNode)} className="text-xs">
              <X className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tab Contents ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const [activeNode, setActiveNode] = React.useState<string | null>(null);
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Radio className="w-4 h-4 text-orange-500" /> Data Flow Visualization
                </CardTitle>
                <CardDescription className="text-xs">Click any node to inspect</CardDescription>
              </div>
              {activeNode && (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px]">
                  {FLOW_NODES.find(n => n.id === activeNode)?.label} selected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <DataFlowDiagram onNodeClick={id => setActiveNode(prev => prev === id ? null : id)} activeNode={activeNode} />
            <AnimatePresence>
              {activeNode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{FLOW_NODES.find(n => n.id === activeNode)?.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activeNode === "states" && "36 state offices · 142 reports submitted · 4 pending"}
                        {activeNode === "sdo"    && "Central hub · All data flows through SDO · 6 active directives"}
                        {activeNode === "zonal"  && "6 geopolitical zones · 38 aggregated reports · 2 awaiting review"}
                        {activeNode === "hq"     && "5 HQ departments · Receiving disaggregated data · 3 pending"}
                        {activeNode === "dgo"    && "Executive oversight · 6 active directives · Full access"}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => setActiveNode(null)}>
                      Close <X className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Forward Report",   icon: <Send      className="w-4 h-4" />, color: "bg-blue-600"   },
            { label: "Create Directive", icon: <Plus      className="w-4 h-4" />, color: "bg-orange-500" },
            { label: "Send Feedback",    icon: <MessageSquare className="w-4 h-4" />, color: "bg-purple-600" },
          ].map(a => (
            <button key={a.label}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-white hover:shadow-md transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl ${a.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {a.icon}
              </div>
              <span className="text-xs font-semibold text-slate-700">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Live Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[420px] px-4 pb-4">
            <div className="space-y-4 pt-2">
              {ACTIVITY_FEED.map((item, idx) => (
                <div key={item.id} className="flex gap-3 relative">
                  {idx !== ACTIVITY_FEED.length - 1 && (
                    <div className="absolute left-[13px] top-7 w-[2px] h-6 bg-slate-100" />
                  )}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${activityColor[item.type]}`}>
                    {activityIcon[item.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{item.event}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.detail}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function StateCoordinationTab() {
  const [selected, setSelected] = React.useState<typeof STATE_REPORTS[0] | null>(null);
  const [filterZone, setFilterZone] = React.useState("All");
  const zones = ["All", "SW", "NW", "NC", "SE", "NE"];
  const filtered = filterZone === "All" ? STATE_REPORTS : STATE_REPORTS.filter(r => r.zone === filterZone);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b py-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-bold">Incoming State Reports</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <input placeholder="Search..." className="pl-8 h-8 w-36 rounded-md border border-input bg-background text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                      <Filter className="w-3.5 h-3.5" /> {filterZone}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {zones.map(z => <DropdownMenuItem key={z} className="text-xs" onClick={() => setFilterZone(z)}>{z}</DropdownMenuItem>)}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow>
                  <TableHead className="text-[11px]">ID</TableHead>
                  <TableHead className="text-[11px]">State</TableHead>
                  <TableHead className="text-[11px]">Zone</TableHead>
                  <TableHead className="text-[11px]">Type</TableHead>
                  <TableHead className="text-[11px]">Status</TableHead>
                  <TableHead className="text-[11px]">Date</TableHead>
                  <TableHead className="text-right text-[11px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id}
                    className={`cursor-pointer hover:bg-slate-50 transition-colors ${selected?.id === r.id ? "bg-blue-50/50" : ""}`}
                    onClick={() => setSelected(prev => prev?.id === r.id ? null : r)}
                  >
                    <TableCell className="font-mono text-[11px] font-bold text-primary">{r.id}</TableCell>
                    <TableCell className="text-xs font-medium">{r.state}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] px-1.5 py-0">{r.zone}</Badge></TableCell>
                    <TableCell className="text-xs">{r.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${reportStatusColor[r.status]}`}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{r.date}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] text-primary">
                        <Eye className="w-3 h-3 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Side panel */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">
            {selected ? `${selected.state} — ${selected.id}` : "Select a report"}
          </CardTitle>
          {selected && <CardDescription className="text-xs">{selected.type} · {selected.date}</CardDescription>}
        </CardHeader>
        <CardContent>
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
              <Eye className="w-8 h-8 opacity-30" />
              <p className="text-xs">Click a row to view details</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">State</span><span className="font-bold">{selected.state}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Zone</span><span className="font-bold">{selected.zone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-bold">{selected.type}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${reportStatusColor[selected.status]}`}>{selected.status}</Badge>
                </div>
              </div>
              {/* Mock chat thread */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Communication Thread</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {["Report received and logged.", "Forwarded to Zonal Director for review.", "Awaiting zonal feedback."].map((msg, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-50 border text-[11px] text-slate-700">{msg}</div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 pt-1">
                <Button size="sm" className="text-xs gap-1.5 h-8" style={{ backgroundColor: PRIMARY }}>
                  <Send className="w-3.5 h-3.5" /> Forward to Zonal
                </Button>
                <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8">
                  <MessageSquare className="w-3.5 h-3.5" /> Request Clarification
                </Button>
                <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StockVerificationTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Verified",  value: 65, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
          { label: "Pending",   value: 11, color: "text-amber-600  bg-amber-50  border-amber-200"  },
          { label: "Flagged",   value: 6,  color: "text-rose-600   bg-rose-50   border-rose-200"   },
        ].map(s => (
          <Card key={s.label} className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full border mb-3 ${s.color}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" /> {s.label}
              </div>
              <p className="text-3xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Facilities</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b py-3">
            <CardTitle className="text-sm font-bold">Facility Verification Status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow>
                  <TableHead className="text-[11px]">Facility</TableHead>
                  <TableHead className="text-[11px]">State</TableHead>
                  <TableHead className="text-[11px]">Status</TableHead>
                  <TableHead className="text-[11px]">Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {STOCK_DATA.map(s => (
                  <TableRow key={s.facility} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="text-xs font-medium">{s.facility}</TableCell>
                    <TableCell className="text-xs">{s.state}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${stockStatusColor[s.status]}`}>{s.status}</Badge>
                    </TableCell>
                    <TableCell className={`text-[11px] ${s.issues !== "None" ? "text-rose-600 font-medium" : "text-muted-foreground"}`}>
                      {s.issues}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Verification Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STOCK_TREND} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <RechartsTooltip />
                <Bar dataKey="verified" fill="#22C55E" radius={[4,4,0,0]} />
                <Bar dataKey="pending"  fill="#FACC15" radius={[4,4,0,0]} />
                <Bar dataKey="flagged"  fill="#EF4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ServicecomTab() {
  const avg = (SERVICOM_DATA.reduce((s, r) => s + r.rating, 0) / SERVICOM_DATA.length).toFixed(1);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Avg Satisfaction</p>
            <p className="text-4xl font-black text-slate-900">{avg}<span className="text-lg text-muted-foreground">/5</span></p>
            <div className="flex gap-0.5 mt-2">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(avg)) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm sm:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Satisfaction Trend</CardTitle></CardHeader>
          <CardContent className="h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SERVICOM_TREND}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis domain={[2, 5]} tick={{ fontSize: 10 }} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="score" stroke={PRIMARY} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b py-3">
          <CardTitle className="text-sm font-bold">Facility Feedback</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/30">
              <TableRow>
                <TableHead className="text-[11px]">Facility</TableHead>
                <TableHead className="text-[11px]">Zone</TableHead>
                <TableHead className="text-[11px]">Rating</TableHead>
                <TableHead className="text-[11px]">Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SERVICOM_DATA.map(s => (
                <TableRow key={s.facility} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="text-xs font-medium">{s.facility}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] px-1.5 py-0">{s.zone}</Badge></TableCell>
                  <TableCell>
                    <span className={`text-xs font-bold ${s.rating >= 4 ? "text-emerald-600" : s.rating >= 3 ? "text-amber-600" : "text-rose-600"}`}>
                      {s.rating} ★
                    </span>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{s.comment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SpecialProjectsTab() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-3">
        {PROJECTS.map(p => (
          <Card key={p.id} className="border-none shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[10px] text-primary font-bold">{p.id}</span>
                    <Badge className={`text-[9px] px-1.5 py-0 ${projectStatusColor[p.status]}`}>{p.status}</Badge>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Zones: {p.zones} · Deadline: {p.deadline}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-[10px] px-2">Update</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] px-2">Feedback</Button>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                  <span>Progress</span><span>{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {PROJECT_LOG.map((log, idx) => (
              <div key={idx} className="flex gap-3 relative">
                {idx !== PROJECT_LOG.length - 1 && (
                  <div className="absolute left-[11px] top-6 w-[2px] h-8 bg-slate-100" />
                )}
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-800 leading-tight">{log.event}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{log.by} · {log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DataLinkageTab() {
  const [activeNode, setActiveNode] = React.useState<string | null>(null);
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Network className="w-4 h-4 text-primary" /> Network Diagram
          </CardTitle>
          <CardDescription className="text-xs">Click a node to view data summary</CardDescription>
        </CardHeader>
        <CardContent>
          <NetworkDiagram
            onNodeClick={id => setActiveNode(prev => prev === id ? null : id)}
            activeNode={activeNode}
          />
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Data Flow Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {FLOW_NODES.map(node => (
            <div key={node.id}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${activeNode === node.id ? "ring-2 ring-orange-400 bg-orange-50/30" : "bg-slate-50/40 hover:bg-slate-50"}`}
              onClick={() => setActiveNode(prev => prev === node.id ? null : node.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: node.color }}>
                    {node.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{node.label}</p>
                    <p className="text-[10px] text-muted-foreground">{node.sub}</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AccessControlTab() {
  const [perms, setPerms] = React.useState(
    Object.fromEntries(ACCESS_ROLES.map(r => [r.role, { ...r.perms }]))
  );
  const toggle = (role: string, perm: "view" | "edit" | "approve") => {
    setPerms(prev => ({ ...prev, [role]: { ...prev[role], [perm]: !prev[role][perm] } }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACCESS_ROLES.map(ar => (
          <Card key={ar.role} className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{ar.role}</p>
                    <p className="text-[10px] text-muted-foreground">{ar.count} users</p>
                  </div>
                </div>
                <Badge className={`text-[10px] ${ar.color}`}>{ar.count} Active</Badge>
              </div>
              <div className="space-y-2.5">
                {(["view", "edit", "approve"] as const).map(perm => (
                  <div key={perm} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-semibold capitalize text-slate-700">{perm}</span>
                    </div>
                    <button
                      onClick={() => toggle(ar.role, perm)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${perms[ar.role][perm] ? "bg-emerald-500" : "bg-slate-200"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${perms[ar.role][perm] ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Main SDOHub Component ────────────────────────────────────────────────────

const TABS = [
  { id: "overview",     label: "Overview"           },
  { id: "state",        label: "State Coordination" },
  { id: "stock",        label: "Stock Verification" },
  { id: "servicom",     label: "SERVICOM"           },
  { id: "projects",     label: "Special Projects"   },
  { id: "linkage",      label: "Data Linkage"       },
  { id: "access",       label: "Access Control"     },
  { id: "performance",  label: "Performance Report" },
];

export default function SDOHub() {
  const [activeTab, setActiveTab] = React.useState("performance");

  return (
    <div className="space-y-6 pb-12">

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-xl border ${STATUS_BADGE[kpi.status]}`}>{kpi.icon}</div>
                  <span className={`w-2.5 h-2.5 rounded-full mt-1 ${STATUS_DOT[kpi.status]} animate-pulse`} />
                </div>
                <p className="text-3xl font-black text-slate-900">{kpi.value}</p>
                <p className="text-xs font-semibold text-slate-600 mt-0.5 leading-tight">{kpi.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.sub}</p>
                <span className={`text-[10px] font-bold mt-2 inline-block px-2 py-0.5 rounded-full border ${STATUS_BADGE[kpi.status]}`}>
                  {kpi.trend}
                </span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Tab Navigation ── */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-[#1E3A8A] text-[#1E3A8A]"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview"     && <OverviewTab />}
          {activeTab === "state"        && <StateCoordinationTab />}
          {activeTab === "stock"        && <StockVerificationTab />}
          {activeTab === "servicom"     && <ServicecomTab />}
          {activeTab === "projects"     && <SpecialProjectsTab />}
          {activeTab === "linkage"      && <DataLinkageTab />}
          {activeTab === "access"       && <AccessControlTab />}
          {activeTab === "performance"  && <SDOPerformance />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
