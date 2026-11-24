import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppLayout from '../layouts/AppLayout';
import { usePermissions } from '../hooks/usePermissions';
import { EmptyState, Button } from '../components/common/ui';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import CrudPage from '../pages/CrudPage';
import DetailPage from '../pages/DetailPage';
import InventoryPage from '../pages/InventoryPage';
import SettingsPage from '../pages/SettingsPage';
import ActivityPage from '../pages/ActivityPage';
import ReportsPage from '../pages/ReportsPage';
import NotFoundPage from '../pages/NotFoundPage';

function RequireAuth({ children }) {
  const authenticated = useSelector((s) => s.auth.isAuthenticated);
  const location = useLocation();
  if (!authenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function RequirePermission({ moduleKey, children }) {
  const { view } = usePermissions();
  if (!view(moduleKey)) {
    return (
      <div className="surface">
        <EmptyState
          icon="Lock"
          title="Access restricted"
          description="Your current role does not have permission to open this module. Switch roles from the header or return to your dashboard."
          action={<Button variant="primary" icon="LayoutDashboard" onClick={() => { window.location.href = '/dashboard'; }}>Go to dashboard</Button>}
        />
      </div>
    );
  }
  return children;
}

const guarded = (moduleKey, element) => <RequirePermission moduleKey={moduleKey}>{element}</RequirePermission>;

const LIST_ROUTES = [
  ['/customers', 'customers'],
  ['/leads', 'leads'],
  ['/measurements', 'measurements'],
  ['/quotations', 'quotations'],
  ['/sales-orders', 'salesOrders'],
  ['/projects', 'projects'],
  ['/products', 'products'],
  ['/production', 'production'],
  ['/quality', 'quality'],
  ['/dispatch', 'dispatch'],
  ['/installation', 'installation'],
  ['/inspections', 'inspections'],
  ['/accounts', 'invoices'],
  ['/service', 'service'],
];

const DETAIL_ROUTES = [
  ['/customers/:id', 'customers', 'customers'],
  ['/leads/:id', 'leads', 'leads'],
  ['/measurements/:id', 'measurements', 'measurements'],
  ['/quotations/:id', 'quotations', 'quotations'],
  ['/sales-orders/:id', 'salesOrders', 'salesOrders'],
  ['/projects/:id', 'projects', 'projects'],
  ['/products/:id', 'products', 'products'],
  ['/inventory/:id', 'materials', 'inventory'],
  ['/production/:id', 'production', 'production'],
  ['/quality/:id', 'quality', 'quality'],
  ['/dispatch/:id', 'dispatch', 'dispatch'],
  ['/installation/:id', 'installation', 'installation'],
  ['/inspections/:id', 'inspections', 'inspections'],
  ['/accounts/:id', 'invoices', 'accounts'],
  ['/service/:id', 'service', 'service'],
];

const PERMISSION_BY_CONFIG = {
  invoices: 'accounts',
  materials: 'inventory',
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        {LIST_ROUTES.map(([path, configKey]) => (
          <Route
            key={path}
            path={path}
            element={guarded(PERMISSION_BY_CONFIG[configKey] || configKey, <CrudPage configKey={configKey} />)}
          />
        ))}
        {DETAIL_ROUTES.map(([path, configKey, permission]) => (
          <Route
            key={path}
            path={path}
            element={guarded(permission || configKey, <DetailPage configKey={configKey} />)}
          />
        ))}
        <Route path="/inventory" element={guarded('inventory', <InventoryPage />)} />
        <Route path="/reports" element={guarded('reports', <ReportsPage />)} />
        <Route path="/settings" element={guarded('settings', <SettingsPage />)} />
        <Route path="/activity" element={guarded('activity', <ActivityPage />)} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
