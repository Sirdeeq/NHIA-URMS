import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AccessEntry } from "@/src/access/types";

export interface AuthStateOffice  { id: number; code: string; description: string; zonal_id?: number; }
export interface AuthZonalOffice  { id: number; zonal_code: string; description: string; }

export interface AuthUser {
  id: number;
  name: string;
  staff_id: string;
  email?: string;
  role: string;
  /** Structured access — [{access_to, functionalities[]}] */
  functionalities?: AccessEntry[];
  zone_id?: number;
  state_id?: number;
  department_id?: number;
  unit_id?: number;
  is_active?: boolean;
  /** Nested objects returned by the backend on login/me */
  state?: AuthStateOffice;
  zone?:  AuthZonalOffice;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
}

const TOKEN_KEY = "nhia@token";
const USER_KEY  = "nhia@user";

function loadFromStorage(): AuthState {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw   = localStorage.getItem(USER_KEY);
    if (!token || !raw) return { user: null, token: null };
    const user = JSON.parse(raw) as AuthUser;
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
}

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
