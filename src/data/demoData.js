/**
 * Realistic, fully linked demo data for DoorCraft Industries.
 * All IDs follow a consistent scheme so records can be traced across modules:
 * CUS → customers, LD → leads, SV → site visits, QT → quotations, SO → orders,
 * PRJ/doors → projects, PO → production, QC → quality, DP → dispatch,
 * IN → installation, SI → site inspection, INV → invoices, ST → service.
 */
import { quotationTotals } from '../utils/calc';

const E = {
  admin: 'Aarav Mehta',
  sales1: 'Ananya Iyer',
  sales2: 'Karan Malhotra',
  sales3: 'Kavita Joshi',
  est: 'Priya Nair',
  pm1: 'Rohan Deshmukh',
  pm2: 'Vikram Singh',
  mistri1: 'Suresh Yadav',
  mistri2: 'Mahesh Patil',
  prod: 'Imran Shaikh',
  store: 'Deepak Joshi',
  qc: 'Neha Kulkarni',
  dispatch: 'Arjun Rao',
  install: 'Sunil Pawar',
  site: 'Farhan Qureshi',
  accounts: 'Meera Shah',
  service: 'Aditya Kulkarni',
  measure: 'Nikhil Kale',
};

const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const dt = (date, time = '10:30') => `${date}T${time}:00`;

/* ------------------------------------------------------------------ */
/* EMPLOYEES & USERS                                                  */
/* ------------------------------------------------------------------ */

const employeeRows = [
  ['Aarav Mehta', 'super_admin', 'Management', 'Managing Director', '98220 11200', 'Chakan HO'],
  ['Ananya Iyer', 'sales', 'Sales', 'Senior Sales Executive', '98230 44512', 'Pune Office'],
  ['Karan Malhotra', 'sales', 'Sales', 'Sales Executive', '98811 76230', 'Pune Office'],
  ['Kavita Joshi', 'sales', 'Sales', 'Sales Executive', '98602 11983', 'Mumbai Office'],
  ['Priya Nair', 'estimation', 'Estimation', 'Estimation & Quotation Manager', '98220 77841', 'Chakan HO'],
  ['Rohan Deshmukh', 'project_manager', 'Projects', 'Senior Project Manager', '99700 22318', 'Pune Office'],
  ['Vikram Singh', 'project_manager', 'Projects', 'Project Manager', '98231 67820', 'Mumbai Office'],
  ['Suresh Yadav', 'mistri', 'Production', 'Production Team Leader', '90110 44521', 'Chakan Plant'],
  ['Mahesh Patil', 'mistri', 'Production', 'Production Team Leader', '99750 88123', 'Chakan Plant'],
  ['Imran Shaikh', 'production_supervisor', 'Production', 'Production Supervisor', '97640 11290', 'Chakan Plant'],
  ['Deepak Joshi', 'store', 'Stores & Purchase', 'Store & Purchase Manager', '98901 33450', 'Chakan Warehouse'],
  ['Neha Kulkarni', 'qc', 'Quality', 'Quality Control Manager', '98227 60912', 'Chakan Plant'],
  ['Arjun Rao', 'dispatch', 'Logistics', 'Dispatch & Logistics Manager', '98202 45119', 'Chakan Warehouse'],
  ['Sunil Pawar', 'installation_supervisor', 'Installation', 'Installation Supervisor', '97650 22087', 'Pune Office'],
  ['Farhan Qureshi', 'site_supervisor', 'Site Operations', 'Site Supervisor', '98220 90112', 'Pune Office'],
  ['Meera Shah', 'accounts', 'Accounts', 'Accounts & Finance Manager', '98905 11760', 'Chakan HO'],
  ['Aditya Kulkarni', 'service', 'Service', 'Warranty & Service Manager', '97660 55821', 'Pune Office'],
  ['Nikhil Kale', 'worker', 'Projects', 'Measurement Engineer', '90040 11277', 'Pune Office'],
  ['Ramesh Gupta', 'worker', 'Production', 'Senior Carpenter', '98502 77810', 'Chakan Plant'],
  ['Sandeep More', 'worker', 'Production', 'CNC Operator', '90211 44591', 'Chakan Plant'],
  ['Aftab Ansari', 'worker', 'Installation', 'Installation Technician', '97620 88431', 'Pune Office'],
  ['Pooja Bhide', 'worker', 'Accounts', 'Accounts Assistant', '98907 33219', 'Chakan HO'],
];

export const employees = employeeRows.map(([name, role, department, designation, phone, location], i) => ({
  id: `EMP-${String(101 + i)}`,
  name,
  role,
  department,
  designation,
  phone: `+91 ${phone}`,
  email: `${name.toLowerCase().replace(/\s+/g, '.')}@doorcraft.in`,
  location,
  joinedOn: ['2021-04-12', '2022-06-01', '2023-01-16', '2022-11-07'][i % 4],
  active: true,
}));

export const users = employees.map((emp, i) => ({
  id: `USR-${String(1001 + i)}`,
  name: emp.name,
  employeeId: emp.id,
  email: emp.email,
  phone: emp.phone,
  role: emp.role,
  department: emp.department,
  active: true,
  lastLogin: dt('2026-11-24', ['09:02', '08:45', '09:20', '10:04', '08:58'][i % 5]),
}));

/* ------------------------------------------------------------------ */
/* PRODUCTS                                                           */
/* ------------------------------------------------------------------ */

export const products = [
  { id: 'PRD-01', name: 'Teak Heritage Panel Door', category: 'Wooden Doors', doorType: 'Hinged', model: 'TD-HER-01', material: 'Teak Wood', design: 'Groove Panel', height: 2100, width: 900, thickness: 40, frameType: 'Wooden Frame', finish: 'PU Polish', colour: 'Natural Teak', hardware: 'SS Handle', lock: 'Mortise Lock', handle: 'SS Pull Handle 300mm', hinge: 'Concealed Hinge', unit: 'Nos', standardCost: 19800, sellingPrice: 28500, status: 'Active', tone: 'teak', description: 'Solid teak door with deep groove panelling, ideal for villas and premium residences.' },
  { id: 'PRD-02', name: 'Sal Wood Classic Flush', category: 'Flush Doors', doorType: 'Hinged', model: 'SD-CLS-02', material: 'Sal Wood', design: 'Plain Flush', height: 2100, width: 900, thickness: 35, frameType: 'Wooden Frame', finish: 'Veneer', colour: 'Golden Oak', hardware: 'SS Handle', lock: 'Cylindrical Lock', handle: 'SS Lever Handle', hinge: 'Butt Hinge', unit: 'Nos', standardCost: 8600, sellingPrice: 12400, status: 'Active', tone: 'oak', description: 'Durable sal wood flush door for apartments and commercial interiors.' },
  { id: 'PRD-03', name: 'Designer Veneer Door', category: 'Designer Doors', doorType: 'Hinged', model: 'DV-EDG-03', material: 'MDF Board', design: 'Veneer Flush', height: 2100, width: 900, thickness: 38, frameType: 'Wooden Frame', finish: 'Veneer', colour: 'Walnut', hardware: 'SS Handle', lock: 'Mortise Lock', handle: 'SS Bar Handle', hinge: 'Concealed Hinge', unit: 'Nos', standardCost: 13900, sellingPrice: 19800, status: 'Active', tone: 'walnut', description: 'Engineered veneer door with premium edge banding for hospitality projects.' },
  { id: 'PRD-04', name: 'Steel Security Door', category: 'Steel Doors', doorType: 'Hinged', model: 'SS-SEC-04', material: 'GI Steel', design: 'Steel Embossed', height: 2100, width: 1000, thickness: 45, frameType: 'Steel Frame', finish: 'Powder Coated', colour: 'Charcoal Grey', hardware: 'SS Handle', lock: 'Mortise Lock', handle: 'Steel Lever Handle', hinge: 'Butt Hinge', unit: 'Nos', standardCost: 12300, sellingPrice: 17600, status: 'Active', tone: 'steel', description: 'Heavy-duty GI steel door with multi-point locking for utility and staircase areas.' },
  { id: 'PRD-05', name: 'Fire-Rated Steel Door FD60', category: 'Fire-Rated Doors', doorType: 'Hinged', model: 'FR-FD60-05', material: 'GI Steel', design: 'Plain Flush', height: 2100, width: 1000, thickness: 50, frameType: 'Steel Frame', finish: 'Powder Coated', colour: 'Fire Red', hardware: 'SS Handle', lock: 'Mortise Lock', handle: 'Panic Bar', hinge: 'Butt Hinge', unit: 'Nos', standardCost: 22600, sellingPrice: 32000, status: 'Active', tone: 'red', description: '60-minute fire-rated door with intumescent seal, tested to IS 3614.' },
  { id: 'PRD-06', name: 'uPVC Bathroom Door', category: 'uPVC Doors', doorType: 'Hinged', model: 'UP-BTH-06', material: 'uPVC', design: 'Plain Flush', height: 2100, width: 750, thickness: 30, frameType: 'uPVC Frame', finish: 'Natural Matte', colour: 'Ivory', hardware: 'SS Handle', lock: 'Cylindrical Lock', handle: 'SS Lever Handle', hinge: 'Butt Hinge', unit: 'Nos', standardCost: 6200, sellingPrice: 8900, status: 'Active', tone: 'ivory', description: 'Water-resistant uPVC door for bathrooms and wet areas.' },
  { id: 'PRD-07', name: 'Aluminium Glass Partition Door', category: 'Aluminium Doors', doorType: 'Sliding', model: 'AL-GLS-07', material: 'Aluminium', design: 'Glass Inlay', height: 2400, width: 1200, thickness: 45, frameType: 'Aluminium Frame', finish: 'Powder Coated', colour: 'Black Anodised', hardware: 'Sliding Track', lock: 'Cylindrical Lock', handle: 'Aluminium Handle', hinge: 'Sliding Track', unit: 'Nos', standardCost: 15800, sellingPrice: 22400, status: 'Active', tone: 'slate', description: 'Slim-profile aluminium sliding door with toughened glass panels.' },
  { id: 'PRD-08', name: 'Laminated Flush Door', category: 'Flush Doors', doorType: 'Hinged', model: 'LF-STD-08', material: 'HDF Board', design: 'Plain Flush', height: 2100, width: 900, thickness: 35, frameType: 'Wooden Frame', finish: 'Laminate', colour: 'Smoke Oak', hardware: 'SS Handle', lock: 'Cylindrical Lock', handle: 'SS Lever Handle', hinge: 'Concealed Hinge', unit: 'Nos', standardCost: 6800, sellingPrice: 9600, status: 'Active', tone: 'sand', description: 'Economical laminated flush door for volume residential projects.' },
  { id: 'PRD-09', name: 'CNC Carved Teak Door', category: 'Designer Doors', doorType: 'Hinged', model: 'CD-CNC-09', material: 'Teak Wood', design: 'CNC Carved', height: 2200, width: 1000, thickness: 45, frameType: 'Factory-Made Frame', finish: 'PU Polish', colour: 'Antique Brown', hardware: 'SS Handle', lock: 'Mortise Lock', handle: 'Brass Pull Handle', hinge: 'Concealed Hinge', unit: 'Nos', standardCost: 33500, sellingPrice: 46500, status: 'Active', tone: 'brown', description: 'Hand-finished CNC carved entrance door with brass hardware.' },
  { id: 'PRD-10', name: 'Louvered Ventilation Door', category: 'Wooden Doors', doorType: 'Louvered', model: 'LV-VNT-10', material: 'Pine Wood', design: 'Louvered', height: 2100, width: 800, thickness: 35, frameType: 'Wooden Frame', finish: 'Duco Paint', colour: 'White', hardware: 'SS Handle', lock: 'Tower Bolt', handle: 'SS Lever Handle', hinge: 'Butt Hinge', unit: 'Nos', standardCost: 7800, sellingPrice: 11200, status: 'Active', tone: 'white', description: 'Louvered pine door for utility, electrical and ventilation rooms.' },
  { id: 'PRD-11', name: 'Hospital Flush Door', category: 'Flush Doors', doorType: 'Hinged', model: 'HF-HYG-11', material: 'FRP', design: 'Plain Flush', height: 2100, width: 1000, thickness: 40, frameType: 'Steel Frame', finish: 'Duco Paint', colour: 'Hospital White', hardware: 'SS Handle', lock: 'Cylindrical Lock', handle: 'SS Lever Handle', hinge: 'Concealed Hinge', unit: 'Nos', standardCost: 10200, sellingPrice: 14500, status: 'Active', tone: 'clinical', description: 'Hygienic FRP flush door with anti-bacterial finish for healthcare facilities.' },
  { id: 'PRD-12', name: 'Double-Leaf Pivot Door', category: 'Designer Doors', doorType: 'Pivot', model: 'DP-PVT-12', material: 'Teak Wood', design: 'Raised Panel', height: 2400, width: 1800, thickness: 50, frameType: 'Factory-Made Frame', finish: 'PU Polish', colour: 'Deep Espresso', hardware: 'SS Handle', lock: 'Mortise Lock', handle: 'Steel Pull Handle', hinge: 'Pivot System', unit: 'Nos', standardCost: 39500, sellingPrice: 54000, status: 'Active', tone: 'espresso', description: 'Grand double-leaf pivot entrance for hotels and clubhouses.' },
];

const productById = (id) => products.find((p) => p.id === id);

/* ------------------------------------------------------------------ */
/* CUSTOMERS                                                          */
/* ------------------------------------------------------------------ */

