import { Link } from 'react-router-dom';
import Icon from './Icon';
import { statusTone, initials } from '../../utils/format';

/* ------------------------------------------------------------------ */
/* Buttons                                                            */
/* ------------------------------------------------------------------ */

const BUTTON_VARIANTS = {
  primary: 'bg-brand-700 text-white border border-brand-700 hover:bg-brand-800 hover:border-brand-800 shadow-sm disabled:bg-brand-300 disabled:border-brand-300',
  secondary: 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 hover:text-ink-900 shadow-sm',
  ghost: 'bg-transparent text-ink-600 border border-transparent hover:bg-ink-100 hover:text-ink-900',
  subtle: 'bg-ink-900 text-white border border-ink-900 hover:bg-ink-800',
  danger: 'bg-rose-600 text-white border border-rose-600 hover:bg-rose-700 shadow-sm',
  success: 'bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-700 shadow-sm',
  outlineDanger: 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50',
};

const BUTTON_SIZES = {
  xs: 'h-7 px-2.5 text-[11.5px] gap-1',
  sm: 'h-8 px-3 text-[12.5px] gap-1.5',
  md: 'h-9 px-3.5 text-[13px] gap-1.5',
  lg: 'h-10 px-4 text-[13.5px] gap-2',
};

export function Button({
  children, variant = 'secondary', size = 'md', icon, iconRight, className = '',
  full, type = 'button', disabled, onClick, title, loading,
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-70 ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${full ? 'w-full' : ''} ${className}`}
    >
      {loading ? <Icon name="Loader2" className="w-4 h-4 animate-spin" /> : icon ? <Icon name={icon} className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} className="w-3.5 h-3.5" /> : null}
    </button>
  );
}

export function IconButton({ icon, label, onClick, className = '', tone = 'default', size = 'md', disabled, title }) {
  const tones = {
    default: 'text-ink-500 hover:bg-ink-100 hover:text-ink-800',
    brand: 'text-brand-700 hover:bg-brand-50',
    danger: 'text-rose-600 hover:bg-rose-50',
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={title || label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-md transition-colors disabled:opacity-40 ${size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'} ${tones[tone]} ${className}`}
    >
      <Icon name={icon} className="w-4 h-4" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Badges                                                             */
/* ------------------------------------------------------------------ */

const TONE_CLASSES = {
  gray: 'bg-ink-100 text-ink-700 border-ink-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  red: 'bg-rose-50 text-rose-700 border-rose-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  cyan: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
  dark: 'bg-ink-900 text-white border-ink-900',
};

export function Badge({ children, tone = 'gray', dot, className = '', size = 'md' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded border font-medium whitespace-nowrap ${TONE_CLASSES[tone] || TONE_CLASSES.gray} ${size === 'sm' ? 'px-1.5 py-0.5 text-[10.5px]' : 'px-2 py-0.5 text-[11.5px]'} ${className}`}>
      {dot ? <span className={`w-1.5 h-1.5 rounded-full ${tone === 'dark' ? 'bg-white' : 'bg-current'} opacity-70`} /> : null}
      {children}
    </span>
  );
}

export function StatusBadge({ status, size }) {
  if (!status) return <span className="text-ink-400">—</span>;
  return <Badge tone={statusTone(status)} dot size={size}>{status}</Badge>;
}

export function PriorityBadge({ priority }) {
  return <Badge tone={statusTone(priority)}>{priority}</Badge>;
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                           */
/* ------------------------------------------------------------------ */

export function Card({ children, className = '', padded = false }) {
  return <div className={`surface ${padded ? 'p-4' : ''} ${className}`}>{children}</div>;
}

export function SectionCard({ title, subtitle, action, children, className = '', bodyClassName = '', icon }) {
  return (
    <div className={`surface ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-ink-100">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {icon ? <Icon name={icon} className="w-4 h-4 text-brand-600" /> : null}
              <h3 className="section-title truncate">{title}</h3>
            </div>
            {subtitle ? <p className="text-[12px] text-ink-500 mt-0.5">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0 flex items-center gap-2">{action}</div> : null}
        </div>
      )}
      <div className={bodyClassName || 'p-4'}>{children}</div>
    </div>
  );
}

const STAT_TONES = {
  brand: 'bg-brand-50 text-brand-700',
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-rose-50 text-rose-600',
  violet: 'bg-violet-50 text-violet-600',
  cyan: 'bg-cyan-50 text-cyan-600',
  gray: 'bg-ink-100 text-ink-600',
};

export function StatCard({ label, value, helper, icon, tone = 'brand', delta, onClick, className = '' }) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      className={`surface p-4 text-left w-full ${onClick ? 'hover:border-brand-300 hover:shadow-pop transition-all' : ''} ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11.5px] font-medium uppercase tracking-wide text-ink-500 leading-4 truncate">{label}</p>
          <p className="kpi-value mt-1.5">{value}</p>
        </div>
        {icon ? (
          <span className={`w-8 h-8 rounded-md grid place-items-center shrink-0 ${STAT_TONES[tone] || STAT_TONES.brand}`}>
            <Icon name={icon} className="w-4 h-4" />
          </span>
        ) : null}
      </div>
      {(helper || delta !== undefined) && (
        <div className="mt-2 flex items-center gap-1.5 text-[11.5px]">
          {delta !== undefined ? (
            <span className={`inline-flex items-center gap-0.5 font-medium ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              <Icon name={delta >= 0 ? 'TrendingUp' : 'ArrowDown'} className="w-3 h-3" />
              {Math.abs(delta)}%
            </span>
          ) : null}
          {helper ? <span className="text-ink-500 truncate">{helper}</span> : null}
        </div>
      )}
    </Wrapper>
  );
}

