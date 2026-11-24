import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../data/masterData';
import { setRole } from '../../features/auth/authSlice';
import { addToast } from '../../features/ui/uiSlice';
import Icon from '../common/Icon';
import { Avatar } from '../common/ui';
import useClickOutside from '../../hooks/useClickOutside';

export default function RoleSwitcher() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((s) => s.auth.role);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const current = ROLES[role];

  const choose = (key) => {
    const next = ROLES[key];
    dispatch(setRole(key));
    setOpen(false);
    dispatch(addToast({ type: 'info', title: `Switched to ${next.label}`, message: `Now viewing as ${next.user}. Navigation and permissions updated.` }));
    navigate('/dashboard');
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-9 pl-1.5 pr-2 rounded-md border border-ink-200 hover:border-ink-300 hover:bg-ink-50 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Avatar name={current.user} size="sm" tone="bg-brand-700 text-white" />
        <span className="hidden lg:block text-left leading-3">
          <span className="block text-[11.5px] font-medium text-ink-800">{current.short}</span>
          <span className="block text-[9.5px] text-ink-400 mt-0.5">Demo role</span>
        </span>
        <Icon name="ChevronDown" className="w-3.5 h-3.5 text-ink-400" />
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-2 w-[330px] max-w-[calc(100vw-24px)] bg-white border border-ink-200 rounded-lg shadow-pop z-50 animate-slideDown overflow-hidden">
          <div className="px-3.5 py-3 border-b border-ink-100 bg-ink-50/60">
            <div className="flex items-center gap-2">
              <Icon name="Sparkles" className="w-3.5 h-3.5 text-brand-600" />
              <p className="text-[12px] font-semibold text-ink-800">Switch demo role</p>
              <span className="ml-auto text-[9px] uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200 px-1.5 py-0.5 rounded">Demo only</span>
            </div>
            <p className="text-[10.5px] text-ink-500 mt-1">Changes the navigation, dashboard, permissions and visible records. Not production authentication.</p>
          </div>
          <div className="max-h-[390px] overflow-y-auto py-1">
            {Object.values(ROLES).map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => choose(r.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-brand-50 ${r.key === role ? 'bg-brand-50/70' : ''}`}
                role="option"
                aria-selected={r.key === role}
              >
                <Avatar name={r.user} size="sm" tone={r.key === role ? 'bg-brand-700 text-white' : 'bg-ink-100 text-ink-600'} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-medium text-ink-800 truncate">{r.label}</span>
                  <span className="block text-[10.5px] text-ink-400 truncate">{r.user}</span>
                </span>
                {r.key === role ? <Icon name="Check" className="w-3.5 h-3.5 text-brand-700" /> : null}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => { setOpen(false); navigate('/login'); }}
            className="w-full px-3.5 py-2.5 border-t border-ink-100 bg-ink-50/50 text-[11.5px] text-brand-700 font-medium text-left hover:bg-ink-100 flex items-center gap-1.5"
          >
            <Icon name="ExternalLink" className="w-3.5 h-3.5" />
            Open demo sign-in screen
          </button>
        </div>
      ) : null}
    </div>
  );
}
