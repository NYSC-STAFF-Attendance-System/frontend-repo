import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./slices/auth-slice";
import { officeQrReducer } from "./slices/office-qr-slice";
import { settingsReducer } from "./slices/settings-slice";
import { staffApprovalsReducer } from "./slices/staff-approvals-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    officeQr: officeQrReducer,
    settings: settingsReducer,
    staffApprovals: staffApprovalsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
