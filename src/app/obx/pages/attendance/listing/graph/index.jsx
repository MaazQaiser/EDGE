import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import LineToolTouchChart from 'commonComponents/eLineToolTouchChart';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PieChart from 'src/app/components/common/ePieChart';
import LineChartSkeleton from 'src/app/components/common/skeletonLoader/lineChartSkeleton';
import PieChartSkeleton from 'src/app/components/common/skeletonLoader/pieChartSkeleton';
import { useTenantLabel } from 'src/helper/utilityHooks';
import {
  leavesGraphData,
  leavesRequestOverTheYearGraphData,
  userTypeGraphData,
} from 'src/services/attendance.services';

import { useStyles } from './graph';

const TopGraphComponent = () => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();

  const [loading, setLoading] = useState(true);

  const [attendanceTypes, setAttendanceTypes] = useState({});

  const [leaveTypes, setLeaveTypes] = useState({});

  const [leaveRequestOverTheYear, setLeaveRequestOverTheYear] = useState({});

  const fetchDataOfUserTypesGraph = async () => {
    try {
      const response = await userTypeGraphData();
      if (response?.statusCode === 200) {
        setAttendanceTypes(response?.data?.attendanceGraphData);
      }
    } catch (error) {
      /**
       * It is a catch of graph. So, we won't be showing anything
       */
    }
  };

  const fetchAbsenteesGraph = async () => {
    try {
      const response = await leavesGraphData();
      if (response?.statusCode === 200) {
        setLeaveTypes(response?.data?.leavesGraphData);
      }
    } catch (error) {
      /**
       * It is a catch of graph. So, we won't be showing anything
       */
    }
  };

  const fetchLeaveRequestOverTheYearGraph = async () => {
    try {
      const response = await leavesRequestOverTheYearGraphData();
      if (response?.statusCode === 200) {
        setLeaveRequestOverTheYear(response?.data?.yearLeavesGraph?.clientsOverTheYear);
      }
    } catch (error) {
      /**
       * It is a catch of graph. So, we won't be showing anything
       */
    }
  };

  useEffect(() => {
    Promise.all([
      fetchDataOfUserTypesGraph(),
      fetchAbsenteesGraph(),
      fetchLeaveRequestOverTheYearGraph(),
    ])
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
            <Box className={classes.chipWrapper}>
              <Typography variant="subtitle2" className={classes.chartHeading}>
                {t('obx.sitesAttendance.graph.attendanceTypes')}
              </Typography>
              {/* <Chip label={t('stubedData.inProgress')} size="small" color="primary" /> */}
            </Box>
            <Typography variant="h1" className={classes.dataAmount}>
              {attendanceTypes?.stats?.total}
            </Typography>

            <PieChart
              heading={t('obx.sitesAttendance.graph.attendanceTypes')}
              colors={attendanceTypes?.colors}
              data={attendanceTypes?.data}
              stats={attendanceTypes?.stats}
              toolTipFormatter="{b}: {c}"
              style={{ height: '200px', width: '100%' }}
            />
          </Box>
        ) : (
          <Box className={classes.pieChartSkeletonWrapper}>
            <PieChartSkeleton
              title={t('obx.sitesAttendance.graph.attendanceTypes')}
              isValue={true}
            />
          </Box>
        )}
        {!loading ? (
          <Box className={classes.gridSection}>
            <Box className={classes.chipWrapper}>
              <Typography variant="subtitle2" className={classes.chartHeading}>
                {t('obx.sitesAttendance.graph.leaves')}
              </Typography>
              {/* <Chip label={t('stubedData.inProgress')} size="small" color="primary" /> */}
            </Box>
            <Typography variant="h1" className={classes.dataAmount}>
              {leaveTypes?.stats?.total}
            </Typography>

            <PieChart
              heading={t('obx.sitesAttendance.graph.leaves')}
              colors={leaveTypes?.colors}
              data={leaveTypes?.data}
              stats={leaveTypes?.stats}
              toolTipFormatter="{b}: {c}"
              style={{ height: '200px', width: '100%' }}
            />
          </Box>
        ) : (
          <Box className={classes.pieChartSkeletonWrapperClient}>
            <PieChartSkeleton title={t('obx.sitesAttendance.graph.leaves')} isValue={true} />
          </Box>
        )}
        {!loading ? (
          <Box className={classes.gridSectionOne}>
            <Box
              className={classNames(
                classes.headerBar,
                classes.headerBarIn,
                classes.customHeadingChart,
              )}
            >
              <Box className={classes.chipWrapper}>
                <Typography variant="subtitle2" className={classes.chartHeadingBar}>
                  {t('obx.sitesAttendance.graph.noOfRequest')}
                </Typography>
                {/* <Chip label={t('stubedData.inProgress')} size="small" color="primary" /> */}
              </Box>
              <Box className={classes.legendsLineChart}>
                <Box className={classes.legendLineChart}>
                  <Box
                    className={classNames(classes.legendLineChartIndicator, classes.legendGray)}
                  />
                  <Typography variant="subtitle3" className={classes.legendLineChartText}>
                    {t('obx.sitesAttendance.graph.dedicated', {
                      dedicated: getLabel('terms', 'dedicated', t),
                    })}
                  </Typography>
                </Box>
                <Box className={classes.legendLineChart}>
                  <Box
                    className={classNames(classes.legendLineChartIndicator, classes.legendBrand)}
                  />
                  <Typography variant="subtitle3" className={classes.legendLineChartText}>
                    {t('obx.sitesAttendance.graph.petrol', {
                      patrol: getLabel('terms', 'patrol', t),
                    })}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <LineToolTouchChart
              heading={t('obx.sitesAttendance.graph.noOfRequest')}
              colors={leaveRequestOverTheYear?.colors}
              data={leaveRequestOverTheYear?.data}
              dataLabels={leaveRequestOverTheYear?.dataLabels}
              stats={leaveRequestOverTheYear?.stats}
              style={{ height: '200px', width: '100%' }}
            />
          </Box>
        ) : (
          <Box className={classes.lineChartSkeletonWrapperRight}>
            <LineChartSkeleton title={t('obx.sitesAttendance.graph.noOfRequest')} isValue={true} />
          </Box>
        )}
      </Box>
    </>
  );
};

export default TopGraphComponent;
