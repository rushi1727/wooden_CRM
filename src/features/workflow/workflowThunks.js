/**
 * Cross-module workflow engine.
 * Every gated transition lives here so dashboard, timeline, notifications and
 * linked records always change together. Business rules are enforced centrally,
 * not in the screens.
 */
import { addToast } from '../ui/uiSlice';
import { addActivity, addNotification } from '../admin/adminSlice';
import {
  customersSlice, leadsSlice, measurementsSlice, quotationsSlice,
  salesOrdersSlice, projectsSlice,
} from '../sales/salesSlice';
import {
  productsSlice, materialsSlice, suppliersSlice, productionSlice, qualitySlice,
  dispatchSlice, installationSlice, inspectionsSlice, purchaseRequestsSlice, stockMovesSlice,
} from '../delivery/deliverySlice';
import { invoicesSlice, serviceSlice } from '../finance/financeSlice';
import { employeesSlice } from '../admin/adminSlice';
import { ROLES } from '../../data/masterData';
import { MODULE_CONFIGS } from '../../data/moduleConfigs';
import { nextId, todayISO, inr } from '../../utils/format';
import { quotationTotals, invoiceTotals, invoiceStatus } from '../../utils/calc';

const actions = {
  customers: customersSlice.actions,
  leads: leadsSlice.actions,
  measurements: measurementsSlice.actions,
  quotations: quotationsSlice.actions,
  salesOrders: salesOrdersSlice.actions,
  projects: projectsSlice.actions,
  products: productsSlice.actions,
  materials: materialsSlice.actions,
  suppliers: suppliersSlice.actions,
  production: productionSlice.actions,
  qualityInspections: qualitySlice.actions,
  dispatches: dispatchSlice.actions,
  installations: installationSlice.actions,
  siteInspections: inspectionsSlice.actions,
  purchaseRequests: purchaseRequestsSlice.actions,
  stockMoves: stockMovesSlice.actions,
  invoices: invoicesSlice.actions,
  serviceTickets: serviceSlice.actions,
  employees: employeesSlice.actions,
};

export const itemsOf = (state, key) => state[key]?.items || [];

const actor = (getState) => {
  const role = getState().auth.role;
  return { role, user: ROLES[role]?.user || 'System' };
};

const toastOk = (dispatch, title, message) => dispatch(addToast({ type: 'success', title, message }));
const toastErr = (dispatch, title, message) => dispatch(addToast({ type: 'error', title, message }));
const toastInfo = (dispatch, title, message) => dispatch(addToast({ type: 'info', title, message }));

const log = (dispatch, getState, { module, entityType, entityId, action, detail }) =>
  dispatch(addActivity({ ...actor(getState), module, entityType, entityId, action, detail }));

const notify = (dispatch, payload) => dispatch(addNotification(payload));

const findById = (state, collection, id) => itemsOf(state, collection).find((x) => x.id === id);

const byRole = (state, role, preferredName) => {
  const list = itemsOf(state, 'employees').filter((e) => e.role === role && e.active);
  if (!list.length) return '';
  return (list.find((e) => e.name === preferredName) || list[0]).name;
};

const nextRecordId = (getState, collection) => {
  const cfg = MODULE_CONFIGS[collection];
  return nextId(cfg.idPrefix, itemsOf(getState(), collection), cfg.idStart || 1);
};

const appendHistory = (item, entry) => [...(item.history || []), { at: new Date().toISOString(), ...entry }];

/* ------------------------------------------------------------------ */
/* Generic CRUD (with audit trail)                                    */
/* ------------------------------------------------------------------ */

export const createRecord = ({ collection, record, module, label, detail }) => (dispatch, getState) => {
  dispatch(actions[collection].addEntity(record));
  log(dispatch, getState, {
    module: module || collection,
    entityType: collection,
    entityId: record.id,
    action: `${label || MODULE_CONFIGS[collection]?.singular || 'Record'} created`,
    detail: detail || `${record.id} saved to the register.`,
  });
  toastOk(dispatch, `${label || 'Record'} created`, `${record.id} is now available.`);
  return record.id;
};

export const updateRecord = ({ collection, id, changes, module, label, detail, silent }) => (dispatch, getState) => {
  dispatch(actions[collection].updateEntity({ id, changes }));
  log(dispatch, getState, {
    module: module || collection,
    entityType: collection,
    entityId: id,
    action: `${label || MODULE_CONFIGS[collection]?.singular || 'Record'} updated`,
    detail: detail || `${id} details changed.`,
  });
  if (!silent) toastOk(dispatch, 'Changes saved', `${id} has been updated.`);
  return id;
};

export const deleteRecord = ({ collection, id, module, label }) => (dispatch, getState) => {
  const record = findById(getState(), collection, id);
  dispatch(actions[collection].removeEntity(id));
  log(dispatch, getState, {
    module: module || collection,
    entityType: collection,
    entityId: id,
    action: `${label || MODULE_CONFIGS[collection]?.singular || 'Record'} deleted`,
    detail: `${id}${record?.name ? ` · ${record.name}` : ''} removed.`,
  });
  toastOk(dispatch, `${label || 'Record'} deleted`, `${id} has been removed from the register.`);
};

/* ------------------------------------------------------------------ */
/* LEADS                                                              */
/* ------------------------------------------------------------------ */

export const addLeadNote = (leadId, text) => (dispatch, getState) => {
  const lead = findById(getState(), 'leads', leadId);
  if (!lead || !text?.trim()) return false;
  dispatch(leadsSlice.actions.updateEntity({
    id: leadId,
    changes: { notes: [...(lead.notes || []), { at: new Date().toISOString(), by: actor(getState).user, text }] },
  }));
  log(dispatch, getState, { module: 'leads', entityType: 'leads', entityId: leadId, action: 'Lead note added', detail: text });
  toastOk(dispatch, 'Note added', 'The lead timeline has been updated.');
  return true;
};

export const scheduleFollowUp = (leadId, date, note) => (dispatch, getState) => {
  const lead = findById(getState(), 'leads', leadId);
  if (!lead) return false;
  if (!date) { toastErr(dispatch, 'Follow-up date required', 'Choose the next follow-up date.'); return false; }
  const changes = {
    followUpDate: date,
    status: lead.status === 'New' ? 'Contacted' : lead.status,
    notes: note ? [...(lead.notes || []), { at: new Date().toISOString(), by: actor(getState).user, text: `Follow-up scheduled for ${date}: ${note}` }] : lead.notes,
  };
  dispatch(leadsSlice.actions.updateEntity({ id: leadId, changes }));
  log(dispatch, getState, { module: 'leads', entityType: 'leads', entityId: leadId, action: 'Follow-up scheduled', detail: `Next follow-up on ${date}.` });
  toastOk(dispatch, 'Follow-up scheduled', `Next contact on ${date}.`);
  return true;
};

export const requestSiteMeasurement = (leadId) => (dispatch, getState) => {
  const lead = findById(getState(), 'leads', leadId);
  if (!lead) return false;
  if (['Won', 'Lost'].includes(lead.status)) {
    toastErr(dispatch, 'Lead closed', 'A won or lost lead cannot request a new site visit.');
    return false;
  }
  dispatch(leadsSlice.actions.updateEntity({
    id: leadId,
    changes: { status: 'Measurement Pending', followUpDate: todayISO() },
  }));
  log(dispatch, getState, { module: 'leads', entityType: 'leads', entityId: leadId, action: 'Site measurement requested', detail: `${lead.projectName} sent to the measurement team.` });
  toastOk(dispatch, 'Measurement requested', 'The site engineer can now record door measurements.');
  return true;
};

