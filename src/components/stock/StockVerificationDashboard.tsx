import * as React from "react";
import {
  ArrowLeft, RefreshCw, Loader2, Package, ClipboardList, AlertTriangle,
  CheckCircle2, Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { toast } from "sonner";
import { stockApi } from "@/lib/api";
import DashboardDrillPanel from "@/components/dashboard/DashboardDrillPanel";
import { useDashboardDrill } from "@/components/dashboard/useDashboardDrill";
import { ClickableKpi, DrillHint, COLORS, getUnitHeadScope } from "@/components/dashboard/dashboardUi";

const UNIT_NAME = "Stock Verification Unit";

interface Props {
  onBack: () => void;
  defaultStateId?: string | null;
  defaultZoneId?: string | null;
}

export default function StockVerificationDashboard({ onBack, defaultStateId, defaultZoneId }: Props) {
  const [data, setData] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  const scope = React.useMemo(() => ({
    state_id: defaultStateId ?? undefined,
    zone_id: defaultZoneId ?? undefined,
  }), [defaultStateId, defaultZoneId]);

  const drill = useDashboardDrill(
    (params) => stockApi.getDashboardDrill(params),
    scope,
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await stockApi.getDashboard(scope);
      setData(res.data);
    } catch (err: any) {
      toast.error("Failed to load dashboard", { description: err.message });
    } finally {
      setLoading(false);
    }
  }, [scope]);

  React.useEffect(() => { load(); }, [load]);

  const unitScope = getUnitHeadScope(UNIT_NAME, defaultStateId, defaultZoneId);
  const drillCtx = { subtitle: unitScope.drillSubtitle, breadcrumbs: [UNIT_NAME] };

  const monthlyChart = React.useMemo(() =>
    (data?.monthly_activity ?? []).map((m: any) => ({ ...m, label: m.month?.slice(5) ?? m.month })),
  [data]);

  const drillVerifications = (title: string, extra?: Record<string, string>) => {
    drill.openRecordDrill("verifications", title, drillCtx, extra);
  };

  const drillAssets = (title: string, extra?: Record<string, string>) => {
    drill.openRecordDrill("assets", title, drillCtx, extra);
  };

  const drillVariance = (title: string, extra?: Record<string, string>) => {
    drill.openRecordDrill("variance_items", title, drillCtx, extra);
  };

  const onStateRow = (stateId: number, stateName: string) => {
    drill.openDrill(
      { segment: "state_breakdown", state_id: String(stateId) },
      {
        title: stateName,
        subtitle: "Breakdown by record type",
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
            <h2 className="text-xl font-bold tracking-tight">Stock Verification Unit Dashboard</h2>
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
                  label="Verifications"
                  value={data.total_verifications ?? 0}
                  icon={<ClipboardList className="w-5 h-5 text-emerald-600" />}
                  onClick={() => drillVerifications("All Verifications")}
                />
                <ClickableKpi
                  label="Assets Registered"
                  value={data.total_assets ?? 0}
                  icon={<Boxes className="w-5 h-5 text-blue-600" />}
                  onClick={() => drillAssets("All Registered Assets")}
                />
                <ClickableKpi
                  label="Active Assets"
                  value={data.assets_active ?? 0}
                  icon={<CheckCircle2 className="w-5 h-5 text-[#25a872]" />}
                  onClick={() => drillAssets("Active Assets", { active: "1" })}
                />
                <ClickableKpi
                  label="Items Verified"
                  value={data.items_verified ?? 0}
                  icon={<Package className="w-5 h-5 text-indigo-600" />}
                  onClick={() => drillVariance("Verified Line Items")}
                />
                <ClickableKpi
                  label="With Variance"
                  value={data.items_with_variance ?? 0}
                  icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
                  onClick={() => drillVariance("Items With Variance", { has_variance: "1" })}
                />
                <ClickableKpi
                  label="Bad Condition"
                  value={data.items_bad_condition ?? 0}
                  icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
                  onClick={() => drillVariance("Items in Bad Condition", { condition: "bad" })}
                />
                <ClickableKpi
                  label="Inactive Assets"
                  value={data.assets_inactive ?? 0}
                  icon={<Package className="w-5 h-5 text-slate-500" />}
                  onClick={() => drillAssets("Inactive Assets", { active: "0" })}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="rounded-2xl border-[#d4e8dc]">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Monthly Verifications</CardTitle>
                    <DrillHint label="All verifications" onClick={() => drillVerifications("All Verifications")} />
                  </CardHeader>
                  <CardContent className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyChart}
                        onClick={(e: any) => {
                          const month = e?.activePayload?.[0]?.payload?.month;
                          if (month) drillVerifications(`Verifications — ${month}`, { month });
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="verifications" name="Verifications" stroke="#25a872" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="approved" name="Approved" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#d4e8dc]">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Verifications by Type</CardTitle></CardHeader>
                  <CardContent className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.verification_by_type ?? []}
                          dataKey="count" nameKey="stocktaking_type" cx="50%" cy="50%" outerRadius={80}
                          label={({ stocktaking_type, count }) => `${stocktaking_type}: ${count}`}
                          style={{ cursor: "pointer" }}
                          onClick={(_: any, idx: number) => {
                            const row = (data.verification_by_type ?? [])[idx];
                            if (row?.stocktaking_type) {
                              drillVerifications(`Type: ${row.stocktaking_type}`, { type: row.stocktaking_type });
                            }
                          }}
                        >
                          {(data.verification_by_type ?? []).map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#d4e8dc]">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Verifications by Status</CardTitle></CardHeader>
                  <CardContent className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.verification_by_status ?? []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar
                          dataKey="count" fill="#25a872" radius={[4, 4, 0, 0]} style={{ cursor: "pointer" }}
                          onClick={(bar: any) => {
                            if (bar?.status) drillVerifications(`Status: ${bar.status}`, { status: bar.status });
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#d4e8dc]">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Top States by Verifications</CardTitle>
                    <DrillHint label="All verifications" onClick={() => drillVerifications("All Verifications")} />
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#f0fdf7]">
                          <TableHead className="text-xs">State</TableHead>
                          <TableHead className="text-xs text-right">Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(data.state_activity ?? []).map((row: any) => (
                          <TableRow
                            key={row.state_id}
                            className="cursor-pointer hover:bg-[#f0fdf7]"
                            onClick={() => onStateRow(row.state_id, row.state_name)}
                          >
                            <TableCell className="text-sm">{row.state_name}</TableCell>
                            <TableCell className="text-sm text-right font-bold">{row.verification_count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
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