export const customers = [
  { id: 'CUS-1001', name: 'Horizon Builders Pvt. Ltd.', type: 'Builder', companyName: 'Horizon Builders Pvt. Ltd.', contactPerson: 'Rajesh Kulkarni', mobile: '+91 98220 41122', altMobile: '+91 20 6720 1100', email: 'rajesh@horizonbuilders.in', gst: '27AABCH4521R1Z8', billingAddress: '3rd Floor, Pride Plaza, Baner Road', siteAddress: 'Horizon Business Park, Phase 1, Hinjewadi', city: 'Pune', state: 'Maharashtra', pincode: '411057', source: 'Referral', assignedSales: E.sales1, status: 'Active', notes: 'Key account. 3 towers planned over 18 months. Payment through milestone invoices.' },
  { id: 'CUS-1002', name: 'Skyline Realty LLP', type: 'Builder', companyName: 'Skyline Realty LLP', contactPerson: 'Nilesh Shah', mobile: '+91 98201 77345', altMobile: '+91 22 4088 2200', email: 'nilesh@skylinerealty.in', gst: '27AAGCS8841K1ZP', billingAddress: 'Skyline House, Andheri East', siteAddress: 'Skyline Grand Residency, Wing B, Andheri East', city: 'Mumbai', state: 'Maharashtra', pincode: '400069', source: 'Exhibition', assignedSales: E.sales1, status: 'Active', notes: 'Premium residential project. Expects weekly progress reports.' },
  { id: 'CUS-1003', name: 'Aakar Architects', type: 'Architect', companyName: 'Aakar Architects', contactPerson: 'Sneha Bhandari', mobile: '+91 98604 22118', altMobile: '', email: 'sneha@aakararchitects.in', gst: '27AASFA1123C1Z2', billingAddress: '2nd Floor, Deccan Chambers, FC Road', siteAddress: 'Villa 14, Lane 7, Koregaon Park', city: 'Pune', state: 'Maharashtra', pincode: '411004', source: 'Architect', assignedSales: E.sales2, status: 'Active', notes: 'Specification-driven client. Always shares CAD door drawings.' },
  { id: 'CUS-1004', name: 'Green Meadows Residency', type: 'Company', companyName: 'Green Meadows Residency Co-op Housing Society', contactPerson: 'Suresh Kamble', mobile: '+91 97301 55420', altMobile: '', email: 'admin@greenmeadowsociety.in', gst: '27AAATG5567J1ZK', billingAddress: 'Green Meadows, Sector 21, Pimpri-Chinchwad', siteAddress: 'Clubhouse, Green Meadows, Sector 21', city: 'Pune', state: 'Maharashtra', pincode: '411018', source: 'Walk-in', assignedSales: E.sales1, status: 'Active', notes: 'Committee approval needed for any change order.' },
  { id: 'CUS-1005', name: 'Sanjay Deshpande', type: 'Individual', companyName: '', contactPerson: 'Sanjay Deshpande', mobile: '+91 98812 66734', altMobile: '', email: 'sanjay.deshpande@gmail.com', gst: '', billingAddress: 'Flat 802, Silver Leaf, Kothrud', siteAddress: 'Bungalow 9, Shivaji Nagar, Kothrud', city: 'Pune', state: 'Maharashtra', pincode: '411038', source: 'Referral', assignedSales: E.sales3, status: 'Active', notes: 'Prefers teak wood. Budget sensitive on hardware.' },
  { id: 'CUS-1006', name: 'Prestige Interiors', type: 'Contractor', companyName: 'Prestige Interiors & Contracting', contactPerson: 'Amol Jadhav', mobile: '+91 98226 90014', altMobile: '', email: 'amol@prestigeinteriors.co.in', gst: '27AAJCP9034M1ZQ', billingAddress: 'Shop 4, Vision One Mall, Wakad', siteAddress: 'Prestige Office, 5th Floor, Baner', city: 'Pune', state: 'Maharashtra', pincode: '411045', source: 'Channel Partner', assignedSales: E.sales2, status: 'Active', notes: 'Repeat contractor client, monthly fit-out orders.' },
  { id: 'CUS-1007', name: 'Lodha Group', type: 'Builder', companyName: 'Lodha Developers', contactPerson: 'Farid Khan', mobile: '+91 99301 21876', altMobile: '', email: 'farid.khan@lodhagroup.in', gst: '27AAACL1234B1Z7', billingAddress: 'Lodha Corporate Park, Lower Parel', siteAddress: 'Lodha Amara, Phase 2, Thane West', city: 'Mumbai', state: 'Maharashtra', pincode: '400013', source: 'Referral', assignedSales: E.sales1, status: 'Prospect', notes: 'Large volume enquiry under negotiation. 24 doors in phase 2.' },
  { id: 'CUS-1008', name: 'Dr. Anil Shah', type: 'Individual', companyName: '', contactPerson: 'Dr. Anil Shah', mobile: '+91 98227 33451', altMobile: '', email: 'anil.shah@shahclinic.in', gst: '', billingAddress: 'Shah Clinic, Gangapur Road', siteAddress: 'Bungalow 22, Gangapur Road', city: 'Nashik', state: 'Maharashtra', pincode: '422005', source: 'Website Enquiry', assignedSales: E.sales3, status: 'Active', notes: 'Needs 6 premium doors for new bungalow.' },
  { id: 'CUS-1009', name: 'Solitaire Hospitality Pvt. Ltd.', type: 'Company', companyName: 'Solitaire Boutique Hotels', contactPerson: 'Priyanka Menon', mobile: '+91 98202 55671', altMobile: '+91 2114 662 100', email: 'priyanka@solitairehotels.in', gst: '27AABCS7789D1ZL', billingAddress: 'Solitaire House, FC Road', siteAddress: 'Solitaire Boutique Hotel, Old Mumbai-Pune Highway, Lonavala', city: 'Lonavala', state: 'Maharashtra', pincode: '410401', source: 'Builder', assignedSales: E.sales1, status: 'Active', notes: 'Hotel refurbishment, design approvals from in-house architect.' },
  { id: 'CUS-1010', name: 'Vidya Niketan Trust', type: 'Company', companyName: 'Vidya Niketan Education Trust', contactPerson: 'Dr. Sudhir Joshi', mobile: '+91 98901 44230', altMobile: '', email: 'principal@vidyaniketan.edu.in', gst: '27AAATV2210E1Z5', billingAddress: 'Vidya Niketan Campus, Kothrud', siteAddress: 'Admin Block, Vidya Niketan School, Kothrud', city: 'Pune', state: 'Maharashtra', pincode: '411038', source: 'Telecalling', assignedSales: E.sales2, status: 'Active', notes: 'Trust purchase process, invoice in institution name.' },
  { id: 'CUS-1011', name: 'Nirmal Constructions', type: 'Contractor', companyName: 'Nirmal Constructions', contactPerson: 'Nirmal Patil', mobile: '+91 99204 88761', altMobile: '', email: 'nirmal@nirmalconstructions.in', gst: '27AAKPN5566H1ZV', billingAddress: 'Office 11, Rutu Estate, Thane West', siteAddress: 'Nirmal Heights, Ghodbunder Road', city: 'Thane', state: 'Maharashtra', pincode: '400607', source: 'Channel Partner', assignedSales: E.sales3, status: 'Active', notes: 'High volume, standard specifications.' },
  { id: 'CUS-1012', name: 'Urban Nest Developers', type: 'Builder', companyName: 'Urban Nest Developers LLP', contactPerson: 'Tanvi Bhosale', mobile: '+91 98230 66145', altMobile: '', email: 'tanvi@urbannest.in', gst: '27AAFCU9098N1Z3', billingAddress: 'Urban Nest House, Baner', siteAddress: 'Urban Nest Tower C, Baner', city: 'Pune', state: 'Maharashtra', pincode: '411045', source: 'Website Enquiry', assignedSales: E.sales1, status: 'Active', notes: '12-door order confirmed for Tower C; Tower D expected next quarter.' },
  { id: 'CUS-1013', name: 'Shreya Kapoor', type: 'Individual', companyName: '', contactPerson: 'Shreya Kapoor', mobile: '+91 99870 22318', altMobile: '', email: 'shreya.kapoor@gmail.com', gst: '', billingAddress: 'Flat 1204, Sea Breeze, Bandra West', siteAddress: 'Flat 1204, Sea Breeze, Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', source: 'Instagram', assignedSales: E.sales3, status: 'Prospect', notes: 'Apartment renovation, 3 designer doors.' },
  { id: 'CUS-1014', name: 'Bharat Steel Works', type: 'Company', companyName: 'Bharat Steel Works', contactPerson: 'Manoj Agarwal', mobile: '+91 98220 77354', altMobile: '', email: 'manoj@bharatsteel.in', gst: '27AABCB4411L1ZR', billingAddress: 'Plot 18, Chakan MIDC', siteAddress: 'Bharat Steel Works, Plot 18, Chakan MIDC', city: 'Pune', state: 'Maharashtra', pincode: '410501', source: 'Website Enquiry', assignedSales: E.sales2, status: 'Active', notes: 'Industrial office doors, needs fire-rated compliance.' },
  { id: 'CUS-1015', name: 'Palm Grove Villas', type: 'Builder', companyName: 'Palm Grove Villas Pvt. Ltd.', contactPerson: 'Rakesh Shetty', mobile: '+91 98211 45672', altMobile: '', email: 'rakesh@palmgrovevillas.in', gst: '30AABCP6655G1ZN', billingAddress: 'Palm Grove Office, Calangute', siteAddress: 'Palm Grove Villas Phase 1, Anjuna Road', city: 'Calangute', state: 'Goa', pincode: '403516', source: 'Referral', assignedSales: E.sales1, status: 'Active', notes: 'Coastal project — requires marine-grade hardware.' },
  { id: 'CUS-1016', name: 'Metro Care Hospital', type: 'Company', companyName: 'Metro Care Multispeciality Hospital', contactPerson: 'Dr. Kavita Rao', mobile: '+91 98225 66190', altMobile: '+91 20 6712 8000', email: 'kavita.rao@metrocare.in', gst: '27AAACM7788P1ZT', billingAddress: 'Metro Care Hospital, Kharadi', siteAddress: 'OPD Block, Metro Care Hospital, Kharadi', city: 'Pune', state: 'Maharashtra', pincode: '411014', source: 'Referral', assignedSales: E.sales1, status: 'Active', notes: 'Hygienic flush doors. Site work permitted only after 6 PM.' },
];

/* ------------------------------------------------------------------ */
/* LEADS                                                              */
/* ------------------------------------------------------------------ */

const leadBase = (data) => ({
  attachments: [],
  notes: [],
  ...data,
});

