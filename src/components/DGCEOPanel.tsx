import * as React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight, 
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Activity,
  Zap,
  Bell,
  Info
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Cell
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion } from "motion/react";

import { NigeriaMap, ZONE_PERFORMANCE } from "./NigeriaMap";

// --- Mock Data ---

const NATIONAL_KPIs = [
  { title: "National Compliance", value: "92.4%", trend: "+2.1%", icon: <ShieldCheck className="w-5 h-5" />, status: "success" },
  { title: "Active Directives", value: "14", trend: "0", icon: <FileText className="w-5 h-5" />, status: "warning" },
  { title: "Zones Compliant", value: "5/6", trend: "+1", icon: <MapPin className="w-5 h-5" />, status: "success" },
  { title: "Delayed Reports", value: "3", trend: "-2", icon: <Clock className="w-5 h-5" />, status: "error" },
];

const DIRECTIVES = [
  { title: "Q4 Enrolment Audit", zones: "All Zones", progress: 75, status: "Active" },
  { title: "Facility Accreditation Review", zones: "SW, SS, SE", progress: 40, status: "Active" },
  { title: "Staff ID Harmonization", zones: "HQ Only", progress: 100, status: "Completed" },
  { title: "Emergency Fund Audit", zones: "NE, NW", progress: 15, status: "Delayed" },
];

const ACTIVITY_FEED = [
  { user: "ZD (SW)", action: "Forwarded Consolidated Report", time: "10 mins ago", type: "success" },
  { user: "AUDIT", action: "Flagged discrepancy in Lagos Finance", time: "45 mins ago", type: "error" },
  { user: "SDO", action: "Updated National Dashboard", time: "2 hours ago", type: "info" },
  { user: "SO (Kano)", action: "Submitted Monthly Report", time: "3 hours ago", type: "success" },
];

const TREND_DATA = [
  { month: "Jan", value: 82 },
  { month: "Feb", value: 85 },
  { month: "Mar", value: 84 },
  { month: "Apr", value: 88 },
  { month: "May", value: 91 },
  { month: "Jun", value: 92 },
];

// --- Components ---

