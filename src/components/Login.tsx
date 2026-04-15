import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, User, Lock, ChevronRight, AlertCircle, Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const ROLES = [
  { value: "state-officer",  label: "State Officer"   },
  { value: "zonal-director", label: "Zonal Director"  },
  { value: "sdo",            label: "SDO"             },
  { value: "hq-department",  label: "HQ Department"   },
  { value: "dg-ceo",         label: "DG-CEO"          },
];

interface LoginProps { onLogin: (role: string) => void; }

export default function Login({ onLogin }: LoginProps) {
  const [staffId,      setStaffId]      = React.useState("");
  const [password,     setPassword]     = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [role,         setRole]         = React.useState("");
  const [isLoading,    setIsLoading]    = React.useState(false);
  const [error,        setError]        = React.useState<string | null>(null);

  React.useEffect(() => {
    const id = staffId.toUpperCase();
    if      (id.startsWith("HQ"))    setRole("hq-department");
    else if (id.startsWith("SDO"))   setRole("sdo");
    else if (id.startsWith("ZD"))    setRole("zonal-director");
    else if (id.startsWith("SO"))    setRole("state-officer");
    else if (id.startsWith("DG"))    setRole("dg-ceo");
  }, [staffId]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    await new Promise(r => setTimeout(r, 900));
    if (staffId && password && role) {
      toast.success("Authentication successful", {
        description: `Welcome, ${staffId}. Redirecting to ${ROLES.find(r => r.value === role)?.label} dashboard...`,
      });
      onLogin(role);
    } else {
      setError("Invalid credentials or role not selected.");
      toast.error("Sign in failed", { description: "Check your Staff ID, password and role." });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f4f7f5] overflow-hidden">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[45%] sidebar-gradient flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-[#25a872]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#25a872]/15 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[-5%] w-[25%] h-[25%] bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10 text-center max-w-sm">
          <img src="/logo.png" alt="NHIA" className="h-28 w-auto object-contain mx-auto mb-8" />
          <h1 className="text-2xl font-black text-white leading-tight mb-3">
            Underwriting &<br />Risk Management System
          </h1>
          <p className="text-sm text-white/50 leading-relaxed">
            Secure, centralised reporting and coordination platform for the National Health Insurance Authority.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 text-left">
            {[
              { label: "State Offices",  value: "36" },
              { label: "Zonal Offices",  value: "6"  },
              { label: "HQ Departments", value: "5"  },
              { label: "Active Reports", value: "142"},
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl bg-white/8 border border-white/10">
                <p className="text-xl font-black text-[#6ddba8]">{s.value}</p>
                <p className="text-[11px] text-white/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="absolute bottom-6 text-[10px] text-white/25 tracking-widest uppercase">
          National Health Insurance Authority · Nigeria
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* subtle dot pattern */}
        <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/logo.png" alt="NHIA" className="h-20 w-auto object-contain" />
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-[#145c3f]/8 border border-[#d4e8dc] p-8">
            <div className="mb-7">
              <h2 className="text-xl font-black text-slate-900">Sign in to portal</h2>
              <p className="text-sm text-slate-500 mt-1">Enter your credentials to access your dashboard</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Staff ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Staff ID</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={staffId}
                    onChange={e => setStaffId(e.target.value)}
                    placeholder="e.g. HQ-123, SDO-456"
                    required
                    className="w-full pl-10 pr-4 h-11 rounded-xl border border-[#d4e8dc] bg-[#f4f7f5] text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#25a872] focus:border-[#25a872] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-[11px] font-semibold text-[#145c3f] hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-11 h-11 rounded-xl border border-[#d4e8dc] bg-[#f4f7f5] text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#25a872] focus:border-[#25a872] outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#145c3f] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Access Role</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-11 rounded-xl border-[#d4e8dc] bg-[#f4f7f5] text-sm focus:ring-2 focus:ring-[#25a872]">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[#d4e8dc]">
                    {ROLES.map(r => (
                      <SelectItem key={r.value} value={r.value} className="text-sm rounded-lg">{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AnimatePresence>
                  {role && (
                    <motion.p initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      className="text-[10px] text-[#145c3f] font-semibold flex items-center gap-1"
                    >
                      <ChevronRight className="w-3 h-3" /> Auto-detected from Staff ID
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-600 font-medium">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button type="submit" disabled={isLoading}
                className="w-full h-11 rounded-xl bg-[#145c3f] hover:bg-[#0f3d2e] text-white text-sm font-bold transition-all shadow-md shadow-[#145c3f]/25 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : "Sign In to Portal"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#d4e8dc] flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Secure government system. Unauthorised access is strictly prohibited.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
