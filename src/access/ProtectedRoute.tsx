import * as React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/src/store/store";
import { MODULE_CONFIG } from "./moduleConfig";
import { canAccessModule, canAccessFunctionality } from "./accessUtils";

interface Props {
  /** Parent module this route belongs to — if omitted, only auth is checked */
  module?: string;
  /** Specific child functionality required */
  functionality?: string;
  children: React.ReactNode;
}

/**
 * Guards a page/view. Reads auth from Redux store.
 *
 * Usage:
 *   <ProtectedRoute>...</ProtectedRoute>                          // auth only
 *   <ProtectedRoute module="Finance">...</ProtectedRoute>         // module check
 *   <ProtectedRoute module="Finance" functionality="Payments">    // child check
 *     <PaymentsPage />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ module, functionality, children }: Props) {
  const user  = useSelector((s: RootState) => s.auth.user);
  const token = useSelector((s: RootState) => s.auth.token);

  // Not authenticated
  if (!user || !token) return <Denied type="unauthenticated" />;

  // Module access check
  if (module) {
    const mod = MODULE_CONFIG.find(m => m.title === module);
    const accessUser = { role: user.role, access: user.functionalities };
    if (!mod || !canAccessModule(mod, accessUser)) return <Denied type="unauthorized" />;
    if (functionality && !canAccessFunctionality(module, functionality, accessUser)) {
      return <Denied type="unauthorized" />;
    }
  }

  return <>{children}</>;
}

function Denied({ type }: { type: "unauthenticated" | "unauthorized" }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f5]">
      <div className="text-center space-y-2 p-8 bg-white rounded-2xl border border-[#d4e8dc] shadow-sm max-w-sm">
        <p className="text-3xl">{type === "unauthenticated" ? "🔑" : "🚫"}</p>
        <p className="text-sm font-bold text-slate-800">
          {type === "unauthenticated" ? "Sign in required" : "Access Denied"}
        </p>
        <p className="text-xs text-slate-400">
          {type === "unauthenticated"
            ? "Please log in to continue."
            : "You don't have permission to access this feature."}
        </p>
      </div>
    </div>
  );
}