export const leads = [
  leadBase({ id: 'LD-2001', date: '2026-01-08', customerId: 'CUS-1001', customerName: 'Horizon Builders Pvt. Ltd.', contactPerson: 'Rajesh Kulkarni', mobile: '+91 98220 41122', email: 'rajesh@horizonbuilders.in', source: 'Referral', projectName: 'Horizon Business Park – Tower A', projectLocation: 'Hinjewadi, Pune', projectType: 'Commercial', doorQty: 8, doorCategory: 'Wooden Doors', expectedBudget: 850000, expectedCloseDate: '2026-02-10', salesExecutive: E.sales1, priority: 'High', status: 'Won', followUpDate: '2026-02-09', description: 'Premium teak entrance and designer internal doors for Tower A lobby and offices.', quotationId: 'QT-4001' }),
  leadBase({ id: 'LD-2002', date: '2026-06-22', customerId: 'CUS-1002', customerName: 'Skyline Realty LLP', contactPerson: 'Nilesh Shah', mobile: '+91 98201 77345', email: 'nilesh@skylinerealty.in', source: 'Exhibition', projectName: 'Skyline Grand Residency – Wing B', projectLocation: 'Andheri East, Mumbai', projectType: 'Residential', doorQty: 6, doorCategory: 'Designer Doors', expectedBudget: 900000, expectedCloseDate: '2026-08-01', salesExecutive: E.sales1, priority: 'High', status: 'Won', followUpDate: '2026-07-28', description: 'Premium 3BHK show flats and main entrance pivot doors.', quotationId: 'QT-4002' }),
  leadBase({ id: 'LD-2003', date: '2026-07-04', customerId: 'CUS-1003', customerName: 'Aakar Architects', contactPerson: 'Sneha Bhandari', mobile: '+91 98604 22118', email: 'sneha@aakararchitects.in', source: 'Architect', projectName: 'Aakar Villa – Koregaon Park', projectLocation: 'Koregaon Park, Pune', projectType: 'Residential', doorQty: 5, doorCategory: 'Wooden Doors', expectedBudget: 1100000, expectedCloseDate: '2026-08-18', salesExecutive: E.sales2, priority: 'Urgent', status: 'Won', followUpDate: '2026-08-14', description: 'Architect-designed villa with CNC carved main door and teak internal doors.', quotationId: 'QT-4003' }),
  leadBase({ id: 'LD-2004', date: '2026-08-02', customerId: 'CUS-1004', customerName: 'Green Meadows Residency', contactPerson: 'Suresh Kamble', mobile: '+91 97301 55420', email: 'admin@greenmeadowsociety.in', source: 'Walk-in', projectName: 'Green Meadows Clubhouse', projectLocation: 'Pimpri-Chinchwad, Pune', projectType: 'Commercial', doorQty: 7, doorCategory: 'Steel Doors', expectedBudget: 900000, expectedCloseDate: '2026-09-12', salesExecutive: E.sales1, priority: 'Medium', status: 'Won', followUpDate: '2026-09-10', description: 'Clubhouse fire-rated doors, utility steel doors and washroom doors.', quotationId: 'QT-4004' }),
  leadBase({ id: 'LD-2005', date: '2026-07-18', customerId: 'CUS-1009', customerName: 'Solitaire Hospitality Pvt. Ltd.', contactPerson: 'Priyanka Menon', mobile: '+91 98202 55671', email: 'priyanka@solitairehotels.in', source: 'Builder', projectName: 'Solitaire Boutique Hotel – Lobby', projectLocation: 'Lonavala, Maharashtra', projectType: 'Hospitality', doorQty: 6, doorCategory: 'Designer Doors', expectedBudget: 1800000, expectedCloseDate: '2026-08-30', salesExecutive: E.sales1, priority: 'High', status: 'Won', followUpDate: '2026-08-27', description: 'Hotel lobby pivot doors and carved room doors with premium finishes.', quotationId: 'QT-4005' }),
  leadBase({ id: 'LD-2006', date: '2026-08-14', customerId: 'CUS-1016', customerName: 'Metro Care Hospital', contactPerson: 'Dr. Kavita Rao', mobile: '+91 98225 66190', email: 'kavita.rao@metrocare.in', source: 'Referral', projectName: 'Metro Care Hospital – OPD Block', projectLocation: 'Kharadi, Pune', projectType: 'Healthcare', doorQty: 8, doorCategory: 'Flush Doors', expectedBudget: 780000, expectedCloseDate: '2026-09-25', salesExecutive: E.sales1, priority: 'High', status: 'Won', followUpDate: '2026-09-22', description: 'FRP hospital doors with anti-bacterial finish and steel frames.', quotationId: 'QT-4006' }),
  leadBase({ id: 'LD-2007', date: '2026-08-28', customerId: 'CUS-1015', customerName: 'Palm Grove Villas', contactPerson: 'Rakesh Shetty', mobile: '+91 98211 45672', email: 'rakesh@palmgrovevillas.in', source: 'Referral', projectName: 'Palm Grove Villas – Phase 1', projectLocation: 'Anjuna Road, Goa', projectType: 'Residential', doorQty: 5, doorCategory: 'Wooden Doors', expectedBudget: 720000, expectedCloseDate: '2026-10-05', salesExecutive: E.sales1, priority: 'Medium', status: 'Won', followUpDate: '2026-10-01', description: 'Coastal villas requiring marine-grade hardware and teak doors.', quotationId: 'QT-4007' }),
  leadBase({ id: 'LD-2008', date: '2026-04-10', customerId: 'CUS-1010', customerName: 'Vidya Niketan Trust', contactPerson: 'Dr. Sudhir Joshi', mobile: '+91 98901 44230', email: 'principal@vidyaniketan.edu.in', source: 'Telecalling', projectName: 'Vidya Niketan School – Admin Block', projectLocation: 'Kothrud, Pune', projectType: 'Education', doorQty: 6, doorCategory: 'Flush Doors', expectedBudget: 420000, expectedCloseDate: '2026-05-10', salesExecutive: E.sales2, priority: 'Medium', status: 'Won', followUpDate: '2026-05-08', description: 'Admin block flush doors with laminate finish and durable hardware.', quotationId: 'QT-4008' }),
  leadBase({ id: 'LD-2009', date: '2026-09-18', customerId: 'CUS-1012', customerName: 'Urban Nest Developers', contactPerson: 'Tanvi Bhosale', mobile: '+91 98230 66145', email: 'tanvi@urbannest.in', source: 'Website Enquiry', projectName: 'Urban Nest Tower C', projectLocation: 'Baner, Pune', projectType: 'Residential', doorQty: 12, doorCategory: 'Flush Doors', expectedBudget: 1600000, expectedCloseDate: '2026-10-25', salesExecutive: E.sales1, priority: 'High', status: 'Quotation Sent', followUpDate: '2026-11-27', description: 'Tower C apartments, 12 laminated flush doors with bulk pricing.', quotationId: 'QT-4009' }),
  leadBase({ id: 'LD-2010', date: '2026-10-06', customerId: 'CUS-1007', customerName: 'Lodha Group', contactPerson: 'Farid Khan', mobile: '+91 99301 21876', email: 'farid.khan@lodhagroup.in', source: 'Referral', projectName: 'Lodha Amara Phase 2', projectLocation: 'Thane West, Mumbai', projectType: 'Residential', doorQty: 24, doorCategory: 'Flush Doors', expectedBudget: 3200000, expectedCloseDate: '2026-12-15', salesExecutive: E.sales1, priority: 'High', status: 'Negotiation', followUpDate: '2026-11-26', description: 'Bulk order of 24 doors. Negotiating 5% volume discount and staggered delivery.', quotationId: 'QT-4010' }),
  leadBase({ id: 'LD-2011', date: '2026-10-22', customerId: 'CUS-1006', customerName: 'Prestige Interiors', contactPerson: 'Amol Jadhav', mobile: '+91 98226 90014', email: 'amol@prestigeinteriors.co.in', source: 'Channel Partner', projectName: 'Prestige Office Interiors', projectLocation: 'Baner, Pune', projectType: 'Commercial', doorQty: 9, doorCategory: 'Designer Doors', expectedBudget: 1250000, expectedCloseDate: '2026-12-05', salesExecutive: E.sales2, priority: 'Medium', status: 'Quotation Requested', followUpDate: '2026-11-28', description: 'Office fit-out with designer veneer doors and a glass partition door.', quotationId: 'QT-4011' }),
  leadBase({ id: 'LD-2012', date: '2026-10-25', customerId: 'CUS-1011', customerName: 'Nirmal Constructions', contactPerson: 'Nirmal Patil', mobile: '+91 99204 88761', email: 'nirmal@nirmalconstructions.in', source: 'Channel Partner', projectName: 'Nirmal Heights', projectLocation: 'Ghodbunder Road, Thane', projectType: 'Residential', doorQty: 10, doorCategory: 'Steel Doors', expectedBudget: 950000, expectedCloseDate: '2026-12-20', salesExecutive: E.sales3, priority: 'Medium', status: 'Quotation Sent', followUpDate: '2026-11-29', description: 'Steel safety doors for 10 flats, powder-coated finish.', quotationId: 'QT-4012' }),
  leadBase({ id: 'LD-2013', date: '2026-10-30', customerId: 'CUS-1008', customerName: 'Dr. Anil Shah', contactPerson: 'Dr. Anil Shah', mobile: '+91 98227 33451', email: 'anil.shah@shahclinic.in', source: 'Website Enquiry', projectName: 'Dr. Shah Bungalow', projectLocation: 'Gangapur Road, Nashik', projectType: 'Residential', doorQty: 6, doorCategory: 'Wooden Doors', expectedBudget: 850000, expectedCloseDate: '2026-12-10', salesExecutive: E.sales3, priority: 'High', status: 'Site Visit Required', followUpDate: '2026-11-26', description: 'Bungalow entrance plus 5 internal doors; site measurement pending.', quotationId: 'QT-4013' }),
  leadBase({ id: 'LD-2014', date: '2026-11-05', customerId: 'CUS-1013', customerName: 'Shreya Kapoor', contactPerson: 'Shreya Kapoor', mobile: '+91 99870 22318', email: 'shreya.kapoor@gmail.com', source: 'Instagram', projectName: 'Shreya Kapoor Apartment', projectLocation: 'Bandra West, Mumbai', projectType: 'Residential', doorQty: 3, doorCategory: 'Designer Doors', expectedBudget: 380000, expectedCloseDate: '2026-12-18', salesExecutive: E.sales3, priority: 'Low', status: 'Interested', followUpDate: '2026-11-27', description: 'Apartment renovation with 3 designer doors; awaiting family approval.', quotationId: 'QT-4014' }),
  leadBase({ id: 'LD-2015', date: '2026-11-08', customerId: 'CUS-1014', customerName: 'Bharat Steel Works', contactPerson: 'Manoj Agarwal', mobile: '+91 98220 77354', email: 'manoj@bharatsteel.in', source: 'Website Enquiry', projectName: 'Bharat Steel Works Office', projectLocation: 'Chakan MIDC, Pune', projectType: 'Industrial', doorQty: 4, doorCategory: 'Fire-Rated Doors', expectedBudget: 520000, expectedCloseDate: '2026-12-22', salesExecutive: E.sales2, priority: 'Medium', status: 'Measurement Pending', followUpDate: '2026-11-28', description: 'Fire-rated doors for new office block; compliance certificate required.' }),
  leadBase({ id: 'LD-2016', date: '2026-11-12', customerId: 'CUS-1005', customerName: 'Sanjay Deshpande', contactPerson: 'Sanjay Deshpande', mobile: '+91 98812 66734', email: 'sanjay.deshpande@gmail.com', source: 'Referral', projectName: 'Sanjay Deshpande Villa', projectLocation: 'Kothrud, Pune', projectType: 'Residential', doorQty: 5, doorCategory: 'Wooden Doors', expectedBudget: 480000, expectedCloseDate: '2027-01-10', salesExecutive: E.sales3, priority: 'Medium', status: 'Contacted', followUpDate: '2026-11-25', description: 'Villa renovation, teak doors with melamine finish.' }),
  leadBase({ id: 'LD-2017', date: '2026-11-18', customerId: null, customerName: 'Sunrise Enclave', contactPerson: 'Pramod Gade', mobile: '+91 98224 11890', email: 'pramod@sunriseenclave.in', source: 'Walk-in', projectName: 'Sunrise Enclave', projectLocation: 'Vishrantwadi, Pune', projectType: 'Residential', doorQty: 8, doorCategory: 'Flush Doors', expectedBudget: 650000, expectedCloseDate: '2027-01-20', salesExecutive: E.sales2, priority: 'Medium', status: 'New', followUpDate: '2026-11-26', description: 'New builder enquiry for 8 flush doors. Needs site visit.' }),
  leadBase({ id: 'LD-2018', date: '2026-11-20', customerId: null, customerName: 'Crystal Tower', contactPerson: 'Deepa Rathi', mobile: '+91 99604 55231', email: 'deepa@crystaltower.in', source: 'Website Enquiry', projectName: 'Crystal Tower', projectLocation: 'Kharadi, Pune', projectType: 'Commercial', doorQty: 16, doorCategory: 'Steel Doors', expectedBudget: 1850000, expectedCloseDate: '2027-02-05', salesExecutive: E.sales1, priority: 'High', status: 'New', followUpDate: '2026-11-25', description: 'Commercial tower enquiry, 16 fire-rated and steel doors.' }),
  leadBase({ id: 'LD-2019', date: '2026-11-15', customerId: null, customerName: 'Lakeview Bungalow', contactPerson: 'Kapil Chavan', mobile: '+91 97640 22187', email: 'kapil.chavan@gmail.com', source: 'Instagram', projectName: 'Lakeview Bungalow', projectLocation: 'Lavasa, Pune', projectType: 'Residential', doorQty: 4, doorCategory: 'Designer Doors', expectedBudget: 560000, expectedCloseDate: '2027-01-08', salesExecutive: E.sales3, priority: 'Medium', status: 'Interested', followUpDate: '2026-11-27', description: 'Bungalow with lake-facing entrance; wants carved teak door.' }),
  leadBase({ id: 'LD-2020', date: '2026-11-10', customerId: null, customerName: 'Orchid Residency', contactPerson: 'Sameer Kothari', mobile: '+91 98220 66419', email: 'sameer@orchidresidency.in', source: 'Telecalling', projectName: 'Orchid Residency', projectLocation: 'Wagholi, Pune', projectType: 'Residential', doorQty: 10, doorCategory: 'Flush Doors', expectedBudget: 820000, expectedCloseDate: '2027-01-25', salesExecutive: E.sales2, priority: 'Medium', status: 'Contacted', followUpDate: '2026-11-28', description: 'Residential society redevelopment, 10 doors.' }),
  leadBase({ id: 'LD-2021', date: '2026-11-21', customerId: null, customerName: 'Tanishq Showroom Interiors', contactPerson: 'Rutuja Pawar', mobile: '+91 99219 77410', email: 'rutuja@tanishqinteriors.in', source: 'Referral', projectName: 'Tanishq Showroom Interiors', projectLocation: 'FC Road, Pune', projectType: 'Commercial', doorQty: 2, doorCategory: 'Designer Doors', expectedBudget: 310000, expectedCloseDate: '2027-01-05', salesExecutive: E.sales1, priority: 'Urgent', status: 'New', followUpDate: '2026-11-25', description: 'Showroom entrance with glass inlay doors, quick turnaround required.' }),
  leadBase({ id: 'LD-2022', date: '2026-09-02', customerId: null, customerName: 'Girija Apartments', contactPerson: 'Vasant Kulkarni', mobile: '+91 98220 90031', email: 'vasant.k@gmail.com', source: 'Telecalling', projectName: 'Girija Apartments', projectLocation: 'Sadashiv Peth, Pune', projectType: 'Residential', doorQty: 12, doorCategory: 'Flush Doors', expectedBudget: 780000, expectedCloseDate: '2026-10-30', salesExecutive: E.sales3, priority: 'Low', status: 'Lost', followUpDate: '2026-10-28', description: 'Lost to local vendor on price. Revisit opportunity next year.' }),
  leadBase({ id: 'LD-2023', date: '2026-06-14', customerId: null, customerName: 'Royal Palms Villas', contactPerson: 'Nitin Rane', mobile: '+91 98905 77120', email: 'nitin@royalpalmvillas.in', source: 'Exhibition', projectName: 'Royal Palms Villas', projectLocation: 'Alibaug, Maharashtra', projectType: 'Residential', doorQty: 14, doorCategory: 'Wooden Doors', expectedBudget: 2400000, expectedCloseDate: '2026-08-15', salesExecutive: E.sales2, priority: 'High', status: 'Lost', followUpDate: '2026-08-10', description: 'Budget mismatch and delayed project funding.' }),
  leadBase({ id: 'LD-2024', date: '2026-11-22', customerId: 'CUS-1012', customerName: 'Urban Nest Developers', contactPerson: 'Tanvi Bhosale', mobile: '+91 98230 66145', email: 'tanvi@urbannest.in', source: 'Referral', projectName: 'Urban Nest Tower D', projectLocation: 'Baner, Pune', projectType: 'Residential', doorQty: 20, doorCategory: 'Flush Doors', expectedBudget: 2400000, expectedCloseDate: '2027-02-15', salesExecutive: E.sales1, priority: 'High', status: 'Site Visit Required', followUpDate: '2026-11-28', description: 'Follow-on enquiry for Tower D, 20 doors. Site visit to be scheduled.' }),
];

leads[0].notes = [
  { at: dt('2026-01-10', '11:20'), by: E.sales1, text: 'Initial discussion with Rajesh. Shared company profile and door catalogue.' },
  { at: dt('2026-01-22', '15:05'), by: E.sales1, text: 'Site visit completed at Hinjewadi. 8 door openings confirmed.' },
  { at: dt('2026-02-06', '10:40'), by: E.est, text: 'Quotation QT-4001 prepared and submitted for approval.' },
];
leads[0].attachments = [{ id: 'ATT-01', name: 'Tower-A-Door-Layout.pdf', type: 'pdf', size: '2.4 MB', at: '2026-01-22' }];
leads[8].notes = [
  { at: dt('2026-11-19', '12:10'), by: E.sales1, text: 'Quotation shared over email. Follow-up scheduled with Tanvi.' },
];
leads[9].notes = [
  { at: dt('2026-11-20', '16:20'), by: E.sales1, text: 'Negotiating 5% discount. Approvals team aligned on pricing floor.' },
];
leads[16].attachments = [{ id: 'ATT-02', name: 'Sunrise-Site-Plan.jpg', type: 'image', size: '1.1 MB', at: '2026-11-18' }];

/* ------------------------------------------------------------------ */
/* SITE VISITS & MEASUREMENTS                                         */
/* ------------------------------------------------------------------ */

const svBase = (data) => ({
  unit: 'mm', photos: [], notes: '', approvalStatus: 'Approved',
  ...data,
});

