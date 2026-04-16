/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import Login from "@/src/components/Login";
import Dashboard from "@/src/components/Dashboard";
import { Toaster } from "@/components/ui/sonner";

type Role = "state-officer" | "zonal-director" | "sdo" | "hq-department" | "audit" | "dg-ceo" | "admin";

export interface UserContext {
  role: Role;
  staffId: string;
  // These come from the backend in real auth; for mock we leave them null
  zoneId: string | null;
  stateId: string | null;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userCtx, setUserCtx] = React.useState<UserContext>({ role: "state-officer", staffId: "", zoneId: null, stateId: null });

  const handleLogin = (role: string, staffId = "") => {
    setUserCtx({ role: role as Role, staffId, zoneId: null, stateId: null });
    setIsAuthenticated(true);
  };

  return (
    <>
      {isAuthenticated ? (
        <Dashboard userCtx={userCtx} onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
      <Toaster position="top-right" />
    </>
  );
}
