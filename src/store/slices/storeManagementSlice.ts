import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { storeManagementApi } from "@/src/services/storeManagementApi";

export interface StoreManagementState {
  inventoryItems: any[];
  goodsReceipts: any[];
  stockIssues: any[];
  supplyVerifications: any[];
  loading: boolean;
  error: string | null;
}

const initialState: StoreManagementState = {
  inventoryItems: [],
  goodsReceipts: [],
  stockIssues: [],
  supplyVerifications: [],
  loading: false,
  error: null,
};

export const fetchInventoryItems = createAsyncThunk(
  "storeManagement/fetchInventoryItems",
  async (_, { rejectWithValue }) => {
    try {
      const res = await storeManagementApi.getInventoryItems();
      return res.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addInventoryItem = createAsyncThunk(
  "storeManagement/addInventoryItem",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await storeManagementApi.createInventoryItem(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchGoodsReceipts = createAsyncThunk(
  "storeManagement/fetchGoodsReceipts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await storeManagementApi.getGoodsReceipts();
      return res.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addGoodsReceipt = createAsyncThunk(
  "storeManagement/addGoodsReceipt",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await storeManagementApi.createGoodsReceipt(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchStockIssues = createAsyncThunk(
  "storeManagement/fetchStockIssues",
  async (_, { rejectWithValue }) => {
    try {
      const res = await storeManagementApi.getStockIssues();
      return res.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addStockIssue = createAsyncThunk(
  "storeManagement/addStockIssue",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await storeManagementApi.createStockIssue(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchSupplyVerifications = createAsyncThunk(
  "storeManagement/fetchSupplyVerifications",
  async (_, { rejectWithValue }) => {
    try {
      const res = await storeManagementApi.getSupplyVerifications();
      return res.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addSupplyVerification = createAsyncThunk(
  "storeManagement/addSupplyVerification",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await storeManagementApi.createSupplyVerification(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const storeManagementSlice = createSlice({
  name: "storeManagement",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Inventory
      .addCase(fetchInventoryItems.pending, (state) => { state.loading = true; })
      .addCase(fetchInventoryItems.fulfilled, (state, action) => {
        state.loading = false;
        state.inventoryItems = action.payload;
      })
      .addCase(fetchInventoryItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addInventoryItem.fulfilled, (state, action) => {
        state.inventoryItems.unshift(action.payload);
      })
      // Goods Receipts
      .addCase(fetchGoodsReceipts.fulfilled, (state, action) => {
        state.goodsReceipts = action.payload;
      })
      .addCase(addGoodsReceipt.fulfilled, (state, action) => {
        state.goodsReceipts.unshift(action.payload);
      })
      // Stock Issues
      .addCase(fetchStockIssues.fulfilled, (state, action) => {
        state.stockIssues = action.payload;
      })
      .addCase(addStockIssue.fulfilled, (state, action) => {
        state.stockIssues.unshift(action.payload);
      })
      // Supply Verifications
      .addCase(fetchSupplyVerifications.fulfilled, (state, action) => {
        state.supplyVerifications = action.payload;
      })
      .addCase(addSupplyVerification.fulfilled, (state, action) => {
        state.supplyVerifications.unshift(action.payload);
      });
  },
});

export default storeManagementSlice.reducer;