export const measurements = [
  svBase({ id: 'SV-3001', leadId: 'LD-2001', customerId: 'CUS-1001', projectName: 'Horizon Business Park – Tower A', siteAddress: 'Horizon Business Park, Phase 1, Hinjewadi, Pune', visitDate: '2026-01-22', engineer: E.measure, building: 'Tower A', floor: 'Ground Floor', room: 'Main Lobby', doorNumber: 'D-01', height: 2400, width: 1800, thickness: 50, wallThickness: 230, openingType: 'New Opening', frameRequirement: 'Factory-Made Frame', swing: 'Right Inward', notes: 'Double-leaf pivot entrance, brass hardware approved by architect.', photos: [{ name: 'lobby-opening.jpg', at: '2026-01-22' }] }),
  svBase({ id: 'SV-3002', leadId: 'LD-2001', customerId: 'CUS-1001', projectName: 'Horizon Business Park – Tower A', siteAddress: 'Horizon Business Park, Phase 1, Hinjewadi, Pune', visitDate: '2026-01-22', engineer: E.measure, building: 'Tower A', floor: 'Ground Floor', room: 'Reception', doorNumber: 'D-02', height: 2100, width: 900, thickness: 40, wallThickness: 150, openingType: 'Existing Frame', frameRequirement: 'Wooden Frame', swing: 'Left Inward', notes: 'Frame opening measured at 915mm, allow 15mm packing.' }),
  svBase({ id: 'SV-3003', leadId: 'LD-2002', customerId: 'CUS-1002', projectName: 'Skyline Grand Residency – Wing B', siteAddress: 'Skyline Grand Residency, Wing B, Andheri East, Mumbai', visitDate: '2026-07-12', engineer: E.measure, building: 'Wing B', floor: '14th Floor', room: 'Flat 1401 – Living', doorNumber: 'D-01', height: 2200, width: 1000, thickness: 45, wallThickness: 150, openingType: 'With Frame', frameRequirement: 'Factory-Made Frame', swing: 'Right Inward', notes: 'Pivot door for show flat, check floor clearance for pivot base.' }),
  svBase({ id: 'SV-3004', leadId: 'LD-2002', customerId: 'CUS-1002', projectName: 'Skyline Grand Residency – Wing B', siteAddress: 'Skyline Grand Residency, Wing B, Andheri East, Mumbai', visitDate: '2026-07-12', engineer: E.measure, building: 'Wing B', floor: '14th Floor', room: 'Flat 1402 – Bedroom', doorNumber: 'D-02', height: 2100, width: 900, thickness: 38, wallThickness: 115, openingType: 'Existing Frame', frameRequirement: 'Wooden Frame', swing: 'Right Inward', notes: 'Standard bedroom door; veneer to match flooring.', approvalStatus: 'Approved' }),
  svBase({ id: 'SV-3005', leadId: 'LD-2003', customerId: 'CUS-1003', projectName: 'Aakar Villa – Koregaon Park', siteAddress: 'Villa 14, Lane 7, Koregaon Park, Pune', visitDate: '2026-07-20', engineer: E.measure, building: 'Villa', floor: 'Ground Floor', room: 'Entrance Foyer', doorNumber: 'D-01', height: 2200, width: 1000, thickness: 45, wallThickness: 230, openingType: 'New Opening', frameRequirement: 'Factory-Made Frame', swing: 'Right Outward', notes: 'CNC carved main door with sidelight. Verify carving design with architect.' }),
  svBase({ id: 'SV-3006', leadId: 'LD-2003', customerId: 'CUS-1003', projectName: 'Aakar Villa – Koregaon Park', siteAddress: 'Villa 14, Lane 7, Koregaon Park, Pune', visitDate: '2026-07-20', engineer: E.measure, building: 'Villa', floor: 'First Floor', room: 'Master Bedroom', doorNumber: 'D-02', height: 2100, width: 900, thickness: 40, wallThickness: 150, openingType: 'Existing Frame', frameRequirement: 'Wooden Frame', swing: 'Left Inward', notes: 'Groove panel teak door.' }),
  svBase({ id: 'SV-3007', leadId: 'LD-2004', customerId: 'CUS-1004', projectName: 'Green Meadows Clubhouse', siteAddress: 'Clubhouse, Green Meadows, Sector 21, Pimpri-Chinchwad', visitDate: '2026-08-10', engineer: E.measure, building: 'Clubhouse', floor: 'Ground Floor', room: 'Main Hall', doorNumber: 'D-01', height: 2100, width: 1000, thickness: 45, wallThickness: 230, openingType: 'New Opening', frameRequirement: 'Steel Frame', swing: 'Right Inward', notes: 'Fire-rated door required; steel frame to be grouted before installation.' }),
  svBase({ id: 'SV-3008', leadId: 'LD-2004', customerId: 'CUS-1004', projectName: 'Green Meadows Clubhouse', siteAddress: 'Clubhouse, Green Meadows, Sector 21, Pimpri-Chinchwad', visitDate: '2026-08-10', engineer: E.measure, building: 'Clubhouse', floor: 'Ground Floor', room: 'Store Room', doorNumber: 'D-02', height: 2100, width: 900, thickness: 45, wallThickness: 150, openingType: 'New Opening', frameRequirement: 'Steel Frame', swing: 'Left Inward', notes: 'Security door with multi-point lock.' }),
  svBase({ id: 'SV-3009', leadId: 'LD-2009', customerId: 'CUS-1012', projectName: 'Urban Nest Tower C', siteAddress: 'Urban Nest Tower C, Baner, Pune', visitDate: '2026-10-02', engineer: E.measure, building: 'Tower C', floor: '5th Floor', room: 'Typical Flat 501', doorNumber: 'D-01', height: 2100, width: 900, thickness: 35, wallThickness: 115, openingType: 'Existing Frame', frameRequirement: 'Wooden Frame', swing: 'Left Inward', notes: 'Typical flat door. 12 identical openings across floors.', photos: [{ name: 'typical-door.jpg', at: '2026-10-02' }], approvalStatus: 'Approved' }),
  svBase({ id: 'SV-3010', leadId: 'LD-2010', customerId: 'CUS-1007', projectName: 'Lodha Amara Phase 2', siteAddress: 'Lodha Amara, Phase 2, Thane West', visitDate: '2026-10-18', engineer: E.measure, building: 'Tower 4', floor: '8th Floor', room: 'Flat 804', doorNumber: 'D-01', height: 2100, width: 900, thickness: 35, wallThickness: 115, openingType: 'Existing Frame', frameRequirement: 'Wooden Frame', swing: 'Right Inward', notes: 'Sample flat measurement for 24-door bulk order.', approvalStatus: 'Pending' }),
  svBase({ id: 'SV-3011', leadId: 'LD-2013', customerId: 'CUS-1008', projectName: 'Dr. Shah Bungalow', siteAddress: 'Bungalow 22, Gangapur Road, Nashik', visitDate: '2026-11-18', engineer: E.measure, building: 'Bungalow', floor: 'Ground Floor', room: 'Living Room', doorNumber: 'D-01', height: 2200, width: 1000, thickness: 45, wallThickness: 230, openingType: 'New Opening', frameRequirement: 'Factory-Made Frame', swing: 'Right Inward', notes: 'Marine-grade hardware requested for humid Nashik climate.', approvalStatus: 'Pending' }),
  svBase({ id: 'SV-3012', leadId: 'LD-2015', customerId: 'CUS-1014', projectName: 'Bharat Steel Works Office', siteAddress: 'Plot 18, Chakan MIDC, Pune', visitDate: '2026-11-20', engineer: E.measure, building: 'Office Block', floor: 'Ground Floor', room: 'Conference Room', doorNumber: 'D-01', height: 2100, width: 1000, thickness: 50, wallThickness: 230, openingType: 'New Opening', frameRequirement: 'Steel Frame', swing: 'Left Outward', notes: 'FD60 fire door with panic bar. Compliance certificate mandatory.' }),
  svBase({ id: 'SV-3013', leadId: 'LD-2006', customerId: 'CUS-1016', projectName: 'Metro Care Hospital – OPD Block', siteAddress: 'OPD Block, Metro Care Hospital, Kharadi', visitDate: '2026-08-25', engineer: E.measure, building: 'OPD Block', floor: '1st Floor', room: 'Consultation Room 1', doorNumber: 'D-01', height: 2100, width: 1000, thickness: 40, wallThickness: 150, openingType: 'New Opening', frameRequirement: 'Steel Frame', swing: 'Right Inward', notes: 'Hygienic FRP door with vision panel. Coordinate with MEP services.' }),
  svBase({ id: 'SV-3014', leadId: 'LD-2024', customerId: 'CUS-1012', projectName: 'Urban Nest Tower D', siteAddress: 'Urban Nest Tower D, Baner, Pune', visitDate: '2026-11-23', engineer: E.measure, building: 'Tower D', floor: 'Ground Floor', room: 'Sample Flat', doorNumber: 'D-01', height: 2100, width: 900, thickness: 35, wallThickness: 115, openingType: 'New Opening', frameRequirement: 'Wooden Frame', swing: 'Right Inward', notes: 'New tower, 20 doors. Awaiting architect layout revision.', approvalStatus: 'Pending' }),
];

/* ------------------------------------------------------------------ */
/* QUOTATIONS                                                         */
/* ------------------------------------------------------------------ */

const qLine = (qid, seq, productId, qty, opts = {}) => {
  const p = productById(productId);
  return {
    id: `${qid}-L${seq}`,
    productId,
    doorType: p.doorType,
    design: p.design,
    material: p.material,
    finish: p.finish,
    frameType: p.frameType,
    hardware: p.hardware,
    height: p.height,
    width: p.width,
    qty,
    unitPrice: opts.unitPrice ?? p.sellingPrice,
    manufacturing: opts.manufacturing ?? 1800,
    installation: opts.installation ?? 1200,
    transport: opts.transport ?? 650,
    notes: opts.notes || '',
  };
};

const customerAddress = (id, kind = 'billing') => {
  const c = customers.find((x) => x.id === id);
  if (!c) return '';
  return kind === 'billing'
    ? `${c.billingAddress}, ${c.city} ${c.pincode}`
    : `${c.siteAddress}, ${c.city} ${c.pincode}`;
};

const termText = 'Payment as per agreed terms. Prices inclusive of hardware as specified. Site readiness required before installation. Warranty 12 months against manufacturing defects.';

export const quotations = [
  { id: 'QT-4001', date: '2026-02-03', customerId: 'CUS-1001', leadId: 'LD-2001', projectName: 'Horizon Business Park – Tower A', validUntil: '2026-03-05', billingAddress: customerAddress('CUS-1001'), siteAddress: customerAddress('CUS-1001', 'site'), items: [qLine('QT-4001', 1, 'PRD-01', 2), qLine('QT-4001', 2, 'PRD-03', 2), qLine('QT-4001', 3, 'PRD-04', 1), qLine('QT-4001', 4, 'PRD-06', 2), qLine('QT-4001', 5, 'PRD-09', 1, { unitPrice: 45000 })], discountPct: 3, gstPct: 18, paymentTerms: '40% Advance', deliveryTimeline: '45 days from order confirmation', terms: termText, preparedBy: E.est, salesExecutive: E.sales1, status: 'Converted', version: 2, approvedBy: E.admin, approvedAt: dt('2026-02-10', '11:20'), sentAt: dt('2026-02-10', '12:05'), customerResponseAt: dt('2026-02-14', '10:15'), revisions: [{ version: 1, date: '2026-02-03', by: E.est, note: 'Initial quotation for 8 doors.' }, { version: 2, date: '2026-02-09', by: E.est, note: 'Revised entrance door pricing after teak rate revision.' }], remarks: 'Customer accepted after revision. PO received.' },
  { id: 'QT-4002', date: '2026-07-25', customerId: 'CUS-1002', leadId: 'LD-2002', projectName: 'Skyline Grand Residency – Wing B', validUntil: '2026-08-24', billingAddress: customerAddress('CUS-1002'), siteAddress: customerAddress('CUS-1002', 'site'), items: [qLine('QT-4002', 1, 'PRD-03', 2), qLine('QT-4002', 2, 'PRD-02', 2), qLine('QT-4002', 3, 'PRD-06', 1), qLine('QT-4002', 4, 'PRD-12', 1, { manufacturing: 3500, installation: 3000 })], discountPct: 2, gstPct: 18, paymentTerms: '50% Advance', deliveryTimeline: '50 days from order confirmation', terms: termText, preparedBy: E.est, salesExecutive: E.sales1, status: 'Converted', version: 1, approvedBy: E.admin, approvedAt: dt('2026-07-28', '09:40'), sentAt: dt('2026-07-28', '10:30'), customerResponseAt: dt('2026-08-01', '16:00'), revisions: [{ version: 1, date: '2026-07-25', by: E.est, note: 'Initial quotation.' }], remarks: 'Approved. Advance received on 02 Aug 2026.' },
  { id: 'QT-4003', date: '2026-08-08', customerId: 'CUS-1003', leadId: 'LD-2003', projectName: 'Aakar Villa – Koregaon Park', validUntil: '2026-09-07', billingAddress: customerAddress('CUS-1003'), siteAddress: customerAddress('CUS-1003', 'site'), items: [qLine('QT-4003', 1, 'PRD-09', 1, { manufacturing: 4200, installation: 2500 }), qLine('QT-4003', 2, 'PRD-01', 2), qLine('QT-4003', 3, 'PRD-06', 1), qLine('QT-4003', 4, 'PRD-10', 1)], discountPct: 0, gstPct: 18, paymentTerms: 'Milestone Based', deliveryTimeline: '55 days from order confirmation', terms: termText, preparedBy: E.est, salesExecutive: E.sales2, status: 'Converted', version: 3, approvedBy: E.admin, approvedAt: dt('2026-08-12', '14:10'), sentAt: dt('2026-08-12', '15:00'), customerResponseAt: dt('2026-08-16', '11:20'), revisions: [{ version: 1, date: '2026-08-08', by: E.est, note: 'Initial quotation.' }, { version: 2, date: '2026-08-10', by: E.est, note: 'Added ventilation door for utility.' }, { version: 3, date: '2026-08-11', by: E.est, note: 'Corrected carving design rate.' }], remarks: 'Architect approved the final specification sheet.' },
  { id: 'QT-4004', date: '2026-08-28', customerId: 'CUS-1004', leadId: 'LD-2004', projectName: 'Green Meadows Clubhouse', validUntil: '2026-09-27', billingAddress: customerAddress('CUS-1004'), siteAddress: customerAddress('CUS-1004', 'site'), items: [qLine('QT-4004', 1, 'PRD-05', 1, { installation: 2500 }), qLine('QT-4004', 2, 'PRD-04', 2), qLine('QT-4004', 3, 'PRD-08', 2), qLine('QT-4004', 4, 'PRD-06', 2)], discountPct: 4, gstPct: 18, paymentTerms: '30% Advance', deliveryTimeline: '40 days from order confirmation', terms: termText, preparedBy: E.est, salesExecutive: E.sales1, status: 'Converted', version: 1, approvedBy: E.admin, approvedAt: dt('2026-09-02', '10:00'), sentAt: dt('2026-09-02', '11:15'), customerResponseAt: dt('2026-09-06', '12:40'), revisions: [{ version: 1, date: '2026-08-28', by: E.est, note: 'Initial quotation with fire door compliance.' }], remarks: 'Fire door certificate shared.' },
  { id: 'QT-4005', date: '2026-08-16', customerId: 'CUS-1009', leadId: 'LD-2005', projectName: 'Solitaire Boutique Hotel – Lobby', validUntil: '2026-09-15', billingAddress: customerAddress('CUS-1009'), siteAddress: customerAddress('CUS-1009', 'site'), items: [qLine('QT-4005', 1, 'PRD-12', 2, { manufacturing: 4200, installation: 3200 }), qLine('QT-4005', 2, 'PRD-09', 2, { unitPrice: 44200, manufacturing: 4200 }), qLine('QT-4005', 3, 'PRD-03', 2)], discountPct: 2, gstPct: 18, paymentTerms: '50% Advance', deliveryTimeline: '60 days from order confirmation', terms: termText, preparedBy: E.est, salesExecutive: E.sales1, status: 'Converted', version: 2, approvedBy: E.admin, approvedAt: dt('2026-08-20', '17:10'), sentAt: dt('2026-08-21', '09:30'), customerResponseAt: dt('2026-08-27', '14:00'), revisions: [{ version: 1, date: '2026-08-16', by: E.est, note: 'Initial quotation.' }, { version: 2, date: '2026-08-19', by: E.est, note: 'Client requested espresso polish on pivot doors.' }], remarks: 'Hotel design team approved samples.' },
  { id: 'QT-4006', date: '2026-09-05', customerId: 'CUS-1016', leadId: 'LD-2006', projectName: 'Metro Care Hospital – OPD Block', validUntil: '2026-10-05', billingAddress: customerAddress('CUS-1016'), siteAddress: customerAddress('CUS-1016', 'site'), items: [qLine('QT-4006', 1, 'PRD-11', 4), qLine('QT-4006', 2, 'PRD-04', 2), qLine('QT-4006', 3, 'PRD-06', 2)], discountPct: 3, gstPct: 18, paymentTerms: '50% Advance', deliveryTimeline: '45 days from order confirmation', terms: termText, preparedBy: E.est, salesExecutive: E.sales1, status: 'Converted', version: 1, approvedBy: E.admin, approvedAt: dt('2026-09-10', '11:45'), sentAt: dt('2026-09-10', '12:20'), customerResponseAt: dt('2026-09-15', '10:30'), revisions: [{ version: 1, date: '2026-09-05', by: E.est, note: 'Initial quotation for OPD block.' }], remarks: 'Purchase order received, billing to hospital trust.' },
  { id: 'QT-4007', date: '2026-09-12', customerId: 'CUS-1015', leadId: 'LD-2007', projectName: 'Palm Grove Villas – Phase 1', validUntil: '2026-10-12', billingAddress: customerAddress('CUS-1015'), siteAddress: customerAddress('CUS-1015', 'site'), items: [qLine('QT-4007', 1, 'PRD-01', 1), qLine('QT-4007', 2, 'PRD-02', 2), qLine('QT-4007', 3, 'PRD-06', 1), qLine('QT-4007', 4, 'PRD-10', 1)], discountPct: 0, gstPct: 18, paymentTerms: '40% Advance', deliveryTimeline: '50 days from order confirmation', terms: termText, preparedBy: E.est, salesExecutive: E.sales1, status: 'Converted', version: 1, approvedBy: E.admin, approvedAt: dt('2026-09-18', '10:20'), sentAt: dt('2026-09-18', '11:00'), customerResponseAt: dt('2026-09-24', '15:30'), revisions: [{ version: 1, date: '2026-09-12', by: E.est, note: 'Initial quotation with marine hardware note.' }], remarks: 'Advance awaited for Goa project.' },
  { id: 'QT-4008', date: '2026-04-28', customerId: 'CUS-1010', leadId: 'LD-2008', projectName: 'Vidya Niketan School – Admin Block', validUntil: '2026-05-28', billingAddress: customerAddress('CUS-1010'), siteAddress: customerAddress('CUS-1010', 'site'), items: [qLine('QT-4008', 1, 'PRD-08', 3), qLine('QT-4008', 2, 'PRD-02', 2), qLine('QT-4008', 3, 'PRD-06', 1)], discountPct: 5, gstPct: 18, paymentTerms: '100% on Delivery', deliveryTimeline: '40 days from order confirmation', terms: termText, preparedBy: E.est, salesExecutive: E.sales2, status: 'Converted', version: 1, approvedBy: E.admin, approvedAt: dt('2026-05-02', '09:50'), sentAt: dt('2026-05-02', '10:40'), customerResponseAt: dt('2026-05-08', '12:00'), revisions: [{ version: 1, date: '2026-04-28', by: E.est, note: 'Initial quotation for school admin block.' }], remarks: 'Trust approved; 100% payment on delivery.' },
  { id: 'QT-4009', date: '2026-10-20', customerId: 'CUS-1012', leadId: 'LD-2009', projectName: 'Urban Nest Tower C', validUntil: '2026-11-19', billingAddress: customerAddress('CUS-1012'), siteAddress: customerAddress('CUS-1012', 'site'), items: [qLine('QT-4009', 1, 'PRD-08', 6, { unitPrice: 9200 }), qLine('QT-4009', 2, 'PRD-06', 4, { unitPrice: 8600 }), qLine('QT-4009', 3, 'PRD-02', 2, { unitPrice: 12000 })], discountPct: 6, gstPct: 18, paymentTerms: '30% Advance', deliveryTimeline: '60 days from order confirmation', terms: termText, preparedBy: E.est, salesExecutive: E.sales1, status: 'Converted', version: 2, approvedBy: E.admin, approvedAt: dt('2026-10-24', '15:30'), sentAt: dt('2026-10-25', '09:15'), customerResponseAt: dt('2026-10-30', '11:00'), revisions: [{ version: 1, date: '2026-10-20', by: E.est, note: 'Initial bulk pricing.' }, { version: 2, date: '2026-10-23', by: E.est, note: 'Volume discount revised to 6% for 12 doors.' }], remarks: 'Advance pending — sales to collect before project planning.' },
  { id: 'QT-4010', date: '2026-10-28', customerId: 'CUS-1007', leadId: 'LD-2010', projectName: 'Lodha Amara Phase 2', validUntil: '2026-11-27', billingAddress: customerAddress('CUS-1007'), siteAddress: customerAddress('CUS-1007', 'site'), items: [qLine('QT-4010', 1, 'PRD-03', 10, { unitPrice: 19200 }), qLine('QT-4010', 2, 'PRD-02', 8, { unitPrice: 11900 }), qLine('QT-4010', 3, 'PRD-06', 6, { unitPrice: 8600 })], discountPct: 5, gstPct: 18, paymentTerms: 'Milestone Based', deliveryTimeline: '90 days staggered delivery', terms: termText, preparedBy: E.est, salesExecutive: E.sales1, status: 'Accepted', version: 2, approvedBy: E.admin, approvedAt: dt('2026-10-30', '10:10'), sentAt: dt('2026-10-30', '11:00'), customerResponseAt: dt('2026-11-18', '16:30'), revisions: [{ version: 1, date: '2026-10-28', by: E.est, note: 'Initial quotation.' }, { version: 2, date: '2026-10-29', by: E.est, note: 'Applied 5% volume discount.' }], remarks: 'Customer accepted. Sales to confirm order and collect advance.' },
  { id: 'QT-4011', date: '2026-11-12', customerId: 'CUS-1006', leadId: 'LD-2011', projectName: 'Prestige Office Interiors', validUntil: '2026-12-12', billingAddress: customerAddress('CUS-1006'), siteAddress: customerAddress('CUS-1006', 'site'), items: [qLine('QT-4011', 1, 'PRD-09', 2), qLine('QT-4011', 2, 'PRD-03', 4), qLine('QT-4011', 3, 'PRD-06', 3)], discountPct: 3, gstPct: 18, paymentTerms: '30% Advance', deliveryTimeline: '45 days from order confirmation', terms: termText, preparedBy: E.est, salesExecutive: E.sales2, status: 'Sent', version: 1, approvedBy: E.admin, approvedAt: dt('2026-11-14', '10:30'), sentAt: dt('2026-11-14', '11:20'), customerResponseAt: null, revisions: [{ version: 1, date: '2026-11-12', by: E.est, note: 'Initial quotation sent to client.' }], remarks: 'Awaiting client confirmation.' },
  { id: 'QT-4012', date: '2026-11-15', customerId: 'CUS-1011', leadId: 'LD-2012', projectName: 'Nirmal Heights', validUntil: '2026-12-15', billingAddress: customerAddress('CUS-1011'), siteAddress: customerAddress('CUS-1011', 'site'), items: [qLine('QT-4012', 1, 'PRD-04', 4), qLine('QT-4012', 2, 'PRD-08', 6)], discountPct: 4, gstPct: 18, paymentTerms: '30% Advance', deliveryTimeline: '40 days from order confirmation', terms: termText, preparedBy: E.est, salesExecutive: E.sales3, status: 'Sent', version: 1, approvedBy: E.admin, approvedAt: dt('2026-11-17', '09:30'), sentAt: dt('2026-11-17', '10:10'), customerResponseAt: null, revisions: [{ version: 1, date: '2026-11-15', by: E.est, note: 'Initial quotation.' }], remarks: '' },
  { id: 'QT-4013', date: '2026-11-20', customerId: 'CUS-1008', leadId: 'LD-2013', projectName: 'Dr. Shah Bungalow', validUntil: '2026-12-20', billingAddress: customerAddress('CUS-1008'), siteAddress: customerAddress('CUS-1008', 'site'), items: [qLine('QT-4013', 1, 'PRD-01', 2), qLine('QT-4013', 2, 'PRD-06', 2), qLine('QT-4013', 3, 'PRD-10', 2)], discountPct: 0, gstPct: 18, paymentTerms: '50% Advance', deliveryTimeline: '50 days from order confirmation', terms: termText, preparedBy: E.est, salesExecutive: E.sales3, status: 'Pending Approval', version: 1, approvedBy: null, approvedAt: null, sentAt: null, customerResponseAt: null, revisions: [{ version: 1, date: '2026-11-20', by: E.est, note: 'Submitted for approval after site visit.' }], remarks: 'Awaiting estimation manager approval.' },
  { id: 'QT-4014', date: '2026-11-21', customerId: 'CUS-1013', leadId: 'LD-2014', projectName: 'Shreya Kapoor Apartment', validUntil: '2026-12-21', billingAddress: customerAddress('CUS-1013'), siteAddress: customerAddress('CUS-1013', 'site'), items: [qLine('QT-4014', 1, 'PRD-03', 2), qLine('QT-4014', 2, 'PRD-07', 1)], discountPct: 0, gstPct: 18, paymentTerms: '100% on Delivery', deliveryTimeline: '35 days from order confirmation', terms: termText, preparedBy: E.est, salesExecutive: E.sales3, status: 'Draft', version: 1, approvedBy: null, approvedAt: null, sentAt: null, customerResponseAt: null, revisions: [{ version: 1, date: '2026-11-21', by: E.est, note: 'Draft created from apartment measurements.' }], remarks: '' },
  { id: 'QT-4015', date: '2026-11-22', customerId: 'CUS-1014', leadId: 'LD-2015', projectName: 'Bharat Steel Works Office', validUntil: '2026-12-22', billingAddress: customerAddress('CUS-1014'), siteAddress: customerAddress('CUS-1014', 'site'), items: [qLine('QT-4015', 1, 'PRD-05', 2), qLine('QT-4015', 2, 'PRD-04', 2)], discountPct: 0, gstPct: 18, paymentTerms: '50% Advance', deliveryTimeline: '45 days from order confirmation', terms: termText, preparedBy: E.est, salesExecutive: E.sales2, status: 'Pending Approval', version: 1, approvedBy: null, approvedAt: null, sentAt: null, customerResponseAt: null, revisions: [{ version: 1, date: '2026-11-22', by: E.est, note: 'Fire-rating certificates attached.' }], remarks: 'Urgent approval requested for compliance audit.' },
];

