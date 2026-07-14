import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import LineToolTouchChart from 'commonComponents/eLineToolTouchChart';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import PieChart from 'src/app/components/common/ePieChart';
// import { ClientsData, SitesData } from 'src/app/components/common/pieChart/chartData';
import LineChartSkeleton from 'src/app/components/common/skeletonLoader/lineChartSkeleton';
import PieChartSkeleton from 'src/app/components/common/skeletonLoader/pieChartSkeleton';
import {
  getSiteClientsGraphData,
  getSiteClientsOverTheYearGraphData,
  getSiteGraphData,
} from 'src/services/sites.services';

import { useStyles } from './graph';
// import { Contracts } from './stubbbedData';

const TopGraphComponent = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  // const Clients = ClientsData(t);

  const [sites, setSites] = useState({});
  const [clients, setClients] = useState({});
  const [contracts, setContracts] = useState({});
  const [loading, setLoading] = useState(true);

  const franchiseId = useSelector((state) => state?.auth?.franchiseId);

  const fetchDataOfSitesGraph = async () => {
    try {
      const response = await getSiteGraphData();
      if (response?.statusCode === 200) {
        setSites(response?.data?.sitesGraphData);
      }
      setLoading(false);
    } catch (error) {
      /**
       * It is a catch of sites graph. So, we won't be showing anything
       */
    }
  };

  const fetchDataOfSitesClientsGraph = async () => {
    try {
      const response = await getSiteClientsGraphData();
      if (response?.statusCode === 200) {
        setClients(response?.data?.clientsGraphData);
      }
    } catch (error) {
      /**
       * It is a catch of sites graph. So, we won't be showing anything
       */
    }
  };

  const fetchClientsOverTheYearGraph = async () => {
    try {
      const response = await getSiteClientsOverTheYearGraphData(franchiseId);
      if (response?.statusCode === 200) {
        setContracts(response?.data?.clientsOverTheYear);
      }
    } catch (error) {
      /**
       * It is a catch of sites graph. So, we won't be showing anything
       */
    }
  };

  useEffect(() => {
    Promise.all([
      fetchDataOfSitesGraph(),
      fetchDataOfSitesClientsGraph(),
      fetchClientsOverTheYearGraph(),
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
            <Box className={classes.chartInfo}>
              <Typography variant="subtitle2" className={classes.chartHeading}>
                {t('obx.sites.graph.sites')}
              </Typography>
              <Typography variant="h1" className={classes.dataAmount}>
                {sites?.stats?.total}
              </Typography>
            </Box>
            <PieChart
              heading={t('obx.sites.graph.sites')}
              colors={sites?.colors}
              data={sites.data}
              stats={sites?.stats}
              toolTipFormatter="{b}: {c}"
              style={{ height: '200px', width: '100%' }}
            />
          </Box>
        ) : (
          <Box className={classes.pieChartSkeletonWrapper}>
            <PieChartSkeleton title={t('obx.sites.graph.sites')} isValue={true} />
          </Box>
        )}
        {!loading ? (
          <Box className={classes.gridSectionClient}>
            <Box className={classes.chartInfo}>
              <Box className={classes.chipWrapper}>
                <Typography variant="subtitle2" className={classes.chartHeading}>
                  {t('obx.sites.graph.industryVerticals')}
                </Typography>
              </Box>

              <Typography variant="h1" className={classes.dataAmount}>
                {clients?.stats?.total}
              </Typography>
            </Box>
            <PieChart
              heading={t('obx.sites.graph.clients')}
              colors={clients?.colors}
              data={clients?.data}
              stats={clients?.stats}
              toolTipFormatter="{b}: {c}"
              style={{ height: '200px', width: '100%' }}
            />
          </Box>
        ) : (
          <Box className={classes.pieChartSkeletonWrapperClient}>
            <PieChartSkeleton
              legendCount={5}
              title={t('obx.sites.graph.industryVerticals')}
              isValue={true}
            />
          </Box>
        )}
        {!loading ? (
          <Box className={classes.gridSectionOne}>
            <Box className={classes.lineChartInfo}>
              <Box
                className={classNames(
                  classes.headerBar,
                  classes.headerBarIn,
                  classes.customHeadingChart,
                )}
              >
                <Box className={classes.chipWrapper}>
                  <Typography variant="subtitle2" className={classes.chartHeadingBar}>
                    {t('obx.sites.graph.contracts')}
                  </Typography>
                  {/* <Chip label={t('stubedData.inProgress')} size="small" color="primary" /> */}
                </Box>
                <Box className={classes.legendsLineChart}>
                  <Box className={classes.legendLineChart}>
                    <Box
                      className={classNames(classes.legendLineChartIndicator, classes.legendGray)}
                    />
                    <Typography variant="subtitle3" className={classes.legendLineChartText}>
                      {t('obx.sites.graph.contracts')}
                    </Typography>
                  </Box>
                  <Box className={classes.legendLineChart}>
                    <Box
                      className={classNames(classes.legendLineChartIndicator, classes.legendBrand)}
                    />
                    <Typography variant="subtitle3" className={classes.legendLineChartText}>
                      {t('obx.sites.graph.clients')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            <LineToolTouchChart
              heading={t('obx.sites.graph.contracts')}
              colors={contracts?.colors}
              data={contracts?.data}
              dataLabels={contracts?.dataLabels}
              stats={contracts?.stats}
              style={{ height: '200px', width: '100%' }}
            />
          </Box>
        ) : (
          <Box className={classes.lineChartSkeletonWrapperRight}>
            <LineChartSkeleton title={t('obx.sites.graph.contracts')} />
          </Box>
        )}
      </Box>
    </>
  );
};

export default TopGraphComponent;
