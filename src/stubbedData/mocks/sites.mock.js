const sites = [
  {
    id: 1,
    name: 'Northgate Corporate Center',
    status: 'functional',
    zone: 'Zone A',
    phoneNumber: '+15552147788',
    company: 'Northgate Properties',
    customerId: 'CUST-1001',
    noOfOfficers: 4,
    monthlyRevenue: '$12,400',
    // Location + address. Coordinates sit inside the demo franchise polygon so
    // the interactive map renders the site pin/area, and the read-only location
    // card has values to show.
    address: '450 Lexington Ave',
    address2: 'Suite 1200',
    zipCode: '10017',
    postalCode: '10017',
    country: { id: 1, name: 'United States', countryCode: 'US' },
    state: { id: 33, name: 'New York', countryId: 1 },
    city: { id: 512, name: 'New York' },
    siteLocation: { lat: 40.745, lng: -73.995 },
    siteArea: [
      [
        { lat: 40.743, lng: -73.997 },
        { lat: 40.743, lng: -73.993 },
        { lat: 40.747, lng: -73.993 },
        { lat: 40.747, lng: -73.997 },
      ],
    ],
    supervisors: [
      {
        id: 1,
        name: 'Mike Ross',
        imageUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face',
      },
    ],
    client: {
      name: 'Northgate Properties',
      imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=96&h=96&fit=crop',
    },
  },
  {
    id: 2,
    name: 'Downtown Plaza',
    status: 'requires_attention',
    zone: 'Zone B',
    phoneNumber: '+15553862210',
    company: 'Downtown Holdings',
    customerId: 'CUST-1002',
    noOfOfficers: 2,
    monthlyRevenue: '$9,800',
    address: '88 Greenwich St',
    address2: 'Floor 3',
    zipCode: '10006',
    postalCode: '10006',
    country: { id: 1, name: 'United States', countryCode: 'US' },
    state: { id: 33, name: 'New York', countryId: 1 },
    city: { id: 513, name: 'Brooklyn' },
    siteLocation: { lat: 40.715, lng: -74.005 },
    siteArea: [
      [
        { lat: 40.713, lng: -74.007 },
        { lat: 40.713, lng: -74.003 },
        { lat: 40.717, lng: -74.003 },
        { lat: 40.717, lng: -74.007 },
      ],
    ],
    supervisors: [
      {
        id: 2,
        name: 'Sarah Connor',
        imageUrl:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face',
      },
    ],
    client: {
      name: 'Downtown Holdings',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=96&h=96&fit=crop',
    },
  },
];

// eslint-disable-next-line no-undef
module.exports = sites;
