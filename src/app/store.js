import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import uiReducer from '../features/ui/uiSlice';
import { salesReducers } from '../features/sales/salesSlice';
import { deliveryReducers } from '../features/delivery/deliverySlice';
import { financeReducers } from '../features/finance/financeSlice';
import { adminReducers, mastersSlice, activitiesSlice, notificationsSlice } from '../features/admin/adminSlice';

const PERSIST_KEY = 'doorcraft-erp-state-v1';
const PERSIST_VERSION = 1;

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  ...salesReducers,
  ...deliveryReducers,
  ...financeReducers,
  masters: mastersSlice.reducer,
  employees: adminReducers.employees,
  users: adminReducers.users,
  activities: activitiesSlice.reducer,
  notifications: notificationsSlice.reducer,
});

const loadPersisted = () => {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return undefined;
    const saved = JSON.parse(raw);
    if (saved.version !== PERSIST_VERSION || !saved.state) return undefined;
    return saved.state;
  } catch {
    return undefined;
  }
};

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadPersisted(),
});

let persistTimer;
store.subscribe(() => {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    try {
      const state = store.getState();
      const { ui, ...persisted } = state;
      localStorage.setItem(PERSIST_KEY, JSON.stringify({ version: PERSIST_VERSION, savedAt: new Date().toISOString(), state: persisted }));
    } catch {
      /* storage full or unavailable — demo keeps working in memory */
    }
  }, 300);
});

export const resetDemoData = () => {
  localStorage.removeItem(PERSIST_KEY);
  window.location.reload();
};

export default store;
