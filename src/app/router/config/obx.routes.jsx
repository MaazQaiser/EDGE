import { lazy } from 'react';

// import store from 'src/redux/store';
import withSuspense from '../../../hoc/withSuspense';
// import userHasRole from '../../utils/auth/userHasRole';
import userHasPermission from '../../../utils/auth/userHasPermission';
import * as OBX from '../constant/OBXMODULE';
// import userHasRoleAndPermission from '../../utils/auth/userHasRoleAndPermission';
// import OBX & ROUTES
import * as routes from '../constant/ROUTE';

//  Dashboard
const Dashboard = lazy(
  () => import(/* webpackChunkName: "Dashboard" */ '../../obx/pages/dashboard/index'),
);
const DashboardWithSuspense = withSuspense(Dashboard);

//  Dashboard
const Invoices = lazy(
  () => import(/* webpackChunkName: "Dashboard" */ '../../obx/pages/invoices/index'),
);
const InvoicesWithSuspense = withSuspense(Invoices);

//  Franchise Detail
const FranchiseMap = lazy(
  () => import(/* webpackChunkName: "FranchiseDetail" */ '../../obx/pages/franchiseMap/index'),
);
const FranchiseMapWithSuspense = withSuspense(FranchiseMap);

//  Zones Module
const Zones = lazy(
  () => import(/* webpackChunkName: "Zones" */ '../../obx/pages/zones/listing/index'),
);
const ZonesWithSuspense = withSuspense(Zones);

const ZonesDetail = lazy(
  () => import(/* webpackChunkName: "Zones" */ '../../obx/pages/zones/detail/index'),
);
const ZonesDetailWithSuspense = withSuspense(ZonesDetail);

//  Sites Module
const Sites = lazy(
  () => import(/* webpackChunkName: "Sites" */ '../../obx/pages/sites/listing/index'),
);
const SitesWithSuspense = withSuspense(Sites);

const SitesDetail = lazy(
  () => import(/* webpackChunkName: "Sites" */ '../../obx/pages/sites/detail/index'),
);
const SitesDetailWithSuspense = withSuspense(SitesDetail);

const SitesUpdate = lazy(
  () => import(/* webpackChunkName: "Sites" */ '../../obx/pages/sites/update/index'),
);
const _SitesUpdateWithSuspense = withSuspense(SitesUpdate);

//  Schedules Module
const Schedules = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/schedules/index'),
);
const SchedulesWithSuspense = withSuspense(Schedules);

const SchedulesCreateExtraDuty = lazy(
  () =>
    import(
      /* webpackChunkName: "Schedules" */ '../../obx/pages/schedules/createExtraDuty/form/index'
    ),
);
const SchedulesCreateExtraDutyWithSuspense = withSuspense(SchedulesCreateExtraDuty);

//  Run Sheet Module
const RunSheet = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/runSheets/listing/index'),
);
const RunSheetWithSuspense = withSuspense(RunSheet);

//  Run Sheet Module
const RunSheetDetail = lazy(
  () =>
    import(
      /* webpackChunkName: "Schedules" */ '../../obx/pages/runSheets/runSheetDetailPage/index'
    ),
);
const RunSheetDetailsWithSuspense = withSuspense(RunSheetDetail);
const RunSheetSplitPage = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/runSheets/details/index'),
);
const RunSheetSplitPageWithSuspense = withSuspense(RunSheetSplitPage);

//  Run Sheet Module asssign hits
const AssignHits = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/runSheets/assignHits/index'),
);
const AssignHitsWithSuspense = withSuspense(AssignHits);

//  Run Sheet Module build route — club visits into one day
const BuildRoute = lazy(
  () => import(/* webpackChunkName: "Runsheets" */ '../../obx/pages/runSheets/buildRoute/index'),
);
const BuildRouteWithSuspense = withSuspense(BuildRoute);

//  Run Sheet Module route optimization — propose, diff, accept
const OptimizeRoute = lazy(
  () => import(/* webpackChunkName: "Runsheets" */ '../../obx/pages/runSheets/optimizeRoute/index'),
);
const OptimizeRouteWithSuspense = withSuspense(OptimizeRoute);

