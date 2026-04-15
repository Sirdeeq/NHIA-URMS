/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import Login from "@/src/components/Login";
import Dashboard from "@/src/components/Dashboard";
import { Toaster } from "@/components/ui/sonner";

type Role = "state-officer" | "zonal-director" | "sdo" | "hq-department" | "audit" | "dg-ceo" | "admin";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userRole, setUserRole] = React.useState<Role>("state-officer");

  const handleLogin = (role: string) => {
    setUserRole(role as Role);
    setIsAuthenticated(true);
  };

  return (
    <>
      {isAuthenticated ? (
        <Dashboard role={userRole} onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
      <Toaster position="top-right" />
    </>
  );
}
