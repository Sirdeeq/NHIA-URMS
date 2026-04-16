import * as React from "react";
import { useHasAccess, useHasModuleAccess } from "./useHasAccess";

interface Props {
  module: string;
  functionality?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renders children only if the user has access.
 *
 *   <AccessControl module="Finance">...</AccessControl>
 *   <AccessControl module="Finance" functionality="Payments">...</AccessControl>
 */
export default function AccessControl({ module, functionality, children, fallback = null }: Props) {
  const moduleOk = useHasModuleAccess(module);
  const funcOk   = useHasAccess(module, functionality ?? "");
  const allowed  = functionality ? (moduleOk && funcOk) : moduleOk;
  return allowed ? <>{children}</> : <>{fallback}</>;
}
