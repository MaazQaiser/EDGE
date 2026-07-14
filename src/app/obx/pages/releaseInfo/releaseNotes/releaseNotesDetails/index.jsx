import { Box, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import InfiniteScrollCustom from 'src/app/components/common/infiniteScrollCustom';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { OBX_RELEASE, OBX_RELEASE_NOTES_DETAILS } from 'src/app/router/constant/ROUTE';
import { ReactComponent as ArrowBackIcon } from 'src/assets/svg/ArrowLeftBack.svg?react';
import useDateTime from 'src/hooks/useDateTime';
import { getReleaseNotes, getReleaseNotesById } from 'src/services/releaseConfigurations.service';
import { dayjsFormatsEnum } from 'src/utils/constants';
import { RELEASE_TABS } from 'src/utils/constants';

import ReleaseNotesDetailsSkeleton from './releaseNotesDetailsSkeleton';
import { useStyles } from './styles';

const ReleaseNotesDetails = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const { formatDayjsDateTime } = useDateTime();
  const { id } = useParams();
  const [currentRelease, setCurrentRelease] = useState(null);
  const [releasesList, setReleasesList] = useState([]);
  const [releasesPagination, setReleasesPagination] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoadingReleasesList, setIsLoadingReleasesList] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [lastElement, setLastElement] = useState(null);

  const fetchReleaseById = useCallback(
    async (releaseId) => {
      if (!releaseId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await getReleaseNotesById(releaseId);
        const release = response?.data?.release ?? response?.data ?? null;
        setCurrentRelease(release);
        return release;
      } catch (err) {
        setError(err?.message || t('obx.release.releaseNotesDetails.errorLoading'));
        setCurrentRelease(null);
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const fetchReleasesList = useCallback(async (year, intent, page = 1) => {
    if (year == null || !intent) return;
    if (page === 1) {
      setIsLoadingReleasesList(true);
    } else {
      setIsLoadingMore(true);
    }
    try {
      const response = await getReleaseNotes({ year, intent, page, perPage: 10 });
      const list = response?.data?.releases ?? response?.data ?? [];
      const releases = Array.isArray(list) ? list : [];
      setReleasesList((prev) => (page === 1 ? releases : [...prev, ...releases]));
      setReleasesPagination(response?.data?.pagination || null);
      setTotalCount(response?.data?.pagination?.totalCount || 0);
    } catch (err) {
      if (page === 1) setReleasesList([]);
    } finally {
      if (page === 1) {
        setIsLoadingReleasesList(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, []);

  const getMoreData = () => {
    if (releasesPagination?.nextPage && !isLoadingMore && currentRelease) {
      fetchReleasesList(currentRelease.year, currentRelease.intent, releasesPagination.nextPage);
    }
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetchReleaseById(id).then((release) => {
      if (release?.year != null && release?.intent) {
        setReleasesList([]);
        setReleasesPagination(null);
        setTotalCount(0);
        fetchReleasesList(release.year, release.intent, 1);
      }
    });
  }, [id, fetchReleaseById, fetchReleasesList]);

  const handleBack = () => {
    history.push(`${OBX_RELEASE}?tab=${RELEASE_TABS.RELEASE_NOTES}`);
  };

  const selectedIndex = releasesList.findIndex((r) => String(r.id) === String(id));
  const handleTabChange = (_event, newValue) => {
    const release = releasesList[newValue];
    if (release?.id != null) {
      history.push(OBX_RELEASE_NOTES_DETAILS.replace(':id', String(release.id)));
    }
  };

  if (error) {
    return (
      <Box className={classes.detailsContainer}>
        <Box className={classes.layoutContainer}>
          <Box className={classes.sidebar}>
            <Box className={classes.backLink} onClick={handleBack}>
              <ArrowBackIcon />
              <Typography variant="body2" className={classes.backText}>
                {t('links.back')}
              </Typography>
            </Box>
          </Box>
          <Box
            className={classes.mainContent}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="body2" className={classes.emptyText}>
              {error}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  if (loading && !currentRelease) {
    return <ReleaseNotesDetailsSkeleton />;
  }

  if (!currentRelease) {
    return (
      <Box className={classes.detailsContainer}>
        <Box className={classes.layoutContainer}>
          <Box className={classes.sidebar}>
            <Box className={classes.backLink} onClick={handleBack}>
              <ArrowBackIcon />
              <Typography variant="body2" className={classes.backText}>
                {t('links.back')}
              </Typography>
            </Box>
          </Box>
          <Box
            className={classes.mainContent}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="body2" className={classes.emptyText}>
              {t('obx.release.releaseNotesDetails.emptyContent')}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.detailsContainer}>
      <Box className={classes.layoutContainer}>
        <Box className={classes.sidebar}>
          <Box className={classes.backLink} onClick={handleBack}>
            <ArrowBackIcon />
            <Typography variant="body2" className={classes.backText}>
              {t('links.back')}
            </Typography>
          </Box>
          {isLoadingReleasesList && (
            <Box className={classes.sidebarScrollable}>
              <Box className={classes.skeletonSidebarTabs}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
                  <Box key={index} className={classes.loadMoreSkeletonItem}>
                    <Skeleton
                      variant="text"
                      animation="wave"
                      className={classes.loadMoreSkeletonText}
                      height={35}
                      width="95%"
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          {!isLoadingReleasesList && releasesList.length > 0 && (
            <Box className={classes.sidebarScrollable}>
              <InfiniteScrollCustom
                totalNoOfRecords={totalCount}
                noOfRecordsBeingDisplayed={releasesList.length}
                lastElement={lastElement}
                getMoreData={getMoreData}
                body={() => (
                  <>
                    <Tabs
                      orientation="vertical"
                      value={selectedIndex >= 0 ? selectedIndex : false}
                      onChange={handleTabChange}
                      className={classes.sidebarTabs}
                    >
                      {releasesList.map((release, index) => {
                        const isLast =
                          index === releasesList.length - 1 &&
                          !isLoadingMore &&
                          releasesList.length <= totalCount;
                        return (
                          <Tab
                            key={release?.id ?? index}
                            ref={isLast ? setLastElement : null}
                            label={
                              release?.version ??
                              t('obx.release.releaseNotesDetails.unknownVersion')
                            }
                          />
                        );
                      })}
                    </Tabs>
                    {isLoadingMore && (
                      <Box className={classes.loadMoreSkeletonWrapper}>
                        {[1, 2, 3].map((index) => (
                          <Box key={index} className={classes.loadMoreSkeletonItem}>
                            <Skeleton
                              variant="text"
                              animation="wave"
                              className={classes.loadMoreSkeletonText}
                              height={35}
                              width="95%"
                            />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </>
                )}
              />
            </Box>
          )}
        </Box>
        <Box className={classes.mainContent}>
          <Box className={classes.contentHeader}>
            <Typography variant="h3" className={classes.versionTitle}>
              {currentRelease.version}
            </Typography>
            <Typography variant="body2" className={classes.releaseDate}>
              {t('obx.release.releaseNotes.startDate')}:{' '}
              <span className={classes.releaseDateText}>
                {formatDayjsDateTime({
                  value: currentRelease.publishDate,
                  formatType: dayjsFormatsEnum.date,
                })}
              </span>
            </Typography>
          </Box>
          <hr className={classes.contentSeparator} />
          <Box className={classes.contentBody}>
            <Box className={classes.tabContent}>
              {currentRelease.description ? (
                <Box
                  component="div"
                  className={classes.sectionText}
                  dangerouslySetInnerHTML={{
                    __html: currentRelease.description,
                  }}
                />
              ) : (
                <Box className={classes.emptyContentCenter}>
                  <NoRecordFound
                    data={[]}
                    type="listing"
                    title={t('obx.release.releaseNotesDetails.emptyContent')}
                    description={t('obx.release.releaseNotesDetails.emptyContentDescription')}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ReleaseNotesDetails;
