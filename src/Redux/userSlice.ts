import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../lib/interface";

interface UserState {
  currentUser: User | null;
  pending: boolean;
  error: boolean;
}

const initialState: UserState = {
  currentUser: null, 
  pending: false, 
  error: false, 
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
      state.pending = false;
      state.error = false;
    },
    setPending: (state) => {
      state.pending = true;
      state.error = false;
    },
    setError: (state) => {
      state.pending = false;
      state.error = true;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.pending = false;
      state.error = false;
    },
  },
});

export const { setUser, setPending, setError, clearUser } = userSlice.actions;
export default userSlice.reducer;