export const updateLeadStatus = (leadId, status, remarks) => (dispatch, getState) => {
  const lead = findById(getState(), 'leads', leadId);
  if (!lead) return false;
  if (status === 'Won' && lead.status === 'Lost') {
    toastErr(dispatch, 'Invalid transition', 'A lost lead cannot be marked won without reopening it.');
    return false;
  }
  dispatch(leadsSlice.actions.updateEntity({
    id: leadId,
    changes: {
      status,
      notes: remarks ? [...(lead.notes || []), { at: new Date().toISOString(), by: actor(getState).user, text: remarks }] : lead.notes,
    },
  }));
  log(dispatch, getState, { module: 'leads', entityType: 'leads', entityId: leadId, action: `Lead marked ${status}`, detail: remarks || `${lead.projectName} moved to ${status}.` });
  toastOk(dispatch, 'Lead updated', `Status changed to ${status}.`);
  return true;
};

/* ------------------------------------------------------------------ */
/* QUOTATIONS                                                         */
/* ------------------------------------------------------------------ */

export const saveQuotation = (payload, existingId = null) => (dispatch, getState) => {
  if (!payload.items?.length) {
    toastErr(dispatch, 'Door items required', 'Add at least one door line before saving the quotation.');
    return null;
  }
  if (!payload.customerId || !payload.projectName || !payload.validUntil) {
    toastErr(dispatch, 'Missing details', 'Customer, project name and validity date are required.');
    return null;
  }
  const now = new Date().toISOString();
  const user = actor(getState).user;
  if (existingId) {
    const existing = findById(getState(), 'quotations', existingId);
    if (!existing) return null;
    const version = (existing.version || 1) + 1;
    dispatch(quotationsSlice.actions.updateEntity({
      id: existingId,
      changes: {
        ...payload,
        version,
        status: ['Converted', 'Accepted'].includes(existing.status) ? existing.status : 'Draft',
        revisions: [...(existing.revisions || []), { version, date: todayISO(), by: user, note: 'Quotation revised with updated door items and pricing.' }],
      },
    }));
    log(dispatch, getState, { module: 'quotations', entityType: 'quotations', entityId: existingId, action: 'Quotation revised', detail: `Version v${version} created.` });
    toastOk(dispatch, 'Quotation revised', `${existingId} is now at version v${version}.`);
    return existingId;
  }
  const id = nextRecordId(getState, 'quotations');
  const record = {
    ...payload,
    id,
    version: 1,
    status: 'Draft',
    preparedBy: payload.preparedBy || byRole(getState(), 'estimation'),
    approvedBy: null,
    approvedAt: null,
    sentAt: null,
    customerResponseAt: null,
    revisions: [{ version: 1, date: todayISO(), by: user, note: 'Quotation created.' }],
  };
  dispatch(quotationsSlice.actions.addEntity(record));
  if (payload.leadId) {
    dispatch(leadsSlice.actions.updateEntity({ id: payload.leadId, changes: { status: 'Quotation Requested', quotationId: id } }));
  }
  log(dispatch, getState, { module: 'quotations', entityType: 'quotations', entityId: id, action: 'Quotation created', detail: `${id} prepared for ${payload.projectName}.` });
  toastOk(dispatch, 'Quotation created', `${id} saved as a draft.`);
  return id;
};

export const submitQuotation = (id) => (dispatch, getState) => {
  const q = findById(getState(), 'quotations', id);
  if (!q) return false;
  if (!['Draft', 'Rejected'].includes(q.status)) {
    toastErr(dispatch, 'Cannot submit', `Quotation is already ${q.status}.`);
    return false;
  }
  dispatch(quotationsSlice.actions.updateEntity({ id, changes: { status: 'Pending Approval' } }));
  log(dispatch, getState, { module: 'quotations', entityType: 'quotations', entityId: id, action: 'Quotation submitted for approval', detail: `${id} · ${q.projectName}` });
  notify(dispatch, { title: 'Quotation awaiting approval', message: `${id} for ${q.projectName} is pending estimation approval.`, tone: 'warning', link: `/quotations/${id}` });
  toastOk(dispatch, 'Submitted for approval', 'The estimation manager has been notified.');
  return true;
};

export const approveQuotation = (id, remarks = '') => (dispatch, getState) => {
  const q = findById(getState(), 'quotations', id);
  if (!q) return false;
  if (q.status !== 'Pending Approval') {
    toastErr(dispatch, 'Cannot approve', 'Only quotations pending approval can be approved.');
    return false;
  }
  const totals = quotationTotals(q);
  dispatch(quotationsSlice.actions.updateEntity({
    id,
    changes: { status: 'Approved', approvedBy: actor(getState).user, approvedAt: new Date().toISOString(), approvalRemarks: remarks },
  }));
  log(dispatch, getState, { module: 'quotations', entityType: 'quotations', entityId: id, action: 'Quotation approved', detail: `${id} approved for ${inr(totals.grandTotal)}.` });
  toastOk(dispatch, 'Quotation approved', 'Sales can now send it to the customer.');
  return true;
};

export const rejectQuotation = (id, remarks) => (dispatch, getState) => {
  if (!remarks?.trim()) {
    toastErr(dispatch, 'Remarks required', 'Explain why the quotation is being rejected.');
    return false;
  }
  const q = findById(getState(), 'quotations', id);
  if (!q) return false;
  dispatch(quotationsSlice.actions.updateEntity({ id, changes: { status: 'Rejected', approvalRemarks: remarks } }));
  log(dispatch, getState, { module: 'quotations', entityType: 'quotations', entityId: id, action: 'Quotation rejected', detail: remarks });
  toastOk(dispatch, 'Quotation rejected', 'Estimation has been notified with your remarks.');
  return true;
};

export const sendQuotation = (id) => (dispatch, getState) => {
  const q = findById(getState(), 'quotations', id);
  if (!q) return false;
  if (q.status !== 'Approved') {
    toastErr(dispatch, 'Approval required', 'The quotation must be approved before it is sent to the customer.');
    return false;
  }
  dispatch(quotationsSlice.actions.updateEntity({ id, changes: { status: 'Sent', sentAt: new Date().toISOString() } }));
  if (q.leadId) dispatch(leadsSlice.actions.updateEntity({ id: q.leadId, changes: { status: 'Quotation Sent', followUpDate: todayISO() } }));
  log(dispatch, getState, { module: 'quotations', entityType: 'quotations', entityId: id, action: 'Quotation sent to customer', detail: `${id} emailed to the customer.` });
  toastOk(dispatch, 'Quotation sent', 'Customer follow-up date set to today.');
  return true;
};

export const recordQuotationResponse = (id, response, remarks = '') => (dispatch, getState) => {
  const q = findById(getState(), 'quotations', id);
  if (!q) return false;
  if (q.status !== 'Sent') {
    toastErr(dispatch, 'Not ready', 'Send the quotation to the customer first.');
    return false;
  }
  const accepted = response === 'Accepted';
  dispatch(quotationsSlice.actions.updateEntity({
    id,
    changes: { status: response, customerResponseAt: new Date().toISOString(), customerRemarks: remarks },
  }));
  if (q.leadId) {
    dispatch(leadsSlice.actions.updateEntity({ id: q.leadId, changes: { status: accepted ? 'Won' : 'Lost' } }));
  }
  log(dispatch, getState, {
    module: 'quotations', entityType: 'quotations', entityId: id,
    action: `Customer ${response.toLowerCase()} quotation`,
    detail: remarks || `${id} marked ${response}.`,
  });
  toastOk(dispatch, `Quotation ${response.toLowerCase()}`, accepted ? 'You can now convert it into a sales order.' : 'The lead has been marked lost.');
  return true;
};

