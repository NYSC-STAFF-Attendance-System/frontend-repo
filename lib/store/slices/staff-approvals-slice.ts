import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  approvalQueue,
  type ApprovalRequest,
} from "@/app/admin/staff/_data";

type StaffApprovalsState = {
  queue: ApprovalRequest[];
  approvedToday: number;
};

const initialState: StaffApprovalsState = {
  queue: approvalQueue,
  approvedToday: 28,
};

const staffApprovalsSlice = createSlice({
  name: "staffApprovals",
  initialState,
  reducers: {
    decideRequest(
      state,
      action: PayloadAction<{ id: string; decision: "approve" | "reject" }>,
    ) {
      state.queue = state.queue.filter((staff) => staff.id !== action.payload.id);
      if (action.payload.decision === "approve") state.approvedToday += 1;
    },
  },
});

export const { decideRequest } = staffApprovalsSlice.actions;
export const staffApprovalsReducer = staffApprovalsSlice.reducer;
