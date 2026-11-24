import { createSlice, nanoid } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toasts: [],
    sidebarOpen: false,
    notificationsOpen: false,
    profileOpen: false,
    searchOpen: false,
  },
  reducers: {
    addToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
        if (state.toasts.length > 4) state.toasts.shift();
      },
      prepare({ type = 'success', title, message = '', duration = 4200 }) {
        return { payload: { id: nanoid(8), type, title, message, duration } };
      },
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    toggleSidebar(state, action) {
      state.sidebarOpen = action.payload ?? !state.sidebarOpen;
    },
    closeSidebar(state) {
      state.sidebarOpen = false;
    },
    setOverlay(state, action) {
      const { name, open } = action.payload;
      state[name] = open;
    },
  },
});

export const { addToast, dismissToast, toggleSidebar, closeSidebar, setOverlay } = uiSlice.actions;
export default uiSlice.reducer;
