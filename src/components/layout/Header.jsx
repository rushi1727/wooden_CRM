import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../features/ui/uiSlice';
import GlobalSearch from './GlobalSearch';
import RoleSwitcher from './RoleSwitcher';
import NotificationsMenu from './NotificationsMenu';
import ProfileMenu from './ProfileMenu';
import Icon from '../common/Icon';
import { COMPANY } from '../../data/masterData';

export default function Header() {
  const dispatch = useDispatch();
  const unread = useSelector((s) => s.notifications.items.filter((n) => !n.read).length);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-ink-200">
      <div className="h-14 px-3 sm:px-5 flex items-center gap-2">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => dispatch(toggleSidebar(true))}
          className="lg:hidden w-8 h-8 rounded-md grid place-items-center text-ink-500 hover:bg-ink-100"
        >
          <Icon name="Menu" className="w-4.5 h-4.5" />
        </button>

        <GlobalSearch />

        <span className="hidden xl:flex items-center gap-1.5 ml-2 text-[10.5px] text-ink-400">
          <Icon name="MapPin" className="w-3 h-3" />
          {COMPANY.city} HQ
        </span>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[9.5px] uppercase tracking-wider font-medium text-brand-800 bg-brand-50 border border-brand-200 rounded px-2 py-1" title="Demonstration environment — role switching is simulated">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Demo
          </span>
          <div className="hidden sm:block h-5 w-px bg-ink-200" aria-hidden="true" />
          <RoleSwitcher />
          <NotificationsMenu />
          <div className="h-5 w-px bg-ink-200 hidden sm:block" aria-hidden="true" />
          <ProfileMenu />
        </div>
      </div>
      {unread > 3 ? (
        <div className="hidden" aria-hidden="true" />
      ) : null}
    </header>
  );
}
