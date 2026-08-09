import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import storeManagementReducer from "./slices/storeManagementSlice";
import assetReducer from "./slices/assetSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    storeManagement: storeManagementReducer,
    asset: assetReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
