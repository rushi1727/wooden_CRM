import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import { Badge, EmptyState, ProgressBar, StatCard, StatusBadge } from '../common/ui';
import { ChartCard, DonutChart, SimpleBarChart, SimpleLineChart } from '../charts/Charts';
import { DATE_RANGES } from '../../data/masterData';
import { inr, daysUntil, formatShortDate } from '../../utils/format';

/* ------------------------------------------------------------------ */
/* Date range                                                         */
/* ------------------------------------------------------------------ */

export function DateRangeControl({ value, onChange }) {
  const current = value.key || 'all';
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="inline-flex items-center rounded-md border border-ink-200 bg-white p-0.5">
        {DATE_RANGES.filter((r) => r.key !== 'custom').map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => onChange({ key: r.key })}
            className={`px-2.5 h-7 rounded text-[11px] font-medium transition-colors ${current === r.key ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-800 hover:bg-ink-50'}`}
          >
            {r.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...value, key: 'custom' })}
          className={`px-2.5 h-7 rounded text-[11px] font-medium inline-flex items-center gap-1 ${current === 'custom' ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-800 hover:bg-ink-50'}`}
        >
          <Icon name="Calendar" className="w-3 h-3" /> Custom
        </button>
      </div>
      {current === 'custom' ? (
        <div className="flex items-center gap-1.5">
          <input type="date" value={value.from || ''} onChange={(e) => onChange({ ...value, key: 'custom', from: e.target.value })} className="h-8 rounded border border-ink-200 px-2 text-[11px] text-ink-600" aria-label="From date" />
          <span className="text-ink-400 text-[11px]">to</span>
          <input type="date" value={value.to || ''} onChange={(e) => onChange({ ...value, key: 'custom', to: e.target.value })} className="h-8 rounded border border-ink-200 px-2 text-[11px] text-ink-600" aria-label="To date" />
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* KPI grids                                                          */
/* ------------------------------------------------------------------ */

export function KpiGroup({ label, keys, kpis, columns = 4 }) {
  const items = keys.map((key) => ({ key, ...kpis[key] })).filter((i) => i.label);
  return (
    <section className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-[12.5px] font-semibold text-ink-800">{label}</h2>
        <span className="h-px flex-1 bg-ink-200/70" />
        <span className="text-[10px] uppercase tracking-wider text-ink-400">{items.length} metrics</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-2.5">
        {items.map((item) => (
          <StatCard
            key={item.key}
            label={item.label}
            value={item.value}
            helper={item.helper}
            icon={item.icon}
            tone={item.tone}
            className={columns === 8 ? '' : ''}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Charts                                                             */
/* ------------------------------------------------------------------ */

function WorkloadList({ data }) {
  if (!data.length) return <EmptyState icon="Users" title="No open workload" description="Assignments will appear as projects and jobs are allocated." />;
  const max = Math.max(...data.map((d) => d.tasks), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.full}>
          <div className="flex items-center justify-between text-[11.5px] mb-1">
            <span className="text-ink-700 font-medium truncate">{d.full}</span>
            <span className="text-ink-500 tabular-nums">{d.tasks} open</span>
          </div>
          <ProgressBar value={(d.tasks / max) * 100} tone={d.tasks >= 5 ? 'amber' : 'brand'} size="sm" />
        </div>
      ))}
    </div>
  );
}

const CHART_META = {
  leadsTrend: { title: 'Lead creation & conversion', subtitle: 'Monthly enquiries created versus leads won' },
  quotationStatus: { title: 'Quotation pipeline', subtitle: 'Distribution by current status' },
  projectStatus: { title: 'Project status', subtitle: 'Live portfolio by delivery stage' },
  productionOutput: { title: 'Production output', subtitle: 'QC-approved doors completed each month' },
  installationStatus: { title: 'Installation status', subtitle: 'Installed doors by job status' },
  revenueTrend: { title: 'Monthly collections', subtitle: 'Customer payments received by month' },
  employeeWorkload: { title: 'Employee workload', subtitle: 'Open assignments per team member' },
  qcRejectionRate: { title: 'QC rejection rate', subtitle: 'Rejected inspections as a percentage of checks' },
  projectCompletion: { title: 'Project completion', subtitle: 'Projects completed per month' },
  leadFunnel: { title: 'Lead stage mix', subtitle: 'Where enquiries currently sit' },
  quotationValueTrend: { title: 'Quotation value', subtitle: 'Quoted value by month' },
  productionStatus: { title: 'Production status', subtitle: 'Door jobs by manufacturing stage' },
  stockByCategory: { title: 'Stock value by category', subtitle: 'Available inventory valuation' },
  dispatchStatus: { title: 'Dispatch status', subtitle: 'Consignments by delivery stage' },
  dispatchTrend: { title: 'Dispatch trend', subtitle: 'Consignments released per month' },
  installationTrend: { title: 'Installation throughput', subtitle: 'Doors installed each month' },
  inspectionStatus: { title: 'Site approval status', subtitle: 'Installed doors by inspection outcome' },
  invoiceStatus: { title: 'Receivables status', subtitle: 'Invoices by collection status' },
  serviceStatus: { title: 'Service ticket status', subtitle: 'Complaints by resolution stage' },
  serviceTypes: { title: 'Complaint categories', subtitle: 'Most common warranty issues' },
  qcOutcomes: { title: 'Quality outcomes', subtitle: 'Inspection results across all doors' },
};

export function ChartWidget({ chartKey, charts }) {
  const meta = CHART_META[chartKey];
  const chart = charts[chartKey];
  if (!meta || !chart) return null;
  const hasData = Array.isArray(chart.data) && chart.data.some((d) => (d.value ?? d.Created ?? d.Collected ?? d.Doors ?? d.Rejection ?? d.Dispatched ?? d.Installed ?? d.Value ?? d.Completed) > 0);

  let body = null;
  if (chartKey === 'leadsTrend') body = <SimpleBarChart data={chart.data} series={chart.series} height={240} />;
  else if (chartKey === 'productionOutput' || chartKey === 'projectCompletion' || chartKey === 'dispatchTrend' || chartKey === 'installationTrend') {
    const key = Object.keys(chart.data[0] || {}).find((k) => !['name', 'month'].includes(k));
    body = <SimpleBarChart data={chart.data} series={[{ key, name: key, color: '#a26632' }]} height={240} />;
  } else if (chartKey === 'revenueTrend') body = <SimpleLineChart data={chart.data} series={[{ key: 'Collected', name: 'Collected', color: '#10b981' }]} area formatValue={(v) => inr(v, { compact: true })} height={240} />;
  else if (chartKey === 'quotationValueTrend') body = <SimpleLineChart data={chart.data} series={[{ key: 'Value', name: 'Quoted value', color: '#8b5cf6' }]} area formatValue={(v) => inr(v, { compact: true })} height={240} />;
  else if (chartKey === 'qcRejectionRate') body = <SimpleLineChart data={chart.data} series={[{ key: 'Rejection', name: 'Rejection %', color: '#ef4444' }]} formatValue={(v) => `${v}%`} height={240} />;
  else if (chartKey === 'employeeWorkload') body = <WorkloadList data={chart.data} />;
  else if (chartKey === 'leadFunnel') body = <SimpleBarChart data={chart.data} series={[{ key: 'value', name: 'Leads', color: '#ca985c' }]} height={240} />;
  else if (chartKey === 'productionStatus') body = <DonutChart data={chart.data} height={200} />;
  else body = <DonutChart data={chart.data} height={200} formatValue={chartKey === 'stockByCategory' ? (v) => inr(v, { compact: true }) : undefined} />;

  return (
    <ChartCard title={meta.title} subtitle={meta.subtitle} height={chartKey === 'employeeWorkload' ? 240 : undefined} empty={!hasData && !['employeeWorkload'].includes(chartKey)}>
      {body}
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ */
/* Queues                                                             */
/* ------------------------------------------------------------------ */

export function QueueCard({ queue }) {
  if (!queue) return null;
  return (
    <div className="surface flex flex-col">
      <div className="px-4 py-3 border-b border-ink-100 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="section-title truncate">{queue.title}</h3>
          <p className="text-[11px] text-ink-400 mt-0.5">{queue.subtitle}</p>
        </div>
        <Link to={queue.path} className="text-[10.5px] text-brand-700 font-medium hover:underline shrink-0 inline-flex items-center gap-0.5">
          View all <Icon name="ArrowRight" className="w-3 h-3" />
        </Link>
      </div>
      <div className="flex-1 divide-y divide-ink-100">
        {queue.items.length ? queue.items.map((item) => (
          <Link key={item.id} to={item.path} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-brand-50/50 transition-colors group">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-ink-800 truncate group-hover:text-brand-800">{item.title}</p>
              <p className="text-[10.5px] text-ink-400 truncate">{item.subtitle}</p>
            </div>
            <div className="text-right shrink-0 space-y-1">
              {item.status ? <StatusBadge status={item.status} size="sm" /> : null}
              {item.meta ? <p className="text-[10px] text-ink-400 whitespace-nowrap">{item.meta}</p> : null}
            </div>
          </Link>
        )) : (
          <div className="px-4 py-8 text-center">
            <Icon name="CheckCircle2" className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-[11.5px] text-ink-500">You're all caught up here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Side cards                                                         */
/* ------------------------------------------------------------------ */

export function AlertsCard({ alerts }) {
  return (
    <div className="surface">
      <div className="px-4 py-3 border-b border-ink-100 flex items-center gap-2">
        <Icon name="Bell" className="w-4 h-4 text-brand-600" />
        <h3 className="section-title">Alerts</h3>
        <Badge tone="red" size="sm" className="ml-auto">{alerts.length} unread</Badge>
      </div>
      <div className="divide-y divide-ink-100">
        {alerts.length ? alerts.map((a) => (
          <Link key={a.id} to={a.link || '/dashboard'} className="block px-4 py-2.5 hover:bg-ink-50">
            <p className="text-[11.5px] font-medium text-ink-800">{a.title}</p>
            <p className="text-[10.5px] text-ink-500 mt-0.5 leading-4">{a.message}</p>
          </Link>
        )) : (
          <p className="px-4 py-6 text-[11.5px] text-ink-400 text-center">No unread alerts.</p>
        )}
      </div>
    </div>
  );
}

export function DeadlinesCard({ deadlines }) {
  return (
    <div className="surface">
      <div className="px-4 py-3 border-b border-ink-100 flex items-center gap-2">
        <Icon name="CalendarClock" className="w-4 h-4 text-brand-600" />
        <h3 className="section-title">Upcoming deadlines</h3>
      </div>
      <div className="divide-y divide-ink-100">
        {deadlines.length ? deadlines.map((d) => {
          const days = daysUntil(d.date);
          return (
            <Link key={`${d.kind}-${d.id}`} to={d.path} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-ink-50">
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-medium text-ink-800 truncate">{d.title}</p>
                <p className="text-[10.5px] text-ink-400 truncate">{d.kind} · {d.subtitle}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10.5px] font-medium text-ink-600">{formatShortDate(d.date)}</p>
                <p className={`text-[10px] ${days < 0 ? 'text-rose-600' : days <= 7 ? 'text-amber-600' : 'text-ink-400'}`}>
                  {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `in ${days}d`}
                </p>
              </div>
            </Link>
          );
        }) : (
          <p className="px-4 py-6 text-[11.5px] text-ink-400 text-center">No pending deadlines.</p>
        )}
      </div>
    </div>
  );
}
