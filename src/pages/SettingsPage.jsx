import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ROLE_LIST, ROLES, MASTER_GROUPS, COMPANY, moduleLevel, NAV_SECTIONS } from '../data/masterData';
import { mastersSlice, addActivity } from '../features/admin/adminSlice';
import { addToast } from '../features/ui/uiSlice';
import { createRecord, updateRecord, deleteRecord } from '../features/workflow/workflowThunks';
import { resetDemoData } from '../app/store';
import { usePermissions } from '../hooks/usePermissions';
import { Badge, Button, IconButton, PageHeader, SectionCard, Tabs, Avatar, EmptyState } from '../components/common/ui';
import { Modal, ConfirmDialog } from '../components/common/Modal';
import { EntityForm, SearchInput } from '../components/common/forms';
import Icon from '../components/common/Icon';
import { nextId } from '../utils/format';

const MODULE_ROWS = [
  ...NAV_SECTIONS.flatMap((s) => s.items).map((i) => ({ key: i.key, label: i.label })),
  { key: 'settings', label: 'Master settings' },
  { key: 'activity', label: 'Activity log' },
];

const LEVEL_LABEL = { 0: '—', 1: 'View', 2: 'Edit', 3: 'Full' };
const LEVEL_TONE = { 0: 'gray', 1: 'blue', 2: 'amber', 3: 'green' };

const EMPLOYEE_FIELDS = [
  { name: 'name', label: 'Full name', required: true, section: 'Employee' },
  { name: 'role', label: 'Role', type: 'select', options: [...ROLE_LIST.map((r) => ({ value: r.key, label: r.label })), { value: 'worker', label: 'Worker / Staff' }], required: true, section: 'Employee' },
  { name: 'department', label: 'Department', type: 'select', master: 'departments', section: 'Employee' },
  { name: 'designation', label: 'Designation', section: 'Employee' },
  { name: 'phone', label: 'Phone', section: 'Contact' },
  { name: 'email', label: 'Email', type: 'email', section: 'Contact' },
  { name: 'location', label: 'Location', section: 'Contact' },
  { name: 'active', label: 'Active employee', type: 'checkbox', section: 'Status' },
];

