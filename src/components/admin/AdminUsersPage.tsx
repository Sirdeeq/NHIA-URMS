import * as React from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { usersApi, zonesApi, statesApi, type AdminUser, type ZonalOffice, type StateOffice } from "@/lib/adminApi";
import AdminModal from "./AdminModal";

const ROLES = ["state-officer", "zonal-director", "sdo", "hq-department", "dg-ceo", "admin"] as const;
const ROLE_LABELS: Record<string, string> = {
  "state-officer": "State Officer", "zonal-director": "Zonal Director",
  "sdo": "SDO", "hq-department": "HQ Department", "dg-ceo": "DG-CEO", "admin": "Admin",
};

const EMPTY_FORM = { name: "", staff_id: "", email: "", password: "", role: "state-officer", zone_id: "", state_id: "", is_active: true };

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [zones, setZones] = React.useState<ZonalOffice[]>([]);
  const [states, setStates] = React.useState<StateOffice[]>([]);
  const [total, setTotal] = React.useState(0);
  const [pages, setPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filterRole, setFilterRole] = React.useState("");
  const [filterZone, setFilterZone] = React.useState("");
  const [modal, setModal] = React.useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = React.useState<AdminUser | null>(null);
  const [form, setForm] = React.useState({ ...EMPTY_FORM });
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.list({
        page,
        search: search || undefined,
        role: filterRole || undefined,
        zone_id: filterZone ? Number(filterZone) : undefined,
      });
      setUsers(res.data);
      setTotal(res.total);
      setPages(res.pages);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [page, search, filterRole, filterZone]);

  React.useEffect(() => { load(); }, [load]);

  React.useEffect(() => {
    zonesApi.list().then(r => setZones(r.data)).catch(() => {});
    statesApi.list().then(r => setStates(r.data)).catch(() => {});
  }, []);

  const openCreate = () => { setForm({ ...EMPTY_FORM }); setEditing(null); setModal("create"); };
  const openEdit = (u: AdminUser) => {
    setEditing(u);
    setForm({ name: u.name, staff_id: u.staff_id, email: u.email || "", password: "", role: u.role, zone_id: String(u.zone_id || ""), state_id: String(u.state_id || ""), is_active: u.is_active });
    setModal("edit");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        name: form.name, staff_id: form.staff_id, email: form.email || undefined,
        role: form.role, zone_id: form.zone_id ? Number(form.zone_id) : undefined,
        state_id: form.state_id ? Number(form.state_id) : undefined,
        is_active: form.is_active,
      };
      if (form.password) payload.password = form.password;
      if (modal === "create") {
        if (!form.password) { toast.error("Password is required"); setSaving(false); return; }
        await usersApi.create(payload);
        toast.success("User created");
      } else if (editing) {
        await usersApi.update(editing.id, payload);
        toast.success("User updated");
      }
      setModal(null);
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`Delete user "${u.name}"?`)) return;
    try {
      await usersApi.delete(u.id);
      toast.success("User deleted");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const filteredStates = form.zone_id ? states.filter(s => String(s.zonal_id) === String(form.zone_id)) : states;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search name or staff ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterRole}
          onChange={e => { setFilterRole(e.target.value); setPage(1); }}
        >
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterZone}
          onChange={e => { setFilterZone(e.target.value); setPage(1); }}
        >
          <option value="">All Zones</option>
          {zones.map(z => <option key={z.id} value={z.id}>{z.zonal_code}</option>)}
        </select>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f4c81] text-white text-sm font-medium rounded-lg hover:bg-[#0d3f6e] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Staff ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Zone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">State</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{u.staff_id}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{u.zone?.zonal_code ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{u.state?.code ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(u)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Showing {users.length} of {total} users</p>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-600 px-2">Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AdminModal
        title={modal === "create" ? "Add New User" : "Edit User"}
        open={modal !== null}
        onClose={() => setModal(null)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Full Name" required>
            <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </Field>
          <Field label="Staff ID" required>
            <input className={inputCls} value={form.staff_id} onChange={e => setForm(f => ({ ...f, staff_id: e.target.value }))} required disabled={modal === "edit"} />
          </Field>
          <Field label="Email">
            <input type="email" className={inputCls} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </Field>
          <Field label={modal === "create" ? "Password" : "New Password (leave blank to keep)"} required={modal === "create"}>
            <input type="password" className={inputCls} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={modal === "create"} />
          </Field>
          <Field label="Role" required>
            <select className={inputCls} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required>
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </Field>
          <Field label="Zone">
            <select className={inputCls} value={form.zone_id} onChange={e => setForm(f => ({ ...f, zone_id: e.target.value, state_id: "" }))}>
              <option value="">— None —</option>
              {zones.map(z => <option key={z.id} value={z.id}>{z.zonal_code} – {z.description}</option>)}
            </select>
          </Field>
          <Field label="State">
            <select className={inputCls} value={form.state_id} onChange={e => setForm(f => ({ ...f, state_id: e.target.value }))}>
              <option value="">— None —</option>
              {filteredStates.map(s => <option key={s.id} value={s.id}>{s.code} – {s.description}</option>)}
            </select>
          </Field>
          {modal === "edit" && (
            <Field label="Status">
              <select className={inputCls} value={form.is_active ? "1" : "0"} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === "1" }))}>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </Field>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-[#0f4c81] text-white rounded-lg hover:bg-[#0d3f6e] disabled:opacity-60">
              {saving ? "Saving..." : modal === "create" ? "Create User" : "Save Changes"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
