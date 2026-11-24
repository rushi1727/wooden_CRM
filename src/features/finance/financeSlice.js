import { createEntitySlice } from '../../app/createEntitySlice';
import { invoices, serviceTickets } from '../../data/demoData';

export const invoicesSlice = createEntitySlice('invoices', invoices);
export const serviceSlice = createEntitySlice('serviceTickets', serviceTickets);

export const financeReducers = {
  invoices: invoicesSlice.reducer,
  serviceTickets: serviceSlice.reducer,
};
