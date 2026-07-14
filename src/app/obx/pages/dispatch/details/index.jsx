import { Box } from '@mui/material';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDispatch } from 'src/services/dispatch.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import DispatchLogs from '../components/dispatchLogs';
import DispatchTabs from '../components/dispatchTabs';
import DispatchSidebarListings from '../components/sidebarListings';
import TopDetailDispatch from '../components/topDetailDispatch/topDetailDispatch';
import { useStyles } from './details';

export default function DispatchForm() {
  const params = useParams();
  const [dispatch, setDispatch] = useState();
  const [loading, setLoading] = useState(false);
  const [updatedObject, setUpdatedObject] = useState();

  const fetchDispatch = async () => {
    try {
      setLoading(true);
      const result = await getDispatch(params.id);
      setDispatch(result?.data?.dispatch || {});
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchDispatch();
  }, [params.id]);

  const handleDispatchClose = (dispatch) => {
    fetchDispatch();
    setUpdatedObject(dispatch);
  };

  const classes = useStyles();

  return (
    <Box className={classes.dispatchDetails}>
      <Box className={classNames(classes?.detailsLeftSide, 'innerScrollBar')}>
        <DispatchSidebarListings updatedObject={updatedObject} />
      </Box>
      <Box className={classes.detailsRightSide}>
        <Box>
          <TopDetailDispatch dispatch={dispatch} loading={loading} />
        </Box>
        <Box className={classNames(classes.bottomAreaSplit, 'innerScrollBar')}>
          <Box className={classes.bottomAreaLeft}>
            <DispatchTabs
              dispatch={dispatch}
              dispatchId={params.id}
              loading={loading}
              refetchDispatch={fetchDispatch}
            />
          </Box>
          <Box className={classes.bottomAreaRight}>
            <DispatchLogs
              dispatch={dispatch}
              dispatchId={params.id}
              onDispatchClose={handleDispatchClose}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
