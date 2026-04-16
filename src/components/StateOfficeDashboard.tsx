import * as React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import {
  ArrowLeft, ChevronRight, TrendingUp, TrendingDown,
  FileText, CheckSquare, Clock, AlertCircle, Users,
  Banknote, Activity, Building2, Layers, MapPin,
  ShieldCheck, Wifi, LayoutGrid, Briefcase, Scale,
  Megaphone, BookOpen, PackageSearch, ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "motion/react";

// ─── Department definitions (mirrors seedDepartmentsUnits.js) ─────────────────
const DEPARTMENTS = [
  {
    code: "FIN", name: "Finance & Accounts",
    icon: <Banknote className="w-4 h-4" />, color: "#3b82f6", tint: "kpi-blue",
    desc: "Financial operations, budgeting, revenue and expenditure reporting.",
    units: [
      { code: "FIN-REV",  name: "Revenue & IGR Unit",        desc: "Internally Generated Revenue tracking and reporting." },
      { code: "FIN-EXP",  name: "Expenditure & Budget Unit", desc: "Budget planning, monitoring and expenditure control." },
      { code: "FIN-ACC",  name: "Accounts & Reconciliation", desc: "Financial reconciliation, ledger management and audit support." },
      { code: "FIN-PAY",  name: "Payroll Unit",               desc: "Staff payroll processing and remittances." },
    ],
  },
  {
    code: "HI", name: "Health Insurance",
    icon: <ShieldCheck className="w-4 h-4" />, color: "#25a872", tint: "kpi-green",
    desc: "Enrolment, claims processing, and health insurance scheme management.",
    units: [
      { code: "HI-ENR",  name: "Enrolment & Registration",  desc: "GIFSHIP, FSSHIP, BHCPF and other scheme enrolments." },
      { code: "HI-CLM",  name: "Claims Processing Unit",    desc: "Verification and processing of health insurance claims." },
      { code: "HI-HCF",  name: "HCF Accreditation Unit",   desc: "Accreditation and re-accreditation of healthcare facilities." },
      { code: "HI-QA",   name: "Quality Assurance Unit",   desc: "Mystery shopping, QA visits and compliance monitoring." },
    ],
  },
  {
    code: "ICT", name: "ICT & Digital Services",
    icon: <Wifi className="w-4 h-4" />, color: "#8b5cf6", tint: "kpi-purple",
    desc: "Information systems, digital infrastructure and data management.",
    units: [
      { code: "ICT-SYS",  name: "Systems & Infrastructure", desc: "Server management, network and IT infrastructure." },
      { code: "ICT-DATA", name: "Data Management Unit",     desc: "Database administration, data integrity and reporting." },
      { code: "ICT-DEV",  name: "Software Development",    desc: "Development and maintenance of NHIA digital platforms." },
      { code: "ICT-SUP",  name: "IT Support Unit",         desc: "End-user support, hardware and software troubleshooting." },
    ],
  },
  {
    code: "AUD", name: "Audit & Compliance",
    icon: <ClipboardList className="w-4 h-4" />, color: "#ef4444", tint: "kpi-amber",
    desc: "Internal audit, risk management and regulatory compliance oversight.",
    units: [
      { code: "AUD-INT",  name: "Internal Audit Unit",      desc: "Periodic internal audits of financial and operational activities." },
      { code: "AUD-RISK", name: "Risk Management Unit",     desc: "Identification, assessment and mitigation of operational risks." },
      { code: "AUD-COMP", name: "Compliance & Enforcement", desc: "Regulatory compliance monitoring and enforcement actions." },
    ],
  },
  {
    code: "HR", name: "Human Resources",
    icon: <Users className="w-4 h-4" />, color: "#f59e0b", tint: "kpi-amber",
    desc: "Staff recruitment, welfare, training, performance and records management.",
    units: [
      { code: "HR-REC",  name: "Recruitment & Placement", desc: "Staff recruitment, onboarding and placement." },
      { code: "HR-TRN",  name: "Training & Development",  desc: "Capacity building, training programmes and staff development." },
      { code: "HR-WEL",  name: "Staff Welfare Unit",      desc: "Staff welfare, leave management and benefits administration." },
      { code: "HR-REC2", name: "Records & Documentation", desc: "Staff records, personnel files and HR documentation." },
    ],
  },
  {
    code: "PLN", name: "Planning, Research & Statistics",
    icon: <BookOpen className="w-4 h-4" />, color: "#06b6d4", tint: "kpi-blue",
    desc: "Strategic planning, policy research, data analysis and statistical reporting.",
    units: [
      { code: "PLN-STR",  name: "Strategic Planning Unit", desc: "Corporate strategy, annual plans and performance targets." },
      { code: "PLN-RES",  name: "Research & Policy Unit",  desc: "Health insurance policy research and evidence generation." },
      { code: "PLN-STAT", name: "Statistics & Reporting",  desc: "National data aggregation, statistical analysis and reporting." },
    ],
  },
  {
    code: "SVC", name: "SERVICOM",
    icon: <Activity className="w-4 h-4" />, color: "#10b981", tint: "kpi-green",
    desc: "Customer satisfaction, complaints management and service delivery standards.",
    units: [
      { code: "SVC-CMP", name: "Complaints Management", desc: "Registration, tracking and resolution of customer complaints." },
      { code: "SVC-SAT", name: "Customer Satisfaction", desc: "Satisfaction surveys, feedback analysis and service improvement." },
      { code: "SVC-STD", name: "Service Standards Unit", desc: "Service charter development and compliance monitoring." },
    ],
  },
  {
    code: "SPD", name: "Special Projects Division",
    icon: <LayoutGrid className="w-4 h-4" />, color: "#ec4899", tint: "kpi-purple",
    desc: "Coordination and monitoring of special health programmes and strategic projects.",
    units: [
      { code: "SPD-CEM",   name: "CEmONC Programme Unit",   desc: "Comprehensive Emergency Obstetric & Newborn Care programme." },
      { code: "SPD-FFP",   name: "FFP Programme Unit",      desc: "Free Family Planning programme coordination." },
      { code: "SPD-BHCPF", name: "BHCPF Coordination Unit", desc: "Basic Health Care Provision Fund programme management." },
      { code: "SPD-PROJ",  name: "Projects Monitoring Unit", desc: "Monitoring and evaluation of special projects and directives." },
    ],
  },
  {
    code: "STK", name: "Stock Verification Division",
    icon: <PackageSearch className="w-4 h-4" />, color: "#64748b", tint: "kpi-blue",
    desc: "Asset management, stock verification and inventory control.",
    units: [
      { code: "STK-VER", name: "Stock Verification Unit", desc: "Periodic stock-taking and physical verification of assets." },
      { code: "STK-AST", name: "Asset Management Unit",   desc: "Asset register maintenance, tagging and disposal." },
      { code: "STK-INV", name: "Inventory Control Unit",  desc: "Inventory tracking, procurement support and store management." },
    ],
  },
  {
    code: "LEG", name: "Legal Services",
    icon: <Scale className="w-4 h-4" />, color: "#7c3aed", tint: "kpi-purple",
    desc: "Legal advisory, contract management and litigation support.",
    units: [
      { code: "LEG-ADV", name: "Legal Advisory Unit",    desc: "Legal opinions, regulatory interpretation and advisory services." },
      { code: "LEG-CON", name: "Contracts & Agreements", desc: "Drafting, review and management of contracts and MOUs." },
      { code: "LEG-LIT", name: "Litigation Unit",        desc: "Management of court cases and dispute resolution." },
    ],
  },
  {
    code: "COM", name: "Communications & Public Affairs",
    icon: <Megaphone className="w-4 h-4" />, color: "#f97316", tint: "kpi-amber",
    desc: "Media relations, public communications, advocacy and stakeholder engagement.",
    units: [
      { code: "COM-MED", name: "Media & Press Unit",        desc: "Press releases, media appearances and public communications." },
      { code: "COM-ADV", name: "Advocacy & Sensitization",  desc: "Community outreach, advocacy campaigns and sensitization." },
      { code: "COM-STK", name: "Stakeholder Relations Unit", desc: "Stakeholder meetings, partnerships and engagement management." },
    ],
  },
] as const;

// ─── Department → monthly view mapping ───────────────────────────────────────
const DEPT_VIEW_MAP: Record<string, string> = {
  FIN:  "finance-monthly",
  HR:   "admin-monthly",
  HI:   "sqa-monthly",       // Health Insurance → SQA (QA/accreditation)
  SVC:  "complaints-monthly", // SERVICOM → Complaints
  COM:  "outreach-monthly",   // Communications → Outreach
  SPD:  "programmes-monthly", // Special Projects → Programmes
  ICT:  "sqa-monthly",        // ICT — no dedicated form, closest is SQA
  AUD:  "sqa-monthly",        // Audit — no dedicated form
  PLN:  "programmes-monthly", // Planning → Programmes
  STK:  "stock-verification", // Stock → Stock Verification page
  LEG:  "finance-monthly",    // Legal — no dedicated form, closest is Finance
};

type Department = typeof DEPARTMENTS[number];
type Unit = Department["units"][number];
function deptSeed(code: string) {
  return code.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

function mockDeptStats(code: string) {
  const s = deptSeed(code);
  const reports    = 4  + (s % 20);
  const pending    = 0  + (s % Math.max(1, reports));
  const approved   = reports - pending;
  const compliance = 60 + (s % 39);
  const staff      = 3  + (s % 18);
  const directives = 1  + (s % 5);
  const trendUp    = s % 3 !== 0;
  return { reports, pending, approved, compliance, staff, directives, trendUp };
}

function mockUnitStats(code: string) {
  const s = deptSeed(code);
  const tasks     = 2 + (s % 10);
  const completed = s % Math.max(1, tasks);
  const overdue   = s % 3 === 0 ? 1 : 0;
  return { tasks, completed, overdue };
}

function mockDeptQuarterly(code: string) {
  const s = deptSeed(code);
  return ["Q1", "Q2", "Q3", "Q4"].map((q, i) => ({
    quarter: q,
    reports:  4 + ((s + i * 7)  % 16),
    approved: 2 + ((s + i * 5)  % 12),
    igr:      Math.round((0.5 + ((s + i * 3) % 15) * 0.1) * 10) / 10,
  }));
}

function complianceColor(v: number) {
  if (v >= 85) return "text-emerald-600";
  if (v >= 70) return "text-amber-600";
  return "text-rose-600";
}
function complianceBg(v: number) {
  if (v >= 85) return "#25a872";
  if (v >= 70) return "#f59e0b";
  return "#ef4444";
}
function statusBadge(status: string) {
  if (status === "Submitted")  return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "Pending")    return "bg-amber-100  text-amber-700  border-amber-200";
  if (status === "Overdue")    return "bg-rose-100   text-rose-700   border-rose-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
}

// ─── Clickable KPI card ───────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon, tint, active, onClick,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; tint: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`${tint} rounded-2xl p-4 border shadow-sm text-left w-full group transition-all
        ${onClick ? "cursor-pointer hover:shadow-md hover:scale-[1.02]" : "cursor-default"}
        ${active ? "ring-2 ring-[#145c3f] ring-offset-1" : "border-white/60"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
          {icon}
        </div>
        {onClick && (
          <ChevronRight className={`w-4 h-4 transition-colors ${active ? "text-[#145c3f]" : "text-slate-300 group-hover:text-[#145c3f]"}`} />
        )}
      </div>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      <p className="text-xs font-semibold text-slate-700 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
    </button>
  );
}

