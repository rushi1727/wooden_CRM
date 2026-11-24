import { createEntitySlice } from '../../app/createEntitySlice';
import {
  products, materials, suppliers, productionOrders, qualityInspections,
  dispatches, installations, siteInspections, purchaseRequests, stockMoves,
} from '../../data/demoData';

export const productsSlice = createEntitySlice('products', products);
export const materialsSlice = createEntitySlice('materials', materials);
export const suppliersSlice = createEntitySlice('suppliers', suppliers);
export const productionSlice = createEntitySlice('production', productionOrders);
export const qualitySlice = createEntitySlice('qualityInspections', qualityInspections);
export const dispatchSlice = createEntitySlice('dispatches', dispatches);
export const installationSlice = createEntitySlice('installations', installations);
export const inspectionsSlice = createEntitySlice('siteInspections', siteInspections);
export const purchaseRequestsSlice = createEntitySlice('purchaseRequests', purchaseRequests);
export const stockMovesSlice = createEntitySlice('stockMoves', stockMoves);

export const deliveryReducers = {
  products: productsSlice.reducer,
  materials: materialsSlice.reducer,
  suppliers: suppliersSlice.reducer,
  production: productionSlice.reducer,
  qualityInspections: qualitySlice.reducer,
  dispatches: dispatchSlice.reducer,
  installations: installationSlice.reducer,
  siteInspections: inspectionsSlice.reducer,
  purchaseRequests: purchaseRequestsSlice.reducer,
  stockMoves: stockMovesSlice.reducer,
};
