/**
 * Central business configuration: company profile, roles, permissions,
 * navigation, master/dropdown data, statuses and workflow checklists.
 * Every screen and form reads from here — nothing is hardcoded in components.
 */

export const COMPANY = {
  name: 'DoorCraft Industries',
  legalName: 'DoorCraft Industries Pvt. Ltd.',
  tagline: 'Doors engineered for life',
  gstin: '27AAECD9412P1ZU',
  address: 'Plot 42, MIDC Industrial Estate, Chakan, Pune, Maharashtra 410501',
  city: 'Pune',
  phone: '+91 20 4890 2200',
  email: 'projects@doorcraft.in',
  website: 'www.doorcraft.in',
  bank: 'HDFC Bank · Chakan MIDC · A/c 50200041278901 · IFSC HDFC0001284',
};

export const CURRENCY = '₹';

/* ------------------------------------------------------------------ */
/* ROLES & PERMISSIONS                                                */
/* ------------------------------------------------------------------ */

/**
 * Module permission levels: 0 = none, 1 = view, 2 = create/edit, 3 = full (delete + admin)
 * Detailed approval rights are kept separately in APPROVAL_RIGHTS.
 */
export const ROLES = {
  super_admin: {
    key: 'super_admin',
    label: 'Super Admin',
    short: 'Admin',
    designation: 'Managing Director',
    user: 'Aarav Mehta',
    tone: 'dark',
    summary: 'Full control across sales, operations, finance and administration.',
    permissions: 'all',
  },
  sales: {
    key: 'sales',
    label: 'Sales Executive',
    short: 'Sales',
    designation: 'Senior Sales Executive',
    user: 'Ananya Iyer',
    tone: 'blue',
    summary: 'Owns enquiries, follow-ups, quotations and order conversion for assigned customers.',
    permissions: {
      dashboard: 3, customers: 3, leads: 3, measurements: 2, quotations: 2,
      salesOrders: 3, projects: 1, products: 1, service: 1,
    },
  },
  estimation: {
    key: 'estimation',
    label: 'Estimation Manager',
    short: 'Estimation',
    designation: 'Estimation & Quotation Manager',
    user: 'Priya Nair',
    tone: 'violet',
    summary: 'Prepares door specifications, costing and quotations, and approves pricing.',
    permissions: {
      dashboard: 3, customers: 1, leads: 1, measurements: 2, quotations: 3,
      products: 2, projects: 1, production: 1, reports: 1,
    },
  },
  project_manager: {
    key: 'project_manager',
    label: 'Project Manager',
    short: 'Projects',
    designation: 'Senior Project Manager',
    user: 'Rohan Deshmukh',
    tone: 'cyan',
    summary: 'Plans projects, assigns teams, and owns delivery timelines and budgets.',
    permissions: {
      dashboard: 3, customers: 1, leads: 1, quotations: 1, salesOrders: 2,
      projects: 3, products: 1, inventory: 1, production: 2, quality: 1,
      dispatch: 1, installation: 2, inspections: 1, accounts: 1, service: 1, reports: 2,
    },
  },
  mistri: {
    key: 'mistri',
    label: 'Mistri / Team Leader',
    short: 'Mistri',
    designation: 'Production Team Leader',
    user: 'Suresh Yadav',
    tone: 'amber',
    summary: 'Runs door-wise fabrication, worker allocation and material reporting.',
    permissions: {
      dashboard: 3, projects: 2, products: 1, production: 3, inventory: 1, quality: 1,
    },
  },
  production_supervisor: {
    key: 'production_supervisor',
    label: 'Production Supervisor',
    short: 'Production',
    designation: 'Production Supervisor',
    user: 'Imran Shaikh',
    tone: 'amber',
    summary: 'Plans production batches, tracks output and sends doors for quality inspection.',
    permissions: {
      dashboard: 3, projects: 2, products: 2, inventory: 2, production: 3, quality: 2, reports: 1,
    },
  },
  store: {
    key: 'store',
    label: 'Store / Purchase',
    short: 'Store',
    designation: 'Store & Purchase Manager',
    user: 'Deepak Joshi',
    tone: 'teal',
    summary: 'Owns inventory, reservations, inward/outward movement and supplier purchases.',
    permissions: {
      dashboard: 3, projects: 1, products: 2, inventory: 3, production: 1, reports: 1,
    },
  },
  qc: {
    key: 'qc',
    label: 'Quality Control',
    short: 'Quality',
    designation: 'Quality Control Manager',
    user: 'Neha Kulkarni',
    tone: 'green',
    summary: 'Inspects manufactured doors, records defects and controls rework.',
    permissions: {
      dashboard: 3, projects: 1, products: 2, production: 1, quality: 3, dispatch: 1, reports: 1,
    },
  },
  dispatch: {
    key: 'dispatch',
    label: 'Dispatch Manager',
    short: 'Dispatch',
    designation: 'Dispatch & Logistics Manager',
    user: 'Arjun Rao',
    tone: 'blue',
    summary: 'Plans packing and transport, tracks delivery and confirms site receipt.',
    permissions: {
      dashboard: 3, projects: 1, quality: 1, dispatch: 3, installation: 1, reports: 1,
    },
  },
  installation_supervisor: {
    key: 'installation_supervisor',
    label: 'Installation Supervisor',
    short: 'Installation',
    designation: 'Installation Supervisor',
    user: 'Sunil Pawar',
    tone: 'violet',
    summary: 'Schedules installation teams, tracks door-wise fitting and submits work for inspection.',
    permissions: {
      dashboard: 3, projects: 1, dispatch: 1, installation: 3, inspections: 1, reports: 1,
    },
  },
  site_supervisor: {
    key: 'site_supervisor',
    label: 'Site Supervisor',
    short: 'Site',
    designation: 'Site Supervisor',
    user: 'Farhan Qureshi',
    tone: 'cyan',
    summary: 'Verifies delivered doors, inspects installation quality and grants site approval.',
    permissions: {
      dashboard: 3, projects: 1, dispatch: 1, installation: 1, inspections: 3, reports: 1,
    },
  },
  accounts: {
    key: 'accounts',
    label: 'Accounts Manager',
    short: 'Accounts',
    designation: 'Accounts & Finance Manager',
    user: 'Meera Shah',
    tone: 'teal',
    summary: 'Raises invoices, records receipts and tracks customer and supplier payments.',
    permissions: {
      dashboard: 3, customers: 1, quotations: 1, salesOrders: 1, projects: 1,
      accounts: 3, reports: 2,
    },
  },
  service: {
    key: 'service',
    label: 'Service Manager',
    short: 'Service',
    designation: 'Warranty & Service Manager',
    user: 'Aditya Kulkarni',
    tone: 'green',
    summary: 'Handles warranty claims, complaint tickets and technician allocation.',
    permissions: {
      dashboard: 3, customers: 1, projects: 1, products: 1, service: 3, reports: 1,
    },
  },
};

