import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MODULE_CONFIGS } from '../data/moduleConfigs';
import { usePermissions } from '../hooks/usePermissions';
import { getByPath } from '../components/common/forms';
import { EntityForm } from '../components/common/forms';
import { Modal, ConfirmDialog } from '../components/common/Modal';
import {
  Badge, Breadcrumbs, Button, EmptyState, SectionCard, StatusBadge, Avatar, ProgressBar,
} from '../components/common/ui';
import Icon from '../components/common/Icon';
import ModulePanels from '../components/detail/ModulePanels';
import Timeline from '../components/common/Timeline';
import QuotationForm from '../components/forms/QuotationForm';
import { updateRecord, deleteRecord, saveQuotation } from '../features/workflow/workflowThunks';
import {
  invoiceStatus, invoiceTotals, materialAvailable, materialStatus, projectProgress, pipelineCollections,
} from '../utils/calc';
import { formatDate, formatDateTime, inr, num } from '../utils/format';
import { resolveLookupLabel } from '../utils/options';

const RELATIONS = [
  { field: 'customerId', collection: 'customers', label: 'Customer', path: '/customers' },
  { field: 'leadId', collection: 'leads', label: 'Lead', path: '/leads' },
  { field: 'quotationId', collection: 'quotations', label: 'Quotation', path: '/quotations' },
  { field: 'salesOrderId', collection: 'salesOrders', label: 'Sales order', path: '/sales-orders' },
  { field: 'projectId', collection: 'projects', label: 'Project', path: '/projects' },
  { field: 'productionId', collection: 'production', label: 'Production order', path: '/production' },
  { field: 'installationId', collection: 'installations', label: 'Installation', path: '/installation' },
  { field: 'materialId', collection: 'materials', label: 'Material', path: '/inventory' },
];

const relationName = (state, collection, id) => {
  const item = (state[collection]?.items || []).find((x) => x.id === id);
  if (!item) return id;
  return item.name || item.projectName || item.doorNumber || item.id;
};

