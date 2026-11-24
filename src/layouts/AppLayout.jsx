import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export default function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-ink-50">
      <Sidebar />
      <div className="lg:pl-[252px] min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 px-3.5 sm:px-5 lg:px-6 py-4 sm:py-5 w-full max-w-[1620px] mx-auto">
          <Outlet />
        </main>
        <footer className="px-5 py-3 text-[10.5px] text-ink-400 border-t border-ink-200/70 flex flex-wrap items-center justify-between gap-2">
          <span>DoorCraft Industries Pvt. Ltd. · Door manufacturing ERP & project portal</span>
          <span>Demo environment · All data is sample data stored locally</span>
        </footer>
      </div>
    </div>
  );
}