export default function SettingsPage() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s);
  const { user } = usePermissions();
  const [tab, setTab] = useState('masters');
  const [group, setGroup] = useState('doorCategories');
  const [masterSearch, setMasterSearch] = useState('');
  const [masterModal, setMasterModal] = useState(null);
  const [masterDelete, setMasterDelete] = useState(null);
  const [employeeModal, setEmployeeModal] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);

  const groupConfig = MASTER_GROUPS.find((g) => g.key === group);
  const masterList = useMemo(() => (state.masters[group] || []).filter((m) => m.name.toLowerCase().includes(masterSearch.toLowerCase())), [state.masters, group, masterSearch]);
  const totalMasters = MASTER_GROUPS.reduce((a, g) => a + (state.masters[g.key]?.length || 0), 0);

  const logAdmin = (action, detail) => dispatch(addActivity({ user, role: 'super_admin', module: 'settings', entityType: 'masters', entityId: group, action, detail }));

  const saveMaster = (values) => {
    if (masterModal?.record) {
      dispatch(mastersSlice.actions.updateMaster({ group, id: masterModal.record.id, changes: { name: values.name } }));
      logAdmin('Master record updated', `${values.name} updated in ${groupConfig.label}.`);
    } else {
      dispatch(mastersSlice.actions.addMaster({ group, record: { name: values.name } }));
      logAdmin('Master record added', `${values.name} added to ${groupConfig.label}.`);
    }
    dispatch(addToast({ type: 'success', title: 'Master saved', message: `${values.name} saved to ${groupConfig.label}.` }));
    setMasterModal(null);
  };

  const toggleMaster = (record) => {
    dispatch(mastersSlice.actions.toggleMaster({ group, id: record.id }));
    logAdmin('Master status changed', `${record.name} ${record.active ? 'deactivated' : 'activated'}.`);
    dispatch(addToast({ type: 'success', title: record.active ? 'Master deactivated' : 'Master activated', message: record.name }));
  };

  const confirmMasterDelete = () => {
    if (!masterDelete) return;
    dispatch(mastersSlice.actions.removeMaster({ group, id: masterDelete.id }));
    logAdmin('Master record removed', `${masterDelete.name} removed from ${groupConfig.label}.`);
    dispatch(addToast({ type: 'success', title: 'Master removed', message: masterDelete.name }));
    setMasterDelete(null);
  };

  const saveEmployee = (values) => {
    if (employeeModal?.record) {
      dispatch(updateRecord({ collection: 'employees', id: employeeModal.record.id, changes: values, module: 'settings', label: 'Employee' }));
    } else {
      const id = nextId('EMP-', state.employees.items, 100);
      dispatch(createRecord({ collection: 'employees', module: 'settings', label: 'Employee', record: { ...values, id, joinedOn: values.joinedOn || new Date().toISOString().slice(0, 10) } }));
    }
    setEmployeeModal(null);
  };

  const toggleUser = (u) => {
    dispatch(updateRecord({ collection: 'users', id: u.id, changes: { active: !u.active }, module: 'settings', label: 'User', silent: true }));
    dispatch(addToast({ type: 'info', title: 'User updated', message: `${u.name} is now ${u.active ? 'disabled' : 'active'}.` }));
  };

  const toggleEmployee = (emp) => {
    dispatch(updateRecord({ collection: 'employees', id: emp.id, changes: { active: !emp.active }, module: 'settings', label: 'Employee', silent: true }));
    dispatch(addToast({ type: 'info', title: 'Employee updated', message: `${emp.name} ${emp.active ? 'deactivated' : 'activated'}.` }));
  };

  return (
    <div>
      <PageHeader
        title="Master Settings & Administration"
        description="Central masters, employees, users, roles and permissions that drive every dropdown and workflow."
        breadcrumbs={[{ label: 'Master Settings' }]}
        meta={<Badge tone="dark">Super Admin</Badge>}
        actions={<Button variant="secondary" icon="RotateCcw" onClick={() => setResetOpen(true)}>Reset demo data</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Master records', value: totalMasters, icon: 'Layers', helper: `${MASTER_GROUPS.length} master groups` },
          { label: 'Employees', value: state.employees.items.length, icon: 'Users', helper: `${state.employees.items.filter((e) => e.active).length} active` },
          { label: 'Portal users', value: state.users.items.length, icon: 'User', helper: `${ROLE_LIST.length} roles configured` },
          { label: 'Activity entries', value: state.activities.items.length, icon: 'History', helper: 'Audit trail retained' },
        ].map((kpi) => (
          <div key={kpi.label} className="surface p-4 flex items-start justify-between gap-2">
            <div><p className="text-[10.5px] uppercase tracking-wide text-ink-500">{kpi.label}</p><p className="text-[22px] font-semibold text-ink-900 mt-1 tabular-nums">{kpi.value}</p><p className="text-[10.5px] text-ink-400 mt-1">{kpi.helper}</p></div>
            <span className="w-8 h-8 rounded bg-ink-100 text-ink-500 grid place-items-center"><Icon name={kpi.icon} className="w-4 h-4" /></span>
          </div>
        ))}
      </div>

      <div className="surface overflow-hidden">
        <div className="px-4">
          <Tabs
            tabs={[
              { key: 'masters', label: 'Master Data', count: totalMasters },
              { key: 'employees', label: 'Employees', count: state.employees.items.length },
              { key: 'users', label: 'Users & Roles', count: state.users.items.length },
              { key: 'company', label: 'Company & Demo' },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        <div className="p-4">
          {tab === 'masters' ? (
            <div className="grid lg:grid-cols-[240px_1fr] gap-4">
              <div className="border border-ink-200 rounded-md overflow-hidden h-fit max-h-[560px] overflow-y-auto">
                {MASTER_GROUPS.map((g) => {
                  const count = state.masters[g.key]?.length || 0;
                  return (
                    <button key={g.key} type="button" onClick={() => { setGroup(g.key); setMasterSearch(''); }} className={`w-full text-left px-3 py-2 text-[12px] flex items-center justify-between gap-2 border-b border-ink-100 last:border-0 ${group === g.key ? 'bg-brand-50 text-brand-900 font-medium' : 'text-ink-600 hover:bg-ink-50'}`}>
                      <span className="truncate">{g.label}</span><span className="text-[10px] text-ink-400">{count}</span>
                    </button>
                  );
                })}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="min-w-0">
                    <h3 className="section-title">{groupConfig?.label}</h3>
                    <p className="text-[11px] text-ink-400">Dropdown values used across the ERP</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <SearchInput value={masterSearch} onChange={setMasterSearch} placeholder="Find master…" className="w-[180px]" />
                    <Button size="sm" variant="primary" icon="Plus" onClick={() => setMasterModal({ record: null })}>Add</Button>
                  </div>
                </div>
                <div className="border border-ink-200 rounded-md overflow-hidden">
                  <table className="table-base">
                    <thead><tr><th>Name</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                    <tbody>
                      {masterList.map((m) => (
                        <tr key={m.id}>
                          <td className="font-medium text-ink-800">{m.name}<span className="block text-[10px] text-ink-400 font-mono">{m.id}</span></td>
                          <td><Badge tone={m.active ? 'green' : 'gray'} dot>{m.active ? 'Active' : 'Inactive'}</Badge></td>
                          <td className="text-right">
                            <div className="inline-flex items-center gap-1">
                              <IconButton icon="Pencil" label="Edit" size="sm" onClick={() => setMasterModal({ record: m })} />
                              <IconButton icon={m.active ? 'Pause' : 'Play'} label={m.active ? 'Deactivate' : 'Activate'} size="sm" tone={m.active ? 'default' : 'brand'} onClick={() => toggleMaster(m)} />
                              <IconButton icon="Trash2" label="Delete" size="sm" tone="danger" onClick={() => setMasterDelete(m)} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!masterList.length ? <EmptyState icon="Layers" title="No master values" description="Add the first value for this master group." /> : null}
                </div>
              </div>
            </div>
          ) : null}

          {tab === 'employees' ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div><h3 className="section-title">Employee register</h3><p className="text-[11px] text-ink-400">People available for assignment across modules</p></div>
                <Button size="sm" variant="primary" icon="Plus" onClick={() => setEmployeeModal({ record: null })}>Add employee</Button>
              </div>
              <div className="border border-ink-200 rounded-md overflow-hidden overflow-x-auto">
                <table className="table-base">
                  <thead><tr><th>Employee</th><th>Role</th><th>Department</th><th>Contact</th><th>Location</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                  <tbody>
                    {state.employees.items.map((emp) => (
                      <tr key={emp.id}>
                        <td><div className="flex items-center gap-2"><Avatar name={emp.name} size="sm" /><div><p className="font-medium text-ink-800 text-[12px]">{emp.name}</p><p className="text-[10px] text-ink-400">{emp.id} · {emp.designation}</p></div></div></td>
                        <td><Badge tone={ROLES[emp.role]?.tone || 'gray'}>{ROLES[emp.role]?.label || 'Staff'}</Badge></td>
                        <td className="text-[11.5px]">{emp.department}</td>
                        <td className="text-[11px]"><span className="block">{emp.phone}</span><span className="text-ink-400">{emp.email}</span></td>
                        <td className="text-[11.5px]">{emp.location}</td>
                        <td><Badge tone={emp.active ? 'green' : 'gray'}>{emp.active ? 'Active' : 'Inactive'}</Badge></td>
                        <td className="text-right"><div className="inline-flex gap-1">
                          <IconButton icon="Pencil" label="Edit employee" size="sm" onClick={() => setEmployeeModal({ record: emp })} />
                          <IconButton icon={emp.active ? 'Pause' : 'Play'} label="Toggle status" size="sm" onClick={() => toggleEmployee(emp)} />
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {tab === 'users' ? (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div><h3 className="section-title">Portal users</h3><p className="text-[11px] text-ink-400">Demo accounts mapped to employees and roles</p></div>
                </div>
                <div className="border border-ink-200 rounded-md overflow-hidden overflow-x-auto">
                  <table className="table-base">
                    <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th className="text-right">Action</th></tr></thead>
                    <tbody>
                      {state.users.items.map((u) => (
                        <tr key={u.id}>
                          <td><div className="flex items-center gap-2"><Avatar name={u.name} size="sm" /><div><p className="font-medium text-ink-800 text-[12px]">{u.name}</p><p className="text-[10px] text-ink-400 font-mono">{u.id}</p></div></div></td>
                          <td className="text-[11.5px]">{u.email}</td>
                          <td><Badge tone={ROLES[u.role]?.tone || 'gray'}>{ROLES[u.role]?.label || 'Staff'}</Badge></td>
                          <td className="text-[11.5px]">{u.department}</td>
                          <td><Badge tone={u.active ? 'green' : 'gray'}>{u.active ? 'Active' : 'Disabled'}</Badge></td>
                          <td className="text-right"><Button size="xs" variant="secondary" onClick={() => toggleUser(u)}>{u.active ? 'Disable' : 'Enable'}</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="mb-2"><h3 className="section-title">Roles & permission matrix</h3><p className="text-[11px] text-ink-400">Module access levels enforced by the demo role switcher — view, edit or full control.</p></div>
                <div className="border border-ink-200 rounded-md overflow-x-auto">
                  <table className="text-[11px] min-w-[1100px] w-full">
                    <thead>
                      <tr className="bg-ink-50">
                        <th className="text-left px-3 py-2 font-semibold text-ink-500 text-[10px] uppercase tracking-wider sticky left-0 bg-ink-50 border-r border-ink-200">Module</th>
                        {ROLE_LIST.map((r) => <th key={r.key} className="text-center px-2 py-2 font-semibold text-ink-500 text-[10px] whitespace-nowrap">{r.short}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {MODULE_ROWS.map((mod) => (
                        <tr key={mod.key} className="border-t border-ink-100">
                          <td className="px-3 py-1.5 text-ink-700 font-medium sticky left-0 bg-white border-r border-ink-200 whitespace-nowrap">{mod.label}</td>
                          {ROLE_LIST.map((r) => {
                            const level = moduleLevel(r.key, mod.key);
                            return <td key={r.key} className="px-2 py-1.5 text-center"><span className={`inline-block min-w-[36px] text-[9.5px] px-1.5 py-0.5 rounded border ${level === 3 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : level === 2 ? 'bg-amber-50 text-amber-700 border-amber-200' : level === 1 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-ink-50 text-ink-300 border-ink-200'}`}>{LEVEL_LABEL[level]}</span></td>;
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-ink-400 mt-1.5">Full = create, edit, delete. Edit = create & update. View = read only. — = no access. Approval rights are assigned separately by workflow stage.</p>
              </div>
            </div>
          ) : null}

          {tab === 'company' ? (
            <div className="grid lg:grid-cols-2 gap-4">
              <SectionCard title="Company profile" icon="Building2">
                <div className="space-y-2.5 text-[12px]">
                  {[['Legal name', COMPANY.legalName], ['Brand', COMPANY.name], ['GSTIN', COMPANY.gstin], ['Phone', COMPANY.phone], ['Email', COMPANY.email], ['Website', COMPANY.website], ['Address', COMPANY.address], ['Bank', COMPANY.bank]].map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[100px_1fr] gap-2"><span className="text-ink-400 text-[10.5px] uppercase tracking-wide pt-0.5">{label}</span><span className="text-ink-800">{value}</span></div>
                  ))}
                </div>
              </SectionCard>
              <SectionCard title="Demo data & persistence" icon="Save">
                <div className="space-y-3 text-[12px]">
                  <p className="text-ink-500">All CRUD actions are stored in Redux and persisted to this browser's localStorage. Refreshing keeps your changes; resetting restores the original seeded demonstration dataset.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[['Customers', state.customers.items.length], ['Leads', state.leads.items.length], ['Quotations', state.quotations.items.length], ['Projects', state.projects.items.length], ['Doors', state.projects.items.reduce((a, p) => a + p.doors.length, 0)], ['Production orders', state.production.items.length], ['Invoices', state.invoices.items.length], ['Service tickets', state.serviceTickets.items.length]].map(([label, value]) => (
                      <div key={label} className="rounded border border-ink-200 bg-ink-50/60 px-2.5 py-2 flex items-center justify-between"><span className="text-ink-500">{label}</span><span className="font-semibold text-ink-800 tabular-nums">{value}</span></div>
                    ))}
                  </div>
                  <div className="rounded border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800 flex gap-2"><Icon name="Info" className="w-3.5 h-3.5 shrink-0 mt-0.5" />This is a local demonstration environment. No server, database or production credentials are used.</div>
                  <Button variant="outlineDanger" icon="RotateCcw" onClick={() => setResetOpen(true)}>Reset all demo data</Button>
                </div>
              </SectionCard>
            </div>
          ) : null}
        </div>
      </div>

      <Modal open={!!masterModal} onClose={() => setMasterModal(null)} title={masterModal?.record ? `Edit ${groupConfig?.singular}` : `Add ${groupConfig?.singular}`} size="sm" icon="Layers">
        <EntityForm
          fields={[
            { name: 'name', label: `${groupConfig?.singular} name`, required: true, full: true, section: groupConfig?.label },
            { name: 'note', label: 'Note (optional)', full: true, section: groupConfig?.label },
          ]}
          initialValues={masterModal?.record || { name: '', note: '' }}
          onSubmit={saveMaster}
          onCancel={() => setMasterModal(null)}
          submitLabel="Save master"
        />
      </Modal>

      <Modal open={!!employeeModal} onClose={() => setEmployeeModal(null)} title={employeeModal?.record ? `Edit employee · ${employeeModal.record.id}` : 'Add employee'} size="lg" icon="Users">
        <EntityForm fields={EMPLOYEE_FIELDS} initialValues={employeeModal?.record || { role: 'worker', active: true, department: 'Production' }} onSubmit={saveEmployee} onCancel={() => setEmployeeModal(null)} submitLabel={employeeModal?.record ? 'Save employee' : 'Add employee'} />
      </Modal>

      <ConfirmDialog open={!!masterDelete} onClose={() => setMasterDelete(null)} onConfirm={confirmMasterDelete} title="Delete master record?" message={<>Remove <strong>{masterDelete?.name}</strong> from {groupConfig?.label}? Existing records keep their stored values.</>} confirmLabel="Delete master" />

      <ConfirmDialog open={resetOpen} onClose={() => setResetOpen(false)} onConfirm={() => { setResetOpen(false); resetDemoData(); }} title="Reset demo data?" message="All locally saved changes, added records and workflow updates will be discarded and the original demonstration dataset will be loaded." confirmLabel="Reset and reload" icon="RotateCcw" />
    </div>
  );
}