const qTotal = (id) => quotationTotals(quotations.find((q) => q.id === id)).grandTotal;

/* ------------------------------------------------------------------ */
/* SALES ORDERS                                                       */
/* ------------------------------------------------------------------ */

const orderRow = (id, quotationId, customerId, projectName, date, advancePct, deliveryDate, projectManager, status, approvalDoc, salesExecutive) => {
  const value = qTotal(quotationId);
  return {
    id, quotationId, customerId, projectName, date, value,
    advance: Math.round((value * advancePct) / 100),
    paymentTerms: quotations.find((q) => q.id === quotationId)?.paymentTerms || '30% Advance',
    deliveryDate, projectManager, status, approvalDoc, salesExecutive,
  };
};

export const salesOrders = [
  orderRow('SO-5001', 'QT-4001', 'CUS-1001', 'Horizon Business Park – Tower A', '2026-02-16', 40, '2026-04-05', E.pm1, 'Completed', 'Horizon-PO-2026-014.pdf', E.sales1),
  orderRow('SO-5002', 'QT-4002', 'CUS-1002', 'Skyline Grand Residency – Wing B', '2026-08-04', 50, '2026-10-05', E.pm1, 'In Progress', 'Skyline-PO-WB-118.pdf', E.sales1),
  orderRow('SO-5003', 'QT-4003', 'CUS-1003', 'Aakar Villa – Koregaon Park', '2026-08-18', 40, '2026-10-12', E.pm2, 'In Progress', 'Aakar-Approval-0826.pdf', E.sales2),
  orderRow('SO-5004', 'QT-4004', 'CUS-1004', 'Green Meadows Clubhouse', '2026-09-08', 30, '2026-10-22', E.pm1, 'In Progress', 'GreenMeadows-PO-77.pdf', E.sales1),
  orderRow('SO-5005', 'QT-4005', 'CUS-1009', 'Solitaire Boutique Hotel – Lobby', '2026-08-28', 50, '2026-10-28', E.pm2, 'In Progress', 'Solitaire-PO-2026-33.pdf', E.sales1),
  orderRow('SO-5006', 'QT-4006', 'CUS-1016', 'Metro Care Hospital – OPD Block', '2026-09-18', 50, '2026-11-05', E.pm1, 'In Progress', 'MetroCare-PO-OPD-09.pdf', E.sales1),
  orderRow('SO-5007', 'QT-4007', 'CUS-1015', 'Palm Grove Villas – Phase 1', '2026-09-28', 40, '2026-12-15', E.pm2, 'Confirmed', 'PalmGrove-Advance-Receipt.pdf', E.sales1),
  orderRow('SO-5008', 'QT-4008', 'CUS-1010', 'Vidya Niketan School – Admin Block', '2026-05-12', 100, '2026-06-25', E.pm1, 'Completed', 'VidyaNiketan-PO-2026-05.pdf', E.sales2),
  orderRow('SO-5009', 'QT-4009', 'CUS-1012', 'Urban Nest Tower C', '2026-11-02', 30, '2027-01-10', E.pm1, 'Advance Pending', 'UrbanNest-PO-TC-21.pdf', E.sales1),
];

const oTotal = (id) => salesOrders.find((o) => o.id === id).value;

/* ------------------------------------------------------------------ */
/* PROJECTS                                                           */
/* ------------------------------------------------------------------ */

const makeDoors = (projectId, defs) => {
  const doors = [];
  defs.forEach(([productId, qty, rooms]) => {
    const p = productById(productId);
    for (let i = 0; i < qty; i += 1) {
      const n = doors.length + 1;
      doors.push({
        id: `${projectId}-D${String(n).padStart(2, '0')}`,
        projectId,
        number: `D-${String(n).padStart(2, '0')}`,
        productId,
        productName: p.name,
        category: p.category,
        design: p.design,
        material: p.material,
        finish: p.finish,
        height: p.height,
        width: p.width,
        thickness: p.thickness,
        frameType: p.frameType,
        hardware: p.hardware,
        room: rooms?.[i] || rooms?.[rooms.length - 1] || 'General',
        qty: 1,
      });
    }
  });
  return doors;
};

const projectDocs = (prefix) => [
  { id: `${prefix}-DOC1`, name: 'Approved Quotation.pdf', type: 'pdf', size: '640 KB', uploadedAt: '2026-10-20', by: E.est },
  { id: `${prefix}-DOC2`, name: 'Door Specification Sheet.xlsx', type: 'sheet', size: '180 KB', uploadedAt: '2026-10-22', by: E.pm1 },
  { id: `${prefix}-DOC3`, name: 'Site Measurement Report.pdf', type: 'pdf', size: '1.2 MB', uploadedAt: '2026-10-23', by: E.measure },
];

const projectSeeds = [
  { id: 'PRJ-6001', name: 'Horizon Business Park – Tower A', customerId: 'CUS-1001', salesOrderId: 'SO-5001', manager: E.pm1, mistri: E.mistri1, productionSupervisor: E.prod, installationSupervisor: E.install, siteSupervisor: E.site, startDate: '2026-02-20', endDate: '2026-04-30', location: 'Hinjewadi, Pune', budget: Math.round(qTotal('QT-4001') * 1.04), advanceReceived: salesOrders[0].advance, status: 'Completed', priority: 'High', notes: 'Premium corporate lobby project. Completed ahead of schedule.', defs: [['PRD-09', 1, ['Main Entrance']], ['PRD-01', 2, ['MD Cabin', 'Board Room']], ['PRD-03', 2, ['Reception', 'Manager Cabin']], ['PRD-04', 1, ['Utility Corridor']], ['PRD-06', 2, ['Washroom 1', 'Washroom 2']]], salesExecutive: E.sales1 },
  { id: 'PRJ-6002', name: 'Skyline Grand Residency – Wing B', customerId: 'CUS-1002', salesOrderId: 'SO-5002', manager: E.pm1, mistri: E.mistri1, productionSupervisor: E.prod, installationSupervisor: E.install, siteSupervisor: E.site, startDate: '2026-08-10', endDate: '2026-11-30', location: 'Andheri East, Mumbai', budget: Math.round(qTotal('QT-4002') * 1.05), advanceReceived: salesOrders[1].advance, status: 'Installation', priority: 'High', notes: 'Show flat deadlines. Lift access restricted to 9 AM–5 PM.', defs: [['PRD-12', 1, ['Flat 1401 – Entrance']], ['PRD-03', 2, ['Flat 1401 – Living', 'Flat 1402 – Living']], ['PRD-02', 2, ['Flat 1401 – Bedroom', 'Flat 1402 – Bedroom']], ['PRD-06', 1, ['Flat 1402 – Washroom']]], salesExecutive: E.sales1 },
  { id: 'PRJ-6003', name: 'Aakar Villa – Koregaon Park', customerId: 'CUS-1003', salesOrderId: 'SO-5003', manager: E.pm2, mistri: E.mistri2, productionSupervisor: E.prod, installationSupervisor: E.install, siteSupervisor: E.site, startDate: '2026-08-25', endDate: '2026-11-28', location: 'Koregaon Park, Pune', budget: Math.round(qTotal('QT-4003') * 1.06), advanceReceived: salesOrders[2].advance, status: 'Inspection Pending', priority: 'Urgent', notes: 'Architect doing final walkthrough on 26 Nov.', defs: [['PRD-09', 1, ['Entrance Foyer']], ['PRD-01', 2, ['Living Room', 'Master Bedroom']], ['PRD-06', 1, ['Guest Washroom']], ['PRD-10', 1, ['Utility']]], salesExecutive: E.sales2 },
  { id: 'PRJ-6004', name: 'Green Meadows Clubhouse', customerId: 'CUS-1004', salesOrderId: 'SO-5004', manager: E.pm1, mistri: E.mistri1, productionSupervisor: E.prod, installationSupervisor: E.install, siteSupervisor: E.site, startDate: '2026-09-15', endDate: '2026-12-15', location: 'Pimpri-Chinchwad, Pune', budget: Math.round(qTotal('QT-4004') * 1.04), advanceReceived: salesOrders[3].advance, status: 'In Production', priority: 'Medium', notes: 'One fire door under rework due to powder-coating defect.', defs: [['PRD-05', 1, ['Main Hall']], ['PRD-04', 2, ['Store Room', 'Generator Room']], ['PRD-08', 2, ['Office 1', 'Office 2']], ['PRD-06', 2, ['Washroom 1', 'Washroom 2']]], salesExecutive: E.sales1 },
  { id: 'PRJ-6005', name: 'Solitaire Boutique Hotel – Lobby', customerId: 'CUS-1009', salesOrderId: 'SO-5005', manager: E.pm2, mistri: E.mistri2, productionSupervisor: E.prod, installationSupervisor: E.install, siteSupervisor: E.site, startDate: '2026-09-01', endDate: '2026-12-05', location: 'Lonavala, Maharashtra', budget: Math.round(qTotal('QT-4005') * 1.06), advanceReceived: salesOrders[4].advance, status: 'In Production', priority: 'High', notes: 'Carving work needs extra 6 days. Hotel opening on 20 Dec.', defs: [['PRD-12', 2, ['Main Entrance', 'Banquet Entrance']], ['PRD-09', 2, ['Suite 101', 'Suite 102']], ['PRD-03', 2, ['Reception', 'Manager Cabin']]], salesExecutive: E.sales1 },
  { id: 'PRJ-6006', name: 'Metro Care Hospital – OPD Block', customerId: 'CUS-1016', salesOrderId: 'SO-5006', manager: E.pm1, mistri: E.mistri1, productionSupervisor: E.prod, installationSupervisor: E.install, siteSupervisor: E.site, startDate: '2026-09-28', endDate: '2026-12-10', location: 'Kharadi, Pune', budget: Math.round(qTotal('QT-4006') * 1.04), advanceReceived: salesOrders[5].advance, status: 'Dispatched', priority: 'High', notes: 'Second dispatch in transit. Installation only after 6 PM.', defs: [['PRD-11', 4, ['Consultation 1', 'Consultation 2', 'Dressing 1', 'Dressing 2']], ['PRD-04', 2, ['Store', 'Records Room']], ['PRD-06', 2, ['Washroom Staff', 'Washroom Public']]], salesExecutive: E.sales1 },
  { id: 'PRJ-6007', name: 'Palm Grove Villas – Phase 1', customerId: 'CUS-1015', salesOrderId: 'SO-5007', manager: E.pm2, mistri: E.mistri2, productionSupervisor: E.prod, installationSupervisor: E.install, siteSupervisor: E.site, startDate: '2026-11-10', endDate: '2027-01-20', location: 'Anjuna Road, Goa', budget: Math.round(qTotal('QT-4007') * 1.05), advanceReceived: salesOrders[6].advance, status: 'On Hold', priority: 'Medium', notes: 'Project on hold — teak stock shortage and site access pending.', defs: [['PRD-01', 1, ['Villa 1 – Entrance']], ['PRD-02', 2, ['Villa 1 – Bedroom', 'Villa 1 – Study']], ['PRD-06', 1, ['Villa 1 – Washroom']], ['PRD-10', 1, ['Villa 1 – Utility']]], salesExecutive: E.sales1 },
  { id: 'PRJ-6008', name: 'Vidya Niketan School – Admin Block', customerId: 'CUS-1010', salesOrderId: 'SO-5008', manager: E.pm1, mistri: E.mistri2, productionSupervisor: E.prod, installationSupervisor: E.install, siteSupervisor: E.site, startDate: '2026-05-04', endDate: '2026-07-25', location: 'Kothrud, Pune', budget: Math.round(qTotal('QT-4008') * 1.03), advanceReceived: salesOrders[7].advance, status: 'Completed', priority: 'Medium', notes: 'Completed during summer vacation. Warranty active until Jul 2027.', defs: [['PRD-08', 3, ['Principal Office', 'Admin Hall', 'Accounts']], ['PRD-02', 2, ['Vice Principal', 'Store']], ['PRD-06', 1, ['Washroom']]], salesExecutive: E.sales2 },
];

