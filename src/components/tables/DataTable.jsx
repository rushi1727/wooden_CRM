import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Icon from '../common/Icon';
import { Badge, EmptyState, ProgressBar, StatusBadge, ProductSwatch, Button, IconButton } from '../common/ui';
import { SearchInput } from '../common/forms';
import { resolveFieldOptions, resolveLookupLabel } from '../../utils/options';
import { downloadCSV, formatDate, inr, isOverdue, todayISO } from '../../utils/format';

const alignClass = (align) => (align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left');

const getValue = (row, col, state) => {
  if (typeof col.value === 'function') return col.value(row, state);
  if (col.lookup) return resolveLookupLabel(col.lookup, row[col.key], state);
  return row[col.key];
};

export default function DataTable({
  config, rows = [], pageSize = 10, onRowClick, actions, toolbar, emptyAction,
  hideSearch = false, compact = false, footerNote,
}) {
  const state = useSelector((s) => s);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);

  const filterDefs = config.filters || [];
  const filterOptions = useMemo(() => filterDefs.map((f) => resolveFieldOptions(f, state)), [filterDefs, state]);

  const searchKeys = config.searchKeys || ['id'];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = rows.filter((row) => {
      if (term) {
        const hit = searchKeys.some((key) => {
          const v = key.split('.').reduce((a, k) => (a == null ? a : a[k]), row);
          return String(v ?? '').toLowerCase().includes(term);
        });
        if (!hit) return false;
      }
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return String(row[key] ?? '') === String(value);
      });
    });
    if (sort.key) {
      const col = config.columns.find((c) => c.key === sort.key);
      list = [...list].sort((a, b) => {
        const av = col ? getValue(a, col, state) : a[sort.key];
        const bv = col ? getValue(b, col, state) : b[sort.key];
        const an = typeof av === 'number' ? av : String(av ?? '').toLowerCase();
        const bn = typeof bv === 'number' ? bv : String(bv ?? '').toLowerCase();
        if (an < bn) return sort.dir === 'asc' ? -1 : 1;
        if (an > bn) return sort.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [rows, search, filters, sort, config.columns, state, searchKeys]);

  useEffect(() => { setPage(1); }, [search, filters, size]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * size;
  const pageRows = filtered.slice(start, start + size);

  const toggleSort = (key) => {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  };

  const handleExport = () => {
    const cols = config.columns.map((c) => ({
      label: c.label,
      value: (row) => {
        const v = getValue(row, c, state);
        if (c.type === 'currency') return Math.round(Number(v) || 0);
        if (c.type === 'progress') return `${v}%`;
        if (c.type === 'date') return v || '';
        return v ?? '';
      },
    }));
    downloadCSV(config.key, filtered, cols);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const renderCell = (row, col) => {
    const value = getValue(row, col, state);
    switch (col.type) {
      case 'id':
        return <span className="font-mono text-[11.5px] text-ink-500 whitespace-nowrap">{value || '—'}</span>;
      case 'primary':
        return (
          <div className="min-w-0">
            <span className="font-medium text-ink-900 block truncate max-w-[260px]">{value || '—'}</span>
            {col.subKey ? <span className="text-[11.5px] text-ink-400 block truncate max-w-[260px]">{typeof col.subKey === 'function' ? col.subKey(row) : resolveLookupLabel(col.subLookup, row[col.subKey], state) || row[col.subKey]}</span> : null}
          </div>
        );
      case 'product':
        return (
          <div className="flex items-center gap-2.5">
            <ProductSwatch tone={row.tone} size="sm" />
            <div className="min-w-0">
              <span className="font-medium text-ink-900 block truncate max-w-[220px]">{row.name}</span>
              <span className="text-[11px] text-ink-400 block">{row.model || row.id}</span>
            </div>
          </div>
        );
      case 'badge':
        return <StatusBadge status={value} />;
      case 'currency':
        return <span className="tabular-nums whitespace-nowrap">{inr(value)}</span>;
      case 'number':
        return <span className="tabular-nums">{Number(value) || 0}</span>;
      case 'date': {
        const late = col.overdueKey && value && String(value) < todayISO();
        return <span className={`whitespace-nowrap ${late ? 'text-rose-600 font-medium' : ''}`}>{formatDate(value)}</span>;
      }
      case 'progress':
        return (
          <div className="flex items-center gap-2 min-w-[110px]">
            <div className="flex-1"><ProgressBar value={value} size="sm" tone={value >= 100 ? 'green' : value >= 60 ? 'brand' : value >= 30 ? 'amber' : 'blue'} /></div>
            <span className="text-[11px] tabular-nums text-ink-500 w-8 text-right">{value}%</span>
          </div>
        );
      case 'link':
        return <span className="link">{value}</span>;
      default:
        return <span className="block truncate max-w-[240px]">{value === '' || value === null || value === undefined ? '—' : value}</span>;
    }
  };

  return (
    <div className="surface overflow-hidden">
      {(filterDefs.length > 0 || !hideSearch || toolbar) && (
        <div className="px-4 py-3 border-b border-ink-100 flex flex-wrap items-center gap-2">
          {!hideSearch ? (
            <SearchInput value={search} onChange={setSearch} placeholder={config.searchPlaceholder || 'Search…'} className="w-full sm:w-[280px]" />
          ) : null}
          {filterDefs.map((f, i) => (
            <select
              key={f.key}
              value={filters[f.key] || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, [f.key]: e.target.value }))}
              className={`h-9 rounded-md border bg-white px-2.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 max-w-[180px] ${filters[f.key] ? 'border-brand-400 text-brand-800' : 'border-ink-200 text-ink-600'}`}
              aria-label={`Filter by ${f.label}`}
            >
              <option value="">All {f.label}</option>
              {filterOptions[i].map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          ))}
          {activeFilterCount > 0 ? (
            <button type="button" onClick={() => setFilters({})} className="text-[11.5px] text-brand-700 hover:underline inline-flex items-center gap-1">
              <Icon name="X" className="w-3 h-3" /> Clear
            </button>
          ) : null}
          <div className="flex-1" />
          {toolbar}
          <Button variant="secondary" size="sm" icon="Download" onClick={handleExport} title="Export filtered rows to CSV">Export</Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              {config.columns.map((col) => (
                <th key={col.key} className={alignClass(col.align)}>
                  <button type="button" onClick={() => toggleSort(col.key)} className="inline-flex items-center gap-1 hover:text-ink-800 uppercase">
                    {col.label}
                    <Icon
                      name={sort.key === col.key ? (sort.dir === 'asc' ? 'ArrowUp' : 'ArrowDown') : 'ArrowUpDown'}
                      className={`w-3 h-3 ${sort.key === col.key ? 'text-brand-600' : 'text-ink-300'}`}
                    />
                  </button>
                </th>
              ))}
              {actions ? <th className="text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {config.columns.map((col) => (
                  <td key={col.key} className={`${alignClass(col.align)} ${compact ? 'py-2' : ''}`}>
                    {renderCell(row, col)}
                  </td>
                ))}
                {actions ? (
                  <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">{actions(row)}</div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!pageRows.length ? (
        <EmptyState
          icon={config.icon || 'FolderOpen'}
          title={`No ${config.title.toLowerCase()} found`}
          description={search || activeFilterCount ? 'Try adjusting your search or filters.' : `No records yet. ${config.singular ? `Add your first ${config.singular.toLowerCase()}.` : ''}`}
          action={emptyAction}
        />
      ) : (
        <div className="px-4 py-2.5 border-t border-ink-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[11.5px] text-ink-500">
            <span>Showing <strong className="text-ink-700">{start + 1}–{Math.min(start + size, filtered.length)}</strong> of <strong className="text-ink-700">{filtered.length}</strong></span>
            {activeFilterCount > 0 || search ? <Badge tone="brand">{activeFilterCount + (search ? 1 : 0)} active</Badge> : null}
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="h-7 rounded border border-ink-200 bg-white px-1.5 text-[11px] text-ink-600"
              aria-label="Rows per page"
            >
              {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <IconButton icon="ChevronLeft" label="Previous page" size="sm" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} />
            {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
              let num = i + 1;
              if (pageCount > 5) {
                if (currentPage > 3) num = currentPage - 2 + i;
                if (num > pageCount) num = pageCount - 4 + i;
              }
              const disabled = num < 1 || num > pageCount;
              if (disabled) return null;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPage(num)}
                  className={`w-7 h-7 rounded text-[11.5px] font-medium ${num === currentPage ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100'}`}
                >
                  {num}
                </button>
              );
            })}
            <IconButton icon="ChevronRight" label="Next page" size="sm" disabled={currentPage === pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} />
          </div>
        </div>
      )}
      {footerNote ? <div className="px-4 py-2 border-t border-ink-100 text-[11px] text-ink-400">{footerNote}</div> : null}
    </div>
  );
}
