import { lazy } from 'react';

// import * as OBX from 'src/app/router/constant/OBXMODULE';
import withSuspense from '../../../hoc/withSuspense';
// import userHasRole from '../../utils/auth/userHasRole';
import userHasPermission from '../../../utils/auth/userHasPermission';
import * as HO from '../constant/HOMODULE';
import * as OBX from '../constant/OBXMODULE';
// import userHasRoleAndPermission from '../../utils/auth/userHasRoleAndPermission';
import * as routes from '../constant/ROUTE';

//Dashboard
const Dashboard = lazy(
  () => import(/* webpackChunkName: "FranchiseDetails" */ '../../homeOffice/pages/dashboard/index'),
);
const DashboardWithSuspense = withSuspense(Dashboard);

//Franchise Listing
const FranchiseListing = lazy(
  () =>
    import(/* webpackChunkName: "FranchiseListing" */ '../../homeOffice/pages/franchise/listing'),
);
const FranchiseListingWithSuspense = withSuspense(FranchiseListing);

//Franchise  detail
const FranchiseDetail = lazy(
  () =>
    import(
      /* webpackChunkName: "FranchiseDetails" */ '../../homeOffice/pages/franchise/detail/index'
    ),
);
const FranchiseDetailWithSuspense = withSuspense(FranchiseDetail);

// Franchise Update
const FranchiseUpdate = lazy(
  () =>
    import(
      /* webpackChunkName: "FranchiseDetails" */ '../../homeOffice/pages/franchise/update/index'
    ),
);
const FranchiseUpdateWithSuspense = withSuspense(FranchiseUpdate);

const Settings = lazy(
  () => import(/* webpackChunkName: "FranchiseDetails" */ '../../homeOffice/pages/settings/index'),
);
const SettingsWithSuspense = withSuspense(Settings);

const TemplateCreate = lazy(
  () =>
    import(
      /* webpackChunkName: "FranchiseDetails" */ '../../homeOffice/pages/settings/templates/create'
    ),
);
const TemplateCreateWithSuspense = withSuspense(TemplateCreate);

const TemplateUpdate = lazy(
  () =>
    import(
      /* webpackChunkName: "FranchiseDetails" */ '../../homeOffice/pages/settings/templates/create'
    ),
);
const _TemplateUpdateWithSuspense = withSuspense(TemplateUpdate);

const TemplatePreview = lazy(
  () =>
    import(
      /* webpackChunkName: "FranchiseDetails" */ '../../homeOffice/pages/settings/templates/preview'
    ),
);
const TemplatePreviewWithSuspense = withSuspense(TemplatePreview);

const Users = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/users/listing/index'),
);
const UsersWithSuspense = withSuspense(Users);

const SignalMap = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../homeOffice/pages/signalMap'),
);
const SignalMapWithSuspense = withSuspense(SignalMap);

// HO Web faqs
const HoWebFaqs = lazy(() => import(/* webpackChunkName: "FAQ" */ '../../public/pages/hoWebFaqs'));
const HoWebFaqsWithSuspense = withSuspense(HoWebFaqs);

// HO Web faqs
const HoCountryConfiguration = lazy(
  () =>
    import(
      /* webpackChunkName: "FAQ" */ '../../homeOffice/pages/settings/countryConfigurations/components/countryForm/index'
    ),
);
const HoCountryConfigurationWithSuspense = withSuspense(HoCountryConfiguration);

// Site Details
const SitesDetail = lazy(
  () => import(/* webpackChunkName: "Sites" */ '../../obx/pages/sites/detail/index'),
);
const SitesDetailWithSuspense = withSuspense(SitesDetail);

// Extra Job
const SchedulesCreateExtraDuty = lazy(
  () =>
    import(
      /* webpackChunkName: "Schedules" */ '../../obx/pages/schedules/createExtraDuty/form/index'
    ),
);
const SchedulesCreateExtraDutyWithSuspense = withSuspense(SchedulesCreateExtraDuty);

//  Payroll
const ObxPayroll = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/payroll/index'),
);
const ObxPayrollsWithSuspense = withSuspense(ObxPayroll);

