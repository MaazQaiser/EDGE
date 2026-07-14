import { Box, Button, Chip, IconButton, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { OBX_RELEASE_CONFIGURE } from 'src/app/router/constant/ROUTE';
import { ReactComponent as CheckChipIcon } from 'src/assets/svg/checkChip.svg?react';
import { ReactComponent as DotIcon } from 'src/assets/svg/dot.svg?react';
import { ReactComponent as EditIcon } from 'src/assets/svg/edit.svg?react';
import { ReactComponent as InProgressIcon } from 'src/assets/svg/inProgress.svg?react';
import { ReactComponent as NotPlannedQuarterIcon } from 'src/assets/svg/notPlannedChip.svg?react';
import { ReactComponent as EmptyStateIcon } from 'src/assets/svg/notPlannedQuarter.svg?react';
import { ReactComponent as PlannedChipIcon } from 'src/assets/svg/plannedChip.svg?react';
import { ReactComponent as SettingsIcon } from 'src/assets/svg/settings.svg?react';

import { useStyles } from './styles';

const QUARTER_TIMEFRAMES = {
  Q1: 'January - March',
  Q2: 'April - June',
  Q3: 'July - September',
  Q4: 'October - December',
};

const Roadmap = ({ roadmapData, roadmapId, year, isCurrentUserAllowed }) => {
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const classes = useStyles();
  const history = useHistory();

  console.log({ roadmapData });

  // Check if quarters are defined and no data is found
  const quartersDefined = !!roadmapData?.period;
  const hasNoData = !roadmapData?.createdAt;
  const shouldShowEmptyState = quartersDefined && hasNoData;

  const handleConfigureClick = (isEdit = false) => {
    const searchParams = [];

    // Add roadmapId and quarterId to search params
    if (roadmapId) searchParams.push(`roadmapId=${roadmapId}`);
    if (roadmapData?.id) searchParams.push(`quarterId=${roadmapData.id}`);
    if (year) searchParams.push(`year=${year}`);
    if (isEdit) searchParams.push(`isEdit=true`);
    if (roadmapData?.period) searchParams.push(`period=${roadmapData?.period}`);

    // Join search params with &
    const searchParamsString = searchParams.join('&');

    // If there are search params, push them to the history
    if (searchParamsString) {
      history.push({
        pathname: OBX_RELEASE_CONFIGURE,
        search: `?${searchParamsString}`,
      });
    } else {
      history.push(OBX_RELEASE_CONFIGURE);
    }
  };

  const getQuarterTimeframe = () => {
    const period = roadmapData?.period;
    return QUARTER_TIMEFRAMES[period] || roadmapData?.timeframe || '';
  };

  const getStatusChip = () => {
    const statusConfig = {
      completed: {
        labelKey: 'completed',
        status: 'completed',
        color: 'success',
        icon: <CheckChipIcon />,
      },
      planned: {
        labelKey: 'planned',
        status: 'planned',
        color: 'primary',
        icon: <PlannedChipIcon />,
      },
      not_planned: {
        labelKey: 'obx.release.roadmap.status.notPlanned',
        color: 'default',
        icon: <NotPlannedQuarterIcon />,
      },
      in_progress: {
        labelKey: 'obx.release.roadmap.status.inProgress',
        color: 'warning',
        icon: <InProgressIcon />,
      },
    };

    const status = roadmapData?.status;
    const config = statusConfig[status] || statusConfig.completed;

    return <Chip label={t(config.labelKey)} color={config.color} icon={config.icon} />;
  };

  const status = roadmapData?.status;
  const isNotPlanned = status === 'not_planned';

  const renderDetailSection = (titleKey, content) => (
    <Box className={classes.detailSection}>
      <Typography variant="subtitle2" className={classes.detailSectionTitle}>
        {t(titleKey)}
      </Typography>

      <Box className={classes.detailList}>
        {content ? (
          <Box className={classes.detailItem} dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <Typography variant="body2" className={classes.detailItem}>
            {NA}
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box className={classes.roadmapContainer}>
      <Box
        className={`${classes.quarterCard} ${isNotPlanned ? classes.quarterCardNotPlanned : ''}`}
      >
        <Box className={classes.quarterHeader}>
          <Box className={classes.statusContainer}>
            {getStatusChip()}
            {!shouldShowEmptyState && isCurrentUserAllowed && (
              <IconButton className={classes.editButton} onClick={() => handleConfigureClick(true)}>
                <EditIcon className={classes.editIcon} />
              </IconButton>
            )}
          </Box>
          <Typography variant="h6" className={classes.quarterTitle}>
            {roadmapData?.period}
          </Typography>
          <Typography variant="body2" className={classes.quarterTimeframe}>
            {getQuarterTimeframe()}
          </Typography>
          {!shouldShowEmptyState && (
            <Box className={classes.summaryContainer}>
              <Typography variant="body2" className={classes.summaryText}>
                {t('obx.release.roadmap.summary.features', {
                  count: roadmapData?.featuresCount || 0,
                })}
              </Typography>
              <DotIcon />
              <Typography variant="body2" className={classes.summaryText}>
                {t('obx.release.roadmap.summary.fixes', {
                  count: roadmapData?.fixesCount || 0,
                })}
              </Typography>
              <DotIcon />
              <Typography variant="body2" className={classes.summaryText}>
                {t('obx.release.roadmap.summary.improvements', {
                  count: roadmapData?.improvementsCount || 0,
                })}
              </Typography>
            </Box>
          )}
        </Box>
        {shouldShowEmptyState ? (
          <Box
            className={`${classes.emptyState} ${isCurrentUserAllowed ? classes.emptyStateWithHover : ''}`}
          >
            <Typography variant="body1" className={classes.emptyStateText}>
              {t('obx.release.roadmap.emptyState.message')}
            </Typography>
            <Box className={classes.emptyStatePlaceholder}>
              <EmptyStateIcon />
            </Box>
            {isCurrentUserAllowed && (
              <Button
                variant="secondaryGrey"
                startIcon={<SettingsIcon />}
                className={classes.configureButton}
                onClick={() => handleConfigureClick(false)}
              >
                {t('obx.release.roadmap.configure')}
              </Button>
            )}
          </Box>
        ) : (
          <Box className={classes.quarterDetails}>
            {/* Features Context */}
            {renderDetailSection(
              'obx.release.roadmap.details.features',
              roadmapData?.featuresContent,
            )}

            {/* Fixes Context */}
            {renderDetailSection('obx.release.roadmap.details.fixes', roadmapData?.fixesContent)}

            {/* Improvements Context */}
            {renderDetailSection(
              'obx.release.roadmap.details.improvements',
              roadmapData?.improvementsContent,
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

Roadmap.propTypes = {
  roadmapData: PropTypes.object,
  roadmapId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  year: PropTypes.number,
  isCurrentUserAllowed: PropTypes.bool,
};

Roadmap.defaultProps = {
  roadmapData: {},
  roadmapId: null,
  year: new Date().getFullYear(),
  isCurrentUserAllowed: false,
};

export default Roadmap;
