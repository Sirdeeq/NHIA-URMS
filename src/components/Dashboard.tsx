import * as React from "react";
import { 
  Home, 
  FileText, 
  CheckSquare, 
  Compass, 
  Database, 
  Archive, 
  Shield, 
  Bell, 
  Settings, 
  LogOut, 
  Menu,
  ChevronDown,
  TrendingUp,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  BarChart3,
  Map as MapIcon,
  MessageSquare,
  Flag,
  History,
  FileSearch
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Area
} from "recharts";

// --- Types ---

type Role = "state-officer" | "zonal-director" | "sdo" | "hq-department" | "audit";

interface DashboardProps {
  role: Role;
  onLogout: () => void;
}

// --- Mock Data ---

const CHART_DATA = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 900 },
];

const RECENT_ACTIVITY = [
  { id: 1, action: "Report Submitted", user: "John Doe (Lagos)", time: "2 hours ago", status: "Pending" },
  { id: 2, action: "Directive Created", user: "HQ Admin", time: "4 hours ago", status: "Active" },
  { id: 3, action: "Report Approved", user: "Zonal Director", time: "1 day ago", status: "Completed" },
  { id: 4, action: "Audit Flagged", user: "Audit Team", time: "2 days ago", status: "Flagged" },
];

// --- Sub-components for Roles ---

const StateOfficerPanel = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <QuickActionCard icon={<Plus className="w-6 h-6" />} title="Submit New Report" description="Start a fresh monthly submission" color="bg-orange-action" />
      <QuickActionCard icon={<Clock className="w-6 h-6" />} title="Continue Draft" description="Resume your saved progress" color="bg-primary" />
      <QuickActionCard icon={<FileText className="w-6 h-6" />} title="View Submitted" description="Access your submission history" color="bg-primary" />
    </div>
    <Card>
      <CardHeader>
        <CardTitle>Assigned Directives</CardTitle>
        <CardDescription>Tasks and instructions from HQ/Zonal office</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Directive Title</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Q1 Enrollment Data Verification</TableCell>
              <TableCell>Oct 25, 2023</TableCell>
              <TableCell><Badge variant="outline" className="text-orange-action border-orange-action">Pending</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Monthly Financial Reconciliation</TableCell>
              <TableCell>Oct 30, 2023</TableCell>
              <TableCell><Badge variant="outline" className="text-blue-500 border-blue-500">Submitted</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

