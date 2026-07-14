import { Box, Button, Typography } from '@mui/material';
import Fade from '@mui/material/Fade';
import Menu from '@mui/material/Menu';
import { makeStyles } from '@mui/styles';
import notificationPlaceholder from 'assets/images/notifications-paceholder.png';
import { ReactComponent as NotificationIcon } from 'assets/svg/notifications.svg?react';
import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg?react';
import InfiniteScrollCustom from 'commonComponents/infiniteScrollCustom';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import NotificationSkeleton from 'src/app/components/common/skeletonLoader/notificationSkeleton';
import Notification from 'src/app/obx/pages/notifications/components/notification';
import { NOTIFICATIONS } from 'src/app/router/constant/ROUTE';
import { getNotifications, markNotificationsRead } from 'src/services/notifications.service';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

const useStyles = makeStyles((theme) => ({
  notificationsBtn: {
    position: 'relative',
    '&.MuiButtonBase-root': {
      width: '40px',
      minWidth: '40px',
      height: '40px',
      padding: 0,
      borderRadius: '50%',
    },
    '& svg': {
      width: '20px',
      height: '20px',
    },
  },

  notificationsMoreBtn: {
    '&.MuiButtonBase-root': {
      '&:disabled': {
        '& .MuiButton-startIcon': {
          '& svg': {
            '& path': {
              stroke: theme.palette.surfaceBrandDisabled,
            },
          },
        },
      },
    },
  },

  notificationsDot: {
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    backgroundColor: theme.palette.surfaceAlertStrong,
    color: theme.palette.surfaceWhite,
    position: 'absolute',
    top: '5px',
    right: '4px',
    fontSize: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuMainWrapper: {
    '&.MuiPaper-root': {
      width: '455px',
      padding: '16px',
      borderRadius: '8px',
      background: theme.palette.surfaceWhite,
      border: `1px solid ${theme.palette.borderSubtle1}`,
      boxShadow: '0px 10px 15px 0px rgba(0, 0, 0, 0.10)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    },

    '&.MuiMenu-list': {
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flex: 1,
    },

    '& .MuiMenuItem-root': {
      padding: '0',
    },
  },

  notificationsMenuTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      paddingBottom: '20px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },

  notificationsMenuFooter: {
    paddingTop: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  notificationsPlaceholder: {
    paddingTop: '20px',
    paddingBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationsPlaceholderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginTop: '24px',
    },
  },

  notificationsPlaceholderText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '8px',
    },
  },

  notificationsBox: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    height: '300px',

    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },

    '&::-webkit-scrollbar-track': {
      boxShadow: 'none',
    },

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(128, 128, 128, 0.4)',
      borderRadius: '10px',
    },

    '&:hover': {
      '&::-webkit-scrollbar-track': {
        boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
      },

      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'grey',
      },
    },

    '& .MuiBox-root:last-child': {
      borderBottom: 0,
    },
  },
}));

const params = {
  perPage: 7,
  page: 1,
};

const NotificationsDropdown = ({ notificationsCount, setNotificationsCount }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastElement, setLastElement] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [_queryParams, _setQueryParams] = useState(params);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const history = useHistory();

  const toggleNotifications = useSelector((state) => state.auth.toggleNotifications);

  const fetchNotifications = async (params) => {
    setLoading(true);
    try {
      const response = await getNotifications(params);
      if (response?.statusCode === 200) {
        if (params?.page === 1) {
          setData(response?.data?.notifications || []);
        } else {
          setData((prevState) => {
            const newData = response?.data?.notifications || [];
            return [...prevState, ...newData];
          });
        }
        setTotalRecords(response?.data.pagination?.totalCount || 0);
      }
      markNotificationsRead();
      setLoading(false);
    } catch (error) {
      setLoading(false);

      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    if (anchorEl) {
      fetchNotifications(params);
      setNotificationsCount(0);
    }
  }, [toggleNotifications, anchorEl]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const scrollBody = () => {
    return (
      <>
        {data.length === 0 && !loading ? (
          <Box className={classes.notificationsPlaceholder}>
            <img
              src={notificationPlaceholder}
              alt=""
              className={classes.notificationsPlaceholderImage}
            />
            <Typography variant="h4" className={classes.notificationsPlaceholderTitle}>
              {t('notifications.placeholderTitle')}
            </Typography>
            <Typography variant="body3" className={classes.notificationsPlaceholderText}>
              {t('notifications.placeholderText')}
            </Typography>
          </Box>
        ) : (
          <Box className={classes.notificationsBox}>
            {data.map((notification, index) => {
              const isLastElement =
                index === data.length - 1 && !loading && data.length <= totalRecords;

              return (
                <Notification
                  reference={isLastElement ? setLastElement : null}
                  key={index}
                  notification={notification}
                />
              );
            })}
            {loading && <NotificationSkeleton noOfNotification={4} />}
          </Box>
        )}

        <Box className={classes.notificationsMenuFooter}>
          <Button
            variant="onlyText"
            className={classes.notificationsMoreBtn}
            startIcon={<PlusIcon />}
            disabled={data.length === 0}
            onClick={() => {
              setAnchorEl(null);
              history.push(`${NOTIFICATIONS}`);
            }}
          >
            {t('notifications.viewMoreLink')}
          </Button>
        </Box>
      </>
    );
  };

  return (
    <>
      <Button
        id="fade-button"
        aria-controls={open ? 'fade-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        variant="tertiaryGrey"
        className={classes.notificationsBtn}
      >
        <NotificationIcon />
        {notificationsCount > 0 && (
          <Box className={classes.notificationsDot}>
            {notificationsCount > 9 ? '9+' : notificationsCount}
          </Box>
        )}
      </Button>

      <Menu
        id="fade-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        classes={{ paper: classes.menuMainWrapper }}
        MenuListProps={{
          'aria-labelledby': 'fade-button',
          className: classes.menuMainWrapper,
        }}
      >
        <Typography variant="h3" className={classes.notificationsMenuTitle}>
          {t('notifications.title')}
        </Typography>
        <InfiniteScrollCustom
          totalNoOfRecords={totalRecords}
          noOfRecordsBeingDisplayed={data.length}
          lastElement={lastElement}
          body={scrollBody}
          getMoreData={() => {}}
        />
      </Menu>
    </>
  );
};

NotificationsDropdown.propTypes = {
  notificationsCount: PropTypes.number,
  setNotificationsCount: PropTypes.func,
};

export default NotificationsDropdown;