export const convertQuotationToOrder = (id, { advance = 0, deliveryDate, projectManager, paymentTerms } = {}) => (dispatch, getState) => {
  const state = getState();
  const q = findById(state, 'quotations', id);
  if (!q) return null;
  if (q.status !== 'Accepted') {
    toastErr(dispatch, 'Customer acceptance required', 'Record customer acceptance before creating a sales order.');
    return null;
  }
  if (itemsOf(state, 'salesOrders').some((o) => o.quotationId === id)) {
    toastErr(dispatch, 'Order already exists', 'This quotation has already been converted.');
    return null;
  }
  const totals = quotationTotals(q);
  const orderId = nextRecordId(getState, 'salesOrders');
  const order = {
    id: orderId,
    quotationId: id,
    customerId: q.customerId,
    projectName: q.projectName,
    date: todayISO(),
    value: totals.grandTotal,
    advance: Number(advance) || 0,
    paymentTerms: paymentTerms || q.paymentTerms,
    deliveryDate: deliveryDate || '',
    projectManager: projectManager || byRole(state, 'project_manager'),
    status: Number(advance) > 0 ? 'Ready for Project Planning' : 'Advance Pending',
    approvalDoc: `Customer acceptance — ${id}`,
    salesExecutive: q.salesExecutive,
  };
  dispatch(salesOrdersSlice.actions.addEntity(order));
  dispatch(quotationsSlice.actions.updateEntity({ id, changes: { status: 'Converted', salesOrderId: orderId } }));
  if (q.leadId) dispatch(leadsSlice.actions.updateEntity({ id: q.leadId, changes: { status: 'Won', salesOrderId: orderId } }));
  log(dispatch, getState, { module: 'salesOrders', entityType: 'salesOrders', entityId: orderId, action: 'Sales order created', detail: `${orderId} created from ${id} for ${inr(totals.grandTotal)}.` });
  notify(dispatch, { title: 'New sales order', message: `${orderId} · ${q.projectName} is ready for project planning.`, tone: 'success', link: `/sales-orders/${orderId}` });
  toastOk(dispatch, 'Sales order created', `${orderId} has been created from the approved quotation.`);
  return orderId;
};

/* ------------------------------------------------------------------ */
/* SALES ORDERS & PROJECTS                                            */
/* ------------------------------------------------------------------ */

export const confirmSalesOrder = (id) => (dispatch, getState) => {
  const order = findById(getState(), 'salesOrders', id);
  if (!order) return false;
  if (!['Draft', 'Advance Pending'].includes(order.status)) {
    toastErr(dispatch, 'Cannot confirm', `Order is already ${order.status}.`);
    return false;
  }
  dispatch(salesOrdersSlice.actions.updateEntity({ id, changes: { status: 'Confirmed' } }));
  log(dispatch, getState, { module: 'salesOrders', entityType: 'salesOrders', entityId: id, action: 'Sales order confirmed', detail: `${id} confirmed with the customer.` });
  toastOk(dispatch, 'Order confirmed', 'You can record the advance and start project planning.');
  return true;
};

export const recordOrderAdvance = (id, amount, method = 'NEFT', reference = '') => (dispatch, getState) => {
  const order = findById(getState(), 'salesOrders', id);
  if (!order) return false;
  const value = Number(amount) || 0;
  if (value <= 0) { toastErr(dispatch, 'Invalid amount', 'Enter an advance amount greater than zero.'); return false; }
  if (['Cancelled', 'Completed'].includes(order.status)) {
    toastErr(dispatch, 'Closed order', 'Advances cannot be recorded on closed orders.');
    return false;
  }
  const nextAdvance = (Number(order.advance) || 0) + value;
  const status = ['Draft', 'Advance Pending', 'Confirmed'].includes(order.status) ? 'Ready for Project Planning' : order.status;
  dispatch(salesOrdersSlice.actions.updateEntity({
    id,
    changes: { advance: nextAdvance, status, advanceMethod: method, advanceReference: reference },
  }));
  log(dispatch, getState, { module: 'salesOrders', entityType: 'salesOrders', entityId: id, action: 'Advance payment recorded', detail: `${inr(value)} received via ${method}.` });
  toastOk(dispatch, 'Advance recorded', `${inr(value)} added. Order is ready for project planning.`);
  return true;
};

export const createProjectFromOrder = (orderId, overrides = {}) => (dispatch, getState) => {
  const state = getState();
  const order = findById(state, 'salesOrders', orderId);
  if (!order) return null;
  if (!['Confirmed', 'Ready for Project Planning'].includes(order.status)) {
    toastErr(dispatch, 'Order not ready', 'Confirm the order and record the advance before creating a project.');
    return null;
  }
  if (itemsOf(state, 'projects').some((p) => p.salesOrderId === orderId)) {
    toastErr(dispatch, 'Project already exists', 'This order is already linked to a project.');
    return null;
  }
  const q = findById(state, 'quotations', order.quotationId);
  const products = itemsOf(state, 'products');
  const doors = [];
  (q?.items || []).forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    for (let i = 0; i < (Number(item.qty) || 0); i += 1) {
      const n = doors.length + 1;
      doors.push({
        id: `${nextRecordId(getState, 'projects')}-D${String(n).padStart(2, '0')}`,
        number: `D-${String(n).padStart(2, '0')}`,
        productId: item.productId,
        productName: product?.name || item.productId,
        category: product?.category || '',
        design: item.design || product?.design || '',
        material: item.material || product?.material || '',
        finish: item.finish || product?.finish || '',
        height: item.height || product?.height || 2100,
        width: item.width || product?.width || 900,
        thickness: product?.thickness || 35,
        frameType: item.frameType || product?.frameType || '',
        hardware: item.hardware || product?.hardware || '',
        room: 'General',
        qty: 1,
      });
    }
  });
  if (!doors.length) {
    toastErr(dispatch, 'No door items', 'The linked quotation has no door items to copy.');
    return null;
  }
  const projectId = nextRecordId(getState, 'projects');
  doors.forEach((door) => { door.id = `${projectId}-${door.id.split('-D')[1] ? `D${door.id.split('-D')[1]}` : door.id}`; });
  const project = {
    id: projectId,
    name: order.projectName,
    customerId: order.customerId,
    salesOrderId: orderId,
    manager: overrides.manager || order.projectManager || byRole(state, 'project_manager'),
    mistri: overrides.mistri || byRole(state, 'mistri'),
    productionSupervisor: overrides.productionSupervisor || byRole(state, 'production_supervisor'),
    installationSupervisor: overrides.installationSupervisor || byRole(state, 'installation_supervisor'),
    siteSupervisor: overrides.siteSupervisor || byRole(state, 'site_supervisor'),
    startDate: overrides.startDate || todayISO(),
    endDate: overrides.endDate || order.deliveryDate || '',
    location: overrides.location || q?.siteAddress || '',
    totalDoors: doors.length,
    budget: overrides.budget || Math.round((Number(order.value) || 0) * 1.04),
    advanceReceived: Number(order.advance) || 0,
    status: 'Planning',
    priority: overrides.priority || 'Medium',
    notes: overrides.notes || 'Project created from confirmed sales order.',
    documents: [{ id: `DOC-${projectId}-1`, name: 'Approved Quotation.pdf', type: 'pdf', size: '540 KB', uploadedAt: todayISO(), by: actor(state).user }],
    doors,
    issues: [],
    salesExecutive: order.salesExecutive,
  };
  dispatch(projectsSlice.actions.addEntity(project));
  dispatch(salesOrdersSlice.actions.updateEntity({ id: orderId, changes: { status: 'In Progress', projectId } }));
  log(dispatch, getState, { module: 'projects', entityType: 'projects', entityId: projectId, action: 'Project created', detail: `${projectId} · ${project.name} created with ${doors.length} doors.` });
  notify(dispatch, { title: 'Project created', message: `${projectId} is now in planning with ${doors.length} door items.`, tone: 'success', link: `/projects/${projectId}` });
  toastOk(dispatch, 'Project created', `${projectId} created with ${doors.length} door items.`);
  return projectId;
};

