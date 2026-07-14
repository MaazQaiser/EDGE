import { Box, Button, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { ReactComponent as ArrowLeftIcon } from 'assets/svg/chevron-right.svg?react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import CustomDropDown from 'src/app/components/common/customDropDown';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { OBX_RELEASE_ADD, OBX_RELEASE_CONFIGURE } from 'src/app/router/constant/ROUTE';
import { PlusIcon, Settings } from 'src/assets/svg/index';
import { ReactComponent as ReleaseNotesIcon } from 'src/assets/svg/ReleaseNotes.svg?react';
import { ReactComponent as RoadmapIcon } from 'src/assets/svg/roadmapIcon.svg?react';
import { useApiControllers } from 'src/helper/axios';
import { getReleaseNotes, getRoadmaps } from 'src/services/releaseConfigurations.service';
import { PLATFORM_INTENT, RELEASE_TABS } from 'src/utils/constants';

import { useStyles } from './release';
import ReleaseNotes from './releaseNotes';
import ReleaseNotesSkeleton from './releaseNotes/releaseNotesSkeleton';
import Roadmap from './roadmap';
import RoadmapSkeleton from './roadmap/roadmapSkeleton';

const allowedUserIds = process.env.REACT_APP_ALLOWED_USER_IDS?.split(',') || [];

const Release = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const { search } = useLocation();
  const { getNewApiController } = useApiControllers();
  const getInitialTab = () => {
    const tab = new URLSearchParams(search).get('tab');
    return tab || RELEASE_TABS.ROADMAP;
  };
  const user = useSelector((state) => state?.user?.info || {});
  const isCurrentUserAllowed = allowedUserIds.includes(user?.id?.toString());

  const [selectedTab, setSelectedTab] = useState(getInitialTab);

  const getInitialYear = () => {
    const params = new URLSearchParams(search);
    const yearParam = parseInt(params.get('year'), 10);
    if (yearParam && !Number.isNaN(yearParam)) {
      return { label: yearParam.toString(), value: yearParam };
    }
    return { label: new Date().getFullYear().toString(), value: new Date().getFullYear() };
  };

  const [selectedYear, setSelectedYear] = useState(getInitialYear);
  const [selectedEdge] = useState({ label: 'Edge', value: 'edge' });
  const [roadmapData, setRoadmapData] = useState(null);
  const [releaseNotesData, setReleaseNotesData] = useState([]);
  const [releaseNotesPagination, setReleaseNotesPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReleaseNotes, setIsLoadingReleaseNotes] = useState(
    getInitialTab() === RELEASE_TABS.RELEASE_NOTES,
  );
  const [isLoadingMoreReleaseNotes, setIsLoadingMoreReleaseNotes] = useState(false);

  const fetchRoadmaps = async () => {
    const apiController = getNewApiController();
    setIsLoading(true);
    try {
      const params = {
        year: selectedYear.value,
        intent: PLATFORM_INTENT.EDGE,
      };
      const response = await getRoadmaps(params, { signal: apiController.signal });
      const roadmap =
        response?.data?.roadmaps?.find((r) => r.year === selectedYear.value) ||
        response?.data?.roadmaps?.[0];
      setRoadmapData(roadmap || null);
    } catch (error) {
      if (!apiController.signal.aborted) {
        setRoadmapData(null);
      }
    } finally {
      if (!apiController.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  const fetchReleaseNotes = async (page = 1) => {
    const apiController = getNewApiController();
    if (page === 1) {
      setIsLoadingReleaseNotes(true);
    } else {
      setIsLoadingMoreReleaseNotes(true);
    }
    try {
      const params = {
        year: selectedYear.value,
        intent: selectedEdge.value,
        page,
        perPage: 10,
      };
      const response = await getReleaseNotes(params, { signal: apiController.signal });
      if (response?.statusCode === 200 && response?.data) {
        const releases = response.data?.releases || [];
        setReleaseNotesData((prev) => (page === 1 ? releases : [...prev, ...releases]));
        setReleaseNotesPagination(response.data?.pagination || null);
      } else {
        if (page === 1) setReleaseNotesData([]);
      }
    } catch (error) {
      if (!apiController.signal.aborted && page === 1) {
        setReleaseNotesData([]);
      }
    } finally {
      if (!apiController.signal.aborted) {
        setIsLoadingReleaseNotes(false);
        setIsLoadingMoreReleaseNotes(false);
      }
    }
  };

  const handleYearNavigation = (direction) => {
    const currentYear = selectedYear.value;
    const minYear = yearOptions[0].value;
    const maxYear = yearOptions[yearOptions.length - 1].value;
    let newYear;

    if (direction === 'prev') {
      newYear = Math.max(currentYear - 1, minYear);
    } else {
      newYear = Math.min(currentYear + 1, maxYear);
    }

    if (newYear !== currentYear) {
      const newYearOption = { label: newYear.toString(), value: newYear };
      setSelectedYear(newYearOption);
      const params = new URLSearchParams(search);
      params.set('year', newYear.toString());
      history.replace({ search: params.toString() });
    }
  };

  const loadMoreReleaseNotes = () => {
    if (releaseNotesPagination?.nextPage && !isLoadingMoreReleaseNotes) {
      fetchReleaseNotes(releaseNotesPagination.nextPage);
    }
  };

  useEffect(() => {
    // Setting the year in the search params
    const params = new URLSearchParams(search);
    if (!params.get('year')) {
      params.set('year', selectedYear.value.toString());
      history.replace({ search: params.toString() });
    }

    if (selectedTab === RELEASE_TABS.ROADMAP) {
      fetchRoadmaps();
    } else if (selectedTab === RELEASE_TABS.RELEASE_NOTES) {
      setIsLoadingReleaseNotes(true);
      setReleaseNotesData([]);
      setReleaseNotesPagination(null);
      fetchReleaseNotes(1);
    }
  }, [selectedYear.value, selectedEdge.value, selectedTab]);

  const handleTabChange = (event, newTab) => {
    if (newTab !== null) {
      setSelectedTab(newTab);
      const params = new URLSearchParams(search);
      params.set('tab', newTab);
      history.replace({ search: params.toString() });
    }
  };

  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
    const params = new URLSearchParams(search);
    params.set('year', year.value);
    history.replace({ search: params.toString() });
  };

  // Create 4 empty quarters when no data is found
  const emptyQuarters = ['Q1', 'Q2', 'Q3', 'Q4'].map((period, index) => ({
    period,
    status: 'not_planned',
    featuresCount: 0,
    fixesCount: 0,
    improvementsCount: 0,
    id: index + 1,
  }));

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i;
    return { label: year.toString(), value: year };
  });

  const renderYearOrCtaControl = (children) => {
    if (isCurrentUserAllowed) return children;

    return (
      <>
        <Box className={classes.yearControls}>
          <Typography variant="body2" className={classes.yearText}>
            {selectedYear.value}
          </Typography>
          <Button
            className={classes.yearNavButton}
            onClick={() => handleYearNavigation('prev')}
            disabled={selectedYear.value <= yearOptions[0].value}
          >
            <ArrowLeftIcon className={classes.yearNavButtonIcon} />
          </Button>

          <Button
            className={classes.yearNavButton}
            onClick={() => handleYearNavigation('next')}
            disabled={selectedYear.value >= yearOptions[yearOptions.length - 1].value}
          >
            <ArrowLeftIcon />
          </Button>
        </Box>
      </>
    );
  };

  return (
    <Box className={classes.releaseContainer}>
      <Box className={classes.headerSection}>
        <Box className={classes.tabsSection}>
          <ToggleButtonGroup
            value={selectedTab}
            className={classes.statesButtons}
            exclusive
            onChange={handleTabChange}
            aria-label="release tabs"
          >
            <ToggleButton
              value={RELEASE_TABS.ROADMAP}
              aria-label="roadmap"
              className={classes.firstButton}
            >
              <Box className={classes.tabContentWrapper}>
                <RoadmapIcon />
                <Typography variant="body2">
                  {t('obx.release.tabs.roadmap', { defaultValue: 'Roadmap' })}
                </Typography>
              </Box>
            </ToggleButton>
            <ToggleButton
              value={RELEASE_TABS.RELEASE_NOTES}
              aria-label="release notes"
              className={classes.lastButton}
            >
              <Box className={classes.tabContentWrapper}>
                <ReleaseNotesIcon />
                <Typography variant="body2">
                  {t('obx.release.tabs.releaseNotes', { defaultValue: 'Release Notes' })}
                </Typography>
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>
          {isCurrentUserAllowed && (
            <CustomDropDown
              name="year"
              options={yearOptions}
              selectedValues={selectedYear}
              handleChange={handleYearChange}
              bordered
              maxWidth="100px"
              className={classes.yearDropdown}
            />
          )}
        </Box>
        <Box className={classes.headerControls}>
          {/* Render configure button for roadmap tab */}
          {selectedTab === RELEASE_TABS.ROADMAP &&
            renderYearOrCtaControl(
              <Button
                variant="primary"
                startIcon={<Settings />}
                className={classes.configureButton}
                onClick={() =>
                  history.push({
                    pathname: OBX_RELEASE_CONFIGURE,
                    search: `?year=${selectedYear.value}${roadmapData?.id ? `&roadmapId=${roadmapData.id}` : ''}`,
                  })
                }
              >
                {t('obx.release.roadmap.configure', { defaultValue: 'Configure' })}
              </Button>,
            )}

          {/* Render new release button for release notes tab */}
          {selectedTab === RELEASE_TABS.RELEASE_NOTES &&
            renderYearOrCtaControl(
              <Button
                variant="primary"
                startIcon={<PlusIcon />}
                className={classes.newReleaseButton}
                onClick={() => history.push(OBX_RELEASE_ADD)}
              >
                {t('obx.release.releaseNotes.newRelease', { defaultValue: 'New Release' })}
              </Button>,
            )}
        </Box>
      </Box>
      <Box className={classes.tabContent}>
        {selectedTab === RELEASE_TABS.ROADMAP && (
          <>
            {isLoading ? (
              <Box className={classes.roadmapContainer}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <RoadmapSkeleton key={index} />
                ))}
              </Box>
            ) : (
              <Box className={classes.roadmapContainer}>
                {emptyQuarters.map((emptyQuarter) => {
                  const quarter =
                    roadmapData?.quarters?.find((q) => q.period === emptyQuarter.period) ||
                    emptyQuarter;
                  return (
                    <Roadmap
                      key={quarter.period}
                      roadmapData={quarter}
                      roadmapId={roadmapData?.id || null}
                      year={selectedYear.value}
                      isCurrentUserAllowed={isCurrentUserAllowed}
                    />
                  );
                })}
              </Box>
            )}
          </>
        )}
        {selectedTab === RELEASE_TABS.RELEASE_NOTES && (
          <>
            {isLoadingReleaseNotes ? (
              <ReleaseNotesSkeleton />
            ) : !releaseNotesData || releaseNotesData.length === 0 ? (
              <NoRecordFound
                data={[]}
                type="listing"
                title="No Release Notes Found"
                description="There are no release notes available at this time."
              />
            ) : (
              <ReleaseNotes
                releases={releaseNotesData}
                onLoadMore={loadMoreReleaseNotes}
                hasMore={!!releaseNotesPagination?.nextPage}
                isLoadingMore={isLoadingMoreReleaseNotes}
                isCurrentUserAllowed={isCurrentUserAllowed}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};
export default Release;
