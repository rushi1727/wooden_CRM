import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  LEAD_STATUSES, PRIORITIES, QC_CHECKLIST, SITE_CHECKLIST, PAYMENT_TERMS,
  PAYMENT_METHODS, TECHNICIANS, PROJECT_STATUSES,
} from '../../data/masterData';
import { usePermissions } from '../../hooks/usePermissions';
import {
  addLeadNote, scheduleFollowUp, requestSiteMeasurement, updateLeadStatus,
  submitQuotation, approveQuotation, rejectQuotation, sendQuotation, recordQuotationResponse,
  convertQuotationToOrder, saveQuotation, confirmSalesOrder, recordOrderAdvance, createProjectFromOrder,
  updateProjectAssignments, addProjectDoor, createProductionPlan, setProjectStatus, closeProject,
  issueProductionMaterial, startProduction, holdProduction, completeProduction, restartProduction,
  approveQC, rejectQC, prepareDispatch, sendDispatch, transitDispatch, confirmDelivery, markDeliveryIssue,
  scheduleInstallationJob, assignInstallationTeam, startInstallationJob, completeInstallationJob,
  approveSiteInspection, rejectSiteInspection, submitFinalSiteApproval,
  recordPayment, assignServiceTicket, resolveServiceTicket, closeServiceTicket, recordStockMove,
  createRecord, updateRecord,
} from '../../features/workflow/workflowThunks';
import {
  quotationTotals, invoiceTotals, invoiceStatus, materialAvailable, materialStatus,
  projectProgress, pipelineCollections, doorPipeline, doorStage, productionPercent,
} from '../../utils/calc';
import { inr, formatDate, formatDateTime, nextId, daysUntil, todayISO } from '../../utils/format';
import Icon from '../common/Icon';
import { Badge, Button, IconButton, ProgressBar, SectionCard, StatusBadge, Tabs, Avatar } from '../common/ui';
import { Modal, ConfirmDialog } from '../common/Modal';
import { EntityForm } from '../common/forms';
import QuotationForm from '../forms/QuotationForm';
import Timeline from '../common/Timeline';

const downloadAttachment = (doc) => {
  const content = [
    'DoorCraft Industries Pvt. Ltd. — Demo attachment',
    '------------------------------------------------',
    `Document: ${doc.name}`,
    `Reference: ${doc.id}`,
    `Uploaded: ${doc.uploadedAt} by ${doc.by}`,
    `File size: ${doc.size}`,
    '',
    'This placeholder represents a project attachment in the demonstration portal.',
  ].join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = doc.name.replace(/\.[^.]+$/, '') + '-demo.txt';
  link.click();
  URL.revokeObjectURL(url);
};

const STAGE_TONES = { approved: 'green', snag: 'red', installed: 'teal', installing: 'violet', delivered: 'green', dispatched: 'violet', qc: 'green', rework: 'red', production: 'amber', planned: 'gray' };

const STOCK_TYPES = ['Inward', 'Consumption', 'Reservation', 'Reservation Release', 'Wastage'];

