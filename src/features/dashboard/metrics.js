import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ROLES } from '../../data/masterData';
import { applyScope } from '../../utils/permissions';
import {
  quotationTotals, invoiceTotals, invoiceStatus, leadConversionRate,
  materialAvailable, materialStatus,
} from '../../utils/calc';
import { inr, num, pct, todayISO, formatShortDate, daysUntil } from '../../utils/format';

const TODAY = todayISO();
const YEAR = TODAY.slice(0, 4);
const MONTH_KEYS = Array.from({ length: 12 }, (_, i) => `${YEAR}-${String(i + 1).padStart(2, '0')}`);
const MONTH_NAMES = MONTH_KEYS.map((m) => new Date(`${m}-01T00:00:00`).toLocaleString('en-IN', { month: 'short' }));

const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const sum = (list, fn) => list.reduce((a, item) => a + (Number(fn(item)) || 0), 0);
const startOfQuarter = () => {
  const month = Number(TODAY.slice(5, 7));
  const qStart = Math.floor((month - 1) / 3) * 3 + 1;
  return `${YEAR}-${String(qStart).padStart(2, '0')}-01`;
};

const rangeBounds = (range = {}) => {
  switch (range.key) {
    case 'today': return { start: TODAY, end: TODAY };
    case 'week': return { start: addDays(TODAY, -6), end: TODAY };
    case 'month': return { start: `${TODAY.slice(0, 7)}-01`, end: TODAY };
    case 'quarter': return { start: startOfQuarter(), end: TODAY };
    case 'year': return { start: `${YEAR}-01-01`, end: TODAY };
    case 'custom': return { start: range.from || null, end: range.to || null };
    default: return { start: null, end: null };
  }
};

const monthSeries = (list, dateFn, valueFn = () => 1) =>
  MONTH_KEYS.map((key, i) => {
    const value = list.reduce((a, item) => {
      const date = dateFn(item);
      if (!date || String(date).slice(0, 7) !== key) return a;
      return a + valueFn(item);
    }, 0);
    return { month: key, name: MONTH_NAMES[i], value };
  });

const queueItem = (item) => item;

