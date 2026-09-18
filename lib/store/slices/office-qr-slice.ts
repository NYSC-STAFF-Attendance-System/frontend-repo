import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/lib/api";
import type { OfficeQrStation } from "@/types";

type OfficeQrState = {
  status: "idle" | "loading" | "ready" | "error";
  station: OfficeQrStation | null;
  message: string | null;
};

const initialState: OfficeQrState = {
  status: "idle",
  station: null,
  message: null,
};

export const hydrateOfficeQr = createAsyncThunk(
  "officeQr/hydrate",
  async () => api.admin.getOfficeQr(),
  {
    condition: (_, { getState }) => {
      const { officeQr } = getState() as { officeQr: OfficeQrState };
      return officeQr.status === "idle";
    },
  },
);

export const setOfficeQrAccepting = createAsyncThunk(
  "officeQr/setAccepting",
  async (accepting: boolean) => api.admin.setOfficeQrAccepting(accepting),
);

export const regenerateOfficeQr = createAsyncThunk(
  "officeQr/regenerate",
  async () => api.admin.regenerateOfficeQr(),
);

const officeQrSlice = createSlice({
  name: "officeQr",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(hydrateOfficeQr.pending, (state) => {
        if (state.status === "idle") state.status = "loading";
      })
      .addCase(hydrateOfficeQr.fulfilled, applyResult)
      .addCase(hydrateOfficeQr.rejected, fail)
      .addCase(setOfficeQrAccepting.fulfilled, applyResult)
      .addCase(regenerateOfficeQr.pending, (state) => {
        state.message = null;
      })
      .addCase(regenerateOfficeQr.fulfilled, applyResult);
  },
});

function applyResult(
  state: OfficeQrState,
  action: { payload: Awaited<ReturnType<typeof api.admin.getOfficeQr>> },
) {
  if (action.payload.kind === "success") {
    state.station = action.payload.station;
    state.status = "ready";
    state.message = null;
    return;
  }
  state.message =
    action.payload.kind === "forbidden"
      ? "Only an office admin can manage this QR code."
      : action.payload.message;
  if (!state.station) state.status = "error";
}

function fail(state: OfficeQrState) {
  state.status = "error";
  state.message = "Could not load the office QR code.";
}

export const officeQrReducer = officeQrSlice.reducer;
