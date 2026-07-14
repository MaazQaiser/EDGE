import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { mainDomain } from 'src/helper/utilityFunctions';
import { MULTI_TENANT_AUTH } from 'src/utils/constants/multiTanentAuthInfo';

import validateAuthState from '../../../utils/auth/validateAuthState';
import { trackClarityEvent } from '../../../utils/clarityTracking';
import { LOGIN } from '../constant/ROUTE';
// import validateAuthState from '../../utils/auth/validateAuthState';

export default function Page({ route }) {
  const location = useLocation();

  useEffect(() => {
    const brand = MULTI_TENANT_AUTH[mainDomain()]?.name || 'Signal';
    document.title = route?.meta?.title ? `${route.meta.title} - ${brand}` : brand;
  }, [route?.meta?.title]);

  // Track page visit as custom event with specific page names
  useEffect(() => {
    // Get page path and name
    const pagePath = location.pathname;
    const pageName = route?.meta?.title || pagePath;
    const pathParts = pagePath.split('/').filter(Boolean);

    // Map paths to specific event names - using exact paths from project
    const getEventName = (path) => {
      const lowerPath = path.toLowerCase();

      // Detail pages mapping - using exact paths from ROUTE.jsx
      if (lowerPath.includes('sitesdetail')) {
        return 'sites_detail';
      }
      if (lowerPath.includes('userdetails')) {
        return 'users_detail';
      }
      if (lowerPath.includes('vehicledetail')) {
        return 'vehicles_detail';
      }
      if (lowerPath.includes('zonesdetail')) {
        return 'zones_detail';
      }
      if (lowerPath.includes('dispatch/details')) {
        return 'dispatch_detail';
      }
      if (lowerPath.includes('runsheet/details')) {
        return 'run_sheet_detail';
      }
      if (lowerPath.includes('leaverequests/detail')) {
        return 'time_off_requests_detail';
      }
      // HO_FRANCHISE_DETAIL_ROUTE = /app/ho/franchises/franchiseDetail/:id
      if (lowerPath.includes('franchisedetail')) {
        return 'franchise_detail';
      }
      // SALES_COMPANY_DETAIL = /app/sales/companies/company/:id
      if (lowerPath.includes('companies/company/')) {
        return 'companies_detail';
      }
      // SALES_LOCATION_DETAIL = /app/sales/locations/location/:id
      if (lowerPath.includes('locations/location/')) {
        return 'locations_detail';
      }
      // SALES_DEAL_DETAIL = /app/sales/deals/deal/:id
      if (lowerPath.includes('deals/deal/')) {
        return 'deals_detail';
      }
      // SALES_USER_DETAIL_ROUTE = /app/sales/users/detail/:id
      if (lowerPath.includes('sales/users/detail/')) {
        return 'users_detail';
      }

      // Listing pages mapping
      if (
        lowerPath.includes('/sites') &&
        !lowerPath.includes('detail') &&
        !lowerPath.includes('create') &&
        !lowerPath.includes('update')
      ) {
        return 'sites';
      }
      if (
        lowerPath.includes('/users') &&
        !lowerPath.includes('detail') &&
        !lowerPath.includes('create') &&
        !lowerPath.includes('update')
      ) {
        return 'users';
      }
      if (
        lowerPath.includes('/vehicles') &&
        !lowerPath.includes('detail') &&
        !lowerPath.includes('create') &&
        !lowerPath.includes('update')
      ) {
        return 'vehicles';
      }
      if (
        lowerPath.includes('/zones') &&
        !lowerPath.includes('detail') &&
        !lowerPath.includes('create') &&
        !lowerPath.includes('update')
      ) {
        return 'zones';
      }
      if (
        lowerPath.includes('/schedules') &&
        !lowerPath.includes('detail') &&
        !lowerPath.includes('create') &&
        !lowerPath.includes('update')
      ) {
        return 'schedule';
      }
      if (lowerPath.includes('/shift') && !lowerPath.includes('detail')) {
        return 'shift';
      }
      if (
        lowerPath.includes('/dispatch') &&
        !lowerPath.includes('detail') &&
        !lowerPath.includes('create')
      ) {
        return 'dispatch';
      }
      if (
        lowerPath.includes('/runsheet') &&
        !lowerPath.includes('detail') &&
        !lowerPath.includes('create') &&
        !lowerPath.includes('edit')
      ) {
        return 'run_sheet';
      }
      if (lowerPath.includes('/invoices') || lowerPath.includes('/invoice')) {
        return 'invoices';
      }
      if (lowerPath.includes('/attendance') || lowerPath.includes('/leaverequests')) {
        return 'time_off_requests';
      }
      if (lowerPath.includes('/settings') || lowerPath.includes('/account-setting')) {
        return 'settings';
      }
      if (lowerPath.includes('/payroll')) {
        return 'payroll';
      }
      if (lowerPath.includes('/reports')) {
        return 'reports';
      }
      if (lowerPath.includes('/dashboard')) {
        return 'dashboard';
      }
      if (lowerPath.includes('/notifications')) {
        return 'notifications';
      }
      if (lowerPath.includes('/profile')) {
        return 'profile';
      }
      if (lowerPath.includes('/franchisemap') || lowerPath.includes('/franchise-map')) {
        return 'franchise_map';
      }
      if (lowerPath.includes('/franchises') && !lowerPath.includes('detail')) {
        return 'franchises';
      }
      if (lowerPath.includes('/companies') && !lowerPath.includes('detail')) {
        return 'companies';
      }
      if (lowerPath.includes('/locations') && !lowerPath.includes('detail')) {
        return 'locations';
      }
      if (lowerPath.includes('/deals') && !lowerPath.includes('detail')) {
        return 'deals';
      }
      if (lowerPath.includes('/analytics')) {
        return 'analytics';
      }
      if (lowerPath.includes('/leaderboard')) {
        return 'leaderboard';
      }
      if (lowerPath.includes('/devices')) {
        return 'devices';
      }

      // Default fallback
      return null;
    };

    const eventName = getEventName(pagePath);

    // Only track if we have a specific event name
    if (!eventName) {
      return;
    }

    // Extract ID from detail pages
    const isDetailPage = eventName.includes('_detail');
    const detailId = isDetailPage ? pathParts[pathParts.length - 1] : null;

    // Extract query parameters
    const urlParams = new URLSearchParams(location.search);
    const queryParams = {};
    urlParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    // Track with specific page event name
    trackClarityEvent(eventName, {
      path: pagePath,
      pageName: pageName,
      route: route?.path || pagePath,
      detailId: detailId,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
  }, [location.pathname, location.search, route]);

  if (route?.meta?.requiresAuth && !validateAuthState()) {
    // Redirect the user to login screen if no valid access token available
    return <Redirect to={{ pathname: LOGIN, state: { location } }} />;
  }

  // Call the guard function with the `next` function as the callback
  if (route?.beforeEnter && typeof route.beforeEnter === 'function') {
    return route.beforeEnter(next);
  } else {
    return next();
  }

  // Define the `next` function to be called by the guard function after validating the access conditions
  function next(newRoute) {
    if (newRoute && (typeof newRoute === 'string' || typeof newRoute === 'object')) {
      return <Redirect to={newRoute} />;
    }

    return route?.element;
  }
}

Page.propTypes = {
  route: PropTypes.object,
};
