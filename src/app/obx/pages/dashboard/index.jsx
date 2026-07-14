import { Box, Link, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { ReactComponent as ToolTipIcon } from 'assets/icons/info.svg?react';
import { ReactComponent as ChevronRightIcon } from 'assets/icons/rightArrow.svg?react';
import classNames from 'classnames';
import LineChartSkeleton from 'commonComponents/skeletonLoader/lineChartSkeleton';
import PieChartSkeleton from 'commonComponents/skeletonLoader/pieChartSkeleton';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  getAdditionalServicesStats,
  getContractRevenue,
  getEfficiencyStats,
  getFranchiseKeyMetrics,
  getIndustryVerticalStats,
  getJobNotStarted,
  getJobWeekStats,
  getKeyMetricsStats,
  getLiveOperationStats,
  getNonFunctionalSitesServicesStats,
  getTopSitesByRevenue,
} from 'services/dashboard.service';
import BasicAreaChart from 'src/app/components/common/eBasicAreaChart/index.jsx';
import OfficerBarChart from 'src/app/components/common/foOfficeBarChart/index.jsx';
import DateRangePicker from 'src/app/components/common/RangeDatepicker';
import {
  appendDefaultStartAndEndTimeWithDates,
  dayjsWithStandardOffset,
} from 'src/app/obx/pages/schedules/helper';
import { OBX_SCHEDULES } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { mainDomain } from 'src/helper/utilityFunctions';
import { getDispatchStats } from 'src/services/dispatch.services';
import { paginationOptions } from 'src/utils/constants';
import { MULTI_TENANT_AUTH } from 'src/utils/constants/multiTanentAuthInfo';
import capitalize from 'src/utils/string/capitalize';

import { useTenantLabel } from '../../../../helper/utilityHooks';
import PieChart from '../../../components/common/ePieChart';
import JobEfficiency from './components/jobEfficiency/index.jsx';
import KeyMatrics from './components/keyMatrics/index.jsx';
import LiveOperations from './components/liveOperations/index.jsx';
import OfficersOnDuty from './components/officersOnDuty/index.jsx';
import OfficersOnDutySkeleton from './components/officersOnDuty/officersOnDutySkeleton';
import { useStyles } from './dashboardStyles.js';

const today = dayjsWithStandardOffset();
const startDate = dayjsWithStandardOffset().subtract(59, 'days');

const params = {
  selectedDates: [startDate, today],
};

