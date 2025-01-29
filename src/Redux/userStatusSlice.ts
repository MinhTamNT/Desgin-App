import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../lib/interface";

interface UserStatusState {
  statuses: {
    [userId: string]: User["Status"];
  };
}

// Set up initial state
const initialState: UserStatusState = {
  statuses: {},
};

// Create the Redux slice
const userStatusSlice = createSlice({
  name: "userStatus",
  initialState,
  reducers: {
    updateUserStatus: (
      state,
      action: PayloadAction<{ userId: string; status: User["Status"] }>
    ) => {
      const { status } = action.payload;
      state.statuses["status"] = status;
    },
  },
});

export const { updateUserStatus } = userStatusSlice.actions;
export default userStatusSlice.reducer;
