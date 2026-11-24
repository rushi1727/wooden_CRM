import { createEntitySlice } from '../../app/createEntitySlice';
import {
  customers, leads, measurements, quotations, salesOrders, projects,
} from '../../data/demoData';

export const customersSlice = createEntitySlice('customers', customers);
export const leadsSlice = createEntitySlice('leads', leads);
export const measurementsSlice = createEntitySlice('measurements', measurements);
export const quotationsSlice = createEntitySlice('quotations', quotations);
export const salesOrdersSlice = createEntitySlice('salesOrders', salesOrders);
export const projectsSlice = createEntitySlice('projects', projects);

export const salesReducers = {
  customers: customersSlice.reducer,
  leads: leadsSlice.reducer,
  measurements: measurementsSlice.reducer,
  quotations: quotationsSlice.reducer,
  salesOrders: salesOrdersSlice.reducer,
  projects: projectsSlice.reducer,
};
