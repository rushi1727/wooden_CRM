import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';
import { Button } from './ui';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-5xl',
  '3xl': 'max-w-6xl',
};

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md', icon }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-ink-900/45 backdrop-blur-[1px] animate-fadeIn" onClick={onClose} aria-hidden="true" />
      <div className={`relative w-full ${SIZES[size]} bg-white rounded-lg shadow-pop border border-ink-200 my-auto animate-slideDown`}>
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-ink-100">
          <div className="flex items-start gap-3">
            {icon ? <span className="w-8 h-8 rounded-md bg-brand-50 text-brand-700 grid place-items-center shrink-0"><Icon name={icon} className="w-4 h-4" /></span> : null}
            <div>
              <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
              {subtitle ? <p className="text-[12px] text-ink-500 mt-0.5">{subtitle}</p> : null}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="text-ink-400 hover:text-ink-700 -m-1 p-1">
            <Icon name="X" className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? <div className="px-5 py-3.5 border-t border-ink-100 bg-ink-50/50 rounded-b-lg flex items-center justify-end gap-2">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Confirm',
  tone = 'danger', icon = 'AlertTriangle', children,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" icon={icon}>
      <div className="text-[13px] text-ink-600 leading-6">{message}</div>
      {children}
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} icon={tone === 'danger' ? 'Trash2' : 'Check'}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
