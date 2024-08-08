import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../lib/interface";

interface UserState {
  user: {
    currentUser: User | null;
    pending: boolean;
    error: boolean;
  };
}

const initialState: UserState = {
  user: {
    currentUser: null, // Initialize currentUser as null
    pending: false, // Initialize pending as false
    error: false, // Initialize error as false
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user.currentUser = action.payload;
      state.user.pending = false;
      state.user.error = false;
    },
    setPending: (state) => {
      state.user.pending = true;
      state.user.error = false;
    },
    setError: (state) => {
      state.user.pending = false;
      state.user.error = true;
    },
    clearUser: (state) => {
      state.user.currentUser = null;
      state.user.pending = false;
      state.user.error = false;
    },
  },
});

export const { setUser, setPending, setError, clearUser } = userSlice.actions;
export default userSlice.reducer;
