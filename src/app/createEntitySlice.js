import { createSlice } from '@reduxjs/toolkit';

/**
 * Generic entity slice factory. Every collection gets the same predictable
 * action names (addEntity / updateEntity / removeEntity) which keeps CRUD
 * screens and workflow thunks uniform and easy to swap for API calls later.
 */
export function createEntitySlice(name, seed = []) {
  const slice = createSlice({
    name,
    initialState: { items: seed },
    reducers: {
      addEntity(state, action) {
        state.items.unshift(action.payload);
      },
      addEntities(state, action) {
        state.items = [...action.payload, ...state.items];
      },
      updateEntity(state, action) {
        const { id, changes } = action.payload;
        const index = state.items.findIndex((item) => item.id === id);
        if (index !== -1) state.items[index] = { ...state.items[index], ...changes };
      },
      removeEntity(state, action) {
        state.items = state.items.filter((item) => item.id !== action.payload);
      },
      replaceAll(state, action) {
        state.items = action.payload;
      },
    },
  });
  return slice;
}
