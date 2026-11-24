import { Link, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { NAV_SECTIONS, COMPANY, ROLES } from '../../data/masterData';
import { usePermissions } from '../../hooks/usePermissions';
import Icon from '../common/Icon';
import { Avatar } from '../common/ui';
import { closeSidebar } from '../../features/ui/uiSlice';

export default function Sidebar() {
  const open = useSelector((s) => s.ui.sidebarOpen);
  const { view, role, user } = usePermissions();
  const dispatch = useDispatch();
  const roleConfig = ROLES[role];

  const sections = NAV_SECTIONS
    .map((section) => ({ ...section, items: section.items.filter((item) => view(item.key)) }))
    .filter((section) => section.items.length);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink-900/50 backdrop-blur-[1px] lg:hidden transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => dispatch(closeSidebar())}
        aria-hidden="true"
      />
      <aside className={`fixed inset-y-0 left-0 z-50 w-[252px] bg-ink-900 text-white flex flex-col transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-14 px-4 flex items-center gap-2.5 border-b border-white/10 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0" onClick={() => dispatch(closeSidebar())}>
            <span className="w-8 h-8 rounded-md bg-brand-600 grid place-items-center shrink-0 shadow-sm">
              <Icon name="DoorOpen" className="w-4.5 h-4.5 text-white" />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold leading-4 tracking-tight truncate">DoorCraft</span>
              <span className="block text-[9.5px] uppercase tracking-[0.14em] text-white/45 leading-3 mt-0.5">Manufacturing ERP</span>
            </span>
          </Link>
          <button type="button" aria-label="Close menu" onClick={() => dispatch(closeSidebar())} className="ml-auto lg:hidden text-white/60 hover:text-white">
            <Icon name="X" className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 pt-3 pb-1 shrink-0">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/5 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10.5px] text-white/65 truncate">Chakan Plant · Operational</span>
            <span className="ml-auto text-[9px] text-white/35 uppercase tracking-wider">Live</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="px-2 mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-white/30">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    end={item.key === 'dashboard'}
                    onClick={() => dispatch(closeSidebar())}
                    className={({ isActive }) => `group flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[12.5px] transition-colors relative ${
                      isActive
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive ? <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r bg-brand-400" /> : null}
                        <Icon name={item.icon} className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-300' : 'text-white/40 group-hover:text-white/70'}`} />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 px-1.5 py-1.5">
            <Avatar name={user} size="md" tone="bg-brand-600 text-white" />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-white truncate leading-4">{user}</p>
              <p className="text-[10px] text-white/45 truncate leading-4">{roleConfig?.label}</p>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Active session" />
          </div>
          <p className="text-[9.5px] text-white/25 mt-2 px-1.5">{COMPANY.legalName} · Demo v1.0</p>
        </div>
      </aside>
    </>
  );
}
