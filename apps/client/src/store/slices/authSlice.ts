import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type CurrentUser = { id: string; email: string };

export type AuthState = {
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateAuth(state, action: PayloadAction<AuthState>) {
      state.currentUser = action.payload.currentUser;
      state.isAuthenticated = !!action.payload.currentUser;
    },
    logout(state) {
      state.currentUser = null;
      state.isAuthenticated = false;
    },
  },
});

export const { hydrateAuth, logout } = slice.actions;
export const authReducer = slice.reducer;