export function useDashboardMetrics(range = { key: 'year' }) {
  const state = useSelector((s) => s);

  return useMemo(() => {
    const role = state.auth.role;
    const user = ROLES[role]?.user || '';
    const { start, end } = rangeBounds(range);
    const inRange = (date) => {
      if (!date) return false;
      const d = String(date).slice(0, 10);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    };

    const customers = state.customers.items;
    const leadsAll = state.leads.items;
    const quotationsAll = state.quotations.items;
    const ordersAll = state.salesOrders.items;
    const projects = state.projects.items;
    const production = state.production.items;
    const quality = state.qualityInspections.items;
    const dispatches = state.dispatches.items;
    const installations = state.installations.items;
    const inspections = state.siteInspections.items;
    const invoices = state.invoices.items;
    const service = state.serviceTickets.items;
    const materials = state.materials.items;
    const purchaseRequests = state.purchaseRequests.items;
    const employees = state.employees.items;
    const activities = state.activities.items;
    const notifications = state.notifications.items;

    const leads = leadsAll.filter((l) => inRange(l.date));
    const quotations = quotationsAll.filter((q) => inRange(q.date));
    const orders = ordersAll.filter((o) => inRange(o.date));
    const invoicesInRange = invoices.filter((i) => inRange(i.invoiceDate));

    const scoped = (collection) => applyScope(role, user, collection, state[collection].items);
    const myLeadsAll = scoped('leads');
    const myQuotesAll = scoped('quotations');
    const myOrdersAll = scoped('salesOrders');
    const myProjectsAll = scoped('projects');
    const myProductionAll = scoped('production');
    const myInstallationsAll = scoped('installations');
    const myInspectionsAll = scoped('siteInspections');
    const myQcAll = scoped('qualityInspections');
    const myCustomersAll = scoped('customers');

    /* -------- aggregates -------- */
    const openLeads = leads.filter((l) => !['Won', 'Lost'].includes(l.status));
    const newLeads = leads.filter((l) => l.status === 'New');
    const followUpLeads = leads.filter((l) => !['Won', 'Lost'].includes(l.status) && l.followUpDate);
    const pendingQuotes = quotations.filter((q) => q.status === 'Pending Approval');
    const approvedQuotes = quotations.filter((q) => ['Approved', 'Sent', 'Accepted', 'Converted'].includes(q.status));
    const quotationConversion = leadConversionRate(leads);
    const totalQuotedValue = sum(quotations, (q) => quotationTotals(q).grandTotal);
    const confirmedOrders = orders.filter((o) => !['Draft', 'Cancelled'].includes(o.status));
    const activeProjects = projects.filter((p) => !['Completed', 'Cancelled'].includes(p.status));
    const completedProjects = projects.filter((p) => p.status === 'Completed');
    const projectValue = sum(projects, (p) => p.budget);
    const totalDoors = sum(projects, (p) => p.totalDoors);

    const doorsInProductionList = production.filter((p) => p.status === 'In Progress');
    const productionCompleted = production.filter((p) => p.status === 'Quality Approved');
    const pendingQc = quality.filter((q) => q.status === 'Pending');
    const rejectedQc = quality.filter((q) => q.status === 'Rejected');
    const qcApproved = quality.filter((q) => q.status === 'Approved');

    const dispatchedDoorNumbers = dispatches.flatMap((d) => (d.doorNumbers || []).map((n) => `${d.projectId}::${n}`));
    const qcReady = quality.filter((q) => q.status === 'Approved' && !dispatchedDoorNumbers.includes(`${q.projectId}::${q.doorNumber}`));
    const inTransitCount = dispatches.filter((d) => d.status === 'In Transit').length;
    const deliveredCount = dispatches.filter((d) => d.status === 'Delivered').length;
    const dispatchIssues = dispatches.filter((d) => d.status === 'Delivery Issue').length;
    const installInProgress = installations.filter((i) => i.status === 'In Progress');
    const installInspectionPending = installations.filter((i) => i.status === 'Inspection Pending');
    const installedCount = installations.filter((i) => ['Completed', 'Inspection Pending'].includes(i.status)).length;
    const sitePending = inspections.filter((i) => i.status === 'Pending Inspection');
    const siteApproved = inspections.filter((i) => i.status === 'Approved');
    const snags = inspections.filter((i) => ['Snag Raised', 'Rejected', 'Rework Required'].includes(i.status));

    const invoicesWithDerived = invoices.map((inv) => ({ ...inv, derivedStatus: invoiceStatus(inv), ...invoiceTotals(inv) }));
    const invoicesToBill = invoicesInRange.filter((i) => i.status !== 'Draft').map((i) => ({ ...i, derivedStatus: invoiceStatus(i), ...invoiceTotals(i) }));
    const paymentRows = invoices.flatMap((inv) => (inv.payments || []).map((p) => ({ ...p, invoiceId: inv.id })));
    const collected = sum(paymentRows.filter((p) => inRange(p.date)), (p) => p.amount);
    const invoiced = sum(invoicesToBill, (i) => i.total);
    const outstanding = sum(invoicesWithDerived.filter((i) => i.status !== 'Draft'), (i) => i.outstanding);
    const overdue = invoicesWithDerived.filter((i) => i.derivedStatus === 'Overdue');
    const paidInvoices = invoicesWithDerived.filter((i) => i.derivedStatus === 'Paid');
    const collectionRate = invoiced ? Math.round((collected / invoiced) * 100) : 0;

    const lowStock = materials.filter((m) => materialStatus(m) === 'Low Stock');
    const outOfStock = materials.filter((m) => materialStatus(m) === 'Out of Stock');
    const reservedStockValue = sum(materials, (m) => (Number(m.reservedQty) || 0) * (Number(m.unitCost) || 0));
    const pendingPRs = purchaseRequests.filter((p) => p.status === 'Pending Approval');

    const openService = service.filter((s) => !['Resolved', 'Closed'].includes(s.status));
    const highPriorityService = openService.filter((s) => ['High', 'Urgent'].includes(s.priority));
    const resolvedThisMonth = service.filter((s) => ['Resolved', 'Closed'].includes(s.status) && (s.serviceDate || '').slice(0, 7) === TODAY.slice(0, 7));
    const activeWarranties = service.filter((s) => s.warrantyEnd && s.warrantyEnd >= TODAY);

    const myOpenLeads = myLeadsAll.filter((l) => !['Won', 'Lost'].includes(l.status));
    const myFollowUps = myLeadsAll.filter((l) => !['Won', 'Lost'].includes(l.status) && l.followUpDate && l.followUpDate <= addDays(TODAY, 3));
    const mySoldQuotes = myQuotesAll.filter((q) => ['Sent', 'Accepted', 'Converted'].includes(q.status));
    const myAwaitingQuotes = myQuotesAll.filter((q) => q.status === 'Sent');
    const myOrderValue = sum(myOrdersAll.filter((o) => o.status !== 'Cancelled'), (o) => o.value);
    const myActiveProjects = myProjectsAll.filter((p) => !['Completed', 'Cancelled'].includes(p.status));
    const myDelayed = myActiveProjects.filter((p) => p.endDate && p.endDate < TODAY);
    const myProjectIds = myProjectsAll.map((p) => p.id);
    const myProjectDoorsProducing = production.filter((p) => p.status === 'In Progress' && myProjectIds.includes(p.projectId));
    const mySitePending = inspections.filter((i) => i.status === 'Pending Inspection' && myProjectIds.includes(i.projectId));
    const myActiveProduction = myProductionAll.filter((p) => !['Quality Approved'].includes(p.status));
    const myQcPending = myQcAll.filter((q) => q.status === 'Pending');
    const myActiveInstallations = myInstallationsAll.filter((i) => !['Completed'].includes(i.status));
    const myInstalling = myInstallationsAll.filter((i) => i.status === 'In Progress');
    const myInspectionPending = myInspectionsAll.filter((i) => i.status === 'Pending Inspection');
    const myApprovedInspections = myInspectionsAll.filter((i) => i.status === 'Approved');
    const mySnags = myInspectionsAll.filter((i) => ['Snag Raised', 'Rejected', 'Rework Required'].includes(i.status));
    const myReworkJobs = myInstallationsAll.filter((i) => i.status === 'Rework Required');

    const qcRejectionRate = quality.length ? Math.round((rejectedQc.length / quality.length) * 100) : 0;
    const outputThisMonth = productionCompleted.filter((p) => (p.actualEnd || '').slice(0, 7) === TODAY.slice(0, 7)).length;

    /* -------- KPI dictionary -------- */
    const k = (label, value, icon, tone, helper) => ({ label, value, icon, tone, helper });

    const kpis = {
      totalCustomers: k('Total customers', num(customers.length), 'Users', 'blue', `${customers.filter((c) => c.status === 'Active').length} active`),
      activeCustomers: k('Active customers', num(customers.filter((c) => c.status === 'Active').length), 'Users', 'blue', 'Accounts in good standing'),
      totalLeads: k('Total leads', num(leads.length), 'Target', 'brand', `${newLeads.length} new enquiries`),
      newLeads: k('New leads', num(newLeads.length), 'Sparkles', 'blue', 'Awaiting first contact'),
      followUpLeads: k('Leads in follow-up', num(followUpLeads.length), 'CalendarClock', 'amber', 'Open with a follow-up date'),
      leadConversion: k('Lead conversion', pct(leadConversionRate(leads)), 'TrendingUp', 'green', 'Won vs closed leads'),
      totalQuotations: k('Total quotations', num(quotations.length), 'FileText', 'violet', inr(totalQuotedValue, { compact: true }) + ' quoted'),
      quotationsPending: k('Quotations pending', num(pendingQuotes.length), 'Clock', 'amber', 'Awaiting approval'),
      quotationsApproved: k('Quotations approved', num(approvedQuotes.length), 'FileCheck2', 'green', 'Approved or sent'),
      quotationConversion: k('Quotation conversion', pct(quotationsAll.length ? Math.round((approvedQuotes.length / quotationsAll.length) * 100) : 0), 'Gauge', 'teal', 'Approved ÷ total quotations'),
      totalQuotedValue: k('Quoted value', inr(totalQuotedValue, { compact: true }), 'FileText', 'violet', `${quotations.length} quotations`),
      totalOrders: k('Sales orders', num(ordersAll.length), 'ClipboardList', 'blue', `${confirmedOrders.length} confirmed`),
      confirmedOrders: k('Confirmed orders', num(confirmedOrders.length), 'BadgeCheck', 'green', 'Ready for planning or delivery'),
      activeProjects: k('Active projects', num(activeProjects.length), 'FolderKanban', 'blue', `${projects.filter((p) => p.status === 'On Hold').length} on hold`),
      projectsOnHold: k('Projects on hold', num(projects.filter((p) => p.status === 'On Hold').length), 'Pause', 'amber', 'Blocked or paused'),
      completedProjects: k('Completed projects', num(completedProjects.length), 'CheckCircle2', 'green', 'Site approved & closed'),
      projectValue: k('Project value', inr(projectValue, { compact: true }), 'IndianRupee', 'teal', 'Total booked budget'),
      totalDoors: k('Doors ordered', num(totalDoors), 'DoorOpen', 'brand', 'Across all projects'),
      doorsInProduction: k('Doors in production', num(doorsInProductionList.length), 'Factory', 'amber', 'On the shop floor'),
      productionCompleted: k('Production completed', num(productionCompleted.length), 'PackageCheck', 'green', 'QC approved output'),
      doorsAwaitingQc: k('Awaiting QC', num(pendingQc.length), 'ShieldAlert', 'amber', 'Inspection pending'),
      qualityRejected: k('QC rejected', num(rejectedQc.length), 'CircleAlert', 'red', 'Returned for rework'),
      readyForDispatch: k('Ready for dispatch', num(qcReady.length), 'PackageCheck', 'cyan', 'QC passed, not dispatched'),
      inTransit: k('In transit', num(inTransitCount), 'Truck', 'violet', 'Vehicles on the road'),
      deliveredDispatches: k('Delivered consignments', num(deliveredCount), 'PackageCheck', 'green', 'Received at site'),
      installationInProgress: k('Installation in progress', num(installInProgress.length), 'Hammer', 'violet', 'Teams on site'),
      installationPendingApproval: k('Installation pending approval', num(installInspectionPending.length), 'ClipboardCheck', 'amber', 'Awaiting site inspection'),
      doorsInstalled: k('Doors installed', num(installedCount), 'CheckCircle2', 'green', 'Installed or under inspection'),
      siteApprovalsPending: k('Site approvals pending', num(sitePending.length), 'ClipboardCheck', 'amber', `${snags.length} snags open`),
      invoicedAmount: k('Invoiced amount', inr(invoiced, { compact: true }), 'Receipt', 'blue', `${invoicesInRange.length} invoices in range`),
      collectedAmount: k('Collected amount', inr(collected, { compact: true }), 'Wallet', 'green', 'Payments received'),
      outstandingAmount: k('Outstanding amount', inr(outstanding, { compact: true }), 'CircleDollarSign', 'red', `${overdue.length} invoices overdue`),
      overdueInvoices: k('Overdue invoices', num(overdue.length), 'Timer', 'red', inr(sum(overdue, (i) => i.outstanding), { compact: true }) + ' overdue'),
      paidInvoices: k('Paid invoices', num(paidInvoices.length), 'CheckCheck', 'green', 'Fully settled'),
      collectionRate: k('Collection rate', pct(collectionRate), 'Gauge', 'teal', 'Collected vs invoiced'),
      warrantyComplaints: k('Warranty complaints', num(openService.length), 'Wrench', 'amber', `${highPriorityService.length} high priority`),
      lowStockItems: k('Low stock items', num(lowStock.length), 'AlertTriangle', 'amber', 'At or below minimum'),
      outOfStockItems: k('Out of stock', num(outOfStock.length), 'Ban', 'red', 'Blocking production'),
      reservedStockValue: k('Reserved stock value', inr(reservedStockValue, { compact: true }), 'Boxes', 'violet', 'Reserved against projects'),
      pendingPurchaseRequests: k('Purchase approvals', num(pendingPRs.length), 'ShoppingCart', 'amber', 'Awaiting approval'),
      totalMaterials: k('Materials tracked', num(materials.length), 'Boxes', 'blue', `${materials.filter((m) => materialAvailable(m) > 0).length} available`),
      myLeads: k('My open leads', num(myOpenLeads.length), 'Target', 'brand', `${myLeadsAll.length} total assigned`),
      myFollowUps: k('Follow-ups due', num(myFollowUps.length), 'CalendarClock', 'amber', 'Due within 3 days'),
      myQuotesSent: k('Quotations sent', num(mySoldQuotes.length), 'Send', 'blue', `${myQuotesAll.length} prepared`),
      myQuoteAwaiting: k('Awaiting customer', num(myAwaitingQuotes.length), 'Clock', 'amber', 'Sent, no response yet'),
      myOrderValue: k('My order value', inr(myOrderValue, { compact: true }), 'IndianRupee', 'green', `${myOrdersAll.length} orders`),
      myWinRate: k('Win rate', pct(leadConversionRate(myLeadsAll)), 'TrendingUp', 'teal', 'Closed lead conversion'),
      myCustomers: k('My customers', num(myCustomersAll.length), 'Users', 'blue', 'Assigned accounts'),
      myQuotes: k('My quotations', num(myQuotesAll.length), 'FileText', 'violet', 'Prepared for my leads'),
      estimationPending: k('Awaiting approval', num(pendingQuotes.length), 'Clock', 'amber', 'Quotations to review'),
      estimationDrafts: k('Draft quotations', num(quotationsAll.filter((q) => q.status === 'Draft').length), 'FileText', 'blue', 'Not submitted yet'),
      acceptedQuotes: k('Accepted quotations', num(quotationsAll.filter((q) => ['Accepted', 'Converted'].includes(q.status)).length), 'CheckCircle2', 'green', 'Ready or converted to orders'),
      myProjects: k('My active projects', num(myActiveProjects.length), 'FolderKanban', 'blue', `${myProjectsAll.length} total assigned`),
      myDelayedProjects: k('Delayed projects', num(myDelayed.length), 'Timer', 'red', 'Past target completion'),
      myProjectBudget: k('My project budget', inr(sum(myActiveProjects, (p) => p.budget), { compact: true }), 'IndianRupee', 'teal', 'Active portfolio value'),
      myCompletedProjects: k('Completed projects', num(myProjectsAll.filter((p) => p.status === 'Completed').length), 'CheckCircle2', 'green', 'Handed over'),
      myDoorsInProduction: k('My doors in production', num(myProjectDoorsProducing.length), 'Factory', 'amber', 'On the shop floor'),
      mySitePending: k('Site approvals pending', num(mySitePending.length), 'ClipboardCheck', 'amber', 'In my projects'),
      myProduction: k('My production jobs', num(myActiveProduction.length), 'Factory', 'brand', `${myProductionAll.length} assigned`),
      myProductionInProgress: k('In progress', num(myProductionAll.filter((p) => p.status === 'In Progress').length), 'Hammer', 'amber', 'On the shop floor'),
      myMaterialPending: k('Material pending', num(myProductionAll.filter((p) => p.status === 'Material Pending').length), 'Boxes', 'red', 'Blocked on stores'),
      myPendingQc: k('Awaiting QC', num(myQcAll.filter((q) => q.status === 'Pending').length), 'ShieldCheck', 'cyan', 'Inspection queue'),
      myInstallations: k('My installation jobs', num(myActiveInstallations.length), 'Hammer', 'violet', `${myInstallationsAll.length} assigned`),
      myInstallationInProgress: k('Installation in progress', num(myInstalling.length), 'Hardhat', 'violet', 'Crews on site'),
      myInspectionPending: k('Awaiting inspection', num(myInspectionPending.length), 'ClipboardCheck', 'amber', 'Doors to inspect'),
      myRework: k('Rework jobs', num(myReworkJobs.length), 'RotateCcw', 'red', 'Corrections pending'),
      myApprovedInspections: k('Approved inspections', num(myApprovedInspections.length), 'CheckCircle2', 'green', 'Passed at site'),
      mySnags: k('Open snags', num(mySnags.length), 'AlertTriangle', 'red', 'Rejected or rework'),
      qcRejectionRate: k('QC rejection rate', pct(qcRejectionRate), 'ShieldAlert', 'red', `${rejectedQc.length} of ${quality.length} inspections`),
      qcRework: k('Rework queue', num(production.filter((p) => p.status === 'Rework Required').length), 'RotateCcw', 'red', 'Doors back in production'),
      productionOutputMonth: k('Output this month', num(outputThisMonth), 'PackageCheck', 'green', 'QC approved doors'),
      dispatchIssues: k('Delivery issues', num(dispatchIssues), 'CircleAlert', 'red', 'Requires follow-up'),
      serviceOpen: k('Open complaints', num(openService.length), 'Wrench', 'amber', 'Active service tickets'),
      serviceHighPriority: k('High priority', num(highPriorityService.length), 'AlertTriangle', 'red', 'Attend immediately'),
      resolvedThisMonth: k('Resolved this month', num(resolvedThisMonth.length), 'CheckCircle2', 'green', 'Closed complaints'),
      activeWarranties: k('Active warranty doors', num(activeWarranties.length), 'ShieldCheck', 'blue', 'Under warranty'),
      totalTickets: k('Total service tickets', num(service.length), 'Wrench', 'blue', `${service.filter((s) => s.status === 'Closed').length} closed`),
    };

    /* -------- charts -------- */
    const statusCounts = (list, key = 'status') => {
      const map = new Map();
      list.forEach((item) => {
        const value = item[key];
        if (!value) return;
        map.set(value, (map.get(value) || 0) + 1);
      });
      return [...map.entries()].map(([name, value]) => ({ name, value }));
    };

    const leadTrendRaw = monthSeries(leadsAll, (l) => l.date);
    const wonTrendRaw = monthSeries(leadsAll.filter((l) => l.status === 'Won'), (l) => l.date);

    const charts = {
      leadsTrend: {
        data: MONTH_NAMES.map((name, i) => ({ name, Created: leadTrendRaw[i].value, Won: wonTrendRaw[i].value })),
        series: [{ key: 'Created', name: 'Created', color: '#b97f3f' }, { key: 'Won', name: 'Won', color: '#10b981' }],
      },
      quotationStatus: { data: statusCounts(quotationsAll) },
      projectStatus: { data: statusCounts(projects) },
      productionOutput: {
        data: monthSeries(productionCompleted, (p) => p.actualEnd || p.plannedEnd).map((m) => ({ name: m.name, Doors: m.value })),
      },
      installationStatus: { data: statusCounts(installations) },
      revenueTrend: {
        data: MONTH_KEYS.map((key, i) => ({
          name: MONTH_NAMES[i],
          Collected: sum(paymentRows.filter((p) => String(p.date || '').slice(0, 7) === key), (p) => p.amount),
        })),
      },
      employeeWorkload: {
        data: employees
          .map((emp) => {
            const count =
              projects.filter((p) => p.manager === emp.name && p.status !== 'Completed').length
              + production.filter((p) => p.mistri === emp.name && !['Quality Approved'].includes(p.status)).length
              + installations.filter((i) => i.supervisor === emp.name && i.status !== 'Completed').length
              + quality.filter((q) => q.inspector === emp.name && q.status === 'Pending').length
              + inspections.filter((i) => i.supervisor === emp.name && i.status === 'Pending Inspection').length;
            return { name: emp.name.split(' ')[0] + ' ' + (emp.name.split(' ')[1]?.[0] || ''), full: emp.name, tasks: count, role: emp.role };
          })
          .filter((e) => e.tasks > 0)
          .sort((a, b) => b.tasks - a.tasks)
          .slice(0, 7),
      },
      qcRejectionRate: {
        data: MONTH_NAMES.map((name, i) => {
          const monthQc = quality.filter((q) => String(q.date || '').slice(0, 7) === MONTH_KEYS[i]);
          const rejected = monthQc.filter((q) => q.status === 'Rejected').length;
          return { name, Rejection: monthQc.length ? Math.round((rejected / monthQc.length) * 100) : 0, Inspections: monthQc.length };
        }),
      },
      projectCompletion: {
        data: monthSeries(completedProjects, (p) => (p.closedAt || p.endDate)).map((m) => ({ name: m.name, Completed: m.value })),
      },
      leadFunnel: { data: statusCounts(leadsAll) },
      quotationValueTrend: {
        data: MONTH_NAMES.map((name, i) => {
          const monthQuotes = quotationsAll.filter((q) => String(q.date || '').slice(0, 7) === MONTH_KEYS[i]);
          return { name, Value: sum(monthQuotes, (q) => quotationTotals(q).grandTotal) };
        }),
      },
      productionStatus: { data: statusCounts(production) },
      stockByCategory: {
        data: [...new Set(materials.map((m) => m.category))].map((cat) => ({
          name: cat,
          value: sum(materials.filter((m) => m.category === cat), (m) => materialAvailable(m) * (Number(m.unitCost) || 0)),
        })).filter((d) => d.value > 0),
      },
      dispatchStatus: { data: statusCounts(dispatches) },
      dispatchTrend: {
        data: monthSeries(dispatches, (d) => d.dispatchDate).map((m) => ({ name: m.name, Dispatches: m.value })),
      },
      installationTrend: {
        data: monthSeries(installations.filter((i) => ['Completed', 'Inspection Pending'].includes(i.status)), (i) => i.actualDate).map((m) => ({ name: m.name, Installed: m.value })),
      },
      inspectionStatus: { data: statusCounts(inspections) },
      invoiceStatus: { data: statusCounts(invoicesWithDerived, 'derivedStatus') },
      serviceStatus: { data: statusCounts(service) },
      serviceTypes: { data: statusCounts(service, 'complaintType') },
      qcOutcomes: {
        data: [
          { name: 'Approved', value: qcApproved.length, color: '#10b981' },
          { name: 'Pending', value: pendingQc.length, color: '#f59e0b' },
          { name: 'Rejected', value: rejectedQc.length, color: '#ef4444' },
        ],
      },
    };

    /* -------- queues -------- */
    const leadItem = (l) => ({ id: l.id, title: l.projectName, subtitle: `${l.customerName} · ${l.id}`, status: l.status, meta: l.followUpDate ? `Follow-up ${formatShortDate(l.followUpDate)}` : '', path: `/leads/${l.id}` });
    const quoteItem = (q) => ({ id: q.id, title: q.projectName, subtitle: `${q.id} · ${q.salesExecutive || ''}`, status: q.status, meta: inr(quotationTotals(q).grandTotal, { compact: true }), path: `/quotations/${q.id}` });
    const orderItem = (o) => ({ id: o.id, title: o.projectName, subtitle: `${o.id} · ${o.paymentTerms || ''}`, status: o.status, meta: inr(o.value, { compact: true }), path: `/sales-orders/${o.id}` });
    const projectItem = (p) => ({ id: p.id, title: p.name, subtitle: `${p.id} · ${p.manager || ''}`, status: p.status, meta: p.endDate ? `Due ${formatShortDate(p.endDate)}` : '', path: `/projects/${p.id}` });
    const productionItem = (p) => ({ id: p.id, title: `${p.doorNumber} · ${p.productName}`, subtitle: `${p.id} · ${projects.find((x) => x.id === p.projectId)?.name || ''}`, status: p.status, meta: p.mistri, path: `/production/${p.id}` });
    const qcItem = (q) => ({ id: q.id, title: `${q.doorNumber} · ${q.doorName || 'Door'}`, subtitle: `${q.id} · ${projects.find((x) => x.id === q.projectId)?.name || ''}`, status: q.status, meta: q.inspector, path: `/quality/${q.id}` });
    const dispatchItem = (d) => ({ id: d.id, title: `${(d.doorNumbers || []).length} doors · ${projects.find((x) => x.id === d.projectId)?.name || ''}`, subtitle: `${d.id} · ${d.vehicleNumber || 'Vehicle TBD'}`, status: d.status, meta: d.expectedDeliveryDate ? `ETA ${formatShortDate(d.expectedDeliveryDate)}` : '', path: `/dispatch/${d.id}` });
    const installItem = (i) => ({ id: i.id, title: `${i.doorNumber} · ${projects.find((x) => x.id === i.projectId)?.name || ''}`, subtitle: `${i.id} · ${i.supervisor || ''}`, status: i.status, meta: i.plannedDate ? formatShortDate(i.plannedDate) : '', path: `/installation/${i.id}` });
    const inspectionItem = (i) => ({ id: i.id, title: `${i.doorNumber} · ${projects.find((x) => x.id === i.projectId)?.name || ''}`, subtitle: `${i.id} · ${i.supervisor || ''}`, status: i.status, meta: formatShortDate(i.inspectionDate), path: `/inspections/${i.id}` });
    const invoiceItem = (i) => ({ id: i.id, title: `${i.id} · ${customers.find((c) => c.id === i.customerId)?.name || ''}`, subtitle: `${projects.find((p) => p.id === i.projectId)?.name || '—'}`, status: i.derivedStatus || i.status, meta: inr(i.outstanding ?? invoiceTotals(i).outstanding, { compact: true }) + ' due', path: `/accounts/${i.id}` });
    const serviceItem = (s) => ({ id: s.id, title: s.complaintType, subtitle: `${s.id} · ${customers.find((c) => c.id === s.customerId)?.name || ''}`, status: s.status, meta: s.priority, path: `/service/${s.id}` });
    const materialItem = (m) => ({ id: m.id, title: m.name, subtitle: `${m.id} · ${m.warehouse || ''}`, status: materialStatus(m), meta: `${materialAvailable(m)} ${m.unit}`, path: `/inventory/${m.id}` });

    const sortedLeads = [...leadsAll].sort((a, b) => (a.date < b.date ? 1 : -1));
    const sortedQuotes = [...quotationsAll].sort((a, b) => (a.date < b.date ? 1 : -1));
    const sortedOrders = [...ordersAll].sort((a, b) => (a.date < b.date ? 1 : -1));

    const queues = {
      recentLeads: { title: 'Recent customer enquiries', subtitle: 'Latest leads created', path: '/leads', items: sortedLeads.slice(0, 5).map(leadItem) },
      pendingQuotations: { title: 'Pending quotations', subtitle: 'Awaiting estimation approval', path: '/quotations', items: pendingQuotes.slice(0, 5).map(quoteItem) },
      recentOrders: { title: 'Recent sales orders', subtitle: 'Newest confirmed business', path: '/sales-orders', items: sortedOrders.slice(0, 5).map(orderItem) },
      delayedProjects: { title: 'Delayed projects', subtitle: 'Past target completion', path: '/projects', items: activeProjects.filter((p) => p.endDate && p.endDate < TODAY).slice(0, 5).map(projectItem) },
      productionPending: { title: 'Production queue', subtitle: 'Jobs awaiting completion', path: '/production', items: production.filter((p) => ['In Progress', 'Ready to Start', 'Material Pending', 'On Hold', 'Rework Required'].includes(p.status)).slice(0, 5).map(productionItem) },
      pendingQc: { title: 'Pending QC inspections', subtitle: 'Doors awaiting quality clearance', path: '/quality', items: pendingQc.slice(0, 5).map(qcItem) },
      pendingDispatch: { title: 'Dispatch pending', subtitle: 'QC passed, awaiting delivery', path: '/dispatch', items: dispatches.filter((d) => ['Ready for Dispatch', 'Packing', 'Dispatched', 'In Transit'].includes(d.status)).slice(0, 5).map(dispatchItem) },
      pendingSiteApprovals: { title: 'Pending site approvals', subtitle: 'Installed doors awaiting approval', path: '/inspections', items: sitePending.slice(0, 5).map(inspectionItem) },
      overduePayments: { title: 'Overdue payments', subtitle: 'Collection follow-up required', path: '/accounts', items: overdue.slice(0, 5).map(invoiceItem) },
      followUps: { title: 'Follow-ups due', subtitle: 'Leads needing contact', path: '/leads', items: myFollowUps.slice(0, 5).map(leadItem) },
      myLeadsQ: { title: 'My recent leads', subtitle: 'Assigned enquiries', path: '/leads', items: [...myLeadsAll].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5).map(leadItem) },
      myQuotations: { title: 'My quotations', subtitle: 'Status of customer quotations', path: '/quotations', items: [...myQuotesAll].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5).map(quoteItem) },
      estimations: { title: 'Quotation approval queue', subtitle: 'Review and price pending enquiries', path: '/quotations', items: pendingQuotes.slice(0, 6).map(quoteItem) },
      acceptedQuotations: { title: 'Accepted — awaiting order', subtitle: 'Convert to sales orders', path: '/quotations', items: quotationsAll.filter((q) => q.status === 'Accepted').slice(0, 5).map(quoteItem) },
      myProjectsQ: { title: 'My projects', subtitle: 'Assigned project portfolio', path: '/projects', items: myActiveProjects.slice(0, 5).map(projectItem) },
      myProductionQ: { title: 'My production jobs', subtitle: 'Door-wise assignments', path: '/production', items: myActiveProduction.slice(0, 5).map(productionItem) },
      myInstallationsQ: { title: 'My installation jobs', subtitle: 'Assigned installation work', path: '/installation', items: myActiveInstallations.slice(0, 5).map(installItem) },
      lowStock: { title: 'Low stock alerts', subtitle: 'Reorder before production stops', path: '/inventory', items: [...lowStock, ...outOfStock].slice(0, 5).map(materialItem) },
      purchaseApprovals: { title: 'Purchase approvals', subtitle: 'Material indents awaiting sign-off', path: '/inventory', items: pendingPRs.map((pr) => ({ id: pr.id, title: LBL_MATERIAL(pr, materials), subtitle: `${pr.id} · required ${formatShortDate(pr.requiredBy)}`, status: pr.status, meta: `${pr.qty}`, path: '/inventory' })) },
      dispatchQueue: { title: 'Dispatch queue', subtitle: 'Consignments in progress', path: '/dispatch', items: dispatches.filter((d) => d.status !== 'Delivered').slice(0, 6).map(dispatchItem) },
      installQueue: { title: 'Installation schedule', subtitle: 'Jobs to plan and complete', path: '/installation', items: myActiveInstallations.slice(0, 5).map(installItem) },
      inspectionQueue: { title: 'Inspection queue', subtitle: 'Doors awaiting site approval', path: '/inspections', items: myInspectionPending.slice(0, 5).map(inspectionItem) },
      snagQueue: { title: 'Snag / rework queue', subtitle: 'Rejected site work', path: '/inspections', items: mySnags.slice(0, 5).map(inspectionItem) },
      invoiceQueue: { title: 'Invoices to collect', subtitle: 'Open customer balances', path: '/accounts', items: invoicesWithDerived.filter((i) => i.status !== 'Draft' && i.outstanding > 0).slice(0, 5).map((i) => invoiceItem({ ...i, derivedStatus: i.derivedStatus })) },
      serviceQueue: { title: 'Open service tickets', subtitle: 'Customer complaints', path: '/service', items: openService.slice(0, 5).map(serviceItem) },
    };

    const deadlines = [
      ...projects
        .filter((p) => p.endDate && p.status !== 'Completed')
        .map((p) => ({ id: p.id, title: p.name, subtitle: `${p.id} · ${p.status}`, date: p.endDate, path: `/projects/${p.id}`, kind: 'Project target' })),
      ...invoicesWithDerived
        .filter((i) => i.status !== 'Draft' && i.outstanding > 0 && i.dueDate)
        .map((i) => ({ id: i.id, title: `${i.id} payment due`, subtitle: `${customers.find((c) => c.id === i.customerId)?.name || ''} · ${inr(i.outstanding, { compact: true })}`, date: i.dueDate, path: `/accounts/${i.id}`, kind: 'Payment' })),
      ...myFollowUps.filter((l) => l.followUpDate).map((l) => ({ id: l.id, title: l.projectName, subtitle: `${l.customerName} follow-up`, date: l.followUpDate, path: `/leads/${l.id}`, kind: 'Follow-up' })),
    ]
      .filter((d) => d.date)
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .slice(0, 6);

    const alerts = notifications.filter((n) => !n.read).slice(0, 4);

    const recentActivity = role === 'super_admin'
      ? activities.slice(0, 6)
      : activities.filter((a) => a.user === user).slice(0, 6);

    return { kpis, charts, queues, deadlines, alerts, recentActivity, meta: { role, user, range: { start, end } } };
  }, [state, range?.key, range?.from, range?.to]);
}

