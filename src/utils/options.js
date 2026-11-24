/** Resolve select/dropdown options from central masters or linked Redux collections. */
export const masterOptions = (masters, groupKey, includeInactive = false) => {
  const list = masters?.[groupKey] || [];
  return list
    .filter((m) => includeInactive || m.active)
    .map((m) => ({ value: m.name, label: m.name }));
};

export const collectionOptions = (items = [], { label = 'name', value = 'id', filter } = {}) =>
  items
    .filter((i) => (filter ? Object.entries(filter).every(([k, v]) => i[k] === v) : true))
    .map((i) => ({ value: i[value], label: typeof label === 'function' ? label(i) : i[label] }));

export const toOptions = (list = []) =>
  list.map((v) => (typeof v === 'string' ? { value: v, label: v } : v));

export const resolveFieldOptions = (field, state) => {
  if (!field) return [];
  if (Array.isArray(field.options)) return toOptions(field.options);
  if (field.master) return masterOptions(state.masters, field.master, field.includeInactive);
  if (field.lookup) {
    const lookup = typeof field.lookup === 'string' ? { collection: field.lookup } : field.lookup;
    const items = state[lookup.collection]?.items || [];
    const filtered = lookup.filterByRole
      ? items.filter((i) => i.role === lookup.filterByRole || i.role === 'worker')
      : items;
    return collectionOptions(filtered, {
      label: lookup.label || 'name',
      value: lookup.value || 'id',
      filter: lookup.filter,
    });
  }
  return [];
};

export const resolveLookupLabel = (lookup, value, state) => {
  if (!lookup || !value) return value || '—';
  const config = typeof lookup === 'string' ? { collection: lookup } : lookup;
  const items = state[config.collection]?.items || [];
  const match = items.find((i) => i[config.value || 'id'] === value);
  if (!match) return value;
  const labelKey = config.label || 'name';
  return typeof labelKey === 'function' ? labelKey(match) : match[labelKey];
};