export const updateProjectAssignments = (projectId, changes) => (dispatch, getState) => {
  const project = findById(getState(), 'projects', projectId);
  if (!project) return false;
  dispatch(projectsSlice.actions.updateEntity({ id: projectId, changes }));
  const names = ['manager', 'mistri', 'productionSupervisor', 'installationSupervisor', 'siteSupervisor']
    .filter((k) => changes[k])
    .map((k) => `${k.replace(/([A-Z])/g, ' $1')}: ${changes[k]}`)
    .join(' · ');
  log(dispatch, getState, { module: 'projects', entityType: 'projects', entityId: projectId, action: 'Team assignment updated', detail: names || 'Project team updated.' });
  toastOk(dispatch, 'Team updated', 'Assignments have been saved.');
  return true;
};

export const addProjectDoor = (projectId, door) => (dispatch, getState) => {
  const project = findById(getState(), 'projects', projectId);
  if (!project) return null;
  const number = door.number || `D-${String(project.doors.length + 1).padStart(2, '0')}`;
  if (project.doors.some((d) => d.number === number)) {
    toastErr(dispatch, 'Duplicate door number', `${number} already exists in this project.`);
    return null;
  }
  const product = findById(getState(), 'products', door.productId);
  const record = {
    ...door,
    id: `${projectId}-${number.replace('-', '')}`,
    number,
    productName: door.productName || product?.name || '',
    category: product?.category || door.category || '',
    design: product?.design || door.design || '',
    material: product?.material || door.material || '',
    finish: product?.finish || door.finish || '',
    height: Number(door.height) || product?.height || 2100,
    width: Number(door.width) || product?.width || 900,
    thickness: Number(door.thickness) || product?.thickness || 35,
    frameType: product?.frameType || door.frameType || '',
    hardware: product?.hardware || door.hardware || '',
    qty: 1,
  };
  const doors = [...project.doors, record];
  dispatch(projectsSlice.actions.updateEntity({ id: projectId, changes: { doors, totalDoors: doors.length } }));
  log(dispatch, getState, { module: 'projects', entityType: 'projects', entityId: projectId, action: 'Door added to project', detail: `${number} · ${record.productName}` });
  toastOk(dispatch, 'Door added', `${number} added to the project schedule.`);
  return record;
};

export const createProductionPlan = (projectId) => (dispatch, getState) => {
  const state = getState();
  const project = findById(state, 'projects', projectId);
  if (!project) return 0;
  if (project.status === 'On Hold') {
    toastErr(dispatch, 'Project on hold', 'Resume the project before planning production.');
    return 0;
  }
  if (project.status === 'Completed') {
    toastErr(dispatch, 'Project completed', 'Production cannot be planned for a closed project.');
    return 0;
  }
  const order = findById(state, 'salesOrders', project.salesOrderId);
  if (!order || ['Draft', 'Advance Pending', 'Cancelled'].includes(order.status)) {
    toastErr(dispatch, 'Order not confirmed', 'A confirmed sales order is required before production.');
    return 0;
  }
  if (!project.mistri || !project.productionSupervisor) {
    toastErr(dispatch, 'Teams not assigned', 'Assign a mistri and production supervisor first.');
    return 0;
  }
  const existing = itemsOf(state, 'production').filter((p) => p.projectId === projectId);
  const pendingDoors = project.doors.filter((door) => !existing.some((p) => p.doorNumber === door.number));
  if (!pendingDoors.length) {
    toastInfo(dispatch, 'Already planned', 'Every door in this project already has a production order.');
    return 0;
  }
  const qcManager = byRole(state, 'qc');
  const records = pendingDoors.map((door, index) => {
    const plannedStart = todayISO();
    const plannedEnd = new Date(Date.now() + (14 + index) * 86400000).toISOString().slice(0, 10);
    return {
      id: nextId('PO-', [...itemsOf(state, 'production'), ...pendingDoors.slice(0, index).map(() => ({}))], 7000),
      projectId,
      salesOrderId: project.salesOrderId,
      doorId: door.id,
      doorNumber: door.number,
      productId: door.productId,
      productName: door.productName,
      doorSpec: `${door.material} · ${door.design} · ${door.height}×${door.width}×${door.thickness} mm`,
      quantity: 1,
      mistri: project.mistri,
      supervisor: project.productionSupervisor,
      plannedStart,
      plannedEnd,
      actualStart: null,
      actualEnd: null,
      materialsRequired: [`${door.material} — as per BOM`, 'Hardware kit', 'Finish consumables'],
      materialConsumed: [],
      wastage: '—',
      batch: `BATCH-${projectId.slice(-2)}-${String(index + 1).padStart(2, '0')}`,
      status: 'Ready to Start',
      qcManager,
      notes: '',
    };
  });
  // Ensure generated IDs are unique across the batch.
  let counter = 7000 + itemsOf(state, 'production').length + 1;
  records.forEach((rec) => {
    rec.id = `PO-${counter}`;
    counter += 1;
  });
  dispatch(productionSlice.actions.addEntities(records));
  dispatch(projectsSlice.actions.updateEntity({ id: projectId, changes: { status: 'In Production' } }));
  log(dispatch, getState, { module: 'production', entityType: 'projects', entityId: projectId, action: 'Production planned', detail: `${records.length} production orders created for ${project.name}.` });
  notify(dispatch, { title: 'Production plan created', message: `${records.length} doors queued for manufacturing at ${project.name}.`, tone: 'info', link: `/projects/${projectId}` });
  toastOk(dispatch, 'Production planned', `${records.length} production orders are ready to start.`);
  return records.length;
};

export const setProjectStatus = (projectId, status) => (dispatch, getState) => {
  const project = findById(getState(), 'projects', projectId);
  if (!project) return false;
  dispatch(projectsSlice.actions.updateEntity({ id: projectId, changes: { status } }));
  log(dispatch, getState, { module: 'projects', entityType: 'projects', entityId: projectId, action: `Project marked ${status}`, detail: `${project.name} status changed to ${status}.` });
  toastOk(dispatch, 'Project updated', `Status is now ${status}.`);
  return true;
};

export const closeProject = (projectId) => (dispatch, getState) => {
  const state = getState();
  const project = findById(state, 'projects', projectId);
  if (!project) return false;
  const inspections = itemsOf(state, 'siteInspections').filter((i) => i.projectId === projectId);
  const missing = project.doors.filter((door) => !inspections.some((i) => i.doorNumber === door.number && i.status === 'Approved'));
  if (missing.length) {
    toastErr(dispatch, 'Site approval pending', `${missing.length} of ${project.doors.length} doors are not site-approved yet.`);
    return false;
  }
  if (!project.siteApproval?.approved) {
    toastErr(dispatch, 'Final site approval required', 'The site supervisor must submit final project approval first.');
    return false;
  }
  dispatch(projectsSlice.actions.updateEntity({ id: projectId, changes: { status: 'Completed', closedAt: new Date().toISOString(), closedBy: actor(state).user } }));
  dispatch(salesOrdersSlice.actions.updateEntity({ id: project.salesOrderId, changes: { status: 'Completed' } }));
  log(dispatch, getState, { module: 'projects', entityType: 'projects', entityId: projectId, action: 'Project closed', detail: `${project.name} completed and handed over.` });
  notify(dispatch, { title: 'Project completed', message: `${project.name} closed after final site approval.`, tone: 'success', link: `/projects/${projectId}` });
  toastOk(dispatch, 'Project closed', 'All approvals were verified. Project marked completed.');
  return true;
};

