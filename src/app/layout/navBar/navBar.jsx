import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, IconButton, useMediaQuery } from '@mui/material';
import { makeStyles } from '@mui/styles';
import ClockInOutButton from 'commonComponents/clockInOutButton';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import ActiveFranchiseList from 'src/app/components/common/activeFranchiseList';
import BreadCrumb from 'src/app/components/common/breadcrumb';
import NotificationsDropdown from 'src/app/components/common/notificationsDropdown';
import { NOTIFICATIONS, OBX_DISPATCH, RELEASE_NOTIFICATIONS } from 'src/app/router/constant/ROUTE';
import { NotificationIcon } from 'src/assets/svg';
import {
  setNotificationsCountRedux,
  toggleNotificationReceived,
} from 'src/redux/store/slices/auth';
import { setCountryData } from 'src/redux/store/slices/user';
import { getNotificationsCount, getUsersNotificationUrl } from 'src/services/notifications.service';
import { fetchConfigList } from 'src/services/settings.services';
import { toaster } from 'src/utils/toast';

import { rolesEnumWithName, toastSettings } from '../../../utils/constants';
import AccountDropdown from '../../components/common/accountDropdown';

const useStyles = makeStyles((theme) => ({
  header: {
    '&.MuiPaper-root': {
      position: 'sticky',
      zIndex: '99',
      backgroundColor: theme.palette.surfaceWhite,
      boxShadow: 'none',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      padding: '12px 32px',
      height: '60px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      [theme.breakpoints.down('lg')]: {
        padding: '11px 24px',
      },
      [theme.breakpoints.down(786)]: {
        padding: '8px 16px',
        height: '56px',
      },
    },
  },

  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: '20px',
    [theme.breakpoints.down(786)]: {
      gap: '2px',
    },
  },

  headerBoxItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },

  headerTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  headerContentFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',

    '& .MuiSvgIcon-root': {
      width: '20px',
      height: '20px',
      color: theme.palette.textPlaceholder,
    },
  },
  headerBoxItemMobile: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    [theme.breakpoints.down(786)]: {
      gap: '4px',
    },
  },

  releaseNotificationBarBtn: {
    '&.MuiButtonBase-root': {
      width: '40px',
      height: '40px',
      padding: 0,
    },
    '& svg': {
      width: '20px',
      height: '20px',
    },
  },
}));

export default function Header({ toggleSidebar }) {
  const classes = useStyles();
  // const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:786px)');
  const userRole = useSelector((state) => state.auth?.userRole?.slug);

  const userInfo = useSelector((state) => state.auth?.accessToken);

  const dispatch = useDispatch();

  const notificationsCount = useSelector((state) => state.auth?.notificationsCount);
  const reduxCountries = useSelector((state) => state.user.countries);

  const [serviceUrl, setServiceUrl] = useState(null);

  const setNotificationsCount = (count) => {
    dispatch(setNotificationsCountRedux(count));
  };

  const currentRoute = useLocation().pathname;
  const isDispatchRoute = currentRoute.startsWith(OBX_DISPATCH);
  const isReleaseNotificationsRoute = currentRoute.startsWith(RELEASE_NOTIFICATIONS);

  const getSubscriptionUrl = async () => {
    try {
      const response = await getUsersNotificationUrl();
      if (response?.statusCode === 200) {
        setServiceUrl(response?.data?.url);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (serviceUrl && userInfo) {
      const ws = new WebSocket(serviceUrl);
      ws.onopen = () => console.log('Connected to Azure Web PubSub');
      ws.onmessage = (event) => {
        const data = event.data;
        if (data) {
          setNotificationsCount(1);
          dispatch(toggleNotificationReceived());
        }
        // setMessages((prev) => [...prev, data]);
      };
      ws.onerror = (error) => console.error('WebSocket error:', error);
      ws.onclose = () => console.log('Disconnected');
      return () => ws.close();
    }
  }, [serviceUrl]);

  const getCountries = async () => {
    try {
      const response = await fetchConfigList();
      if (response?.countries) {
        // setNotificationsCount(response?.data?.unreadCount || 0);
        dispatch(setCountryData(response?.countries));
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (!reduxCountries?.length) {
      getCountries();
    }
    if (userInfo) getSubscriptionUrl();
  }, []);

  const fetchNotificationsCount = async () => {
    try {
      const response = await getNotificationsCount();
      if (response?.statusCode === 200) {
        setNotificationsCount(response?.data?.unreadCount || 0);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (userInfo) {
      if (currentRoute == NOTIFICATIONS) {
        setNotificationsCount(0);
      }
    }
  }, [currentRoute]);

  useEffect(() => {
    if (userInfo) {
      if (currentRoute !== NOTIFICATIONS) {
        fetchNotificationsCount();
      }
    }
  }, []);

  return (
    <AppBar className={classes.header}>
      <Box className={classes.headerContent}>
        {/* Logo and Hamburger */}
        <Box className={classes.headerContentFlex}>
          {isMobile && (
            <IconButton onClick={toggleSidebar} aria-label="menu" edge="start">
              <MenuIcon />
            </IconButton>
          )}
          {isMobile && isDispatchRoute ? (
            ''
          ) : (
            <BreadCrumb
              label={isReleaseNotificationsRoute ? 'Notification Engine' : undefined}
              icon={isReleaseNotificationsRoute ? <NotificationIcon /> : undefined}
            />
          )}
        </Box>
        {/* Navigation */}
        {/* User Actions */}
        <Box className={classes.headerBoxItemMobile}>
          <ActiveFranchiseList />

          {/*{userRoleType === rolesEnumWithName.home_officer.slug && <ActiveFranchiseList type="HO" />}*/}
          {userRole === rolesEnumWithName.supervisor.slug && <ClockInOutButton />}
          <NotificationsDropdown
            notificationsCount={notificationsCount}
            setNotificationsCount={setNotificationsCount}
          />

          <AccountDropdown />
        </Box>
      </Box>
    </AppBar>
  );
}

Header.propTypes = {
  toggleSidebar: PropTypes.func,
  isCollapsed: PropTypes.bool,
};
