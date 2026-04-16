import { useSelector } from "react-redux";
import type { RootState } from "@/src/store/store";
import { MODULE_CONFIG } from "./moduleConfig";
import { canAccessModule, canAccessFunctionality } from "./accessUtils";

/** Check access to a parent module */
export function useHasModuleAccess(moduleName: string): boolean {
  const user = useSelector((s: RootState) => s.auth.user);
  if (!user) return false;
  const mod = MODULE_CONFIG.find(m => m.title === moduleName);
  if (!mod) return false;
  return canAccessModule(mod, { role: user.role, access: user.functionalities });
}

/** Check access to a specific child functionality inside a module */
export function useHasAccess(moduleName: string, functionalityName: string): boolean {
  const user = useSelector((s: RootState) => s.auth.user);
  if (!user) return false;
  return canAccessFunctionality(moduleName, functionalityName, {
    role: user.role,
    access: user.functionalities,
  });
}