const ZonalDirectorPanel = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>State Reporting Compliance</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Zonal Tactical Input</CardTitle>
          <CardDescription>Provide oversight commentary for HQ</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea 
            className="w-full h-[200px] p-3 rounded-md border border-input bg-background resize-none focus:ring-2 focus:ring-primary outline-none"
            placeholder="Enter zonal performance summary and tactical observations..."
          />
          <Button className="mt-4 bg-orange-action hover:bg-orange-600">Submit Commentary</Button>
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>State Reports Queue</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>State</TableHead>
              <TableHead>Report Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {["Lagos", "Ogun", "Oyo"].map((state) => (
              <TableRow key={state}>
                <TableCell className="font-medium">{state}</TableCell>
                <TableCell>Monthly Operations</TableCell>
                <TableCell>Oct 12, 2023</TableCell>
                <TableCell><Badge>Pending Review</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Review</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

const SDOPanel = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>National Reporting Activity</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center bg-muted/30 rounded-md border border-dashed">
          <div className="text-center space-y-2">
            <MapIcon className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">Interactive Nigeria Map Visualization</p>
            <p className="text-xs text-muted-foreground/60">Heatmap showing real-time reporting status per Zone</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Directive Tracker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <KanbanColumn title="To Do" count={5} color="bg-slate-200" />
          <KanbanColumn title="In Progress" count={12} color="bg-blue-100" />
          <KanbanColumn title="Completed" count={45} color="bg-green-100" />
        </CardContent>
      </Card>
    </div>
  </div>
);

const HQPanel = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export</Button>
      </div>
      <CardTitle className="text-lg">Departmental Data Analysis</CardTitle>
    </div>
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zone</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>South West</TableCell>
                <TableCell>Lagos</TableCell>
                <TableCell>Claims Processed</TableCell>
                <TableCell className="text-right font-mono">1,240,000</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

const AuditPanel = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-l-4 border-l-destructive">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Critical Flags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs text-muted-foreground">Inconsistencies detected in last 24h</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-orange-action">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-action flex items-center gap-2">
            <Flag className="w-4 h-4" /> Pending Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">45</p>
          <p className="text-xs text-muted-foreground">Reports requiring manual audit</p>
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report ID</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Flags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono text-xs">REP-2023-001</TableCell>
              <TableCell>Kano State</TableCell>
              <TableCell><Badge variant="destructive">Flagged</Badge></TableCell>
              <TableCell className="text-xs text-destructive">Stock Mismatch</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

// --- Helper Components ---

const KPIStat = ({ title, value, trend, icon, trendUp }: { title: string, value: string, trend: string, icon: React.ReactNode, trendUp?: boolean }) => (
  <Card className="overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-green-600' : 'text-orange-600'}`}>
          <TrendingUp className={`w-3 h-3 ${!trendUp && 'rotate-180'}`} />
          {trend}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
      </div>
    </CardContent>
  </Card>
);

const QuickActionCard = ({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) => (
  <button className="flex flex-col items-start p-6 rounded-xl border border-border/50 bg-card hover:shadow-lg transition-all text-left group w-full">
    <div className={`p-3 rounded-xl ${color} text-white mb-4 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h4 className="font-bold text-sm mb-1">{title}</h4>
    <p className="text-xs text-muted-foreground">{description}</p>
  </button>
);

const KanbanColumn = ({ title, count, color }: { title: string, count: number, color: string }) => (
  <div className={`p-4 rounded-lg ${color} flex items-center justify-between`}>
    <span className="text-sm font-bold">{title}</span>
    <Badge variant="secondary" className="bg-white/50">{count}</Badge>
  </div>
);

// --- Main Dashboard Component ---

export default function Dashboard({ role, onLogout }: DashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const getRoleLabel = (r: Role) => {
    switch(r) {
      case "state-officer": return "State Officer";
      case "zonal-director": return "Zonal Director";
      case "sdo": return "SDO / DGO";
      case "hq-department": return "HQ Department";
      case "audit": return "Audit Team";
    }
  };

  const menuItems = [
    { icon: <Home className="w-4 h-4" />, label: "Home", active: true },
    { icon: <FileText className="w-4 h-4" />, label: "Submit Report" },
    { icon: <CheckSquare className="w-4 h-4" />, label: "Review Reports" },
    { icon: <Compass className="w-4 h-4" />, label: "Directives" },
    { icon: <Database className="w-4 h-4" />, label: "HQ Data" },
    { icon: <Archive className="w-4 h-4" />, label: "Archive" },
    { icon: <Shield className="w-4 h-4" />, label: "Audit" },
    { icon: <Bell className="w-4 h-4" />, label: "Notifications" },
    { icon: <Settings className="w-4 h-4" />, label: "Settings" },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-slate-50/50">
        <Sidebar collapsible="icon" className="border-r border-border/50">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-primary tracking-tight group-data-[collapsible=icon]:hidden">NHIA URMS</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <ScrollArea className="h-full py-4">
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton 
                      tooltip={item.label}
                      isActive={item.active}
                      className="h-10 px-4"
                    >
                      {item.icon}
                      <span className="ml-3 font-medium">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border/50">
            <SidebarMenuButton onClick={onLogout} className="h-10 px-4 text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4" />
              <span className="ml-3 font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col overflow-hidden">
          {/* Top Nav */}
          <header className="h-16 border-b border-border/50 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold px-3 py-1">
                  {getRoleLabel(role)}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search reports..." 
                  className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-orange-action rounded-full border-2 border-white" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger className="p-1 h-auto gap-2 hover:bg-slate-100 rounded-full pr-3 flex items-center transition-colors outline-none cursor-pointer">
                  <Avatar className="w-8 h-8 border border-border/50">
                    <AvatarImage src="https://picsum.photos/seed/user/200" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-bold leading-none">John Doe</p>
                    <p className="text-[10px] text-muted-foreground">ssirdeeq@gmail.com</p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                    <DropdownMenuItem>Security</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-destructive">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Welcome Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back, John</h1>
                  <p className="text-muted-foreground">Here's what's happening in NHIA URMS today.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <BarChart3 className="w-4 h-4" /> Reports
                  </Button>
                  <Button className="bg-orange-action hover:bg-orange-600 gap-2 shadow-lg shadow-orange-500/20">
                    <Plus className="w-4 h-4" /> New Submission
                  </Button>
                </div>
              </div>

              {/* KPI Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPIStat title="Reports Submitted" value="124" trend="+12%" icon={<FileText className="w-5 h-5" />} trendUp />
                <KPIStat title="Pending Review" value="18" trend="-5%" icon={<Clock className="w-5 h-5" />} />
                <KPIStat title="Open Directives" value="06" trend="+2" icon={<Compass className="w-5 h-5" />} trendUp />
                <KPIStat title="Compliance Rate" value="98.2%" trend="+0.4%" icon={<CheckSquare className="w-5 h-5" />} trendUp />
              </div>

              {/* Dynamic Panel Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  {/* Role Specific Content */}
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {role === "state-officer" && <StateOfficerPanel />}
                    {role === "zonal-director" && <ZonalDirectorPanel />}
                    {role === "sdo" && <SDOPanel />}
                    {role === "hq-department" && <HQPanel />}
                    {role === "audit" && <AuditPanel />}
                  </motion.div>
                </div>

                {/* Sidebar Content */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" /> Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {RECENT_ACTIVITY.map((activity, idx) => (
                          <div key={activity.id} className="flex gap-4 relative">
                            {idx !== RECENT_ACTIVITY.length - 1 && (
                              <div className="absolute left-[11px] top-8 w-[2px] h-8 bg-slate-100" />
                            )}
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-1">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-bold leading-none">{activity.action}</p>
                              <p className="text-xs text-muted-foreground">{activity.user}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-muted-foreground font-medium">{activity.time}</span>
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 uppercase tracking-wider">
                                  {activity.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="ghost" className="w-full mt-6 text-xs text-muted-foreground hover:text-primary">
                        View All Activity
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary text-primary-foreground overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <CardHeader>
                      <CardTitle className="text-lg">System Health</CardTitle>
                      <CardDescription className="text-primary-foreground/70">All systems operational</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Data Sync</span>
                        <span className="font-mono">100%</span>
                      </div>
                      <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-white" />
                      </div>
                      <p className="text-[10px] text-primary-foreground/60">Last sync: 2 minutes ago</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
