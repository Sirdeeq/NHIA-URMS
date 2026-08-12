import * as React from "react";
import {
  ArrowLeft, RefreshCw, Loader2, Package, ClipboardList,
  Boxes, Wrench,
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

const GEO_SCOPED = new Set(["verifications", "supply_verifications", "variance_items", "assets"]);

interface Props {
  onBack: () => void;
  defaultStateId?: string | null;
  defaultZoneId?: string | null;
}

function ChartEmpty({ message = "No records in the system for this view yet." }: { message?: string }) {
  return (
    <div className="flex h-full min-h-[160px] items-center justify-center px-4 text-center">
      <p className="text-xs text-slate-500">{message}</p>
    </div>
  );
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

  const moduleChart = React.useMemo(() => data?.module_breakdown ?? [], [data]);
  const supplyVerdictChart = React.useMemo(
    () => (data?.supply_by_verdict ?? []).filter((d: any) => d.count > 0),
    [data],
  );

  const drillGeoSegment = (segment: string, title: string, extra?: Record<string, string>) => {
    drill.openRecordDrill(segment, title, drillCtx, extra);
  };

  const drillDirect = (segment: string, title: string, extra?: Record<string, string>) => {
    drill.openDrill(
      { segment, ...extra },
      { title, subtitle: drillCtx.subtitle, breadcrumbs: drillCtx.breadcrumbs },
      { resetStack: true },
    );
  };

  const drillSegment = (segment: string, title: string, extra?: Record<string, string>) => {
    if (GEO_SCOPED.has(segment)) {
      drillGeoSegment(segment, title, extra);
    } else {
      drillDirect(segment, title, extra);
    }
  };

  const drillModule = (moduleName: string) => {
    const map: Record<string, { segment: string; title: string }> = {
      "Physical Asset Verification": { segment: "verifications", title: "Physical Asset Verifications" },
      "Verification of Supply": { segment: "supply_verifications", title: "Verification of Supply" },
      "SVO Assets": { segment: "svo_assets", title: "SVO Assets Registered" },
      "Inventory Catalog": { segment: "inventory_items", title: "Inventory Catalog" },
      "Transfers & Movements": { segment: "transfers", title: "Transfers & Movements" },
      "Board Disposal": { segment: "disposals", title: "Board Disposal" },
      "Maintenance & Servicing": { segment: "maintenance", title: "Maintenance & Servicing" },
    };
    const target = map[moduleName];
    if (target) drillSegment(target.segment, target.title);
  };

  const onStateRow = (stateId: number, stateName: string) => {
    drill.openDrill(
      { segment: "state_breakdown", state_id: String(stateId) },
      {
        title: stateName,
        subtitle: "Breakdown by verification type",
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
            <p className="text-xs text-muted-foreground">{unitScope.headline} — live data from verification & asset records</p>
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <ClickableKpi
                  label="Physical Asset Verifications"
                  value={data.physical_asset_verifications ?? data.total_verifications ?? 0}
                  icon={<ClipboardList className="w-5 h-5 text-emerald-600" />}
                  onClick={() => drillSegment("verifications", "Physical Asset Verifications")}
                />
                <ClickableKpi
                  label="Verification of Supply"
                  value={data.supply_verifications ?? 0}
                  icon={<Package className="w-5 h-5 text-blue-600" />}
                  onClick={() => drillSegment("supply_verifications", "Verification of Supply")}
                />
                <ClickableKpi
                  label="SVO Assets Registered"
                  value={data.svo_assets ?? 0}
                  icon={<Boxes className="w-5 h-5 text-[#25a872]" />}
                  onClick={() => drillSegment("svo_assets", "SVO Assets Registered")}
                />
                <ClickableKpi
                  label="Store Operations"
                  value={data.store_operations ?? 0}
                  icon={<Wrench className="w-5 h-5 text-indigo-600" />}
                  onClick={() => drillSegment("store_operations", "Store Operations")}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="rounded-2xl border-[#d4e8dc]">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Monthly Activity</CardTitle>
                    <DrillHint label="Physical verifications" onClick={() => drillSegment("verifications", "Physical Asset Verifications")} />
                  </CardHeader>
                  <CardContent className="h-[240px]">
                    {monthlyChart.length === 0 ? (
                      <ChartEmpty message="No physical or supply verifications recorded yet." />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={monthlyChart}
                          onClick={(e: any) => {
                            const month = e?.activePayload?.[0]?.payload?.month;
                            if (month) drillGeoSegment("verifications", `Physical Verifications — ${month}`, { month });
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Line type="monotone" dataKey="physical_verifications" name="Physical" stroke="#25a872" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="supply_verifications" name="Supply" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="approved" name="Approved" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#d4e8dc]">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Records by Module</CardTitle></CardHeader>
                  <CardContent className="h-[240px]">
                    {moduleChart.length === 0 ? (
                      <ChartEmpty message="No stock verification or SVO records yet." />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={moduleChart}
                            dataKey="count" nameKey="module" cx="50%" cy="50%" outerRadius={80}
                            label={({ module, count }) => `${module}: ${count}`}
                            style={{ cursor: "pointer" }}
                            onClick={(_: any, idx: number) => {
                              const row = moduleChart[idx];
                              if (row?.module) drillModule(row.module);
                            }}
                          >
                            {moduleChart.map((_: any, i: number) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#d4e8dc]">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Physical Verifications by Status</CardTitle></CardHeader>
                  <CardContent className="h-[240px]">
                    {(data.verification_by_status ?? []).length === 0 ? (
                      <ChartEmpty />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.verification_by_status ?? []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                          <Tooltip />
                          <Bar
                            dataKey="count" fill="#25a872" radius={[4, 4, 0, 0]} style={{ cursor: "pointer" }}
                            onClick={(bar: any) => {
                              if (bar?.status) drillGeoSegment("verifications", `Status: ${bar.status}`, { status: bar.status });
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#d4e8dc]">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Supply Verifications by Verdict</CardTitle></CardHeader>
                  <CardContent className="h-[240px]">
                    {supplyVerdictChart.length === 0 ? (
                      <ChartEmpty message="No supply verification certificates yet." />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={supplyVerdictChart}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="verdict" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                          <Tooltip />
                          <Bar
                            dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} style={{ cursor: "pointer" }}
                            onClick={(bar: any) => {
                              if (bar?.verdict) drillSegment("supply_verifications", `Verdict: ${bar.verdict}`, { verdict: bar.verdict });
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-[#d4e8dc] lg:col-span-2">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Top States by Verifications</CardTitle>
                    <DrillHint label="All physical" onClick={() => drillSegment("verifications", "Physical Asset Verifications")} />
                  </CardHeader>
                  <CardContent className="p-0">
                    {(data.state_activity ?? []).length === 0 ? (
                      <ChartEmpty message="No state-level verification activity yet." />
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#f0fdf7]">
                            <TableHead className="text-xs">State</TableHead>
                            <TableHead className="text-xs text-right">Physical</TableHead>
                            <TableHead className="text-xs text-right">Supply</TableHead>
                            <TableHead className="text-xs text-right">Total</TableHead>
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
                              <TableCell className="text-sm text-right">{row.physical_count ?? 0}</TableCell>
                              <TableCell className="text-sm text-right">{row.supply_count ?? 0}</TableCell>
                              <TableCell className="text-sm text-right font-bold">{row.verification_count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
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
