import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Icon from './Icon';
import { Button } from './ui';
import { resolveFieldOptions } from '../../utils/options';

/* ------------------------------------------------------------------ */
/* Primitives                                                         */
/* ------------------------------------------------------------------ */

export function Input({ className = '', ...props }) {
  return <input className={`input-base ${className}`} {...props} />;
}

export function Select({ options = [], placeholder = 'Select…', className = '', children, ...props }) {
  return (
    <select className={`input-base pr-8 ${className}`} {...props}>
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
      {children}
    </select>
  );
}

export function Textarea({ className = '', rows = 3, ...props }) {
  return <textarea rows={rows} className={`input-base h-auto py-2 leading-5 ${className}`} {...props} />;
}

export function Checkbox({ checked, onChange, label, description, name, disabled }) {
  return (
    <label className={`flex items-start gap-2.5 cursor-pointer select-none ${disabled ? 'opacity-60' : ''}`}>
      <input
        type="checkbox"
        name={name}
        checked={!!checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-ink-300 text-brand-700 focus:ring-brand-500/30"
      />
      <span>
        <span className="block text-[12.5px] font-medium text-ink-700 leading-4">{label}</span>
        {description ? <span className="block text-[11.5px] text-ink-400 mt-0.5">{description}</span> : null}
      </span>
    </label>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Icon name="Search" className="w-4 h-4 text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base pl-8 pr-8"
      />
      {value ? (
        <button type="button" aria-label="Clear search" onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
          <Icon name="X" className="w-3.5 h-3.5" />
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nested value helpers                                               */
/* ------------------------------------------------------------------ */

export const getByPath = (obj, path) => path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
const setByPath = (obj, path, value) => {
  const keys = path.split('.');
  const clone = { ...obj };
  let cursor = clone;
  keys.forEach((key, i) => {
    if (i === keys.length - 1) cursor[key] = value;
    else {
      cursor[key] = { ...(cursor[key] || {}) };
      cursor = cursor[key];
    }
  });
  return clone;
};

/* ------------------------------------------------------------------ */
/* Entity form                                                        */
/* ------------------------------------------------------------------ */

const FIELD_TYPE_DEFAULT = 'text';

const validateValue = (field, value, payload) => {
  if (field.required) {
    if (value === '' || value === null || value === undefined || (Array.isArray(value) && !value.length)) {
      return `${field.label} is required`;
    }
  }
  if (!value) return '';
  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
  if ((field.name === 'mobile' || field.name === 'altMobile' || field.name === 'driverMobile') && !/^\+?[0-9][0-9\s-]{8,15}$/.test(value)) {
    return 'Enter a valid phone number';
  }
  if (field.type === 'number') {
    const n = Number(value);
    if (Number.isNaN(n)) return 'Enter a valid number';
    if (field.min !== undefined && n < field.min) return `Minimum ${field.min}`;
    if (field.max !== undefined && n > field.max) return `Maximum ${field.max}`;
  }
  if (field.validate) return field.validate(value, payload) || '';
  return '';
};

export function EntityForm({ fields, initialValues = {}, onSubmit, onCancel, submitLabel = 'Save', columns = 2, footerExtra }) {
  const state = useSelector((s) => s);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);

  useEffect(() => { setValues(initialValues); setErrors({}); setTouched(false); }, [initialValues]);

  const sections = useMemo(() => {
    const map = [];
    fields.forEach((field) => {
      const sectionName = field.section || 'Details';
      const existing = map.find((s) => s.name === sectionName);
      if (existing) existing.fields.push(field);
      else map.push({ name: sectionName, fields: [field] });
    });
    return map;
  }, [fields]);

  const setValue = (name, value) => {
    setValues((prev) => setByPath(prev, name, value));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const buildPayload = () => {
    let payload = { ...initialValues };
    fields.forEach((field) => {
      const raw = getByPath(values, field.name);
      let value = raw;
      if (field.type === 'number') value = raw === '' || raw === null || raw === undefined ? null : Number(raw);
      if (field.type === 'list') value = Array.isArray(raw) ? raw : String(raw || '').split(',').map((v) => v.trim()).filter(Boolean);
      if (field.type === 'checkbox') value = !!raw;
      payload = setByPath(payload, field.name, value);
    });
    return payload;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    const payload = buildPayload();
    const nextErrors = {};
    fields.forEach((field) => {
      const err = validateValue(field, getByPath(payload, field.name), payload);
      if (err) nextErrors[field.name] = err;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const firstKey = Object.keys(nextErrors)[0];
      document.querySelector(`[name="${firstKey}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onSubmit?.(payload);
  };

  const renderField = (field) => {
    const raw = getByPath(values, field.name);
    const value = raw === undefined || raw === null ? '' : raw;
    const error = touched ? errors[field.name] : '';
    const commonProps = {
      name: field.name,
      id: field.name,
      value,
      onChange: (e) => setValue(field.name, e.target.value),
      placeholder: field.placeholder || field.label,
      disabled: field.readOnly,
    };
    let control;
    switch (field.type) {
      case 'select': {
        const options = resolveFieldOptions(field, state);
        control = (
          <Select
            {...commonProps}
            value={value}
            onChange={(e) => setValue(field.name, e.target.value)}
            options={options}
            placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
          />
        );
        break;
      }
      case 'textarea':
        control = <Textarea {...commonProps} rows={field.rows || 3} />;
        break;
      case 'checkbox':
        control = (
          <div className="h-9 flex items-center">
            <Checkbox checked={!!raw} onChange={(checked) => setValue(field.name, checked)} label={field.checkboxLabel || field.label} />
          </div>
        );
        break;
      case 'number':
        control = <Input {...commonProps} type="number" step={field.step || 1} min={field.min} max={field.max} />;
        break;
      case 'date':
        control = <Input {...commonProps} type="date" />;
        break;
      case 'email':
        control = <Input {...commonProps} type="email" />;
        break;
      case 'list':
        control = (
          <Input
            {...commonProps}
            value={Array.isArray(value) ? value.join(', ') : value}
            onChange={(e) => {
              setValue(field.name, e.target.value.split(',').map((v) => v.trim()).filter(Boolean));
            }}
          />
        );
        break;
      default:
        control = <Input {...commonProps} type={field.type || FIELD_TYPE_DEFAULT} />;
    }
    return (
      <div key={field.name} className={field.full || field.type === 'textarea' ? 'sm:col-span-2' : ''}>
        {field.type !== 'checkbox' ? (
          <label className="label" htmlFor={field.name}>
            {field.label} {field.required ? <span className="text-rose-500">*</span> : null}
          </label>
        ) : null}
        {field.type === 'checkbox' ? (
          <div>
            <Checkbox checked={!!raw} onChange={(checked) => setValue(field.name, checked)} label={field.label} />
          </div>
        ) : control}
        {field.help && !error ? <p className="text-[11px] text-ink-400 mt-1">{field.help}</p> : null}
        {error ? <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1"><Icon name="AlertCircle" className="w-3 h-3" />{error}</p> : null}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-5 max-h-[64vh] overflow-y-auto pr-1">
        {sections.map((sectionItem) => (
          <div key={sectionItem.name}>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-400 mb-2.5 pb-1.5 border-b border-ink-100">{sectionItem.name}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
              {sectionItem.fields.map(renderField)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-ink-100">
        {footerExtra}
        {onCancel ? <Button variant="secondary" onClick={onCancel}>Cancel</Button> : null}
        <Button type="submit" variant="primary" icon="Check">{submitLabel}</Button>
      </div>
    </form>
  );
}
