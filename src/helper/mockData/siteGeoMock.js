/**
 * Mock geo payload for POST /geolocations (site detail view + site update form).
 * Franchise polygon encompasses demo sites in lower/mid Manhattan.
 */

const FRANCHISE_AREA = [
  [
    { lat: 40.695, lng: -74.025 },
    { lat: 40.695, lng: -73.97 },
    { lat: 40.78, lng: -73.97 },
    { lat: 40.78, lng: -74.025 },
  ],
];

const FRANCHISE_LOCATION = { lat: 40.73, lng: -74.0 };

function siteGeoSummary(site) {
  if (!site) return null;
  return {
    id: site.id,
    name: site.name,
    siteLocation: site.siteLocation,
    coordinates: site.siteArea,
    siteArea: site.siteArea,
  };
}

/**
 * Build a geolocation response shaped for `findParentAndSiblingsPolygon`.
 * @param {{ id?: string|number }} body - request body from getGeoLocation
 * @param {Array} sites - mock site store
 * @param {Array} zones - mock zone store
 */
export function buildSiteGeoLocationResponse(body = {}, sites = [], zones = []) {
  const requestedId = body?.id;
  const activeSite =
    sites.find((site) => String(site.id) === String(requestedId)) || sites[0] || null;

  const zoneName = activeSite?.zone;
  const parentZone =
    zones.find((zone) => zone.name === zoneName) ||
    zones[0] ||
    { id: 1, name: 'Zone A', status: 'functional' };

  const zoneAreasById = {
    1: [
      [
        { lat: 40.698, lng: -74.022 },
        { lat: 40.698, lng: -73.99 },
        { lat: 40.735, lng: -73.99 },
        { lat: 40.735, lng: -74.022 },
      ],
    ],
    2: [
      [
        { lat: 40.74, lng: -74.01 },
        { lat: 40.74, lng: -73.975 },
        { lat: 40.77, lng: -73.975 },
        { lat: 40.77, lng: -74.01 },
      ],
    ],
  };

  const mappedZones = zones.map((zone) => ({
    id: zone.id,
    name: zone.name,
    status: zone.status,
    coordinates: zoneAreasById[zone.id] || zoneAreasById[1],
    zoneArea: zoneAreasById[zone.id] || zoneAreasById[1],
  }));

  return {
    parentId: parentZone.id,
    franchises: [
      {
        id: 1,
        franchiseName: 'Filter Go Demo Franchise',
        franchiseLocation: FRANCHISE_LOCATION,
        // Update form gates the map on parent.coordinates
        coordinates: FRANCHISE_AREA,
        franchiseArea: FRANCHISE_AREA,
      },
    ],
    zones: mappedZones,
    sites: sites.map(siteGeoSummary).filter(Boolean),
  };
}

/**
 * Address hierarchy for the site update form (`fetchConfigList` → `/configs`).
 * IDs must align with country/state/city objects on mock site records.
 */
export function getAddressConfigsMock() {
  return {
    countries: [
      {
        id: 1,
        name: 'United States',
        countryCode: 'US',
        states: [
          {
            id: 33,
            name: 'New York',
            countryId: 1,
            cities: [
              { id: 512, name: 'New York' },
              { id: 513, name: 'Brooklyn' },
              { id: 514, name: 'Queens' },
            ],
          },
          {
            id: 34,
            name: 'New Jersey',
            countryId: 1,
            cities: [
              { id: 612, name: 'Jersey City' },
              { id: 613, name: 'Newark' },
            ],
          },
        ],
      },
    ],
  };
}