const PROJECT_DOCS = {
  'PRJ-6001': projectDocs('P1'), 'PRJ-6002': projectDocs('P2'), 'PRJ-6003': projectDocs('P3'),
  'PRJ-6004': projectDocs('P4'), 'PRJ-6005': projectDocs('P5'), 'PRJ-6006': projectDocs('P6'),
  'PRJ-6007': projectDocs('P7'), 'PRJ-6008': projectDocs('P8'),
};

export const projects = projectSeeds.map((p) => {
  const doors = makeDoors(p.id, p.defs);
  return {
    id: p.id, name: p.name, customerId: p.customerId, salesOrderId: p.salesOrderId,
    manager: p.manager, mistri: p.mistri, productionSupervisor: p.productionSupervisor,
    installationSupervisor: p.installationSupervisor, siteSupervisor: p.siteSupervisor,
    startDate: p.startDate, endDate: p.endDate, location: p.location,
    totalDoors: doors.length, budget: p.budget, advanceReceived: p.advanceReceived,
    status: p.status, priority: p.priority, notes: p.notes, documents: PROJECT_DOCS[p.id],
    doors, salesExecutive: p.salesExecutive,
    issues: [],
  };
});

projects[0].siteApproval = { approved: true, by: E.site, at: dt('2026-04-06', '11:15'), remarks: 'All 8 doors inspected and approved at site.' };
projects[7].siteApproval = { approved: true, by: E.site, at: dt('2026-06-29', '15:40'), remarks: 'All 6 doors inspected and approved at site.' };

projects[0].issues = [{ id: 'ISS-01', title: 'Lift lobby protection sheet damaged', severity: 'Low', status: 'Resolved', raisedBy: E.pm1, date: '2026-03-24', notes: 'Site team replaced protection sheet before installation.' }];
projects[3].issues = [{ id: 'ISS-02', title: 'Fire door powder coating shade mismatch', severity: 'High', status: 'In Progress', raisedBy: E.qc, date: '2026-11-18', notes: 'Sent back for rework; vendor informed.' }];
projects[4].issues = [{ id: 'ISS-03', title: 'CNC carving delay at vendor', severity: 'Medium', status: 'In Progress', raisedBy: E.pm2, date: '2026-11-20', notes: 'Carving vendor committed delivery by 25 Nov.' }];
projects[6].issues = [{ id: 'ISS-04', title: 'Teak stock shortage blocking production', severity: 'High', status: 'Open', raisedBy: E.store, date: '2026-11-22', notes: 'Purchase request PR-101 pending approval.' }];

/* ------------------------------------------------------------------ */
/* PRODUCTION / QC / DISPATCH / INSTALLATION / INSPECTION GENERATION   */
/* ------------------------------------------------------------------ */

const PIPELINES = {
  'PRJ-6001': { production: 'all', qc: 'all', dispatch: 'delivered', install: 'all', inspect: 'all', dates: { dispatch: '2026-03-18', delivery: '2026-03-20', install: '2026-03-28', inspect: '2026-04-05' } },
  'PRJ-6002': {
    production: 'all', qc: 'all', dispatch: 'delivered', install: 'partial', inspect: 'partial',
    dates: { dispatch: '2026-11-08', delivery: '2026-11-10', install: '2026-11-16', inspect: '2026-11-20' },
    overrides: { 3: { installStatus: 'Rework Required', inspectionStatus: 'Snag Raised' } },
  },
  'PRJ-6003': {
    production: 'all', qc: 'all', dispatch: 'delivered', install: 'all', inspect: 'partial',
    dates: { dispatch: '2026-10-28', delivery: '2026-10-30', install: '2026-11-08', inspect: '2026-11-14' },
    overrides: { 4: { inspectionStatus: 'Snag Raised', installStatus: 'Rework Required' } },
  },
  'PRJ-6004': {
    production: 'all', qc: 'partial', dispatch: 'none', install: 'none', inspect: 'none',
    dates: {},
    overrides: {
      0: { productionStatus: 'Completed', qcStatus: 'Approved' },
      1: { productionStatus: 'Completed', qcStatus: 'Pending' },
      2: { productionStatus: 'Completed', qcStatus: 'Rejected' },
      3: { productionStatus: 'In Progress' },
      4: { productionStatus: 'In Progress' },
      5: { productionStatus: 'Completed', qcStatus: 'Pending' },
      6: { productionStatus: 'Material Pending' },
    },
  },
  'PRJ-6005': {
    production: 'all', qc: 'partial', dispatch: 'none', install: 'none', inspect: 'none',
    dates: {},
    overrides: {
      0: { productionStatus: 'Completed', qcStatus: 'Approved' },
      1: { productionStatus: 'Completed', qcStatus: 'Pending' },
      2: { productionStatus: 'In Progress' },
      3: { productionStatus: 'In Progress' },
      4: { productionStatus: 'Ready to Start' },
      5: { productionStatus: 'Material Pending' },
    },
  },
  'PRJ-6006': {
    production: 'all', qc: 'all', dispatch: 'mixed', install: 'none', inspect: 'none',
    dates: { dispatch: '2026-11-20', delivery: '2026-11-22' },
    dispatchSplit: 5,
  },
  'PRJ-6007': { production: 'material', qc: 'none', dispatch: 'none', install: 'none', inspect: 'none', dates: {} },
  'PRJ-6008': { production: 'all', qc: 'all', dispatch: 'delivered', install: 'all', inspect: 'all', dates: { dispatch: '2026-06-12', delivery: '2026-06-14', install: '2026-06-20', inspect: '2026-06-28' } },
};

const materialLinesFor = (door) => {
  const lines = [];
  if (door.material.includes('Teak') || door.material.includes('Sal') || door.material.includes('Pine')) {
    lines.push(`${door.material} – 2.4 cu.ft`, `PU Polish – 1.2 L`, `SS Handle – 2 nos`, `Concealed Hinge – 3 nos`);
  } else if (door.material.includes('Steel')) {
    lines.push(`GI Steel Sheet – 38 kg`, `Powder Coating – 1.6 kg`, `Mortise Lock – 1 no`, `SS Handle – 2 nos`);
  } else if (door.material.includes('uPVC')) {
    lines.push(`uPVC Profile – 5.2 m`, `uPVC Panel – 1 sheet`, `Cylindrical Lock – 1 no`);
  } else if (door.material.includes('Aluminium')) {
    lines.push(`Aluminium Profile – 6.4 m`, `Toughened Glass – 2.2 sq.ft`, `Sliding Track – 2.4 m`);
  } else {
    lines.push(`${door.material} – 1.6 sheet`, `Laminate – 2 sheets`, `Adhesive – 0.6 kg`, `Concealed Hinge – 3 nos`);
  }
  return lines;
};

export const productionOrders = [];
export const qualityInspections = [];
export const dispatches = [];
export const installations = [];
export const siteInspections = [];

const transportNames = ['Gati KWE Logistics', 'VRL Cargo Movers', 'Safexpress Logistics', 'TCI Freight'];
const driverNames = ['Ramesh Pawar', 'Iqbal Khan', 'Dattatray Shinde', 'Bharat Solanki'];
const vehicleNumbers = ['MH-12-AB-4521', 'MH-04-CD-7789', 'MH-12-EF-1120', 'GA-03-GH-6654'];