export default function Dashboard() {
  const classes = useStyles();
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState('dedicated');
  const userInfo = useSelector((state) => state.user.info);
  const [queryParams, setQueryParams] = useState(params);
  const tenantInfo = MULTI_TENANT_AUTH[mainDomain()];
  const { getLabel } = useTenantLabel();

  const [graphs, setGraphs] = useState({
    contractRevenue: {},
    topSitedByRevenue: [],
    industryVerticalStats: {},
    keyMetricStats: [],
    jobEfficiencyStats: {},
    liveOperationStats: {},
    jobWeekStats: {},
    jobNotFoundStats: [],
    additionalServiceStats: [],
    franchiseKeyMetrics: [],
  });

  const [loading, setLoading] = useState({
    contractRevenueLoading: false,
    topSitedByRevenueLoading: false,
    industryVerticalStatsLoading: false,
    keyMetricStatsLoading: false,
    jobEfficiencyStatsLoading: false,
    liveOperationStatsLoading: false,
    jobWeekStatsLoading: false,
    jobNotFoundStatsLoading: false,
    additionalServiceStatsLoading: false,
  });

  const changeLoadingState = (name, status) => {
    setLoading((data) => {
      return {
        ...data,
        [name]: status,
      };
    });
  };

  const fetchContractRevenue = async (queryParams) => {
    changeLoadingState('contractRevenueLoading', true);

    try {
      const response = await getContractRevenue({
        startDate: queryParams.selectedDates[0].format('YYYY-MM-DD'),
        endDate: queryParams.selectedDates[1].format('YYYY-MM-DD'),
      });
      if (response?.statusCode === 200) {
        const dataContract = response.data.contractRevenueStats;
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          contractRevenue: {
            data: dataContract.data,
            colors: dataContract.colors,
            total: dataContract.stats.contractsCount,
          },
        }));
      }

      changeLoadingState('contractRevenueLoading', false);
    } catch (error) {
      changeLoadingState('contractRevenueLoading', false);
    }
  };

  const fetchTopSitesByRevenue = async () => {
    changeLoadingState('topSitedByRevenueLoading', true);

    try {
      const response = await getTopSitesByRevenue();
      if (response?.statusCode === 200) {
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          topSitedByRevenue: response?.data?.sites,
        }));
      }

      changeLoadingState('topSitedByRevenueLoading', false);
    } catch (error) {
      changeLoadingState('topSitedByRevenueLoading', false);
    }
  };

  const fetchIndustryVerticalStats = async () => {
    changeLoadingState('industryVerticalStatsLoading', true);

    try {
      const response = await getIndustryVerticalStats();
      if (response?.statusCode === 200) {
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          industryVerticalStats: response?.data?.industryVerticalsStats,
        }));
      }

      changeLoadingState('industryVerticalStatsLoading', false);
    } catch (error) {
      changeLoadingState('industryVerticalStatsLoading', false);
    }
  };

  const fetchKeyMetricsStats = async (queryParams) => {
    changeLoadingState('keyMetricStatsLoading', true);

    try {
      const convertedDates = queryParams?.selectedDates?.length
        ? appendDefaultStartAndEndTimeWithDates(queryParams?.selectedDates)
        : [];

      const [keyMetricsResp, franchiseKeyMetricsResp] = await Promise.allSettled([
        getKeyMetricsStats({
          windowStart: queryParams.selectedDates?.[0] ? convertedDates?.[0] : '',
          windowEnd: queryParams.selectedDates?.[1] ? convertedDates?.[1] : '',
        }),
        getFranchiseKeyMetrics({
          windowStart: queryParams.selectedDates?.[0] ? convertedDates?.[0] : '',
          windowEnd: queryParams.selectedDates?.[1] ? convertedDates?.[1] : '',
        }),
      ]);
      if (
        keyMetricsResp?.value?.statusCode === 200 &&
        franchiseKeyMetricsResp?.value?.statusCode === 200
      ) {
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          keyMetricStats: keyMetricsResp?.value?.data?.keyMetricsStats,
          franchiseKeyMetrics: franchiseKeyMetricsResp?.value?.data?.keyMetricsStats,
        }));
      }

      changeLoadingState('keyMetricStatsLoading', false);
    } catch (error) {
      changeLoadingState('keyMetricStatsLoading', false);
    }
  };

  const fetchEfficiencyStats = async (queryParams) => {
    changeLoadingState('jobEfficiencyStatsLoading', true);

    try {
      const convertedDates = queryParams?.selectedDates?.length
        ? appendDefaultStartAndEndTimeWithDates(queryParams?.selectedDates)
        : [];
      const response = await getEfficiencyStats({
        windowStart: queryParams.selectedDates?.[0] ? convertedDates?.[0] : '',
        windowEnd: queryParams.selectedDates?.[1] ? convertedDates?.[1] : '',
      });
      if (response?.statusCode === 200) {
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          jobEfficiencyStats: response?.data?.efficiencyStats,
        }));
      }

      changeLoadingState('jobEfficiencyStatsLoading', false);
    } catch (error) {
      changeLoadingState('jobEfficiencyStatsLoading', false);
    }
  };

  const fetchLiveOperationStats = async (queryParams) => {
    changeLoadingState('liveOperationStatsLoading', true);

    try {
      const [liveOpsRes, nonFuncSitesResp, dispatchAlarmResp] = await Promise.allSettled([
        getLiveOperationStats(queryParams),
        getNonFunctionalSitesServicesStats(),
        getDispatchStats(),
      ]);

      let liveOpsData =
        liveOpsRes.status === 'fulfilled' && liveOpsRes.value?.statusCode === 200
          ? liveOpsRes.value?.data?.liveOperations
          : null;

      if (liveOpsData && dispatchAlarmResp?.value?.statusCode === 200) {
        const newAlarms = dispatchAlarmResp.value?.data?.stats?.newAlarms;
        if (newAlarms !== undefined) {
          liveOpsData.dispatchNewAlarms = {
            ...liveOpsData.dispatchNewAlarms,
            value: newAlarms,
          };
        }
      }

      const nonFuncData = liveOpsData
        ? {
            name: 'Non-functional Sites',
            textColour: '#5B5B5F',
            value: nonFuncSitesResp?.value?.data?.liveOperationsStats?.nonFunctionalSites || 0,
            valueColour: '#B32318',
          }
        : null;

      const finalData = nonFuncData
        ? { ...liveOpsData, nonFunctionalSites: nonFuncData }
        : liveOpsData;

      setGraphs((prev) => ({
        ...prev,
        liveOperationStats: finalData,
      }));
      changeLoadingState('liveOperationStatsLoading', false);
    } catch (error) {
      changeLoadingState('liveOperationStatsLoading', false);
    }
  };

  const fetchJobWeekStats = async () => {
    changeLoadingState('jobWeekStatsLoading', true);

    try {
      const response = await getJobWeekStats({
        shiftType: selectedTab,
      });
      if (response?.statusCode === 200) {
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          jobWeekStats: response?.data,
        }));
      }

      changeLoadingState('jobWeekStatsLoading', false);
    } catch (error) {
      changeLoadingState('jobWeekStatsLoading', false);
    }
  };

  const fetchJobNotStarted = async () => {
    changeLoadingState('jobNotFoundStatsLoading', true);

    try {
      const response = await getJobNotStarted();
      if (response?.statusCode === 200) {
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          jobNotFoundStats: response?.data?.shifts || [],
        }));
      }

      changeLoadingState('jobNotFoundStatsLoading', false);
    } catch (error) {
      changeLoadingState('jobNotFoundStatsLoading', false);
    }
  };

  const fetchAdditionalServicesStats = async (queryParams) => {
    changeLoadingState('additionalServiceStatsLoading', true);

    try {
      const convertedDates = queryParams?.selectedDates?.length
        ? appendDefaultStartAndEndTimeWithDates(queryParams?.selectedDates)
        : [];

      const response = await getAdditionalServicesStats({
        windowStart: queryParams.selectedDates?.[0] ? convertedDates?.[0] : '',
        windowEnd: queryParams.selectedDates?.[1] ? convertedDates?.[1] : '',
      });
      if (response?.statusCode === 200) {
        setGraphs((prevGraphs) => ({
          ...prevGraphs,
          additionalServiceStats: response?.data?.additionalServicesStats,
        }));
      }

      changeLoadingState('additionalServiceStatsLoading', false);
    } catch (error) {
      changeLoadingState('additionalServiceStatsLoading', false);
    }
  };

  const handleSelection = (event, newSelection) => {
    if (newSelection !== null) {
      setSelectedTab(newSelection);
    }
  };

  const callDashboardApisOnParamsChange = (queryParams) => {
    fetchContractRevenue(queryParams);
    fetchKeyMetricsStats(queryParams);
    fetchEfficiencyStats(queryParams);
    fetchAdditionalServicesStats(queryParams);
  };

  useEffect(() => {
    callDashboardApisOnParamsChange(queryParams);
    fetchTopSitesByRevenue();
    fetchIndustryVerticalStats();
    fetchLiveOperationStats();
    fetchJobNotStarted();
  }, []);

  useEffect(() => {
    fetchJobWeekStats();
  }, [selectedTab]);

  return (
    <Box className={classes.dashboardsales}>
      <Box className={classes.dashboarMian}>
        <Box className={classes.leftSec}>
          {/* header  */}
          <Box className={classes.saleDashHeader}>
            <Box className={classes.headText}>
              <Typography variant="h2" className={classes.subTitle}>
                {t('obx.dashboard.hi')} {userInfo.name},{' '}
                {t('obx.dashboard.welcome', { signal: capitalize(tenantInfo?.name) })}
              </Typography>
              <Typography variant="info" className={classes.welcomSubtext}>
                {t('obx.dashboard.welcomeSubtext')}
              </Typography>
            </Box>

            <Box className={classes.salesCustomDropdown}>
              <DateRangePicker
                selectedDates={queryParams?.selectedDates}
                setDates={(dates) => {
                  setQueryParams((prevState) => {
                    const newParams = {
                      ...prevState,
                      page: paginationOptions.defaultPerPage,
                      selectedDates: dates,
                    };
                    callDashboardApisOnParamsChange(newParams);
                    return newParams;
                  });
                }}
              />
            </Box>
          </Box>
          {/* row 1 */}
          <Box className={classes.keyMian}>
            <KeyMatrics
              data={graphs?.keyMetricStats}
              isLoading={loading.keyMetricStatsLoading}
              franchiseKeyMetrics={graphs?.franchiseKeyMetrics}
            />
          </Box>
          {/* "row 2" */}
          <Box className={classes.mainclass}>
            <Box className={classes.borderBottom}>
              {/* pie chart  */}
              <Box item xs={6} md={6} lg={4} className={classes.border}>
                {loading?.contractRevenueLoading ? (
                  <Box className={classes.gridBox}>
                    <PieChartSkeleton legendCount={3} title={t('obx.dashboard.totalContracts')} />
                  </Box>
                ) : (
                  <Box className={classes.gridBox}>
                    <Box className={classes.headerWrapper}>
                      <Typography className={classes.mainTitle}>
                        {t('obx.dashboard.totalContracts')}
                        <Tooltip
                          arrow
                          slotProps={{
                            popper: {
                              modifiers: [
                                {
                                  name: 'offset',
                                  options: {
                                    offset: [18, -14],
                                  },
                                },
                              ],
                              sx: { cursor: 'pointer' },
                            },
                          }}
                          title={
                            <Box className={classes.tootlipWrapper}>
                              <Typography
                                variant="subtitle3"
                                component={'li'}
                                className={classes.tooltipStyle}
                              >
                                <b>{t('obx.dashboard.active')}</b>{' '}
                                {t('obx.dashboard.contractStatsInfo')}
                              </Typography>

                              <Typography
                                component={'li'}
                                variant="subtitle3"
                                className={classes.tooltipStyle}
                              >
                                <b>{t('obx.dashboard.terminated')}</b>
                                {t('obx.dashboard.terminatedInfo')}
                              </Typography>
                              <Typography
                                component={'li'}
                                variant="subtitle3"
                                className={classes.tooltipStyle}
                              >
                                <b>{t('obx.dashboard.expired')}</b>
                                {t('obx.dashboard.expiredInfo')}
                              </Typography>
                            </Box>
                          }
                          slots={<Box />}
                          placement="bottom"
                        >
                          <ToolTipIcon />
                        </Tooltip>
                      </Typography>
                    </Box>
                    <PieChart
                      colors={graphs?.contractRevenue?.colors}
                      data={graphs?.contractRevenue?.data}
                      stats={graphs?.contractRevenue?.total}
                      className={classes.chartWrapper}
                      toolTipFormatter="{b}: {c}%"
                      legedFormatter="%"
                      style={{ height: '200px', width: '100%' }}
                      legendStyle={{
                        icon: 'rect',
                        itemWidth: 12,
                        itemHeight: 12,
                        textStyle: {
                          fontSize: 12,
                          color: '#86868B',
                          fontWeight: 500,
                          lineHeight: 16,
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
              {/* key matrics? */}
              <Box className={classes.border}>
                <Box className={classes.gridBox}>
                  <Box className={classes.headerWrapper}>
                    <Typography className={classes.mainTitle}>
                      {t('obx.dashboard.additionalServices')}
                      <Tooltip
                        arrow
                        slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, -14],
                                },
                              },
                            ],
                            sx: { cursor: 'pointer' },
                          },
                        }}
                        title={
                          <Box className={classes.tootlipWrapper}>
                            <Typography variant="subtitle3" className={classes.tooltipStyle}>
                              {t('obx.dashboard.extraJobDispatchCount', {
                                dispatch: getLabel('terms', 'dispatch', t),
                                extra: getLabel('terms', 'extra', t),
                              })}
                            </Typography>
                          </Box>
                        }
                        slots={<Box />}
                        placement="bottom"
                      >
                        <ToolTipIcon />
                      </Tooltip>
                    </Typography>
                  </Box>
                  <OfficerBarChart
                    data={graphs?.additionalServiceStats}
                    style={{ height: '200px', width: '100%' }}
                  />
                </Box>
              </Box>
              {/* barchart? */}
              <Box className={classes.border}>
                <Box className={classes.gridBox}>
                  <Box className={classes.headerWrapper}>
                    <Typography className={classes.mainTitle}>
                      {t('obx.dashboard.jobEfficiency')}
                      <Tooltip
                        arrow
                        slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [18, -14],
                                },
                              },
                            ],
                            sx: { cursor: 'pointer' },
                          },
                        }}
                        title={
                          <Box className={classes.tootlipWrapper}>
                            <Typography variant="subtitle3" className={classes.tooltipStyle}>
                              {t('obx.dashboard.efficiencyRateDesc')}
                            </Typography>
                            <br></br>
                            <Typography
                              component={'li'}
                              variant="subtitle3"
                              className={classes.tooltipStyle}
                            >
                              <b>{getLabel('terms', 'dedicated', t)} Efficiency:</b>
                              {t('obx.dashboard.dedicatedEfficiencyInfo')}
                            </Typography>
                            <Typography
                              component={'li'}
                              variant="subtitle3"
                              className={classes.tooltipStyle}
                            >
                              <b>{getLabel('terms', 'patrol', t)} Efficiency:</b>
                              {t('obx.dashboard.patrolEfficiencyInfo', {
                                hits: getLabel('terms', 'hits', t),
                              })}
                            </Typography>
                          </Box>
                        }
                        slots={<Box />}
                        placement="bottom"
                      >
                        <ToolTipIcon />
                      </Tooltip>
                    </Typography>
                  </Box>
                  <JobEfficiency data={graphs?.jobEfficiencyStats} />
                </Box>
              </Box>
            </Box>
            <Box className={classes.fullwidth}>
              {loading?.jobWeekStatsLoading ? (
                <Box className={classes.gridBox}>
                  <LineChartSkeleton
                    title={`${t('obx.dashboard.jobCompletion')}${t('obx.dashboard.lastSevenDays')}`}
                  />
                </Box>
              ) : (
                <Box className={classes.gridBox}>
                  <Box className={classes.visitChartInfo}>
                    <Box className={classes.chipWrapper}>
                      <Typography className={classes.mainTitle}>
                        {t('obx.dashboard.jobCompletion')}
                        <span className={classes.lastSevenDays}>
                          {t('obx.dashboard.lastSevenDays')}
                        </span>
                        <Tooltip
                          arrow
                          slotProps={{
                            popper: {
                              modifiers: [
                                {
                                  name: 'offset',
                                  options: {
                                    offset: [18, -14],
                                  },
                                },
                              ],
                              sx: { cursor: 'pointer' },
                            },
                          }}
                          title={
                            <Box className={classes.tootlipWrapper}>
                              <Typography variant="subtitle3" className={classes.tooltipStyle}>
                                {t('obx.dashboard.jobCompletitionSevenDays')}
                              </Typography>
                              <br></br>
                              <Typography variant="subtitle3" className={classes.tooltipStyle}>
                                <b>{getLabel('terms', 'dedicated', t)}</b>
                              </Typography>
                              <Typography
                                component={'li'}
                                variant="subtitle3"
                                className={classes.tooltipStyle}
                              >
                                {t('obx.dashboard.completedHoursInfo')}
                              </Typography>
                              <Typography
                                component={'li'}
                                variant="subtitle3"
                                className={classes.tooltipStyle}
                              >
                                {t('obx.dashboard.missedHoursInfo')}
                              </Typography>
                              <br></br>
                              <Typography variant="subtitle3" className={classes.tooltipStyle}>
                                <b>{getLabel('terms', 'patrol', t)}</b>
                              </Typography>
                              <Typography
                                component={'li'}
                                variant="subtitle3"
                                className={classes.tooltipStyle}
                              >
                                {t('obx.dashboard.actualHitsInfo', {
                                  hits: getLabel('terms', 'hits', t),
                                  officer: getLabel('terms', 'officer', t)?.toLowerCase(),
                                })}
                              </Typography>
                              <Typography
                                component={'li'}
                                variant="subtitle3"
                                className={classes.tooltipStyle}
                              >
                                {t('obx.dashboard.missedHitsInfo', {
                                  hits: getLabel('terms', 'hits', t),
                                })}
                              </Typography>
                            </Box>
                          }
                          slots={<Box />}
                          placement="bottom"
                        >
                          <ToolTipIcon />
                        </Tooltip>
                      </Typography>
                      <ToggleButtonGroup
                        value={selectedTab}
                        className={classes.statesButtons}
                        exclusive
                        onChange={handleSelection}
                        aria-label="toggle button tabs"
                      >
                        <ToggleButton
                          value="dedicated"
                          aria-label="tab 1"
                          className={classes.firstButton}
                        >
                          {getLabel('terms', 'dedicated', t)}
                        </ToggleButton>
                        <ToggleButton
                          value="patrol"
                          aria-label="tab 2"
                          className={classes.lastButton}
                        >
                          {getLabel('terms', 'patrol', t)}
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    {selectedTab === 'dedicated' && (
                      <>
                        <BasicAreaChart
                          series={[
                            {
                              name: t('obx.dashboard.completedHours'),
                              data: graphs?.jobWeekStats?.completedJobs,
                              type: 'line',
                              color: '#146DFF',
                              symbolSize: 0,
                              smooth: false,
                              emphasis: false,
                              tooltip: ['Expenses'],
                            },
                            {
                              name: t('obx.dashboard.missedHours'),
                              data: graphs?.jobWeekStats?.missedJobs,
                              type: 'line',
                              color: ' #F4780B',
                              symbolSize: 0,
                              smooth: false,
                              emphasis: false,
                            },
                          ]}
                          xAxisData={graphs?.jobWeekStats?.weekDays}
                          style={{ height: '240px', width: '100%' }}
                        />
                        <Box className={classes.officersScedule}>
                          <Box className={classes.legendsLineChart}>
                            <Box className={classes.legendLineChart}>
                              <Box
                                className={classNames(
                                  classes.legendLineChartIndicator,
                                  classes.legendPrimary,
                                )}
                              />
                              <Typography
                                variant="subtitle3"
                                className={classes.legendLineChartText}
                              >
                                {t('obx.dashboard.completedHours')}
                              </Typography>
                            </Box>
                            <Box className={classes.legendLineChart}>
                              <Box
                                className={classNames(
                                  classes.legendLineChartIndicator,
                                  classes.legendWarning,
                                )}
                              />
                              <Typography
                                variant="subtitle3"
                                className={classes.legendLineChartText}
                              >
                                {t('obx.dashboard.missedHours')}
                              </Typography>
                            </Box>
                          </Box>
                          <Link
                            onClick={() => history.push(OBX_SCHEDULES)}
                            underline="none"
                            variant="body3"
                            className={classes.linkStyle}
                          >
                            {t('obx.dashboard.schedule')} <ChevronRightIcon />
                          </Link>
                        </Box>
                      </>
                    )}
                    {selectedTab === 'patrol' && (
                      <>
                        <BasicAreaChart
                          series={[
                            {
                              name: t('obx.dashboard.actualHits', {
                                hits: getLabel('terms', 'hits', t),
                              }),
                              data: graphs?.jobWeekStats?.completedJobs,
                              type: 'line',
                              color: '#146DFF',
                              symbolSize: 0,
                              smooth: false,
                              emphasis: false,
                              tooltip: ['Expenses'],
                            },
                            {
                              name: t('obx.dashboard.missedHits', {
                                hits: getLabel('terms', 'hits', t),
                              }),
                              data: graphs?.jobWeekStats?.missedJobs,
                              type: 'line',
                              color: ' #F4780B',
                              symbolSize: 0,
                              smooth: false,
                              emphasis: false,
                            },
                          ]}
                          xAxisData={graphs?.jobWeekStats?.weekDays}
                          style={{ height: '240px', width: '100%' }}
                        />
                        <Box className={classes.officersScedule}>
                          <Box className={classes.legendsLineChart}>
                            <Box className={classes.legendLineChart}>
                              <Box
                                className={classNames(
                                  classes.legendLineChartIndicator,
                                  classes.legendPrimary,
                                )}
                              />
                              <Typography
                                variant="subtitle3"
                                className={classes.legendLineChartText}
                              >
                                {t('obx.dashboard.actualHits', {
                                  hits: getLabel('terms', 'hits', t),
                                })}
                              </Typography>
                            </Box>
                            <Box className={classes.legendLineChart}>
                              <Box
                                className={classNames(
                                  classes.legendLineChartIndicator,
                                  classes.legendWarning,
                                )}
                              />
                              <Typography
                                variant="subtitle3"
                                className={classes.legendLineChartText}
                              >
                                {t('obx.dashboard.missedHits', {
                                  hits: getLabel('terms', 'hits', t),
                                })}
                              </Typography>
                            </Box>
                          </Box>
                          <Link
                            onClick={() => history.push(OBX_SCHEDULES)}
                            underline="none"
                            variant="body3"
                            className={classes.linkStyle}
                          >
                            {t('obx.dashboard.insights')} <ChevronRightIcon />
                          </Link>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        {/* right grid */}
        <Box className={classes.rightSec}>
          <Box className={classes.gridBoxs}>
            <Box className={`${classes.chartInfo} ${classes.borderBottoms}`} pb={3}>
              <LiveOperations
                data={graphs.liveOperationStats}
                isLoading={loading.liveOperationStatsLoading}
              />
            </Box>
            <Box pt={3} className={classes.uperMian}>
              <Box className={classes.linkWrapper}>
                <Typography className={classes.mainTitle}>
                  {t('obx.dashboard.jobsNotStarted')} • {graphs?.jobNotFoundStats?.length || 0}
                  <Tooltip
                    arrow
                    slotProps={{
                      popper: {
                        modifiers: [
                          {
                            name: 'offset',
                            options: {
                              offset: [18, -14],
                            },
                          },
                        ],
                        sx: { cursor: 'pointer' },
                      },
                    }}
                    title={
                      <Box className={classes.tootlipWrapper}>
                        <Typography variant="subtitle3" className={classes.tooltipStyle}>
                          {t('obx.dashboard.listOfficersInfo', {
                            officers: getLabel('terms', 'officers', t),
                          })}
                        </Typography>
                      </Box>
                    }
                    slots={<Box />}
                    placement="bottom"
                  >
                    <ToolTipIcon />
                  </Tooltip>
                </Typography>
                <Link
                  onClick={() => history.push(OBX_SCHEDULES)}
                  underline="none"
                  variant="body3"
                  className={classes.linkStyle}
                >
                  {t('obx.dashboard.schedule')} <ChevronRightIcon />
                </Link>
              </Box>
              {loading?.jobNotFoundStatsLoading ? (
                <OfficersOnDutySkeleton />
              ) : (
                <OfficersOnDuty
                  officers={graphs.jobNotFoundStats}
                  isLoading={loading.jobNotFoundStatsLoading}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
