import Icon from './Icon';
import { EmptyState } from './ui';
import { relativeTime, formatDateTime } from '../../utils/format';

const MODULE_ICONS = {
  leads: 'Target', quotations: 'FileText', salesOrders: 'ClipboardList', projects: 'FolderKanban',
  production: 'Factory', quality: 'ShieldCheck', dispatch: 'Truck', installation: 'Hammer',
  inspections: 'ClipboardCheck', accounts: 'Wallet', service: 'Wrench', inventory: 'Boxes',
  customers: 'Users', measurements: 'Ruler', settings: 'Settings',
};

export default function Timeline({ items = [], emptyText = 'No activity recorded yet.', showDate = false }) {
  if (!items.length) {
    return <EmptyState icon="History" title="No activity yet" description={emptyText} />;
  }
  return (
    <ol className="relative">
      {items.map((item, index) => (
        <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
          {index < items.length - 1 ? <span className="absolute left-[13px] top-7 bottom-0 w-px bg-ink-200" aria-hidden="true" /> : null}
          <span className="relative z-10 w-7 h-7 rounded-full bg-ink-50 border border-ink-200 grid place-items-center shrink-0 text-ink-500 mt-0.5">
            <Icon name={MODULE_ICONS[item.module] || 'History'} className="w-3.5 h-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-2">
              <p className="text-[12.5px] font-medium text-ink-800">{item.action}</p>
              <span className="text-[10.5px] text-ink-400 whitespace-nowrap" title={formatDateTime(item.at)}>{relativeTime(item.at)}</span>
            </div>
            {item.detail ? <p className="text-[11.5px] text-ink-500 mt-0.5 leading-4">{item.detail}</p> : null}
            <p className="text-[10.5px] text-ink-400 mt-1">
              {item.user}{item.role ? ` · ${String(item.role).replace(/_/g, ' ')}` : ''}{showDate ? ` · ${formatDateTime(item.at)}` : ''}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
