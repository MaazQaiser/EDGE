import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
// import { ReactComponent as Logo } from 'assets/images/signalLogo.svg';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import Slider from 'react-slick';
import LoaderComponent from 'src/app/components/common/loader';
import { OBX_SITES } from 'src/app/router/constant/ROUTE';
import { generateMockJwt } from 'src/helper/mockData/mockJwt';
import {
  formatLabel,
  isObjectEmpty,
  mainDomain,
  mergeTenantBranding,
} from 'src/helper/utilityFunctions';
import { fetchTenantLabelsCall, getUserData } from 'src/services/auth.services';
import {
  hoAgentModuleAccessList,
  hoModuleAccessList,
  obxModuleAccessList,
  obxSupervisorModuleAccessList,
  salesModuleAccessList,
} from 'src/stubbedData/moduleAccessList';
import {
  dashboardOptions,
  handleAuthRedirection,
  rolesEnumWithName,
  toastSettings,
} from 'src/utils/constants';
import { MULTI_TENANT_AUTH } from 'src/utils/constants/multiTanentAuthInfo';
import { toaster } from 'src/utils/toast';

import {
  setAccessControlPermissions,
  setAccessToken,
  setCurrentLanguage,
  setDashboardActive,
  setDefaultCountryConfiguration,
  setFranchiseId,
  setFranchises,
  setFranchiseTimeZone,
  setInvoiceInfo,
  setTenantId,
  setTenantInfo,
  setTenantPermissions,
  setTimeFormat,
  setUserAccessList,
  setUserRole,
} from '../../../../redux/store/slices/auth';
import { setTenantLabels } from '../../../../redux/store/slices/tenantConfigs';
import { setInfoData } from '../../../../redux/store/slices/user';
import ReportProblemModal from '../reportProblemModal';

const useStyles = makeStyles((theme) => ({
  mainFormLogin: {
    display: 'flex',
    height: '100dvh',
    overflow: 'hidden',
  },

  mainFormSlider: {
    width: '50%',

    '& .slick-dots': {
      bottom: '70px',
      '& li': {
        margin: 0,
        '&.slick-active': {
          '& button': {
            '&::before': {
              fontSize: '12px',
              color: theme.palette.surfaceBrand,
            },
          },
        },
        '& button': {
          '&:focus': {
            '&:before': {
              opacity: 1,
            },
          },
          '&::before': {
            fontSize: '10px',
            color: theme.palette.borderSubtle1,
            opacity: 1,
          },
        },
      },
    },
  },

  mainFormContent: {
    width: '50%',
    paddingTop: '120px',
    paddingBottom: ' 52px',
    paddingLeft: ' 36px',
    paddingRight: ' 36px',
  },

  innerContent: {
    maxWidth: '360px',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '88px',
    margin: '0 auto',
    justifyContent: 'space-between',
  },

  mainHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  manageText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      marginTop: '4px ',
    },
  },
  copyRightText: {
    '&.MuiTypography-root': {
      display: 'block',
      color: theme.palette.textPlaceholder,
      textAlign: 'center ',
    },
  },
  forgotTextBtn: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },

  welcomeLinks: {
    marginBottom: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  welcomeLink: {
    fontSize: '14px',
    lineHeight: '20px',
    textAlign: 'center',
    fontWeight: '500',
    color: theme.palette.textBrand,
    cursor: 'pointer',
  },

  logoImage: {
    height: '50px',
    margin: '0 auto',
  },

  welcomeContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '40px',
    flex: '1',
  },

  sliderBg: {
    height: '100dvh',
    position: 'relative',
  },

  sliderBgImage: {
    display: 'block',
    width: '100%',
    height: '100dvh',
    objectFit: 'cover',
  },

  sliderBgOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100dvh',
    opacity: '0.8',
    background: 'linear-gradient(355deg, #000 26.18%, rgba(109, 109, 109, 0.00) 96.67%)',
  },

  sliderBgContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'absolute',
    bottom: '114px',
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    padding: '0 12px',
  },

  sliderBgTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textOnColor,
    },
  },

  sliderBgText: {
    '&.MuiTypography-root': {
      color: theme.palette.textOnColor,
    },
  },
}));

const errorObj = {
  unauthorized: 'unauthorized',
  access_denied: 'access_denied',
};