function LBL_MATERIAL(pr, materials) {
  return materials.find((m) => m.id === pr.materialId)?.name || pr.materialId;
}

/* ------------------------------------------------------------------ */
/* Role dashboard layouts                                             */
/* ------------------------------------------------------------------ */

export const DASHBOARD_LAYOUTS = {
  super_admin: {
    title: 'Executive overview',
    subtitle: 'Every stage of the door manufacturing business in one place — pipeline, plant, site delivery and cash.',
    kpiGroups: [
      { label: 'Sales & pipeline', keys: ['totalLeads', 'newLeads', 'followUpLeads', 'leadConversion', 'quotationsPending', 'quotationsApproved'] },
      { label: 'Projects & production', keys: ['activeProjects', 'projectsOnHold', 'totalDoors', 'doorsInProduction', 'productionCompleted', 'qualityRejected', 'doorsAwaitingQc', 'completedProjects'] },
      { label: 'Delivery & installation', keys: ['readyForDispatch', 'inTransit', 'installationInProgress', 'installationPendingApproval', 'siteApprovalsPending'] },
      { label: 'Finance & service', keys: ['invoicedAmount', 'collectedAmount', 'outstandingAmount', 'overdueInvoices', 'warrantyComplaints'] },
    ],
    charts: ['leadsTrend', 'quotationStatus', 'projectStatus', 'productionOutput', 'installationStatus', 'revenueTrend', 'employeeWorkload', 'qcOutcomes'],
    queues: ['recentLeads', 'pendingQuotations', 'delayedProjects', 'productionPending', 'pendingQc', 'pendingDispatch', 'pendingSiteApprovals', 'overduePayments'],
  },
  sales: {
    title: 'Sales workspace',
    subtitle: 'Assigned enquiries, follow-ups and quotations. Create leads, schedule visits and convert accepted quotes.',
    kpiGroups: [
      { label: 'My pipeline', keys: ['myLeads', 'myFollowUps', 'myQuotesSent', 'myQuoteAwaiting', 'myOrderValue', 'myWinRate', 'myCustomers'] },
    ],
    charts: ['leadsTrend', 'quotationStatus', 'leadFunnel'],
    queues: ['followUps', 'myLeadsQ', 'myQuotations'],
  },
  estimation: {
    title: 'Estimation workspace',
    subtitle: 'Review door requirements, control pricing and keep approved quotations moving to sales.',
    kpiGroups: [
      { label: 'Quotation desk', keys: ['estimationPending', 'estimationDrafts', 'acceptedQuotes', 'totalQuotedValue', 'totalQuotations', 'quotationConversion'] },
    ],
    charts: ['quotationStatus', 'quotationValueTrend'],
    queues: ['estimations', 'acceptedQuotations'],
  },
  project_manager: {
    title: 'Project delivery',
    subtitle: 'Projects assigned to you — team allocation, manufacturing progress, site approval and closure.',
    kpiGroups: [
      { label: 'My portfolio', keys: ['myProjects', 'myDelayedProjects', 'myProjectBudget', 'myDoorsInProduction', 'mySitePending', 'myCompletedProjects'] },
    ],
    charts: ['projectStatus', 'productionOutput'],
    queues: ['myProjectsQ', 'delayedProjects', 'productionPending', 'pendingSiteApprovals'],
  },
  mistri: {
    title: 'Production floor',
    subtitle: 'Door-wise work assigned to your team, material readiness and QC hand-off.',
    kpiGroups: [
      { label: 'My jobs', keys: ['myProduction', 'myProductionInProgress', 'myMaterialPending', 'myPendingQc', 'myProjects'] },
    ],
    charts: ['productionStatus', 'productionOutput'],
    queues: ['myProductionQ', 'pendingQc'],
  },
  production_supervisor: {
    title: 'Production control',
    subtitle: 'Batch planning, output tracking and quality hand-off across the plant.',
    kpiGroups: [
      { label: 'Plant status', keys: ['doorsInProduction', 'doorsAwaitingQc', 'qualityRejected', 'productionCompleted', 'productionOutputMonth'] },
    ],
    charts: ['productionOutput', 'productionStatus', 'qcRejectionRate'],
    queues: ['productionPending', 'pendingQc'],
  },
  store: {
    title: 'Stores & purchase',
    subtitle: 'Material availability, project reservations and purchase approvals.',
    kpiGroups: [
      { label: 'Inventory health', keys: ['lowStockItems', 'outOfStockItems', 'reservedStockValue', 'pendingPurchaseRequests', 'totalMaterials'] },
    ],
    charts: ['stockByCategory'],
    queues: ['lowStock', 'purchaseApprovals'],
  },
  qc: {
    title: 'Quality control',
    subtitle: 'Inspect manufactured doors, record defects and control rework before dispatch.',
    kpiGroups: [
      { label: 'Inspection desk', keys: ['doorsAwaitingQc', 'qcRework', 'qualityRejected', 'qcRejectionRate', 'productionCompleted'] },
    ],
    charts: ['qcOutcomes', 'qcRejectionRate'],
    queues: ['pendingQc'],
  },
  dispatch: {
    title: 'Dispatch & logistics',
    subtitle: 'Finished goods, transport planning and proof of delivery at site.',
    kpiGroups: [
      { label: 'Outbound', keys: ['readyForDispatch', 'inTransit', 'deliveredDispatches', 'dispatchIssues'] },
    ],
    charts: ['dispatchStatus', 'dispatchTrend'],
    queues: ['dispatchQueue'],
  },
  installation_supervisor: {
    title: 'Installation control',
    subtitle: 'Crew allocation, door-wise fitting and inspection hand-off.',
    kpiGroups: [
      { label: 'My installation work', keys: ['myInstallations', 'myInstallationInProgress', 'myInspectionPending', 'myRework'] },
    ],
    charts: ['installationStatus', 'installationTrend'],
    queues: ['installQueue', 'inspectionQueue'],
  },
  site_supervisor: {
    title: 'Site quality & approval',
    subtitle: 'Inspect installed doors, raise snags and grant final site approval.',
    kpiGroups: [
      { label: 'Inspection desk', keys: ['myInspectionPending', 'myApprovedInspections', 'mySnags', 'myProjects'] },
    ],
    charts: ['inspectionStatus', 'installationStatus'],
    queues: ['inspectionQueue', 'snagQueue'],
  },
  accounts: {
    title: 'Finance & collections',
    subtitle: 'Invoices, receipts, outstanding balances and project profitability.',
    kpiGroups: [
      { label: 'Receivables', keys: ['invoicedAmount', 'collectedAmount', 'outstandingAmount', 'overdueInvoices', 'paidInvoices', 'collectionRate'] },
    ],
    charts: ['revenueTrend', 'invoiceStatus'],
    queues: ['overduePayments', 'invoiceQueue'],
  },
  service: {
    title: 'Warranty & service',
    subtitle: 'Customer complaints, technician allocation and after-sales resolution.',
    kpiGroups: [
      { label: 'Service desk', keys: ['serviceOpen', 'serviceHighPriority', 'resolvedThisMonth', 'totalTickets'] },
    ],
    charts: ['serviceStatus', 'serviceTypes'],
    queues: ['serviceQueue'],
  },
};

export { TODAY as DASHBOARD_TODAY };
