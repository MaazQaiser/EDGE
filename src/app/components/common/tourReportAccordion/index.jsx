import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import CheckPointAccordion from 'commonComponents/tourReportAccordion/component/checkPointAccordion';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { getTourReportListing } from 'services/reports.services';
import { OBX_REPORTS } from 'src/app/router/constant/ROUTE';
// import * as routes from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useStyles } from './tourReportAccordion';

const TourReportAccordion = () => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();

  const [data, setData] = useState([]);
  const [checkPointCount, setCheckPointCount] = useState(0);
  const [selectedAccordion, setSelectedAccordion] = useState(false);

  const { tourReportId: id, reportId } = useParams();

  const handleChange = (panel) => (event, isExpanded) => {
    setSelectedAccordion(isExpanded ? panel : false);
  };

  const [loading, setLoading] = useState(true);

  const fetchTourReportListing = async (id) => {
    try {
      setLoading(true);
      const res = await getTourReportListing(id);

      if (res.statusCode === 200) {
        if (res.data.length < 2) {
          setSelectedAccordion(0);
        }

        const checkPointCount = res.data.filter((a) => a.templateableType === 'checkpoints').length;

        setData(res.data);
        setCheckPointCount(checkPointCount);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchReportDetails = async (reportId) => {
    try {
      setLoading(true);
      setSelectedAccordion(0);
      setData([{ reportId: reportId }]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTourReportListing(id);
    }
    if (reportId && !id) {
      fetchReportDetails(reportId);
    }
  }, [id, reportId]);

  return (
    <Box className={classes.tourWrapper}>
      <Box className={classes.topHeader}>
        {loading ? (
          <Box className={classes.skeletonWrraper}>
            <Skeleton variant="rectangular" width={'100%'} height={60} />
            <Skeleton variant="rectangular" width={'100%'} height={60} />
            <Skeleton variant="rectangular" width={'100%'} height={60} />
            <Skeleton variant="rectangular" width={'100%'} height={60} />
          </Box>
        ) : (
          <>
            <Box className={classes.summeryWrapper}>
              <Button
                variant="tertiaryGrey"
                onClick={() => {
                  history.push(OBX_REPORTS);
                }}
                startIcon={<ArrowBackIcon />}
              >
                {t('obx.buttons.back')}
              </Button>
              {id && checkPointCount > 0 && (
                <Box className={classes.textContent}>
                  <Typography variant="h3">
                    {t('obx.schedules.tourOne', { tour: getLabel('terms', 'tour', t) })}
                  </Typography>
                  <Typography className={classes.dotCode}>&#183;</Typography>
                  <Typography variant="h3">
                    {t('obx.schedules.checkpoints')} ({checkPointCount})
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
        {data?.map((row, i) => {
          return (
            <CheckPointAccordion
              key={i}
              row={row}
              checkpointNumber={i}
              handleChange={handleChange}
              selectedAccordion={selectedAccordion}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default TourReportAccordion;
