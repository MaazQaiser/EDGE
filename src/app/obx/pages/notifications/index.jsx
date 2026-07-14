import { Box, Typography } from '@mui/material';
import notificationPlaceholder from 'assets/images/notifications-paceholder.png';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import InfiniteScrollCustom from 'src/app/components/common/infiniteScrollCustom';
import NotificationSkeleton from 'src/app/components/common/skeletonLoader/notificationSkeleton';
import { getNotifications, markNotificationsRead } from 'src/services/notifications.service';
import { paginationOptions } from 'src/utils/constants';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import Notification from './components/notification';
import { useStyles } from './notifications.styles';

const params = {
  perPage: paginationOptions.perPageRows,
  page: 1,
};

const Notifications = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_queryParams, setQueryParams] = useState(params);

  const [lastElement, setLastElement] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const { t } = useTranslation();
  const toggleNotifications = useSelector((state) => state.auth.toggleNotifications);

  const classes = useStyles();

  const fetchNotifications = async (queryParams) => {
    setLoading(true);
    try {
      const response = await getNotifications(queryParams);
      if (response?.statusCode === 200) {
        setData((prevState) => {
          const newData = response?.data?.notifications || [];
          return [...prevState, ...newData];
        });
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

  const getMoreData = () => {
    if (data.length < totalRecords && !loading) {
      setQueryParams((prev) => {
        const queryParams = {
          ...prev,
          page: prev.page + 1,
        };
        fetchNotifications(queryParams);

        return queryParams;
      });
    }
  };

  useEffect(() => {
    fetchNotifications(params);
    setData([]);
    setQueryParams(params);
  }, [toggleNotifications]);

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
          <>
            {data.map((notification, index) => {
              const isLastElement =
                index === data.length - 1 && !loading && data.length <= totalRecords;

              return (
                <Box
                  key={index}
                  ref={isLastElement ? setLastElement : null}
                  className={classes.notificationBox}
                >
                  <Notification notification={notification} />
                </Box>
              );
            })}
          </>
        )}
        {loading && (
          <Box className={classes.notificationBox}>
            <NotificationSkeleton noOfNotification={5} />
          </Box>
        )}
      </>
    );
  };

  return (
    <Box className={classes.notifications}>
      <Box className={classes.notificationsWrapper}>
        <Typography variant="h3" className={classes.notificationsMenuTitle}>
          {t('notifications.title')}
        </Typography>

        <Box className={classes.notificationsContent}>
          <Box className={classes.notificationsContainer}>
            <InfiniteScrollCustom
              totalNoOfRecords={totalRecords}
              noOfRecordsBeingDisplayed={data.length}
              lastElement={lastElement}
              body={scrollBody}
              getMoreData={getMoreData}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Notifications;
