import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CrudModule from '../components/tables/CrudModule';
import { Badge, Button, IconButton, PageHeader, SectionCard, StatCard, StatusBadge, Tabs } from '../components/common/ui';
import { Modal } from '../components/common/Modal';
import { EntityForm } from '../components/common/forms';
import { recordStockMove, advancePurchaseRequest } from '../features/workflow/workflowThunks';
import { usePermissions } from '../hooks/usePermissions';
import { materialAvailable, materialStatus } from '../utils/calc';
import { inr, formatDate } from '../utils/format';

const STOCK_TYPES = ['Inward', 'Consumption', 'Reservation', 'Reservation Release', 'Wastage'];

export default function InventoryPage() {
  const dispatch = useDispatch();
  const { view, create, edit } = usePermissions();
  const [tab, setTab] = useState('materials');
  const [stockMaterial, setStockMaterial] = useState(null);
  const materials = useSelector((s) => s.materials.items);
  const suppliers = useSelector((s) => s.suppliers.items);
  const purchaseRequests = useSelector((s) => s.purchaseRequests.items);
  const stockMoves = useSelector((s) => s.stockMoves.items);
  const projects = useSelector((s) => s.projects.items);

  const lowStock = materials.filter((m) => materialStatus(m) === 'Low Stock');
  const outOfStock = materials.filter((m) => materialStatus(m) === 'Out of Stock');
  const stockValue = materials.reduce((a, m) => a + materialAvailable(m) * (Number(m.unitCost) || 0), 0);
  const pendingPR = purchaseRequests.filter((p) => p.status === 'Pending Approval');

  const recentMoves = [...stockMoves].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);

  return (
    <div>
      <PageHeader
        title="Inventory & Purchase"
        description="Raw material stock, project reservations, supplier register and purchase approvals."
        breadcrumbs={[{ label: 'Inventory' }]}
        meta={<Badge tone="gray">{materials.length} materials · {suppliers.length} suppliers</Badge>}
        actions={null}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Stock value available" value={inr(stockValue, { compact: true })} icon="Boxes" tone="brand" helper="Available × unit cost" />
        <StatCard label="Low stock" value={String(lowStock.length)} icon="AlertTriangle" tone="amber" helper={lowStock.slice(0, 2).map((m) => m.name.split(' ')[0]).join(', ') || 'All healthy'} />
        <StatCard label="Out of stock" value={String(outOfStock.length)} icon="Ban" tone="red" helper={outOfStock[0]?.name || 'None'} />
        <StatCard label="Purchase approvals" value={String(pendingPR.length)} icon="ShoppingCart" tone="violet" helper="Awaiting store approval" />
      </div>

      <div className="surface overflow-hidden">
        <div className="px-4">
          <Tabs
            tabs={[
              { key: 'materials', label: 'Materials', count: materials.length },
              { key: 'suppliers', label: 'Suppliers', count: suppliers.length },
              { key: 'purchases', label: 'Purchase Requests', count: purchaseRequests.length },
              { key: 'movements', label: 'Stock Movements', count: stockMoves.length },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>
        <div className="p-4">
          {tab === 'materials' ? (
            <CrudModule
              configKey="materials"
              embedded
              extraRowActions={(row) => edit('inventory') ? (
                <IconButton icon="ArrowLeftRight" label={`Stock movement for ${row.name}`} size="sm" tone="brand" onClick={() => setStockMaterial(row)} />
              ) : null}
            />
          ) : null}
          {tab === 'suppliers' ? <CrudModule configKey="suppliers" embedded detailEnabled={false} /> : null}
          {tab === 'purchases' ? <CrudModule configKey="purchaseRequests" embedded detailEnabled={false} extraRowActions={(row) => edit('inventory') && row.status === 'Pending Approval' ? (
            <Button size="xs" variant="secondary" onClick={() => dispatch(advancePurchaseRequest(row.id, 'Approved'))}>Approve</Button>
          ) : null} /> : null}
          {tab === 'movements' ? (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr><th>Movement</th><th>Material</th><th>Type</th><th className="text-right">Qty</th><th>Project</th><th>Date</th><th>Recorded by</th><th>Note</th></tr>
                </thead>
                <tbody>
                  {recentMoves.map((m) => {
                    const mat = materials.find((x) => x.id === m.materialId);
                    const project = projects.find((p) => p.id === m.projectId);
                    return (
                      <tr key={m.id}>
                        <td className="font-mono text-[11.5px] text-ink-500">{m.id}</td>
                        <td className="font-medium text-ink-900">{mat?.name || m.materialId}</td>
                        <td><Badge tone={m.type === 'Inward' ? 'green' : m.type === 'Wastage' ? 'red' : m.type === 'Reservation' ? 'violet' : 'blue'}>{m.type}</Badge></td>
                        <td className="text-right tabular-nums">{m.qty} {mat?.unit}</td>
                        <td>{project?.name || <span className="text-ink-400">Warehouse</span>}</td>
                        <td>{formatDate(m.date)}</td>
                        <td>{m.user}</td>
                        <td className="text-ink-500 text-[11.5px]">{m.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!recentMoves.length ? <p className="text-center text-[12px] text-ink-400 py-8">No stock movements recorded.</p> : null}
            </div>
          ) : null}
        </div>
      </div>

      <Modal open={!!stockMaterial} onClose={() => setStockMaterial(null)} title={`Stock movement · ${stockMaterial?.name || ''}`} subtitle="Record inward, consumption, reservation or wastage." size="md" icon="ArrowLeftRight">
        {stockMaterial ? (
          <div className="mb-4 grid grid-cols-3 gap-3 text-[12px]">
            <div className="rounded bg-ink-50 border border-ink-200 p-2.5"><p className="text-[10px] uppercase text-ink-400">Available</p><p className="font-semibold mt-0.5">{materialAvailable(stockMaterial)} {stockMaterial.unit}</p></div>
            <div className="rounded bg-ink-50 border border-ink-200 p-2.5"><p className="text-[10px] uppercase text-ink-400">Reserved</p><p className="font-semibold mt-0.5">{stockMaterial.reservedQty} {stockMaterial.unit}</p></div>
            <div className="rounded bg-ink-50 border border-ink-200 p-2.5"><p className="text-[10px] uppercase text-ink-400">Minimum</p><p className="font-semibold mt-0.5">{stockMaterial.minStock} {stockMaterial.unit}</p></div>
          </div>
        ) : null}
        <EntityForm
          fields={[
            { name: 'type', label: 'Movement Type', type: 'select', options: STOCK_TYPES, required: true, section: 'Stock Movement' },
            { name: 'qty', label: 'Quantity', type: 'number', min: 1, required: true, section: 'Stock Movement' },
            { name: 'projectId', label: 'Project (optional)', type: 'select', lookup: { collection: 'projects', label: 'name' }, section: 'Stock Movement' },
            { name: 'note', label: 'Note / Reference', type: 'textarea', full: true, section: 'Stock Movement' },
          ]}
          initialValues={{ type: 'Inward', qty: '', projectId: '', note: '' }}
          submitLabel="Record movement"
          onCancel={() => setStockMaterial(null)}
          onSubmit={(values) => {
            dispatch(recordStockMove(stockMaterial.id, values));
            setStockMaterial(null);
          }}
        />
      </Modal>
    </div>
  );
}
