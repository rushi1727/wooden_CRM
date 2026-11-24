import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Icon from '../common/Icon';
import { Button, IconButton } from '../common/ui';
import { Input, Select, Textarea } from '../common/forms';
import { PAYMENT_TERMS } from '../../data/masterData';
import { collectionOptions, masterOptions } from '../../utils/options';
import { quotationTotals } from '../../utils/calc';
import { inr, todayISO } from '../../utils/format';

const blankItem = () => ({
  id: `L-${Date.now()}-${Math.round(Math.random() * 999)}`,
  productId: '',
  doorType: '',
  design: '',
  material: '',
  finish: '',
  frameType: '',
  hardware: '',
  height: 2100,
  width: 900,
  qty: 1,
  unitPrice: 0,
  manufacturing: 0,
  installation: 0,
  transport: 0,
  notes: '',
});

const num = (v) => Number(v) || 0;

export default function QuotationForm({ initial = {}, onSubmit, onCancel, submitLabel = 'Save Quotation' }) {
  const state = useSelector((s) => s);
  const products = state.products.items;
  const customers = state.customers.items;
  const leads = state.leads.items;
  const employees = state.employees.items;
  const masters = state.masters;

  const [values, setValues] = useState({
    date: initial.date || todayISO(),
    validUntil: initial.validUntil || '',
    customerId: initial.customerId || '',
    leadId: initial.leadId || '',
    projectName: initial.projectName || '',
    billingAddress: initial.billingAddress || '',
    siteAddress: initial.siteAddress || '',
    paymentTerms: initial.paymentTerms || '40% Advance',
    deliveryTimeline: initial.deliveryTimeline || '45 days from order confirmation',
    discountPct: initial.discountPct ?? 0,
    gstPct: initial.gstPct ?? 18,
    preparedBy: initial.preparedBy || 'Priya Nair',
    salesExecutive: initial.salesExecutive || 'Ananya Iyer',
    terms: initial.terms || 'Payment as per agreed terms. Prices inclusive of hardware as specified. Site readiness required before installation. Warranty 12 months against manufacturing defects.',
  });
  const [items, setItems] = useState(initial.items?.length ? initial.items : [blankItem()]);
  const [errors, setErrors] = useState({});
  const [customerTouched, setCustomerTouched] = useState(!!initial.customerId);

  const totals = useMemo(() => quotationTotals({ items, discountPct: values.discountPct, gstPct: values.gstPct }), [items, values.discountPct, values.gstPct]);

  const set = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const applyCustomer = (customerId) => {
    const c = customers.find((x) => x.id === customerId);
    setValues((prev) => ({
      ...prev,
      customerId,
      billingAddress: c ? `${c.billingAddress}, ${c.city} ${c.pincode}` : prev.billingAddress,
      siteAddress: c ? `${c.siteAddress}, ${c.city} ${c.pincode}` : prev.siteAddress,
    }));
    if (customerId) setCustomerTouched(true);
    if (errors.customerId) setErrors((prev) => ({ ...prev, customerId: '' }));
  };

  const applyLead = (leadId) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) { setValues((prev) => ({ ...prev, leadId })); return; }
    setValues((prev) => ({
      ...prev,
      leadId,
      projectName: lead.projectName || prev.projectName,
      customerId: lead.customerId || prev.customerId,
      salesExecutive: lead.salesExecutive || prev.salesExecutive,
    }));
    if (lead.customerId) {
      const c = customers.find((x) => x.id === lead.customerId);
      if (c) {
        setValues((prev) => ({ ...prev, billingAddress: `${c.billingAddress}, ${c.city} ${c.pincode}`, siteAddress: `${c.siteAddress}, ${c.city} ${c.pincode}` }));
        setCustomerTouched(true);
      }
    }
  };

  const updateItem = (index, key, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const chooseProduct = (index, productId) => {
    const p = products.find((x) => x.id === productId);
    if (!p) { updateItem(index, 'productId', productId); return; }
    setItems((prev) => prev.map((item, i) => (i === index ? {
      ...item,
      productId,
      doorType: p.doorType,
      design: p.design,
      material: p.material,
      finish: p.finish,
      frameType: p.frameType,
      hardware: p.hardware,
      height: p.height,
      width: p.width,
      unitPrice: p.sellingPrice,
      manufacturing: 1800,
      installation: 1200,
      transport: 650,
    } : item)));
  };

  const submit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!values.customerId) nextErrors.customerId = 'Select a customer.';
    if (!values.projectName.trim()) nextErrors.projectName = 'Project name is required.';
    if (!values.validUntil) nextErrors.validUntil = 'Validity date is required.';
    if (!values.siteAddress.trim()) nextErrors.siteAddress = 'Site address is required.';
    if (!items.length) nextErrors.items = 'Add at least one door line.';
    if (items.some((i) => !i.productId)) nextErrors.items = 'Every line needs a door product.';
    if (items.some((i) => num(i.qty) <= 0)) nextErrors.items = 'Door quantity must be greater than zero.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSubmit?.({
      ...initial,
      ...values,
      discountPct: Number(values.discountPct) || 0,
      gstPct: Number(values.gstPct) || 0,
      items: items.map((item) => ({
        ...item,
        qty: num(item.qty),
        unitPrice: num(item.unitPrice),
        manufacturing: num(item.manufacturing),
        installation: num(item.installation),
        transport: num(item.transport),
      })),
    });
  };

  const productOptions = collectionOptions(products, { label: (p) => `${p.name} · ${p.id}`, value: 'id' });
  const customerOptions = collectionOptions(customers, { label: (c) => `${c.name} (${c.id})`, value: 'id' });
  const leadOptions = collectionOptions(leads, { label: (l) => `${l.id} · ${l.projectName}`, value: 'id' });
  const salesOptions = collectionOptions(employees.filter((e) => ['sales', 'estimation', 'super_admin'].includes(e.role)), { label: 'name', value: 'name' });
  const estimationOptions = collectionOptions(employees.filter((e) => ['estimation', 'super_admin'].includes(e.role)), { label: 'name', value: 'name' });

  return (
    <form onSubmit={submit} noValidate>
      <div className="max-h-[66vh] overflow-y-auto pr-1 space-y-5">
        <section>
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-400 mb-2.5 pb-1.5 border-b border-ink-100">Customer & project</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">Customer <span className="text-rose-500">*</span></label>
              <Select value={values.customerId} onChange={(e) => applyCustomer(e.target.value)} options={customerOptions} placeholder="Select customer" />
              {errors.customerId ? <p className="text-[11px] text-rose-600 mt-1">{errors.customerId}</p> : null}
            </div>
            <div>
              <label className="label">Lead reference</label>
              <Select value={values.leadId} onChange={(e) => applyLead(e.target.value)} options={leadOptions} placeholder="Optional lead" />
            </div>
            <div>
              <label className="label">Project name <span className="text-rose-500">*</span></label>
              <Input value={values.projectName} onChange={(e) => set('projectName', e.target.value)} placeholder="Project name" />
              {errors.projectName ? <p className="text-[11px] text-rose-600 mt-1">{errors.projectName}</p> : null}
            </div>
            <div>
              <label className="label">Quotation date</label>
              <Input type="date" value={values.date} onChange={(e) => set('date', e.target.value)} />
            </div>
            <div>
              <label className="label">Valid until <span className="text-rose-500">*</span></label>
              <Input type="date" value={values.validUntil} onChange={(e) => set('validUntil', e.target.value)} />
              {errors.validUntil ? <p className="text-[11px] text-rose-600 mt-1">{errors.validUntil}</p> : null}
            </div>
            <div>
              <label className="label">Sales executive</label>
              <Select value={values.salesExecutive} onChange={(e) => set('salesExecutive', e.target.value)} options={salesOptions} placeholder="Select sales" />
            </div>
            <div className="sm:col-span-3 grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Billing address</label>
                <Textarea rows={2} value={values.billingAddress} onChange={(e) => set('billingAddress', e.target.value)} />
              </div>
              <div>
                <label className="label">Site address <span className="text-rose-500">*</span></label>
                <Textarea rows={2} value={values.siteAddress} onChange={(e) => set('siteAddress', e.target.value)} />
                {errors.siteAddress ? <p className="text-[11px] text-rose-600 mt-1">{errors.siteAddress}</p> : null}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-ink-100">
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">Door line items <span className="text-rose-500">*</span></p>
            <Button size="xs" variant="secondary" icon="Plus" onClick={() => setItems((prev) => [...prev, blankItem()])}>Add line</Button>
          </div>
          <div className="border border-ink-200 rounded-md overflow-x-auto">
            <table className="w-full text-[11.5px] min-w-[1040px]">
              <thead>
                <tr className="bg-ink-50 text-ink-500 text-[10px] uppercase tracking-wider">
                  <th className="text-left px-2 py-2 font-semibold">Door product</th>
                  <th className="text-left px-2 py-2 font-semibold w-[130px]">Specification</th>
                  <th className="text-right px-2 py-2 font-semibold w-14">Qty</th>
                  <th className="text-right px-2 py-2 font-semibold w-24">Rate (₹)</th>
                  <th className="text-right px-2 py-2 font-semibold w-24">Mfg (₹)</th>
                  <th className="text-right px-2 py-2 font-semibold w-24">Install (₹)</th>
                  <th className="text-right px-2 py-2 font-semibold w-24">Transport</th>
                  <th className="text-right px-2 py-2 font-semibold w-24">Amount</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const lineAmount = num(item.qty) * (num(item.unitPrice) + num(item.manufacturing) + num(item.installation) + num(item.transport));
                  return (
                    <tr key={item.id} className="border-t border-ink-100 align-top">
                      <td className="px-2 py-2 min-w-[190px]">
                        <select value={item.productId} onChange={(e) => chooseProduct(index, e.target.value)} className="input-base h-8 text-[11.5px]" aria-label={`Product for line ${index + 1}`}>
                          <option value="">Select door</option>
                          {productOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <div className="mt-1 text-[10px] text-ink-400 leading-4">
                          {item.design || 'Door design'} · {item.material || 'material'} · {item.finish || 'finish'}
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="text-[10.5px] text-ink-500 leading-4">{item.doorType || '—'}</div>
                        <div className="text-[10px] text-ink-400">{item.height}×{item.width} mm</div>
                        <div className="text-[10px] text-ink-400">{item.frameType}</div>
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="1" value={item.qty} onChange={(e) => updateItem(index, 'qty', e.target.value)} className="input-base h-8 w-14 text-right text-[11.5px]" />
                      </td>
                      <td className="px-2 py-2"><input type="number" min="0" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', e.target.value)} className="input-base h-8 w-24 text-right text-[11.5px]" /></td>
                      <td className="px-2 py-2"><input type="number" min="0" value={item.manufacturing} onChange={(e) => updateItem(index, 'manufacturing', e.target.value)} className="input-base h-8 w-24 text-right text-[11.5px]" /></td>
                      <td className="px-2 py-2"><input type="number" min="0" value={item.installation} onChange={(e) => updateItem(index, 'installation', e.target.value)} className="input-base h-8 w-24 text-right text-[11.5px]" /></td>
                      <td className="px-2 py-2"><input type="number" min="0" value={item.transport} onChange={(e) => updateItem(index, 'transport', e.target.value)} className="input-base h-8 w-24 text-right text-[11.5px]" /></td>
                      <td className="px-2 py-2 text-right tabular-nums font-medium text-ink-800 whitespace-nowrap">{inr(lineAmount)}</td>
                      <td className="px-1 py-2">
                        <IconButton icon="Trash2" label="Remove line" size="sm" tone="danger" disabled={items.length === 1} onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {errors.items ? <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1"><Icon name="AlertCircle" className="w-3 h-3" />{errors.items}</p> : null}
          <div className="mt-3 flex justify-end">
            <div className="w-full max-w-[320px] text-[12px] space-y-1.5">
              <div className="flex justify-between text-ink-600"><span>Subtotal</span><span className="tabular-nums">{inr(totals.subtotal)}</span></div>
              <div className="flex justify-between text-ink-600"><span>Discount ({values.discountPct}%)</span><span className="tabular-nums text-rose-600">− {inr(totals.discount)}</span></div>
              <div className="flex justify-between text-ink-600"><span>GST ({values.gstPct}%)</span><span className="tabular-nums">{inr(totals.gst)}</span></div>
              <div className="flex justify-between pt-1.5 border-t border-ink-200 font-semibold text-ink-900 text-[13.5px]"><span>Grand total</span><span className="tabular-nums">{inr(totals.grandTotal)}</span></div>
              <div className="text-[10.5px] text-ink-400 text-right">{totals.totalQty} doors · incl. GST</div>
            </div>
          </div>
        </section>

        <section>
          <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-400 mb-2.5 pb-1.5 border-b border-ink-100">Commercials & terms</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="label">Discount (%)</label>
              <Input type="number" min="0" max="100" value={values.discountPct} onChange={(e) => set('discountPct', e.target.value)} />
            </div>
            <div>
              <label className="label">GST (%)</label>
              <Input type="number" min="0" max="28" step="0.5" value={values.gstPct} onChange={(e) => set('gstPct', e.target.value)} />
            </div>
            <div>
              <label className="label">Payment terms</label>
              <Select value={values.paymentTerms} onChange={(e) => set('paymentTerms', e.target.value)} options={PAYMENT_TERMS} placeholder="Select terms" />
            </div>
            <div>
              <label className="label">Prepared by</label>
              <Select value={values.preparedBy} onChange={(e) => set('preparedBy', e.target.value)} options={estimationOptions} placeholder="Select estimator" />
            </div>
            <div className="col-span-2">
              <label className="label">Delivery timeline</label>
              <Input value={values.deliveryTimeline} onChange={(e) => set('deliveryTimeline', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <Input value={values.remarks || ''} onChange={(e) => set('remarks', e.target.value)} placeholder="Internal notes" />
            </div>
            <div className="col-span-2 sm:col-span-4">
              <label className="label">Terms & conditions</label>
              <Textarea rows={2} value={values.terms} onChange={(e) => set('terms', e.target.value)} />
            </div>
          </div>
        </section>
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-ink-100">
        <p className="text-[10.5px] text-ink-400">Quotation totals are calculated automatically.</p>
        <div className="flex items-center gap-2">
          {onCancel ? <Button variant="secondary" onClick={onCancel}>Cancel</Button> : null}
          <Button type="submit" variant="primary" icon="Check">{submitLabel}</Button>
        </div>
      </div>
    </form>
  );
}
