import { lazy } from 'react';

import withSuspense from '../../../hoc/withSuspense';
import validateAuthState from '../../../utils/auth/validateAuthState';
import {
  APP,
  FORGOT_PASSWORD,
  HO_MOBILE_FAQS,
  HO_WEB_FAQS,
  LOGIN,
  LOGOUT,
  NO_INTERNET,
  NO_SERVER,
  OBX_DASHBOARD,
  OBX_MOBILE_FAQS,
  OBX_WEB_FAQS,
  PROBLEMS_REPORTED,
  PROBLEMS_REPORTED_DETAILS_ROUTE,
  RESET_PASSWORD,
  ROOT,
  SALES_MOBILE_FAQS,
  SALES_WEB_FAQS,
} from '../constant/ROUTE';

// Login
const Login = lazy(() => import(/* webpackChunkName: "Login" */ '../../public/pages/login/login'));
const LoginWithSuspense = withSuspense(Login);

// Logout
const Logout = lazy(
  () => import(/* webpackChunkName: "Login" */ '../../public/pages/logout/index'),
);
const LogoutWithSuspense = withSuspense(Logout);

// // Forgot Password
const ForgotPassword = lazy(
  () =>
    import(
      /* webpackChunkName: "forgotPassword" */ '../../public/pages/forgetPassword/forgetPassword'
    ),
);
const ForgotPasswordWithSuspense = withSuspense(ForgotPassword);

// // Reset Password
const ResetPassword = lazy(
  () =>
    import(
      /* webpackChunkName: "changePassword" */ '../../public/pages/changePassword/changePassword'
    ),
);
const ResetPasswordWithSuspense = withSuspense(ResetPassword);
// Problem Reported
const ProblemReported = lazy(
  () => import(/* webpackChunkName: "ProblemReported" */ '../../public/pages/problemReported'),
);
const ProblemReportedtWithSuspense = withSuspense(ProblemReported);

// Problem Reported Detail
const ProblemReportedDetails = lazy(
  () =>
    import(/* webpackChunkName: "ProblemReported" */ '../../public/pages/problemReported/detail'),
);
const ProblemReportedDetailsWithSuspense = withSuspense(ProblemReportedDetails);

// Sales Web faqs
const SalesWebFaqs = lazy(
  () => import(/* webpackChunkName: "FAQ" */ '../../public/pages/salesWebFaqs'),
);
const SalesWebFaqsWithSuspense = withSuspense(SalesWebFaqs);
// Sales Mobile-faqs
const SalesMobileFaqs = lazy(
  () => import(/* webpackChunkName: "FAQ" */ '../../public/pages/salesMobileFaqs'),
);
const SalesMobileFaqsWithSuspense = withSuspense(SalesMobileFaqs);

// Obx Web faqs
const ObxWebFaqs = lazy(
  () => import(/* webpackChunkName: "FAQ" */ '../../public/pages/obxWebFaqs'),
);
const ObxWebFaqsWithSuspense = withSuspense(ObxWebFaqs);

// Obx Mobile-faqs
const ObxMobileFaqs = lazy(
  () => import(/* webpackChunkName: "FAQ" */ '../../public/pages/obxMobileFaqs'),
);
const ObxMobileFaqsWithSuspense = withSuspense(ObxMobileFaqs);

// HO Web faqs
const HoWebFaqs = lazy(() => import(/* webpackChunkName: "FAQ" */ '../../public/pages/hoWebFaqs'));
const HoWebFaqsWithSuspense = withSuspense(HoWebFaqs);

// HO Mobile-faqs
const HoMobileFaqs = lazy(
  () => import(/* webpackChunkName: "FAQ" */ '../../public/pages/hoMobileFaqs'),
);
const HoMobileFaqsWithSuspense = withSuspense(HoMobileFaqs);

// No Server
const NoServer = lazy(
  () => import(/* webpackChunkName: "NoServer" */ '../../public/pages/noServer'),
);
const NoServerWithSuspense = withSuspense(NoServer);
// No Internet
const NoInternet = lazy(
  () => import(/* webpackChunkName: "NoServer" */ '../../public/pages/noInternet'),
);
const NoInternetWithSuspense = withSuspense(NoInternet);
// // App Main
const AppMain = lazy(() => import(/* webpackChunkName: "AppMain" */ '../../layout/appMain'));
const AppMainWithSuspense = withSuspense(AppMain);

