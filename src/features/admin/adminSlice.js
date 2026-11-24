import { createSlice, nanoid } from '@reduxjs/toolkit';
import { createEntitySlice } from '../../app/createEntitySlice';
import { MASTER_SEED } from '../../data/masterData';
import { employees, users, activities, notifications } from '../../data/demoData';

export const mastersSlice = createSlice({
  name: 'masters',
  initialState: MASTER_SEED,
  reducers: {
    addMaster(state, action) {
      const { group, record } = action.payload;
      if (state[group]) state[group].push({ id: `M-${nanoid(6)}`, active: true, ...record });
    },
    updateMaster(state, action) {
      const { group, id, changes } = action.payload;
      const list = state[group] || [];
      const item = list.find((m) => m.id === id);
      if (item) Object.assign(item, changes);
    },
    toggleMaster(state, action) {
      const { group, id } = action.payload;
      const item = (state[group] || []).find((m) => m.id === id);
      if (item) item.active = !item.active;
    },
    removeMaster(state, action) {
      const { group, id } = action.payload;
      if (state[group]) state[group] = state[group].filter((m) => m.id !== id);
    },
  },
});

export const employeesSlice = createEntitySlice('employees', employees);
export const usersSlice = createEntitySlice('users', users);

export const activitiesSlice = createSlice({
  name: 'activities',
  initialState: { items: activities },
  reducers: {
    addActivity: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare(activity) {
        return {
          payload: {
            id: `ACT-${nanoid(6)}`,
            at: new Date().toISOString(),
            ...activity,
          },
        };
      },
    },
    removeActivity(state, action) {
      state.items = state.items.filter((a) => a.id !== action.payload);
    },
  },
});

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: notifications },
  reducers: {
    markRead(state, action) {
      const n = state.items.find((i) => i.id === action.payload);
      if (n) n.read = true;
    },
    markAllRead(state) {
      state.items.forEach((n) => { n.read = true; });
    },
    addNotification: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare({ title, message, tone = 'info', link = null }) {
        return { payload: { id: `NTF-${nanoid(5)}`, title, message, tone, link, at: new Date().toISOString(), read: false } };
      },
    },
  },
});

export const { addActivity } = activitiesSlice.actions;
export const { markRead, markAllRead, addNotification } = notificationsSlice.actions;

export const adminReducers = {
  masters: mastersSlice.reducer,
  employees: employeesSlice.reducer,
  users: usersSlice.reducer,
  activities: activitiesSlice.reducer,
  notifications: notificationsSlice.reducer,
};