//  Run Sheet Module
const RunsheetCreate = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/runSheets/details/index'),
);
const RunsheetCreateWithSuspense = withSuspense(RunsheetCreate);

//  Edit Run Sheet Module
const EditRunsheet = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/runSheets/editRunsheet/index'),
);
const EditRunsheetWithSuspense = withSuspense(EditRunsheet);

//  Dispatch Sheet Module
const Dispatch = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/dispatch/lisitng/index'),
);
const DispatchWithSuspense = withSuspense(Dispatch);

//  Dispatch Sheet Details
const DispatchDetails = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/dispatch/details/index'),
);
const DispatchDetailsWithSuspense = withSuspense(DispatchDetails);

//  Dispatch Sheet Details
const DispatchAssign = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/dispatch/assignDispatch/index'),
);
const DispatchAssignWithSuspense = withSuspense(DispatchAssign);

// //  Dispatch Runsheet
// const DispatchRunsheet = lazy(
//   () =>
//     import(/* webpackChunkName: "Schedules" */ '../../obx/pages/dispatch/dispatchRunsheet/index'),
// );
// const DispatchRunsheetWithSuspense = withSuspense(DispatchRunsheet);

//  create Dispatch
const CreateDispatch = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/dispatch/createDispatch/index'),
);
const CreateDispatchtWithSuspense = withSuspense(CreateDispatch);

// //   Dispatch Assign Officer
// const DispatchAssignOfficer = lazy(
//   () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/dispatch/assignOfficer/index'),
// );
// const DispatchAssignOfficertWithSuspense = withSuspense(DispatchAssignOfficer);

//  Reports Module
const Reports = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/reports/listing/index'),
);
const ReportsWithSuspense = withSuspense(Reports);

const ReportDetails = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/reports/details/index'),
);
const ReportDetailsWithSuspense = withSuspense(ReportDetails);

//  User Module
const Users = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/users/listing/index'),
);
const UsersWithSuspense = withSuspense(Users);

//  User Detail Module
const UsersDetail = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/users/detail/index'),
);
const UsersDetailWithSuspense = withSuspense(UsersDetail);

//  ANALYTICS Module
const Analytics = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/analytics/index'),
);
const AnalyticsWithSuspense = withSuspense(Analytics);

//  LeaderBoard Module
const LeaderBoard = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/leaderBoard/listings/index'),
);
const LeaderBoardWithSuspense = withSuspense(LeaderBoard);

//  LeaderBoard Module
// const Devices = lazy(
//   () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/devices/listing/index'),
// );
// const DevicesWithSuspense = withSuspense(Devices);

const Vehicles = lazy(
  () =>
    import(/* webpackChunkName: "SuperAdminDashboard" */ '../../obx/pages/vehicles/listing/index'),
);
const VehiclesWithSuspense = withSuspense(Vehicles);

const VehicleDetail = lazy(
  () =>
    import(/* webpackChunkName: "SuperAdminDashboard" */ '../../obx/pages/vehicles/detail/index'),
);
const VehicleDetailWithSuspense = withSuspense(VehicleDetail);

const VehicleForm = lazy(
  () => import(/* webpackChunkName: "SuperAdminDashboard" */ '../../obx/pages/vehicles/form/index'),
);
const VehicleFormWithSuspense = withSuspense(VehicleForm);

const OBXSetting = lazy(
  () => import(/* webpackChunkName: "SuperAdminDashboard" */ '../../common/pages/settings/index'),
);
const OBXSettingWithSuspense = withSuspense(OBXSetting);

const DesignSystem = lazy(
  () => import(/* webpackChunkName: "DesignSystem" */ '../../common/pages/designSystem/index'),
);
const DesignSystemWithSuspense = withSuspense(DesignSystem);

