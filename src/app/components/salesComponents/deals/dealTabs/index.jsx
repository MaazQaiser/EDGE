import { Skeleton } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Fragment, lazy, Suspense } from 'react';
import { propTypes } from 'react-bootstrap/esm/Image';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CustomTabPanel from 'src/app/components/common/customTabPanel';
import ActivityBarSkeleton from 'src/app/components/common/skeletonLoader/activityBarSkeleton';
import { SALES_LOCATION } from 'src/app/router/constant/ROUTE';

import { useStyles } from './tabs';

const Activity = lazy(() => import('salesComponents/companies/activity'));
const DateBar = lazy(() => import('salesComponents/companies/dateBar'));
const Notes = lazy(() => import('salesComponents/companies/notes'));
const DealContract = lazy(() => import('salesComponents/deals/dealContract'));
const ContractEmptyState = lazy(() => import('salesComponents/deals/emptyContract'));
const NotesEmptyState = lazy(() => import('../../components/notesEmpty'));
const HubSpotContract = lazy(() => import('../dealContract/hubSpotContract'));

const a11yProps = (index) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};
const DealTabs = ({
  dealId,
  updateNote,
  fetchActivities,
  fetchNotes,
  activities = [],
  activitiesLoading,
  notes = [],
  notesLoading,
  getOnDelete,
  setValue,
  value,
  data,
  setData,
  handleShowContractForm,
  contractLoading,
  openModalCloseDeal,
  isDealClosed,
  contractData,
  setContractData,
  hasContract = false,
  isFetchingDealDetails,
  isFetchingContractDetails,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const handleChange = (event, newValue) => {
    setValue(newValue); // Update 'value' when the tab changes
    if (newValue === 1) fetchActivities(dealId);
    if (newValue === 2) fetchNotes();
  };

  const handleLocationRedirection = () => {
    const locationId = data?.location?.id;
    if (locationId) history.push(`${SALES_LOCATION}/${locationId}`);
  };

  const classes = useStyles();

  return (
    <Box sx={{ width: '100%' }} className={classes.tabArea}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          className={classes.tabsBtnWrapper}
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          {/* <Tab
            className={classes.tabBtn}
            disableRipple
            label={`${t('sales.deals.relevantQuestions')}`}
            {...a11yProps(0)}
          /> */}
          <Tab
            className={classes.tabBtn}
            disableRipple
            label={`${t('sales.deals.contractTerms')}`}
            {...a11yProps(0)}
          />
          <Tab
            className={classes.tabBtn}
            disableRipple
            label={`${t('sales.companies.activity')}`}
            {...a11yProps(1)}
          />
          <Tab
            className={classes.tabBtn}
            disableRipple
            label={`${t('sales.companies.notes')}`}
            {...a11yProps(2)}
          />
        </Tabs>
      </Box>
      {!contractLoading && (
        <CustomTabPanel
          value={value}
          index={0}
          className={classNames(value === 0 && classes.overviewTabs, 'innerScrollBar')}
        >
          {isFetchingContractDetails || isFetchingDealDetails ? (
            <Box className={classes.languageModalSkeletonWrapper}>
              <Skeleton
                variant="rectangular"
                height={45}
                className={classes.languageModalSkeleton}
              />
              <Skeleton
                variant="rectangular"
                height={45}
                className={classes.languageModalSkeleton}
              />
              <Skeleton
                variant="rectangular"
                height={45}
                className={classes.languageModalSkeleton}
              />
            </Box>
          ) : (
            <Suspense fallback={null}>
              <>
                {hasContract && contractData?.details ? (
                  <DealContract
                    dealId={dealId}
                    contractData={contractData}
                    setContractData={setContractData}
                    handleShowContractForm={handleShowContractForm}
                    openModalCloseDeal={openModalCloseDeal}
                    isDealClosed={isDealClosed}
                    franchiseId={data?.franchiseInfo?.franchiseId}
                    setData={setData}
                    data={data}
                  />
                ) : data?.hasHubspotContract && data?.hsContractUrl ? (
                  <>
                    <HubSpotContract contractUrl={data?.hsContractUrl} />
                  </>
                ) : (
                  <Box>
                    <ContractEmptyState
                      dealId={dealId}
                      handleShowContractForm={handleShowContractForm}
                      isFranchiseLinked={!!data?.franchiseInfo?.franchiseId}
                      handleLocationRedirection={handleLocationRedirection}
                      setContractData={setContractData}
                      locationId={data?.location?.id}
                    />
                  </Box>
                )}
              </>
            </Suspense>
          )}
        </CustomTabPanel>
      )}
      <CustomTabPanel
        value={value}
        index={1}
        className={classNames(value === 1 && classes.overviewTabs, 'innerScrollBar')}
      >
        {activitiesLoading ? (
          <Box className={classes.activitySkeleton}>
            <ActivityBarSkeleton noOfRows={5} />
          </Box>
        ) : (
          <Suspense fallback={null}>
            <>
              {activities?.map((activity) => (
                <Fragment key={activity?.month}>
                  <DateBar date={activity?.month} />
                  {activity?.monthlyActivities.map((monthlyActivity) => (
                    <Activity key={monthlyActivity?.id} {...monthlyActivity} />
                  ))}
                </Fragment>
              ))}
            </>
          </Suspense>
        )}
      </CustomTabPanel>
      <CustomTabPanel
        value={value}
        index={2}
        className={classNames(value === 2 && classes.overviewTabs, 'innerScrollBar')}
      >
        {notesLoading ? (
          <Box className={classes.activitySkeleton}>
            <ActivityBarSkeleton noOfRows={5} />
          </Box>
        ) : (
          <Suspense fallback={null}>
            <>
              {notes && notes?.length > 0 ? (
                notes?.map((note) => (
                  <Fragment key={note.month}>
                    <DateBar date={note.month} />
                    {note.monthlyNotes.map((monthlyNote) => (
                      <Notes
                        key={monthlyNote.id}
                        id={monthlyNote.id}
                        title={monthlyNote.title}
                        description={monthlyNote.description}
                        month={note.month}
                        deleteNote={() => getOnDelete(monthlyNote.id, note.month)}
                        updateNote={updateNote}
                        createdByName={monthlyNote?.createdBy}
                        createdAt={monthlyNote?.createdAt}
                      />
                    ))}
                  </Fragment>
                ))
              ) : (
                <NotesEmptyState />
              )}
            </>
          </Suspense>
        )}
      </CustomTabPanel>
    </Box>
  );
};

DealTabs.propTypes = {
  dealId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  updateNote: PropTypes.func,
  fetchActivities: PropTypes.func,
  fetchNotes: PropTypes.func,
  activities: PropTypes.array,
  activitiesLoading: PropTypes.bool,
  contractLoading: PropTypes.bool,
  notes: PropTypes.array,
  notesLoading: PropTypes.bool,
  getOnDelete: PropTypes.func,
  setValue: PropTypes.func,
  value: PropTypes.number,
  // questions: PropTypes.array,
  // setQuestions: PropTypes.func,
  // questionsLoading: PropTypes.bool,
  data: PropTypes.object,
  setData: PropTypes.func,
  handleShowContractForm: PropTypes.func,
  openModalCloseDeal: PropTypes.func,
  isDealClosed: PropTypes.bool,
  contractData: PropTypes.object,
  setContractData: PropTypes.func,
  hasContract: PropTypes.bool,
  isFetchingDealDetails: propTypes.bool,
  isFetchingContractDetails: propTypes.bool,
};

export default DealTabs;