//  Invoice
const Invoices = lazy(
  () => import(/* webpackChunkName: "Dashboard" */ '../../obx/pages/invoices/index'),
);
const InvoicesWithSuspense = withSuspense(Invoices);
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
    // Faqs
    path: routes.HO_PAYROLL,
    exact: true,
    element: <ObxPayrollsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.MODULE_HO_PAYROLL)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'Payroll',
    },
  },
  {
    // Report detail ROUTE
    path: routes.HO_INVOICES,
    exact: true,
    element: <InvoicesWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.MODULE_HO_INVOICES)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'Invoices',
    },
  },
  {
    // Franchise Dashboard ROUTE
    path: routes.HO_DASHBOARD,
    exact: true,
    element: <DashboardWithSuspense />,
    beforeEnter: (next) =>
      userHasPermission(HO.ACL_HO_DASHBOARD_VIEW) ? next() : next(routes.PROFILE),
  },
  {
    // Franchise Listing ROUTE
    path: routes.HO_FRANCHISE_LISTING,
    exact: true,
    element: <FranchiseListingWithSuspense />,
    beforeEnter: (next) =>
      userHasPermission(HO.ACL_HO_FRANCHISE_LISTING_VIEW) ? next() : next(routes.PROFILE),
  },
  {
    // Franchise Update ROUTE
    path: routes.HO_FRANCHISE_UPDATE_ROUTE,
    exact: true,
    element: <FranchiseUpdateWithSuspense />,
    beforeEnter: (next) =>
      userHasPermission(HO.ACL_HO_UPDATE_FRANCHISE) ? next() : next(routes.PROFILE),
    meta: {
      title: 'Franchise Update',
      requiresAuth: true,
    },
  },
  {
    // Franchise Detail ROUTE
    path: routes.HO_FRANCHISE_DETAIL_ROUTE,
    exact: true,
    element: <FranchiseDetailWithSuspense />,
    beforeEnter: (next) =>
      userHasPermission(HO.ACL_HO_FRANCHISE_DETAIL) ? next() : next(routes.PROFILE),
    meta: {
      title: 'Franchise Detail',
      requiresAuth: true,
    },
  },
  // Site Detail Route
  {
    // Sites ROUTE
    path: routes.HO_SITES_DETAIL_ROUTE,
    exact: true,
    element: <SitesDetailWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.ACL_HO_SITE_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'Sites',
      requiresAuth: true,
    },
  },
  {
    // Settings ROUTE
    path: routes.HO_SETTINGS,
    exact: true,
    element: <SettingsWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.MODULE_HO_SETTINGS)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'Settings',
    },
  },
  {
    // template create ROUTE
    path: routes.HO_TEMPLATE_CREATE,
    exact: true,
    element: <TemplateCreateWithSuspense />,

    meta: {
      title: 'Template Create',
    },
  },
  {
    // template update ROUTE
    path: routes.HO_TEMPLATE_UPDATE_ROUTE,
    exact: true,
    element: <TemplateCreateWithSuspense />,

    meta: {
      title: 'Template update',
    },
  },
  {
    // template preview ROUTE
    path: routes.HO_TEMPLATE_PREVIEW_ROUTE,
    exact: true,
    element: <TemplatePreviewWithSuspense />,

    meta: {
      title: 'Template preview',
    },
  },

  {
    // Country Configuration
    path: routes.HO_COUNTRY_CONFIGURATION_CREATE,
    exact: true,
    element: <HoCountryConfigurationWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.MODULE_HO_COUNTRY_FORM)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'Country Configuration',
    },
  },

  {
    // Country Configuration
    path: routes.HO_COUNTRY_CONFIGURATION_PREVIEW,
    exact: true,
    element: <HoCountryConfigurationWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.MODULE_HO_COUNTRY_FORM)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'Country Configuration',
    },
  },

  {
    // Country Configuration
    path: routes.HO_COUNTRY_CONFIGURATION_UPDATE_ROUTE,
    exact: true,
    element: <HoCountryConfigurationWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.MODULE_HO_COUNTRY_FORM)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
    meta: {
      title: 'Country Configuration',
    },
  },

  {
    // User ROUTE
    path: routes.HO_USER,
    exact: true,
    element: <UsersWithSuspense />,
    beforeEnter: (next) =>
      userHasPermission(OBX.ACL_OBX_USERS_VIEW) ? next() : next(routes.PROFILE),
    meta: {
      title: 'User',
      requiresAuth: true,
    },
  },
  {
    // Franchise Listing ROUTE
    path: routes.HO_VIEW_SIGNAL_MAP,
    exact: true,
    element: <SignalMapWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.ACL_HO_FRANCHISE_MAP_VIEW)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },
  },
  {
    // Sites ROUTE
    path: routes.HO_SITES_CREATE_EXTRA_DUTY,
    exact: true,
    element: <SchedulesCreateExtraDutyWithSuspense />,
    beforeEnter: (next) => {
      if (userHasPermission(HO.MODULE_HO_EXTRA_JOB)) {
        return next();
      } else {
        return next(routes.PROFILE);
      }
    },

    meta: {
      title: 'Sites',
      requiresAuth: true,
    },
  },
  {
    // FAQS
    path: routes.HO_WEB_FAQS,
    exact: true,
    element: <HoWebFaqsWithSuspense />,
  },
];
export default route;