function Actions({ children }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

function KeyValue({ label, value, mono }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-ink-400">{label}</p>
      <p className={`text-[12px] text-ink-800 mt-0.5 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  );
}

function KpiStrip({ items }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-md border border-ink-200 bg-ink-50/50 px-3 py-2">
          <p className="text-[9.5px] uppercase tracking-wide text-ink-400">{item.label}</p>
          <p className="text-[13px] font-semibold text-ink-900 mt-0.5 truncate">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function PhotoStrip({ images = [], label }) {
  if (!images?.length) return <p className="text-[11px] text-ink-400">No {label || 'photos'} uploaded in this demo.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {images.map((img) => (
        <div key={img.name} className="w-[120px] rounded-md border border-ink-200 overflow-hidden bg-ink-50">
          <div className="h-[74px] bg-gradient-to-br from-ink-200 to-ink-100 grid place-items-center text-ink-400"><Icon name="Camera" className="w-5 h-5" /></div>
          <p className="px-1.5 py-1 text-[9px] text-ink-500 truncate">{img.name}</p>
        </div>
      ))}
    </div>
  );
}

const QR_FIELDS = (record) => [
  { name: 'discountPct', label: 'Discount (%)', type: 'number' },
  { name: 'gstPct', label: 'GST (%)', type: 'number' },
  { name: 'paymentTerms', label: 'Payment Terms', type: 'select', options: PAYMENT_TERMS },
];

const relationLabel = (state, collection, id) => {
  const item = (state[collection]?.items || []).find((x) => x.id === id);
  if (!item) return id;
  return item.name || item.projectName || item.doorNumber || item.id;
};

const getModal = (type, ctx) => {
  const { record, state, dispatch, navigate, close } = ctx;
  const find = (collection, id) => (state[collection]?.items || []).find((x) => x.id === id);
  const run = (fn) => (values) => { fn(values); close(); };

  switch (type) {
    case 'leadFollowUp':
      return {
        title: 'Schedule follow-up', icon: 'CalendarClock',
        fields: [
          { name: 'date', label: 'Next follow-up date', type: 'date', required: true, section: 'Follow-up' },
          { name: 'note', label: 'Note', type: 'textarea', full: true, section: 'Follow-up' },
        ],
        initial: { date: record.followUpDate || todayISO(), note: '' },
        submitLabel: 'Schedule',
        onSubmit: run((v) => dispatch(scheduleFollowUp(record.id, v.date, v.note))),
      };
    case 'leadNote':
      return {
        title: 'Add lead note', icon: 'FileText',
        fields: [{ name: 'text', label: 'Note', type: 'textarea', full: true, required: true, section: 'Activity' }],
        initial: { text: '' },
        submitLabel: 'Add note',
        onSubmit: run((v) => dispatch(addLeadNote(record.id, v.text))),
      };
    case 'leadStatus':
      return {
        title: 'Update lead stage', icon: 'Target',
        fields: [
          { name: 'status', label: 'Lead status', type: 'select', options: LEAD_STATUSES, required: true, section: 'Pipeline' },
          { name: 'remarks', label: 'Remarks', type: 'textarea', full: true, section: 'Pipeline' },
        ],
        initial: { status: record.status, remarks: '' },
        submitLabel: 'Update stage',
        onSubmit: run((v) => dispatch(updateLeadStatus(record.id, v.status, v.remarks))),
      };
    case 'quotationReject':
      return {
        title: 'Reject quotation', icon: 'Ban',
        fields: [{ name: 'remarks', label: 'Reason for rejection', type: 'textarea', full: true, required: true, section: 'Approval' }],
        initial: { remarks: '' },
        submitLabel: 'Reject quotation',
        onSubmit: run((v) => dispatch(rejectQuotation(record.id, v.remarks))),
      };
    case 'quotationConvert':
      return {
        title: 'Convert to sales order', icon: 'ClipboardList',
        fields: [
          { name: 'advance', label: 'Advance received (₹)', type: 'number', min: 0, section: 'Order' },
          { name: 'deliveryDate', label: 'Expected delivery', type: 'date', section: 'Order' },
          { name: 'projectManager', label: 'Project manager', type: 'select', lookup: { collection: 'employees', label: 'name', filterByRole: 'project_manager' }, section: 'Order' },
          { name: 'paymentTerms', label: 'Payment terms', type: 'select', options: PAYMENT_TERMS, section: 'Order' },
        ],
        initial: { advance: 0, deliveryDate: '', projectManager: '', paymentTerms: record.paymentTerms || '40% Advance' },
        submitLabel: 'Create sales order',
        onSubmit: (v) => {
          const orderId = dispatch(convertQuotationToOrder(record.id, v));
          close();
          if (orderId) navigate(`/sales-orders/${orderId}`);
        },
      };
    case 'quotationResponse': {
      const accepted = record.__response === 'Accepted';
      return {
        title: accepted ? 'Record customer acceptance' : 'Record customer decline', icon: accepted ? 'CheckCircle2' : 'Ban',
        fields: [{ name: 'remarks', label: 'Customer remarks', type: 'textarea', full: true, section: 'Customer response' }],
        initial: { remarks: '' },
        submitLabel: accepted ? 'Mark accepted' : 'Mark declined',
        onSubmit: run((v) => dispatch(recordQuotationResponse(record.id, record.__response, v.remarks))),
      };
    }
    case 'orderAdvance':
      return {
        title: 'Record advance payment', icon: 'Wallet',
        fields: [
          { name: 'amount', label: 'Amount (₹)', type: 'number', min: 1, required: true, section: 'Payment' },
          { name: 'method', label: 'Method', type: 'select', options: PAYMENT_METHODS, section: 'Payment' },
          { name: 'reference', label: 'Transaction reference', section: 'Payment' },
        ],
        initial: { amount: '', method: 'NEFT', reference: '' },
        submitLabel: 'Record advance',
        onSubmit: run((v) => dispatch(recordOrderAdvance(record.id, v.amount, v.method, v.reference))),
      };
    case 'orderCreateProject':
      return {
        title: 'Create project from order', icon: 'FolderKanban',
        fields: [
          { name: 'manager', label: 'Project manager', type: 'select', lookup: { collection: 'employees', label: 'name', filterByRole: 'project_manager' }, section: 'Team' },
          { name: 'mistri', label: 'Mistri / team leader', type: 'select', lookup: { collection: 'employees', label: 'name', filterByRole: 'mistri' }, section: 'Team' },
          { name: 'productionSupervisor', label: 'Production supervisor', type: 'select', lookup: { collection: 'employees', label: 'name', filterByRole: 'production_supervisor' }, section: 'Team' },
          { name: 'installationSupervisor', label: 'Installation supervisor', type: 'select', lookup: { collection: 'employees', label: 'name', filterByRole: 'installation_supervisor' }, section: 'Team' },
          { name: 'siteSupervisor', label: 'Site supervisor', type: 'select', lookup: { collection: 'employees', label: 'name', filterByRole: 'site_supervisor' }, section: 'Team' },
          { name: 'startDate', label: 'Start date', type: 'date', section: 'Schedule' },
          { name: 'endDate', label: 'Target completion', type: 'date', section: 'Schedule' },
          { name: 'priority', label: 'Priority', type: 'select', options: PRIORITIES, section: 'Schedule' },
          { name: 'location', label: 'Project location', full: true, section: 'Schedule' },
        ],
        initial: { manager: record.projectManager || '', mistri: '', productionSupervisor: '', installationSupervisor: '', siteSupervisor: '', startDate: todayISO(), endDate: record.deliveryDate || '', priority: 'Medium', location: '' },
        submitLabel: 'Create project',
        onSubmit: (v) => {
          const projectId = dispatch(createProjectFromOrder(record.id, v));
          close();
          if (projectId) navigate(`/projects/${projectId}`);
        },
      };
    case 'projectTeams':
      return {
        title: 'Assign project team', icon: 'Users',
        fields: [
          { name: 'manager', label: 'Project manager', type: 'select', lookup: { collection: 'employees', label: 'name', filterByRole: 'project_manager' }, section: 'Assignments' },
          { name: 'mistri', label: 'Mistri / team leader', type: 'select', lookup: { collection: 'employees', label: 'name', filterByRole: 'mistri' }, section: 'Assignments' },
          { name: 'productionSupervisor', label: 'Production supervisor', type: 'select', lookup: { collection: 'employees', label: 'name', filterByRole: 'production_supervisor' }, section: 'Assignments' },
          { name: 'installationSupervisor', label: 'Installation supervisor', type: 'select', lookup: { collection: 'employees', label: 'name', filterByRole: 'installation_supervisor' }, section: 'Assignments' },
          { name: 'siteSupervisor', label: 'Site supervisor', type: 'select', lookup: { collection: 'employees', label: 'name', filterByRole: 'site_supervisor' }, section: 'Assignments' },
          { name: 'startDate', label: 'Start date', type: 'date', section: 'Schedule' },
          { name: 'endDate', label: 'Target completion', type: 'date', section: 'Schedule' },
          { name: 'priority', label: 'Priority', type: 'select', options: PRIORITIES, section: 'Schedule' },
        ],
        initial: { manager: record.manager || '', mistri: record.mistri || '', productionSupervisor: record.productionSupervisor || '', installationSupervisor: record.installationSupervisor || '', siteSupervisor: record.siteSupervisor || '', startDate: record.startDate || '', endDate: record.endDate || '', priority: record.priority || 'Medium' },
        submitLabel: 'Save assignments',
        onSubmit: run((v) => dispatch(updateProjectAssignments(record.id, v))),
      };
    case 'projectAddDoor':
      return {
        title: 'Add door to project', icon: 'DoorOpen',
        fields: [
          { name: 'productId', label: 'Door product', type: 'select', lookup: { collection: 'products', label: 'name' }, required: true, full: true, section: 'Door' },
          { name: 'number', label: 'Door number', section: 'Door' },
          { name: 'room', label: 'Room / location', section: 'Door' },
          { name: 'height', label: 'Height (mm)', type: 'number', section: 'Dimensions' },
          { name: 'width', label: 'Width (mm)', type: 'number', section: 'Dimensions' },
          { name: 'thickness', label: 'Thickness (mm)', type: 'number', section: 'Dimensions' },
        ],
        initial: { productId: '', number: '', room: 'General', height: '', width: '', thickness: '' },
        submitLabel: 'Add door',
        onSubmit: run((v) => dispatch(addProjectDoor(record.id, v))),
      };
    case 'productionHold':
      return {
        title: 'Put production on hold', icon: 'Pause',
        fields: [{ name: 'note', label: 'Reason', type: 'textarea', full: true, required: true, section: 'Hold' }],
        initial: { note: '' },
        submitLabel: 'Put on hold',
        onSubmit: run((v) => dispatch(holdProduction(record.id, v.note))),
      };
    case 'qcApprove':
      return {
        title: 'Approve quality inspection', icon: 'ShieldCheck',
        fields: [
          ...QC_CHECKLIST.map((c) => ({ name: `checks.${c.key}`, label: c.label, type: 'checkbox', section: 'Quality checklist' })),
          { name: 'remarks', label: 'Inspection remarks', type: 'textarea', full: true, section: 'Result' },
        ],
        initial: { checks: record.checks || {}, remarks: record.remarks || '' },
        submitLabel: 'Approve door',
        onSubmit: (v) => { dispatch(approveQC(record.id, v.checks, v.remarks)); close(); },
      };
    case 'qcReject':
      return {
        title: 'Reject door for rework', icon: 'RotateCcw',
        fields: [{ name: 'remarks', label: 'Defect description (required)', type: 'textarea', full: true, required: true, section: 'Rework' }],
        initial: { remarks: '' },
        submitLabel: 'Send for rework',
        onSubmit: run((v) => dispatch(rejectQC(record.id, v.remarks))),
      };
    case 'installationSchedule':
      return {
        title: 'Schedule installation', icon: 'Calendar',
        fields: [{ name: 'date', label: 'Planned installation date', type: 'date', required: true, section: 'Schedule' }],
        initial: { date: record.plannedDate || todayISO() },
        submitLabel: 'Save schedule',
        onSubmit: run((v) => dispatch(scheduleInstallationJob(record.id, v.date))),
      };
    case 'installationTeam':
      return {
        title: 'Assign installation team', icon: 'Users',
        fields: [{ name: 'team', label: 'Team members', type: 'list', required: true, full: true, help: 'Comma-separated names', section: 'Team' }],
        initial: { team: record.team || [] },
        submitLabel: 'Assign team',
        onSubmit: run((v) => dispatch(assignInstallationTeam(record.id, v.team))),
      };
    case 'dispatchDeliver':
      return {
        title: 'Confirm site delivery', icon: 'PackageCheck',
        fields: [
          { name: 'receivedBy', label: 'Received by', required: true, section: 'Delivery' },
          { name: 'proof', label: 'Proof of delivery reference', section: 'Delivery' },
        ],
        initial: { receivedBy: 'Site Engineer', proof: '' },
        submitLabel: 'Confirm delivery',
        onSubmit: run((v) => dispatch(confirmDelivery(record.id, v))),
      };
    case 'dispatchIssue':
      return {
        title: 'Report delivery issue', icon: 'AlertTriangle',
        fields: [{ name: 'note', label: 'Issue details', type: 'textarea', full: true, required: true, section: 'Issue' }],
        initial: { note: '' },
        submitLabel: 'Log issue',
        onSubmit: run((v) => dispatch(markDeliveryIssue(record.id, v.note))),
      };
    case 'inspectionApprove':
      return {
        title: 'Approve site inspection', icon: 'ClipboardCheck',
        fields: [
          ...SITE_CHECKLIST.map((c) => ({ name: `checks.${c.key}`, label: c.label, type: 'checkbox', section: 'Site checklist' })),
          { name: 'remarks', label: 'Supervisor remarks', type: 'textarea', full: true, section: 'Result' },
        ],
        initial: { checks: record.checks || {}, remarks: record.remarks || '' },
        submitLabel: 'Approve installation',
        onSubmit: (v) => { dispatch(approveSiteInspection(record.id, v.checks, v.remarks)); close(); },
      };
    case 'inspectionReject':
      return {
        title: 'Reject / raise snag', icon: 'AlertTriangle',
        fields: [{ name: 'remarks', label: 'Defect description (required)', type: 'textarea', full: true, required: true, section: 'Snag' }],
        initial: { remarks: '' },
        submitLabel: 'Reject work',
        onSubmit: run((v) => dispatch(rejectSiteInspection(record.id, v.remarks))),
      };
    case 'recordPayment':
      return {
        title: 'Record customer payment', icon: 'Wallet',
        fields: [
          { name: 'amount', label: 'Amount received (₹)', type: 'number', min: 1, required: true, section: 'Payment' },
          { name: 'date', label: 'Payment date', type: 'date', required: true, section: 'Payment' },
          { name: 'method', label: 'Payment method', type: 'select', options: PAYMENT_METHODS, section: 'Payment' },
          { name: 'reference', label: 'Transaction reference', section: 'Payment' },
          { name: 'note', label: 'Note', type: 'textarea', full: true, section: 'Payment' },
        ],
        initial: { amount: invoiceTotals(record).outstanding, date: todayISO(), method: record.paymentMethod || 'NEFT', reference: '', note: '' },
        submitLabel: 'Record payment',
        onSubmit: run((v) => dispatch(recordPayment(record.id, v))),
      };
    case 'serviceAssign':
      return {
        title: 'Assign technician', icon: 'HardHat',
        fields: [{ name: 'technician', label: 'Technician', type: 'select', options: TECHNICIANS, required: true, section: 'Assignment' }],
        initial: { technician: record.technician || TECHNICIANS[0] },
        submitLabel: 'Assign',
        onSubmit: run((v) => dispatch(assignServiceTicket(record.id, v.technician))),
      };
    case 'serviceResolve':
      return {
        title: 'Resolve service ticket', icon: 'CheckCircle2',
        fields: [{ name: 'resolution', label: 'Resolution details', type: 'textarea', full: true, required: true, section: 'Resolution' }],
        initial: { resolution: '' },
        submitLabel: 'Mark resolved',
        onSubmit: run((v) => dispatch(resolveServiceTicket(record.id, v.resolution))),
      };
    case 'stockMove':
      return {
        title: `Stock movement · ${record.name}`, icon: 'ArrowLeftRight',
        fields: [
          { name: 'type', label: 'Movement type', type: 'select', options: STOCK_TYPES, required: true, section: 'Movement' },
          { name: 'qty', label: 'Quantity', type: 'number', min: 1, required: true, section: 'Movement' },
          { name: 'projectId', label: 'Project (optional)', type: 'select', lookup: { collection: 'projects', label: 'name' }, section: 'Movement' },
          { name: 'note', label: 'Note / reference', type: 'textarea', full: true, section: 'Movement' },
        ],
        initial: { type: 'Inward', qty: '', projectId: '', note: '' },
        submitLabel: 'Record movement',
        onSubmit: run((v) => dispatch(recordStockMove(record.id, v))),
      };
    default:
      return null;
  }
};

export default function ModulePanels({ configKey, record }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = useSelector((s) => s);
  const { user, edit, create, approve } = usePermissions();
  const [modalType, setModalType] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [projectTab, setProjectTab] = useState('doors');

  const openModal = (type, extra = {}) => setModalType({ type, ...extra });
  const closeModal = () => setModalType(null);
  const ctx = { record, state, dispatch, navigate, close: closeModal, user };
  const modal = modalType ? getModal(modalType.type, { ...ctx, record: { ...record, ...(modalType.record || {}) } }) : null;

  const runConfirm = () => {
    if (!confirm) return;
    confirm.onConfirm();
    setConfirm(null);
  };

  const data = useMemo(() => pipelineCollections(state), [state]);

  const noteList = record.notes || [];

  /* ------------------------------- LEADS ------------------------------- */
  if (configKey === 'leads') {
    const closed = ['Won', 'Lost'].includes(record.status);
    const stageIndex = LEAD_STATUSES.indexOf(record.status);
    const convertToCustomer = () => {
      const customerId = nextId('CUS-', state.customers.items, 1000);
      dispatch(createRecord({
        collection: 'customers',
        module: 'customers',
        label: 'Customer',
        record: {
          id: customerId,
          name: record.customerName,
          type: 'Company',
          companyName: record.customerName,
          contactPerson: record.contactPerson || record.customerName,
          mobile: record.mobile,
          altMobile: '',
          email: record.email,
          gst: '',
          billingAddress: record.projectLocation || '',
          siteAddress: record.projectLocation || '',
          city: '',
          state: 'Maharashtra',
          pincode: '',
          source: record.source,
          assignedSales: record.salesExecutive,
          status: 'Active',
          notes: `Converted from lead ${record.id}.`,
        },
      }));
      dispatch(updateRecord({ collection: 'leads', id: record.id, changes: { customerId }, module: 'leads', label: 'Lead', silent: true }));
    };

    return (
      <>
        <SectionCard title="Lead progression" subtitle="Follow-up and conversion workflow" icon="Target" className="mb-4"
          action={(
            <Actions>
              {!closed ? <Button size="sm" variant="secondary" icon="CalendarClock" onClick={() => openModal('leadFollowUp')}>Follow-up</Button> : null}
              <Button size="sm" variant="secondary" icon="FileText" onClick={() => openModal('leadNote')}>Add note</Button>
              {!closed && edit('leads') ? <Button size="sm" variant="secondary" icon="Ruler" onClick={() => dispatch(requestSiteMeasurement(record.id))}>Request measurement</Button> : null}
              {!closed && edit('leads') ? <Button size="sm" variant="secondary" icon="Target" onClick={() => openModal('leadStatus')}>Update stage</Button> : null}
              {!record.customerId && create('customers') ? <Button size="sm" variant="primary" icon="User" onClick={() => setConfirm({ title: 'Convert lead to customer?', message: 'A customer account will be created from this lead and linked for quotations and projects.', confirmLabel: 'Convert to customer', onConfirm: convertToCustomer })}>Convert customer</Button> : null}
            </Actions>
          )}>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {LEAD_STATUSES.map((status, i) => (
                <span key={status} className={`text-[10px] px-2 py-1 rounded border ${status === record.status ? 'bg-brand-700 text-white border-brand-700' : i < stageIndex ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-ink-400 border-ink-200'}`}>
                  {status}
                </span>
              ))}
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-[11.5px]">
              <div><span className="text-ink-400 text-[10px] uppercase">Next follow-up</span><p className="text-ink-800 mt-0.5">{formatDate(record.followUpDate)}</p></div>
              <div><span className="text-ink-400 text-[10px] uppercase">Priority</span><p className="mt-0.5"><StatusBadge status={record.priority} /></p></div>
              <div><span className="text-ink-400 text-[10px] uppercase">Expected value</span><p className="text-ink-800 mt-0.5">{inr(record.expectedBudget)}</p></div>
            </div>
            {record.attachments?.length ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {record.attachments.map((a) => (
                  <span key={a.id} className="inline-flex items-center gap-1.5 text-[10.5px] border border-ink-200 rounded px-2 py-1 bg-ink-50 text-ink-600">
                    <Icon name="Paperclip" className="w-3 h-3" /> {a.name} <span className="text-ink-400">{a.size}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="Lead notes" subtitle="Customer conversation history" icon="History" className="mb-4" bodyClassName="p-4">
          {noteList.length ? (
            <ol className="space-y-3">
              {[...noteList].reverse().map((n, i) => (
                <li key={`${n.at}-${i}`} className="flex gap-2.5">
                  <Avatar name={n.by} size="sm" />
                  <div className="min-w-0">
                    <p className="text-[12px] text-ink-800 leading-4">{n.text}</p>
                    <p className="text-[10px] text-ink-400 mt-0.5">{n.by} · {formatDateTime(n.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : <p className="text-[12px] text-ink-400">No notes yet. Add the first follow-up note.</p>}
        </SectionCard>

        <Modal open={!!modal} onClose={closeModal} title={modal?.title} icon={modal?.icon} size="md">
          {modal ? <EntityForm fields={modal.fields} initialValues={modal.initial} onSubmit={modal.onSubmit} onCancel={closeModal} submitLabel={modal.submitLabel} /> : null}
        </Modal>
        <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={runConfirm} title={confirm?.title} message={confirm?.message} confirmLabel={confirm?.confirmLabel} tone="primary" icon="CheckCircle2" />
      </>
    );
  }

  /* ----------------------------- QUOTATIONS ---------------------------- */
  if (configKey === 'quotations') {
    const totals = quotationTotals(record);
    const order = state.salesOrders.items.find((o) => o.quotationId === record.id);
    const canEditQuote = edit('quotations');
    return (
      <>
        <SectionCard title="Door line items" subtitle={`${totals.totalQty} doors · ${record.items?.length || 0} line items`} icon="DoorOpen" className="mb-4" bodyClassName="p-0"
          action={<Button size="sm" variant="secondary" icon="Printer" onClick={() => window.print()}>Print</Button>}>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead><tr><th>#</th><th>Door</th><th>Specification</th><th>Size</th><th className="text-right">Qty</th><th className="text-right">Rate</th><th className="text-right">Mfg</th><th className="text-right">Install</th><th className="text-right">Transport</th><th className="text-right">Amount</th></tr></thead>
              <tbody>
                {totals.itemRows.map((item, i) => (
                  <tr key={item.id}>
                    <td className="text-ink-400">{i + 1}</td>
                    <td><span className="font-medium text-ink-900">{state.products.items.find((p) => p.id === item.productId)?.name || item.productId}</span><span className="block text-[10.5px] text-ink-400">{item.doorType} · {item.design}</span></td>
                    <td className="text-[11.5px]">{item.material}<span className="block text-ink-400">{item.finish} · {item.frameType}</span></td>
                    <td className="text-[11.5px]">{item.height}×{item.width} mm</td>
                    <td className="text-right tabular-nums">{item.qty}</td>
                    <td className="text-right tabular-nums">{inr(item.unitPrice)}</td>
                    <td className="text-right tabular-nums">{inr(item.manufacturing)}</td>
                    <td className="text-right tabular-nums">{inr(item.installation)}</td>
                    <td className="text-right tabular-nums">{inr(item.transport)}</td>
                    <td className="text-right tabular-nums font-medium">{inr(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end p-4 border-t border-ink-100">
            <div className="w-full max-w-[320px] text-[12px] space-y-1.5">
              <div className="flex justify-between text-ink-600"><span>Subtotal</span><span className="tabular-nums">{inr(totals.subtotal)}</span></div>
              <div className="flex justify-between text-ink-600"><span>Discount ({record.discountPct || 0}%)</span><span className="tabular-nums text-rose-600">− {inr(totals.discount)}</span></div>
              <div className="flex justify-between text-ink-600"><span>GST ({totals.gstPct}%)</span><span className="tabular-nums">{inr(totals.gst)}</span></div>
              <div className="flex justify-between pt-1.5 border-t border-ink-200 font-semibold text-[13.5px] text-ink-900"><span>Grand total</span><span className="tabular-nums">{inr(totals.grandTotal)}</span></div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Approval workflow" subtitle="Version history and customer response" icon="FileCheck2" className="mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <StatusBadge status={record.status} />
            <Badge tone="gray">Version v{record.version || 1}</Badge>
            {record.approvedBy ? <Badge tone="green">Approved by {record.approvedBy}</Badge> : null}
            {order ? <Badge tone="teal">Order {order.id}</Badge> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {canEditQuote && ['Draft', 'Rejected'].includes(record.status) ? <Button size="sm" variant="primary" icon="Send" onClick={() => dispatch(submitQuotation(record.id))}>Submit for approval</Button> : null}
            {approve('quotation') && record.status === 'Pending Approval' ? (
              <>
                <Button size="sm" variant="success" icon="Check" onClick={() => setConfirm({ title: 'Approve quotation?', message: `Approve ${record.id} for ${inr(totals.grandTotal)}? Sales can then send it to the customer.`, confirmLabel: 'Approve', tone: 'primary', onConfirm: () => dispatch(approveQuotation(record.id)) })}>Approve</Button>
                <Button size="sm" variant="outlineDanger" icon="X" onClick={() => openModal('quotationReject')}>Reject</Button>
              </>
            ) : null}
            {canEditQuote && record.status === 'Approved' ? <Button size="sm" variant="primary" icon="Send" onClick={() => dispatch(sendQuotation(record.id))}>Send to customer</Button> : null}
            {canEditQuote && record.status === 'Sent' ? (
              <>
                <Button size="sm" variant="success" icon="CheckCircle2" onClick={() => openModal('quotationResponse', { record: { __response: 'Accepted' } })}>Customer accepted</Button>
                <Button size="sm" variant="outlineDanger" icon="Ban" onClick={() => openModal('quotationResponse', { record: { __response: 'Declined' } })}>Customer declined</Button>
              </>
            ) : null}
            {carCreateGuard(create) && record.status === 'Accepted' && !order ? <Button size="sm" variant="primary" icon="ClipboardList" onClick={() => openModal('quotationConvert')}>Convert to order</Button> : null}
            {canEditQuote && record.status !== 'Converted' ? <Button size="sm" variant="secondary" icon="Pencil" onClick={() => setRevisionOpen(true)}>Revise quotation</Button> : null}
            {order ? <Button as="span" size="sm" variant="secondary" icon="ArrowRight" onClick={() => navigate(`/sales-orders/${order.id}`)}>Open sales order</Button> : null}
          </div>
          {record.approvalRemarks ? <p className="text-[11.5px] text-ink-500 mt-3 bg-ink-50 border border-ink-200 rounded p-2.5">Approval remarks: {record.approvalRemarks}</p> : null}
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-wider text-ink-400 mb-2">Version history</p>
            <ol className="space-y-2">
              {(record.revisions || []).map((rev) => (
                <li key={`${rev.version}-${rev.date}`} className="flex items-start gap-2.5 text-[11.5px]">
                  <span className="w-6 h-6 rounded-full bg-brand-50 border border-brand-200 text-brand-800 grid place-items-center text-[9px] font-semibold shrink-0">v{rev.version}</span>
                  <div><p className="text-ink-700">{rev.note}</p><p className="text-[10px] text-ink-400">{rev.by} · {formatDate(rev.date)}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </SectionCard>

        <Modal open={!!modal} onClose={closeModal} title={modal?.title} icon={modal?.icon} size="md">
          {modal ? <EntityForm fields={modal.fields} initialValues={modal.initial} onSubmit={modal.onSubmit} onCancel={closeModal} submitLabel={modal.submitLabel} /> : null}
        </Modal>

        <Modal open={revisionOpen} onClose={() => setRevisionOpen(false)} title={`Revise quotation · ${record.id}`} subtitle="A new version will be recorded; totals recalculate automatically." size="3xl" icon="Pencil">
          <QuotationForm initial={record} onSubmit={(values) => { dispatch(saveQuotation(values, record.id)); setRevisionOpen(false); }} onCancel={() => setRevisionOpen(false)} submitLabel={`Save version v${(record.version || 1) + 1}`} />
        </Modal>

        <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={runConfirm} title={confirm?.title} message={confirm?.message} confirmLabel={confirm?.confirmLabel} tone={confirm?.tone || 'danger'} />
      </>
    );
  }

  /* ----------------------------- SALES ORDERS --------------------------- */
  if (configKey === 'salesOrders') {
    const project = state.projects.items.find((p) => p.salesOrderId === record.id);
    const quote = state.quotations.items.find((q) => q.id === record.quotationId);
    const balance = (Number(record.value) || 0) - (Number(record.advance) || 0);
    const ready = ['Confirmed', 'Ready for Project Planning'].includes(record.status);
    return (
      <>
        <SectionCard title="Order workflow" subtitle="Confirmation, advance and project creation" icon="ClipboardList" className="mb-4">
          <KpiStrip items={[
            { label: 'Order value', value: inr(record.value, { compact: true }) },
            { label: 'Advance received', value: inr(record.advance, { compact: true }) },
            { label: 'Balance', value: inr(balance, { compact: true }) },
            { label: 'Delivery', value: formatDate(record.deliveryDate) },
          ]} />
          <div className="flex flex-wrap gap-2">
            {edit('salesOrders') && ['Draft', 'Advance Pending'].includes(record.status) ? <Button size="sm" variant="primary" icon="Check" onClick={() => dispatch(confirmSalesOrder(record.id))}>Confirm order</Button> : null}
            {edit('salesOrders') && !['Completed', 'Cancelled'].includes(record.status) ? <Button size="sm" variant="secondary" icon="Wallet" onClick={() => openModal('orderAdvance')}>Record advance</Button> : null}
            {ready && !project && edit('projects') ? <Button size="sm" variant="primary" icon="FolderKanban" onClick={() => openModal('orderCreateProject')}>Create project</Button> : null}
            {project ? <Button size="sm" variant="secondary" icon="ArrowRight" onClick={() => navigate(`/projects/${project.id}`)}>Open project</Button> : null}
            {quote ? <Button size="sm" variant="secondary" icon="FileText" onClick={() => navigate(`/quotations/${quote.id}`)}>View quotation</Button> : null}
          </div>
          {!ready && !project ? <p className="text-[11px] text-ink-500 mt-3 bg-amber-50 border border-amber-200 rounded p-2.5 flex gap-1.5"><Icon name="Info" className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />Confirm the order and record the advance before creating the project. Production cannot start until the project is created.</p> : null}
          {record.approvalDoc ? <p className="text-[11px] text-ink-500 mt-3 flex items-center gap-1.5"><Icon name="Paperclip" className="w-3 h-3" /> {record.approvalDoc}</p> : null}
        </SectionCard>

        <Modal open={!!modal} onClose={closeModal} title={modal?.title} icon={modal?.icon} size="lg">
          {modal ? <EntityForm fields={modal.fields} initialValues={modal.initial} onSubmit={modal.onSubmit} onCancel={closeModal} submitLabel={modal.submitLabel} /> : null}
        </Modal>
        <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={runConfirm} title={confirm?.title} message={confirm?.message} confirmLabel={confirm?.confirmLabel} tone="danger" />
      </>
    );
  }

  /* ------------------------------- PROJECTS ----------------------------- */
  if (configKey === 'projects') {
    const progress = projectProgress(record, data);
    const production = state.production.items.filter((p) => p.projectId === record.id);
    const inspections = state.siteInspections.items.filter((i) => i.projectId === record.id);
    const approvedDoors = inspections.filter((i) => i.status === 'Approved').length;
    const balance = (Number(record.budget) || 0) - (Number(record.advanceReceived) || 0);
    const canPlan = edit('production') && !['Completed', 'On Hold'].includes(record.status);
    const doorRows = record.doors.map((door) => {
      const scopedDoor = { ...door, projectId: record.id };
      return { door: scopedDoor, pipe: doorPipeline(scopedDoor, data), stage: doorStage(scopedDoor, data) };
    });

    return (
      <>
        <SectionCard title="Delivery control" subtitle="Progress, team allocation and closure gates" icon="FolderKanban" className="mb-4"
          action={(
            <Actions>
              {edit('projects') ? <Button size="sm" variant="secondary" icon="Users" onClick={() => openModal('projectTeams')}>Assign team</Button> : null}
              {edit('projects') ? <Button size="sm" variant="secondary" icon="Plus" onClick={() => openModal('projectAddDoor')}>Add door</Button> : null}
              {canPlan ? <Button size="sm" variant="primary" icon="Factory" onClick={() => setConfirm({ title: 'Create production plan?', message: 'A production order will be created for every door that does not have one. Teams and the confirmed sales order will be validated first.', confirmLabel: 'Plan production', tone: 'primary', onConfirm: () => dispatch(createProductionPlan(record.id)) })}>Plan production</Button> : null}
              {edit('projects') && record.status === 'On Hold' ? <Button size="sm" variant="secondary" icon="Play" onClick={() => dispatch(setProjectStatus(record.id, 'In Production'))}>Resume project</Button> : null}
              {edit('projects') && !['On Hold', 'Completed'].includes(record.status) ? <Button size="sm" variant="secondary" icon="Pause" onClick={() => setConfirm({ title: 'Put project on hold?', message: 'Manufacturing and delivery work will pause until the project is resumed.', confirmLabel: 'Put on hold', tone: 'primary', onConfirm: () => dispatch(setProjectStatus(record.id, 'On Hold')) })}>Hold</Button> : null}
              {approve('inspection') ? <Button size="sm" variant="secondary" icon="ClipboardCheck" onClick={() => setConfirm({ title: 'Submit final site approval?', message: 'All doors must be individually approved at site. This releases the project for manager closure.', confirmLabel: 'Submit approval', tone: 'primary', onConfirm: () => dispatch(submitFinalSiteApproval(record.id)) })}>Final approval</Button> : null}
              {approve('project') ? <Button size="sm" variant="success" icon="CheckCircle2" onClick={() => setConfirm({ title: 'Close this project?', message: 'Closure requires approval of every door and final site approval. The sales order will also be completed.', confirmLabel: 'Close project', tone: 'primary', onConfirm: () => dispatch(closeProject(record.id)) })}>Close project</Button> : null}
            </Actions>
          )}>
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] mb-1"><span className="text-ink-500">Overall delivery progress</span><span className="font-medium text-ink-800">{progress}%</span></div>
            <ProgressBar value={progress} tone={progress >= 100 ? 'green' : progress >= 60 ? 'brand' : 'amber'} />
          </div>
          <KpiStrip items={[
            { label: 'Doors', value: `${record.doors.length} total · ${approvedDoors} site approved` },
            { label: 'Budget', value: inr(record.budget, { compact: true }) },
            { label: 'Advance received', value: inr(record.advanceReceived, { compact: true }) },
            { label: 'Balance to bill', value: inr(balance, { compact: true }) },
          ]} />
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-md border border-ink-200 p-3">
              <p className="text-[10px] uppercase tracking-wide text-ink-400 mb-1.5">Site approval</p>
              {record.siteApproval?.approved ? (
                <div className="text-[11.5px] text-emerald-700 flex items-start gap-1.5"><Icon name="BadgeCheck" className="w-4 h-4 shrink-0" /><span>Final approval by {record.siteApproval.by}<span className="block text-[10px] text-ink-400">{formatDateTime(record.siteApproval.at)}</span></span></div>
              ) : <p className="text-[11.5px] text-amber-700">Pending site supervisor final approval.</p>}
            </div>
            <div className="rounded-md border border-ink-200 p-3">
              <p className="text-[10px] uppercase tracking-wide text-ink-400 mb-1.5">Key dates</p>
              <p className="text-[11.5px] text-ink-700">Start {formatDate(record.startDate)} · Target {formatDate(record.endDate)}</p>
              <p className="text-[10px] text-ink-400 mt-0.5">{daysUntil(record.endDate) < 0 && record.status !== 'Completed' ? `${Math.abs(daysUntil(record.endDate))} days overdue` : `${daysUntil(record.endDate)} days remaining`}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Project workspace" icon="DoorOpen" className="mb-4" bodyClassName="p-0">
          <div className="px-4">
            <Tabs
              tabs={[
                { key: 'doors', label: 'Door tracking', count: record.doors.length },
                { key: 'documents', label: 'Documents', count: record.documents?.length || 0 },
                { key: 'issues', label: 'Issues', count: record.issues?.length || 0 },
                { key: 'team', label: 'Team' },
              ]}
              active={projectTab}
              onChange={setProjectTab}
            />
          </div>
          <div className="p-4">
            {projectTab === 'doors' ? (
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead><tr><th>Door</th><th>Specification</th><th>Room</th><th>Stage</th><th>Production</th><th>QC</th><th>Installation</th><th>Site</th></tr></thead>
                  <tbody>
                    {doorRows.map(({ door, pipe, stage }) => (
                      <tr key={door.id}>
                        <td><span className="font-medium text-ink-900">{door.number}</span><span className="block text-[10.5px] text-ink-400">{door.productName}</span></td>
                        <td className="text-[11px]">{door.material} · {door.design}<span className="block text-ink-400">{door.height}×{door.width}×{door.thickness} mm</span></td>
                        <td className="text-[11.5px]">{door.room || '—'}</td>
                        <td><Badge tone={STAGE_TONES[stage.key] || 'gray'}>{stage.label}</Badge></td>
                        <td className="text-[10.5px]">{pipe.production ? <Link className="link" to={`/production/${pipe.production.id}`}>{pipe.production.status}</Link> : <span className="text-ink-400">Not planned</span>}</td>
                        <td className="text-[10.5px]">{pipe.qc ? <Link className="link" to={`/quality/${pipe.qc.id}`}>{pipe.qc.status}</Link> : <span className="text-ink-400">—</span>}</td>
                        <td className="text-[10.5px]">{pipe.installation ? <Link className="link" to={`/installation/${pipe.installation.id}`}>{pipe.installation.status}</Link> : <span className="text-ink-400">—</span>}</td>
                        <td className="text-[10.5px]">{pipe.inspection ? <Link className="link" to={`/inspections/${pipe.inspection.id}`}>{pipe.inspection.status}</Link> : <span className="text-ink-400">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {projectTab === 'documents' ? (
              <div className="grid sm:grid-cols-2 gap-2.5">
                {(record.documents || []).map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2.5 rounded-md border border-ink-200 p-2.5">
                    <span className="w-8 h-8 rounded bg-brand-50 text-brand-700 grid place-items-center shrink-0"><Icon name="FileText" className="w-4 h-4" /></span>
                    <div className="min-w-0 flex-1"><p className="text-[11.5px] font-medium text-ink-800 truncate">{doc.name}</p><p className="text-[10px] text-ink-400">{doc.size} · {formatDate(doc.uploadedAt)} · {doc.by}</p></div>
                    <IconButton icon="Download" label={`Download ${doc.name}`} size="sm" onClick={() => downloadAttachment(doc)} />
                  </div>
                ))}
                {!record.documents?.length ? <p className="text-[11.5px] text-ink-400">No documents uploaded.</p> : null}
              </div>
            ) : null}
            {projectTab === 'issues' ? (
              <div className="space-y-2">
                {(record.issues || []).length ? record.issues.map((issue) => (
                  <div key={issue.id} className="rounded-md border border-ink-200 p-3 flex items-start gap-3">
                    <span className={`w-7 h-7 rounded grid place-items-center shrink-0 ${issue.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}><Icon name={issue.status === 'Resolved' ? 'CheckCircle2' : 'AlertTriangle'} className="w-4 h-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-ink-800">{issue.title}</p>
                      <p className="text-[10.5px] text-ink-500 mt-0.5">{issue.notes}</p>
                      <p className="text-[10px] text-ink-400 mt-1">{issue.raisedBy} · {formatDate(issue.date)} · {issue.severity} priority</p>
                    </div>
                    <StatusBadge status={issue.status} />
                  </div>
                )) : <p className="text-[11.5px] text-ink-400">No project issues reported.</p>}
              </div>
            ) : null}
            {projectTab === 'team' ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {[['Project manager', record.manager], ['Mistri / team leader', record.mistri], ['Production supervisor', record.productionSupervisor], ['Installation supervisor', record.installationSupervisor], ['Site supervisor', record.siteSupervisor]].map(([label, name]) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <Avatar name={name || '—'} size="sm" />
                    <div><p className="text-[11.5px] font-medium text-ink-800">{name || 'Unassigned'}</p><p className="text-[10px] text-ink-400">{label}</p></div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </SectionCard>

        <Modal open={!!modal} onClose={closeModal} title={modal?.title} icon={modal?.icon} size="lg">
          {modal ? <EntityForm fields={modal.fields} initialValues={modal.initial} onSubmit={modal.onSubmit} onCancel={closeModal} submitLabel={modal.submitLabel} /> : null}
        </Modal>
        <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={runConfirm} title={confirm?.title} message={confirm?.message} confirmLabel={confirm?.confirmLabel} tone={confirm?.tone || 'danger'} />
      </>
    );
  }

  /* ------------------------------ PRODUCTION ---------------------------- */
  if (configKey === 'production') {
    const project = state.projects.items.find((p) => p.id === record.projectId);
    const qcs = state.qualityInspections.items.filter((q) => q.productionId === record.id);
    const progress = productionPercent(record.status);
    return (
      <>
        <SectionCard title="Manufacturing control" subtitle="Start, pause and hand off to quality" icon="Factory" className="mb-4">
          <div className="mb-3"><ProgressBar value={progress} label="Job progress" tone={record.status === 'Rework Required' ? 'red' : progress >= 100 ? 'green' : 'brand'} /></div>
          <div className="flex flex-wrap gap-2">
            {edit('production') && ['Pending', 'Material Pending', 'Ready to Start'].includes(record.status) ? <Button size="sm" variant="secondary" icon="Boxes" onClick={() => dispatch(issueProductionMaterial(record.id))}>Issue material</Button> : null}
            {edit('production') && ['Ready to Start', 'Pending', 'On Hold', 'Rework Required'].includes(record.status) ? <Button size="sm" variant="primary" icon="Play" onClick={() => dispatch(startProduction(record.id))}>{record.status === 'Rework Required' ? 'Restart rework' : 'Start production'}</Button> : null}
            {edit('production') && ['In Progress', 'Ready to Start'].includes(record.status) ? <Button size="sm" variant="secondary" icon="Pause" onClick={() => openModal('productionHold')}>Put on hold</Button> : null}
            {edit('production') && ['In Progress', 'Rework Required', 'Ready to Start'].includes(record.status) ? <Button size="sm" variant="success" icon="Check" onClick={() => dispatch(completeProduction(record.id))}>Mark complete & send to QC</Button> : null}
            {edit('production') && record.status === 'Rework Required' && qcs.length ? <Button size="sm" variant="secondary" icon="RotateCcw" onClick={() => dispatch(restartProduction(record.id))}>Resume rework</Button> : null}
            {project ? <Button size="sm" variant="secondary" icon="FolderKanban" onClick={() => navigate(`/projects/${project.id}`)}>Project</Button> : null}
          </div>
          <KpiStrip items={[
            { label: 'Mistri', value: record.mistri },
            { label: 'Supervisor', value: record.supervisor },
            { label: 'Planned end', value: formatDate(record.plannedEnd) },
            { label: 'Batch', value: record.batch || '—' },
          ]} />
          <div className="grid sm:grid-cols-3 gap-3 text-[11.5px]">
            <div className="rounded border border-ink-200 p-2.5"><p className="text-[10px] uppercase text-ink-400 mb-1">Material required</p>{(record.materialsRequired || []).map((m) => <p key={m} className="text-ink-600">· {m}</p>)}</div>
            <div className="rounded border border-ink-200 p-2.5"><p className="text-[10px] uppercase text-ink-400 mb-1">Material consumed</p>{(record.materialConsumed || []).length ? record.materialConsumed.map((m) => <p key={m} className="text-ink-600">· {m}</p>) : <p className="text-ink-400">Not recorded</p>}</div>
            <div className="rounded border border-ink-200 p-2.5"><p className="text-[10px] uppercase text-ink-400 mb-1">Wastage</p><p className="text-ink-600">{record.wastage || '—'}</p></div>
          </div>
        </SectionCard>

        <SectionCard title="Quality inspections" subtitle={`${qcs.length} inspection${qcs.length === 1 ? '' : 's'} recorded`} icon="ShieldCheck" className="mb-4">
          {qcs.length ? (
            <div className="space-y-2">
              {qcs.map((q) => (
                <Link key={q.id} to={`/quality/${q.id}`} className="flex items-center justify-between gap-2 rounded border border-ink-200 p-2.5 hover:bg-brand-50/50">
                  <div><p className="text-[11.5px] font-medium text-ink-800">{q.id} · {q.date ? formatDate(q.date) : '—'}</p><p className="text-[10px] text-ink-400">Inspector {q.inspector}{q.remarks ? ` · ${q.remarks}` : ''}</p></div>
                  <StatusBadge status={q.status} size="sm" />
                </Link>
              ))}
            </div>
          ) : <p className="text-[11.5px] text-ink-400">No QC inspection yet. Complete the job to request one.</p>}
        </SectionCard>

        <Modal open={!!modal} onClose={closeModal} title={modal?.title} icon={modal?.icon} size="md">
          {modal ? <EntityForm fields={modal.fields} initialValues={modal.initial} onSubmit={modal.onSubmit} onCancel={closeModal} submitLabel={modal.submitLabel} /> : null}
        </Modal>
      </>
    );
  }

  /* -------------------------------- QUALITY ----------------------------- */
  if (configKey === 'quality') {
    const production = state.production.items.find((p) => p.id === record.productionId);
    const project = state.projects.items.find((p) => p.id === record.projectId);
    return (
      <>
        <SectionCard title="Inspection result" subtitle="Door-level quality clearance" icon="ShieldCheck" className="mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            {QC_CHECKLIST.map((c) => {
              const passed = record.checks?.[c.key];
              return (
                <div key={c.key} className={`rounded border p-2 text-center ${passed ? 'border-emerald-200 bg-emerald-50' : 'border-ink-200 bg-ink-50'}`}>
                  <Icon name={passed ? 'CheckCircle2' : 'MinusCircle'} className={`w-4 h-4 mx-auto ${passed ? 'text-emerald-600' : 'text-ink-300'}`} />
                  <p className="text-[10px] text-ink-600 mt-1 leading-3">{c.label}</p>
                </div>
              );
            })}
          </div>
          <KpiStrip items={[
            { label: 'Inspector', value: record.inspector },
            { label: 'Inspection date', value: formatDate(record.date) },
            { label: 'Overall', value: record.overall || '—' },
            { label: 'Rework count', value: String(record.reworkCount || 0) },
          ]} />
          <div className="flex flex-wrap gap-2">
            {approve('quality') && ['Pending', 'Rework Required'].includes(record.status) ? (
              <>
                <Button size="sm" variant="success" icon="Check" onClick={() => openModal('qcApprove')}>Approve door</Button>
                <Button size="sm" variant="outlineDanger" icon="RotateCcw" onClick={() => openModal('qcReject')}>Reject & rework</Button>
              </>
            ) : record.status !== 'Pending' ? <Badge tone={record.status === 'Approved' ? 'green' : 'red'}>Final result: {record.status}</Badge> : <p className="text-[11px] text-ink-500">Only the QC manager can approve or reject this inspection.</p>}
            {production ? <Button size="sm" variant="secondary" icon="Factory" onClick={() => navigate(`/production/${production.id}`)}>Production order</Button> : null}
            {project ? <Button size="sm" variant="secondary" icon="FolderKanban" onClick={() => navigate(`/projects/${project.id}`)}>Project</Button> : null}
          </div>
          {record.remarks ? <p className="text-[11.5px] text-ink-600 mt-3 bg-ink-50 border border-ink-200 rounded p-2.5">{record.remarks}</p> : null}
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-wider text-ink-400 mb-1.5">Inspection photos</p>
            <PhotoStrip images={record.images} label="inspection photos" />
          </div>
        </SectionCard>
        <Modal open={!!modal} onClose={closeModal} title={modal?.title} icon={modal?.icon} size="md">
          {modal ? <EntityForm fields={modal.fields} initialValues={modal.initial} onSubmit={modal.onSubmit} onCancel={closeModal} submitLabel={modal.submitLabel} /> : null}
        </Modal>
      </>
    );
  }

  /* -------------------------------- DISPATCH ---------------------------- */
  if (configKey === 'dispatch') {
    const project = state.projects.items.find((p) => p.id === record.projectId);
    const customer = state.customers.items.find((c) => c.id === record.customerId);
    const qcs = state.qualityInspections.items.filter((q) => q.projectId === record.projectId && (record.doorNumbers || []).includes(q.doorNumber));
    return (
      <>
        <SectionCard title="Dispatch workflow" subtitle="Packing, transport and proof of delivery" icon="Truck" className="mb-4">
          <KpiStrip items={[
            { label: 'Doors', value: (record.doorNumbers || []).length },
            { label: 'Vehicle', value: record.vehicleNumber },
            { label: 'ETA', value: formatDate(record.expectedDeliveryDate) },
            { label: 'Delivered', value: record.actualDeliveryDate ? formatDate(record.actualDeliveryDate) : 'Pending' },
          ]} />
          <div className="flex flex-wrap gap-2 mb-3">
            {edit('dispatch') && ['Ready for Dispatch', 'Packing'].includes(record.status) ? <Button size="sm" variant="secondary" icon="Package" onClick={() => dispatch(prepareDispatch(record.id))}>Start packing</Button> : null}
            {edit('dispatch') && ['Ready for Dispatch', 'Packing'].includes(record.status) ? <Button size="sm" variant="primary" icon="Send" onClick={() => dispatch(sendDispatch(record.id))}>Release dispatch</Button> : null}
            {edit('dispatch') && record.status === 'Dispatched' ? <Button size="sm" variant="secondary" icon="Truck" onClick={() => dispatch(transitDispatch(record.id))}>Mark in transit</Button> : null}
            {edit('dispatch') && ['Dispatched', 'In Transit'].includes(record.status) ? <Button size="sm" variant="success" icon="PackageCheck" onClick={() => openModal('dispatchDeliver')}>Confirm delivery</Button> : null}
            {edit('dispatch') && record.status !== 'Delivered' ? <Button size="sm" variant="outlineDanger" icon="AlertTriangle" onClick={() => openModal('dispatchIssue')}>Report issue</Button> : null}
            {project ? <Button size="sm" variant="secondary" icon="FolderKanban" onClick={() => navigate(`/projects/${project.id}`)}>Project</Button> : null}
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-[11.5px]">
            <div className="rounded border border-ink-200 p-3 space-y-1.5">
              <p className="text-[10px] uppercase tracking-wide text-ink-400">Transport</p>
              <p>{record.transportCompany || '—'}</p>
              <p className="text-ink-500">Driver {record.driverName || '—'} · {record.driverMobile || '—'}</p>
              <p className="text-ink-500">{record.packingStatus}</p>
            </div>
            <div className="rounded border border-ink-200 p-3 space-y-1.5">
              <p className="text-[10px] uppercase tracking-wide text-ink-400">Delivery</p>
              <p>{customer?.name || '—'}</p>
              <p className="text-ink-500 text-[10.5px]">{record.deliveryAddress}</p>
              <p className="text-ink-500">Received by {record.receivedBy || '—'}{record.deliveryProof ? ` · ${record.deliveryProof}` : ''}</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-wide text-ink-400 mb-1.5">Door QC reference</p>
            <div className="flex flex-wrap gap-1.5">
              {(record.doorNumbers || []).map((num) => {
                const q = qcs.find((x) => x.doorNumber === num);
                return <span key={num} className="inline-flex items-center gap-1 text-[10.5px] border border-ink-200 rounded px-2 py-1 bg-ink-50">{num} {q ? <Icon name="CheckCircle2" className="w-3 h-3 text-emerald-600" /> : <Icon name="AlertCircle" className="w-3 h-3 text-amber-500" />}</span>;
              })}
            </div>
          </div>
          {record.notes ? <p className="text-[11px] text-ink-500 mt-3">{record.notes}</p> : null}
        </SectionCard>
        <Modal open={!!modal} onClose={closeModal} title={modal?.title} icon={modal?.icon} size="md">
          {modal ? <EntityForm fields={modal.fields} initialValues={modal.initial} onSubmit={modal.onSubmit} onCancel={closeModal} submitLabel={modal.submitLabel} /> : null}
        </Modal>
      </>
    );
  }

  /* ------------------------------ INSTALLATION -------------------------- */
  if (configKey === 'installation') {
    const project = state.projects.items.find((p) => p.id === record.projectId);
    const inspections = state.siteInspections.items.filter((i) => i.installationId === record.id || (i.projectId === record.projectId && i.doorNumber === record.doorNumber));
    return (
      <>
        <SectionCard title="Installation workflow" subtitle="Schedule, crew allocation and inspection hand-off" icon="Hammer" className="mb-4">
          <KpiStrip items={[
            { label: 'Supervisor', value: record.supervisor },
            { label: 'Planned', value: formatDate(record.plannedDate) },
            { label: 'Actual', value: record.actualDate ? formatDate(record.actualDate) : 'Pending' },
            { label: 'Team', value: (record.team || []).length ? `${record.team.length} members` : 'Not assigned' },
          ]} />
          <div className="flex flex-wrap gap-2 mb-3">
            {edit('installation') && record.status !== 'Completed' ? <Button size="sm" variant="secondary" icon="Calendar" onClick={() => openModal('installationSchedule')}>Schedule</Button> : null}
            {edit('installation') && record.status !== 'Completed' ? <Button size="sm" variant="secondary" icon="Users" onClick={() => openModal('installationTeam')}>Assign team</Button> : null}
            {edit('installation') && ['Scheduled', 'Team Assigned', 'Pending'].includes(record.status) ? <Button size="sm" variant="primary" icon="Play" onClick={() => dispatch(startInstallationJob(record.id))}>Start installation</Button> : null}
            {edit('installation') && ['In Progress', 'Team Assigned', 'Scheduled', 'Rework Required'].includes(record.status) ? <Button size="sm" variant="success" icon="Check" onClick={() => dispatch(completeInstallationJob(record.id))}>Complete & request inspection</Button> : null}
            {project ? <Button size="sm" variant="secondary" icon="FolderKanban" onClick={() => navigate(`/projects/${project.id}`)}>Project</Button> : null}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mb-3">
            {[['Fitting', record.fittingStatus], ['Alignment', record.alignmentStatus], ['Hardware', record.hardwareStatus], ['Finishing', record.finishingStatus]].map(([label, value]) => (
              <div key={label} className="rounded border border-ink-200 px-2.5 py-2"><p className="text-[9.5px] uppercase text-ink-400">{label}</p><p className="text-ink-700 mt-0.5">{value || '—'}</p></div>
            ))}
          </div>
          {record.team?.length ? <p className="text-[11px] text-ink-500 mb-3">Crew: {record.team.join(', ')}</p> : null}
          {record.remarks ? <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded p-2.5 mb-3">{record.remarks}</p> : null}
          <div className="grid sm:grid-cols-2 gap-4">
            <div><p className="text-[10px] uppercase tracking-wider text-ink-400 mb-1.5">Before photos</p><PhotoStrip images={record.beforeImages} label="before photos" /></div>
            <div><p className="text-[10px] uppercase tracking-wider text-ink-400 mb-1.5">After photos</p><PhotoStrip images={record.afterImages} label="after photos" /></div>
          </div>
          {inspections.length ? (
            <div className="mt-4 border-t border-ink-100 pt-3">
              <p className="text-[10px] uppercase tracking-wider text-ink-400 mb-1.5">Site inspection</p>
              {inspections.map((i) => <Link key={i.id} to={`/inspections/${i.id}`} className="flex items-center justify-between gap-2 text-[11.5px] py-1 hover:text-brand-700"><span>{i.id} · {formatDate(i.inspectionDate)}</span><StatusBadge status={i.status} size="sm" /></Link>)}
            </div>
          ) : null}
        </SectionCard>
        <Modal open={!!modal} onClose={closeModal} title={modal?.title} icon={modal?.icon} size="md">
          {modal ? <EntityForm fields={modal.fields} initialValues={modal.initial} onSubmit={modal.onSubmit} onCancel={closeModal} submitLabel={modal.submitLabel} /> : null}
        </Modal>
      </>
    );
  }

  /* ------------------------------- INSPECTIONS -------------------------- */
  if (configKey === 'inspections') {
    const project = state.projects.items.find((p) => p.id === record.projectId);
    const installation = state.installations.items.find((i) => i.id === record.installationId);
    return (
      <>
        <SectionCard title="Site inspection checklist" subtitle="Approve or reject installed work" icon="ClipboardCheck" className="mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {SITE_CHECKLIST.map((c) => {
              const passed = record.checks?.[c.key];
              return (
                <div key={c.key} className={`rounded border p-2 text-center ${passed ? 'border-emerald-200 bg-emerald-50' : 'border-ink-200 bg-ink-50'}`}>
                  <Icon name={passed ? 'CheckCircle2' : 'MinusCircle'} className={`w-4 h-4 mx-auto ${passed ? 'text-emerald-600' : 'text-ink-300'}`} />
                  <p className="text-[10px] text-ink-600 mt-1 leading-3">{c.label}</p>
                </div>
              );
            })}
          </div>
          {record.defectDescription ? <p className="text-[11.5px] text-rose-700 bg-rose-50 border border-rose-200 rounded p-2.5 mb-3">Defect: {record.defectDescription}</p> : null}
          {record.remarks ? <p className="text-[11.5px] text-ink-600 bg-ink-50 border border-ink-200 rounded p-2.5 mb-3">{record.remarks}</p> : null}
          <div className="flex flex-wrap gap-2">
            {approve('inspection') && record.status !== 'Approved' ? (
              <>
                <Button size="sm" variant="success" icon="Check" onClick={() => openModal('inspectionApprove')}>Approve at site</Button>
                <Button size="sm" variant="outlineDanger" icon="X" onClick={() => openModal('inspectionReject')}>Reject / snag</Button>
              </>
            ) : <Badge tone={record.status === 'Approved' ? 'green' : 'red'}>{record.status}</Badge>}
            {project ? <Button size="sm" variant="secondary" icon="FolderKanban" onClick={() => navigate(`/projects/${project.id}`)}>Project</Button> : null}
            {installation ? <Button size="sm" variant="secondary" icon="Hammer" onClick={() => navigate(`/installation/${installation.id}`)}>Installation</Button> : null}
          </div>
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-wider text-ink-400 mb-1.5">Inspection photos</p>
            <PhotoStrip images={record.images} label="inspection photos" />
          </div>
        </SectionCard>

        <SectionCard title="Approval history" subtitle="Every decision is recorded with user and timestamp" icon="History">
          {(record.history || []).length ? (
            <ol className="space-y-2">
              {[...(record.history || [])].reverse().map((h, i) => (
                <li key={`${h.at}-${i}`} className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-ink-100 grid place-items-center shrink-0"><Icon name={h.status === 'Approved' ? 'CheckCircle2' : 'AlertTriangle'} className={`w-3.5 h-3.5 ${h.status === 'Approved' ? 'text-emerald-600' : 'text-rose-500'}`} /></span>
                  <div><p className="text-[11.5px] text-ink-800">{h.status}</p><p className="text-[10.5px] text-ink-500">{h.remarks}</p><p className="text-[10px] text-ink-400">{h.by} · {formatDateTime(h.at)}</p></div>
                </li>
              ))}
            </ol>
          ) : <p className="text-[11.5px] text-ink-400">No approval decisions recorded yet.</p>}
        </SectionCard>

        <Modal open={!!modal} onClose={closeModal} title={modal?.title} icon={modal?.icon} size="md">
          {modal ? <EntityForm fields={modal.fields} initialValues={modal.initial} onSubmit={modal.onSubmit} onCancel={closeModal} submitLabel={modal.submitLabel} /> : null}
        </Modal>
      </>
    );
  }

  /* -------------------------------- INVOICES ---------------------------- */
  if (configKey === 'invoices') {
    const totals = invoiceTotals(record);
    const status = invoiceStatus(record);
    const canPay = approve('payment') && status !== 'Draft' && totals.outstanding > 0;
    return (
      <>
        <SectionCard title="Invoice & collections" subtitle="Receipts against this tax invoice" icon="Wallet" className="mb-4">
          <KpiStrip items={[
            { label: 'Invoice total', value: inr(totals.total) },
            { label: 'Received', value: inr(totals.received) },
            { label: 'Outstanding', value: inr(totals.outstanding) },
            { label: 'Due date', value: formatDate(record.dueDate) },
          ]} />
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <StatusBadge status={status} />
            {record.projectId ? <Button size="sm" variant="secondary" icon="FolderKanban" onClick={() => navigate(`/projects/${record.projectId}`)}>Project</Button> : null}
            {record.salesOrderId ? <Button size="sm" variant="secondary" icon="ClipboardList" onClick={() => navigate(`/sales-orders/${record.salesOrderId}`)}>Sales order</Button> : null}
            {canPay ? <Button size="sm" variant="primary" icon="Plus" onClick={() => openModal('recordPayment')}>Record payment</Button> : null}
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead><tr><th>Receipt</th><th>Date</th><th>Method</th><th>Reference</th><th className="text-right">Amount</th><th>Note</th></tr></thead>
              <tbody>
                {(record.payments || []).map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono text-[11px] text-ink-500">{p.id}</td>
                    <td>{formatDate(p.date)}</td>
                    <td><Badge tone="blue">{p.method}</Badge></td>
                    <td className="text-[11.5px]">{p.reference || '—'}</td>
                    <td className="text-right tabular-nums font-medium">{inr(p.amount)}</td>
                    <td className="text-[11px] text-ink-500">{p.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!(record.payments || []).length ? <p className="text-[11.5px] text-ink-400 py-4 text-center">No payments recorded against this invoice.</p> : null}
          </div>
          {totals.outstanding === 0 ? <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2.5 mt-3 flex items-center gap-1.5"><Icon name="CheckCircle2" className="w-3.5 h-3.5" /> Fully settled — no balance outstanding.</p> : null}
        </SectionCard>
        <Modal open={!!modal} onClose={closeModal} title={modal?.title} icon={modal?.icon} size="md">
          {modal ? <EntityForm fields={modal.fields} initialValues={modal.initial} onSubmit={modal.onSubmit} onCancel={closeModal} submitLabel={modal.submitLabel} /> : null}
        </Modal>
      </>
    );
  }

  /* --------------------------------- SERVICE ---------------------------- */
  if (configKey === 'service') {
    const project = state.projects.items.find((p) => p.id === record.projectId);
    const open = !['Resolved', 'Closed'].includes(record.status);
    return (
      <>
        <SectionCard title="Service workflow" subtitle="Technician allocation and resolution" icon="Wrench" className="mb-4">
          <KpiStrip items={[
            { label: 'Technician', value: record.technician || 'Unassigned' },
            { label: 'Priority', value: record.priority },
            { label: 'Service date', value: record.serviceDate ? formatDate(record.serviceDate) : 'Pending' },
            { label: 'Warranty', value: record.warrantyEnd ? `to ${formatDate(record.warrantyEnd)}` : '—' },
          ]} />
          <div className="flex flex-wrap gap-2">
            {edit('service') && record.status === 'New' ? <Button size="sm" variant="secondary" icon="HardHat" onClick={() => openModal('serviceAssign')}>Assign technician</Button> : null}
            {edit('service') && ['Assigned', 'In Progress', 'Waiting for Parts'].includes(record.status) ? <Button size="sm" variant="primary" icon="CheckCircle2" onClick={() => openModal('serviceResolve')}>Record resolution</Button> : null}
            {edit('service') && record.status === 'Resolved' ? <Button size="sm" variant="success" icon="CheckCheck" onClick={() => dispatch(closeServiceTicket(record.id))}>Close ticket</Button> : null}
            {project ? <Button size="sm" variant="secondary" icon="FolderKanban" onClick={() => navigate(`/projects/${project.id}`)}>Project</Button> : null}
          </div>
          <p className="text-[11.5px] text-ink-600 mt-3">{record.description}</p>
          {record.resolution ? <p className="text-[11.5px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-2.5 mt-2">Resolution: {record.resolution}</p> : null}
          <p className="text-[10.5px] text-ink-400 mt-2">Warranty {formatDate(record.warrantyStart)} → {formatDate(record.warrantyEnd)}{open ? ' · ticket open' : ' · closed'}</p>
        </SectionCard>
        <SectionCard title="Service history" icon="History">
          <Timeline items={(record.history || []).map((h, i) => ({ id: `${h.at}-${i}`, at: h.at, user: h.by, action: h.status, detail: h.remarks, module: 'service' }))} />
        </SectionCard>
        <Modal open={!!modal} onClose={closeModal} title={modal?.title} icon={modal?.icon} size="md">
          {modal ? <EntityForm fields={modal.fields} initialValues={modal.initial} onSubmit={modal.onSubmit} onCancel={closeModal} submitLabel={modal.submitLabel} /> : null}
        </Modal>
      </>
    );
  }

  /* -------------------------------- MATERIALS --------------------------- */
  if (configKey === 'materials') {
    const moves = state.stockMoves.items.filter((m) => m.materialId === record.id);
    return (
      <>
        <SectionCard title="Stock position" subtitle="Reservations and stock movement" icon="Boxes" className="mb-4"
          action={edit('inventory') ? <Button size="sm" variant="primary" icon="ArrowLeftRight" onClick={() => openModal('stockMove')}>Stock movement</Button> : null}>
          <KpiStrip items={[
            { label: 'Available', value: `${materialAvailable(record)} ${record.unit}` },
            { label: 'Reserved', value: `${record.reservedQty} ${record.unit}` },
            { label: 'Consumed', value: `${record.consumedQty} ${record.unit}` },
            { label: 'Unit cost', value: inr(record.unitCost) },
          ]} />
          <div className="flex items-center gap-2 mb-3"><StatusBadge status={materialStatus(record)} /><span className="text-[11px] text-ink-500">Minimum stock {record.minStock} {record.unit}</span></div>
          {record.reservedFor?.length ? (
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-wider text-ink-400 mb-1">Reserved against projects</p>
              {record.reservedFor.map((r) => (
                <Link key={r.projectId} to={`/projects/${r.projectId}`} className="flex items-center justify-between text-[11.5px] py-1 hover:text-brand-700 border-b border-ink-100 last:border-0">
                  <span>{relationLabel(state, 'projects', r.projectId)}</span><span className="tabular-nums">{r.qty} {record.unit}</span>
                </Link>
              ))}
            </div>
          ) : null}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink-400 mb-1.5">Recent movements</p>
            {moves.length ? moves.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-[11.5px] py-1.5 border-b border-ink-100 last:border-0">
                <span className="flex items-center gap-2"><Badge tone={m.type === 'Inward' ? 'green' : m.type === 'Wastage' ? 'red' : 'blue'} size="sm">{m.type}</Badge>{m.note}</span>
                <span className="tabular-nums text-ink-600">{m.qty} {record.unit} · {formatDate(m.date)}</span>
              </div>
            )) : <p className="text-[11.5px] text-ink-400">No movements recorded.</p>}
          </div>
        </SectionCard>
        <Modal open={!!modal} onClose={closeModal} title={modal?.title} icon={modal?.icon} size="md">
          {modal ? <EntityForm fields={modal.fields} initialValues={modal.initial} onSubmit={modal.onSubmit} onCancel={closeModal} submitLabel={modal.submitLabel} /> : null}
        </Modal>
      </>
    );
  }

  return null;
}

function carCreateGuard(create) {
  return create('salesOrders');
}