/* ------------------------------------------------------------------ */
/* Page chrome                                                        */
/* ------------------------------------------------------------------ */

export function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;
  return (
    <nav className="flex items-center gap-1 text-[11.5px] text-ink-400 mb-2.5 flex-wrap">
      <Link to="/dashboard" className="hover:text-ink-700">Home</Link>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1">
          <Icon name="ChevronRight" className="w-3 h-3" />
          {item.to && i !== items.length - 1
            ? <Link to={item.to} className="hover:text-ink-700">{item.label}</Link>
            : <span className={i === items.length - 1 ? 'text-ink-600 font-medium' : ''}>{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({ title, description, actions, breadcrumbs, meta, children }) {
  return (
    <div className="mb-5">
      <Breadcrumbs items={breadcrumbs || [{ label: title }]} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="page-title">{title}</h1>
            {meta}
          </div>
          {description ? <p className="text-[12.5px] text-ink-500 mt-1 max-w-3xl">{description}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2 flex-wrap">{actions}</div> : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

export function EmptyState({ icon = 'FolderOpen', title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4">
      <div className="w-12 h-12 rounded-lg bg-ink-100 text-ink-400 grid place-items-center mb-3">
        <Icon name={icon} className="w-6 h-6" />
      </div>
      <h3 className="text-[14px] font-semibold text-ink-800">{title}</h3>
      {description ? <p className="text-[12.5px] text-ink-500 mt-1 max-w-sm">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1 border-b border-ink-200 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-[12.5px] font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${isActive ? 'border-brand-600 text-brand-800' : 'border-transparent text-ink-500 hover:text-ink-800 hover:border-ink-300'}`}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span className={`text-[10.5px] px-1.5 py-0.5 rounded ${isActive ? 'bg-brand-100 text-brand-800' : 'bg-ink-100 text-ink-500'}`}>{tab.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function ProgressBar({ value = 0, tone = 'brand', className = '', label, size = 'md' }) {
  const tones = {
    brand: 'bg-brand-600', green: 'bg-emerald-500', amber: 'bg-amber-500',
    red: 'bg-rose-500', blue: 'bg-blue-500', violet: 'bg-violet-500',
  };
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={className}>
      {label ? <div className="flex justify-between text-[11px] text-ink-500 mb-1"><span>{label}</span><span className="tabular-nums font-medium text-ink-700">{v}%</span></div> : null}
      <div className={`w-full ${size === 'sm' ? 'h-1.5' : 'h-2'} rounded-full bg-ink-100 overflow-hidden`}>
        <div className={`h-full rounded-full ${tones[tone] || tones.brand}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

const AVATAR_TONES = ['bg-brand-100 text-brand-800', 'bg-blue-100 text-blue-800', 'bg-emerald-100 text-emerald-800', 'bg-violet-100 text-violet-800', 'bg-amber-100 text-amber-800', 'bg-cyan-100 text-cyan-800'];

export function Avatar({ name = '', size = 'md', tone, className = '' }) {
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length;
  const sizes = { xs: 'w-6 h-6 text-[9px]', sm: 'w-7 h-7 text-[10px]', md: 'w-8 h-8 text-[11px]', lg: 'w-10 h-10 text-[13px]' };
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-semibold shrink-0 ${sizes[size]} ${tone || AVATAR_TONES[idx]} ${className}`}>
      {initials(name) || '?'}
    </span>
  );
}

export function DetailItem({ label, children, className = '' }) {
  return (
    <div className={className}>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</dt>
      <dd className="text-[13px] text-ink-800 mt-0.5 break-words">{children === '' || children === null || children === undefined ? <span className="text-ink-300">—</span> : children}</dd>
    </div>
  );
}

export function ProductSwatch({ tone = 'teak', size = 'md' }) {
  const tones = {
    teak: 'from-amber-700 to-amber-900', oak: 'from-amber-500 to-amber-700',
    walnut: 'from-stone-600 to-stone-800', steel: 'from-slate-400 to-slate-600',
    red: 'from-rose-500 to-rose-700', ivory: 'from-stone-100 to-stone-300',
    slate: 'from-slate-600 to-slate-800', sand: 'from-amber-200 to-amber-400',
    brown: 'from-amber-800 to-stone-900', white: 'from-slate-100 to-slate-300',
    clinical: 'from-cyan-100 to-cyan-300', espresso: 'from-stone-800 to-black',
  };
  return (
    <span className={`inline-flex items-center justify-center rounded-md bg-gradient-to-br ${tones[tone] || tones.teak} ${size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'} border border-black/10 shrink-0`}>
      <span className="w-3 h-4 rounded-sm border border-white/40 bg-white/10" />
    </span>
  );
}
