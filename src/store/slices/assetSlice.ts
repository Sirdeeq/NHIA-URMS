import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { storeManagementApi } from "@/src/services/storeManagementApi";

export interface AssetState {
  assets: any[];
  transfers: any[];
  maintenances: any[];
  disposals: any[];
  loading: boolean;
  error: string | null;
}

const initialState: AssetState = {
  assets: [],
  transfers: [],
  maintenances: [],
  disposals: [],
  loading: false,
  error: null,
};

export const fetchAssets = createAsyncThunk(
  "asset/fetchAssets",
  async (_, { rejectWithValue }) => {
    try {
      const res = await storeManagementApi.getAssets();
      return res.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addAsset = createAsyncThunk(
  "asset/addAsset",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await storeManagementApi.createAsset(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateAssetRecord = createAsyncThunk(
  "asset/updateAssetRecord",
  async ({ id, payload }: { id: number | string; payload: any }, { rejectWithValue }) => {
    try {
      const res = await storeManagementApi.updateAsset(id, payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchTransfers = createAsyncThunk(
  "asset/fetchTransfers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await storeManagementApi.getTransfers();
      return res.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addTransfer = createAsyncThunk(
  "asset/addTransfer",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await storeManagementApi.createTransfer(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMaintenances = createAsyncThunk(
  "asset/fetchMaintenances",
  async (_, { rejectWithValue }) => {
    try {
      const res = await storeManagementApi.getMaintenance();
      return res.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchDisposals = createAsyncThunk(
  "asset/fetchDisposals",
  async (_, { rejectWithValue }) => {
    try {
      const res = await storeManagementApi.getDisposals();
      return res.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const assetSlice = createSlice({
  name: "asset",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Assets
      .addCase(fetchAssets.pending, (state) => { state.loading = true; })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = action.payload;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addAsset.fulfilled, (state, action) => {
        state.assets.unshift(action.payload);
      })
      .addCase(updateAssetRecord.fulfilled, (state, action) => {
        const index = state.assets.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.assets[index] = action.payload;
        }
      })
      // Transfers
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.transfers = action.payload;
      })
      .addCase(addTransfer.fulfilled, (state, action) => {
        state.transfers.unshift(action.payload);
      })
      // Maintenance & Disposal
      .addCase(fetchMaintenances.fulfilled, (state, action) => {
        state.maintenances = action.payload;
      })
      .addCase(fetchDisposals.fulfilled, (state, action) => {
        state.disposals = action.payload;
      });
  },
});

export default assetSlice.reducer;
