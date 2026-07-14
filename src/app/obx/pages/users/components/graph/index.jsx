import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LineToolTouchChart from 'src/app/components/common/eLineToolTouchChart';
import PieChart from 'src/app/components/common/ePieChart';
import LineChartSkeleton from 'src/app/components/common/skeletonLoader/lineChartSkeleton.jsx';
import PieChartSkeleton from 'src/app/components/common/skeletonLoader/pieChartSkeleton.jsx';
import { useTenantLabel } from 'src/helper/utilityHooks';
import {
  jobsPerformedOverTheYearGraphData,
  missedJobsGraphData,
  userTypeGraphData,
} from 'src/services/user.services.js';

import { useStyles } from './userListingStyles';

const TopGraphComponent = () => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();

  const [userTypes, setUserTypes] = useState({});
  const [missRate, setMissRate] = useState({});

  // Transform chart data to use tenant-specific labels from Redux
  const transformDataLabels = (data) => {
    if (!data) return data;
    return data.map((item) => {
      return { ...item, name: getLabel('terms', item.name?.toLowerCase(), t) || item.name };
    });
  };

  const [dutiesPerformed, setDutiesPerformed] = useState({});

  const [loading, setLoading] = useState(true);

  const fetchDataOfUserTypesGraph = async () => {
    try {
      const response = await userTypeGraphData();
      if (response?.statusCode === 200) {
        setUserTypes(response?.data?.userTypeGraphData);
      }
    } catch (error) {
      /**
       * It is a catch of graph. So, we won't be showing anything
       */
    }
  };

  const fetchMissedJobsGraph = async () => {
    try {
      const response = await missedJobsGraphData();
      if (response?.statusCode === 200) {
        setMissRate(response?.data?.missRateGraphData);
      }
    } catch (error) {
      /**
       * It is a catch of graph. So, we won't be showing anything
       */
    }
  };

  const jobsOverYearGraph = async () => {
    try {
      const response = await jobsPerformedOverTheYearGraphData();
      if (response?.statusCode === 200) {
        setDutiesPerformed(response?.data?.dutiesPerformedOverTheYearGraphData);
      }
    } catch (error) {
      /**
       * It is a catch of graph. So, we won't be showing anything
       */
    }
  };

  useEffect(() => {
    Promise.all([fetchDataOfUserTypesGraph(), fetchMissedJobsGraph(), jobsOverYearGraph()])
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Box className={classes.mainWrapper}>
        {!loading ? (
          <Box className={classes.gridSection}>
            <Box className={classes.chartInfo}>
              <Box className={classes.chipWrapper}>
                <Typography variant="subtitle2" className={classes.chartHeading}>
                  {t('obx.users.graph.users')}
                </Typography>
                {/* <Chip label={t('stubedData.inProgress')} size="small" color="primary" /> */}
              </Box>
              <Typography variant="h1" className={classes.dataAmount}>
                {userTypes?.stats?.total}
              </Typography>
            </Box>
            <PieChart
              heading={t('obx.users.graph.users')}
              colors={userTypes?.colors}
              data={transformDataLabels(userTypes?.data)}
              stats={userTypes?.stats}
              toolTipFormatter="{b}: {c}"
              style={{ height: '200px', width: '100%' }}
            />
          </Box>
        ) : (
          <Box className={classes.pieChartSkeletonWrapper}>
            <PieChartSkeleton title="Users" isValue={true} />
          </Box>
        )}
        {!loading ? (
          <Box className={classes.gridSection}>
            <Box className={classes.chartInfo}>
              <Box className={classes.chipWrapper}>
                <Typography variant="subtitle2" className={classes.chartHeading}>
                  {t('obx.users.graph.missedJobs')}
                </Typography>
                {/* <Chip label={t('stubedData.inProgress')} size="small" color="primary" /> */}
              </Box>
              <Typography variant="h1" className={classes.dataAmount}>
                {missRate?.stats?.total}
              </Typography>
            </Box>
            <PieChart
              heading={t('obx.users.graph.missedJobs')}
              colors={missRate?.colors}
              data={transformDataLabels(missRate?.data)}
              stats={missRate?.stats}
              toolTipFormatter="{b}: {c}"
              style={{ height: '200px', width: '100%' }}
            />
          </Box>
        ) : (
          <Box className={classes.pieChartSkeletonWrapperClient}>
            <PieChartSkeleton title="Missed Jobs" isValue={true} />
          </Box>
        )}
        {!loading ? (
          <Box className={classes.gridSectionOne}>
            <Box className={classes.chartInfo}>
              <Box
                className={classNames(
                  classes.headerBar,
                  classes.headerBarIn,
                  classes.customHeadingChart,
                )}
              >
                <Box className={classes.chipWrapper}>
                  <Typography variant="subtitle2" className={classes.chartHeadingCustom}>
                    {' '}
                    {t('obx.users.graph.jobsPerformed')}
                  </Typography>
                  {/* <Chip label={t('stubedData.inProgress')} size="small" color="primary" /> */}
                </Box>
                <Box className={classes.legendsLineChart}>
                  <Box className={classes.legendLineChart}>
                    <Box
                      className={classNames(classes.legendLineChartIndicator, classes.legendGray)}
                    />
                    <Typography variant="subtitle3" className={classes.legendLineChartText}>
                      {getLabel('terms', 'dedicated', t)}
                    </Typography>
                  </Box>
                  <Box className={classes.legendLineChart}>
                    <Box
                      className={classNames(classes.legendLineChartIndicator, classes.legendBrand)}
                    />
                    <Typography variant="subtitle3" className={classes.legendLineChartText}>
                      {getLabel('terms', 'patrol', t)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            <LineToolTouchChart
              heading={t('obx.users.graph.jobsPerformed')}
              colors={dutiesPerformed?.colors}
              data={dutiesPerformed?.data}
              dataLabels={dutiesPerformed?.dataLabels}
              stats={dutiesPerformed?.stats}
              style={{ height: '200px', width: '100%' }}
            />
          </Box>
        ) : (
          <Box className={classes.lineChartSkeletonWrapperRight}>
            <LineChartSkeleton title="Jobs Performed" />
          </Box>
        )}
      </Box>
    </>
  );
};

export default TopGraphComponent;