export default function DetailPage({ configKey }) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = useSelector((s) => s);
  const config = MODULE_CONFIGS[configKey];
  const { edit, remove } = usePermissions();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const record = useMemo(() => (state[config.slice]?.items || []).find((r) => r.id === id), [state, config.slice, id]);

  const activities = useMemo(() => {
    if (!record) return [];
    const ids = new Set([record.id, record.projectId, record.installationId, record.productionId].filter(Boolean));
    return state.activities.items.filter((a) => ids.has(a.entityId)).slice(0, 14);
  }, [state.activities.items, record]);

  if (!record) {
    return (
      <div>
        <Breadcrumbs items={[{ label: config.title, to: config.path }, { label: id }]} />
        <div className="surface">
          <EmptyState icon="Search" title={`${config.singular} not found`} description={`No record with ID ${id} exists in this demo. It may have been deleted.`} action={<Button variant="primary" icon="ArrowLeft" onClick={() => navigate(config.path)}>Back to {config.title}</Button>} />
        </div>
      </div>
    );
  }

  const derivedStatus = configKey === 'invoices' ? invoiceStatus(record) : configKey === 'materials' ? materialStatus(record) : record.status;
  const titleValue = config.titleField ? record[config.titleField] || record.id : record.id;
  const subtitle = (config.subtitleFields || []).map((f) => (typeof record[f] === 'string' ? record[f] : '')).filter(Boolean).join(' · ');
  const fieldSections = [];
  config.fields
    .filter((f) => !f.name.includes('.') && f.name !== 'status' && !f.hideInDetail)
    .forEach((field) => {
      const sectionName = field.section || 'Details';
      let group = fieldSections.find((g) => g.name === sectionName);
      if (!group) { group = { name: sectionName, fields: [] }; fieldSections.push(group); }
      group.fields.push(field);
    });

  const formatValue = (field) => {
    const value = getByPath(record, field.name);
    if (value === null || value === undefined || value === '') return '—';
    if (field.lookup) return resolveLookupLabel(field.lookup, value, state);
    if (field.type === 'date') return formatDate(value);
    if (field.type === 'list') return Array.isArray(value) ? value.join(', ') : value;
    if (field.type === 'checkbox') return value ? 'Yes' : 'No';
    if (field.label.includes('₹')) return inr(value);
    if (field.type === 'number') return num(value);
    return value;
  };

  const relations = RELATIONS.filter((rel) => record[rel.field]).map((rel) => ({ ...rel, name: relationName(state, rel.collection, record[rel.field]) }));
  const related = (config.related || []).map((rel) => ({
    ...rel,
    items: (state[rel.collection]?.items || []).filter((item) => item[rel.matchKey] === record.id),
  }));

  const handleUpdate = (values) => {
    if (config.formComponent === 'quotation') {
      dispatch(saveQuotation(values, record.id));
    } else {
      dispatch(updateRecord({ collection: config.slice, id: record.id, changes: values, module: config.key, label: config.singular }));
    }
    setEditOpen(false);
  };

  const projectProgressValue = configKey === 'projects' ? projectProgress(record, pipelineCollections(state)) : null;
  const invoiceSummary = configKey === 'invoices' ? invoiceTotals(record) : null;

  return (
    <div>
      <Breadcrumbs items={[{ label: config.title, to: config.path }, { label: record.id }]} />

      <div className="surface p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="w-11 h-11 rounded-lg bg-ink-900 text-brand-300 grid place-items-center shrink-0">
            <Icon name={config.icon || 'FileText'} className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] text-ink-400">{record.id}</span>
              {derivedStatus ? <StatusBadge status={derivedStatus} /> : null}
              {record.priority ? <Badge tone={record.priority === 'Urgent' ? 'red' : record.priority === 'High' ? 'amber' : 'gray'}>{record.priority} priority</Badge> : null}
              {configKey === 'quotes' ? null : null}
            </div>
            <h1 className="text-[20px] leading-6 font-semibold text-ink-900 tracking-tight mt-1">{titleValue}</h1>
            <div className="flex items-center gap-2 flex-wrap mt-1.5 text-[11.5px] text-ink-500">
              {subtitle ? <span className="flex items-center gap-1"><Icon name="MapPin" className="w-3 h-3" />{subtitle}</span> : null}
              {record.date || record.invoiceDate || record.visitDate || record.complaintDate ? <span className="flex items-center gap-1"><Icon name="Calendar" className="w-3 h-3" />{formatDate(record.date || record.invoiceDate || record.visitDate || record.complaintDate)}</span> : null}
              {record.salesExecutive || record.manager || record.supervisor || record.mistri ? <span className="flex items-center gap-1"><Icon name="User" className="w-3 h-3" />{record.salesExecutive || record.manager || record.supervisor || record.mistri}</span> : null}
              <span className="flex items-center gap-1"><Icon name="Layers" className="w-3 h-3" />{config.title}</span>
            </div>
            {configKey === 'projects' ? (
              <div className="mt-2.5 max-w-md">
                <ProgressBar value={projectProgressValue} label="Delivery progress" tone={projectProgressValue >= 100 ? 'green' : 'brand'} size="sm" />
              </div>
            ) : null}
            {invoiceSummary ? (
              <div className="flex flex-wrap gap-4 mt-2 text-[11.5px]">
                <span className="text-ink-500">Invoice <strong className="text-ink-800">{inr(invoiceSummary.total)}</strong></span>
                <span className="text-ink-500">Received <strong className="text-emerald-700">{inr(invoiceSummary.received)}</strong></span>
                <span className="text-ink-500">Outstanding <strong className="text-rose-700">{inr(invoiceSummary.outstanding)}</strong></span>
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0 sm:self-start">
            <Button variant="secondary" size="sm" icon="ArrowLeft" onClick={() => navigate(config.path)}>Back</Button>
            {edit(config.permission) ? <Button variant="secondary" size="sm" icon="Pencil" onClick={() => setEditOpen(true)}>Edit</Button> : null}
            {remove(config.permission) ? <Button variant="outlineDanger" size="sm" icon="Trash2" onClick={() => setDeleteOpen(true)}>Delete</Button> : null}
          </div>
        </div>
        {relations.length ? (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-ink-100">
            <span className="text-[10px] uppercase tracking-wider text-ink-400">Linked to</span>
            {relations.map((rel) => (
              <Link key={rel.field} to={`${rel.path}/${record[rel.field]}`} className="inline-flex items-center gap-1.5 rounded border border-ink-200 bg-white px-2 py-1 text-[10.5px] text-ink-600 hover:border-brand-300 hover:text-brand-800">
                <Icon name="Link2" className="w-3 h-3 text-ink-400" /> {rel.label}: <span className="font-medium">{rel.name}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
        <div className="min-w-0 space-y-4">
          <ModulePanels configKey={configKey} record={record} />

          <SectionCard title="Record details" subtitle={`Complete ${config.singular.toLowerCase()} information`} icon="FileText">
            <div className="space-y-4">
              {fieldSections.map((sectionItem) => (
                <div key={sectionItem.name}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400 mb-2 pb-1 border-b border-ink-100">{sectionItem.name}</p>
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                    {sectionItem.fields.map((field) => (
                      <div key={field.name} className={field.full || field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                        <dt className="text-[10px] font-medium uppercase tracking-wide text-ink-400">{field.label}</dt>
                        <dd className="text-[12.5px] text-ink-800 mt-0.5 leading-5 whitespace-pre-line break-words">{formatValue(field)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </SectionCard>

          {related.filter((r) => r.items.length).map((rel) => {
            const relConfig = MODULE_CONFIGS[rel.collection];
            return (
              <SectionCard key={rel.collection} title={rel.label} subtitle={`${rel.items.length} linked record${rel.items.length === 1 ? '' : 's'}`} icon={relConfig?.icon || 'Link2'}
                action={<Link to={rel.path} className="text-[10.5px] text-brand-700 font-medium hover:underline">View all</Link>}>
                <div className="divide-y divide-ink-100 -my-2">
                  {rel.items.slice(0, 6).map((item) => {
                    const label = relConfig?.titleField ? item[relConfig.titleField] : item.complaintType || item.description || item.id;
                    const metaLine = [
                      label !== item.id ? item.id : null,
                      item.customerId ? relationName(state, 'customers', item.customerId) : null,
                      item.date || item.invoiceDate ? formatDate(item.date || item.invoiceDate) : null,
                      item.totalAmount ? inr(item.totalAmount) : null,
                    ].filter(Boolean).join(' · ');
                    return (
                      <Link key={item.id} to={`${rel.path}/${item.id}`} className="flex items-center justify-between gap-2 py-2 hover:text-brand-800">
                        <div className="min-w-0">
                          <p className="text-[12px] font-medium text-ink-800 truncate">{label || item.id}</p>
                          <p className="text-[10px] text-ink-400">{metaLine}</p>
                        </div>
                        <StatusBadge status={item.status} size="sm" />
                      </Link>
                    );
                  })}
                </div>
              </SectionCard>
            );
          })}
        </div>

        <aside className="space-y-4">
          <SectionCard title="At a glance" icon="Info" bodyClassName="p-4">
            <div className="space-y-2.5 text-[12px]">
              <div className="flex justify-between gap-2"><span className="text-ink-500">Record type</span><span className="text-ink-800 font-medium">{config.singular}</span></div>
              <div className="flex justify-between gap-2"><span className="text-ink-500">Current status</span><StatusBadge status={derivedStatus} size="sm" /></div>
              {configKey === 'materials' ? (
                <>
                  <div className="flex justify-between gap-2"><span className="text-ink-500">Available</span><span className="text-ink-800 tabular-nums font-medium">{materialAvailable(record)} {record.unit}</span></div>
                  <div className="flex justify-between gap-2"><span className="text-ink-500">Minimum stock</span><span className="text-ink-800 tabular-nums">{record.minStock} {record.unit}</span></div>
                </>
              ) : null}
              {configKey === 'projects' ? (
                <>
                  <div className="flex justify-between gap-2"><span className="text-ink-500">Doors</span><span className="text-ink-800 font-medium">{record.doors.length}</span></div>
                  <div className="flex justify-between gap-2"><span className="text-ink-500">Budget</span><span className="text-ink-800 font-medium">{inr(record.budget, { compact: true })}</span></div>
                  <div className="flex justify-between gap-2"><span className="text-ink-500">Target completion</span><span className="text-ink-800">{formatDate(record.endDate)}</span></div>
                </>
              ) : null}
              {record.createdAt ? <div className="flex justify-between gap-2"><span className="text-ink-500">Created</span><span className="text-ink-700">{formatDateTime(record.createdAt)}</span></div> : null}
            </div>
          </SectionCard>

          {relations.length ? (
            <SectionCard title="Quick links" icon="Link2">
              <div className="space-y-1">
                {relations.map((rel) => (
                  <Link key={rel.field} to={`${rel.path}/${record[rel.field]}`} className="flex items-center gap-2 py-1.5 text-[11.5px] text-ink-600 hover:text-brand-800">
                    <Icon name="ArrowRight" className="w-3 h-3 text-ink-300" />
                    <span className="text-ink-400">{rel.label}</span>
                    <span className="ml-auto font-medium truncate max-w-[150px]">{rel.name}</span>
                  </Link>
                ))}
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title="Activity timeline" subtitle="Audit trail for this record" icon="History">
            <Timeline items={activities} emptyText="No activity has been logged for this record yet." />
          </SectionCard>
        </aside>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit ${config.singular} · ${record.id}`} subtitle={config.formComponent === 'quotation' ? 'Saving creates a new quotation version.' : 'Update record details'} size={config.formComponent === 'quotation' ? '3xl' : config.fields.length > 10 ? 'xl' : 'lg'} icon="Pencil">
        {config.formComponent === 'quotation' ? (
          <QuotationForm initial={record} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} submitLabel="Save revision" />
        ) : (
          <EntityForm fields={config.fields} initialValues={record} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} submitLabel="Save changes" />
        )}
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => { dispatch(deleteRecord({ collection: config.slice, id: record.id, module: config.key, label: config.singular })); setDeleteOpen(false); navigate(config.path); }}
        title={`Delete ${config.singular.toLowerCase()}?`}
        message={<>Remove <strong>{record.id}</strong> from the demo register? Linked records will remain, but this action cannot be undone.</>}
        confirmLabel="Delete record"
      />
    </div>
  );
}
