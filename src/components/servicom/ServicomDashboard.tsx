import * as React from "react";
import {
  ArrowLeft, RefreshCw, Loader2, TrendingUp, CheckCircle2, AlertTriangle,
  Star, ClipboardCheck, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { toast } from "sonner";
import { servicomApi } from "@/lib/api";
import DashboardDrillPanel from "@/components/dashboard/DashboardDrillPanel";
import { useDashboardDrill } from "@/components/dashboard/useDashboardDrill";
import { ClickableKpi, DrillHint, COLORS, getUnitHeadScope } from "@/components/dashboard/dashboardUi";

const UNIT_NAME = "SERVICOM Unit";

interface Props {
  onBack: () => void;
  defaultStateId?: string | null;
  defaultZoneId?: string | null;
}

const SEGMENT_LABELS: Record<string, string> = {
  surveys: "Satisfaction Surveys",
  comment_cards: "Charter Comment Cards",
  complaints: "Complaints",
  visits: "Monitoring Visits",
};

export default function ServicomDashboard({ onBack, defaultStateId, defaultZoneId }: Props) {
  const [data, setData] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  const scope = React.useMemo(() => ({
    state_id: defaultStateId ?? undefined,
    zone_id: defaultZoneId ?? undefined,
  }), [defaultStateId, defaultZoneId]);

  const drill = useDashboardDrill(
    (params) => servicomApi.getDashboardDrill(params),
    scope,
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await servicomApi.getDashboard(scope);
      setData(res.data);
    } catch (err: any) {
      toast.error("Failed to load dashboard", { description: err.message });
    } finally { setLoading(false); }
  }, [scope]);

  React.useEffect(() => { load(); }, [load]);

  const unitScope = getUnitHeadScope(UNIT_NAME, defaultStateId, defaultZoneId);
  const drillCtx = { subtitle: unitScope.drillSubtitle, breadcrumbs: [UNIT_NAME] };

  const monthlyChart = React.useMemo(() => {
    if (!data?.monthly_activity) return [];
    return data.monthly_activity.map((m: any) => ({
      ...m,
      label: m.month?.slice(5) ?? m.month,
    }));
  }, [data]);

  const drillSegment = (segment: string, title: string, extra?: Record<string, string>) => {
    drill.openRecordDrill(segment, title, drillCtx, extra);
  };

  const drillComplaints = (title: string, filters: Record<string, string>) => {
    drill.openRecordDrill("complaints", title, drillCtx, filters);
  };

  const drillMonth = (segment: string, month: string) => {
    drill.openRecordDrill(
      segment,
      `${SEGMENT_LABELS[segment] || segment} — ${month}`,
      { ...drillCtx, breadcrumbs: [...drillCtx.breadcrumbs, "Monthly Activity"] },
      { month },
    );
  };

  const onStateRow = (stateId: number, stateName: string) => {
    drill.openDrill(
      { segment: "state_breakdown", state_id: String(stateId) },
      {
        title: stateName,
        subtitle: "Breakdown by record type under SERVICOM",
        breadcrumbs: [UNIT_NAME, "By State"],
      },
      { resetStack: true },
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="bg-white border-b border-border/50 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">SERVICOM Unit Dashboard</h2>
            <p className="text-xs text-muted-foreground">{unitScope.headline} — click KPIs & charts to drill down</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="w-full px-4 md:px-6 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" /><span>Loading dashboard...</span>
            </div>
          ) : !data ? null : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
                <ClickableKpi
                  label="Satisfaction Surveys"
                  value={data.satisfaction_surveys ?? 0}
                  icon={<ClipboardCheck className="w-5 h-5 text-emerald-600" />}
                  onClick={() => drillSegment("surveys", "Satisfaction Surveys")}
                />
                <ClickableKpi
                  label="Charter Cards"
                  value={data.comment_cards ?? 0}
                  icon={<Star className="w-5 h-5 text-indigo-600" />}
                  onClick={() => drillSegment("comment_cards", "Charter Comment Cards")}
                />
                <ClickableKpi
                  label="Complaints Received"
                  value={data.complaints_received ?? 0}
                  icon={<MessageSquare className="w-5 h-5 text-blue-600" />}
                  onClick={() => drillSegment("complaints", "All Complaints")}
                />
                <ClickableKpi
                  label="Avg Satisfaction"
                  value={data.avg_satisfaction != null ? `${data.avg_satisfaction}%` : "—"}
                  icon={<TrendingUp className="w-5 h-5 text-[#25a872]" />}
                  drillable={false}
                />
                <ClickableKpi
                  label="Avg Charter Score"
                  value={data.avg_comment_card_score != null ? data.avg_comment_card_score : "—"}
                  icon={<Star className="w-5 h-5 text-purple-600" />}
                  drillable={false}
                />
                <ClickableKpi
                  label="Resolution Rate"
                  value={`${data.complaint_resolution_rate ?? 0}%`}
                  icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  onClick={() => drillComplaints("Resolved / Closed Complaints", { status: "resolved" })}
                />
                <ClickableKpi
                  label="SLA Compliance"
                  value={data.sla_compliance_rate != null ? `${data.sla_compliance_rate}%` : "—"}
                  icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
                  drillable={false}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="rounded-2xl border-[#d4e8dc]">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Monthly Activity</CardTitle>
                    <DrillHint label="All complaints" onClick={() => drillSegment("complaints", "All Complaints")} />
                  </CardHeader>
                  <CardContent className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyChart}
                        onClick={(e: any) => {
                          const month = e?.activePayload?.[0]?.payload?.month;
                          if (month) drillMonth("complaints", month);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip />
                        <Legend
                          wrapperStyle={{ fontSize: 10, cursor: "pointer" }}
                          onClick={(e: any) => {
                            const key = String(e?.dataKey || "");
                            const seg = key === "comment_cards" ? "comment_cards" : key === "surveys" ? "surveys" : "complaints";
                            drillSegment(seg, SEGMENT_LABELS[seg] || seg);
                          }}
                        />
                        <Line type="monotone" dataKey="surveys" name="Surveys" stroke="#25a872" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="comment_cards" name="Charter" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="complaints" name="Complaints" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#d4e8dc]">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Complaints by Status</CardTitle></CardHeader>
                  <CardContent className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={(data.complaint_by_status ?? []).filter((d: any) => d.count > 0)}
                          dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75}
                          label={({ status, count }) => `${String(status).slice(0, 12)}: ${count}`}
                          style={{ cursor: "pointer" }}
                          onClick={(_: any, idx: number) => {
                            const row = (data.complaint_by_status ?? [])[idx];
                            if (row?.status) drillComplaints(`Complaints — ${row.status}`, { status: row.status });
                          }}
                        >
                          {(data.complaint_by_status ?? []).map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="rounded-2xl border-[#d4e8dc]">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">By Category</CardTitle></CardHeader>
                  <CardContent className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.complaint_by_category ?? []} layout="vertical" margin={{ left: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="category" width={90} tick={{ fontSize: 9 }} />
                        <Tooltip />
                        <Bar
                          dataKey="count" fill="#25a872" barSize={12} style={{ cursor: "pointer" }}
                          onClick={(bar: any) => {
                            if (bar?.category) drillComplaints(`Category: ${bar.category}`, { category: bar.category });
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#d4e8dc]">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">By Domain</CardTitle></CardHeader>
                  <CardContent className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.complaint_by_domain ?? []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="domain" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar
                          dataKey="count" fill="#3b82f6" barSize={20} style={{ cursor: "pointer" }}
                          onClick={(bar: any) => {
                            if (bar?.domain) drillComplaints(`Domain: ${bar.domain}`, { domain: bar.domain });
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#d4e8dc]">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">By Priority</CardTitle></CardHeader>
                  <CardContent className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.complaint_by_priority ?? []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="priority" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar
                          dataKey="count" fill="#f59e0b" barSize={24} style={{ cursor: "pointer" }}
                          onClick={(bar: any) => {
                            if (bar?.priority) drillComplaints(`Priority: ${bar.priority}`, { priority: bar.priority });
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="rounded-2xl border-[#d4e8dc] overflow-hidden">
                  <CardHeader className="pb-2 border-b border-[#d4e8dc] flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">State Satisfaction Rankings</CardTitle>
                    <DrillHint label="All surveys" onClick={() => drillSegment("surveys", "Satisfaction Surveys")} />
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#f0fdf7]">
                          <TableHead className="text-xs">#</TableHead>
                          <TableHead className="text-xs">State</TableHead>
                          <TableHead className="text-xs text-right">Surveys</TableHead>
                          <TableHead className="text-xs text-right">Avg Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(data.state_satisfaction_rankings ?? []).slice(0, 10).map((s: any, i: number) => (
                          <TableRow
                            key={s.state_id}
                            className="cursor-pointer hover:bg-[#f0fdf7]"
                            onClick={() => onStateRow(s.state_id, s.state_name ?? `State #${s.state_id}`)}
                          >
                            <TableCell className="text-xs font-bold">{i + 1}</TableCell>
                            <TableCell className="text-sm font-semibold">{s.state_name ?? `State #${s.state_id}`}</TableCell>
                            <TableCell className="text-xs text-right">{s.surveys}</TableCell>
                            <TableCell className="text-xs text-right font-bold text-[#25a872]">{s.avg_score}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                  <Card className="rounded-2xl border-emerald-200 bg-emerald-50/30">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-emerald-800">Top Performing States</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {(data.top_states || []).map((s: any) => (
                        <button
                          key={s.state_id}
                          type="button"
                          className="flex justify-between text-sm w-full text-left hover:bg-emerald-100/50 rounded-lg px-2 py-1"
                          onClick={() => onStateRow(s.state_id, s.state_name ?? `State #${s.state_id}`)}
                        >
                          <span className="font-semibold">{s.state_name ?? `State #${s.state_id}`}</span>
                          <Badge variant="outline" className="text-emerald-700 border-emerald-300">{s.avg_score}%</Badge>
                        </button>
                      ))}
                      {!(data.top_states?.length) && <p className="text-xs text-slate-500">No survey data yet</p>}
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-rose-200 bg-rose-50/30">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-rose-800">Low Performing States</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {(data.low_states || []).map((s: any) => (
                        <button
                          key={s.state_id}
                          type="button"
                          className="flex justify-between text-sm w-full text-left hover:bg-rose-100/50 rounded-lg px-2 py-1"
                          onClick={() => onStateRow(s.state_id, s.state_name ?? `State #${s.state_id}`)}
                        >
                          <span className="font-semibold">{s.state_name ?? `State #${s.state_id}`}</span>
                          <Badge variant="outline" className="text-rose-700 border-rose-300">{s.avg_score}%</Badge>
                        </button>
                      ))}
                      {!(data.low_states?.length) && <p className="text-xs text-slate-500">No survey data yet</p>}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      <DashboardDrillPanel
        open={drill.open}
        context={drill.context}
        rows={drill.rows}
        loading={drill.loading}
        onClose={drill.close}
        onBack={drill.canGoBack ? drill.back : undefined}
        onRowClick={(row) => {
          if (row.meta?.match(/^(zone:|state:|segment:|report_type:)/)) drill.handleNestedRow(row);
        }}
        onStatClick={drill.handleStatClick}
      />
    </div>
  );
}
