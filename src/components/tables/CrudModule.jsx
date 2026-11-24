import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DataTable from './DataTable';
import { Button, IconButton, Badge, PageHeader } from '../common/ui';
import { Modal, ConfirmDialog } from '../common/Modal';
import { EntityForm } from '../common/forms';
import QuotationForm from '../forms/QuotationForm';
import { MODULE_CONFIGS } from '../../data/moduleConfigs';
import { usePermissions } from '../../hooks/usePermissions';
import { createRecord, updateRecord, deleteRecord, saveQuotation } from '../../features/workflow/workflowThunks';
import { nextId, todayISO } from '../../utils/format';

const buildId = (config, items) => {
  const id = nextId(config.idPrefix || 'REC-', items, config.idStart || 1);
  if (config.idPad) {
    const suffix = id.slice((config.idPrefix || '').length);
    return `${config.idPrefix}${String(Number(suffix)).padStart(config.idPad, '0')}`;
  }
  return id;
};

export default function CrudModule({
  configKey, embedded = false, detailEnabled = true, summary, extraHeaderActions, extraRowActions,
  toolbarExtra, titleOverride, subtitleOverride, fixedRows, onAfterSave, defaultFilters,
}) {
  const config = MODULE_CONFIGS[configKey];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = useSelector((s) => s);
  const { role, user, create, edit, remove } = usePermissions();
  const collection = state[config.slice]?.items || [];
  const rows = useMemo(() => {
    const scoped = extraHeaderActions ? collection : collection;
    return fixedRows || scoped;
  }, [collection, fixedRows, extraHeaderActions]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const defaults = useMemo(() => {
    const base = { ...(config.createDefaults || {}) };
    if (role === 'sales' && config.fields.some((f) => f.name === 'salesExecutive')) base.salesExecutive = user;
    if (role === 'estimation' && config.fields.some((f) => f.name === 'preparedBy')) base.preparedBy = user;
    if (role === 'store' && config.fields.some((f) => f.name === 'requestedBy')) base.requestedBy = user;
    return base;
  }, [config, role, user]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (row) => { setEditing(row); setFormOpen(true); };

  const handleSubmit = (values) => {
    if (config.formComponent === 'quotation') {
      saveQuotationAndClose(values, editing?.id);
      return;
    }
    if (editing) {
      dispatch(updateRecord({ collection: config.slice, id: editing.id, changes: values, module: config.key, label: config.singular }));
    } else {
      const id = buildId(config, collection);
      const record = { ...values, id, createdAt: new Date().toISOString(), createdBy: user };
      dispatch(createRecord({ collection: config.slice, record, module: config.key, label: config.singular }));
      onAfterSave?.(record);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const saveQuotationAndClose = (values, existingId) => {
    dispatch(saveQuotation(values, existingId || null));
    setFormOpen(false);
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    dispatch(deleteRecord({ collection: config.slice, id: deleting.id, module: config.key, label: config.singular }));
    setDeleting(null);
  };

  const canCreate = create(config.permission);
  const canEdit = edit(config.permission);
  const canDelete = remove(config.permission);

  const rowActions = (row) => (
    <>
      {detailEnabled ? <IconButton icon="Eye" label={`View ${row.id}`} size="sm" onClick={() => navigate(`${config.path}/${row.id}`)} /> : null}
      {canEdit ? <IconButton icon="Pencil" label={`Edit ${row.id}`} size="sm" onClick={() => openEdit(row)} /> : null}
      {extraRowActions ? extraRowActions(row) : null}
      {canDelete ? <IconButton icon="Trash2" label={`Delete ${row.id}`} size="sm" tone="danger" onClick={() => setDeleting(row)} /> : null}
    </>
  );

  const addButton = canCreate ? (
    <Button variant="primary" size={embedded ? 'sm' : 'md'} icon="Plus" onClick={openCreate}>Add {config.singular}</Button>
  ) : null;

  return (
    <div>
      {!embedded ? (
        <PageHeader
          title={titleOverride || config.title}
          description={subtitleOverride || config.description}
          breadcrumbs={[{ label: config.title }]}
          meta={<Badge tone="gray">{rows.length} records</Badge>}
          actions={(
            <>
              {extraHeaderActions}
              {addButton}
            </>
          )}
        >
          {summary}
        </PageHeader>
      ) : (
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="section-title">{titleOverride || config.title}</h3>
            <p className="text-[11px] text-ink-400 mt-0.5">{rows.length} records</p>
          </div>
          <div className="flex items-center gap-2">
            {extraHeaderActions}
            {addButton}
          </div>
        </div>
      )}

      <DataTable
        config={config}
        rows={rows}
        onRowClick={detailEnabled ? (row) => navigate(`${config.path}/${row.id}`) : undefined}
        actions={rowActions}
        toolbar={toolbarExtra}
        emptyAction={detailEnabled && canCreate ? addButton : undefined}
        pageSize={10}
      />

      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        title={editing ? `Edit ${config.singular} · ${editing.id}` : `Add ${config.singular}`}
        subtitle={config.formComponent === 'quotation' ? 'Build door line items; totals update automatically.' : `${config.title} details`}
        size={config.formComponent === 'quotation' ? '3xl' : config.fields.length > 10 ? 'xl' : 'lg'}
        icon={editing ? 'Pencil' : 'Plus'}
      >
        {config.formComponent === 'quotation' ? (
          <QuotationForm
            initial={editing || defaults}
            onSubmit={handleSubmit}
            onCancel={() => { setFormOpen(false); setEditing(null); }}
            submitLabel={editing ? `Save Version v${(editing.version || 1) + 1}` : 'Create Quotation'}
          />
        ) : (
          <EntityForm
            fields={config.fields}
            initialValues={editing || defaults}
            onSubmit={handleSubmit}
            onCancel={() => { setFormOpen(false); setEditing(null); }}
            submitLabel={editing ? 'Save changes' : `Create ${config.singular}`}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title={`Delete ${config.singular.toLowerCase()}?`}
        message={<>This will permanently remove <strong>{deleting?.id}</strong>{deleting?.name ? ` · ${deleting.name}` : ''} from the demo register. Linked records are kept for traceability.</>}
        confirmLabel="Delete record"
      />
    </div>
  );
}
