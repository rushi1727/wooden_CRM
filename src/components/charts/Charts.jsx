import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { EmptyState } from '../common/ui';

export const CHART_COLORS = ['#a26632', '#2c3443', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];

const axisProps = { tick: { fontSize: 10.5, fill: '#8792a5' }, axisLine: false, tickLine: false };

export function ChartCard({ title, subtitle, action, children, height = 250, empty, className = '' }) {
  return (
    <div className={`surface p-4 ${className}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="section-title truncate">{title}</h3>
          {subtitle ? <p className="text-[11.5px] text-ink-500 mt-0.5">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div style={{ height }}>
        {empty ? <EmptyState icon="BarChart3" title="Not enough data" description="Charts populate as records move through the workflow." /> : children}
      </div>
    </div>
  );
}

const tooltipStyle = {
  contentStyle: { borderRadius: 8, border: '1px solid #eceef2', boxShadow: '0 8px 24px -12px rgba(16,24,40,.24)', fontSize: 12, padding: '8px 10px' },
  labelStyle: { color: '#1b2230', fontWeight: 600, marginBottom: 4, fontSize: 11.5 },
};

export function SimpleBarChart({ data, xKey = 'name', series = [], stacked = false, formatValue, height = 250 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barSize={series.length > 1 ? 12 : 22}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceef2" />
        <XAxis dataKey={xKey} {...axisProps} interval={0} tickMargin={6} />
        <YAxis {...axisProps} width={46} tickFormatter={(v) => (formatValue ? formatValue(v) : v)} />
        <Tooltip {...tooltipStyle} formatter={(v, name) => [formatValue ? formatValue(v) : v, name]} cursor={{ fill: '#fbf7f1' }} />
        {series.length > 1 ? <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 6 }} /> : null}
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name || s.key} fill={s.color} stackId={stacked ? 'a' : undefined} radius={stacked ? 0 : [3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimpleLineChart({ data, xKey = 'name', series = [], formatValue, height = 250, area = false }) {
  const Chart = area ? AreaChart : LineChart;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceef2" />
        <XAxis dataKey={xKey} {...axisProps} tickMargin={6} />
        <YAxis {...axisProps} width={46} tickFormatter={(v) => (formatValue ? formatValue(v) : v)} />
        <Tooltip {...tooltipStyle} formatter={(v, name) => [formatValue ? formatValue(v) : v, name]} />
        {series.length > 1 ? <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 6 }} /> : null}
        {series.map((s) => (area ? (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.name || s.key} stroke={s.color} fill={s.color} fillOpacity={0.12} strokeWidth={2} />
        ) : (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name || s.key} stroke={s.color} strokeWidth={2} dot={{ r: 2.5, strokeWidth: 1.5, fill: '#fff' }} activeDot={{ r: 4 }} />
        )))}
      </Chart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ data, height = 220, formatValue }) {
  const total = data.reduce((a, d) => a + (Number(d.value) || 0), 0);
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <div style={{ height, width: '100%', maxWidth: 230 }} className="shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="86%" paddingAngle={2} stroke="none">
              {data.map((entry, i) => <Cell key={entry.name} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip {...tooltipStyle} formatter={(v, n) => [formatValue ? formatValue(v) : v, n]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full space-y-1.5 min-w-0">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex items-center justify-between gap-2 text-[11.5px]">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color || CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="text-ink-600 truncate">{entry.name}</span>
            </span>
            <span className="text-ink-800 tabular-nums font-medium shrink-0">
              {entry.value}
              <span className="text-ink-400 font-normal ml-1">{total ? `(${Math.round((entry.value / total) * 100)}%)` : ''}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
