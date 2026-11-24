import { todayISO } from './format';

export const GST_RATE = 18;

export const quotationTotals = (quotation) => {
  const items = quotation?.items || [];
  const itemRows = items.map((item) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.unitPrice) || 0;
    const manufacturing = Number(item.manufacturing) || 0;
    const installation = Number(item.installation) || 0;
    const transport = Number(item.transport) || 0;
    const amount = qty * (rate + manufacturing + installation + transport);
    return { ...item, amount };
  });
  const subtotal = itemRows.reduce((a, i) => a + i.amount, 0);
  const discountPct = Number(quotation?.discountPct) || 0;
  const discount = Math.round((subtotal * discountPct) / 100);
  const taxable = subtotal - discount;
  const gstPct = quotation?.gstPct ?? GST_RATE;
  const gst = Math.round((taxable * gstPct) / 100);
  const grandTotal = taxable + gst;
  const totalQty = items.reduce((a, i) => a + (Number(i.qty) || 0), 0);
  return { itemRows, subtotal, discount, taxable, gst, gstPct, grandTotal, totalQty };
};

export const invoiceTotals = (invoice) => {
  const amount = Number(invoice?.amount) || 0;
  const tax = Number(invoice?.tax) || 0;
  const discount = Number(invoice?.discount) || 0;
  const total = Number(invoice?.total) || amount + tax - discount;
  const payments = invoice?.payments || [];
  const received = payments.length
    ? payments.reduce((a, p) => a + (Number(p.amount) || 0), 0)
    : Number(invoice?.received) || 0;
  const outstanding = Math.max(0, total - received);
  return { total, received, outstanding };
};

export const invoiceStatus = (invoice) => {
  if (invoice?.status === 'Draft') return 'Draft';
  const { total, received, outstanding } = invoiceTotals(invoice);
  if (received >= total && total > 0) return 'Paid';
  if (invoice?.dueDate && invoice.dueDate < todayISO() && outstanding > 0) return 'Overdue';
  if (received > 0) return 'Partially Paid';
  return 'Unpaid';
};

export const materialAvailable = (material) =>
  (Number(material?.openingStock) || 0) + (Number(material?.purchasedQty) || 0)
  - (Number(material?.reservedQty) || 0) - (Number(material?.consumedQty) || 0);

export const materialStatus = (material) => {
  const available = materialAvailable(material);
  const min = Number(material?.minStock) || 0;
  if (available <= 0) return 'Out of Stock';
  if (available <= min) return 'Low Stock';
  return 'In Stock';
};

/** Door pipeline derived from linked production, QC, dispatch, installation and site inspection records. */
export const doorPipeline = (door, data) => {
  const production = (data.production || []).find((p) => p.projectId === door.projectId && p.doorNumber === door.number);
  const qc = production ? (data.qualityInspections || []).filter((q) => q.productionId === production.id).sort((a, b) => (a.date < b.date ? 1 : -1))[0] : null;
  const dispatch = (data.dispatches || []).find((d) => d.projectId === door.projectId && (d.doorNumbers || []).includes(door.number));
  const installation = (data.installations || []).find((i) => i.projectId === door.projectId && i.doorNumber === door.number);
  const inspection = (data.siteInspections || []).find((i) => i.projectId === door.projectId && i.doorNumber === door.number);
  return { production, qc, dispatch, installation, inspection };
};

export const doorStage = (door, data) => {
  const { production, qc, dispatch, installation, inspection } = doorPipeline(door, data);
  if (inspection?.status === 'Approved') return { key: 'approved', label: 'Site Approved', score: 100 };
  if (inspection && ['Rejected', 'Snag Raised', 'Rework Required'].includes(inspection.status)) return { key: 'snag', label: 'Site Rework', score: 92 };
  if (installation?.status === 'Completed' || installation?.status === 'Inspection Pending') return { key: 'installed', label: 'Installed', score: 88 };
  if (installation?.status === 'In Progress') return { key: 'installing', label: 'Installing', score: 78 };
  if (dispatch?.status === 'Delivered') return { key: 'delivered', label: 'Delivered', score: 70 };
  if (dispatch) return { key: 'dispatched', label: dispatch.status, score: 62 };
  if (qc?.status === 'Approved') return { key: 'qc', label: 'QC Approved', score: 52 };
  if (production?.status === 'Rework Required') return { key: 'rework', label: 'Rework', score: 45 };
  if (production) return { key: 'production', label: production.status, score: 30 };
  return { key: 'planned', label: 'Planned', score: 8 };
};

export const projectProgress = (project, data) => {
  const doors = project?.doors || [];
  if (!doors.length) return 0;
  const doorList = doors.map((d) => ({ ...d, projectId: project.id }));
  const total = doorList.reduce((a, d) => a + doorStage(d, data).score, 0);
  return Math.round(total / doorList.length);
};

export const quotationConversionRate = (quotations) => {
  const sent = quotations.filter((q) => ['Sent', 'Accepted', 'Converted', 'Declined', 'Rejected'].includes(q.status));
  if (!sent.length) return 0;
  const won = sent.filter((q) => ['Accepted', 'Converted'].includes(q.status));
  return Math.round((won.length / sent.length) * 100);
};

export const leadConversionRate = (leads) => {
  const closed = leads.filter((l) => ['Won', 'Lost'].includes(l.status));
  if (!closed.length) return 0;
  return Math.round((closed.filter((l) => l.status === 'Won').length / closed.length) * 100);
};

/** Collect the door-pipeline collections from the Redux state for derived calculations. */
export const pipelineCollections = (state) => ({
  production: state.production?.items || [],
  qualityInspections: state.qualityInspections?.items || [],
  dispatches: state.dispatches?.items || [],
  installations: state.installations?.items || [],
  siteInspections: state.siteInspections?.items || [],
});

const PRODUCTION_PERCENT = {
  Pending: 5,
  'Material Pending': 10,
  'Ready to Start': 20,
  'In Progress': 55,
  'On Hold': 35,
  Completed: 90,
  'Quality Inspection Pending': 92,
  'Quality Approved': 100,
  'Rework Required': 60,
};

export const productionPercent = (status) => PRODUCTION_PERCENT[status] ?? 0;