/* ------------------------------------------------------------------ */
/* PRODUCTION & QUALITY                                               */
/* ------------------------------------------------------------------ */

const getProjectOrderGate = (state, projectId) => {
  const project = findById(state, 'projects', projectId);
  const order = project ? findById(state, 'salesOrders', project.salesOrderId) : null;
  return { project, order };
};

export const issueProductionMaterial = (productionId) => (dispatch, getState) => {
  const p = findById(getState(), 'production', productionId);
  if (!p) return false;
  if (!['Pending', 'Material Pending', 'Ready to Start'].includes(p.status)) {
    toastErr(dispatch, 'Not applicable', `Material issue is not required for a ${p.status} job.`);
    return false;
  }
  dispatch(productionSlice.actions.updateEntity({ id: productionId, changes: { status: 'Ready to Start', materialIssuedAt: new Date().toISOString(), materialIssuedBy: actor(getState()).user } }));
  log(dispatch, getState, { module: 'production', entityType: 'production', entityId: productionId, action: 'Material issued', detail: `Material kit issued by stores for ${p.doorNumber}.` });
  toastOk(dispatch, 'Material issued', 'The production team can start manufacturing.');
  return true;
};

export const startProduction = (productionId) => (dispatch, getState) => {
  const state = getState();
  const p = findById(state, 'production', productionId);
  if (!p) return false;
  if (!['Ready to Start', 'Pending', 'On Hold', 'Rework Required'].includes(p.status)) {
    toastErr(dispatch, 'Cannot start', `Job is currently ${p.status}.`);
    return false;
  }
  const { project, order } = getProjectOrderGate(state, p.projectId);
  if (!project) { toastErr(dispatch, 'Project missing', 'This production order is not linked to a project.'); return false; }
  if (!order || ['Draft', 'Advance Pending', 'Cancelled'].includes(order.status)) {
    toastErr(dispatch, 'Order not confirmed', 'Production requires a confirmed sales order.');
    return false;
  }
  dispatch(productionSlice.actions.updateEntity({ id: productionId, changes: { status: 'In Progress', actualStart: p.actualStart || todayISO() } }));
  log(dispatch, getState, { module: 'production', entityType: 'production', entityId: productionId, action: 'Production started', detail: `${p.doorNumber} · ${p.productName} moved to the shop floor.` });
  toastOk(dispatch, 'Production started', `${p.doorNumber} is now in progress.`);
  return true;
};

export const holdProduction = (productionId, note = '') => (dispatch, getState) => {
  const p = findById(getState(), 'production', productionId);
  if (!p) return false;
  dispatch(productionSlice.actions.updateEntity({ id: productionId, changes: { status: 'On Hold', holdNote: note } }));
  log(dispatch, getState, { module: 'production', entityType: 'production', entityId: productionId, action: 'Production put on hold', detail: note || `${p.doorNumber} paused by production supervisor.` });
  toastOk(dispatch, 'Production on hold', 'The job has been paused.');
  return true;
};

export const completeProduction = (productionId) => (dispatch, getState) => {
  const state = getState();
  const p = findById(state, 'production', productionId);
  if (!p) return false;
  if (!['In Progress', 'Rework Required', 'Ready to Start'].includes(p.status)) {
    toastErr(dispatch, 'Cannot complete', `Job is currently ${p.status}.`);
    return false;
  }
  const pendingQc = itemsOf(state, 'qualityInspections').find((q) => q.productionId === productionId && q.status === 'Pending');
  if (pendingQc) {
    toastInfo(dispatch, 'QC already pending', `${pendingQc.id} is already awaiting quality inspection.`);
    return false;
  }
  const qcId = nextRecordId(getState, 'qualityInspections');
  const qc = {
    id: qcId,
    productionId,
    projectId: p.projectId,
    doorNumber: p.doorNumber,
    doorName: p.productName,
    date: todayISO(),
    inspector: p.qcManager || byRole(state, 'qc'),
    checks: { dimension: false, material: false, surface: false, colour: false, hardware: false },
    overall: 'Pending',
    images: [],
    remarks: '',
    status: 'Pending',
    reworkCount: p.status === 'Rework Required' ? 1 : 0,
  };
  dispatch(productionSlice.actions.updateEntity({ id: productionId, changes: { status: 'Quality Inspection Pending', actualEnd: todayISO() } }));
  dispatch(qualitySlice.actions.addEntity(qc));
  log(dispatch, getState, { module: 'production', entityType: 'production', entityId: productionId, action: 'Production completed', detail: `${p.doorNumber} submitted for QC as ${qcId}.` });
  notify(dispatch, { title: 'QC inspection pending', message: `${p.doorNumber} · ${p.productName} is ready for inspection.`, tone: 'warning', link: `/quality/${qcId}` });
  toastOk(dispatch, 'Sent for QC', `${qcId} created for ${p.doorNumber}.`);
  return qcId;
};

export const approveQC = (qcId, checks, remarks = '') => (dispatch, getState) => {
  const qc = findById(getState(), 'qualityInspections', qcId);
  if (!qc) return false;
  const missing = Object.entries(checks || {}).filter(([, v]) => !v);
  if (missing.length) {
    toastErr(dispatch, 'Checklist incomplete', 'All quality checks must pass before approval.');
    return false;
  }
  const production = findById(getState(), 'production', qc.productionId);
  dispatch(qualitySlice.actions.updateEntity({
    id: qcId,
    changes: { status: 'Approved', checks, overall: 'Pass', remarks, approvedBy: actor(getState()).user, approvedAt: new Date().toISOString(), history: appendHistory(qc, { by: actor(getState()).user, status: 'Approved', remarks }) },
  }));
  if (production) dispatch(productionSlice.actions.updateEntity({ id: production.id, changes: { status: 'Quality Approved' } }));
  const projectQc = itemsOf(getState(), 'qualityInspections').filter((q) => q.projectId === qc.projectId);
  const project = findById(getState(), 'projects', qc.projectId);
  if (project) {
    const approvedCount = project.doors.filter((door) => projectQc.some((q) => q.doorNumber === door.number && (q.id === qcId || q.status === 'Approved'))).length;
    if (approvedCount === project.doors.length) {
      dispatch(projectsSlice.actions.updateEntity({ id: project.id, changes: { status: project.status === 'Completed' ? 'Completed' : 'Dispatch Ready' } }));
    }
  }
  log(dispatch, getState, { module: 'quality', entityType: 'qualityInspections', entityId: qcId, action: 'QC inspection approved', detail: `${qc.doorNumber} cleared for finished goods.` });
  toastOk(dispatch, 'QC approved', `${qc.doorNumber} is now available for dispatch.`);
  return true;
};

