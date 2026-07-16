/**
 * Mock "external application" directory.
 *
 * In the real product, clients and their contacts are owned by another
 * application called "SET". The site form only *links* to those records — it
 * does not create or fully edit them. This file fakes that remote directory so
 * the design can be built entirely on dummy data.
 *
 * Shapes are intentionally flat + reference friendly:
 *   client  -> { id, firstName, lastName, companyName, primaryEmail, phone, customerId, source }
 *   contact -> { id, clientId, name, phone, email, defaultRole, source }
 */

const SOURCE = 'SET';

const CLIENTS = [
  {
    id: 'CLI-001',
    firstName: 'Abdullah',
    lastName: 'Qamar',
    companyName: 'EDGE Sync',
    primaryEmail: 'abdullah.qamar@edgesync.com',
    secondaryEmail: 'ops@edgesync.com',
    phone: '+1555014265',
    customerId: 'CUST-4265',
    localWorked: 'NY-001',
    source: SOURCE,
  },
  {
    id: 'CLI-002',
    firstName: 'Laura',
    lastName: 'Bennett',
    companyName: 'Downtown Holdings',
    primaryEmail: 'laura.bennett@downtownholdings.com',
    secondaryEmail: 'facilities@downtownholdings.com',
    phone: '+15553862210',
    customerId: 'CUST-1002',
    localWorked: 'NY-014',
    source: SOURCE,
  },
  {
    id: 'CLI-003',
    firstName: 'Robert',
    lastName: 'Hayes',
    companyName: 'Harborview Logistics',
    primaryEmail: 'robert.hayes@harborviewlogistics.com',
    secondaryEmail: 'security@harborviewlogistics.com',
    phone: '+15554991000',
    customerId: 'CUST-1003',
    localWorked: 'NY-002',
    source: SOURCE,
  },
  {
    id: 'CLI-004',
    firstName: 'Marcus',
    lastName: 'Feld',
    companyName: 'Northgate Corporate Center',
    primaryEmail: 'marcus.feld@northgate.com',
    secondaryEmail: 'facility@northgate.com',
    phone: '+15557778001',
    customerId: 'CUST-1004',
    localWorked: 'NJ-007',
    source: SOURCE,
  },
  {
    id: 'CLI-005',
    firstName: 'Sofia',
    lastName: 'Marino',
    companyName: 'Baywatch Retail Group',
    primaryEmail: 'sofia.marino@baywatchretail.com',
    secondaryEmail: 'regional@baywatchretail.com',
    phone: '+15552229004',
    customerId: 'CUST-1005',
    localWorked: 'CA-311',
    source: SOURCE,
  },
];

const CONTACTS = [
  // EDGE Sync (CLI-001)
  {
    id: 'CON-001',
    clientId: 'CLI-001',
    name: 'Bilal Khan',
    phone: '+15550101010',
    email: 'bilal.khan@edgesync.com',
    defaultRole: 'Facility Manager',
    source: SOURCE,
  },
  {
    id: 'CON-002',
    clientId: 'CLI-001',
    name: 'Hina Raza',
    phone: '+15550101020',
    email: 'hina.raza@edgesync.com',
    defaultRole: 'Site Coordinator',
    source: SOURCE,
  },
  {
    id: 'CON-003',
    clientId: 'CLI-001',
    name: 'Omar Siddiqui',
    phone: '+15550101030',
    email: 'omar.siddiqui@edgesync.com',
    defaultRole: 'Security Lead',
    source: SOURCE,
  },
  // Downtown Holdings (CLI-002)
  {
    id: 'CON-004',
    clientId: 'CLI-002',
    name: 'David Nguyen',
    phone: '+15553862215',
    email: 'david.nguyen@downtownholdings.com',
    defaultRole: 'Property Supervisor',
    source: SOURCE,
  },
  {
    id: 'CON-005',
    clientId: 'CLI-002',
    name: 'Priya Shah',
    phone: '+15553862218',
    email: 'priya.shah@downtownholdings.com',
    defaultRole: 'Emergency Coordinator',
    source: SOURCE,
  },
  // Harborview Logistics (CLI-003)
  {
    id: 'CON-006',
    clientId: 'CLI-003',
    name: 'Anita Brooks',
    phone: '+15554991022',
    email: 'anita.brooks@harborviewlogistics.com',
    defaultRole: 'Ops Manager',
    source: SOURCE,
  },
  {
    id: 'CON-007',
    clientId: 'CLI-003',
    name: 'Greg Palmer',
    phone: '+15554991044',
    email: 'greg.palmer@harborviewlogistics.com',
    defaultRole: 'Dock Supervisor',
    source: SOURCE,
  },
  // Northgate (CLI-004)
  {
    id: 'CON-008',
    clientId: 'CLI-004',
    name: 'Elena Ford',
    phone: '+15557778022',
    email: 'elena.ford@northgate.com',
    defaultRole: 'Building Manager',
    source: SOURCE,
  },
  // Baywatch Retail (CLI-005)
  {
    id: 'CON-009',
    clientId: 'CLI-005',
    name: 'Tomás Rivera',
    phone: '+15552229044',
    email: 'tomas.rivera@baywatchretail.com',
    defaultRole: 'Regional Manager',
    source: SOURCE,
  },
  // Shared / franchise-wide contacts not tied to a single client
  {
    id: 'CON-100',
    clientId: null,
    name: '24/7 Command Center',
    phone: '+18005550100',
    email: 'command.center@edgesecurity.com',
    defaultRole: 'Dispatch',
    source: SOURCE,
  },
  {
    id: 'CON-101',
    clientId: null,
    name: 'Regional Escalation Desk',
    phone: '+18005550101',
    email: 'escalations@edgesecurity.com',
    defaultRole: 'Escalation',
    source: SOURCE,
  },
];

const clone = (value) => JSON.parse(JSON.stringify(value));

/** All external clients (optionally filtered by a free-text search term). */
export function getExternalClients(search = '') {
  const term = String(search || '')
    .trim()
    .toLowerCase();
  const rows = clone(CLIENTS);
  if (!term) return rows;
  return rows.filter((c) =>
    [c.firstName, c.lastName, c.companyName, c.primaryEmail, c.customerId]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(term)),
  );
}

/** A single external client by id. */
export function getExternalClientById(id) {
  if (!id) return null;
  const match = CLIENTS.find((c) => String(c.id) === String(id));
  return match ? clone(match) : null;
}

/**
 * External contacts. When `clientId` is provided, returns that client's
 * contacts plus the shared (clientId === null) contacts, so the picker always
 * has escalation/dispatch options available.
 */
export function getExternalContacts(clientId = null) {
  const rows = clone(CONTACTS);
  if (!clientId) return rows;
  return rows.filter((c) => c.clientId === null || String(c.clientId) === String(clientId));
}
