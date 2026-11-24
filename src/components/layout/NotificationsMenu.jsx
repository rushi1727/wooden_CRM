import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { markRead, markAllRead } from '../../features/admin/adminSlice';
import Icon from '../common/Icon';
import { Badge } from '../common/ui';
import useClickOutside from '../../hooks/useClickOutside';
import { relativeTime } from '../../utils/format';

const TONES = {
  success: { icon: 'CheckCircle2', cls: 'bg-emerald-50 text-emerald-600' },
  error: { icon: 'AlertCircle', cls: 'bg-rose-50 text-rose-600' },
  warning: { icon: 'AlertTriangle', cls: 'bg-amber-50 text-amber-600' },
  info: { icon: 'Info', cls: 'bg-blue-50 text-blue-600' },
};

export default function NotificationsMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.notifications.items);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const unread = items.filter((n) => !n.read).length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 rounded-md grid place-items-center text-ink-500 hover:bg-ink-100 hover:text-ink-800"
      >
        <Icon name="Bell" className="w-[18px] h-[18px]" />
        {unread ? (
          <span className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-semibold grid place-items-center border-2 border-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-2 w-[370px] max-w-[calc(100vw-24px)] bg-white border border-ink-200 rounded-lg shadow-pop z-50 animate-slideDown overflow-hidden">
          <div className="px-3.5 py-3 border-b border-ink-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-[12.5px] font-semibold text-ink-800">Notifications</p>
              {unread ? <Badge tone="red" size="sm">{unread} new</Badge> : null}
            </div>
            <button type="button" onClick={() => dispatch(markAllRead())} className="text-[10.5px] text-brand-700 hover:underline font-medium">Mark all read</button>
          </div>
          <div className="max-h-[360px] overflow-y-auto divide-y divide-ink-100">
            {items.length ? items.map((n) => {
              const tone = TONES[n.tone] || TONES.info;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => { dispatch(markRead(n.id)); setOpen(false); if (n.link) navigate(n.link); }}
                  className={`w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-ink-50 ${n.read ? '' : 'bg-brand-50/30'}`}
                >
                  <span className={`w-6 h-6 rounded grid place-items-center shrink-0 mt-0.5 ${tone.cls}`}>
                    <Icon name={tone.icon} className="w-3.5 h-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className={`text-[11.5px] truncate ${n.read ? 'text-ink-600' : 'font-semibold text-ink-900'}`}>{n.title}</span>
                      {!n.read ? <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" /> : null}
                    </span>
                    <span className="block text-[10.5px] text-ink-500 mt-0.5 leading-4">{n.message}</span>
                    <span className="block text-[9.5px] text-ink-400 mt-1">{relativeTime(n.at)}</span>
                  </span>
                </button>
              );
            }) : (
              <p className="px-4 py-8 text-center text-[12px] text-ink-400">You are all caught up.</p>
            )}
          </div>
          <div className="px-3.5 py-2 border-t border-ink-100 bg-ink-50/60 text-[10px] text-ink-400">Click a notification to open the related record.</div>
        </div>
      ) : null}
    </div>
  );
}