export default function DGCEOPanel() {
  const [selectedZone, setSelectedZone] = React.useState<string | null>(null);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Executive KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {NATIONAL_KPIs.map((kpi, idx) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="relative overflow-hidden border-none shadow-md hover:shadow-lg transition-all group">
              <div className={`absolute top-0 left-0 w-1 h-full ${
                kpi.status === 'success' ? 'bg-green-500' : 
                kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${
                  kpi.status === 'success' ? 'bg-green-50 text-green-600' : 
                  kpi.status === 'warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                }`}>
                  {kpi.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{kpi.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  {kpi.trend !== "0" && (
                    <span className={`text-[10px] font-bold flex items-center ${kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.trend.startsWith('+') ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                      {kpi.trend}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2. National Performance Map */}
        <Card className="lg:col-span-8 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">National Performance Map</CardTitle>
              <CardDescription>Geopolitical zone compliance status</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <MapPin className="w-4 h-4" /> Full Map View
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-8 py-8">
            <NigeriaMap onZoneClick={setSelectedZone} />
            
            <div className="flex-1 w-full space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Zone Performance Details</h4>
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-3">
                  {ZONE_PERFORMANCE.map((zone) => (
                    <div 
                      key={zone.name} 
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedZone === zone.name ? 'ring-2 ring-primary bg-primary/5 border-primary/20' : 'bg-slate-50/50 hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedZone(zone.name)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold">{zone.name}</span>
                        <Badge variant="outline" className={`${
                          zone.status === 'green' ? 'text-green-600 border-green-200 bg-green-50' : 
                          zone.status === 'yellow' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' : 
                          'text-red-600 border-red-200 bg-red-50'
                        }`}>
                          {zone.compliance}% Compliance
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{zone.pending} Pending Reports</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* 6. Critical Alerts Section */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-md bg-red-50/50 border-red-100">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <CardTitle className="text-lg font-bold">Critical Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-red-100 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-red-500">Urgent</Badge>
                  <span className="text-[10px] text-muted-foreground">2h ago</span>
                </div>
                <p className="text-sm font-bold">South East Zone Deadline Missed</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  12 state reports from the SE zone are overdue by 48 hours. Immediate intervention required.
                </p>
                <Button variant="ghost" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-bold">
                  Issue Directive <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
              <div className="p-4 bg-white rounded-xl border border-red-100 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-amber-500">Audit Flag</Badge>
                  <span className="text-[10px] text-muted-foreground">5h ago</span>
                </div>
                <p className="text-sm font-bold">Lagos Finance Discrepancy</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Automated audit detected 15% variance in reported vs bank-verified revenue.
                </p>
                <Button variant="ghost" size="sm" className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50 text-xs font-bold">
                  View Audit Trail <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">All Systems Operational</span>
                </div>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>Server Load</span>
                    <span>24%</span>
                  </div>
                  <Progress value={24} className="h-1" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>Data Sync</span>
                    <span>99.9%</span>
                  </div>
                  <Progress value={99.9} className="h-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3. Directive Control Panel */}
        <Card className="lg:col-span-7 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">National Directives</CardTitle>
              <CardDescription>Active strategic instructions</CardDescription>
            </div>
            <Button className="bg-orange-action hover:bg-orange-600 gap-2 shadow-lg shadow-orange-500/20">
              <Plus className="w-4 h-4" /> Create Directive
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {DIRECTIVES.map((d) => (
                <div key={d.title} className="p-4 rounded-xl border bg-slate-50/50 hover:bg-slate-50 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="text-sm font-bold">{d.title}</h5>
                      <p className="text-[10px] text-muted-foreground">Target: {d.zones}</p>
                    </div>
                    <Badge variant={d.status === 'Delayed' ? 'destructive' : d.status === 'Completed' ? 'default' : 'secondary'} className="text-[10px]">
                      {d.status}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>Progress</span>
                      <span>{d.progress}%</span>
                    </div>
                    <Progress value={d.progress} className={`h-1.5 ${d.status === 'Delayed' ? 'bg-red-100' : ''}`} />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-xs font-bold text-primary">
              View All Directives <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* 4. Real-Time Activity Feed */}
        <Card className="lg:col-span-5 border-none shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Real-Time Activity</CardTitle>
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                <Activity className="w-3 h-3" /> LIVE
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {ACTIVITY_FEED.map((item, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {idx !== ACTIVITY_FEED.length - 1 && (
                    <div className="absolute top-8 left-4 w-0.5 h-10 bg-slate-100" />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    item.type === 'success' ? 'bg-green-100 text-green-600' : 
                    item.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {item.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : 
                     item.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">{item.user}</p>
                    <p className="text-xs text-muted-foreground">{item.action}</p>
                    <p className="text-[10px] text-slate-400">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-8 text-xs font-bold">
              View Full Audit Log
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 5. Strategic Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Monthly Reporting Trend</CardTitle>
            <CardDescription>National compliance percentage over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} domain={[70, 100]} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Zone Performance Comparison</CardTitle>
            <CardDescription>Current period compliance by geopolitical zone</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ZONE_PERFORMANCE}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="compliance" radius={[4, 4, 0, 0]} barSize={30}>
                  {ZONE_PERFORMANCE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.compliance >= 90 ? '#22c55e' : 
                      entry.compliance >= 80 ? '#facc15' : '#ef4444'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-xl text-white">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Top Performing Zone</p>
              <h4 className="text-xl font-bold text-green-900">South West</h4>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">98%</p>
            <p className="text-[10px] text-green-700 font-medium">Compliance Rate</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500 rounded-xl text-white">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Lowest Performing Zone</p>
              <h4 className="text-xl font-bold text-red-900">South East</h4>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-red-600">75%</p>
            <p className="text-[10px] text-red-700 font-medium">Compliance Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
