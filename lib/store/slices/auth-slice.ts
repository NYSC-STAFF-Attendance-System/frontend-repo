import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/lib/api";
import type { StaffProfile } from "@/types";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  status: AuthStatus;
  profile: StaffProfile | null;
};

const initialState: AuthState = {
  status: "idle",
  profile: null,
};

export const hydrateAuth = createAsyncThunk(
  "auth/hydrate",
  async () => api.auth.getProfile(),
  {
    condition: (_, { getState }) => {
      const { auth } = getState() as { auth: AuthState };
      return auth.status === "idle";
    },
  },
);

export const signOut = createAsyncThunk("auth/signOut", async () => {
  await api.auth.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signedIn(state, action: PayloadAction<StaffProfile>) {
      state.status = "authenticated";
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.pending, (state) => {
        if (state.status === "idle") state.status = "loading";
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.status = action.payload ? "authenticated" : "unauthenticated";
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.profile = null;
        state.status = "unauthenticated";
      })
      .addCase(signOut.fulfilled, (state) => {
        state.profile = null;
        state.status = "unauthenticated";
      });
  },
});

export const { signedIn } = authSlice.actions;
export const authReducer = authSlice.reducer;
