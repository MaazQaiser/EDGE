import { lazy } from 'react';

import withSuspense from '../../../hoc/withSuspense';
// import userHasRole from '../../utils/auth/userHasRole';
import userHasPermission from '../../../utils/auth/userHasPermission';
// import userHasRoleAndPermission from '../../utils/auth/userHasRoleAndPermission';
import * as routes from '../constant/ROUTE';
import * as SALES from '../constant/SALESMODULE';

const SalesSettings = lazy(() => import('../../common/pages/settings/index'));
const SalesSettingsWithSuspense = withSuspense(SalesSettings);

const SalesWebFaqs = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../public/pages/salesWebFaqs'),
);
const SalesWebFaqsWithSuspense = withSuspense(SalesWebFaqs);

/**
 * Dynamic Component Selection for rendering based on user role
 */
// function getDashboardElement() {
//   let element = null;

//   // if (userHasRoleAndPermission('300', 'view-dashboard')) {
//   //   element = <AdminDashboardWithSuspense />;
//   // } else if (userHasRoleAndPermission('301', 'view-dashboard')) {
//   //   element = <CandidateDashboardWithSuspense />;
//   // } else if (userHasRoleAndPermission('302', 'view-dashboard')) {
//   //   element = <EmployerDashboardWithSuspense />;
//   // }

//   return <h1>sadsadad</h1>;
// }

// Route configurations for the app

const route = [
  {
    // DASHBOARD ROUTE
    path: routes.PROFILE,
    exact: true,
    element: <h1>SETTING</h1>,
    // beforeEnter: (next) => {
    //   if (userHasPermission('view-dashboard')) {
    //     return next();
    //   } else {
    //     return next(routes.PROFILE);
    //   }
    // },
    // meta: {
    //   title: 'Dashboard',
    //   requiresAuth: true,
    // },
  },
  {
    // DASHBOARD ROUTE
    path: routes.COMMON_SETTING,
    exact: true,
    element: <SalesSettingsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(SALES.MODULE_SALES_SETTINGS)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'Users',
      requiresAuth: true,
    },
  },
  {
    // FAQS
    path: routes.SALES_WEB_FAQS,
    exact: true,
    element: <SalesWebFaqsWithSuspense />,
  },
];

export default route;