export const ROLE_LIST = Object.values(ROLES);

const allModules = [
  'dashboard', 'customers', 'leads', 'measurements', 'quotations', 'salesOrders',
  'projects', 'products', 'inventory', 'production', 'quality', 'dispatch',
  'installation', 'inspections', 'accounts', 'service', 'reports', 'settings', 'activity',
];

export const moduleLevel = (roleKey, module) => {
  const role = ROLES[roleKey];
  if (!role) return 0;
  if (role.permissions === 'all') return 3;
  return role.permissions[module] || 0;
};

export const APPROVAL_RIGHTS = {
  quotation: ['super_admin', 'estimation'],
  salesOrder: ['super_admin', 'sales'],
  project: ['super_admin', 'project_manager'],
  production: ['super_admin', 'production_supervisor'],
  quality: ['super_admin', 'qc'],
  dispatch: ['super_admin', 'dispatch'],
  installation: ['super_admin', 'installation_supervisor'],
  inspection: ['super_admin', 'site_supervisor'],
  invoice: ['super_admin', 'accounts'],
  payment: ['super_admin', 'accounts'],
  service: ['super_admin', 'service'],
};

/* ------------------------------------------------------------------ */
/* NAVIGATION                                                          */
/* ------------------------------------------------------------------ */

export const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' }],
  },
  {
    label: 'Sales & Estimation',
    items: [
      { key: 'customers', label: 'Customers', icon: 'Users', path: '/customers' },
      { key: 'leads', label: 'Leads', icon: 'Target', path: '/leads' },
      { key: 'measurements', label: 'Site Visits', icon: 'Ruler', path: '/measurements' },
      { key: 'quotations', label: 'Quotations', icon: 'FileText', path: '/quotations' },
      { key: 'salesOrders', label: 'Sales Orders', icon: 'ClipboardList', path: '/sales-orders' },
    ],
  },
  {
    label: 'Manufacturing & Delivery',
    items: [
      { key: 'projects', label: 'Projects', icon: 'FolderKanban', path: '/projects' },
      { key: 'products', label: 'Door Products', icon: 'DoorOpen', path: '/products' },
      { key: 'inventory', label: 'Inventory', icon: 'Boxes', path: '/inventory' },
      { key: 'production', label: 'Production', icon: 'Factory', path: '/production' },
      { key: 'quality', label: 'Quality Control', icon: 'ShieldCheck', path: '/quality' },
      { key: 'dispatch', label: 'Dispatch', icon: 'Truck', path: '/dispatch' },
      { key: 'installation', label: 'Installation', icon: 'Hammer', path: '/installation' },
      { key: 'inspections', label: 'Site Inspections', icon: 'ClipboardCheck', path: '/inspections' },
    ],
  },
  {
    label: 'Finance & Service',
    items: [
      { key: 'accounts', label: 'Accounts', icon: 'Wallet', path: '/accounts' },
      { key: 'service', label: 'Warranty & Service', icon: 'Wrench', path: '/service' },
      { key: 'reports', label: 'Reports', icon: 'BarChart3', path: '/reports' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { key: 'settings', label: 'Master Settings', icon: 'Settings', path: '/settings' },
      { key: 'activity', label: 'Activity Log', icon: 'History', path: '/activity' },
    ],
  },
];

