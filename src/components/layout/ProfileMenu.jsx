import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { ROLES } from '../../data/masterData';
import { logout } from '../../features/auth/authSlice';
import { addToast } from '../../features/ui/uiSlice';
import { usePermissions } from '../../hooks/usePermissions';
import Icon from '../common/Icon';
import { Avatar, Button } from '../common/ui';
import { Modal } from '../common/Modal';
import useClickOutside from '../../hooks/useClickOutside';

const MODULE_PERMISSION_LABELS = {
  dashboard: 'Dashboard', customers: 'Customers', leads: 'Leads', measurements: 'Site visits',
  quotations: 'Quotations', salesOrders: 'Sales orders', projects: 'Projects', products: 'Door products',
  inventory: 'Inventory', production: 'Production', quality: 'Quality', dispatch: 'Dispatch',
  installation: 'Installation', inspections: 'Site inspections', accounts: 'Accounts',
  service: 'Service', reports: 'Reports', settings: 'Settings', activity: 'Activity log',
};

export default function ProfileMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role, user, roleConfig, isAdmin, view } = usePermissions();
  const employees = useSelector((s) => s.employees.items);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const employee = employees.find((e) => e.name === user);
  const roleName = ROLES[role]?.label;

  const allowedModules = roleConfig.permissions === 'all'
    ? Object.keys(MODULE_PERMISSION_LABELS)
    : Object.keys(roleConfig.permissions).filter((k) => roleConfig.permissions[k] > 0);

  const signOut = () => {
    dispatch(logout());
    dispatch(addToast({ type: 'info', title: 'Signed out', message: 'You can pick a demo role on the sign-in screen.' }));
    setOpen(false);
    navigate('/login');
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-9 pl-1 pr-1.5 rounded-md hover:bg-ink-100 transition-colors"
        aria-label="User menu"
      >
        <Avatar name={user} size="md" />
        <span className="hidden xl:block text-left leading-3">
          <span className="block text-[11.5px] font-medium text-ink-800">{user}</span>
          <span className="block text-[9.5px] text-ink-400 mt-0.5">{roleName}</span>
        </span>
        <Icon name="ChevronDown" className="w-3.5 h-3.5 text-ink-400" />
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-2 w-[260px] bg-white border border-ink-200 rounded-lg shadow-pop z-50 animate-slideDown overflow-hidden">
          <div className="px-3.5 py-3 border-b border-ink-100 flex items-center gap-2.5">
            <Avatar name={user} size="lg" />
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-ink-900 truncate">{user}</p>
              <p className="text-[10.5px] text-ink-500 truncate">{roleName}</p>
              <p className="text-[10px] text-ink-400 truncate">{employee?.email || 'demo@doorcraft.in'}</p>
            </div>
          </div>
          <div className="py-1">
            <button type="button" onClick={() => { setProfileOpen(true); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-ink-600 hover:bg-ink-50">
              <Icon name="User" className="w-3.5 h-3.5 text-ink-400" /> Profile settings
            </button>
            <Link to="/activity" onClick={() => setOpen(false)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-ink-600 hover:bg-ink-50">
              <Icon name="History" className="w-3.5 h-3.5 text-ink-400" /> My activity
            </Link>
            {view('settings') ? (
              <Link to="/settings" onClick={() => setOpen(false)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-ink-600 hover:bg-ink-50">
                <Icon name="Settings" className="w-3.5 h-3.5 text-ink-400" /> Master settings
              </Link>
            ) : null}
            <Link to="/login" onClick={() => setOpen(false)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-ink-600 hover:bg-ink-50">
              <Icon name="Sparkles" className="w-3.5 h-3.5 text-ink-400" /> Demo role sign-in
            </Link>
          </div>
          <div className="border-t border-ink-100 py-1">
            <button type="button" onClick={signOut} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-rose-600 hover:bg-rose-50">
              <Icon name="LogOut" className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      ) : null}

      <Modal open={profileOpen} onClose={() => setProfileOpen(false)} title="Profile settings" subtitle="Demo account details and effective access." size="md" icon="User">
        <div className="flex items-center gap-3 pb-4 border-b border-ink-100">
          <Avatar name={user} size="lg" />
          <div>
            <p className="text-[14px] font-semibold text-ink-900">{user}</p>
            <p className="text-[11.5px] text-ink-500">{employee?.designation || roleName} · {roleName}</p>
            <p className="text-[11px] text-ink-400">{employee?.email || '—'} · {employee?.phone || '—'}</p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3 pt-4">
          <div><dt className="text-[10px] uppercase tracking-wide text-ink-400">Employee ID</dt><dd className="text-[12.5px] text-ink-800">{employee?.id || '—'}</dd></div>
          <div><dt className="text-[10px] uppercase tracking-wide text-ink-400">Department</dt><dd className="text-[12.5px] text-ink-800">{employee?.department || '—'}</dd></div>
          <div><dt className="text-[10px] uppercase tracking-wide text-ink-400">Location</dt><dd className="text-[12.5px] text-ink-800">{employee?.location || 'Chakan HO'}</dd></div>
          <div><dt className="text-[10px] uppercase tracking-wide text-ink-400">Signed in as</dt><dd className="text-[12.5px] text-ink-800">Demo session</dd></div>
        </dl>
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-wide text-ink-400 mb-1.5">Module access</p>
          <div className="flex flex-wrap gap-1.5">
            {allowedModules.map((m) => (
              <span key={m} className="text-[10.5px] px-2 py-1 rounded bg-ink-100 text-ink-600 border border-ink-200">
                {MODULE_PERMISSION_LABELS[m] || m}{isAdmin ? '' : ` · ${roleConfig.permissions[m] === 3 ? 'full' : roleConfig.permissions[m] === 2 ? 'edit' : 'view'}`}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-5 rounded-md bg-amber-50 border border-amber-200 px-3 py-2.5 text-[11px] text-amber-800 flex gap-2">
          <Icon name="Info" className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          This portal is a demonstration. Authentication is simulated with the role switcher in the top bar — no production credentials or personal data are stored.
        </div>
        <div className="flex justify-between items-center mt-4">
          {isAdmin ? <Link to="/settings" onClick={() => setProfileOpen(false)} className="text-[11.5px] link">Manage users & roles</Link> : <span />}
          <Button variant="secondary" onClick={() => setProfileOpen(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
}
