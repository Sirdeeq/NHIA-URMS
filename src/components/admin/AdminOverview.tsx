import * as React from "react";
import { Users, MapPin, Building2, Layers, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usersApi, zonesApi, statesApi, departmentsApi, unitsApi } from "@/lib/adminApi";

interface Stat { label: string; value: number; icon: React.ReactNode; tint: string; iconColor: string; }

export default function AdminOverview() {
  const [stats, setStats] = React.useState<Stat[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.allSettled([
      usersApi.list(), zonesApi.list(), statesApi.list(), departmentsApi.list(), unitsApi.list(),
    ]).then(([users, zones, states, depts, units]) => {
      setStats([
        { label: "Total Users",   value: users.status  === "fulfilled" ? users.value.total          : 0, icon: <Users className="w-5 h-5" />,    tint: "bg-[#e8f5ee] border-[#d4e8dc]", iconColor: "text-[#145c3f]" },
        { label: "Zonal Offices", value: zones.status  === "fulfilled" ? zones.value.data.length    : 0, icon: <MapPin className="w-5 h-5" />,   tint: "bg-blue-50 border-blue-100",    iconColor: "text-blue-600"  },
        { label: "State Offices", value: states.status === "fulfilled" ? states.value.data.length   : 0, icon: <Building2 className="w-5 h-5" />,tint: "bg-amber-50 border-amber-100",  iconColor: "text-amber-600" },
        { label: "Departments",   value: depts.status  === "fulfilled" ? depts.value.data.length    : 0, icon: <Layers className="w-5 h-5" />,   tint: "bg-purple-50 border-purple-100",iconColor: "text-purple-600"},
        { label: "Units",         value: units.status  === "fulfilled" ? units.value.data.length    : 0, icon: <Layers className="w-5 h-5" />,   tint: "bg-rose-50 border-rose-100",    iconColor: "text-rose-600"  },
      ]);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-sm text-slate-400">Loading overview...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`${s.tint} rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shadow-sm ${s.iconColor}`}>
                {s.icon}
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{s.value}</p>
            <p className="text-sm font-semibold text-slate-700 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <Card className="rounded-2xl border-[#d4e8dc] shadow-sm">
        <CardContent className="p-6">
          <p className="text-sm font-bold text-slate-800 mb-1">Admin Control Panel</p>
          <p className="text-xs text-slate-500">
            Use the sidebar to manage users, assign roles, configure zonal and state offices, and maintain departments and units.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