// Before enter callback for all auth routes
const authCheckMiddleware = (next) => {
  const isAuthenticated = validateAuthState();
  if (isAuthenticated) {
    return next(OBX_DASHBOARD);
  } else {
    return next();
  }
};

// Route configurations for settings
function getRouteConfigs() {
  return [
    {
      // LOGIN
      path: LOGIN,
      exact: true,
      element: <LoginWithSuspense />,
      // beforeEnter: authCheckMiddleware,
      meta: {
        title: 'Login',
      },
    },

    {
      // FORGOT PASSWORD
      path: FORGOT_PASSWORD,
      exact: true,
      element: <ForgotPasswordWithSuspense />,
      beforeEnter: authCheckMiddleware,
      meta: {
        title: 'Forgot Password',
      },
    },
    {
      // RESET PASSWORD
      path: RESET_PASSWORD,
      exact: true,
      element: <ResetPasswordWithSuspense />,
      beforeEnter: authCheckMiddleware,
      meta: {
        title: 'Reset Password',
      },
    },
    {
      // LOGOUT
      path: LOGOUT,
      exact: true,
      element: <LogoutWithSuspense />,
      // beforeEnter: authCheckMiddleware,
      meta: {
        title: 'Logout',
      },
    },
    {
      // Problem Reported
      path: PROBLEMS_REPORTED,
      exact: true,
      element: <ProblemReportedtWithSuspense />,
      // beforeEnter: authCheckMiddleware,
      meta: {
        title: 'Problem Reported',
      },
    },
    {
      // Problem Reported Details
      path: PROBLEMS_REPORTED_DETAILS_ROUTE,
      exact: true,
      element: <ProblemReportedDetailsWithSuspense />,
      // beforeEnter: authCheckMiddleware,
      meta: {
        title: 'Problem Reported Detail',
      },
    },
    {
      // SALES WEB FAQS
      path: SALES_WEB_FAQS,
      exact: true,
      element: <SalesWebFaqsWithSuspense />,
      // beforeEnter: authCheckMiddleware,
      meta: {
        title: 'FAQs',
      },
    },
    {
      // SALES MOBILE FAQS
      path: SALES_MOBILE_FAQS,
      exact: true,
      element: <SalesMobileFaqsWithSuspense />,
      // beforeEnter: authCheckMiddleware,
      meta: {
        title: 'FAQs',
      },
    },

    {
      // OBX WEB FAQS
      path: OBX_WEB_FAQS,
      exact: true,
      element: <ObxWebFaqsWithSuspense />,
      // beforeEnter: authCheckMiddleware,
      meta: {
        title: 'FAQs',
      },
    },
    {
      // OBX MOBILE FAQS
      path: OBX_MOBILE_FAQS,
      exact: true,
      element: <ObxMobileFaqsWithSuspense />,
      // beforeEnter: authCheckMiddleware,
      meta: {
        title: 'FAQs',
      },
    },
    {
      // HO WEB FAQS
      path: HO_WEB_FAQS,
      exact: true,
      element: <HoWebFaqsWithSuspense />,
      // beforeEnter: authCheckMiddleware,
      meta: {
        title: 'FAQs',
      },
    },
    {
      // HO MOBILE FAQS
      path: HO_MOBILE_FAQS,
      exact: true,
      element: <HoMobileFaqsWithSuspense />,
      // beforeEnter: authCheckMiddleware,
      meta: {
        title: 'FAQs',
      },
    },
    {
      // Problem Reported Details
      path: NO_SERVER,
      exact: true,
      element: <NoServerWithSuspense />,
      // beforeEnter: authCheckMiddleware,
      meta: {
        title: 'No Server',
      },
    },
    {
      // Problem Reported Details
      path: NO_INTERNET,
      exact: true,
      element: <NoInternetWithSuspense />,
      // beforeEnter: authCheckMiddleware,
      meta: {
        title: 'No Internet',
      },
    },

    {
      // PUBLIC MAIN
      path: APP,
      element: <AppMainWithSuspense />,
    },
    {
      // NOT FOUND ROUTE
      path: '*',
      redirect: ROOT,
    },
  ];
}

export default getRouteConfigs;
