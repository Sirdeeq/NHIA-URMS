import * as React from "react";
import {
  FileText, CheckSquare, BarChart3, Plus, Clock,
  TrendingUp, Users, Activity, Compass, AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";

interface Props {
  onNewReport: () => void;
  onViewSubmissions: () => void;
}

const MONTHLY_DATA = [
  { month: "Jan", submitted: 8,  approved: 7  },
  { month: "Feb", submitted: 10, approved: 9  },
  { month: "Mar", submitted: 12, approved: 11 },
  { month: "Apr", submitted: 9,  approved: 8  },
  { month: "May", submitted: 14, approved: 13 },
  { month: "Jun", submitted: 11, approved: 10 },
];

const STATE_OFFICES = [
  { name: "Lagos State Office",   reports: 12, status: "On Track",  compliance: 98 },
  { name: "Ogun State Office",    reports: 9,  status: "On Track",  compliance: 94 },
  { name: "Oyo State Office",     reports: 7,  status: "Delayed",   compliance: 78 },
  { name: "Osun State Office",    reports: 11, status: "On Track",  compliance: 91 },
  { name: "Ondo State Office",    reports: 6,  status: "Pending",   compliance: 65 },
];

const STATUS_COLORS: Record<string, string> = {
  "On Track": "bg-[#e8f5ee] text-[#145c3f] border-[#d4e8dc]",
  "Delayed":  "bg-amber-100 text-amber-700 border-amber-200",
  "Pending":  "bg-rose-100 text-rose-600 border-rose-200",
};

export default function StateCoordinatorPanel({ onNewReport, onViewSubmissions }: Props) {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "State Offices",     value: "5",    trend: "+0",   trendUp: true,  icon: <Users className="w-5 h-5 text-blue-600" />,    tint: "kpi-blue"   },
          { title: "Reports This Month",value: "47",   trend: "+8%",  trendUp: true,  icon: <FileText className="w-5 h-5 text-[#145c3f]" />, tint: "kpi-green"  },
          { title: "Pending Review",    value: "6",    trend: "-2",   trendUp: false, icon: <Clock className="w-5 h-5 text-amber-600" />,    tint: "kpi-amber"  },
          { title: "Compliance Rate",   value: "85.2%",trend: "+1.4%",trendUp: true,  icon: <CheckSquare className="w-5 h-5 text-purple-600" />, tint: "kpi-purple" },
        ].map(k => (
          <div key={k.title} className={`${k.tint} rounded-2xl p-5 border border-white/60 shadow-sm`}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">{k.icon}</div>
              <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${k.trendUp ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                <TrendingUp className={`w-3 h-3 ${!k.trendUp ? "rotate-180" : ""}`} />{k.trend}
              </span>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{k.value}</p>
            <p className="text-sm font-semibold text-slate-700 mt-1">{k.title}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <Plus className="w-5 h-5" />,      title: "Submit Report",      desc: "Submit a new monthly report",          action: onNewReport,       primary: true  },
          { icon: <FileText className="w-5 h-5" />,  title: "My Submissions",     desc: "View all submitted reports",           action: onViewSubmissions, primary: false },
          { icon: <BarChart3 className="w-5 h-5" />, title: "State Performance",  desc: "View compliance across state offices", action: undefined,         primary: false },
        ].map(c => (
          <button key={c.title} onClick={c.action}
            className={`flex flex-col items-start p-5 rounded-2xl border text-left group transition-all hover:shadow-md ${
              c.primary ? "bg-[#145c3f] text-white border-[#0f3d2e]" : "bg-white border-[#d4e8dc] hover:border-[#25a872]"
            }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
              c.primary ? "bg-white/20" : "bg-[#e8f5ee] text-[#145c3f]"
            }`}>{c.icon}</div>
            <p className={`text-sm font-bold ${c.primary ? "text-white" : "text-slate-800"}`}>{c.title}</p>
            <p className={`text-xs mt-0.5 ${c.primary ? "text-white/70" : "text-slate-500"}`}>{c.desc}</p>
          </button>
        ))}
      </div>

      {/* Chart + State offices table */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly submissions chart */}
        <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-800">Monthly Report Submissions</CardTitle>
            <CardDescription className="text-xs">Submitted vs Approved — 2025</CardDescription>
          </CardHeader>
          <CardContent className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_DATA} barSize={14} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8f5ee" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#5a7a6a" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5a7a6a" }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: 12, border: "1px solid #d4e8dc", fontSize: 12 }} />
                <Bar dataKey="submitted" fill="#d1f5e4" radius={[6,6,0,0]} name="Submitted" />
                <Bar dataKey="approved"  fill="#25a872" radius={[6,6,0,0]} name="Approved"  />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* State offices compliance */}
        <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#25a872]" /> State Office Compliance
            </CardTitle>
            <CardDescription className="text-xs">Reporting status across assigned states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {STATE_OFFICES.map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <p className="text-xs font-semibold text-slate-700 w-36 shrink-0 truncate">{s.name}</p>
                <div className="flex-1 h-2 bg-[#e8f5ee] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all bg-[#25a872]" style={{ width: `${s.compliance}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-700 w-10 text-right">{s.compliance}%</span>
                <Badge className={`text-[9px] px-1.5 py-0 border ${STATUS_COLORS[s.status]}`}>{s.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Directives / tasks */}
      <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#25a872]" /> Assigned Directives
          </CardTitle>
          <CardDescription className="text-xs">Tasks from HQ / Zonal Coordinator</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f0fdf7]">
                <TableHead className="text-xs font-bold text-slate-600">Directive</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">From</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Deadline</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { title: "Q2 Enrollment Data Verification",  from: "HQ Admin",           deadline: "Jul 25, 2025", status: "Pending"   },
                { title: "Monthly Financial Reconciliation", from: "Zonal Coordinator",  deadline: "Jul 30, 2025", status: "In Progress"},
                { title: "State Office Compliance Audit",    from: "HQ Admin",           deadline: "Aug 5, 2025",  status: "Pending"   },
              ].map((d, i) => (
                <TableRow key={i} className="hover:bg-[#f0fdf7] transition-colors">
                  <TableCell className="text-sm font-medium">{d.title}</TableCell>
                  <TableCell className="text-sm text-slate-500">{d.from}</TableCell>
                  <TableCell className="text-sm text-slate-500">{d.deadline}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] border ${
                      d.status === "In Progress" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-amber-100 text-amber-700 border-amber-200"
                    }`}>{d.status}</Badge>
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
