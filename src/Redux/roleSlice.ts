// features/role/roleSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RoleState {
  userRole: Object | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  userRole: null,
  loading: false,
  error: null,
};

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {
    fetchUserRoleStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchUserRoleSuccess(state, action: PayloadAction<Object | null>) {
      state.loading = false;
      state.userRole = action.payload;
    },
    fetchUserRoleFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

// Export actions
export const {
  fetchUserRoleStart,
  fetchUserRoleSuccess,
  fetchUserRoleFailure,
} = roleSlice.actions;

export default roleSlice.reducer;
