import * as React from "react";
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  MapPin, 
  MoreHorizontal, 
  Eye, 
  MessageSquare, 
  CheckCircle, 
  ChevronRight,
  FileText,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Download
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// --- Mock Data ---

const REPORTS = [
  { id: "REP-001", state: "Lagos", type: "Monthly Operations", period: "Oct 2023", status: "Pending", updated: "2 hours ago", officer: "SO (Lagos)" },
  { id: "REP-002", state: "Ogun", type: "Monthly Operations", period: "Oct 2023", status: "Reviewed", updated: "1 day ago", officer: "SO (Ogun)" },
  { id: "REP-003", state: "Oyo", type: "Monthly Operations", period: "Oct 2023", status: "Forwarded", updated: "3 days ago", officer: "SO (Oyo)" },
  { id: "REP-004", state: "Lagos", type: "Quarterly Review", period: "Q3 2023", status: "Reviewed", updated: "1 week ago", officer: "SO (Lagos)" },
  { id: "REP-005", state: "Ekiti", type: "Monthly Operations", period: "Oct 2023", status: "Pending", updated: "5 hours ago", officer: "SO (Ekiti)" },
];

const STATUS_COLORS: Record<string, string> = {
  "Pending": "bg-amber-100 text-amber-700 border-amber-200",
  "Reviewed": "bg-blue-100 text-blue-700 border-blue-200",
  "Forwarded": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Clarification": "bg-rose-100 text-rose-700 border-rose-200",
};

interface ZonalReviewProps {
  onCompose: () => void;
}

export default function ZonalReview({ onCompose }: ZonalReviewProps) {
  const [selectedReport, setSelectedReport] = React.useState<typeof REPORTS[0] | null>(null);
  const [filterStatus, setFilterStatus] = React.useState("All");

  const handleMarkReviewed = (id: string) => {
    toast.success(`Report ${id} marked as reviewed`);
  };

  const handleRequestClarification = (id: string) => {
    toast.info(`Clarification request sent for ${id}`);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Zonal Tactical Review</h1>
          <p className="text-muted-foreground">Review and validate state-level reports across your zone.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export Zone Data
          </Button>
          <Button 
            className="bg-orange-action hover:bg-orange-600 gap-2 shadow-lg shadow-orange-500/20"
            onClick={onCompose}
          >
            <ArrowUpRight className="w-4 h-4" /> Forward to HQ
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search state or officer..." className="pl-10" />
              </div>
              <Select defaultValue="all-states">
                <SelectTrigger className="w-[180px]">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-states">All States</SelectItem>
                  <SelectItem value="lagos">Lagos</SelectItem>
                  <SelectItem value="ogun">Ogun</SelectItem>
                  <SelectItem value="oyo">Oyo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
              <Separator orientation="vertical" className="hidden lg:block h-8" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2">Status:</span>
              {["All", "Pending", "Reviewed", "Forwarded"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className={`rounded-full px-4 h-8 text-xs ${filterStatus === status ? "bg-primary" : ""}`}
                >
                  {status}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Separator orientation="vertical" className="hidden lg:block h-8" />
              <Select defaultValue="oct-2023">
                <SelectTrigger className="w-[150px]">
                  <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oct-2023">Oct 2023</SelectItem>
                  <SelectItem value="sep-2023">Sep 2023</SelectItem>
                  <SelectItem value="aug-2023">Aug 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold">State Office</TableHead>
              <TableHead className="font-bold">Report Type</TableHead>
              <TableHead className="font-bold">Period</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Last Updated</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {REPORTS.filter(r => filterStatus === "All" || r.status === filterStatus).map((report) => (
              <TableRow 
                key={report.id} 
                className="cursor-pointer hover:bg-slate-50/50 transition-colors group"
                onClick={() => setSelectedReport(report)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {report.state.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{report.state} Office</p>
                      <p className="text-[10px] text-muted-foreground">{report.officer}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-medium">{report.type}</Badge>
                </TableCell>
                <TableCell className="text-sm font-medium">{report.period}</TableCell>
                <TableCell>
                  <Badge className={`${STATUS_COLORS[report.status]} border shadow-none`}>
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{report.updated}</TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSelectedReport(report)}>
                        <Eye className="w-4 h-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRequestClarification(report.id)}>
                        <MessageSquare className="w-4 h-4 mr-2" /> Request Clarification
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMarkReviewed(report.id)} className="text-primary font-bold">
                        <CheckCircle className="w-4 h-4 mr-2" /> Mark as Reviewed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Report Detail Side Panel */}
      <Sheet open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <SheetContent className="sm:max-w-xl p-0 flex flex-col">
          <SheetHeader className="p-6 bg-slate-900 text-white">
            <div className="flex items-center justify-between mb-2">
              <Badge className={STATUS_COLORS[selectedReport?.status || ""]}>
                {selectedReport?.status}
              </Badge>
              <p className="text-[10px] uppercase tracking-widest text-white/50">{selectedReport?.id}</p>
            </div>
            <SheetTitle className="text-white text-xl font-bold">{selectedReport?.state} State Report</SheetTitle>
            <SheetDescription className="text-white/60">
              {selectedReport?.type} • {selectedReport?.period}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Revenue</p>
                  <p className="text-lg font-bold">₦ 12.4M</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Enrolment</p>
                  <p className="text-lg font-bold">1,240</p>
                </div>
              </div>

              {/* Activity Narrative */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Activity Narrative
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border">
                  During the month of October, the Lagos state office conducted 5 sensitization programs across 3 local governments. 
                  We also held a major stakeholder meeting with the State Ministry of Health to discuss the roll-out of the new 
                  enrolment drive. Challenges included logistics for remote areas, but overall targets were met.
                </p>
              </div>

              <Separator />

              {/* Attachments */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Supporting Documents
                </h4>
                <div className="space-y-2">
                  {["Bank_Statement_Oct23.pdf", "Enrolment_Summary.xlsx"].map(file => (
                    <div key={file} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">{file}</span>
                      </div>
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Clarification History */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" /> Clarification History
                </h4>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-xs text-amber-800 italic">No clarification requests for this report yet.</p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 border-t bg-slate-50 flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => handleRequestClarification(selectedReport?.id || "")}
            >
              <MessageSquare className="w-4 h-4" /> Request Clarification
            </Button>
            <Button 
              className="flex-1 bg-primary gap-2"
              onClick={() => handleMarkReviewed(selectedReport?.id || "")}
            >
              <CheckCircle className="w-4 h-4" /> Mark Reviewed
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
