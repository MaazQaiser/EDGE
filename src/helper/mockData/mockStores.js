const clone = (value) => JSON.parse(JSON.stringify(value));

const SUPERVISOR_MIKE = {
  id: 1,
  name: 'Mike Ross',
  image:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face',
  imageUrl:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face',
};

const SUPERVISOR_SARAH = {
  id: 2,
  name: 'Sarah Connor',
  image:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face',
  imageUrl:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face',
};

/** Shared address IDs — must match `/configs` mock country/state/city hierarchy. */
const US_COUNTRY = { id: 1, name: 'United States', countryCode: 'US' };
const NY_STATE = { id: 33, name: 'New York', countryId: 1 };
const NYC_CITY = { id: 512, name: 'New York' };

const stores = {
  sites: clone([
    {
      id: 1,
      name: 'EDGE Sync Test Site 1784022097',
      status: 'requires_attention',
      address: '123 Test Street',
      address2: '',
      country: US_COUNTRY,
      state: NY_STATE,
      city: NYC_CITY,
      countryCode: 'US',
      zipCode: '10007',
      postalCode: '10007',
      noOfOfficers: 0,
      customerId: 'CUST-4265',
      company: 'EDGE Sync',
      zone: null,
      dutyType: '',
      firstName: 'Aleena',
      lastName: 'Javed',
      primaryEmail: 'aleena.javed@edgesync.com',
      email: 'ops@edgesync.com',
      phoneNumber: '+1555014265',
      officerRate: 0,
      localWorked: 'New York',
      termsAndConditionsVersion: 'v2.4',
      dailySiteSummaryReceivers: [],
      incidentReportReceivers: [],
      customerPortalInvitedEmails: [],
      isGeofencingEnabled: false,
      geofencingEnabled: false,
      allowOfflineSyncing: false,
      isBreakPayable: false,
      hasContractsWithRequireAttention: false,
      // Pin location matches the product Geo-Fencing map (NYC). Empty siteArea
      // surfaces the "Add Info" chip like the live layout screenshot.
      siteLocation: { lat: 40.7128, lng: -74.006 },
      siteArea: [],
      image: [],
      contacts: [],
      supervisors: [],
      data: { supervisors: [] },
      client: {
        name: 'EDGE Sync',
        imageUrl: '',
      },
    },
    {
      id: 2,
      name: 'Downtown Plaza',
      status: 'requires_attention',
      address: '89 Main Ave',
      address2: 'Floor 3',
      country: US_COUNTRY,
      state: NY_STATE,
      city: NYC_CITY,
      countryCode: 'US',
      zipCode: '10036',
      postalCode: '10036',
      noOfOfficers: 2,
      customerId: 'CUST-1002',
      company: 'Downtown Holdings',
      zone: 'Zone B',
      dutyType: 'Hybrid',
      firstName: 'Laura',
      lastName: 'Bennett',
      primaryEmail: 'laura.bennett@downtownholdings.com',
      email: 'facilities@downtownholdings.com',
      phoneNumber: '+15553862210',
      officerRate: 31,
      localWorked: 'Midtown Manhattan',
      termsAndConditionsVersion: 'v2.4',
      dailySiteSummaryReceivers: ['ops@downtownholdings.com'],
      incidentReportReceivers: [
        'security@downtownholdings.com',
        'laura.bennett@downtownholdings.com',
      ],
      customerPortalInvitedEmails: [],
      isGeofencingEnabled: true,
      geofencingEnabled: false,
      allowOfflineSyncing: false,
      isBreakPayable: false,
      hasContractsWithRequireAttention: true,
      siteLocation: { lat: 40.758, lng: -73.9855 },
      siteArea: [
        [
          { lat: 40.759, lng: -73.9875 },
          { lat: 40.759, lng: -73.9835 },
          { lat: 40.757, lng: -73.9835 },
          { lat: 40.757, lng: -73.9875 },
        ],
      ],
      image: [
        {
          url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
        },
      ],
      contacts: [
        {
          id: 1,
          name: 'David Nguyen',
          email: 'david.nguyen@downtownholdings.com',
          contact: '+15553862215',
          role: 'Property Supervisor',
          isEmergencyContact: false,
        },
        {
          id: 2,
          name: 'Priya Shah',
          email: 'priya.shah@downtownholdings.com',
          contact: '+15553862218',
          role: 'Emergency Coordinator',
          isEmergencyContact: true,
        },
      ],
      supervisors: [SUPERVISOR_SARAH, SUPERVISOR_MIKE],
      data: { supervisors: [SUPERVISOR_SARAH, SUPERVISOR_MIKE] },
      client: {
        name: 'Downtown Holdings',
        imageUrl:
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=96&h=96&fit=crop',
      },
    },
    {
      id: 3,
      name: 'Harborview Logistics Hub',
      status: 'functional',
      address: '210 Pier Street',
      address2: 'Building C',
      country: US_COUNTRY,
      state: NY_STATE,
      city: NYC_CITY,
      countryCode: 'US',
      zipCode: '10004',
      postalCode: '10004',
      noOfOfficers: 6,
      customerId: 'CUST-1003',
      company: 'Harborview Logistics',
      zone: 'Zone A',
      dutyType: 'Patrol',
      firstName: 'Robert',
      lastName: 'Hayes',
      primaryEmail: 'robert.hayes@harborviewlogistics.com',
      email: 'security@harborviewlogistics.com',
      phoneNumber: '+15554991000',
      officerRate: 26.75,
      localWorked: 'Lower Manhattan Waterfront',
      termsAndConditionsVersion: 'v2.3',
      dailySiteSummaryReceivers: ['dailysummary@harborviewlogistics.com'],
      incidentReportReceivers: ['incidents@harborviewlogistics.com'],
      customerPortalInvitedEmails: ['client.portal@harborviewlogistics.com'],
      isGeofencingEnabled: true,
      geofencingEnabled: true,
      allowOfflineSyncing: true,
      isBreakPayable: true,
      hasContractsWithRequireAttention: false,
      siteLocation: { lat: 40.7033, lng: -74.016 },
      siteArea: [
        [
          { lat: 40.7043, lng: -74.018 },
          { lat: 40.7043, lng: -74.014 },
          { lat: 40.7023, lng: -74.014 },
          { lat: 40.7023, lng: -74.018 },
        ],
      ],
      image: [
        {
          url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
        },
      ],
      contacts: [
        {
          id: 1,
          name: 'Anita Brooks',
          email: 'anita.brooks@harborviewlogistics.com',
          contact: '+15554991022',
          role: 'Ops Manager',
          isEmergencyContact: true,
        },
      ],
      supervisors: [SUPERVISOR_MIKE],
      data: { supervisors: [SUPERVISOR_MIKE] },
      client: {
        name: 'Harborview Logistics',
        imageUrl:
          'https://images.unsplash.com/photo-1542744173-8e2bd1a46724?w=96&h=96&fit=crop',
      },
    },
  ]),
  users: clone([
    {
      id: 1,
      name: 'Mike Ross',
      email: 'mike@demo.com',
      status: 'active',
      userType: 'Supervisor',
      image: SUPERVISOR_MIKE.image,
    },
    {
      id: 2,
      name: 'Sarah Connor',
      email: 'sarah@demo.com',
      status: 'active',
      userType: 'Officer',
      image: SUPERVISOR_SARAH.image,
    },
  ]),
  vehicles: clone([
    { id: 1, registrationNumber: 'LT-0034', makeModelYear: 'Ford 2020', status: 'active' },
    { id: 2, registrationNumber: 'LT-0047', makeModelYear: 'Toyota 2021', status: 'active' },
  ]),
  zones: clone([
    { id: 1, name: 'Zone A', status: 'functional' },
    { id: 2, name: 'Zone B', status: 'requires_attention' },
  ]),
  sageItems: clone([
    { id: 1, label: 'General Security Services', value: '1' },
    { id: 2, label: 'Patrol Services', value: '2' },
    { id: 3, label: 'Dispatch Services', value: '3' },
  ]),
  holidayGroups: clone([
    { id: 1, name: 'US Federal Holidays' },
    { id: 2, name: 'Custom Holiday Group' },
  ]),
};

export function getStore(name) {
  if (!stores[name]) stores[name] = [];
  return stores[name];
}

export function addToStore(name, item) {
  const store = getStore(name);
  const nextId = store.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
  const record = { ...item, id: item?.id || nextId };
  store.unshift(record);
  return record;
}

export function updateInStore(name, id, updates) {
  const store = getStore(name);
  const index = store.findIndex((row) => String(row.id) === String(id));
  if (index === -1) return null;
  store[index] = { ...store[index], ...updates };
  return store[index];
}

export function removeFromStore(name, id) {
  const store = getStore(name);
  const index = store.findIndex((row) => String(row.id) === String(id));
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}

export function findInStore(name, id) {
  return getStore(name).find((row) => String(row.id) === String(id)) || null;
}