const OBXNewUserGroup = lazy(
  () =>
    import(
      /* webpackChunkName: "SuperAdminDashboard" */ '../../common/pages/settings/userGroups/components/addNewUserGroup/index'
    ),
);
const OBXNewUserGroupWithSuspense = withSuspense(OBXNewUserGroup);

/**
 *  Zone Detail Page
 */
const ZoneDetail = lazy(
  () => import(/* webpackChunkName: "ZoneDetails" */ '../../obx/pages/zones/form/index'),
);
const ZoneDetailWithSuspense = withSuspense(ZoneDetail);

const siteUpdate = lazy(
  () => import(/* webpackChunkName: "Site Update" */ '../../obx/pages/sites/update/index'),
);
const SiteUpdateWithSuspense = withSuspense(siteUpdate);

const Attendances = lazy(
  () =>
    import(
      /* webpackChunkName: "SuperAdminDashboard" */ '../../obx/pages/attendance/listing/index'
    ),
);
const AttendanceWithSuspense = withSuspense(Attendances);

const AttendanceDetail = lazy(
  () =>
    import(/* webpackChunkName: "SuperAdminDashboard" */ '../../obx/pages/attendance/detail/index'),
);
const AttendanceDetailWithSuspense = withSuspense(AttendanceDetail);

const Profile = lazy(
  () => import(/* webpackChunkName: "SuperAdminDashboard" */ '../../obx/pages/profile/index'),
);

const ProfileWithSuspense = withSuspense(Profile);

const Notifications = lazy(
  () => import(/* webpackChunkName: "Notifications" */ '../../obx/pages/notifications/index'),
);

const NotificationsWithSuspense = withSuspense(Notifications);

const NotificationRelease = lazy(
  () => import(/* webpackChunkName: "Notifications" */ '../../obx/pages/notificationRelease/index'),
);

const NotificationReleaseWithSuspense = withSuspense(NotificationRelease);

const ObxWebFaqs = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../public/pages/salesWebFaqs'),
);
const ObxWebFaqsWithSuspense = withSuspense(ObxWebFaqs);

const ObxPayroll = lazy(
  () => import(/* webpackChunkName: "Schedules" */ '../../obx/pages/payroll/index'),
);
const ObxPayrollsWithSuspense = withSuspense(ObxPayroll);

const Create = lazy(
  () => import(/* webpackChunkName: "Create" */ '../../obx/components/create/index'),
);
const CreateWithSuspense = withSuspense(Create);

const Release = lazy(
  () => import(/* webpackChunkName: "Release" */ '../../obx/pages/releaseInfo/index'),
);
const ReleaseWithSuspense = withSuspense(Release);

const ReleaseConfigure = lazy(
  () =>
    import(
      /* webpackChunkName: "ReleaseConfigure" */ '../../obx/pages/releaseInfo/roadmap/configure/index'
    ),
);
const ReleaseConfigureWithSuspense = withSuspense(ReleaseConfigure);

const ReleaseNotesDetails = lazy(
  () =>
    import(
      /* webpackChunkName: "ReleaseNotesDetails" */ '../../obx/pages/releaseInfo/releaseNotes/releaseNotesDetails/index'
    ),
);
const ReleaseNotesDetailsWithSuspense = withSuspense(ReleaseNotesDetails);

const AddRelease = lazy(
  () =>
    import(
      /* webpackChunkName: "AddRelease" */ '../../obx/pages/releaseInfo/releaseNotes/addRelease/index'
    ),
);
const AddReleaseWithSuspense = withSuspense(AddRelease);

const ObxCreateSite = lazy(
  () =>
    import(
      /* webpackChunkName: "Schedules" */ '../../obx/pages/sites/listing/component/createSite/index'
    ),
);
const ObxCreateSitesWithSuspense = withSuspense(ObxCreateSite);

const ObxTourReport = lazy(
  () =>
    import(/* webpackChunkName: "Schedules" */ '../../components/common/tourReportAccordion/index'),
);
const ObxTourReportsWithSuspense = withSuspense(ObxTourReport);

