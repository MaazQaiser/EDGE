import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button } from '@mui/material';
import CheckPointAccordionReportSubmit from 'commonComponents/tourReportAccordion/tourReportSubmitDispatch/checkPointAccordionReportSubmit';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { getDispatch } from 'services/dispatch.services';
// import * as routes from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './tourReportAccordion';

const TourReportSubmitDispatch = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useParams();

  const [data, setData] = useState({});
  const [_checkPointCount, _setCheckPointCount] = useState(0);

  const { id } = useParams();

  const [_loading, setLoading] = useState(true);

  const fetchDispatch = async () => {
    try {
      setLoading(true);
      const response = await getDispatch(params.id);
      if (response?.statusCode === 200) {
        setData(response?.data?.dispatch);
      }
      setLoading(false);
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
    if (id) {
      fetchDispatch(id);
    }
  }, [id]);

  return (
    <Box className={classes.tourWrapper}>
      <Box className={classes.topHeader}>
        <>
          <Box className={classes.summeryWrapper}>
            <Button
              variant="tertiaryGrey"
              onClick={() => {
                history.goBack();
              }}
              startIcon={<ArrowBackIcon />}
            >
              {t('obx.buttons.back')}
            </Button>
          </Box>
        </>

        <CheckPointAccordionReportSubmit
          row={data}
          checkpointNumber={0}
          selectedAccordion={0}
          handleChange={() => {}}
        />
      </Box>
    </Box>
  );
};

export default TourReportSubmitDispatch;
