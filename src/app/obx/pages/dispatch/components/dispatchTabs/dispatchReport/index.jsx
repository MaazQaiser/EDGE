import { Box, Button, Skeleton, Typography } from '@mui/material';
import { ReactComponent as NoDataIcon } from 'assets/images/Nodata.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { DISPATCH_STATUS_ENUM } from 'src/app/obx/pages/dispatch/dispatch.constant';
import { ACL_OBX_DISPATCH_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { OBX_TOURE_REPORT_DISPATCH } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { ReactComponent as PlusIcon } from 'src/assets/svg/WhitePlusIcon.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
// import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { getDispatchShiftReport } from 'src/services/dispatch.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './dispatchReport.styles';
import Report from './report';

const DispatchReport = ({ dispatchId, dispatch }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const franchiseId = searchParams.get('franchiseId');

  const [report, setReport] = useState();
  const [loading, setLoading] = useState(false);

  const fetchDispatchReport = async () => {
    try {
      let config = {};
      if (franchiseId) {
        config = {
          headers: {
            franchise_id: franchiseId,
          },
        };
      }
      setLoading(true);
      const result = await getDispatchShiftReport(
        dispatchId,
        { reportDate: dispatch?.createdAt },
        config,
      );
      setReport(result.data);
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
    if (dispatchId && dispatch?.createdAt) {
      fetchDispatchReport();
    }
  }, [dispatchId, dispatch?.createdAt]);

  if (loading)
    return (
      <Box className={classes.dispatchSkelton}>
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
      </Box>
    );

  return (
    <Box>
      <Box marginBottom={'14px'}>
        <Typography className={classes.dutyDetailReportsTitle} variant="h4">
          {t('obx.dispatch.dispatchReport', { dispatch: getLabel('terms', 'dispatch', t) })}
        </Typography>
      </Box>

      <Box>
        {!report && !loading && (
          <>
            <Box className={classes.notRecordFounWrapper}>
              <Box className={classes.noRecordFound}>
                <NoDataIcon />
                <Typography className={classes.reportsError}>
                  {t('obx.dispatch.noReportDispatch')}
                </Typography>
                <Typography className={classes.reportsMessage}>
                  {t('obx.dispatch.noReportDispatchDesc')}
                </Typography>
                <RenderIfHasPermission name={ACL_OBX_DISPATCH_UPDATE}>
                  {![
                    DISPATCH_STATUS_ENUM(t).completed.value,
                    DISPATCH_STATUS_ENUM(t).close.value,
                  ].includes(dispatch?.status) && (
                    <Box marginTop={'14px'}>
                      <Button
                        startIcon={<PlusIcon />}
                        onClick={() => {
                          history.push(
                            `${OBX_TOURE_REPORT_DISPATCH.replace(':id', dispatchId)}?franchiseId=${franchiseId}`,
                          );
                        }}
                        variant="primary"
                      >
                        {t('buttons.submitReport')}
                      </Button>
                    </Box>
                  )}
                </RenderIfHasPermission>
              </Box>
            </Box>
          </>
        )}
        {report && (
          <Report key={report.id} report={report} type={'dispatch'} franchiseId={franchiseId} />
        )}
      </Box>
    </Box>
  );
};

DispatchReport.propTypes = {
  dispatchId: PropTypes.string,
  dispatch: PropTypes.object,
};

export default DispatchReport;
