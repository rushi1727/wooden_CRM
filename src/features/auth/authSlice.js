import { createSlice } from '@reduxjs/toolkit';
import { ROLES } from '../../data/masterData';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: true,
    role: 'super_admin',
    demoMode: true,
    loginAt: null,
  },
  reducers: {
    setRole(state, action) {
      if (ROLES[action.payload]) {
        state.role = action.payload;
        state.loginAt = new Date().toISOString();
      }
    },
    login(state, action) {
      if (ROLES[action.payload]) {
        state.role = action.payload;
        state.isAuthenticated = true;
        state.loginAt = new Date().toISOString();
      }
    },
    logout(state) {
      state.isAuthenticated = false;
    },
  },
});

export const { setRole, login, logout } = authSlice.actions;
export default authSlice.reducer;
