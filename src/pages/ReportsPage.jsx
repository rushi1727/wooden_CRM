import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROLES } from '../data/masterData';
import { useDashboardMetrics } from '../features/dashboard/metrics';
import { PageHeader, Badge, Button, SectionCard, ProgressBar } from '../components/common/ui';
import { ChartWidget } from '../components/dashboard/DashboardWidgets';
import Icon from '../components/common/Icon';
import { inr, num, downloadCSV, sumBy } from '../utils/format';
import { invoiceTotals, invoiceStatus, projectProgress, pipelineCollections, materialAvailable } from '../utils/calc';

const CHART_TITLES = ['revenueTrend', 'productionOutput', 'leadFunnel', 'projectStatus', 'invoiceStatus', 'installationStatus'];

export default function ReportsPage() {
  const state = useSelector((s) => s);
  const metrics = useDashboardMetrics({ key: 'all' });
  const collections = useMemo(() => pipelineCollections(state), [state]);

  const projectRows = useMemo(() => state.projects.items.map((p) => {
    const order = state.salesOrders.items.find((o) => o.projectId === p.id) || state.salesOrders.items.find((o) => o.id === p.salesOrderId);
    const value = Number(order?.value) || Number(p.budget) || 0;
    const invs = state.invoices.items.filter((i) => i.projectId === p.id && i.status !== 'Draft');
    const invoiced = sumBy(invs, (i) => invoiceTotals(i).total);
    const collected = sumBy(invs, (i) => invoiceTotals(i).received);
    return {
      ...p,
      customer: state.customers.items.find((c) => c.id === p.customerId)?.name || '—',
      orderValue: value,
      invoiced,
      collected,
      outstanding: Math.max(0, invoiced - collected),
      progress: projectProgress(p, collections),
      collectionPct: invoiced ? Math.min(100, Math.round((collected / invoiced) * 100)) : 0,
    };
  }), [state.projects.items, state.salesOrders.items, state.invoices.items, state.customers.items, collections]);

  const salesRows = useMemo(() => state.employees.items
    .filter((e) => e.role === 'sales')
    .map((emp) => {
      const leads = state.leads.items.filter((l) => l.salesExecutive === emp.name);
      const quotes = state.quotations.items.filter((q) => q.salesExecutive === emp.name);
      const orders = state.salesOrders.items.filter((o) => o.salesExecutive === emp.name);
      return {
        ...emp,
        leads: leads.length,
        won: leads.filter((l) => l.status === 'Won').length,
        quotes: quotes.length,
        quoteValue: sumBy(quotes, (q) => q.total || q.grandTotal || 0),
        orders: orders.length,
        orderValue: sumBy(orders, (o) => o.value || 0),
      };
    })
    .sort((a, b) => b.orderValue - a.orderValue), [state.employees.items, state.leads.items, state.quotations.items, state.salesOrders.items]);

  const stockRows = useMemo(() => state.materials.items.map((m) => ({
    ...m,
    available: materialAvailable(m),
    stockValue: materialAvailable(m) * (Number(m.unitCost) || 0),
  })), [state.materials.items]);

  const stockByCategory = useMemo(() => Object.values(stockRows.reduce((acc, m) => {
    const key = m.category || 'Other';
    acc[key] = acc[key] || { category: key, items: 0, value: 0 };
    acc[key].items += 1;
    acc[key].value += m.stockValue;
    return acc;
  }, {})), [stockRows]);

  const finance = useMemo(() => {
    const invs = state.invoices.items.filter((i) => i.status !== 'Draft');
    const totals = invs.reduce((acc, i) => {
      const t = invoiceTotals(i);
      acc.invoiced += t.total;
      acc.collected += t.received;
      acc.outstanding += t.outstanding;
      if (invoiceStatus(i) === 'Overdue') acc.overdue += t.outstanding;
      return acc;
    }, { invoiced: 0, collected: 0, outstanding: 0, overdue: 0 });
    return { ...totals, count: invs.length, stockValue: sumBy(stockRows, (m) => m.stockValue) };
  }, [state.invoices.items, stockRows]);

  const totalDoors = state.projects.items.reduce((a, p) => a + p.doors.length, 0);
  const wonLeads = state.leads.items.filter((l) => l.status === 'Won').length;
  const conversion = state.leads.items.length ? Math.round((wonLeads / state.leads.items.length) * 100) : 0;

  const exportProjects = () => downloadCSV('project-profitability', projectRows, [
    { label: 'Project', key: 'id' }, { label: 'Name', key: 'name' }, { label: 'Customer', key: 'customer' },
    { label: 'Status', key: 'status' }, { label: 'Order value', key: 'orderValue' }, { label: 'Invoiced', key: 'invoiced' },
    { label: 'Collected', key: 'collected' }, { label: 'Outstanding', key: 'outstanding' }, { label: 'Progress %', key: 'progress' },
  ]);

  const exportSales = () => downloadCSV('sales-performance', salesRows, [
    { label: 'Executive', key: 'name' }, { label: 'Leads', key: 'leads' }, { label: 'Won', key: 'won' },
    { label: 'Quotations', key: 'quotes' }, { label: 'Order value', key: 'orderValue' },
  ]);

  const exportStock = () => downloadCSV('stock-valuation', stockRows, [
    { label: 'Material', key: 'name' }, { label: 'Category', key: 'category' }, { label: 'Available', key: 'available' },
    { label: 'Unit', key: 'unit' }, { label: 'Unit cost', key: 'unitCost' }, { label: 'Stock value', key: 'stockValue' },
  ]);

  return (
    <div>
      <PageHeader
        title="Operational & Financial Reports"
        description="Company-wide performance analytics generated live from the demo dataset — sales, plant throughput, project profitability, receivables and inventory valuation."
        breadcrumbs={[{ label: 'Reports' }]}
        meta={<Badge tone="brand">Live from Redux</Badge>}
        actions={<Button variant="secondary" icon="Download" onClick={exportProjects}>Export project report</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 mb-5">
        {[
          { label: 'Invoiced', value: inr(finance.invoiced, { compact: true }), helper: `${finance.count} live invoices`, icon: 'ReceiptText' },
          { label: 'Collected', value: inr(finance.collected, { compact: true }), helper: 'Payments received', icon: 'Wallet' },
          { label: 'Outstanding', value: inr(finance.outstanding, { compact: true }), helper: `${inr(finance.overdue, { compact: true })} overdue`, icon: 'AlertCircle' },
          { label: 'Stock value', value: inr(finance.stockValue, { compact: true }), helper: `${state.materials.items.length} materials`, icon: 'Boxes' },
          { label: 'Doors delivered', value: num(state.projects.items.filter((p) => p.status === 'Completed').reduce((a, p) => a + p.doors.length, 0)), helper: `of ${totalDoors} total doors`, icon: 'DoorOpen' },
          { label: 'Lead conversion', value: `${conversion}%`, helper: `${wonLeads} won of ${state.leads.items.length}`, icon: 'Target' },
        ].map((k) => (
          <div key={k.label} className="surface p-3.5">
            <div className="flex items-start justify-between gap-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">{k.label}</p>
              <Icon name={k.icon} className="w-3.5 h-3.5 text-brand-600" />
            </div>
            <p className="text-[18px] font-semibold text-ink-900 mt-1 tabular-nums">{k.value}</p>
            <p className="text-[10px] text-ink-400 mt-0.5">{k.helper}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {CHART_TITLES.filter((k) => metrics.charts[k]).map((key) => <ChartWidget key={key} chartKey={key} charts={metrics.charts} />)}
      </div>

      <SectionCard
        className="mb-4"
        title="Project profitability & collections"
        subtitle="Order value, billing, receipts and delivery progress per project"
        icon="FolderKanban"
        action={<Button size="xs" variant="secondary" icon="Download" onClick={exportProjects}>CSV</Button>}
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="table-base min-w-[980px]">
            <thead>
              <tr><th>Project</th><th>Customer</th><th>Status</th><th className="text-right">Order value</th><th className="text-right">Invoiced</th><th className="text-right">Collected</th><th className="text-right">Outstanding</th><th className="w-[170px]">Delivery</th></tr>
            </thead>
            <tbody>
              {projectRows.map((p) => (
                <tr key={p.id}>
                  <td><Link to={`/projects/${p.id}`} className="font-medium text-ink-800 hover:text-brand-800">{p.name}</Link><span className="block text-[10px] font-mono text-ink-400">{p.id}</span></td>
                  <td className="text-[11.5px]">{p.customer}</td>
                  <td><Badge tone={p.status === 'Completed' ? 'green' : p.status === 'On Hold' ? 'red' : 'blue'}>{p.status}</Badge></td>
                  <td className="text-right tabular-nums text-[11.5px]">{inr(p.orderValue, { compact: true })}</td>
                  <td className="text-right tabular-nums text-[11.5px]">{inr(p.invoiced, { compact: true })}</td>
                  <td className="text-right tabular-nums text-[11.5px] text-emerald-700">{inr(p.collected, { compact: true })}</td>
                  <td className={`text-right tabular-nums text-[11.5px] ${p.outstanding > 0 ? 'text-rose-700 font-medium' : 'text-ink-400'}`}>{inr(p.outstanding, { compact: true })}</td>
                  <td><ProgressBar value={p.progress} size="sm" label={`${p.progress}% · ${p.collectionPct}% collected`} tone={p.progress === 100 ? 'green' : 'brand'} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-ink-50 border-t border-ink-200 font-medium">
                <td colSpan={3} className="text-[11px] text-ink-600">Portfolio total</td>
                <td className="text-right tabular-nums text-[11.5px]">{inr(sumBy(projectRows, (p) => p.orderValue), { compact: true })}</td>
                <td className="text-right tabular-nums text-[11.5px]">{inr(sumBy(projectRows, (p) => p.invoiced), { compact: true })}</td>
                <td className="text-right tabular-nums text-[11.5px]">{inr(sumBy(projectRows, (p) => p.collected), { compact: true })}</td>
                <td className="text-right tabular-nums text-[11.5px] text-rose-700">{inr(sumBy(projectRows, (p) => p.outstanding), { compact: true })}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SectionCard
          title="Sales executive performance"
          subtitle="Lead ownership, quotation activity and order value"
          icon="Users"
          action={<Button size="xs" variant="secondary" icon="Download" onClick={exportSales}>CSV</Button>}
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead><tr><th>Executive</th><th className="text-right">Leads</th><th className="text-right">Won</th><th className="text-right">Quotes</th><th className="text-right">Order value</th><th>Role</th></tr></thead>
              <tbody>
                {salesRows.map((s) => (
                  <tr key={s.id}>
                    <td><p className="font-medium text-ink-800">{s.name}</p><p className="text-[10px] text-ink-400">{s.location}</p></td>
                    <td className="text-right tabular-nums">{s.leads}</td>
                    <td className="text-right tabular-nums text-emerald-700">{s.won}</td>
                    <td className="text-right tabular-nums">{s.quotes}</td>
                    <td className="text-right tabular-nums font-medium">{inr(s.orderValue, { compact: true })}</td>
                    <td><Badge tone={ROLES[s.role]?.tone || 'gray'}>{ROLES[s.role]?.label || 'Staff'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="Inventory valuation"
          subtitle="Available stock valued at standard unit cost"
          icon="Boxes"
          action={<Button size="xs" variant="secondary" icon="Download" onClick={exportStock}>CSV</Button>}
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead><tr><th>Category</th><th className="text-right">Materials</th><th className="text-right">Stock value</th></tr></thead>
              <tbody>
                {stockByCategory.map((c) => (
                  <tr key={c.category}>
                    <td className="font-medium text-ink-800">{c.category}</td>
                    <td className="text-right tabular-nums">{c.items}</td>
                    <td className="text-right tabular-nums font-medium">{inr(c.value)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr className="bg-ink-50 border-t border-ink-200"><td className="font-medium text-[11px]">Total</td><td className="text-right tabular-nums">{stockRows.length}</td><td className="text-right tabular-nums font-semibold">{inr(finance.stockValue)}</td></tr></tfoot>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-ink-100 space-y-1.5">
            {stockRows.sort((a, b) => b.stockValue - a.stockValue).slice(0, 4).map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-ink-600 truncate">{m.name}</span>
                <span className="text-ink-800 tabular-nums shrink-0">{inr(m.stockValue, { compact: true })}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
