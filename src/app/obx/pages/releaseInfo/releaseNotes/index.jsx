import { Box, Chip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { OBX_RELEASE_ADD, OBX_RELEASE_NOTES_DETAILS } from 'src/app/router/constant/ROUTE';
import { ReactComponent as EditIcon } from 'src/assets/svg/edit.svg?react';
import { ReactComponent as NextStepIcon } from 'src/assets/svg/nextStep.svg?react';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum } from 'src/utils/constants';
import { truncateString } from 'src/utils/string/truncate';

import { LOAD_MORE_SKELETON_COUNT, ReleaseNoteCardSkeleton } from './releaseNotesSkeleton';
import { useStyles } from './styles';

export const RELEASE_CHIP_COLOR = {
  PRIMARY: 'primary',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  DEFAULT: 'default',
};

const ReleaseNotes = ({
  releases = [],
  onLoadMore,
  hasMore,
  isLoadingMore,
  isCurrentUserAllowed,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const observer = useRef(null);
  const { formatDayjsDateTime } = useDateTime();
  const lastCardRef = useCallback(
    (node) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore?.();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore, onLoadMore],
  );

  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, []);

  const handleCardClick = (release, index) => {
    const id = release?.id ?? index;
    history.push(OBX_RELEASE_NOTES_DETAILS.replace(':id', String(id)));
  };

  const truncateHtmlDescription = (htmlString, maxLength = 300) => {
    if (!htmlString || typeof htmlString !== 'string') return '';
    const textOnly = htmlString
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!textOnly) return '';
    if (textOnly.length <= maxLength) return textOnly;
    return truncateString(textOnly, maxLength);
  };

  const getStatusColor = (status) => {
    if (!status) return null;
    const normalized = String(status).toLowerCase();
    if (normalized === 'published') return RELEASE_CHIP_COLOR.SUCCESS;
    if (normalized === 'draft') return RELEASE_CHIP_COLOR.DEFAULT;
    if (normalized === 'latest') return RELEASE_CHIP_COLOR.PRIMARY;
    return null;
  };

  const handleEditClick = (event, release, isEdit = false) => {
    event.stopPropagation();
    const searchParams = [];
    if (release?.id) searchParams.push(`id=${release.id}`);
    if (release?.publishDate)
      searchParams.push(`year=${dayjsWithStandardOffset(release.publishDate).year()}`);
    if (isEdit) searchParams.push(`isEdit=true`);
    history.push({
      pathname: OBX_RELEASE_ADD,
      search: `?${searchParams.join('&')}`,
    });
  };
  const isReleaseFromCurrentYear = (publishDate) => {
    if (!publishDate) return false;
    const year = dayjsWithStandardOffset(publishDate).year();
    return !Number.isNaN(year) && year === dayjs().year();
  };

  const getStatusChip = (status, isLatest) => {
    if (isLatest) {
      return (
        <Chip
          label={t('obx.release.releaseNotes.latest')}
          color={RELEASE_CHIP_COLOR.PRIMARY}
          size="small"
        />
      );
    }
    if (status) {
      const chipColor = getStatusColor(status);
      return (
        <Chip
          label={status}
          color={chipColor || undefined}
          className={!chipColor ? classes.statusChip : undefined}
          size="small"
        />
      );
    }
    return null;
  };

  return (
    <>
      <Box className={classes.releaseNotesContainer}>
        {releases.map((release, index) => {
          const isLast = index === releases.length - 1;
          return (
            <Box
              key={release?.id ?? index}
              ref={isLast ? lastCardRef : null}
              className={classes.releaseCard}
              onClick={() => handleCardClick(release, index)}
            >
              <Box className={classes.releaseHeader}>
                <Box className={classes.releaseHeaderContent}>
                  <Typography variant="h3" className={classes.releaseVersion}>
                    {release.version}
                  </Typography>
                  {getStatusChip(
                    release.status,
                    index === 0 && isReleaseFromCurrentYear(release.publishDate),
                  )}
                </Box>
                {isCurrentUserAllowed ? (
                  <Box
                    className={classes.editIcon}
                    onClick={(event) => handleEditClick(event, release, true)}
                  >
                    <EditIcon />
                  </Box>
                ) : (
                  <Box className={classes.hoverIcon}>
                    <NextStepIcon />
                  </Box>
                )}
              </Box>
              <Typography variant="body2" className={classes.releaseDate}>
                {t('obx.release.releaseNotes.startDate')}:
                <span className={classes.releaseDateValue}>
                  {formatDayjsDateTime({
                    value: release.publishDate,
                    formatType: dayjsFormatsEnum.date,
                  })}
                </span>
              </Typography>
              <Box className={classes.detailList}>
                {release.description && (
                  <Box className={classes.detailItem}>
                    {truncateHtmlDescription(release.description, 300)}
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
        {isLoadingMore &&
          Array.from({ length: LOAD_MORE_SKELETON_COUNT }, (_, i) => (
            <ReleaseNoteCardSkeleton key={`load-more-${i}`} />
          ))}
      </Box>
    </>
  );
};

ReleaseNotes.propTypes = {
  releases: PropTypes.arrayOf(
    PropTypes.shape({
      version: PropTypes.string,
      releaseDate: PropTypes.string,
      publishDate: PropTypes.string,
      description: PropTypes.string,
      isLatest: PropTypes.bool,
      status: PropTypes.string,
    }),
  ),
  onLoadMore: PropTypes.func,
  hasMore: PropTypes.bool,
  isLoadingMore: PropTypes.bool,
  isCurrentUserAllowed: PropTypes.bool,
};

ReleaseNotes.defaultProps = {
  releases: [],
  onLoadMore: () => {},
  hasMore: false,
  isLoadingMore: false,
  isCurrentUserAllowed: false,
};

export default ReleaseNotes;
