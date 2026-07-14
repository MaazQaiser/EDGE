// import userHasRole from '../../utils/auth/userHasRole';
// import userHasPermission from '../../../utils/auth/userHasPermission';
// import userHasRoleAndPermission from '../../utils/auth/userHasRoleAndPermission';
import * as routes from '../constant/ROUTE';
import hoRoutes from './ho.routes';
import obxRoutes from './obx.routes';
import salesRoutes from './sales.routes';

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

function getRouteConfigs(franchiseId) {
  let final = obxRoutes(franchiseId);
  final = final.concat(hoRoutes);
  final = final.concat(salesRoutes);

  const endPoint = [
    {
      // NOT FOUND ROUTE
      path: '*',
      redirect: routes.ROOT,
    },
  ];

  final = final.concat(endPoint);
  return final;
}

export default getRouteConfigs;