export default function Login() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const loginError = queryParams.get('loginError');

  const classes = useStyles();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  // const [reportProblemDrawer, setReportProblemDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const tenantInfo = MULTI_TENANT_AUTH[mainDomain()];

  const handleClose = () => {
    setShowModal(false);
  };

  const userRole = useSelector((state) => state.auth.userRole);

  const [disabled, _setDisabled] = useState(false);

  const { t, i18n } = useTranslation();

  const dispatch = useDispatch();

  var settings = {
    arrows: false,
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  useEffect(() => {
    if (loginError) {
      if (loginError === errorObj.unauthorized) {
        toaster.error({
          text: t('errors.unauthorized'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      } else if (loginError === errorObj.access_denied) {
        toaster.error({
          text: t('errors.access_denied'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      } else {
        toaster.error({
          text: t('errors.somethingWentWrong'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  }, [loginError]);

  useEffect(() => {
    if (localStorage.getItem('accessToken') && !isObjectEmpty(userRole)) {
      history.push(handleAuthRedirection(userRole?.slug));
    }
  }, [userRole, history]);

  const mockLogin = async () => {
    try {
      setIsLoading(true);
      const accessToken = generateMockJwt('franchise_owner');
      localStorage.setItem('accessToken', accessToken);
      dispatch(setAccessToken(accessToken));
      await getPermission(accessToken);
    } catch (error) {
      setIsLoading(false);
      toaster.error({
        text: t('errors.somethingWentWrong'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const getPermission = async (tokenOverride) => {
    try {
      setIsLoading(true);
      // TODO: Removed Permission as we shifted toward user data API but keeping it comment yet.
      // const response = await getUserLoginPermission();
      const response = await getUserData();
      if (response && response.statusCode == 200) {
        const accessToken = localStorage.getItem('accessToken');
        const roles = rolesEnumWithName[response?.data?.user?.assignedRoles[0]];
        dispatch(setUserRole(roles));

        const franchiceTimeFormat = response?.data?.user?.franchises?.find(
          (a) => a.id == response?.data?.user?.franchiseId,
        )?.format;

        if (franchiceTimeFormat) {
          dispatch(setTimeFormat(franchiceTimeFormat));
        }

        const franchisesObject = response?.data?.user?.franchises?.reduce((acc, franchise) => {
          acc[franchise?.id] = franchise;
          return acc;
        }, {});
        dispatch(setFranchises(franchisesObject));

        dispatch(setDefaultCountryConfiguration(response?.data?.user?.defaultCountryConfiguration));
        dispatch(setFranchiseId(response?.data?.user?.franchiseId));
        dispatch(setTenantId(response?.data?.user?.tenantId));
        if (response?.data?.user?.tenantConfiguration) {
          dispatch(setTenantInfo(mergeTenantBranding(response?.data?.user?.tenantConfiguration)));
        }

        if (response?.data?.user?.tenantConfiguration?.permissions?.edge) {
          dispatch(
            setTenantPermissions(response?.data?.user?.tenantConfiguration?.permissions?.edge),
          );
        }

        if (response?.data?.user?.tenantConfiguration?.properties?.edge) {
          dispatch(
            setInvoiceInfo(response?.data?.user?.tenantConfiguration?.properties?.edge?.billFrom),
          );
        }

        // dispatch(setAccessControlPermissions(accessControlList));
        let type = response?.data?.user?.roleableType;

        let permissionsList =
          type === 'Franchise'
            ? {
                ...response?.data.user?.accessControlList?.[response?.data.user?.franchiseId],
              }
            : response?.data?.user?.accessControlList;

        // TODO: need to get this list from backend
        /**
         * TODO: Backend will update its access list in accessToken and we will pick it up by decoding token.
         */
        switch (roles?.slug) {
          case rolesEnumWithName.home_officer.slug:
            // ? if the role is home office add access list of home office
            dispatch(setUserAccessList(hoModuleAccessList));
            break;

          case rolesEnumWithName.franchise_owner.slug:
            // ? if the role is franchise owner add access list of franchise owner
            dispatch(setUserAccessList(obxModuleAccessList));
            permissionsList = {
              ...permissionsList,
              OBXDashboard: {
                view: response?.data?.user?.tenantConfiguration?.permissions?.edge?.permissionsList
                  ?.obxDashboard,
              },
            };
            break;

          case rolesEnumWithName.coordinator.slug:
            // ? if the role is franchise owner add access list of franchise owner
            dispatch(setUserAccessList(obxModuleAccessList));
            permissionsList = {
              ...permissionsList,
              OBXDashboard: {
                view: response?.data?.user?.tenantConfiguration?.permissions?.edge?.permissionsList
                  ?.obxDashboard,
              },
            };
            break;
          case rolesEnumWithName.director.slug:
            // ? if the role is franchise owner add access list of franchise owner
            dispatch(setUserAccessList(obxModuleAccessList));
            permissionsList = {
              ...permissionsList,
              OBXDashboard: {
                view: response?.data?.user?.tenantConfiguration?.permissions?.edge?.permissionsList
                  ?.obxDashboard,
              },
            };
            break;

          case rolesEnumWithName.supervisor.slug:
            // ? if the role is supervisor add access list of supervisor

            if (response?.data?.user?.runsheetAccess) {
              obxSupervisorModuleAccessList.push('obx-view-runsheets');
            }

            dispatch(setUserAccessList(obxSupervisorModuleAccessList));
            break;

          case rolesEnumWithName.sales_person.slug:
            // ? if the role is sales person add access list of sales person
            dispatch(setUserAccessList(salesModuleAccessList));
            break;

          case rolesEnumWithName.ho_agent.slug:
            // ? if the role is sales person add access list of sales person
            dispatch(setUserAccessList(hoAgentModuleAccessList));
            break;

          case rolesEnumWithName.advanced_officer.slug:
            // ? if the role is franchise owner add access list of franchise owner
            dispatch(setUserAccessList(obxModuleAccessList));
            break;

          // Add more cases as needed for other roles
        }

        dispatch(setAccessControlPermissions(permissionsList));

        // TODO: Will turn this ON once we start receiving access list from backend
        // dispatch(setUserAccessList(response?.data?.accessList));
        dispatch(setAccessToken(tokenOverride || accessToken));
        dispatch(setCurrentLanguage(response?.data?.language));

        i18n.changeLanguage(response?.data?.language?.code);

        dispatch(
          setInfoData({
            ...response?.data?.user,
            country: response?.data?.country,
          }),
        );

        // eslint-disable-next-line no-constant-condition
        if (roles?.slug === rolesEnumWithName.home_officer.slug) {
          dispatch(setDashboardActive(dashboardOptions.ops));
        }

        if (
          roles.slug !== rolesEnumWithName.home_officer.slug &&
          roles.slug !== rolesEnumWithName.sales_person.slug
        ) {
          dispatch(setFranchiseTimeZone(response?.data?.user?.franchiseTimezone));
        }

        const labels = await fetchTenantLabelsCall();
        if (labels && Object.keys(labels).length > 0) {
          dispatch(setTenantLabels(labels));
        }

        if (
          response?.data?.user?.tenantConfiguration?.permissions?.edge?.login
            ?.redirectToSitesScreen &&
          response?.data?.user?.type === formatLabel(rolesEnumWithName.franchise_owner.slug)
        ) {
          history.push(OBX_SITES);
        } else {
          history.push(handleAuthRedirection(roles?.slug));
        }

        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      history.push('/?loginError=something_went_wrong');

      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = (
    <Button
      className={classes.loginButton}
      variant="primary"
      type="button"
      onClick={mockLogin}
      disabled={disabled}
    >
      {t('commonText.login.buttons.loginSSO')}
    </Button>
  );

  if (isLoading) {
    return <LoaderComponent size={100} color={'primary'} label={'Loading'} />;
  }
  return (
    <>
      <Box className={classes.mainFormLogin}>
        <Box className={classes.mainFormSlider}>
          {/* <img src={bannerImage} alt="banner Image" className={classes.bannerImage} /> */}
          <Slider {...settings}>
            {tenantInfo?.sliderData.map((item) => {
              return (
                <div className={classes.sliderBg} key={item.id}>
                  <div className={classes.sliderBgOverlay}></div>
                  <img src={item.imageUrl} className={classes.sliderBgImage} alt="" />
                  <div className={classes.sliderBgContent}>
                    <Typography variant="h1" className={classes.sliderBgTitle}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" className={classes.sliderBgText}>
                      {item.desc}
                    </Typography>
                  </div>
                </div>
              );
            })}
          </Slider>
        </Box>
        <Box className={classes.mainFormContent}>
          <Box className={classes.innerContent}>
            <Box className={classes.logoImage}>
              {tenantInfo?.logo ? (
                <img
                  src={tenantInfo?.logo}
                  alt={tenantInfo?.logo}
                  style={{ width: '168px', height: '49px' }}
                />
              ) : null}
            </Box>
            <Box className={classes.welcomeContent}>
              <Box className={classes.loginHeadingWrapper}>
                <Typography variant="h1" className={classes.loginHeading}>
                  {t('commonText.login.welcome')}
                </Typography>
                <Typography className={classes.manageText} variant="body2">
                  {t('commonText.login.desc')}
                </Typography>
              </Box>
              {renderForm}
            </Box>
            <Box>
              {tenantInfo?.showFaq ? (
                <Box className={classes.welcomeLinks}>
                  <Box className={classes.welcomeLink} onClick={() => setShowModal(true)}>
                    {t('reportProblem.reportProblem')}
                  </Box>
                </Box>
              ) : null}
              <Typography component="span" variant="body3" className={classes.copyRightText}>
                @{new Date().getFullYear()} {tenantInfo?.name}.{t('commonText.login.copyRightText')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {showModal && <ReportProblemModal open={showModal} onClose={handleClose} />}

      {/* {reportProblemDrawer && (
        <SideDrawer isOpen={reportProblemDrawer} totalWidth="624px">
          <ReportProblemDrawer setReportProblemDrawer={setReportProblemDrawer} />
        </SideDrawer>
      )} */}
    </>
  );
}
