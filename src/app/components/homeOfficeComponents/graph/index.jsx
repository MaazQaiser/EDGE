import { Box, Button, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LineToolTouchChart from 'src/app/components/common/eLineToolTouchChart';
import { SaleList } from 'src/assets/svg';
import {
  clientGraphData,
  clientsOverTheYearGraphData,
  officerGraphData,
} from 'src/services/franchise.services';

import PieChart from '../../../components/common/ePieChart';
import LineChartSkeleton from '../../common/skeletonLoader/lineChartSkeleton';
import PieChartSkeleton from '../../common/skeletonLoader/pieChartSkeleton';
import { useStyles } from './franchiselistStyle';
const TopGraphComponent = ({ showYear = true }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [employees, setEmployees] = useState({});
  const [clients, setClients] = useState({});
  const [clientsOverTheYear, setClientsOverTheYear] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchDataOfOfficersGraph = async () => {
    try {
      const response = await officerGraphData();
      if (response?.statusCode === 200) {
        setEmployees(response?.data?.employeesGraphData);
      }
    } catch (error) {
      /**
       * It is a catch of graph. So, we won't be showing anything
       */
    }
  };

  const fetchClientsGraph = async () => {
    try {
      const response = await clientGraphData();
      if (response?.statusCode === 200) {
        // TODO: added key coming from the backend here.
        setClients(response?.data?.clientsGraphData);
      }
    } catch (error) {
      /**
       * It is a catch of graph. So, we won't be showing anything
       */
    }
  };

  const fetchClientsOverTheYearGraph = async () => {
    try {
      const response = await clientsOverTheYearGraphData();
      if (response?.statusCode === 200) {
        setClientsOverTheYear(response?.data?.clientsOverTheYear);
      }
    } catch (error) {
      /**
       * It is a catch of graph. So, we won't be showing anything
       */
    }
  };

  useEffect(() => {
    // Fetch sites graph data
    Promise.all([fetchDataOfOfficersGraph(), fetchClientsGraph(), fetchClientsOverTheYearGraph()])
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
                {t('ho.graph.officers')}
              </Typography>
              {/* <Chip label={t('stubedData.inProgress')} size="small" color="primary" /> */}
            </Box>
            <Typography variant="h1" className={classes.dataAmount}>
              {employees?.stats?.total}
            </Typography>

            <PieChart
              heading={t('ho.graph.officers')}
              colors={employees?.colors}
              data={employees?.data}
              stats={employees?.stats}
              toolTipFormatter="{b}: {c}"
              style={{ height: '200px', width: '100%' }}
            />
          </Box>
        ) : (
          <Box className={classes.pieChartSkeletonWrapper}>
            <PieChartSkeleton legendCount={2} title="Employees" isValue={true} />
          </Box>
        )}
        {!loading ? (
          <Box className={classes.gridSectionClient}>
            <Box className={classes.chipWrapper}>
              <Typography variant="subtitle2" className={classes.chartHeading}>
                {t('ho.graph.clients')}
              </Typography>
              {/* <Chip label={t('stubedData.inProgress')} size="small" color="primary" /> */}
            </Box>
            <Typography variant="h1" className={classes.dataAmount}>
              {clients?.stats?.total}
            </Typography>

            <PieChart
              heading={t('ho.graph.clients')}
              colors={clients?.colors}
              data={clients?.data}
              stats={clients?.stats}
              toolTipFormatter="{b}: {c}"
              style={{ height: '200px', width: '100%' }}
            />
          </Box>
        ) : (
          <Box className={classes.pieChartSkeletonWrapperClient}>
            <PieChartSkeleton legendCount={5} title="Clients" isValue={true} />
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
              {' '}
              <Box className={classes.chipWrapper}>
                <Typography variant="subtitle2" className={classes.chartHeading}>
                  {t('ho.graph.noOfClients')}
                </Typography>
                {/* <Chip label={t('stubedData.inProgress')} size="small" color="primary" /> */}
              </Box>
              {showYear && (
                <Button variant="tertiaryGrey" endIcon={<SaleList />}>
                  {t('ho.graph.years')}
                </Button>
              )}
            </Box>

            <LineToolTouchChart
              heading={t('ho.graph.noOfClients')}
              colors={clientsOverTheYear?.colors}
              data={clientsOverTheYear?.data}
              dataLabels={clientsOverTheYear?.dataLabels}
              stats={clientsOverTheYear?.stats}
              style={{ height: '200px', width: '100%' }}
            />
          </Box>
        ) : (
          <Box className={classes.lineChartSkeletonWrapperRight}>
            <LineChartSkeleton title="No. of Clients" />
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