projects.forEach((project) => {
  const pipe = PIPELINES[project.id];
  if (!pipe) return;
  const levels = [];

  project.doors.forEach((door, idx) => {
    const ov = pipe.overrides?.[idx] || {};
    if (pipe.production === 'none') return;

    let prodStatus = ov.productionStatus;
    if (!prodStatus) {
      if (pipe.production === 'all') prodStatus = 'Completed';
      else if (pipe.production === 'material') prodStatus = idx % 2 === 0 ? 'Material Pending' : 'Ready to Start';
      else prodStatus = 'Pending';
    }

    const prodId = `PO-${String(7001 + productionOrders.length)}`;
    const startOffset = 1 + idx;
    const plannedStart = addDays(project.startDate, startOffset);
    const plannedEnd = addDays(project.startDate, startOffset + 14);
    const isComplete = ['Completed', 'Quality Inspection Pending', 'Quality Approved', 'Rework Required'].includes(prodStatus);
    const record = {
      id: prodId,
      projectId: project.id,
      salesOrderId: project.salesOrderId,
      doorId: door.id,
      doorNumber: door.number,
      productId: door.productId,
      productName: door.productName,
      doorSpec: `${door.material} · ${door.design} · ${door.height}×${door.width}×${door.thickness} mm`,
      quantity: 1,
      mistri: project.mistri,
      supervisor: project.productionSupervisor,
      plannedStart,
      plannedEnd,
      actualStart: ['Pending', 'Material Pending', 'Ready to Start'].includes(prodStatus) ? null : addDays(plannedStart, 1),
      actualEnd: isComplete ? addDays(plannedEnd, -1) : null,
      materialsRequired: materialLinesFor(door),
      materialConsumed: isComplete ? materialLinesFor(door).map((l) => l.replace(/(\d+(\.\d+)?)/, (m) => m)) : [],
      wastage: isComplete ? (idx % 3 === 0 ? '0.4 cu.ft offcut' : 'Nil') : '—',
      batch: `BATCH-${project.id.slice(-2)}-${String(idx + 1).padStart(2, '0')}`,
      notes: ov.note || '',
      status: prodStatus,
    };

    if (isComplete) {
      let qcStatus = ov.qcStatus;
      if (!qcStatus && pipe.qc === 'all') qcStatus = 'Approved';
      if (!qcStatus && pipe.qc === 'partial') qcStatus = idx % 3 === 0 ? 'Approved' : 'Pending';

      if (qcStatus) {
        const qcId = `QC-${String(8001 + qualityInspections.length)}`;
        const reject = qcStatus === 'Rejected';
        const qcDate = addDays(plannedEnd, 1);
        qualityInspections.push({
          id: qcId,
          productionId: prodId,
          projectId: project.id,
          doorNumber: door.number,
          doorName: door.productName,
          date: qcDate,
          inspector: E.qc,
          checks: {
            dimension: !reject,
            material: !reject,
            surface: !reject,
            colour: !reject,
            hardware: qcStatus === 'Approved',
          },
          overall: qcStatus === 'Approved' ? 'Pass' : reject ? 'Fail' : 'Pending',
          images: [{ name: `${door.number}-front.jpg`, at: qcDate }, { name: `${door.number}-edge.jpg`, at: qcDate }],
          remarks: reject ? 'Powder coating shade mismatch against approved RAL 7016 sample. Rework required.' : qcStatus === 'Approved' ? 'All checks within tolerance. Approved for finished goods.' : 'Inspection in progress.',
          status: qcStatus,
          reworkCount: reject ? 1 : 0,
        });
        if (qcStatus === 'Approved') record.status = 'Quality Approved';
        else if (reject) record.status = 'Rework Required';
        else record.status = 'Quality Inspection Pending';
      }
    }

    productionOrders.push(record);
    levels.push({ door, prodId, status: record.status, qc: qualityInspections.filter((q) => q.productionId === prodId).slice(-1)[0] });
  });

  /* Dispatch */
  const approvedDoors = levels.filter((l) => l.qc?.status === 'Approved').map((l) => l.door);
  if (pipe.dispatch !== 'none' && approvedDoors.length) {
    const chunks = pipe.dispatch === 'mixed' && pipe.dispatchSplit
      ? [approvedDoors.slice(0, pipe.dispatchSplit), approvedDoors.slice(pipe.dispatchSplit)]
      : [approvedDoors];

    chunks.forEach((chunk, ci) => {
      if (!chunk.length) return;
      const isTransit = pipe.dispatch === 'mixed' && ci === 1;
      const dispatchId = `DP-${String(9001 + dispatches.length)}`;
      const dispatchDate = pipe.dates.dispatch ? addDays(pipe.dates.dispatch, ci * 2) : addDays(project.startDate, 30);
      const deliveryDate = pipe.dates.delivery ? addDays(pipe.dates.delivery, ci * 2) : addDays(dispatchDate, 3);
      dispatches.push({
        id: dispatchId,
        projectId: project.id,
        customerId: project.customerId,
        doorNumbers: chunk.map((d) => d.number),
        quantity: chunk.length,
        qcRef: chunk.map((d) => {
          const q = qualityInspections.find((x) => x.projectId === project.id && x.doorNumber === d.number && x.status === 'Approved');
          return q?.id;
        }).filter(Boolean).join(', '),
        packingStatus: 'Packed with edge protection and corner guards',
        dispatchDate,
        transportCompany: transportNames[dispatches.length % transportNames.length],
        vehicleNumber: vehicleNumbers[dispatches.length % vehicleNumbers.length],
        driverName: driverNames[dispatches.length % driverNames.length],
        driverMobile: ['+91 98220 55410', '+91 97650 33218', '+91 98903 44210', '+91 99230 11776'][dispatches.length % 4],
        deliveryAddress: customerAddress(project.customerId, 'site'),
        expectedDeliveryDate: deliveryDate,
        actualDeliveryDate: isTransit ? null : deliveryDate,
        deliveryProof: isTransit ? null : `${dispatchId}-POD.pdf`,
        receivedBy: isTransit ? null : 'Site Engineer',
        receivedAt: isTransit ? null : dt(deliveryDate, '16:30'),
        status: isTransit ? 'In Transit' : 'Delivered',
        manager: E.dispatch,
        notes: isTransit ? 'Vehicle departed Chakan warehouse; ETA tomorrow 11 AM.' : 'Delivered and verified at site; POD signed by site engineer.',
      });
    });
  }

  /* Installation */
  if (pipe.install !== 'none') {
    const deliveredDispatches = dispatches.filter((d) => d.projectId === project.id && d.status === 'Delivered');
    const deliveredNumbers = deliveredDispatches.flatMap((d) => d.doorNumbers);
    project.doors.forEach((door, idx) => {
      if (!deliveredNumbers.includes(door.number)) return;
      const ov = pipe.overrides?.[idx] || {};
      let installStatus = ov.installStatus;
      if (!installStatus) {
        if (pipe.install === 'all') installStatus = 'Completed';
        else installStatus = idx < 4 ? 'Completed' : 'In Progress';
      }
      const installId = `IN-${String(1101 + installations.length)}`;
      const plannedDate = pipe.dates.install ? addDays(pipe.dates.install, Math.min(idx, 3)) : addDays(project.startDate, 40);
      installations.push({
        id: installId,
        projectId: project.id,
        customerId: project.customerId,
        doorNumber: door.number,
        doorSpec: `${door.productName} · ${door.height}×${door.width} mm`,
        supervisor: pipe.overrides?.[idx]?.supervisor || E.install,
        team: ['Aftab Ansari', 'Ganesh Shinde', 'Ravi Sutar'],
        plannedDate,
        actualDate: installStatus === 'Completed' || installStatus === 'Rework Required' ? addDays(plannedDate, 1) : null,
        beforeImages: [{ name: `${door.number}-before.jpg`, at: addDays(plannedDate, -1) }],
        afterImages: installStatus === 'Completed' ? [{ name: `${door.number}-after.jpg`, at: addDays(plannedDate, 1) }] : [],
        fittingStatus: installStatus === 'Completed' ? 'Fitted' : installStatus === 'Rework Required' ? 'Refitting' : 'In Progress',
        alignmentStatus: installStatus === 'Completed' ? 'Aligned' : 'Under Check',
        hardwareStatus: installStatus === 'Completed' ? 'Fitted & Tested' : 'Pending',
        finishingStatus: installStatus === 'Completed' ? 'Touch-up Done' : installStatus === 'Rework Required' ? 'Touch-up Pending' : 'Pending',
        remarks: installStatus === 'Rework Required' ? 'Snag raised by site supervisor — hinge alignment and touch-up pending.' : '',
        status: installStatus,
      });
    });
  }

  /* Site inspection */
  if (pipe.inspect !== 'none') {
    project.doors.forEach((door, idx) => {
      const inst = installations.find((i) => i.projectId === project.id && i.doorNumber === door.number);
      if (!inst) return;
      if (!['Completed', 'Rework Required', 'Inspection Pending'].includes(inst.status)) return;
      const ov = pipe.overrides?.[idx] || {};
      let status = ov.inspectionStatus;
      if (!status) {
        if (pipe.inspect === 'all') status = 'Approved';
        else if (idx < 2) status = 'Approved';
        else status = 'Pending Inspection';
      }
      const inspId = `SI-${String(1201 + siteInspections.length)}`;
      const inspDate = pipe.dates.inspect ? addDays(pipe.dates.inspect, Math.min(idx, 2)) : addDays(project.startDate, 55);
      const rejected = ['Rejected', 'Snag Raised', 'Rework Required'].includes(status);
      siteInspections.push({
        id: inspId,
        projectId: project.id,
        customerId: project.customerId,
        supervisor: E.site,
        doorNumber: door.number,
        inspectionDate: inspDate,
        installationId: inst.id,
        checks: {
          alignment: status === 'Approved',
          opening: status === 'Approved',
          lock: status === 'Approved',
          handle: status === 'Approved',
          hinge: status === 'Approved' ? true : status === 'Snag Raised' ? false : null,
          surface: status === 'Approved',
          quality: status === 'Approved',
        },
        defectDescription: rejected ? 'Hinge side gap 4mm and touch-up required near bottom rail.' : '',
        images: [{ name: `${door.number}-site.jpg`, at: inspDate }],
        remarks: rejected ? 'Snag raised. Installation team to realign and complete touch-up before re-inspection.' : status === 'Approved' ? 'Door operates smoothly, alignment and finish acceptable.' : 'Inspection scheduled with site engineer.',
        status,
        history: status === 'Approved'
          ? [{ at: dt(inspDate, '11:15'), by: E.site, status: 'Approved', remarks: 'Final site approval granted.' }]
          : [{ at: dt(inspDate, '12:00'), by: E.site, status, remarks: 'Recorded during site inspection.' }],
      });
      if (status === 'Snag Raised' || status === 'Rejected' || status === 'Rework Required') {
        inst.status = 'Rework Required';
      } else if (status === 'Approved') {
        inst.status = 'Completed';
      } else {
        inst.status = 'Inspection Pending';
      }
    });
  }
});

/* ------------------------------------------------------------------ */
/* INVOICES & PAYMENTS                                                */
/* ------------------------------------------------------------------ */

const payment = (id, date, amount, method, reference, note = '') => ({ id, date, amount, method, reference, note });

const baseInvoice = (id, projectId, orderId, date, dueDate, payments, paymentMethod, transactionReference, notes = '') => {
  const customerId = projects.find((p) => p.id === projectId)?.customerId;
  const total = oTotal(orderId);
  const amount = Math.round(total / 1.18);
  const tax = total - amount;
  return {
    id,
    customerId,
    projectId,
    salesOrderId: orderId,
    invoiceDate: date,
    dueDate,
    amount,
    tax,
    discount: 0,
    total,
    advanceReceived: salesOrders.find((o) => o.id === orderId)?.advance || 0,
    paymentMethod,
    transactionReference,
    payments,
    notes,
  };
};

export const invoices = [
  { ...baseInvoice('INV-7001', 'PRJ-6001', 'SO-5001', '2026-03-05', '2026-04-04', [payment('PAY-01', '2026-03-06', Math.round(oTotal('SO-5001') * 0.4), 'RTGS', 'RTGS-HDFC-672194'), payment('PAY-02', '2026-04-28', oTotal('SO-5001') - Math.round(oTotal('SO-5001') * 0.4), 'NEFT', 'NEFT-HDFC-889120', 'Final settlement')], 'RTGS', 'RTGS-HDFC-672194'), status: 'Paid' },
  { ...baseInvoice('INV-7002', 'PRJ-6002', 'SO-5002', '2026-10-30', '2026-12-14', [payment('PAY-03', '2026-08-06', Math.round(oTotal('SO-5002') * 0.5), 'RTGS', 'RTGS-ICICI-552781', '50% advance'), payment('PAY-04', '2026-11-18', 500000, 'NEFT', 'NEFT-ICICI-990123', 'Milestone — doors installed')], 'RTGS', 'RTGS-ICICI-552781'), status: 'Partially Paid', notes: 'Balance against site approval.' },
  { ...baseInvoice('INV-7003', 'PRJ-6003', 'SO-5003', '2026-09-15', '2026-10-15', [payment('PAY-05', '2026-08-20', Math.round(oTotal('SO-5003') * 0.4), 'NEFT', 'NEFT-AXIS-334512', 'Advance')], 'NEFT', 'NEFT-AXIS-334512'), status: 'Overdue', notes: 'Follow up with architect for release of payment.' },
  { ...baseInvoice('INV-7004', 'PRJ-6004', 'SO-5004', '2026-10-05', '2026-12-05', [payment('PAY-06', '2026-09-10', Math.round(oTotal('SO-5004') * 0.3), 'Cheque', 'CHQ-440128', '30% advance')], 'Cheque', 'CHQ-440128'), status: 'Partially Paid' },
  { ...baseInvoice('INV-7005', 'PRJ-6005', 'SO-5005', '2026-09-25', '2026-11-24', [payment('PAY-07', '2026-09-01', Math.round(oTotal('SO-5005') * 0.5), 'RTGS', 'RTGS-HDFC-772310', '50% advance')], 'RTGS', 'RTGS-HDFC-772310'), status: 'Partially Paid', notes: 'Milestone payment due on dispatch.' },
  { ...baseInvoice('INV-7006', 'PRJ-6006', 'SO-5006', '2026-11-10', '2027-01-10', [], 'NEFT', '', 'Proforma issued; tax invoice after installation.'), status: 'Unpaid' },
  { ...baseInvoice('INV-7007', 'PRJ-6007', 'SO-5007', '2026-11-15', '2026-12-30', [], 'NEFT', '', 'Project on hold — invoice to be raised on dispatch.'), status: 'Draft' },
  { ...baseInvoice('INV-7008', 'PRJ-6008', 'SO-5008', '2026-06-20', '2026-07-20', [payment('PAY-08', '2026-07-18', oTotal('SO-5008'), 'NEFT', 'NEFT-SBI-661092', 'Full and final payment')], 'NEFT', 'NEFT-SBI-661092'), status: 'Paid' },
  { ...baseInvoice('INV-7009', 'PRJ-6002', 'SO-5002', '2026-11-20', '2026-12-20', [], 'RTGS', '', 'Second milestone invoice, raised after installation of first 4 doors.'), status: 'Unpaid' },
];

/* ------------------------------------------------------------------ */
/* WARRANTY / SERVICE                                                 */
/* ------------------------------------------------------------------ */

const serviceRow = (id, projectId, doorNumber, complaintDate, type, description, technician, priority, serviceDate, resolution, status) => {
  const project = projects.find((p) => p.id === projectId);
  const warrantyStart = projectId === 'PRJ-6001' ? '2026-05-01' : '2026-08-01';
  return {
    id, customerId: project?.customerId, projectId, doorNumber,
    warrantyStart, warrantyEnd: '2027-04-30',
    complaintDate, complaintType: type, description,
    technician, priority, serviceDate, resolution, status,
    history: [{ at: dt(complaintDate, '10:20'), by: E.service, status: 'New', remarks: 'Complaint logged by service desk.' }],
  };
};

export const serviceTickets = [
  serviceRow('ST-9001', 'PRJ-6001', 'D-01', '2026-09-12', 'Lock / Hardware', 'Main entrance mortise lock key turning stiff after monsoon.', 'Ramesh Gupta', 'High', '2026-09-15', 'Lock cylinder lubricated and strike plate adjusted. Customer satisfied.', 'Closed'),
  serviceRow('ST-9002', 'PRJ-6001', 'D-03', '2026-10-02', 'Door Alignment', 'Board room door rubbing on top edge during closing.', 'Aftab Ansari', 'Medium', '2026-10-05', 'Hinges adjusted and door realigned.', 'Resolved'),
  serviceRow('ST-9003', 'PRJ-6001', 'D-05', '2026-09-28', 'Surface / Polish', 'Minor polish dullness near handle on reception door.', 'Ramesh Gupta', 'Low', '2026-10-04', 'Touch-up polish completed.', 'Closed'),
  serviceRow('ST-9004', 'PRJ-6008', 'D-02', '2026-10-18', 'Hinge Noise', 'Principal office door hinge squeaking.', 'Sandeep More', 'Low', '2026-10-21', 'Hinges cleaned and lubricated.', 'Closed'),
  serviceRow('ST-9005', 'PRJ-6008', 'D-05', '2026-11-06', 'Lock / Hardware', 'Cylindrical lock latch not retracting fully.', 'Aftab Ansari', 'Medium', '2026-11-09', 'Replacement latch ordered; temporary adjustment done.', 'Waiting for Parts'),
  serviceRow('ST-9006', 'PRJ-6008', 'D-01', '2026-11-14', 'Surface / Polish', 'Laminate peeling at bottom edge of admin hall door.', 'Ramesh Gupta', 'Medium', '2026-11-19', 'Edge re-bonded and trimmed.', 'Resolved'),
  serviceRow('ST-9007', 'PRJ-6002', 'D-01', '2026-11-21', 'Door Alignment', 'Pivot door not closing flush after installation.', 'Aftab Ansari', 'High', '2026-11-23', '', 'In Progress'),
  serviceRow('ST-9008', 'PRJ-6003', 'D-03', '2026-11-22', 'Glass / Panel Damage', 'Minor scratch observed on veneer panel during site handling.', 'Sandeep More', 'Low', '2026-11-25', '', 'Assigned'),
];

/* ------------------------------------------------------------------ */
/* SUPPLIERS, MATERIALS, PURCHASE & STOCK MOVES                       */
/* ------------------------------------------------------------------ */

export const suppliers = [
  { id: 'SUP-01', name: 'Supreme Timber Traders', contactPerson: 'Yusuf Merchant', phone: '+91 98220 33418', email: 'sales@supremetimber.in', gst: '27AAJFS4412R1ZM', category: 'Wood', city: 'Pune', address: 'Timber Market, Bhawani Peth, Pune', rating: 4.6, active: true },
  { id: 'SUP-02', name: 'Shakti Hardware Mart', contactPerson: 'Girish Jain', phone: '+91 98901 77123', email: 'orders@shaktihardware.in', gst: '27AAHPS5521T1ZP', category: 'Hardware', city: 'Pune', address: 'Shop 22, Raviwar Peth, Pune', rating: 4.3, active: true },
  { id: 'SUP-03', name: 'Jindal Steel Depot', contactPerson: 'Sanjay Rathi', phone: '+91 98230 99112', email: 'sanjay@jindalsteeldepot.in', gst: '27AAFCJ6612K1Z9', category: 'Steel', city: 'Pune', address: 'Plot 8, Bhosari MIDC, Pune', rating: 4.5, active: true },
  { id: 'SUP-04', name: 'Asian Paints Dealers', contactPerson: 'Prashant Desai', phone: '+91 97650 22189', email: 'prashant@apdealer.in', gst: '27AABCA1120L1Z3', category: 'Finish', city: 'Pune', address: 'FC Road, Pune', rating: 4.2, active: true },
  { id: 'SUP-05', name: 'GreenBoard MDF Co.', contactPerson: 'Alok Sharma', phone: '+91 99220 33417', email: 'alok@greenboardmdf.in', gst: '27AAJCG7781P1ZQ', category: 'Boards', city: 'Nashik', address: 'Satpur MIDC, Nashik', rating: 4.4, active: true },
  { id: 'SUP-06', name: 'Apex Laminates', contactPerson: 'Sneha Agarwal', phone: '+91 98227 88120', email: 'sneha@apexlaminates.in', gst: '27AAACA9981M1Z7', category: 'Laminates', city: 'Mumbai', address: 'Andheri East, Mumbai', rating: 4.1, active: true },
];

