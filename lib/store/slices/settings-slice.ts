import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SettingsState = {
  resumption: string;
  closing: string;
  grace: string;
  preventDuplicateIn: boolean;
  preventDuplicateOut: boolean;
  requireCheckInFirst: boolean;
  locationVerification: boolean;
  verificationMode: "strict" | "flag";
  perimeterM: number;
  minAccuracyM: string;
};

export const defaultSettings: SettingsState = {
  resumption: "08:00",
  closing: "16:00",
  grace: "15",
  preventDuplicateIn: true,
  preventDuplicateOut: true,
  requireCheckInFirst: true,
  locationVerification: true,
  verificationMode: "strict",
  perimeterM: 50,
  minAccuracyM: "15",
};

type SettingsStore = {
  draft: SettingsState;
  saved: SettingsState;
  lastSync: string;
};

const initialState: SettingsStore = {
  draft: defaultSettings,
  saved: defaultSettings,
  lastSync: "Today at 08:42 AM",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    patchSettings(state, action: PayloadAction<Partial<SettingsState>>) {
      state.draft = { ...state.draft, ...action.payload };
    },
    saveSettings(state, action: PayloadAction<string>) {
      state.saved = state.draft;
      state.lastSync = action.payload;
    },
    resetSettings(state) {
      state.draft = defaultSettings;
    },
  },
});

export const { patchSettings, saveSettings, resetSettings } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
