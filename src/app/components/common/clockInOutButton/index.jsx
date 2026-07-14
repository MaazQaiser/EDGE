import LoadingButton from '@mui/lab/LoadingButton';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as PauseIcon } from 'assets/icons/pause-circle.svg?react';
import { ReactComponent as ClockInIcon } from 'assets/icons/play-circle.svg?react';
import Stopwatch from 'commonComponents/stopwatch';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getUserClockInDetails, singInUser, singOutUser } from 'services/clockInClockOut.service';
import { useApiControllers } from 'src/helper/axios';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';
const useStyles = makeStyles({
  clockInButton: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
});
let timeOutId = null;
const ClockInOutButton = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const userInfo = useSelector((state) => state?.user?.info);

  const [clockedInDetails, setClockedInDetails] = useState({
    isClockedIn: false,
    clockedInAt: null,
  });
  const [loading, setLoading] = useState(true);

  const { getNewApiController } = useApiControllers();

  /**
   * TODO: this function will get called after every 5 minutes to check whether
   * the User is clocked in or not
   * TODO: check if the user is logged in and clocked in then start this function
   * */
  const checkInterval = 5 * 60 * 1000; // 5 minutes in milliseconds

  function checkUserStatus() {
    // Make API call to check user status
    isUserClockedIn();
    // Example: fetch('api/user/status').then(response => {...});

    // Schedule next check after the interval
    timeOutId = setTimeout(checkUserStatus, checkInterval);
  }

  const isUserClockedIn = async () => {
    const apiController = getNewApiController();
    try {
      setLoading(true);
      const response = await getUserClockInDetails({ signal: apiController.signal });
      if (response?.statusCode === 200) {
        // TODO: check if user is clocked in or not
        setClockedInDetails({
          isClockedIn: !!response?.data?.checkinAt,
          clockedInAt: response?.data?.checkinAt || null,
        });
      }
      setLoading(false);
    } catch (error) {
      // TODO: throw error if you want, depending on the API response.
      if (!apiController.signal.aborted) {
        setLoading(false);
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };

  const markSignIn = async () => {
    const apiController = getNewApiController();
    try {
      // call the API to sign in
      setLoading(true);
      const response = await singInUser({}, { signal: apiController.signal });
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        setClockedInDetails({
          isClockedIn: true,
          clockedInAt: response?.data?.checkinAt,
        });
      }
      setLoading(false);
    } catch (error) {
      // show error in case of any
      if (!apiController.signal.aborted) {
        setLoading(false);
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };

  const markSignOut = async () => {
    const apiController = getNewApiController();
    try {
      // call the API to sign out user
      setLoading(true);
      const response = await singOutUser({}, { signal: apiController.signal });
      if (response?.statusCode === 200) {
        setClockedInDetails({
          isClockedIn: false,
          clockedInAt: null,
        });
      }
      setLoading(false);
    } catch (error) {
      // show error in case of any
      if (!apiController.signal.aborted) {
        setLoading(false);
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };

  const handleButtonClick = () => {
    if (!clockedInDetails.isClockedIn) {
      return markSignIn();
    }
    return markSignOut();
  };

  useEffect(() => {
    if (userInfo?.id) {
      if (clockedInDetails.isClockedIn) {
        checkUserStatus();
      } else {
        isUserClockedIn();
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeOutId) {
        clearTimeout(timeOutId);
      }
    };
  }, []);

  return (
    <>
      <LoadingButton
        loading={loading}
        loadingPosition="start"
        loadingIndicator=""
        variant="primary"
        onClick={handleButtonClick}
      >
        {clockedInDetails.isClockedIn ? (
          <Box className={classes.clockInButton}>
            <span>{t('clockInOut.clockOut')}</span>
            <PauseIcon />
            <Stopwatch startDate={clockedInDetails.clockedInAt} />
          </Box>
        ) : (
          <Box className={classes.clockInButton}>
            <span> {t('clockInOut.clockIn')}</span>
            <ClockInIcon />
          </Box>
        )}
      </LoadingButton>
    </>
  );
};

export default ClockInOutButton;