export const rejectQC = (qcId, remarks) => (dispatch, getState) => {
  if (!remarks?.trim()) {
    toastErr(dispatch, 'Remarks required', 'Record the defect before rejecting a door.');
    return false;
  }
  const qc = findById(getState(), 'qualityInspections', qcId);
  if (!qc) return false;
  dispatch(qualitySlice.actions.updateEntity({
    id: qcId,
    changes: { status: 'Rejected', overall: 'Fail', remarks, rejectedBy: actor(getState()).user, rejectedAt: new Date().toISOString(), history: appendHistory(qc, { by: actor(getState()).user, status: 'Rejected', remarks }) },
  }));
  dispatch(productionSlice.actions.updateEntity({ id: qc.productionId, changes: { status: 'Rework Required', actualEnd: null } }));
  log(dispatch, getState, { module: 'quality', entityType: 'qualityInspections', entityId: qcId, action: 'QC rejected', detail: remarks });
  toastOk(dispatch, 'Rework requested', 'Production has been asked to correct the door.');
  return true;
};

export const restartProduction = (productionId) => (dispatch, getState) => {
  const p = findById(getState(), 'production', productionId);
  if (!p) return false;
  dispatch(productionSlice.actions.updateEntity({ id: productionId, changes: { status: 'In Progress', actualEnd: null } }));
  log(dispatch, getState, { module: 'production', entityType: 'production', entityId: productionId, action: 'Rework started', detail: `${p.doorNumber} back on the shop floor.` });
  toastOk(dispatch, 'Rework started', 'Complete the job again to trigger a fresh QC inspection.');
  return true;
};

/* ------------------------------------------------------------------ */
/* DISPATCH                                                           */
/* ------------------------------------------------------------------ */

const updateDispatch = (dispatch, getState, id, changes, action, detail) => {
  dispatch(dispatchSlice.actions.updateEntity({ id, changes }));
  log(dispatch, getState, { module: 'dispatch', entityType: 'dispatches', entityId: id, action, detail });
};

export const prepareDispatch = (id) => (dispatch, getState) => {
  const d = findById(getState(), 'dispatches', id);
  if (!d) return false;
  if (!['Ready for Dispatch', 'Packing'].includes(d.status)) { toastErr(dispatch, 'Cannot pack', `Dispatch is ${d.status}.`); return false; }
  updateDispatch(dispatch, getState, id, { status: 'Packing', packingStatus: 'Packing in progress' }, 'Dispatch packing started', `${d.id} packing started.`);
  toastOk(dispatch, 'Packing started', 'Doors are being packed with edge protection.');
  return true;
};

export const sendDispatch = (id) => (dispatch, getState) => {
  const d = findById(getState(), 'dispatches', id);
  if (!d) return false;
  if (!['Ready for Dispatch', 'Packing'].includes(d.status)) { toastErr(dispatch, 'Cannot dispatch', `Dispatch is ${d.status}.`); return false; }
  const approved = itemsOf(getState(), 'qualityInspections').filter((q) => q.projectId === d.projectId && q.status === 'Approved');
  const unapproved = (d.doorNumbers || []).filter((num) => !approved.some((q) => q.doorNumber === num));
  if (unapproved.length) {
    toastErr(dispatch, 'QC approval missing', `${unapproved.join(', ')} must pass QC before dispatch.`);
    return false;
  }
  updateDispatch(dispatch, getState, id, { status: 'Dispatched', dispatchDate: d.dispatchDate || todayISO(), packingStatus: 'Packed and sealed' }, 'Dispatch released', `${d.id} left the warehouse.`);
  toastOk(dispatch, 'Dispatch released', 'Vehicle details recorded and goods released.');
  return true;
};

export const transitDispatch = (id) => (dispatch, getState) => {
  const d = findById(getState(), 'dispatches', id);
  if (!d) return false;
  if (d.status !== 'Dispatched') { toastErr(dispatch, 'Invalid status', 'Only dispatched consignments can be marked in transit.'); return false; }
  updateDispatch(dispatch, getState, id, { status: 'In Transit' }, 'Dispatch in transit', `${d.id} is on the road to site.`);
  toastOk(dispatch, 'In transit', 'Delivery tracking updated.');
  return true;
};

export const confirmDelivery = (id, { receivedBy = 'Site Engineer', proof = '' } = {}) => (dispatch, getState) => {
  const state = getState();
  const d = findById(state, 'dispatches', id);
  if (!d) return false;
  if (!['Dispatched', 'In Transit'].includes(d.status)) {
    toastErr(dispatch, 'Cannot confirm delivery', `Dispatch is ${d.status}.`);
    return false;
  }
  updateDispatch(dispatch, getState, id, {
    status: 'Delivered',
    actualDeliveryDate: todayISO(),
    receivedBy,
    receivedAt: new Date().toISOString(),
    deliveryProof: proof || `${id}-POD.pdf`,
  }, 'Site delivery confirmed', `${d.id} received at site by ${receivedBy}.`);
  const project = findById(state, 'projects', d.projectId);
  if (project) {
    const delivered = itemsOf(state, 'dispatches')
      .filter((x) => x.projectId === project.id && (x.id === id || x.status === 'Delivered'))
      .flatMap((x) => x.doorNumbers);
    if (project.doors.every((door) => delivered.includes(door.number))) {
      dispatch(projectsSlice.actions.updateEntity({ id: project.id, changes: { status: 'Dispatched' } }));
    }
  }
  notify(dispatch, { title: 'Delivery confirmed', message: `${d.id} delivered — installation can now be scheduled.`, tone: 'info', link: '/installation' });
  toastOk(dispatch, 'Delivery confirmed', 'Installation can now begin for these doors.');
  return true;
};

export const markDeliveryIssue = (id, note) => (dispatch, getState) => {
  if (!note?.trim()) { toastErr(dispatch, 'Note required', 'Describe the delivery issue.'); return false; }
  const d = findById(getState(), 'dispatches', id);
  if (!d) return false;
  updateDispatch(dispatch, getState, id, { status: 'Delivery Issue', deliveryIssue: note }, 'Delivery issue reported', note);
  notify(dispatch, { title: 'Delivery issue', message: note, tone: 'error', link: `/dispatch/${id}` });
  toastOk(dispatch, 'Issue logged', 'Logistics and the project manager have been alerted.');
  return true;
};

/* ------------------------------------------------------------------ */
/* INSTALLATION & SITE INSPECTION                                     */
/* ------------------------------------------------------------------ */

export const scheduleInstallationJob = (id, date) => (dispatch, getState) => {
  if (!date) return false;
  const job = findById(getState(), 'installations', id);
  if (!job) return false;
  dispatch(installationSlice.actions.updateEntity({ id, changes: { plannedDate: date, status: job.status === 'Pending' ? 'Scheduled' : job.status } }));
  log(dispatch, getState, { module: 'installation', entityType: 'installations', entityId: id, action: 'Installation scheduled', detail: `${job.doorNumber} planned for ${date}.` });
  toastOk(dispatch, 'Installation scheduled', 'The team has been given the date.');
  return true;
};

export const assignInstallationTeam = (id, team) => (dispatch, getState) => {
  const job = findById(getState(), 'installations', id);
  if (!job) return false;
  if (!team?.length) { toastErr(dispatch, 'Team required', 'Add at least one team member.'); return false; }
  dispatch(installationSlice.actions.updateEntity({ id, changes: { team, status: job.status === 'Pending' || job.status === 'Scheduled' ? 'Team Assigned' : job.status } }));
  log(dispatch, getState, { module: 'installation', entityType: 'installations', entityId: id, action: 'Installation team assigned', detail: team.join(', ') });
  toastOk(dispatch, 'Team assigned', 'The installation crew has been allocated.');
  return true;
};

