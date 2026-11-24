import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ToastHost from './components/common/ToastHost';
import Icon from './components/common/Icon';

function BootSplash() {
  return (
    <div className="min-h-screen bg-ink-950 grid place-items-center text-white">
      <div className="text-center px-6">
        <div className="w-14 h-14 mx-auto rounded-lg bg-brand-700 grid place-items-center shadow-lg shadow-black/30">
          <Icon name="DoorOpen" className="w-7 h-7 text-brand-100" />
        </div>
        <h1 className="mt-4 text-[17px] font-semibold tracking-tight">DoorCraft Industries</h1>
        <p className="text-[11px] text-ink-400 mt-1 uppercase tracking-[0.18em]">Manufacturing ERP & Project Portal</p>
        <div className="w-40 h-1 bg-ink-800 rounded-full mx-auto mt-5 overflow-hidden">
          <div className="h-full w-1/2 bg-brand-500 rounded-full animate-pulse" />
        </div>
        <p className="text-[10px] text-ink-500 mt-3">Loading demo workspace…</p>
      </div>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 320);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      {ready ? <AppRoutes /> : <BootSplash />}
      <ToastHost />
    </BrowserRouter>
  );
}
