import { lazy } from 'react';

import withSuspense from '../../hoc/withSuspense';
// Home Page
const Login = lazy(
  () => import(/* webpackChunkName: "Home" */ '../../applications/public/pages/Login/login'),
);
const LoginWithSuspense = withSuspense(Login);

// Route configurations for settings
function getRouteConfigs() {
  return [
    {
      // ROOT
      path: ROOT,
      exact: true,
      element: <LoginWithSuspense />,
      meta: {
        title: 'Login',
      },
    },
  ];
}
export default getRouteConfigs;
