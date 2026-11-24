import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ROLES, COMPANY, NAV_SECTIONS } from '../data/masterData';
import { login } from '../features/auth/authSlice';
import { addToast } from '../features/ui/uiSlice';
import Icon from '../components/common/Icon';
import { Avatar, Badge, Button } from '../components/common/ui';

const ROLE_GROUPS = [
  { label: 'Leadership & administration', keys: ['super_admin', 'accounts'] },
  { label: 'Sales & estimation', keys: ['sales', 'estimation'] },
  { label: 'Projects & plant', keys: ['project_manager', 'mistri', 'production_supervisor', 'store', 'qc'] },
  { label: 'Delivery, site & service', keys: ['dispatch', 'installation_supervisor', 'site_supervisor', 'service'] },
];

const FEATURES = [
  { icon: 'LayoutDashboard', title: 'Role-based dashboards', text: '13 role workspaces with live KPIs and work queues.' },
  { icon: 'FolderKanban', title: 'End-to-end workflow', text: 'Lead → quotation → order → project → dispatch → site approval.' },
  { icon: 'DoorOpen', title: 'Door-wise tracking', text: 'Every door traced through production, QC, dispatch and installation.' },
  { icon: 'Wallet', title: 'Finance & service', text: 'Invoices, collections, warranty tickets and project profitability.' },
];

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const currentRole = useSelector((s) => s.auth.role);
  const [selected, setSelected] = useState(isAuthenticated ? currentRole : 'super_admin');
  const chosen = ROLES[selected];

  const enter = () => {
    dispatch(login(selected));
    dispatch(addToast({ type: 'success', title: `Welcome, ${chosen.user}`, message: `Signed in as ${chosen.label} in demo mode.` }));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-ink-50 grid lg:grid-cols-[420px_1fr]">
      <aside className="hidden lg:flex flex-col bg-ink-900 text-white p-8 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-64 h-64 rounded-full bg-brand-600/20 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-md bg-brand-600 grid place-items-center"><Icon name="DoorOpen" className="w-5 h-5" /></span>
            <div>
              <p className="text-[15px] font-semibold leading-4">DoorCraft</p>
              <p className="text-[9px] uppercase tracking-[0.16em] text-white/45 mt-1">Manufacturing ERP</p>
            </div>
          </div>
          <p className="text-[10px] text-white/35 mt-6 uppercase tracking-[0.14em]">Door manufacturing · Project delivery</p>
          <h1 className="text-[26px] font-semibold leading-[1.25] mt-2 tracking-tight">One portal from first enquiry to final site approval.</h1>
          <p className="text-[12px] text-white/55 leading-5 mt-3">Plan quotations, run the plant, dispatch doors, manage installation, collect payments and handle warranties — connected across every team.</p>

          <div className="mt-7 space-y-3.5">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-2.5">
                <span className="w-7 h-7 rounded bg-white/8 border border-white/10 grid place-items-center shrink-0">
                  <Icon name={f.icon} className="w-3.5 h-3.5 text-brand-300" />
                </span>
                <div>
                  <p className="text-[12px] font-medium text-white/90 leading-4">{f.title}</p>
                  <p className="text-[10.5px] text-white/45 mt-0.5 leading-4">{f.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-3.5">
            <p className="text-[10px] uppercase tracking-wider text-white/35">Workflow covered</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {['Lead', 'Site visit', 'Quotation', 'Sales order', 'Project', 'Production', 'QC', 'Dispatch', 'Installation', 'Site approval', 'Invoice', 'Warranty'].map((s, i) => (
                <span key={s} className="text-[9.5px] text-white/55">
                  {s}{i < 11 ? <span className="text-brand-400/70 mx-0.5">→</span> : null}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="relative mt-auto pt-8 text-[10px] text-white/30 leading-4">
          <p>{COMPANY.legalName}</p>
          <p>{COMPANY.address}</p>
          <p className="mt-2">Demonstration environment · sample data only</p>
        </div>
      </aside>

      <main className="flex flex-col min-h-screen">
        <div className="px-5 sm:px-8 py-4 flex items-center justify-between border-b border-ink-200 lg:border-0">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="w-7 h-7 rounded bg-brand-700 grid place-items-center"><Icon name="DoorOpen" className="w-4 h-4 text-white" /></span>
            <p className="text-[13px] font-semibold text-ink-900">DoorCraft ERP</p>
          </div>
          <Badge tone="amber">Demo environment — no production login</Badge>
          {isAuthenticated ? (
            <button type="button" onClick={() => navigate('/dashboard')} className="text-[11.5px] text-brand-700 font-medium hover:underline">
              ← Back to workspace
            </button>
          ) : null}
        </div>

        <div className="flex-1 px-5 sm:px-8 lg:px-10 py-6 max-w-[1080px] w-full">
          <div className="mb-5">
            <p className="text-[10.5px] uppercase tracking-[0.15em] text-brand-700 font-semibold">Demonstration sign-in</p>
            <h2 className="text-[24px] font-semibold tracking-tight text-ink-900 mt-1">Choose a role to enter the portal</h2>
            <p className="text-[12.5px] text-ink-500 mt-1 max-w-2xl">Every role has its own navigation, dashboard, permissions and assigned records. You can switch roles any time from the header — no password is required in this demo.</p>
          </div>

          <div className="grid lg:grid-cols-[1fr_300px] gap-5">
            <div className="grid sm:grid-cols-2 gap-4">
              {ROLE_GROUPS.map((group) => (
                <section key={group.label}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400 mb-2">{group.label}</p>
                  <div className="space-y-2">
                    {group.keys.map((key) => {
                      const r = ROLES[key];
                      const active = selected === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelected(key)}
                          className={`w-full text-left surface p-3 flex items-center gap-2.5 transition-all ${active ? 'border-brand-500 ring-2 ring-brand-500/15 bg-brand-50/30' : 'hover:border-ink-300'}`}
                        >
                          <Avatar name={r.user} size="md" tone={active ? 'bg-brand-700 text-white' : undefined} />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[12px] font-semibold text-ink-800 truncate">{r.label}</span>
                            <span className="block text-[10.5px] text-ink-400 truncate">{r.user} · {r.designation}</span>
                          </span>
                          {active ? <Icon name="CheckCircle2" className="w-4 h-4 text-brand-600 shrink-0" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <aside className="surface p-4 h-fit lg:sticky lg:top-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-ink-100">
                <Avatar name={chosen.user} size="lg" />
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-ink-900">{chosen.user}</p>
                  <p className="text-[10.5px] text-ink-500">{chosen.label}</p>
                </div>
              </div>
              <p className="text-[11px] text-ink-500 leading-5 mt-3">{chosen.summary}</p>
              <div className="mt-3">
                <p className="text-[9.5px] uppercase tracking-wider text-ink-400 mb-1.5">Accessible modules</p>
                <div className="flex flex-wrap gap-1">
                  {NAV_SECTIONS.flatMap((s) => s.items)
                    .filter((item) => chosen.permissions === 'all' || (chosen.permissions[item.key] || 0) > 0)
                    .slice(0, 18)
                    .map((item) => (
                      <span key={item.key} className="text-[9.5px] px-1.5 py-1 rounded border border-ink-200 bg-ink-50 text-ink-600">{item.label}</span>
                    ))}
                </div>
              </div>
              <Button variant="primary" full className="mt-4" icon="ArrowRight" onClick={enter}>
                Enter as {chosen.short}
              </Button>
              <p className="text-[9.5px] text-ink-400 mt-2 leading-4">This is a demonstration session. No credentials are stored, and role switching is not production authentication.</p>
            </aside>
          </div>
        </div>

        <footer className="px-5 sm:px-8 py-4 border-t border-ink-200 text-[10px] text-ink-400 flex flex-wrap justify-between gap-2">
          <span>{COMPANY.legalName} · {COMPANY.city}</span>
          <span>Demo build · sample door manufacturing data</span>
        </footer>
      </main>
    </div>
  );
}
