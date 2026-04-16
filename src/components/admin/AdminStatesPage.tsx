import * as React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { statesApi, zonesApi, type StateOffice, type ZonalOffice } from "@/lib/adminApi";
import AdminModal from "./AdminModal";
import AppSelect from "./AppSelect";

const inputCls = "w-full pl-3 pr-3 h-11 rounded-xl border border-[#d4e8dc] bg-[#f4f7f5] text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#25a872] focus:border-[#25a872] outline-none transition-all";

export default function AdminStatesPage() {
  const [states, setStates] = React.useState<StateOffice[]>([]);
  const [zones, setZones] = React.useState<ZonalOffice[]>([]);
  const [filterZone, setFilterZone] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [modal, setModal] = React.useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = React.useState<StateOffice | null>(null);
  const [form, setForm] = React.useState({ code: "", description: "", zonal_id: "" });
  const [saving, setSaving] = React.useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await statesApi.list(filterZone ? Number(filterZone) : undefined); setStates(r.data); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, [filterZone]);
  React.useEffect(() => { zonesApi.list().then(r => setZones(r.data)).catch(() => {}); }, []);

  const openCreate = () => { setForm({ code: "", description: "", zonal_id: "" }); setEditing(null); setModal("create"); };
  const openEdit = (s: StateOffice) => { setEditing(s); setForm({ code: s.code, description: s.description, zonal_id: String(s.zonal_id) }); setModal("edit"); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.zonal_id) { toast.error("Please select a zone"); return; }
    setSaving(true);
    try {
      const payload = { code: form.code, description: form.description, zonal_id: Number(form.zonal_id) };
      if (modal === "create") { await statesApi.create(payload); toast.success("State created"); }
      else if (editing) { await statesApi.update(editing.id, payload); toast.success("State updated"); }
      setModal(null); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (s: StateOffice) => {
    if (!confirm(`Delete state "${s.code}"?`)) return;
    try { await statesApi.delete(s.id); toast.success("State deleted"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <AppSelect
          value={filterZone}
          onValueChange={v => setFilterZone(v === "__none__" ? "" : v)}
          options={zones.map(z => ({ value: String(z.id), label: `${z.zonal_code} – ${z.description}` }))}
          placeholder="All Zones"
        />
        <Button onClick={openCreate} className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white rounded-xl h-10 gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Add State
        </Button>
      </div>

      <Card className="rounded-2xl border-[#d4e8dc] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f0fdf7] hover:bg-[#f0fdf7]">
                <TableHead className="text-xs font-bold text-slate-600">Code</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Description</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Zone</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400">Loading...</TableCell></TableRow>
              ) : states.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400">No states found</TableCell></TableRow>
              ) : states.map(s => (
                <TableRow key={s.id} className="hover:bg-[#f0fdf7] transition-colors">
                  <TableCell><span className="font-mono text-xs font-bold text-[#145c3f]">{s.code}</span></TableCell>
                  <TableCell className="font-medium text-slate-800">{s.description}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{s.zone?.zonal_code ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(s)} className="h-7 w-7 p-0 hover:bg-[#e8f5ee] hover:text-[#145c3f]"><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(s)} className="h-7 w-7 p-0 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdminModal title={modal === "create" ? "Add State Office" : "Edit State Office"} open={modal !== null} onClose={() => setModal(null)}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">State Code <span className="text-rose-500">*</span></label>
            <input className={inputCls} placeholder="e.g. LAGOS" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Description <span className="text-rose-500">*</span></label>
            <input className={inputCls} placeholder="e.g. Lagos State Office" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Zone <span className="text-rose-500">*</span></label>
            <AppSelect
              value={form.zonal_id}
              onValueChange={v => setForm(f => ({ ...f, zonal_id: v === "__none__" ? "" : v }))}
              options={zones.map(z => ({ value: String(z.id), label: `${z.zonal_code} – ${z.description}` }))}
              placeholder="— Select Zone —"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)} className="rounded-xl text-slate-600">Cancel</Button>
            <Button type="submit" disabled={saving} className="bg-[#145c3f] hover:bg-[#0f3d2e] text-white rounded-xl">
              {saving ? "Saving..." : modal === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
