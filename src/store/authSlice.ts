import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole =
  | "Admin"
  | "State Officer"
  | "Zonal Director"
  | "SDO"
  | "HQ Department"
  | "DG-CEO";

export interface AuthUser {
  id: number;
  name: string;
  staff_id: string;
  email?: string;
  role: UserRole;
  /** Comma-separated list of allowed modules e.g. "Dashboard,Underwriting,Claims" */
  functionalities: string;
  zone_id?: number;
  state_id?: number;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TOKEN_KEY = "nhia@token";
const USER_KEY  = "nhia@user";

function loadFromStorage(): AuthState {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw   = localStorage.getItem(USER_KEY);
    const user  = raw ? (JSON.parse(raw) as AuthUser) : null;
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState: loadFromStorage(),
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthUser; token: string }>) {
      state.user  = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem(TOKEN_KEY, action.payload.token);
      localStorage.setItem(USER_KEY,  JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.user  = null;
      state.token = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