export const materials = [
  { id: 'MAT-5001', name: 'Teak Wood (Grade A)', category: 'Wood', supplierId: 'SUP-01', unit: 'cu.ft', openingStock: 120, purchasedQty: 260, reservedQty: 180, consumedQty: 140, minStock: 80, unitCost: 4200, warehouse: 'Chakan Main Warehouse', rack: 'W-A1', reservedFor: [{ projectId: 'PRJ-6005', qty: 120 }, { projectId: 'PRJ-6007', qty: 60 }] },
  { id: 'MAT-5002', name: 'Sal Wood (Grade B)', category: 'Wood', supplierId: 'SUP-01', unit: 'cu.ft', openingStock: 300, purchasedQty: 200, reservedQty: 240, consumedQty: 210, minStock: 60, unitCost: 2400, warehouse: 'Chakan Main Warehouse', rack: 'W-A2', reservedFor: [{ projectId: 'PRJ-6002', qty: 90 }, { projectId: 'PRJ-6008', qty: 150 }] },
  { id: 'MAT-5003', name: 'MDF Board 18mm', category: 'Boards', supplierId: 'SUP-05', unit: 'sheet', openingStock: 500, purchasedQty: 300, reservedQty: 220, consumedQty: 180, minStock: 100, unitCost: 1850, warehouse: 'Chakan Main Warehouse', rack: 'W-B1', reservedFor: [{ projectId: 'PRJ-6002', qty: 80 }, { projectId: 'PRJ-6005', qty: 140 }] },
  { id: 'MAT-5004', name: 'HDF Board 12mm', category: 'Boards', supplierId: 'SUP-05', unit: 'sheet', openingStock: 220, purchasedQty: 120, reservedQty: 90, consumedQty: 70, minStock: 60, unitCost: 1420, warehouse: 'Chakan Main Warehouse', rack: 'W-B2' },
  { id: 'MAT-5005', name: 'GI Steel Sheet 1.2mm', category: 'Steel', supplierId: 'SUP-03', unit: 'sheet', openingStock: 400, purchasedQty: 250, reservedQty: 180, consumedQty: 160, minStock: 100, unitCost: 2650, warehouse: 'Bhosari Store', rack: 'S-C1', reservedFor: [{ projectId: 'PRJ-6004', qty: 60 }, { projectId: 'PRJ-6006', qty: 120 }] },
  { id: 'MAT-5006', name: 'Stainless Steel Sheet 304', category: 'Steel', supplierId: 'SUP-03', unit: 'sheet', openingStock: 150, purchasedQty: 80, reservedQty: 60, consumedQty: 45, minStock: 40, unitCost: 4850, warehouse: 'Bhosari Store', rack: 'S-C2' },
  { id: 'MAT-5007', name: 'PU Polish (Matte)', category: 'Finish', supplierId: 'SUP-04', unit: 'L', openingStock: 90, purchasedQty: 60, reservedQty: 45, consumedQty: 30, minStock: 25, unitCost: 780, warehouse: 'Chakan Main Warehouse', rack: 'F-D1' },
  { id: 'MAT-5008', name: 'Laminate Sheet 1mm', category: 'Laminates', supplierId: 'SUP-06', unit: 'sheet', openingStock: 280, purchasedQty: 160, reservedQty: 100, consumedQty: 80, minStock: 100, unitCost: 690, warehouse: 'Chakan Main Warehouse', rack: 'W-B3' },
  { id: 'MAT-5009', name: 'SS Handle 300mm', category: 'Hardware', supplierId: 'SUP-02', unit: 'pcs', openingStock: 420, purchasedQty: 200, reservedQty: 260, consumedQty: 220, minStock: 100, unitCost: 540, warehouse: 'Chakan Main Warehouse', rack: 'H-E1' },
  { id: 'MAT-5010', name: 'Mortise Lock Set', category: 'Hardware', supplierId: 'SUP-02', unit: 'pcs', openingStock: 180, purchasedQty: 100, reservedQty: 130, consumedQty: 120, minStock: 40, unitCost: 1650, warehouse: 'Chakan Main Warehouse', rack: 'H-E2' },
  { id: 'MAT-5011', name: 'Concealed Hinge 4"', category: 'Hardware', supplierId: 'SUP-02', unit: 'pcs', openingStock: 800, purchasedQty: 400, reservedQty: 560, consumedQty: 480, minStock: 100, unitCost: 210, warehouse: 'Chakan Main Warehouse', rack: 'H-E3' },
  { id: 'MAT-5012', name: 'Door Closer (Hydraulic)', category: 'Hardware', supplierId: 'SUP-02', unit: 'pcs', openingStock: 90, purchasedQty: 60, reservedQty: 90, consumedQty: 60, minStock: 30, unitCost: 2180, warehouse: 'Chakan Main Warehouse', rack: 'H-E4' },
  { id: 'MAT-5013', name: 'uPVC Profile 60mm', category: 'uPVC', supplierId: 'SUP-05', unit: 'm', openingStock: 600, purchasedQty: 300, reservedQty: 280, consumedQty: 240, minStock: 150, unitCost: 320, warehouse: 'Pune Finished Goods', rack: 'U-F1' },
  { id: 'MAT-5014', name: 'Aluminium Profile 70mm', category: 'Aluminium', supplierId: 'SUP-03', unit: 'm', openingStock: 500, purchasedQty: 250, reservedQty: 200, consumedQty: 190, minStock: 120, unitCost: 480, warehouse: 'Pune Finished Goods', rack: 'U-F2' },
  { id: 'MAT-5015', name: 'Wood Primer', category: 'Finish', supplierId: 'SUP-04', unit: 'L', openingStock: 70, purchasedQty: 50, reservedQty: 40, consumedQty: 38, minStock: 20, unitCost: 410, warehouse: 'Chakan Main Warehouse', rack: 'F-D2' },
  { id: 'MAT-5016', name: 'Silicone Sealant', category: 'Consumables', supplierId: 'SUP-02', unit: 'pcs', openingStock: 260, purchasedQty: 100, reservedQty: 140, consumedQty: 120, minStock: 50, unitCost: 260, warehouse: 'Chakan Main Warehouse', rack: 'C-G1' },
];

export const purchaseRequests = [
  { id: 'PR-101', materialId: 'MAT-5001', qty: 120, requestedBy: E.store, requestDate: '2026-11-21', requiredBy: '2026-11-28', projectId: 'PRJ-6005', supplierId: 'SUP-01', status: 'Pending Approval', notes: 'Urgent teak requirement for hotel carving work.' },
  { id: 'PR-102', materialId: 'MAT-5011', qty: 200, requestedBy: E.store, requestDate: '2026-11-16', requiredBy: '2026-11-24', projectId: 'PRJ-6004', supplierId: 'SUP-02', status: 'Approved', notes: 'Replenishment for clubhouse doors.' },
  { id: 'PR-103', materialId: 'MAT-5012', qty: 60, requestedBy: E.store, requestDate: '2026-11-10', requiredBy: '2026-11-22', projectId: 'PRJ-6006', supplierId: 'SUP-02', status: 'Ordered', notes: 'Door closers for hospital OPD block.' },
  { id: 'PR-104', materialId: 'MAT-5007', qty: 40, requestedBy: E.store, requestDate: '2026-11-02', requiredBy: '2026-11-15', projectId: 'PRJ-6003', supplierId: 'SUP-04', status: 'Received', notes: 'PU polish for villa touch-up.' },
];

export const stockMoves = [
  { id: 'STM-01', materialId: 'MAT-5001', type: 'Inward', qty: 160, date: '2026-11-05', projectId: null, user: E.store, note: 'GRN-2026-118 · Supreme Timber' },
  { id: 'STM-02', materialId: 'MAT-5001', type: 'Consumption', qty: 48, date: '2026-11-12', projectId: 'PRJ-6005', user: E.mistri2, note: 'Issued to carving line' },
  { id: 'STM-03', materialId: 'MAT-5003', type: 'Reservation', qty: 140, date: '2026-11-08', projectId: 'PRJ-6005', user: E.store, note: 'Reserved against hotel lobby doors' },
  { id: 'STM-04', materialId: 'MAT-5011', type: 'Consumption', qty: 120, date: '2026-11-10', projectId: 'PRJ-6004', user: E.mistri1, note: 'Clubhouse door hinges' },
  { id: 'STM-05', materialId: 'MAT-5012', type: 'Inward', qty: 60, date: '2026-11-19', projectId: null, user: E.store, note: 'GRN-2026-124 · Shakti Hardware' },
  { id: 'STM-06', materialId: 'MAT-5008', type: 'Outward', qty: 40, date: '2026-11-18', projectId: 'PRJ-6003', user: E.store, note: 'Issued for villa installation touch-up' },
  { id: 'STM-07', materialId: 'MAT-5007', type: 'Wastage', qty: 2, date: '2026-11-20', projectId: 'PRJ-6005', user: E.prod, note: 'Spillage during polish batch' },
  { id: 'STM-08', materialId: 'MAT-5010', type: 'Reservation', qty: 40, date: '2026-11-21', projectId: 'PRJ-6006', user: E.store, note: 'Reserved for hospital doors' },
];

/* ------------------------------------------------------------------ */
/* ACTIVITY & NOTIFICATIONS                                           */
/* ------------------------------------------------------------------ */

const qcApproved = qualityInspections.find((q) => q.status === 'Approved') || qualityInspections[0];
const qcRejected = qualityInspections.find((q) => q.status === 'Rejected') || qcApproved;
const installDone = installations.find((i) => i.status === 'Completed') || installations[0];
const sitePending = siteInspections.find((s) => s.status === 'Pending Inspection') || siteInspections[0];
const latestLead = leads.find((l) => l.id === 'LD-2024');

export const activities = [
  { id: 'ACT-0001', at: dt('2026-11-24', '09:42'), user: E.qc, role: 'qc', module: 'quality', entityType: 'qualityInspections', entityId: qcApproved?.id, action: 'QC inspection approved', detail: `${qcApproved?.doorName || 'Door'} ${qcApproved?.doorNumber || ''} cleared for finished goods.` },
  { id: 'ACT-0002', at: dt('2026-11-23', '17:10'), user: E.site, role: 'site_supervisor', module: 'inspections', entityType: 'siteInspections', entityId: sitePending?.id, action: 'Site inspection scheduled', detail: 'Final walkthrough booked with project manager and client.' },
  { id: 'ACT-0003', at: dt('2026-11-23', '15:25'), user: E.install, role: 'installation_supervisor', module: 'installation', entityType: 'installations', entityId: installDone?.id, action: 'Installation completed', detail: `${installDone?.doorNumber || 'Door'} installed and submitted for site inspection.` },
  { id: 'ACT-0004', at: dt('2026-11-22', '16:40'), user: E.pm2, role: 'project_manager', module: 'projects', entityType: 'projects', entityId: 'PRJ-6003', action: 'Project issue raised', detail: 'Snag raised on D-05 — hinge alignment and touch-up pending.' },
  { id: 'ACT-0005', at: dt('2026-11-22', '12:05'), user: E.sales1, role: 'sales', module: 'leads', entityType: 'leads', entityId: latestLead?.id, action: 'New site visit required', detail: 'Tower D enquiry logged for Urban Nest Developers.' },
  { id: 'ACT-0006', at: dt('2026-11-21', '10:30'), user: E.store, role: 'store', module: 'inventory', entityType: 'purchaseRequests', entityId: 'PR-101', action: 'Purchase request raised', detail: '120 cu.ft teak wood requested for Solitaire hotel project.' },
  { id: 'ACT-0007', at: dt('2026-11-20', '18:20'), user: E.dispatch, role: 'dispatch', module: 'dispatch', entityType: 'dispatches', entityId: dispatches[dispatches.length - 1]?.id, action: 'Dispatch in transit', detail: 'Second hospital dispatch left Chakan warehouse; ETA 25 Nov.' },
  { id: 'ACT-0008', at: dt('2026-11-19', '14:15'), user: E.accounts, role: 'accounts', module: 'accounts', entityType: 'invoices', entityId: 'INV-7002', action: 'Payment recorded', detail: '₹5,00,000 milestone payment received from Skyline Realty.' },
  { id: 'ACT-0009', at: dt('2026-11-18', '11:50'), user: E.qc, role: 'qc', module: 'quality', entityType: 'qualityInspections', entityId: qcRejected?.id, action: 'QC rejected for rework', detail: 'Fire door shade mismatch — returned to production.' },
  { id: 'ACT-0010', at: dt('2026-11-17', '09:35'), user: E.sales1, role: 'sales', module: 'leads', entityType: 'leads', entityId: 'LD-2018', action: 'Lead created', detail: 'Crystal Tower enquiry added with 16-door requirement.' },
  { id: 'ACT-0011', at: dt('2026-11-16', '16:00'), user: E.est, role: 'estimation', module: 'quotations', entityType: 'quotations', entityId: 'QT-4012', action: 'Quotation sent', detail: 'QT-4012 sent to Nirmal Constructions for 10 doors.' },
  { id: 'ACT-0012', at: dt('2026-11-15', '10:20'), user: E.pm1, role: 'project_manager', module: 'projects', entityType: 'projects', entityId: 'PRJ-6006', action: 'Dispatch approved', detail: 'OPD block doors approved for dispatch after QC clearance.' },
  { id: 'ACT-0013', at: dt('2026-11-14', '15:45'), user: E.pm1, role: 'project_manager', module: 'projects', entityType: 'projects', entityId: 'PRJ-6004', action: 'Production plan updated', detail: 'Clubhouse batch rescheduled to accommodate rework door.' },
  { id: 'ACT-0014', at: dt('2026-11-12', '12:30'), user: E.sales1, role: 'sales', module: 'leads', entityType: 'leads', entityId: 'LD-2016', action: 'Follow-up scheduled', detail: 'Call with Sanjay Deshpande planned for 25 Nov.' },
  { id: 'ACT-0015', at: dt('2026-11-10', '09:10'), user: E.accounts, role: 'accounts', module: 'accounts', entityType: 'invoices', entityId: 'INV-7006', action: 'Invoice generated', detail: 'Proforma invoice raised for Metro Care OPD block.' },
  { id: 'ACT-0016', at: dt('2026-11-08', '11:15'), user: E.service, role: 'service', module: 'service', entityType: 'serviceTickets', entityId: 'ST-9005', action: 'Service ticket updated', detail: 'Latch replacement part ordered; site informed.' },
];

export const notifications = [
  { id: 'NTF-01', title: '2 quotations awaiting approval', message: 'QT-4013 and QT-4015 need estimation approval.', tone: 'warning', at: dt('2026-11-24', '09:15'), read: false, link: '/quotations' },
  { id: 'NTF-02', title: 'Site approvals pending', message: '2 doors await site supervisor approval at Aakar Villa.', tone: 'warning', at: dt('2026-11-24', '08:50'), read: false, link: '/inspections' },
  { id: 'NTF-03', title: 'Invoice overdue', message: 'INV-7003 for Aakar Architects is past due.', tone: 'error', at: dt('2026-11-23', '17:30'), read: false, link: '/accounts' },
  { id: 'NTF-04', title: 'Low stock alert', message: 'Teak wood and mortise locks are below minimum stock.', tone: 'warning', at: dt('2026-11-23', '12:10'), read: false, link: '/inventory' },
  { id: 'NTF-05', title: 'Dispatch in transit', message: 'DP-9005 with 3 hospital doors is expected tomorrow.', tone: 'info', at: dt('2026-11-22', '18:00'), read: true, link: '/dispatch' },
  { id: 'NTF-06', title: 'Payment received', message: '₹5,00,000 received from Skyline Realty against INV-7002.', tone: 'success', at: dt('2026-11-19', '14:15'), read: true, link: '/accounts' },
  { id: 'NTF-07', title: 'New warranty complaint', message: 'ST-9007 logged for Skyline Grand Residency pivot door.', tone: 'error', at: dt('2026-11-21', '10:40'), read: false, link: '/service' },
  { id: 'NTF-08', title: 'Project on hold', message: 'Palm Grove Villas is blocked by teak stock shortage.', tone: 'warning', at: dt('2026-11-22', '09:30'), read: true, link: '/projects/PRJ-6007' },
];
