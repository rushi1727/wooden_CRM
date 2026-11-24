import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Icon from './Icon';
import { dismissToast } from '../../features/ui/uiSlice';

const TOAST_STYLES = {
  success: { wrap: 'border-emerald-200 bg-white', icon: 'CheckCircle2', iconClass: 'text-emerald-600 bg-emerald-50' },
  error: { wrap: 'border-rose-200 bg-white', icon: 'AlertCircle', iconClass: 'text-rose-600 bg-rose-50' },
  warning: { wrap: 'border-amber-200 bg-white', icon: 'AlertTriangle', iconClass: 'text-amber-600 bg-amber-50' },
  info: { wrap: 'border-blue-200 bg-white', icon: 'Info', iconClass: 'text-blue-600 bg-blue-50' },
};

function Toast({ toast }) {
  const dispatch = useDispatch();
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), toast.duration || 4200);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  return (
    <div className={`pointer-events-auto w-[340px] max-w-[calc(100vw-32px)] rounded-lg border shadow-pop animate-slideIn overflow-hidden ${style.wrap}`}>
      <div className="flex items-start gap-3 p-3.5">
        <span className={`w-7 h-7 rounded-md grid place-items-center shrink-0 ${style.iconClass}`}>
          <Icon name={style.icon} className="w-4 h-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-ink-900 leading-4">{toast.title}</p>
          {toast.message ? <p className="text-[11.5px] text-ink-500 mt-1 leading-4">{toast.message}</p> : null}
        </div>
        <button type="button" aria-label="Dismiss" onClick={() => dispatch(dismissToast(toast.id))} className="text-ink-400 hover:text-ink-700 shrink-0">
          <Icon name="X" className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function ToastHost() {
  const toasts = useSelector((s) => s.ui.toasts);
  return (
    <div className="fixed z-[90] bottom-5 right-5 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => <Toast key={toast.id} toast={toast} />)}
    </div>
  );
}
