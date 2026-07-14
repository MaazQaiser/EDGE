import { Skeleton, Tooltip, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import sitePlaceHolderImage from 'assets/svg/Site-Placeholder.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import TableAccordion from 'src/app/obx/pages/sites/detail/components/tableAccordion';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { SHIFT_TIME_OPTIONS, STATUS_FILTER_DATA_DISPATCH } from '../../../dispatch.constant';
import Jobs from '../jobs';
import { useStyles } from './AssignDispactchTabs';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const AssignDispactchTabs = ({
  jobs,
  selectedJob,
  officers,
  selectedOfficers,
  minutes,
  selectedTab,
  loading,
  queryParams,
  handleOfficerChange,
  handleShiftChange,
  handleJobChange,
  handleTabChange,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const officersOptions = officers.map((officer) => ({
    label: officer.name,
    value: officer.id,
    image: officer.image || sitePlaceHolderImage,
  }));

  const renderAccordionHeader = (data) => {
    // const isStatusActive = data?.status === 'active';
    // const status = contractStatusEnum[data?.status];
    return (
      <Box className={classes.accordianWrapper}>
        <Tooltip
          title={data?.title.length >= 40 ? data?.title : ''}
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
            },
          }}
        >
          <Box className={classes.titleWrapper}>
            <Typography variant="subtitle2" className={classes.Title}>
              {data?.title.length >= 40 ? (
                <>{data?.title.substring(0, 25) + '...'}</>
              ) : (
                <>{data?.title}</>
              )}
            </Typography>

            <Typography variant="subtitle2" className={classes.totalCount}>
              ({data?.totalCount})
            </Typography>
          </Box>
        </Tooltip>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }} className={classNames(classes.tabWrapper, 'innerScrollBar')}>
      <Typography variant="h3" className={classes.assignDispatchHeading}>
        {t('obx.dispatch.assignDispatch', { dispatch: getLabel('terms', 'dispatch', t) })}
      </Typography>
      <Box className={classes.tabBarWrap}>
        <Box className={classes.tabsLabesl}>
          <Typography>Jobs:</Typography>
          <Box className={classes.payrollTabButtonTops}>
            <Tabs
              value={selectedTab}
              onChange={(_, value) => handleTabChange(value)}
              aria-label="basic tabs example"
            >
              <Tab label={t('obx.dispatch.timeElapsedOptions.all')} {...a11yProps(0)} />
              <Tab
                label={t('obx.dashboard.dedicated', {
                  dedicated: getLabel('terms', 'dedicated', t),
                })}
                {...a11yProps(1)}
              />
              <Tab
                label={t('obx.dashboard.patrol', { patrol: getLabel('terms', 'patrol', t) })}
                {...a11yProps(2)}
              />
              <Tab label={t('obx.payroll.users')} {...a11yProps(3)} />
            </Tabs>
          </Box>
        </Box>
        <Box className={classes.dropdownWrapper}>
          <CustomDropDown
            label={t('obx.schedules.filters.status.label')}
            name="status"
            options={STATUS_FILTER_DATA_DISPATCH(t).filter(
              (option) => !option.hideOptionsForTabs?.includes(selectedTab),
            )}
            selectedValues={queryParams?.status}
            handleChange={handleShiftChange}
            multiSelect={true}
            checkmark={true}
            clearAll
            bordered={false}
          />
          {selectedTab !== 3 && (
            <CustomDropDown
              label={t('obx.dispatch.shiftTime.dropdownLabel')}
              name="minutes"
              options={SHIFT_TIME_OPTIONS(t)}
              selectedValues={minutes || SHIFT_TIME_OPTIONS(t)?.[0]?.value}
              handleChange={handleShiftChange}
            />
          )}
          <CustomDropDown
            label={`All ${getLabel('terms', 'officers', t)}`}
            name="officerIds"
            searchable={true}
            options={officersOptions}
            selectedValues={selectedOfficers || []}
            multiSelect={true}
            clearAll={true}
            checkmark={true}
            handleChange={handleOfficerChange}
            disabled={selectedTab === 3}
          />
        </Box>
      </Box>

      {loading ? (
        <Box>
          <Box className={classes.skeletonWrapper}>
            <Skeleton variant="rounded" width={150} height={18} />
            <Skeleton variant="rounded" width={'100%'} height={74} />
            <Skeleton variant="rounded" width={'100%'} height={74} />
          </Box>
          <Box className={classes.skeletonWrapper}>
            <Skeleton variant="rounded" width={150} height={18} />
            <Skeleton variant="rounded" width={'100%'} height={74} />
            <Skeleton variant="rounded" width={'100%'} height={74} />
            <Skeleton variant="rounded" width={'100%'} height={74} />
          </Box>
        </Box>
      ) : (
        // ) : showSupervisorList ? (
        //   <> </>
        <Box className={classes.accordionWrapper}>
          {(selectedTab === 0 || selectedTab === 1) && (
            <TableAccordion
              // key={key}
              className={classes.accordion}
              accordionNo={0}
              header={renderAccordionHeader({
                title: t('obx.dispatch.dedicatedJobs', {
                  dedicated: getLabel('terms', 'dedicated', t),
                }),
                totalCount: jobs?.dedicatedJobs?.length,
              })}
              // title={a?.title}
            >
              <Jobs
                jobs={jobs?.dedicatedJobs}
                selectedJob={selectedJob}
                handleJobChange={handleJobChange}
                type="dedicated"
              />
            </TableAccordion>
          )}
          {(selectedTab === 0 || selectedTab === 2) && (
            <TableAccordion
              // key={key}
              accordionNo={0}
              header={renderAccordionHeader({
                title: t('obx.dispatch.patrolJobs', {
                  patrol: getLabel('terms', 'patrol', t),
                  runsheets: getLabel('terms', 'runsheets', t),
                }),
                totalCount: jobs?.patrolJobs?.length,
              })}
              // title={a?.title}
            >
              <Jobs
                jobs={jobs?.patrolJobs}
                selectedJob={selectedJob}
                handleJobChange={handleJobChange}
                type="patrol"
              />
            </TableAccordion>
          )}
          {(selectedTab === 0 || selectedTab === 3) && (
            <TableAccordion
              // key={key}
              accordionNo={0}
              header={renderAccordionHeader({
                title: t('obx.dispatch.users'),
                totalCount: jobs?.patrolSupervisors?.length,
              })}
            >
              <Jobs
                jobs={jobs?.patrolSupervisors}
                selectedJob={selectedJob}
                handleJobChange={handleJobChange}
                type="patrolSupervisors"
              />
            </TableAccordion>
          )}
        </Box>
      )}
    </Box>
  );
};

AssignDispactchTabs.propTypes = {
  jobs: PropTypes.object,
  selectedJob: PropTypes.object,
  officers: PropTypes.array,
  selectedOfficers: PropTypes.array,
  minutes: PropTypes.object,
  selectedTab: PropTypes.string,
  loading: PropTypes.bool,
  showSupervisorList: PropTypes.bool,
  handleOfficerChange: PropTypes.func,
  handleShiftChange: PropTypes.func,
  handleJobChange: PropTypes.func,
  handleTabChange: PropTypes.func,
  queryParams: PropTypes.object,
};

export default AssignDispactchTabs;