export const MODULE_META = {
  dashboard: { label: 'Dashboard', path: '/dashboard' },
  customers: { label: 'Customer', path: '/customers' },
  leads: { label: 'Lead', path: '/leads' },
  measurements: { label: 'Site Measurement', path: '/measurements' },
  quotations: { label: 'Quotation', path: '/quotations' },
  salesOrders: { label: 'Sales Order', path: '/sales-orders' },
  projects: { label: 'Project', path: '/projects' },
  products: { label: 'Door Product', path: '/products' },
  inventory: { label: 'Material', path: '/inventory' },
  production: { label: 'Production Order', path: '/production' },
  quality: { label: 'QC Inspection', path: '/quality' },
  dispatch: { label: 'Dispatch', path: '/dispatch' },
  installation: { label: 'Installation Job', path: '/installation' },
  inspections: { label: 'Site Inspection', path: '/inspections' },
  accounts: { label: 'Invoice', path: '/accounts' },
  service: { label: 'Service Ticket', path: '/service' },
  settings: { label: 'Setting', path: '/settings' },
};

/* ------------------------------------------------------------------ */
/* CONSTANTS / OPTIONS                                                */
/* ------------------------------------------------------------------ */

export const CUSTOMER_TYPES = ['Individual', 'Company', 'Builder', 'Contractor', 'Architect'];