const ObxTourReportDispatch = lazy(
  () =>
    import(
      /* webpackChunkName: "Schedules" */ '../../components/common/tourReportAccordion/tourReportSubmitDispatch/index'
    ),
);
const ObxTourReportsDispatchWithSuspense = withSuspense(ObxTourReportDispatch);

const ObxUserBasicInformation = lazy(
  () =>
    import(
      /* webpackChunkName: "Schedules" */ '../../obx/pages/users/components/basicInformationForm/index'
    ),
);
const ObxUserBasicInformationsWithSuspense = withSuspense(ObxUserBasicInformation);

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

const route = (franchiseId) => {
  return [
    {
      // Site Update ROUTE
      path: routes.OBX_ZONE_SITE_CREATE,
      exact: true,
      element: <SiteUpdateWithSuspense />,
      beforeEnter: (next) => {
        if (userHasPermission(OBX.MODULE_OBX_ZONE_SITE_CREATE)) {
          return next();
        } else {
          return next(routes.PROFILE);
        }
      },
      meta: {
        title: 'Zone Site Update',
        requiresAuth: true,
      },
    },
    {
      // Site Update ROUTE
      path: routes.OBX_ZONE_SITE_UPDATE,
      exact: true,
      element: <SiteUpdateWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_SITE_UPDATE) ? next() : next(routes.PROFILE),
      meta: {
        title: 'Zone Site Update',
        requiresAuth: true,
      },
    },

    {
      // Zone Update ROUTE
      path: routes.OBX_FRANCHISE_ZONE_UPDATE,
      exact: true,
      element: <ZoneDetailWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_ZONES_UPDATE) && franchiseId ? next() : next(routes.PROFILE),
      meta: {
        title: 'Franchise Zone Update',
        requiresAuth: true,
      },
    },
    {
      // Zone Update ROUTE
      path: routes.OBX_FRANCHISE_ZONE_CREATE,
      exact: true,
      element: <ZoneDetailWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_ZONES_CREATE) && franchiseId ? next() : next(routes.PROFILE),
      meta: {
        title: 'Franchise Zone Creation',
        requiresAuth: true,
      },
    },
    {
      // DASHBOARD ROUTE
      path: routes.OBX_DASHBOARD,
      exact: true,
      element: <DashboardWithSuspense />,
      // beforeEnter: (next) => {
      //   if (userHasPermission(OBX.ACL_OBX_DASHBOARD_VIEW)) {
      //     return next();
      //   } else {
      //     return next(routes.PROFILE);
      //   }
      // },
      meta: {
        title: 'Dashboard',
        requiresAuth: false,
      },
    },
    {
      // Location Tracker ROUTE
      path: routes.OBX_FRANCHISE_MAP,
      exact: true,
      element: <FranchiseMapWithSuspense />,
      beforeEnter: (next) => {
        if (userHasPermission(OBX.ACL_OBX_FRANCHISE_MAP_VIEW)) {
          return next();
        } else {
          return next(routes.PROFILE);
        }
      },
      meta: {
        title: 'Location Tracker',
        requiresAuth: true,
      },
    },
    {
      // Sites ROUTE
      path: routes.OBX_SITES,
      exact: true,
      element: <SitesWithSuspense />,
      beforeEnter: (next) => {
        if (userHasPermission(OBX.ACL_OBX_SITES_VIEW) && franchiseId) {
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
      // Sites ROUTE
      path: routes.OBX_SITES_DETAIL_ROUTE,
      exact: true,
      element: <SitesDetailWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_SITES_VIEW) ? next() : next(routes.PROFILE),
      meta: {
        title: 'Sites',
        requiresAuth: true,
      },
    },

    {
      // Schedules ROUTE
      path: routes.OBX_SCHEDULES,
      exact: true,
      element: <SchedulesWithSuspense />,
      beforeEnter: (next) => {
        if (userHasPermission(OBX.ACL_OBX_SCHEDULES_VIEW) && franchiseId) {
          return next();
        } else {
          return next(routes.PROFILE);
        }
      },
      meta: {
        title: 'Schedules',
        requiresAuth: true,
      },
    },
    {
      // Schedules Create extra duty path
      path: [
        routes.OBX_SCHEDULES_CREATE_EXTRA_DUTY,
        routes.OBX_SITES_CREATE_EXTRA_DUTY,
        routes.OBX_USERS_CREATE_EXTRA_DUTY,
      ],
      exact: true,
      element: <SchedulesCreateExtraDutyWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_SITE_EXTRA_JOB_CREATE) && franchiseId
          ? next()
          : next(routes.PROFILE),
      meta: {
        title: 'Schedules',
        requiresAuth: true,
      },
    },

    {
      // RunSheet ROUTE
      path: routes.OBX_RUNSHEET,
      exact: true,
      element: <RunSheetWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_RUNSHEET_VIEW) && franchiseId ? next() : next(routes.PROFILE),
      meta: {
        title: 'Runsheets',
        requiresAuth: true,
      },
    },
    {
      // RunSheet ROUTE
      path: routes.OBX_RUNSHEET_CREATE,
      exact: true,
      element: <RunsheetCreateWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_RUNSHEET_CREATE) && franchiseId
          ? next()
          : next(routes.PROFILE),
      meta: {
        title: 'Runsheets',
        requiresAuth: true,
      },
    },
    {
      path: routes.OBX_EDIT_RUNSHEET,
      exact: true,
      element: <EditRunsheetWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_RUNSHEET_UPDATE) && franchiseId
          ? next()
          : next(routes.PROFILE),
      meta: {
        title: 'Edit Runsheet',
        requiresAuth: true,
      },
    },
    {
      // Dispatch ROUTE
      path: routes.OBX_DISPATCH,
      exact: true,
      element: <DispatchWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_DISPATCH_VIEW) ? next() : next(routes.PROFILE),
      meta: {
        title: 'Dispatch',
        requiresAuth: true,
      },
    },
    {
      // Dispatch Details ROUTE
      path: routes.OBX_DISPATCH_DETAILS_ROUTE,
      exact: true,
      element: <DispatchDetailsWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_DISPATCH_VIEW) ? next() : next(routes.PROFILE),
      meta: {
        title: 'Dispatch',
        requiresAuth: true,
      },
    },

    {
      // Dispatch Assign ROUTE
      path: routes.OBX_DISPATCH_ASSIGN_ROUTE,
      exact: true,
      element: <DispatchAssignWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_DISPATCH_VIEW) ? next() : next(routes.PROFILE),
      meta: {
        title: 'Dispatch',
        requiresAuth: true,
      },
    },
    // {
    //   // Dispatch Runsheet
    //   path: routes.OBX_DISPATCH_RUNSHEET,
    //   exact: true,
    //   element: <DispatchRunsheetWithSuspense />,
    //   beforeEnter: (next) => {
    //     if (userHasPermission(OBX.MODULE_OBX_DISPATCH_RUNSHEET)) {
    //       return next();
    //     } else {
    //       return next(routes.PROFILE);
    //     }
    //   },
    //   meta: {
    //     title: 'Dispatch',
    //     requiresAuth: true,
    //   },
    // },
    {
      // create Dispatch
      path: routes.OBX_CREATE_DISPATCH,
      exact: true,
      element: <CreateDispatchtWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_DISPATCH_CREATE) ? next() : next(routes.PROFILE),
      meta: {
        title: 'Dispatch',
        requiresAuth: true,
      },
    },

    // {
    //   //  Dispatch assign Officer
    //   path: routes.OBX_DISPATCH_ASSIGN_OFFICER,
    //   exact: true,
    //   element: <DispatchAssignOfficertWithSuspense />,
    //   beforeEnter: (next) => {
    //     if (userHasPermission(OBX.MODULE_OBX_DISPATCH_ASSIGN_OFFICER)) {
    //       return next();
    //     } else {
    //       return next(routes.PROFILE);
    //     }
    //   },
    //   meta: {
    //     title: 'Dispatch',
    //     requiresAuth: true,
    //   },
    // },

    {
      // User ROUTE
      path: routes.OBX_USER,
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
      // User ROUTE
      path: routes.OBX_USER_DETAIL_ROUTE,
      exact: true,
      element: <UsersDetailWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_USERS_VIEW) ? next() : next(routes.PROFILE),
      meta: {
        title: 'User',
        requiresAuth: true,
      },
    },

    {
      // ANALYTICS ROUTE
      path: routes.OBX_ANALYTICS,
      exact: true,
      element: <AnalyticsWithSuspense />,
      beforeEnter: (next) => {
        if (userHasPermission(OBX.ACL_OBX_ANALYTICS_VIEW) && franchiseId) {
          return next();
        } else {
          return next(routes.PROFILE);
        }
      },
      meta: {
        title: 'User',
        requiresAuth: true,
      },
    },

    {
      // create site
      path: routes.OBX_TOURE_REPORT_DISPATCH,
      exact: true,
      element: <ObxTourReportsDispatchWithSuspense />,
      meta: {
        title: 'Dispatch Report',
        requiresAuth: true,
      },
    },

    {
      // RunSheet ROUTE
      path: routes.OBX_REPORTS,
      exact: true,
      element: <ReportsWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_SHIFT_REPORTS_VIEW) && franchiseId
          ? next()
          : next(routes.PROFILE),
      meta: {
        title: 'Shift Reports',
        requiresAuth: true,
      },
    },

    {
      // Report detail ROUTE
      path: routes.OBX_REPORTS_DETAILS,
      exact: true,
      element: <ReportDetailsWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_SHIFT_REPORTS_VIEW) && franchiseId
          ? next()
          : next(routes.PROFILE),
      meta: {
        title: 'Details',
        requiresAuth: true,
      },
    },

    {
      // LeaderBoard ROUTE
      path: routes.OBX_LEADERBOARD,
      exact: true,
      element: <LeaderBoardWithSuspense />,
      beforeEnter: (next) => {
        if (userHasPermission(OBX.ACL_OBX_LEADERBOARD_VIEW) && franchiseId) {
          return next();
        } else {
          return next(routes.PROFILE);
        }
      },
      meta: {
        title: 'Schedules',
        requiresAuth: true,
      },
    },

    // {
    //   // Devices ROUTE
    //   path: routes.OBX_DEVICES,
    //   exact: true,
    //   element: <DevicesWithSuspense />,
    //   beforeEnter: (next) => {
    //     if (userHasPermission(OBX.ACL_OBX_DEVICES_VIEW)) {
    //       return next();
    //     } else {
    //       return next(routes.PROFILE);
    //     }
    //   },
    //   meta: {
    //     title: 'Schedules',
    //     requiresAuth: true,
    //   },
    // },

    {
      // Zones ROUTE
      path: routes.OBX_ZONES,
      exact: true,
      element: <ZonesWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_ZONES_VIEW) && franchiseId ? next() : next(routes.PROFILE),
      meta: {
        title: 'Zones',
        requiresAuth: true,
      },
    },
    {
      // Zones Detail ROUTE
      path: routes.OBX_ZONES_DETAIL_ROUTE,
      exact: true,
      element: <ZonesDetailWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_ZONES_VIEW) && franchiseId ? next() : next(routes.PROFILE),
      meta: {
        title: 'Zones Detail',
        requiresAuth: true,
      },
    },

    {
      // DASHBOARD ROUTE
      path: routes.OBX_VEHICLES,
      exact: true,
      element: <VehiclesWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_VEHICLES_VIEW) && franchiseId ? next() : next(routes.PROFILE),
      meta: {
        title: 'Vehicles',
        requiresAuth: true,
      },
    },
    {
      // Vehicles Detail ROUTE
      path: routes.OBX_VEHICLE_DETAIL_ROUTE,
      exact: true,
      element: <VehicleDetailWithSuspense />,
      beforeEnter: (next) => {
        if (userHasPermission(OBX.ACL_OBX_VEHICLES_VIEW) && franchiseId) {
          return next();
        } else {
          return next(routes.PROFILE);
        }
      },
      meta: {
        title: 'Vehicles Detail',
        requiresAuth: true,
      },
    },
    {
      // Vehicles Form  ROUTE
      path: routes.OBX_VEHICLE_FORM,
      exact: true,
      element: <VehicleFormWithSuspense />,
      beforeEnter: (next) => {
        if (userHasPermission(OBX.ACL_OBX_VEHICLES_CREATE) && franchiseId) {
          return next();
        } else {
          return next(routes.PROFILE);
        }
      },
      meta: {
        title: 'Vehicles',
        requiresAuth: true,
      },
    },
    {
      // Attendance Listing ROUTE
      path: routes.OBX_ATTENDANCE,
      exact: true,
      element: <AttendanceWithSuspense />,
      beforeEnter: (next) => {
        if (userHasPermission(OBX.ACL_OBX_LEAVE_REQUEST_VIEW) && franchiseId) {
          return next();
        } else {
          return next(routes.PROFILE);
        }
      },
      meta: {
        title: 'Leave Requests',
        requiresAuth: true,
      },
    },
    {
      // Report detail ROUTE
      path: routes.OBX_INVOICES,
      exact: true,
      element: <InvoicesWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_INVOICES_VIEW) && franchiseId ? next() : next(routes.PROFILE),
      meta: {
        title: 'Invoices',
        requiresAuth: true,
      },
    },
    {
      // Attendance Listing ROUTE
      path: routes.OBX_ATTENDANCE_DETAIL_ROUTE,
      exact: true,
      element: <AttendanceDetailWithSuspense />,
      beforeEnter: (next) => {
        if (userHasPermission(OBX.MODULE_OBX_ATTENDANCE) && franchiseId) {
          return next();
        } else {
          return next(routes.PROFILE);
        }
      },
      meta: {
        title: 'Leave Requests',
        requiresAuth: true,
      },
    },
    {
      // Vehicles Form  ROUTE
      path: routes.COMMON_SETTING,
      exact: true,
      element: <OBXSettingWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_SETTINGS_VIEW) ? next() : next(routes.PROFILE),
      meta: {
        title: 'Settings',
        requiresAuth: true,
      },
    },
    {
      path: routes.DESIGN_SYSTEM,
      exact: true,
      element: <DesignSystemWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_SETTINGS_VIEW) ? next() : next(routes.PROFILE),
      meta: {
        title: 'Design System',
        requiresAuth: true,
      },
    },
    {
      // Vehicles Form  ROUTE
      path: routes.OBX_NEW_USER_GROUP,
      exact: true,
      element: <OBXNewUserGroupWithSuspense />,
      // beforeEnter: (next) => {
      //   if (userHasPermission(OBX.MODULE_OBX_VEHICLES_CREATE)) {
      //     return next();
      //   } else {
      //     return next(routes.PROFILE);
      //   }
      // },
      meta: {
        title: ' Group',
        requiresAuth: true,
      },
    },
    {
      // Loads Form  ROUTE
      path: routes.PROFILE,
      exact: true,
      element: <ProfileWithSuspense />,
      meta: {
        title: 'Profile',
        requiresAuth: true,
      },
    },
    {
      // Loads Form  ROUTE
      path: routes.NOTIFICATIONS,
      exact: true,
      element: <NotificationsWithSuspense />,
      meta: {
        title: 'Profile',
        requiresAuth: true,
      },
    },
    {
      // Release Notifications ROUTE
      path: routes.RELEASE_NOTIFICATIONS,
      exact: true,
      element: <NotificationReleaseWithSuspense />,
      meta: {
        title: 'Release Notifications',
        requiresAuth: true,
      },
    },
    {
      // Faqs
      path: routes.OBX_WEB_FAQS,
      exact: true,
      element: <ObxWebFaqsWithSuspense />,
    },
    {
      // Faqs
      path: routes.OBX_PAYROLL,
      exact: true,
      element: <ObxPayrollsWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_PAYROLL_VIEW) && franchiseId ? next() : next(routes.PROFILE),
      meta: {
        title: 'Payroll',
      },
    },
    {
      // Create
      path: routes.OBX_CREATE,
      exact: true,
      element: <CreateWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_CREATE_VIEW) ? next() : next(routes.PROFILE),
      meta: {
        title: 'Create',
        requiresAuth: true,
      },
    },
    {
      // Release
      path: routes.OBX_RELEASE,
      exact: true,
      element: <ReleaseWithSuspense />,
      meta: {
        title: 'Release',
        requiresAuth: true,
      },
    },
    {
      // Release Configure
      path: routes.OBX_RELEASE_CONFIGURE,
      exact: true,
      element: <ReleaseConfigureWithSuspense />,
      meta: {
        title: 'Quarter Configuration',
        requiresAuth: true,
      },
    },
    {
      // Release Notes Details
      path: routes.OBX_RELEASE_NOTES_DETAILS,
      exact: true,
      element: <ReleaseNotesDetailsWithSuspense />,
      meta: {
        title: 'Release Notes Details',
        requiresAuth: true,
      },
    },
    {
      // Add Release
      path: routes.OBX_RELEASE_ADD,
      exact: true,
      element: <AddReleaseWithSuspense />,
      meta: {
        title: 'Add Release',
        requiresAuth: true,
      },
    },
    {
      // create site
      path: routes.OBX_CREATE_SITE,
      exact: true,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_SITE_CREATE) && franchiseId ? next() : next(routes.PROFILE),
      element: <ObxCreateSitesWithSuspense />,
      meta: {
        title: 'Create Site',
        requiresAuth: true,
      },
    },
    {
      // create site
      path: routes.OBX_TOURE_REPORT,
      exact: true,
      element: <ObxTourReportsWithSuspense />,
    },
    {
      // create runsheet
      path: routes.OBX_HITS_DETAILS,
      exact: true,
      element: <RunSheetDetailsWithSuspense />,
      meta: {
        title: 'Runsheet',
      },
    },
    {
      // create runsheet
      path: routes.OBX_HITS_DETAILS,
      exact: true,
      element: <RunSheetSplitPageWithSuspense />,
    },
    {
      // RunSheet ROUTE
      path: routes.OBX_RUNSHEET_SPLIT,
      exact: true,
      element: <RunSheetSplitPageWithSuspense />,
      beforeEnter: (next) =>
        userHasPermission(OBX.ACL_OBX_RUNSHEET_VIEW) && franchiseId ? next() : next(routes.PROFILE),
      meta: {
        title: 'Runsheets',
        requiresAuth: true,
      },
    },
    {
      // create site
      path: routes.OBX_ASSIGN_HITS,
      exact: true,
      element: <AssignHitsWithSuspense />,
    },
    {
      // Club visits from any day into a single runsheet
      path: routes.OBX_BUILD_ROUTE,
      exact: true,
      element: <BuildRouteWithSuspense />,
      meta: {
        title: 'Build route',
        requiresAuth: true,
      },
    },
    {
      // Review a proposed reordering before any of it is written
      path: routes.OBX_OPTIMIZE_ROUTE,
      exact: true,
      element: <OptimizeRouteWithSuspense />,
      meta: {
        title: 'Optimize routes',
        requiresAuth: true,
      },
    },
    // {
    //   // create site
    //   path: routes.OBX_USERS_BASIC_INFORMATION,
    //   exact: true,
    //   element: <ObxUserBasicInformationsWithSuspense />,
    // },

    {
      // User ROUTE
      path: routes.OBX_USERS_UPDATE_INFORMATION,
      exact: true,
      element: <ObxUserBasicInformationsWithSuspense />,
      beforeEnter: (next) => userHasPermission(OBX.ACL_OBX_USERS_VIEW) && next(),
      meta: {
        title: 'User',
        requiresAuth: true,
      },
    },
  ];
};

export default route;