// ─── Department detail panel ──────────────────────────────────────────────────
function DepartmentDetail({
  dept, stateName, onBack, onNewSubmission,
}: {
  dept: Department; stateName: string; onBack: () => void;
  onNewSubmission?: (view: string) => void;
}) {
  const stats    = mockDeptStats(dept.code);
  const quarterly = mockDeptQuarterly(dept.code);
  const [activeUnit, setActiveUnit] = React.useState<string | null>(null);

  const directives = [
    { title: "Q3 Operational Report Submission",  deadline: "Oct 25, 2025", status: stats.pending > 3 ? "Pending" : "Submitted" },
    { title: "Monthly Activity Summary",           deadline: "Oct 30, 2025", status: "Submitted" },
    { title: "Staff Attendance & Welfare Returns", deadline: "Nov 5, 2025",  status: stats.compliance < 75 ? "Overdue" : "Pending" },
  ];

  return (
    <motion.div
      key={`dept-${dept.code}`}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#d4e8dc] hover:bg-[#e8f5ee] text-slate-600 hover:text-[#145c3f] transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: dept.color }}
          >
            {dept.icon}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-slate-900 truncate">{dept.name}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {stateName} State Office
            </p>
          </div>
        </div>
        <Badge className={`text-xs px-3 py-1 font-bold shrink-0 ${
          stats.compliance >= 85 ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
          stats.compliance >= 70 ? "bg-amber-100 text-amber-700 border-amber-200" :
          "bg-rose-100 text-rose-700 border-rose-200"
        }`}>
          {stats.compliance}% Compliance
        </Badge>
        {onNewSubmission && DEPT_VIEW_MAP[dept.code] && (
          <Button
            size="sm"
            className="bg-orange-action hover:bg-orange-600 gap-1.5 shadow-lg shadow-orange-500/20 shrink-0"
            onClick={() => onNewSubmission(DEPT_VIEW_MAP[dept.code])}
          >
            <FileText className="w-3.5 h-3.5" /> New Submission
          </Button>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Reports"       value={stats.reports}    sub="This year"       icon={<FileText    className="w-4 h-4 text-blue-600"    />} tint="kpi-blue"   />
        <StatCard label="Approved"      value={stats.approved}   sub="Verified"        icon={<CheckSquare className="w-4 h-4 text-emerald-600" />} tint="kpi-green"  />
        <StatCard label="Pending"       value={stats.pending}    sub="Awaiting action" icon={<Clock       className="w-4 h-4 text-amber-600"   />} tint="kpi-amber"  />
        <StatCard label="Staff"         value={stats.staff}      sub="Active members"  icon={<Users       className="w-4 h-4 text-purple-600"  />} tint="kpi-purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Quarterly Activity</CardTitle>
            <CardDescription className="text-xs">Reports submitted vs approved — 2025</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterly} barSize={16} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8f5ee" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: "#5a7a6a" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5a7a6a" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid #d4e8dc", fontSize: 12 }} />
                <Bar dataKey="reports"  fill="#d1f5e4" radius={[6,6,0,0]} name="Submitted" />
                <Bar dataKey="approved" fill="#25a872" radius={[6,6,0,0]} name="Approved"  />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">IGR Contribution (₦M)</CardTitle>
            <CardDescription className="text-xs">Quarterly internally generated revenue</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={quarterly}>
                <defs>
                  <linearGradient id={`grad-${dept.code}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={dept.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={dept.color} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8f5ee" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: "#5a7a6a" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5a7a6a" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid #d4e8dc", fontSize: 12 }} />
                <Area type="monotone" dataKey="igr" stroke={dept.color} strokeWidth={2}
                  fill={`url(#grad-${dept.code})`} name="IGR (₦M)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Units breakdown */}
      <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-800">
            Units Breakdown
            <span className="ml-2 text-[10px] font-normal text-slate-400">— click a unit to expand</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {dept.units.map((unit) => {
            const us = mockUnitStats(unit.code);
            const isOpen = activeUnit === unit.code;
            return (
              <div key={unit.code} className="rounded-xl border border-[#d4e8dc] overflow-hidden">
                <button
                  onClick={() => setActiveUnit(isOpen ? null : unit.code)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f0fdf7] transition-colors text-left group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: dept.color + "20", color: dept.color }}>
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-[#145c3f]">{unit.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{unit.code}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-500">{us.completed}/{us.tasks} tasks</span>
                    {us.overdue > 0 && (
                      <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[9px] px-1.5">Overdue</Badge>
                    )}
                    <Progress value={(us.completed / Math.max(1, us.tasks)) * 100}
                      className="w-16 h-1.5 bg-[#e8f5ee]" />
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 bg-[#f8fdfb] border-t border-[#e8f5ee] space-y-2">
                        <p className="text-xs text-slate-500 leading-relaxed">{unit.desc}</p>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                          <div className="rounded-xl bg-white border border-[#d4e8dc] p-3 text-center">
                            <p className="text-lg font-black text-slate-900">{us.tasks}</p>
                            <p className="text-[10px] text-slate-500">Total Tasks</p>
                          </div>
                          <div className="rounded-xl bg-white border border-[#d4e8dc] p-3 text-center">
                            <p className="text-lg font-black text-emerald-600">{us.completed}</p>
                            <p className="text-[10px] text-slate-500">Completed</p>
                          </div>
                          <div className="rounded-xl bg-white border border-[#d4e8dc] p-3 text-center">
                            <p className={`text-lg font-black ${us.overdue > 0 ? "text-rose-600" : "text-slate-400"}`}>{us.overdue}</p>
                            <p className="text-[10px] text-slate-500">Overdue</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Directives */}
      <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-800">Active Directives</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f0fdf7]">
                <TableHead className="text-xs font-bold text-slate-600">Directive</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Deadline</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {directives.map((d) => (
                <TableRow key={d.title} className="hover:bg-[#f0fdf7] transition-colors">
                  <TableCell className="text-sm font-medium">{d.title}</TableCell>
                  <TableCell className="text-sm text-slate-500">{d.deadline}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${statusBadge(d.status)}`}>{d.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main StateOfficeDashboard ────────────────────────────────────────────────
interface StateOfficeDashboardProps {
  stateName?: string;
  zoneName?: string;
  onNewReport?: () => void;
  onAnnualReport?: () => void;
  onViewSubmissions?: () => void;
  onNewSubmission?: (view: string) => void;
}

export default function StateOfficeDashboard({
  stateName = "Lagos",
  zoneName  = "South West",
  onNewReport,
  onAnnualReport,
  onViewSubmissions,
  onNewSubmission,
}: StateOfficeDashboardProps) {
  const [selectedDept, setSelectedDept] = React.useState<Department | null>(null);
  const [filterStatus, setFilterStatus] = React.useState<"all" | "pending" | "overdue">("all");

  // Aggregate state-level stats
  const allStats = DEPARTMENTS.map((d) => ({ dept: d, ...mockDeptStats(d.code) }));
  const totalReports   = allStats.reduce((a, s) => a + s.reports,    0);
  const totalPending   = allStats.reduce((a, s) => a + s.pending,    0);
  const totalApproved  = allStats.reduce((a, s) => a + s.approved,   0);
  const avgCompliance  = Math.round(allStats.reduce((a, s) => a + s.compliance, 0) / allStats.length);
  const totalStaff     = allStats.reduce((a, s) => a + s.staff,      0);
  const totalDirectives = allStats.reduce((a, s) => a + s.directives, 0);

  // Filtered departments
  const filteredDepts = allStats.filter((s) => {
    if (filterStatus === "pending") return s.pending > 0;
    if (filterStatus === "overdue") return s.compliance < 70;
    return true;
  });

  // Pie chart data
  const pieData = [
    { name: "Approved", value: totalApproved, fill: "#25a872" },
    { name: "Pending",  value: totalPending,  fill: "#f59e0b" },
  ];

  if (selectedDept) {
    return (
      <DepartmentDetail
        dept={selectedDept}
        stateName={stateName}
        onBack={() => setSelectedDept(null)}
        onNewSubmission={onNewSubmission}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="state-dashboard"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-[#25a872]" />
              <span className="text-xs font-bold text-[#25a872] uppercase tracking-wider">
                {stateName} State Office · {zoneName} Zone
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">State Office Performance</h1>
            <p className="text-sm text-slate-500 mt-0.5">{DEPARTMENTS.length} departments · {totalStaff} staff</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {onNewReport && (
              <Button onClick={onNewReport}
                className="h-9 text-xs rounded-xl bg-[#145c3f] hover:bg-[#0f3d2e] text-white gap-1.5 shadow-md shadow-[#145c3f]/20">
                <FileText className="w-3.5 h-3.5" /> New Report
              </Button>
            )}
            {onAnnualReport && (
              <Button onClick={onAnnualReport} variant="outline"
                className="h-9 text-xs rounded-xl border-[#d4e8dc] hover:bg-[#e8f5ee] gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Annual Report
              </Button>
            )}
            {onViewSubmissions && (
              <Button onClick={onViewSubmissions} variant="outline"
                className="h-9 text-xs rounded-xl border-[#d4e8dc] hover:bg-[#e8f5ee] gap-1.5">
                <ClipboardList className="w-3.5 h-3.5" /> My Submissions
              </Button>
            )}
          </div>
        </div>

        {/* KPI cards — all clickable to filter departments */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Reports"   value={totalReports}   sub="All departments · 2025"
            icon={<FileText    className="w-4 h-4 text-blue-600"    />} tint="kpi-blue"
            active={filterStatus === "all"}
            onClick={() => setFilterStatus("all")}
          />
          <StatCard
            label="Pending Review"  value={totalPending}   sub="Click to filter depts"
            icon={<Clock       className="w-4 h-4 text-amber-600"   />} tint="kpi-amber"
            active={filterStatus === "pending"}
            onClick={() => setFilterStatus(filterStatus === "pending" ? "all" : "pending")}
          />
          <StatCard
            label="Approved"        value={totalApproved}  sub="Verified submissions"
            icon={<CheckSquare className="w-4 h-4 text-emerald-600" />} tint="kpi-green"
            active={false}
            onClick={() => setFilterStatus("all")}
          />
          <StatCard
            label="Avg Compliance"  value={`${avgCompliance}%`} sub="State average"
            icon={<Activity    className="w-4 h-4 text-purple-600"  />} tint="kpi-purple"
            active={filterStatus === "overdue"}
            onClick={() => setFilterStatus(filterStatus === "overdue" ? "all" : "overdue")}
          />
        </div>

        {/* Filter badge */}
        {filterStatus !== "all" && (
          <div className="flex items-center gap-2">
            <Badge className="bg-[#e8f5ee] text-[#145c3f] border-[#d4e8dc] text-xs px-3 py-1">
              {filterStatus === "pending" ? "Showing: Departments with pending reports" : "Showing: Departments with low compliance (<70%)"}
            </Badge>
            <button onClick={() => setFilterStatus("all")} className="text-xs text-slate-400 hover:text-slate-600 underline">
              Clear
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: departments grid */}
          <div className="xl:col-span-2 space-y-6">

            {/* Summary chart */}
            <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800">Departmental Report Activity</CardTitle>
                  <CardDescription className="text-xs">Submitted vs Approved across all departments</CardDescription>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#d1f5e4] inline-block" />Submitted</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#25a872] inline-block" />Approved</span>
                </div>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={allStats.map((s) => ({ name: s.dept.code, reports: s.reports, approved: s.approved }))}
                    barSize={12} barGap={3}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8f5ee" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#5a7a6a" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#5a7a6a" }} axisLine={false} tickLine={false} />
                    <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid #d4e8dc", fontSize: 12 }} />
                    <Bar dataKey="reports"  fill="#d1f5e4" radius={[4,4,0,0]} name="Submitted" />
                    <Bar dataKey="approved" fill="#25a872" radius={[4,4,0,0]} name="Approved"  />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department cards grid */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#25a872]" />
                Departments
                <span className="text-[10px] font-normal text-slate-400 ml-1">— click any card to drill down</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredDepts.map(({ dept, reports, pending, approved, compliance, trendUp }) => (
                  <button
                    key={dept.code}
                    onClick={() => setSelectedDept(dept)}
                    className="flex items-start gap-3 p-4 rounded-2xl border border-[#d4e8dc] bg-white hover:border-[#25a872] hover:shadow-md transition-all text-left group"
                  >
                    {/* Dept icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5"
                      style={{ backgroundColor: dept.color }}
                    >
                      {dept.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-[#145c3f] transition-colors leading-tight">
                          {dept.name}
                        </p>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#25a872] shrink-0 mt-0.5 transition-colors" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{dept.code} · {dept.units.length} units</p>

                      {/* Compliance bar */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <div className="flex-1 h-1.5 bg-[#e8f5ee] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${compliance}%`, backgroundColor: complianceBg(compliance) }}
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${complianceColor(compliance)}`}>{compliance}%</span>
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-slate-500">
                          <span className="font-bold text-slate-700">{reports}</span> reports
                        </span>
                        {pending > 0 && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[9px] px-1.5 py-0 h-4">
                            {pending} pending
                          </Badge>
                        )}
                        {approved > 0 && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[9px] px-1.5 py-0 h-4">
                            {approved} approved
                          </Badge>
                        )}
                        <span className={`ml-auto flex items-center gap-0.5 text-[10px] font-semibold ${trendUp ? "text-emerald-600" : "text-rose-500"}`}>
                          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {trendUp ? "Up" : "Down"}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}

                {filteredDepts.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-slate-400 text-sm">
                    No departments match the current filter.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Report split pie */}
            <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-800">Report Status Split</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[140px]">
                  <PieChart width={140} height={140}>
                    <Pie data={pieData} cx={65} cy={65} innerRadius={40} outerRadius={60}
                      dataKey="value" paddingAngle={3}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RTooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  </PieChart>
                </div>
                <div className="flex justify-center gap-4 mt-1">
                  {pieData.map((p) => (
                    <div key={p.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.fill }} />
                      <span className="text-[11px] text-slate-600">{p.name} <strong>{p.value}</strong></span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Compliance ranking */}
            <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-800">Dept Compliance Ranking</CardTitle>
                <CardDescription className="text-xs">Click to drill into department</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {[...allStats]
                  .sort((a, b) => b.compliance - a.compliance)
                  .slice(0, 6)
                  .map(({ dept, compliance }, i) => (
                    <button
                      key={dept.code}
                      onClick={() => setSelectedDept(dept)}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-[#f0fdf7] border border-[#d4e8dc] hover:border-[#25a872] hover:bg-[#e8f5ee] transition-all group"
                    >
                      <span className={`w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center shrink-0 ${
                        i === 0 ? "bg-[#25a872]" : i === 1 ? "bg-[#3b82f6]" : i === 2 ? "bg-[#f59e0b]" : "bg-slate-300"
                      }`}>{i + 1}</span>
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: dept.color }}
                      >
                        <span className="scale-75">{dept.icon}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 flex-1 text-left truncate group-hover:text-[#145c3f]">
                        {dept.name}
                      </p>
                      <span className={`text-xs font-black ${complianceColor(compliance)}`}>{compliance}%</span>
                      <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#25a872]" />
                    </button>
                  ))}
              </CardContent>
            </Card>

            {/* Attention required */}
            <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" /> Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {allStats
                  .filter((s) => s.compliance < 75 || s.pending > 4)
                  .slice(0, 4)
                  .map(({ dept, compliance, pending }) => (
                    <button
                      key={dept.code}
                      onClick={() => setSelectedDept(dept)}
                      className="w-full flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-100 hover:border-rose-300 transition-all text-left group"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-rose-700 truncate">{dept.name}</p>
                        <p className="text-[10px] text-rose-500">
                          {compliance < 75 ? `${compliance}% compliance` : ""}
                          {compliance < 75 && pending > 4 ? " · " : ""}
                          {pending > 4 ? `${pending} pending` : ""}
                        </p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-rose-300 group-hover:text-rose-500 shrink-0 mt-0.5" />
                    </button>
                  ))}
                {allStats.filter((s) => s.compliance < 75 || s.pending > 4).length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">All departments on track ✓</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
