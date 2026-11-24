import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Icon from '../common/Icon';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/forms';
import useClickOutside from '../../hooks/useClickOutside';
import { formatDate } from '../../utils/format';

export default function GlobalSearch() {
  const navigate = useNavigate();
  const state = useSelector((s) => s);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const wrapRef = useRef(null);
  useClickOutside(wrapRef, () => setOpen(false), open);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const customerName = (id) => state.customers?.items.find((c) => c.id === id)?.name || '';
    const all = [
      {
        key: 'customers', label: 'Customers', path: '/customers',
        items: state.customers.items.map((c) => ({ id: c.id, title: c.name, subtitle: `${c.id} · ${c.city || ''}`, status: c.status, date: null })),
      },
      {
        key: 'leads', label: 'Leads', path: '/leads',
        items: state.leads.items.map((l) => ({ id: l.id, title: l.projectName, subtitle: `${l.customerName} · ${l.id}`, status: l.status, date: l.date })),
      },
      {
        key: 'quotations', label: 'Quotations', path: '/quotations',
        items: state.quotations.items.map((x) => ({ id: x.id, title: x.projectName, subtitle: `${x.id} · ${customerName(x.customerId)}`, status: x.status, date: x.date })),
      },
      {
        key: 'projects', label: 'Projects', path: '/projects',
        items: state.projects.items.map((p) => ({ id: p.id, title: p.name, subtitle: `${p.id} · ${p.location || ''}`, status: p.status, date: p.endDate })),
      },
      {
        key: 'salesOrders', label: 'Sales Orders', path: '/sales-orders',
        items: state.salesOrders.items.map((o) => ({ id: o.id, title: o.projectName, subtitle: `${o.id} · ${customerName(o.customerId)}`, status: o.status, date: o.date })),
      },
      {
        key: 'invoices', label: 'Invoices', path: '/accounts',
        items: state.invoices.items.map((i) => ({ id: i.id, title: i.id, subtitle: customerName(i.customerId), status: i.status, date: i.invoiceDate })),
      },
      {
        key: 'serviceTickets', label: 'Service Tickets', path: '/service',
        items: state.serviceTickets.items.map((t) => ({ id: t.id, title: t.complaintType, subtitle: `${t.id} · ${customerName(t.customerId)}`, status: t.status, date: t.complaintDate })),
      },
    ];
    return all
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          `${item.id} ${item.title} ${item.subtitle}`.toLowerCase().includes(q)
        ).slice(0, 4),
      }))
      .filter((g) => g.items.length);
  }, [query, state]);

  const total = groups.reduce((a, g) => a + g.items.length, 0);

  const go = (group, item) => {
    navigate(`${group.path}/${item.id}`);
    setOpen(false);
    setMobileOpen(false);
    setQuery('');
  };

  const results = (inModal = false) => (
    <div className={`${inModal ? '' : 'absolute left-0 right-0 top-full mt-2'} bg-white border border-ink-200 rounded-lg shadow-pop overflow-hidden animate-slideDown`}>
      <div className="max-h-[60vh] overflow-y-auto py-1">
        {!query.trim() || query.trim().length < 2 ? (
          <p className="px-4 py-6 text-[12px] text-ink-400 text-center">Type at least 2 characters to search customers, leads, quotations, projects, orders, invoices and tickets.</p>
        ) : !total ? (
          <p className="px-4 py-6 text-[12px] text-ink-400 text-center">No matches for “{query}”.</p>
        ) : groups.map((group) => (
          <div key={group.key} className="py-1">
            <p className="px-3 pt-1.5 pb-1 text-[9.5px] font-semibold uppercase tracking-wider text-ink-400">{group.label}</p>
            {group.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(group, item)}
                className="w-full text-left px-3 py-1.5 hover:bg-brand-50 flex items-center gap-2.5"
              >
                <span className="w-6 h-6 rounded bg-ink-100 text-ink-500 grid place-items-center shrink-0">
                  <Icon name="Search" className="w-3 h-3" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] text-ink-800 font-medium truncate">{item.title}</span>
                  <span className="block text-[10.5px] text-ink-400 truncate">{item.subtitle}{item.date ? ` · ${formatDate(item.date)}` : ''}</span>
                </span>
                <span className="text-[10px] text-ink-400 shrink-0">{item.id}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-ink-100 bg-ink-50/60 text-[10px] text-ink-400 flex items-center justify-between">
        <span>Global search across ERP records</span>
        <span className="font-mono">ESC</span>
      </div>
    </div>
  );

  return (
    <>
      <div ref={wrapRef} className="hidden md:block relative w-[240px] lg:w-[320px]">
        <div className="relative">
          <Icon name="Search" className="w-4 h-4 text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setOpen(false); e.currentTarget.blur(); }
              if (e.key === 'Enter' && groups[0]?.items[0]) go(groups[0], groups[0].items[0]);
            }}
            placeholder="Search everything…"
            className="w-full h-8.5 h-9 rounded-md border border-ink-200 bg-ink-50/60 pl-8 pr-12 text-[12.5px] placeholder:text-ink-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9.5px] text-ink-400 border border-ink-200 rounded px-1 py-0.5 bg-white">⌘K</span>
        </div>
        {open ? results(false) : null}
      </div>

      <button type="button" aria-label="Search" onClick={() => setMobileOpen(true)} className="md:hidden w-8 h-8 rounded-md grid place-items-center text-ink-500 hover:bg-ink-100">
        <Icon name="Search" className="w-4 h-4" />
      </button>

      <Modal open={mobileOpen} onClose={() => setMobileOpen(false)} title="Search" size="lg">
        <SearchInput value={query} onChange={setQuery} placeholder="Customers, leads, orders…" />
        <div className="mt-3">{results(true)}</div>
      </Modal>
    </>
  );
}
