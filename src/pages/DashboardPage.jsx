import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { useDashboardMetrics, DASHBOARD_LAYOUTS } from '../features/dashboard/metrics';
import { KpiGroup, ChartWidget, QueueCard, DateRangeControl, AlertsCard, DeadlinesCard } from '../components/dashboard/DashboardWidgets';
import { Badge, PageHeader } from '../components/common/ui';
import Timeline from '../components/common/Timeline';
import Icon from '../components/common/Icon';
import { COMPANY } from '../data/masterData';

export default function DashboardPage() {
  const { role, user, roleConfig, isAdmin, view } = usePermissions();
  const layout = DASHBOARD_LAYOUTS[role] || DASHBOARD_LAYOUTS.super_admin;
  const [range, setRange] = useState({ key: 'year' });
  const metrics = useDashboardMetrics(range);
  const queues = useMemo(() => layout.queues.map((key) => metrics.queues[key]).filter(Boolean), [layout.queues, metrics.queues]);
  const chartKeys = useMemo(() => layout.charts.filter((key) => metrics.charts[key]), [layout.charts, metrics.charts]);

  return (
    <div>
      <PageHeader
        title={layout.title}
        description={layout.subtitle}
        breadcrumbs={[{ label: 'Dashboard' }]}
        meta={(
          <>
            <Badge tone="dark">{roleConfig?.label}</Badge>
            {isAdmin ? <Badge tone="brand">Full company view</Badge> : <Badge tone="blue">{user}'s view</Badge>}
          </>
        )}
        actions={(
          <>
            {isAdmin ? <DateRangeControl value={range} onChange={setRange} /> : null}
            {view('reports') ? (
              <Link to="/reports" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-ink-200 bg-white text-[12px] text-ink-600 hover:bg-ink-50">
                <Icon name="BarChart3" className="w-3.5 h-3.5" /> Reports
              </Link>
            ) : null}
          </>
        )}
      />

      {isAdmin ? (
        <div className="mb-5 surface px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 bg-gradient-to-r from-brand-50/70 to-white">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded bg-ink-900 grid place-items-center"><Icon name="DoorOpen" className="w-3.5 h-3.5 text-brand-300" /></span>
            <div>
              <p className="text-[11.5px] font-semibold text-ink-800">{COMPANY.legalName}</p>
              <p className="text-[10px] text-ink-500">GSTIN {COMPANY.gstin} · Chakan plant, Pune</p>
            </div>
          </div>
          <span className="hidden sm:block h-7 w-px bg-ink-200" />
          <p className="text-[10.5px] text-ink-500 flex items-center gap-1.5"><Icon name="Calendar" className="w-3 h-3" /> Reporting window: <strong className="text-ink-700 font-medium">{range.key === 'custom' ? `${range.from || '…'} → ${range.to || '…'}` : range.key.replace('_', ' ')}</strong></p>
          <p className="text-[10.5px] text-ink-500 flex items-center gap-1.5"><Icon name="Sparkles" className="w-3 h-3 text-brand-500" /> All figures are live from Redux state</p>
          <span className="ml-auto text-[10px] text-ink-400 hidden md:flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Synced locally</span>
        </div>
      ) : null}

      {layout.kpiGroups.map((group) => (
        <KpiGroup key={group.label} label={group.label} keys={group.keys} kpis={metrics.kpis} />
      ))}

      <section className="mb-5">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-semibold text-ink-800">Performance analytics</h2>
            <span className="text-[10px] uppercase tracking-wider text-ink-400">{chartKeys.length} view{chartKeys.length === 1 ? '' : 's'}</span>
          </div>
          {view('reports') ? (
            <Link to="/reports" className="text-[11px] text-brand-700 font-medium hover:underline inline-flex items-center gap-1">
              Open reports <Icon name="ArrowRight" className="w-3 h-3" />
            </Link>
          ) : null}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {chartKeys.map((key) => <ChartWidget key={key} chartKey={key} charts={metrics.charts} />)}
        </div>
      </section>

      <section className="mb-5">
        <div className="flex items-center gap-2 mb-2.5">
          <h2 className="text-[13px] font-semibold text-ink-800">Work queues</h2>
          <span className="h-px flex-1 bg-ink-200/70" />
          <span className="text-[10px] uppercase tracking-wider text-ink-400">Assigned & pending</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {queues.map((queue) => <QueueCard key={queue.title} queue={queue} />)}
        </div>
      </section>

      <section className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
        <div className="surface">
          <div className="px-4 py-3 border-b border-ink-100 flex items-center gap-2">
            <Icon name="History" className="w-4 h-4 text-brand-600" />
            <h3 className="section-title">Recent activity</h3>
            <Link to="/activity" className="ml-auto text-[10.5px] text-brand-700 font-medium hover:underline">View log</Link>
          </div>
          <div className="p-4">
            <Timeline items={metrics.recentActivity} emptyText="Workflow activity will appear as records move through the process." />
          </div>
        </div>
        <DeadlinesCard deadlines={metrics.deadlines} />
        <AlertsCard alerts={metrics.alerts} />
      </section>
    </div>
  );
}
