import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MODULE_META } from '../data/masterData';
import { PageHeader, Badge, Button, EmptyState } from '../components/common/ui';
import { SearchInput, Select } from '../components/common/forms';
import Icon from '../components/common/Icon';
import { formatDateTime, downloadCSV } from '../utils/format';

const PAGE_SIZE = 20;

const moduleLabel = (key) => MODULE_META[key]?.label || (key === 'settings' ? 'Master settings' : key);

export default function ActivityPage() {
  const items = useSelector((s) => s.activities.items);
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [page, setPage] = useState(1);

  const modules = useMemo(() => [...new Set(items.map((a) => a.module))].sort(), [items]);
  const users = useMemo(() => [...new Set(items.map((a) => a.user))].sort(), [items]);

  const filtered = useMemo(() => items
    .filter((a) => moduleFilter === 'all' || a.module === moduleFilter)
    .filter((a) => userFilter === 'all' || a.user === userFilter)
    .filter((a) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return [a.action, a.detail, a.entityId, a.user, a.role, moduleLabel(a.module)].some((v) => String(v || '').toLowerCase().includes(q));
    })
    .sort((a, b) => (a.at < b.at ? 1 : -1)), [items, moduleFilter, userFilter, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const resetPage = (setter) => (value) => { setter(value); setPage(1); };

  const exportLog = () => downloadCSV('activity-log', filtered, [
    { label: 'Timestamp', value: (a) => a.at },
    { label: 'User', key: 'user' },
    { label: 'Role', key: 'role' },
    { label: 'Module', value: (a) => moduleLabel(a.module) },
    { label: 'Action', key: 'action' },
    { label: 'Detail', key: 'detail' },
    { label: 'Record', key: 'entityId' },
  ]);

  return (
    <div>
      <PageHeader
        title="Activity & Audit Log"
        description="Every workflow transition, edit and approval recorded across the ERP. Entries are generated automatically and stored with the demo state."
        breadcrumbs={[{ label: 'Activity Log' }]}
        meta={<Badge tone="dark">{items.length} events</Badge>}
        actions={<Button variant="secondary" icon="Download" onClick={exportLog}>Export CSV</Button>}
      />

      <div className="surface p-3 mb-3 flex flex-wrap items-center gap-2">
        <SearchInput value={query} onChange={resetPage(setQuery)} placeholder="Search action, detail, user or record…" className="w-full sm:w-[300px]" />
        <Select
          value={moduleFilter}
          onChange={(e) => resetPage(setModuleFilter)(e.target.value)}
          className="w-[170px]"
          options={[{ value: 'all', label: 'All modules' }, ...modules.map((m) => ({ value: m, label: moduleLabel(m) }))]}
        />
        <Select
          value={userFilter}
          onChange={(e) => resetPage(setUserFilter)(e.target.value)}
          className="w-[180px]"
          options={[{ value: 'all', label: 'All users' }, ...users.map((u) => ({ value: u, label: u }))]}
        />
        <span className="ml-auto text-[11px] text-ink-400">{filtered.length} matching events</span>
      </div>

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base min-w-[900px]">
            <thead>
              <tr><th className="w-[140px]">Timestamp</th><th>User / Role</th><th>Module</th><th>Action</th><th>Detail</th><th>Record</th></tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const meta = MODULE_META[a.module];
                return (
                  <tr key={a.id}>
                    <td className="text-[11px] text-ink-500 whitespace-nowrap">{formatDateTime(a.at)}</td>
                    <td>
                      <p className="text-[12px] font-medium text-ink-800">{a.user}</p>
                      <p className="text-[10px] text-ink-400 capitalize">{(a.role || '').replace(/_/g, ' ')}</p>
                    </td>
                    <td><Badge tone="gray">{moduleLabel(a.module)}</Badge></td>
                    <td className="text-[11.5px] text-ink-700 font-medium">{a.action}</td>
                    <td className="text-[11.5px] text-ink-500 max-w-[320px]">{a.detail}</td>
                    <td className="text-[11px] font-mono">
                      {meta && a.entityId && a.module !== 'settings'
                        ? <Link to={`${meta.path}/${a.entityId}`} className="text-brand-700 hover:underline">{a.entityId}</Link>
                        : <span className="text-ink-400">{a.entityId || '—'}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!rows.length ? <EmptyState icon="History" title="No matching activity" description="Adjust the filters or complete a workflow action to generate audit entries." /> : null}
        <div className="px-4 py-2.5 border-t border-ink-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-500">
          <span>Showing {filtered.length ? (current - 1) * PAGE_SIZE + 1 : 0}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length} events</span>
          <div className="flex items-center gap-1.5">
            <Button size="xs" variant="secondary" icon="ChevronLeft" disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</Button>
            <span className="px-2 tabular-nums">Page {current} / {pageCount}</span>
            <Button size="xs" variant="secondary" iconRight="ChevronRight" disabled={current === pageCount} onClick={() => setPage(current + 1)}>Next</Button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 text-[11px] text-ink-400">
        <Icon name="Info" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <p>Audit entries include quote approvals, dispatch confirmations, installation sign-offs, payments and master-data changes. Click a record ID to open the linked record.</p>
      </div>
    </div>
  );
}