export const LEAD_SOURCES = [
  'Website Enquiry', 'Referral', 'Architect', 'Builder', 'Walk-in',
  'Exhibition', 'Telecalling', 'Instagram', 'Channel Partner',
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const LEAD_STATUSES = [
  'New', 'Contacted', 'Interested', 'Site Visit Required', 'Measurement Pending',
  'Quotation Requested', 'Quotation Sent', 'Negotiation', 'Won', 'Lost',
];

export const QUOTATION_STATUSES = [
  'Draft', 'Pending Approval', 'Approved', 'Rejected', 'Sent', 'Accepted', 'Declined', 'Converted',
];

export const ORDER_STATUSES = [
  'Draft', 'Confirmed', 'Advance Pending', 'Ready for Project Planning', 'In Progress', 'Completed', 'Cancelled',
];

export const PROJECT_STATUSES = [
  'Planning', 'In Production', 'On Hold', 'Dispatch Ready', 'Dispatched',
  'Installation', 'Inspection Pending', 'Completed', 'Cancelled',
];

export const PRODUCTION_STATUSES = [
  'Pending', 'Material Pending', 'Ready to Start', 'In Progress', 'On Hold',
  'Completed', 'Quality Inspection Pending', 'Quality Approved', 'Rework Required',
];

export const QC_STATUSES = ['Pending', 'Approved', 'Rejected', 'Rework Required'];

export const DISPATCH_STATUSES = [
  'Ready for Dispatch', 'Packing', 'Dispatched', 'In Transit', 'Delivered', 'Delivery Issue',
];

export const INSTALLATION_STATUSES = [
  'Pending', 'Scheduled', 'Team Assigned', 'In Progress', 'Completed', 'Inspection Pending', 'Rework Required',
];

export const INSPECTION_STATUSES = ['Pending Inspection', 'Approved', 'Rejected', 'Snag Raised', 'Rework Required'];

export const INVOICE_STATUSES = ['Draft', 'Unpaid', 'Partially Paid', 'Paid', 'Overdue'];

export const SERVICE_STATUSES = ['New', 'Assigned', 'In Progress', 'Waiting for Parts', 'Resolved', 'Closed'];

export const CUSTOMER_STATUSES = ['Prospect', 'Active', 'Inactive'];

export const PRODUCT_STATUSES = ['Active', 'Draft', 'Discontinued'];

export const PROJECT_TYPES = ['Residential', 'Commercial', 'Hospitality', 'Healthcare', 'Education', 'Industrial'];

export const PAYMENT_METHODS = ['NEFT', 'RTGS', 'UPI', 'Cheque', 'Cash', 'Credit Card'];

export const PAYMENT_TERMS = ['50% Advance', '40% Advance', '30% Advance', 'Milestone Based', '100% on Delivery', 'Net 30', 'Net 45'];

export const DOOR_CATEGORIES = ['Wooden Doors', 'Steel Doors', 'uPVC Doors', 'Aluminium Doors', 'Fire-Rated Doors', 'Flush Doors', 'Designer Doors'];

export const DOOR_TYPES = ['Hinged', 'Sliding', 'Folding', 'Pivot', 'Revolving', 'Louvered'];

export const DOOR_DESIGNS = ['Groove Panel', 'Raised Panel', 'Glass Inlay', 'Veneer Flush', 'CNC Carved', 'Louvered', 'Steel Embossed', 'Plain Flush'];

export const DOOR_MATERIALS = ['Teak Wood', 'Sal Wood', 'Pine Wood', 'MDF Board', 'HDF Board', 'GI Steel', 'Stainless Steel', 'uPVC', 'Aluminium', 'FRP'];

export const DOOR_FINISHES = ['PU Polish', 'Melamine', 'Laminate', 'Veneer', 'Powder Coated', 'Duco Paint', 'Natural Matte'];

export const HARDWARE_TYPES = ['SS Handle', 'Mortise Lock', 'Cylindrical Lock', 'Concealed Hinge', 'Butt Hinge', 'Door Closer', 'Tower Bolt', 'Sliding Track'];

export const FRAME_TYPES = ['Wooden Frame', 'Steel Frame', 'Aluminium Frame', 'uPVC Frame', 'Factory-Made Frame'];

export const MEASUREMENT_UNITS = ['mm', 'ft', 'inch', 'sq.ft'];

export const OPENING_TYPES = ['New Opening', 'Replacement', 'Existing Frame', 'With Frame', 'Without Frame'];

export const SWING_DIRECTIONS = ['Left Inward', 'Right Inward', 'Left Outward', 'Right Outward', 'Sliding Left', 'Sliding Right'];

export const INDIAN_STATES = [
  'Maharashtra', 'Gujarat', 'Karnataka', 'Goa', 'Delhi', 'Tamil Nadu',
  'Telangana', 'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh', 'Kerala', 'Punjab',
];

export const QC_CHECKLIST = [
  { key: 'dimension', label: 'Dimension Check' },
  { key: 'material', label: 'Material Check' },
  { key: 'surface', label: 'Surface Finish' },
  { key: 'colour', label: 'Colour Check' },
  { key: 'hardware', label: 'Hardware Check' },
];

export const SITE_CHECKLIST = [
  { key: 'alignment', label: 'Door Alignment' },
  { key: 'opening', label: 'Opening / Closing' },
  { key: 'lock', label: 'Lock Functionality' },
  { key: 'handle', label: 'Handle Functionality' },
  { key: 'hinge', label: 'Hinge Quality' },
  { key: 'surface', label: 'Surface Finish' },
  { key: 'quality', label: 'Installation Quality' },
];

export const COMPLAINT_TYPES = [
  'Lock / Hardware', 'Door Alignment', 'Surface / Polish', 'Hinge Noise',
  'Water Seepage', 'Termite / Borer', 'Glass / Panel Damage', 'Other',
];

export const TECHNICIANS = ['Ramesh Gupta', 'Aftab Ansari', 'Sandeep More', 'Vikas Chavan'];

/* ------------------------------------------------------------------ */
/* STATUS TONES                                                       */
/* ------------------------------------------------------------------ */

const TONES = {
  gray: 'gray', blue: 'blue', green: 'green', amber: 'amber', red: 'red',
  violet: 'violet', cyan: 'cyan', teal: 'teal', dark: 'dark',
};

export const STATUS_TONES = {
  // Leads
  New: TONES.blue, Contacted: TONES.cyan, Interested: TONES.violet,
  'Site Visit Required': TONES.amber, 'Measurement Pending': TONES.amber,
  'Quotation Requested': TONES.amber, 'Quotation Sent': TONES.blue,
  Negotiation: TONES.violet, Won: TONES.green, Lost: TONES.red,
  // Quotations / orders
  Draft: TONES.gray, 'Pending Approval': TONES.amber, Approved: TONES.green,
  Rejected: TONES.red, Sent: TONES.blue, Accepted: TONES.green, Declined: TONES.red,
  Converted: TONES.teal, Confirmed: TONES.green, 'Advance Pending': TONES.amber,
  'Ready for Project Planning': TONES.cyan, 'In Progress': TONES.blue,
  Completed: TONES.green, Cancelled: TONES.red,
  // Projects
  Planning: TONES.gray, 'In Production': TONES.amber, 'On Hold': TONES.amber,
  'Dispatch Ready': TONES.cyan, Dispatched: TONES.violet, Installation: TONES.violet,
  'Inspection Pending': TONES.amber,
  // Production
  Pending: TONES.gray, 'Material Pending': TONES.amber, 'Ready to Start': TONES.cyan,
  'Quality Inspection Pending': TONES.amber, 'Quality Approved': TONES.green,
  'Rework Required': TONES.red,
  // Dispatch
  'Ready for Dispatch': TONES.cyan, Packing: TONES.blue, 'In Transit': TONES.violet,
  Delivered: TONES.green, 'Delivery Issue': TONES.red,
  // Installation / inspection
  Scheduled: TONES.blue, 'Team Assigned': TONES.cyan, 'Pending Inspection': TONES.amber,
  'Snag Raised': TONES.red,
  // Accounts
  Unpaid: TONES.amber, 'Partially Paid': TONES.amber, Paid: TONES.green, Overdue: TONES.red,
  // Service
  Assigned: TONES.blue, 'Waiting for Parts': TONES.amber, Resolved: TONES.green, Closed: TONES.gray,
  // Products / customers / stock
  Active: TONES.green, Inactive: TONES.gray, Prospect: TONES.blue, Discontinued: TONES.gray,
  'In Stock': TONES.green, 'Low Stock': TONES.amber, 'Out of Stock': TONES.red, Reserved: TONES.violet,
  // Priorities
  Low: TONES.gray, Medium: TONES.blue, High: TONES.amber, Urgent: TONES.red,
};

/* ------------------------------------------------------------------ */
/* MASTER DATA                                                        */
/* ------------------------------------------------------------------ */

const master = (id, name, extra = {}) => ({ id, name, active: true, ...extra });

export const MASTER_SEED = {
  doorCategories: DOOR_CATEGORIES.map((n, i) => master(`MC-${100 + i}`, n)),
  doorTypes: DOOR_TYPES.map((n, i) => master(`MT-${200 + i}`, n)),
  doorDesigns: DOOR_DESIGNS.map((n, i) => master(`MD-${300 + i}`, n)),
  doorMaterials: DOOR_MATERIALS.map((n, i) => master(`MM-${400 + i}`, n)),
  doorFinishes: DOOR_FINISHES.map((n, i) => master(`MF-${500 + i}`, n)),
  hardwareTypes: HARDWARE_TYPES.map((n, i) => master(`MH-${600 + i}`, n)),
  frameTypes: FRAME_TYPES.map((n, i) => master(`MFR-${650 + i}`, n)),
  measurementUnits: MEASUREMENT_UNITS.map((n, i) => master(`MU-${700 + i}`, n)),
  leadSources: LEAD_SOURCES.map((n, i) => master(`MS-${800 + i}`, n)),
  leadStatuses: LEAD_STATUSES.map((n, i) => master(`ML-${850 + i}`, n)),
  projectTypes: PROJECT_TYPES.map((n, i) => master(`MPT-${880 + i}`, n)),
  productionStatuses: PRODUCTION_STATUSES.map((n, i) => master(`MPS-${900 + i}`, n)),
  qcStatuses: QC_STATUSES.map((n, i) => master(`MQS-${920 + i}`, n)),
  installationStatuses: INSTALLATION_STATUSES.map((n, i) => master(`MIS-${940 + i}`, n)),
  paymentMethods: PAYMENT_METHODS.map((n, i) => master(`MPM-${960 + i}`, n)),
  warehouses: ['Chakan Main Warehouse', 'Bhosari Store', 'Hinjewadi Site Store', 'Pune Finished Goods'].map((n, i) => master(`MW-${970 + i}`, n)),
  departments: ['Management', 'Sales', 'Estimation', 'Projects', 'Production', 'Stores & Purchase', 'Quality', 'Logistics', 'Installation', 'Site Operations', 'Accounts', 'Service'].map((n, i) => master(`MDP-${980 + i}`, n)),
};

export const MASTER_GROUPS = [
  { key: 'doorCategories', label: 'Door Categories', singular: 'Door Category' },
  { key: 'doorTypes', label: 'Door Types', singular: 'Door Type' },
  { key: 'doorDesigns', label: 'Door Designs', singular: 'Door Design' },
  { key: 'doorMaterials', label: 'Door Materials', singular: 'Door Material' },
  { key: 'doorFinishes', label: 'Door Finishes', singular: 'Door Finish' },
  { key: 'hardwareTypes', label: 'Hardware Types', singular: 'Hardware Type' },
  { key: 'frameTypes', label: 'Frame Types', singular: 'Frame Type' },
  { key: 'measurementUnits', label: 'Measurement Units', singular: 'Measurement Unit' },
  { key: 'leadSources', label: 'Lead Sources', singular: 'Lead Source' },
  { key: 'leadStatuses', label: 'Lead Statuses', singular: 'Lead Status' },
  { key: 'projectTypes', label: 'Project Types', singular: 'Project Type' },
  { key: 'productionStatuses', label: 'Production Statuses', singular: 'Production Status' },
  { key: 'qcStatuses', label: 'QC Statuses', singular: 'QC Status' },
  { key: 'installationStatuses', label: 'Installation Statuses', singular: 'Installation Status' },
  { key: 'paymentMethods', label: 'Payment Methods', singular: 'Payment Method' },
  { key: 'warehouses', label: 'Warehouses', singular: 'Warehouse' },
  { key: 'departments', label: 'Departments', singular: 'Department' },
];

/* Date range presets used by dashboards */
export const DATE_RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'quarter', label: 'This Quarter' },
  { key: 'year', label: 'This Year' },
  { key: 'all', label: 'All Time' },
  { key: 'custom', label: 'Custom Range' },
];
