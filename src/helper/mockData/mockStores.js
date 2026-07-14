const clone = (value) => JSON.parse(JSON.stringify(value));

const stores = {
  sites: clone([
    {
      id: 1,
      name: 'Lorem Site',
      status: 'functional',
      address: '123 Demo Street',
      noOfOfficers: 4,
    },
    {
      id: 2,
      name: 'Downtown Plaza',
      status: 'requires_attention',
      address: '89 Main Ave',
      noOfOfficers: 2,
    },
  ]),
  users: clone([
    { id: 1, name: 'Mike Ross', email: 'mike@demo.com', status: 'active', userType: 'Supervisor' },
    { id: 2, name: 'Sarah Connor', email: 'sarah@demo.com', status: 'active', userType: 'Officer' },
  ]),
  vehicles: clone([
    { id: 1, registrationNumber: 'LT-0034', makeModelYear: 'Ford 2020', status: 'active' },
    { id: 2, registrationNumber: 'LT-0047', makeModelYear: 'Toyota 2021', status: 'active' },
  ]),
  zones: clone([
    { id: 1, name: 'Zone A', status: 'functional' },
    { id: 2, name: 'Zone B', status: 'requires_attention' },
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