export const startInstallationJob = (id) => (dispatch, getState) => {
  const state = getState();
  const job = findById(state, 'installations', id);
  if (!job) return false;
  const delivered = itemsOf(state, 'dispatches').some((d) => d.projectId === job.projectId && d.status === 'Delivered' && (d.doorNumbers || []).includes(job.doorNumber));
  if (!delivered) {
    toastErr(dispatch, 'Delivery not confirmed', 'Take delivery at site before starting installation.');
    return false;
  }
  dispatch(installationSlice.actions.updateEntity({ id, changes: { status: 'In Progress', actualDate: job.actualDate || todayISO() } }));
  log(dispatch, getState, { module: 'installation', entityType: 'installations', entityId: id, action: 'Installation started', detail: `${job.doorNumber} installation in progress.` });
  toastOk(dispatch, 'Installation started', 'The crew is on site.');
  return true;
};

export const completeInstallationJob = (id) => (dispatch, getState) => {
  const state = getState();
  const job = findById(state, 'installations', id);
  if (!job) return false;
  if (job.status === 'Completed') { toastInfo(dispatch, 'Already completed', 'This door has already been submitted.'); return false; }
  const delivered = itemsOf(state, 'dispatches').some((d) => d.projectId === job.projectId && d.status === 'Delivered' && (d.doorNumbers || []).includes(job.doorNumber));
  if (!delivered) {
    toastErr(dispatch, 'Delivery not confirmed', 'Installation cannot complete before the door is delivered and received.');
    return false;
  }
  const inspectionId = nextRecordId(getState(), 'siteInspections');
  const project = findById(state, 'projects', job.projectId);
  const inspection = {
    id: inspectionId,
    projectId: job.projectId,
    customerId: job.customerId,
    supervisor: project?.siteSupervisor || byRole(state, 'site_supervisor'),
    doorNumber: job.doorNumber,
    inspectionDate: todayISO(),
    installationId: job.id,
    checks: { alignment: false, opening: false, lock: false, handle: false, hinge: false, surface: false, quality: false },
    defectDescription: '',
    images: [],
    remarks: '',
    status: 'Pending Inspection',
    history: [],
  };
  dispatch(installationSlice.actions.updateEntity({
    id,
    changes: {
      status: 'Inspection Pending',
      actualDate: todayISO(),
      fittingStatus: 'Fitted',
      alignmentStatus: 'Aligned',
      hardwareStatus: 'Fitted & Tested',
      finishingStatus: 'Touch-up Done',
    },
  }));
  dispatch(inspectionsSlice.actions.addEntity(inspection));
  log(dispatch, getState, { module: 'installation', entityType: 'installations', entityId: id, action: 'Installation submitted for inspection', detail: `${job.doorNumber} ready for site approval as ${inspectionId}.` });
  notify(dispatch, { title: 'Site inspection pending', message: `${job.doorNumber} installation is awaiting site supervisor approval.`, tone: 'warning', link: `/inspections/${inspectionId}` });
  toastOk(dispatch, 'Sent for inspection', `${inspectionId} created for ${job.doorNumber}.`);
  return inspectionId;
};

export const approveSiteInspection = (inspectionId, checks, remarks = '') => (dispatch, getState) => {
  const state = getState();
  const insp = findById(state, 'siteInspections', inspectionId);
  if (!insp) return false;
  const missing = Object.entries(checks || {}).filter(([, v]) => !v);
  if (missing.length) {
    toastErr(dispatch, 'Checklist incomplete', 'All site checks must pass before approval.');
    return false;
  }
  dispatch(inspectionsSlice.actions.updateEntity({
    id: inspectionId,
    changes: {
      status: 'Approved',
      checks,
      remarks,
      approvedBy: actor(state).user,
      approvedAt: new Date().toISOString(),
      history: appendHistory(insp, { by: actor(state).user, status: 'Approved', remarks }),
    },
  }));
  if (insp.installationId) dispatch(installationSlice.actions.updateEntity({ id: insp.installationId, changes: { status: 'Completed' } }));
  log(dispatch, getState, { module: 'inspections', entityType: 'siteInspections', entityId: inspectionId, action: 'Site inspection approved', detail: `${insp.doorNumber} approved at site.` });
  toastOk(dispatch, 'Site approved', `${insp.doorNumber} passed final inspection.`);
  return true;
};

export const rejectSiteInspection = (inspectionId, remarks) => (dispatch, getState) => {
  if (!remarks?.trim()) {
    toastErr(dispatch, 'Remarks required', 'Every rejection must include remarks for the installation team.');
    return false;
  }
  const state = getState();
  const insp = findById(state, 'siteInspections', inspectionId);
  if (!insp) return false;
  dispatch(inspectionsSlice.actions.updateEntity({
    id: inspectionId,
    changes: {
      status: 'Rejected',
      remarks,
      defectDescription: remarks,
      checks: Object.fromEntries(Object.keys(insp.checks || {}).map((k) => [k, false])),
      rejectedBy: actor(state).user,
      rejectedAt: new Date().toISOString(),
      history: appendHistory(insp, { by: actor(state).user, status: 'Rejected', remarks }),
    },
  }));
  if (insp.installationId) dispatch(installationSlice.actions.updateEntity({ id: insp.installationId, changes: { status: 'Rework Required', remarks } }));
  const project = findById(state, 'projects', insp.projectId);
  if (project) dispatch(projectsSlice.actions.updateEntity({ id: project.id, changes: { status: 'Installation' } }));
  log(dispatch, getState, { module: 'inspections', entityType: 'siteInspections', entityId: inspectionId, action: 'Site inspection rejected', detail: remarks });
  notify(dispatch, { title: 'Installation rework raised', message: `${insp.doorNumber}: ${remarks}`, tone: 'error', link: `/installation/${insp.installationId}` });
  toastOk(dispatch, 'Rework raised', 'The installation team must correct the work and resubmit.');
  return true;
};

export const resubmitInstallation = (installationId) => (dispatch, getState) => {
  const job = findById(getState(), 'installations', installationId);
  if (!job) return false;
  dispatch(installationSlice.actions.updateEntity({ id: installationId, changes: { status: 'In Progress', remarks: '' } }));
  log(dispatch, getState(), { module: 'installation', entityType: 'installations', entityId: installationId, action: 'Rework started', detail: `${job.doorNumber} corrections underway.` });
  toastOk(dispatch, 'Rework started', 'Complete the job again to request re-inspection.');
  return true;
};

export const submitFinalSiteApproval = (projectId, remarks = '') => (dispatch, getState) => {
  const state = getState();
  const project = findById(state, 'projects', projectId);
  if (!project) return false;
  const inspections = itemsOf(state, 'siteInspections').filter((i) => i.projectId === projectId);
  const pending = project.doors.filter((door) => !inspections.some((i) => i.doorNumber === door.number && i.status === 'Approved'));
  if (pending.length) {
    toastErr(dispatch, 'Approvals pending', `${pending.length} doors still need site approval.`);
    return false;
  }
  dispatch(projectsSlice.actions.updateEntity({
    id: projectId,
    changes: {
      status: project.status === 'Completed' ? 'Completed' : 'Inspection Pending',
      siteApproval: { approved: true, by: actor(state).user, at: new Date().toISOString(), remarks: remarks || 'All installed doors inspected and approved.' },
    },
  }));
  log(dispatch, getState, { module: 'inspections', entityType: 'projects', entityId: projectId, action: 'Final site approval submitted', detail: `All ${project.doors.length} doors approved at site.` });
  notify(dispatch, { title: 'Ready for project closure', message: `${project.name} has final site approval.`, tone: 'success', link: `/projects/${projectId}` });
  toastOk(dispatch, 'Final approval submitted', 'The project manager can now close the project.');
  return true;
};

