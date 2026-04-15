import * as React from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, Loader2, PackageSearch } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { stockApi } from "@/lib/api";

interface Option { id: number; label: string; }

interface Asset {
  id: number;
  item_class: string;
  item_description: string;
  asset_tag: string | null;
  book_balance: number;
  state_id: number;
  unit_id: number | null;
  state?: { description: string };
  unit?: { name: string };
}

interface AssetForm {
  state_id: string;
  unit_id: string;
  item_class: string;
  item_description: string;
  asset_tag: string;
  book_balance: string;
}

const emptyForm = (): AssetForm => ({
  state_id: "", unit_id: "", item_class: "",
  item_description: "", asset_tag: "", book_balance: "1",
});

interface Props { onBack: () => void; }

export default function StockAssetManager({ onBack }: Props) {
  const [zones,       setZones]       = React.useState<Option[]>([]);
  const [states,      setStates]      = React.useState<Option[]>([]);
  const [units,       setUnits]       = React.useState<Option[]>([]);
  const [assets,      setAssets]      = React.useState<Asset[]>([]);
  const [loading,     setLoading]     = React.useState(false);

  // Filter state
  const [filterZone,  setFilterZone]  = React.useState("");
  const [filterState, setFilterState] = React.useState("");

  // Form state
  const [showForm,    setShowForm]    = React.useState(false);
  const [editId,      setEditId]      = React.useState<number | null>(null);
  const [form,        setForm]        = React.useState<AssetForm>(emptyForm());
  const [formStates,  setFormStates]  = React.useState<Option[]>([]);
  const [formUnits,   setFormUnits]   = React.useState<Option[]>([]);
  const [saving,      setSaving]      = React.useState(false);

  // Load zones
  React.useEffect(() => {
    stockApi.getZones().then(r =>
      setZones(r.data.map((z: any) => ({ id: z.id, label: z.description })))
    ).catch(() => {});
  }, []);

  // Filter: zone → states
  React.useEffect(() => {
    setFilterState(""); setStates([]);
    if (!filterZone) return;
    stockApi.getStates(filterZone).then(r =>
      setStates(r.data.map((s: any) => ({ id: s.id, label: s.description })))
    ).catch(() => {});
  }, [filterZone]);

  // Load assets when filter changes
  React.useEffect(() => {
    if (!filterState) { setAssets([]); return; }
    setLoading(true);
    stockApi.getAssets(filterState).then(r => setAssets(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [filterState]);

  // Form: zone → states
  const handleFormZone = async (zoneId: string) => {
    setForm(p => ({ ...p, state_id: "", unit_id: "" }));
    setFormStates([]); setFormUnits([]);
    if (!zoneId) return;
    const r = await stockApi.getStates(zoneId);
    setFormStates(r.data.map((s: any) => ({ id: s.id, label: s.description })));
  };

  // Form: state → units (no department filter needed for assets)
  const handleFormState = async (stateId: string) => {
    setForm(p => ({ ...p, state_id: stateId, unit_id: "" }));
    setFormUnits([]);
    if (!stateId) return;
    // Load all units for this state via departments
    const depts = await stockApi.getDepartments(stateId);
    const allUnits: Option[] = [];
    for (const d of depts.data) {
      const u = await stockApi.getUnits(d.id);
      allUnits.push(...u.data.map((x: any) => ({ id: x.id, label: `${d.name} — ${x.name}` })));
    }
    setFormUnits(allUnits);
  };

  const openCreate = () => {
    setEditId(null); setForm(emptyForm());
    setFormStates([]); setFormUnits([]);
    setShowForm(true);
  };

  const openEdit = (a: Asset) => {
    setEditId(a.id);
    setForm({
      state_id: String(a.state_id),
      unit_id: a.unit_id ? String(a.unit_id) : "",
      item_class: a.item_class,
      item_description: a.item_description,
      asset_tag: a.asset_tag || "",
      book_balance: String(a.book_balance),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.state_id || !form.item_class || !form.item_description) {
      toast.error("State, Item Class and Description are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        state_id:         Number(form.state_id),
        unit_id:          form.unit_id ? Number(form.unit_id) : null,
        item_class:       form.item_class,
        item_description: form.item_description,
        asset_tag:        form.asset_tag || null,
        book_balance:     parseInt(form.book_balance) || 1,
      };

      if (editId) {
        await stockApi.updateAsset(editId, payload);
        toast.success("Asset updated");
      } else {
        await stockApi.createAsset(payload);
        toast.success("Asset created");
      }

      setShowForm(false);
      // Refresh list
      if (filterState) {
        const r = await stockApi.getAssets(filterState);
        setAssets(r.data);
      }
    } catch (err: any) {
      toast.error("Failed to save", { description: err.message });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this asset?")) return;
    try {
      await stockApi.deleteAsset(id);
      setAssets(prev => prev.filter(a => a.id !== id));
      toast.success("Asset deleted");
    } catch (err: any) {
      toast.error("Failed to delete", { description: err.message });
    }
  };

  const f = (k: keyof AssetForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="bg-white border-b border-border/50 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Asset Register</h2>
            <p className="text-xs text-muted-foreground">Manage state stock assets</p>
          </div>
        </div>
        <Button className="bg-orange-action hover:bg-orange-600 gap-2 shadow-lg shadow-orange-500/20" onClick={openCreate}>
          <Plus className="w-4 h-4" /> New Asset
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-6xl mx-auto p-8 space-y-6">

          {/* Filters */}
          <Card className="rounded-2xl border-[#d4e8dc]">
            <CardContent className="pt-5 pb-4">
              <div className="flex gap-4 items-end">
                <div className="space-y-2 w-48">
                  <Label className="text-xs">Zone</Label>
                  <Select value={filterZone} onValueChange={setFilterZone}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Zones">
                        {filterZone ? zones.find(z => String(z.id) === filterZone)?.label : "All Zones"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map(z => <SelectItem key={z.id} value={String(z.id)}>{z.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 w-48">
                  <Label className="text-xs">State</Label>
                  <Select value={filterState} onValueChange={setFilterState} disabled={!filterZone}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select State">
                        {filterState ? states.find(s => String(s.id) === filterState)?.label : "Select State"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create / Edit form */}
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="rounded-2xl border-primary/30 shadow-md">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">{editId ? "Edit Asset" : "New Asset"}</CardTitle>
                    <CardDescription className="text-xs">Fill in the asset details below</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="h-7 w-7">
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Zone</Label>
                      <Select onValueChange={handleFormZone}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select Zone" /></SelectTrigger>
                        <SelectContent>{zones.map(z => <SelectItem key={z.id} value={String(z.id)}>{z.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">State <span className="text-red-500">*</span></Label>
                      <Select value={form.state_id} onValueChange={handleFormState}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select State">
                            {form.state_id ? formStates.find(s => String(s.id) === form.state_id)?.label : "Select State"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>{formStates.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Unit</Label>
                      <Select value={form.unit_id} onValueChange={v => setForm(p => ({ ...p, unit_id: v }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Unit">
                            {form.unit_id ? formUnits.find(u => String(u.id) === form.unit_id)?.label : "Select Unit"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>{formUnits.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Item Class <span className="text-red-500">*</span></Label>
                      <Input placeholder="e.g. Furniture" value={form.item_class} onChange={f("item_class")} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs">Item Description <span className="text-red-500">*</span></Label>
                      <Input placeholder="e.g. Executive Chair" value={form.item_description} onChange={f("item_description")} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Asset Tag / S/N</Label>
                      <Input placeholder="e.g. NHIA/FCT/001" value={form.asset_tag} onChange={f("asset_tag")} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                      <Label className="text-xs">Book Balance</Label>
                      <Input type="number" min="0" value={form.book_balance} onChange={f("book_balance")} />
                    </div>
                    <div className="flex gap-2 md:col-span-3 justify-end">
                      <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                      <Button onClick={handleSave} disabled={saving} className="gap-2 bg-[#145c3f] hover:bg-[#0f3d2e] text-white">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? "Saving..." : "Save Asset"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Table */}
          <Card className="rounded-2xl border-[#d4e8dc] shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#d4e8dc]">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <PackageSearch className="w-4 h-4 text-primary" />
                {loading ? "Loading..." : filterState ? `${assets.length} asset(s)` : "Select a state to view assets"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span>
                </div>
              ) : assets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
                  <PackageSearch className="w-8 h-8 opacity-30" />
                  <p className="text-sm">{filterState ? "No assets found for this state" : "Select a zone and state above"}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#f0fdf7] hover:bg-[#f0fdf7]">
                      <TableHead className="text-xs font-bold text-slate-600">Item Class</TableHead>
                      <TableHead className="text-xs font-bold text-slate-600">Description</TableHead>
                      <TableHead className="text-xs font-bold text-slate-600">Asset Tag</TableHead>
                      <TableHead className="text-xs font-bold text-slate-600 text-center">Book Balance</TableHead>
                      <TableHead className="text-xs font-bold text-slate-600">Unit</TableHead>
                      <TableHead className="text-right text-xs font-bold text-slate-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((a, i) => (
                      <motion.tr key={a.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-[#f8fdfb] transition-colors border-b border-slate-100 last:border-0">
                        <TableCell className="text-sm font-medium">{a.item_class}</TableCell>
                        <TableCell className="text-sm text-slate-700">{a.item_description}</TableCell>
                        <TableCell className="text-xs font-mono text-slate-500">{a.asset_tag || "—"}</TableCell>
                        <TableCell className="text-sm text-center font-semibold">{a.book_balance.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-slate-500">{a.unit?.name || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-primary hover:bg-primary/10"
                              onClick={() => openEdit(a)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() => handleDelete(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
