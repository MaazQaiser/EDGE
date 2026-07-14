import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import LineToolTouchChart from 'src/app/components/common/eLineToolTouchChart';
import PieChart from 'src/app/components/common/ePieChart';
import LineChartSkeleton from 'src/app/components/common/skeletonLoader/lineChartSkeleton';
import PieChartSkeleton from 'src/app/components/common/skeletonLoader/pieChartSkeleton';

import { useStyles } from './franchiseUserlistStyle';
import { UserOverYear, Users, UsersByPost } from './stubbedData.js';

const TopGraphComponent = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { stats } = UsersByPost;

  //Temporary
  const loading = false;

  return (
    <>
      <Box className={classes.mainWrapper}>
        {!loading ? (
          <Box className={classes.gridSection}>
            <Typography variant="subtitle2" className={classes.chartHeading}>
              {t('ho.graph.users')}
            </Typography>
            <Typography variant="h1" className={classes.dataAmount}>
              {stats.total}
            </Typography>

            <PieChart
              heading={t('ho.graph.users')}
              colors={Users.colors}
              data={Users.data}
              stats={Users.stats}
              style={{ height: '200px', width: '100%' }}
              toolTipFormatter="{b}: {c}"
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
            <Typography variant="subtitle2" className={classes.chartHeading}>
              {t('ho.graph.usersByPost')}
            </Typography>
            <Typography variant="h1" className={classes.dataAmount}>
              {stats.total}
            </Typography>

            <PieChart
              heading={t('ho.graph.usersByPost')}
              colors={UsersByPost.colors}
              data={UsersByPost.data}
              stats={UsersByPost.stats}
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
              <Typography variant="subtitle2" className={classes.chartHeading}>
                {t('ho.graph.usersOverTheYear')}
              </Typography>
            </Box>

            <LineToolTouchChart
              heading={t('ho.graph.usersOverTheYear')}
              colors={UserOverYear.colors}
              data={UserOverYear.data}
              dataLabels={UserOverYear.dataLabels}
              stats={UserOverYear.stats}
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

TopGraphComponent.propTypes = {
  showYear: PropTypes.bool,
};

export default TopGraphComponent;