/* ------------------------------------------------------------------ */
/* ACCOUNTS                                                           */
/* ------------------------------------------------------------------ */

export const recordPayment = (invoiceId, { amount, method = 'NEFT', reference = '', date = todayISO(), note = '' }) => (dispatch, getState) => {
  const invoice = findById(getState(), 'invoices', invoiceId);
  if (!invoice) return false;
  if (invoice.status === 'Draft') {
    toastErr(dispatch, 'Draft invoice', 'Finalise the invoice before recording payments.');
    return false;
  }
  const value = Number(amount) || 0;
  const { outstanding } = invoiceTotals(invoice);
  if (value <= 0) { toastErr(dispatch, 'Invalid amount', 'Enter a payment amount.'); return false; }
  if (value > outstanding + 1) {
    toastErr(dispatch, 'Amount exceeds balance', `Outstanding is ${inr(outstanding)}.`);
    return false;
  }
  const payments = [...(invoice.payments || []), { id: `PAY-${Date.now().toString().slice(-6)}`, date, amount: value, method, reference, note }];
  const updated = { ...invoice, payments, paymentMethod: method, transactionReference: reference };
  const status = invoiceStatus(updated);
  dispatch(invoicesSlice.actions.updateEntity({ id: invoiceId, changes: { payments, paymentMethod: method, transactionReference: reference, status } }));
  log(dispatch, getState, { module: 'accounts', entityType: 'invoices', entityId: invoiceId, action: 'Payment recorded', detail: `${inr(value)} via ${method} (${reference || 'no reference'}).` });
  notify(dispatch, { title: 'Payment received', message: `${inr(value)} received against ${invoiceId}.`, tone: 'success', link: `/accounts/${invoiceId}` });
  toastOk(dispatch, 'Payment recorded', `${inr(value)} received. Status: ${status}.`);
  return true;
};

/* ------------------------------------------------------------------ */
/* SERVICE                                                            */
/* ------------------------------------------------------------------ */

export const assignServiceTicket = (ticketId, technician) => (dispatch, getState) => {
  const ticket = findById(getState(), 'serviceTickets', ticketId);
  if (!ticket) return false;
  if (!technician) { toastErr(dispatch, 'Technician required', 'Choose a technician to assign.'); return false; }
  dispatch(serviceSlice.actions.updateEntity({
    id: ticketId,
    changes: { technician, status: 'Assigned', history: appendHistory(ticket, { by: actor(getState()).user, status: 'Assigned', remarks: `Assigned to ${technician}.` }) },
  }));
  log(dispatch, getState(), { module: 'service', entityType: 'serviceTickets', entityId: ticketId, action: 'Technician assigned', detail: `${technician} assigned to ${ticketId}.` });
  toastOk(dispatch, 'Technician assigned', `${technician} will attend the complaint.`);
  return true;
};

export const resolveServiceTicket = (ticketId, resolution) => (dispatch, getState) => {
  if (!resolution?.trim()) { toastErr(dispatch, 'Resolution required', 'Record what was done to resolve the complaint.'); return false; }
  const ticket = findById(getState(), 'serviceTickets', ticketId);
  if (!ticket) return false;
  dispatch(serviceSlice.actions.updateEntity({
    id: ticketId,
    changes: { status: 'Resolved', resolution, serviceDate: todayISO(), history: appendHistory(ticket, { by: actor(getState()).user, status: 'Resolved', remarks: resolution }) },
  }));
  log(dispatch, getState(), { module: 'service', entityType: 'serviceTickets', entityId: ticketId, action: 'Service ticket resolved', detail: resolution });
  toastOk(dispatch, 'Ticket resolved', 'The customer complaint is now closed for service.');
  return true;
};

export const closeServiceTicket = (ticketId) => (dispatch, getState) => {
  const ticket = findById(getState(), 'serviceTickets', ticketId);
  if (!ticket) return false;
  dispatch(serviceSlice.actions.updateEntity({
    id: ticketId,
    changes: { status: 'Closed', history: appendHistory(ticket, { by: actor(getState()).user, status: 'Closed', remarks: 'Customer confirmation received.' }) },
  }));
  log(dispatch, getState(), { module: 'service', entityType: 'serviceTickets', entityId: ticketId, action: 'Service ticket closed', detail: `${ticketId} closed after customer confirmation.` });
  toastOk(dispatch, 'Ticket closed', 'Service history has been updated.');
  return true;
};

/* ------------------------------------------------------------------ */
/* INVENTORY                                                          */
/* ------------------------------------------------------------------ */

export const recordStockMove = (materialId, { type, qty, projectId = null, note = '' }) => (dispatch, getState) => {
  const material = findById(getState(), 'materials', materialId);
  if (!material) return false;
  const amount = Number(qty) || 0;
  if (amount <= 0) { toastErr(dispatch, 'Invalid quantity', 'Enter a quantity greater than zero.'); return false; }
  const changes = {};
  if (type === 'Inward') changes.purchasedQty = (Number(material.purchasedQty) || 0) + amount;
  else if (type === 'Consumption' || type === 'Wastage') changes.consumedQty = (Number(material.consumedQty) || 0) + amount;
  else if (type === 'Reservation') changes.reservedQty = (Number(material.reservedQty) || 0) + amount;
  else if (type === 'Reservation Release') changes.reservedQty = Math.max(0, (Number(material.reservedQty) || 0) - amount);
  else { toastErr(dispatch, 'Unknown stock action', 'Choose a valid stock movement.'); return false; }
  dispatch(materialsSlice.actions.updateEntity({ id: materialId, changes }));
  dispatch(stockMovesSlice.actions.addEntity({
    id: `STM-${String(itemsOf(getState(), 'stockMoves').length + 1).padStart(2, '0')}`,
    materialId,
    type,
    qty: amount,
    date: todayISO(),
    projectId,
    user: actor(getState()).user,
    note,
  }));
  log(dispatch, getState(), { module: 'inventory', entityType: 'materials', entityId: materialId, action: `Stock ${type.toLowerCase()} recorded`, detail: `${amount} ${material.unit} of ${material.name}.` });
  toastOk(dispatch, 'Stock updated', `${type} of ${amount} ${material.unit} recorded.`);
  return true;
};

export const advancePurchaseRequest = (requestId, status) => (dispatch, getState) => {
  const request = findById(getState(), 'purchaseRequests', requestId);
  if (!request) return false;
  dispatch(purchaseRequestsSlice.actions.updateEntity({ id: requestId, changes: { status } }));
  if (status === 'Received') {
    const material = findById(getState(), 'materials', request.materialId);
    if (material) dispatch(materialsSlice.actions.updateEntity({ id: material.id, changes: { purchasedQty: (Number(material.purchasedQty) || 0) + Number(request.qty || 0) } }));
  }
  log(dispatch, getState(), { module: 'inventory', entityType: 'purchaseRequests', entityId: requestId, action: `Purchase request ${status.toLowerCase()}`, detail: `${requestId} moved to ${status}.` });
  toastOk(dispatch, 'Purchase request updated', `${requestId} is now ${status}.`);
  return true;
};

/* ------------------------------------------------------------------ */
/* LOGOUT CLEANUP                                                     */
/* ------------------------------------------------------------------ */

export const resetWorkflowDemo = () => (dispatch) => {
  dispatch(addToast({ type: 'info', title: 'Reloading demo', message: 'Refreshing seed data…' }));
};
