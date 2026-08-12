import { useCallback, useRef } from 'react';
import { getSitesAllLocations } from 'src/services/sites.services';

export const useSiteLocations = () => {
  const siteLocationsCacheRef = useRef(new Map());
  const siteLocationsRequestRef = useRef(new Map());

  const fetchSiteLocationsByIds = useCallback(async (siteIds = []) => {
    const normalizedSiteIds = [...new Set(siteIds.map((siteId) => String(siteId)).filter(Boolean))];
    if (!normalizedSiteIds.length) return {};

    const fetchedLocationsBySiteId = {};

    await Promise.all(
      normalizedSiteIds.map(async (siteId) => {
        if (siteLocationsCacheRef.current.has(siteId)) {
          fetchedLocationsBySiteId[siteId] = siteLocationsCacheRef.current.get(siteId);
          return;
        }

        if (siteLocationsRequestRef.current.has(siteId)) {
          fetchedLocationsBySiteId[siteId] = await siteLocationsRequestRef.current.get(siteId);
          return;
        }

        const request = getSitesAllLocations(siteId)
          .then((response) => response?.data?.locations || [])
          .catch(() => [])
          .finally(() => {
            siteLocationsRequestRef.current.delete(siteId);
          });

        siteLocationsRequestRef.current.set(siteId, request);
        const locations = await request;
        siteLocationsCacheRef.current.set(siteId, locations);
        fetchedLocationsBySiteId[siteId] = locations;
      }),
    );

    return fetchedLocationsBySiteId;
  }, []);

  return { fetchSiteLocationsByIds };
};
