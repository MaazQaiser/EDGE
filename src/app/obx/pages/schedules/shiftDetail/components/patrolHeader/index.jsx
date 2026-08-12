import { Button, Chip, Skeleton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { ReactComponent as ArrowRightIcon } from 'assets/svg/ArrowRightBlack.svg';
import { ReactComponent as DotIcon } from 'assets/svg/dot.svg';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Clossicon } from 'src/assets/svg';
import { SplittedCalenderIcon } from 'src/assets/svg';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum } from 'src/utils/constants';
import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { useStyles } from './patrolHeader';

const PatrolHeader = ({
  loading,
  closeDrawer,
  shiftData,
  headerTitle,
  subTitleText,
  handleBackBtn,
  editButtons,
  shiftType,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const { formatDayjsDateTime } = useDateTime();

  return (
    <Box className={classes.activityDrawer}>
      <Box className={classes.drawerHeaderNew}>
        <Box className={classes.drawerHeaderTop}>
          {loading ? (
            <Box className={classes.drawerHeaderTopSkeleton}>
              <Skeleton animation="wave" className={classes.titleSkeleton} />
              <Skeleton animation="wave" className={classes.titleSkeleton2} />
            </Box>
          ) : (
            <Box className={classes.drawerHeaderLeft}>
              {handleBackBtn && (
                <Button
                  variant="onlyText"
                  className={classes.cancelIcon}
                  onClick={handleBackBtn}
                  disableRipple
                >
                  <ArrowRightIcon />
                </Button>
              )}
              <Box className={classes.drawerHeaderTitleWrapper}>
                <Typography variant="h3" className={classes.drawerHeaderTitle}>
                  {capitalizeFirstLetter(headerTitle)}
                </Typography>
                {shiftData?.isSplit && <SplittedCalenderIcon width="23" height="23" />}
              </Box>
            </Box>
          )}
          <Box style={{ display: 'flex' }}>
            {!loading && editButtons}

            <Button
              className={classes.cancelIcon}
              disableRipple
              variant="onlyText"
              onClick={closeDrawer}
            >
              <Clossicon />
            </Button>
          </Box>
        </Box>
        {!loading && (
          <Box className={classes.drawerHeaderBottom}>
            {subTitleText && (
              <>
                <Typography variant="subtitle2" className={classes.drawerHeaderText}>
                  {capitalizeFirstLetter(subTitleText) || ''}
                </Typography>
                <DotIcon className={classes.dot} />
              </>
            )}
            <Typography variant="subtitle2" className={classes.drawerHeaderText}>
              {formatDayjsDateTime({
                value: shiftData?.startsAt,
                formatType: dayjsFormatsEnum.time,
              })}{' '}
              -{' '}
              {formatDayjsDateTime({
                value: shiftData?.endsAt,
                formatType: dayjsFormatsEnum.time,
              })}
            </Typography>
            <DotIcon className={classes.dot} />
            <Typography variant="subtitle2" className={classes.drawerHeaderText}>
              {formatDayjsDateTime({
                value: shiftData?.startsAt,
                formatType: dayjsFormatsEnum.date,
              })}
            </Typography>
            <DotIcon className={classes.dot} />
            <Chip
              sx={
                SCHEDULE_DUTIES.DISPATCH === shiftType
                  ? {
                      color: '#9747FF',
                      backgroundColor: '#F4EDFD',
                      '&:hover': {
                        backgroundColor: '#F4EDFD',
                        color: '#9747FF',
                      },
                    }
                  : {
                      color: '#5cb85c',
                      backgroundColor: '#def1de',
                      '&:hover': {
                        backgroundColor: '#def1de',
                        color: '#5cb85c',
                      },
                    }
              }
              label={
                SCHEDULE_DUTIES.DISPATCH === shiftType
                  ? getLabel('terms', 'dispatch', t)
                  : getLabel('terms', 'patrol', t)
              }
            />
            {!!shiftData?.missingHits && (
              <>
                <DotIcon className={classes.dot} />
                <Chip
                  color="error"
                  label={`${shiftData?.missingHits} Missed ${getLabel('terms', 'hits', t)}`}
                />
              </>
            )}
            {/* <>
              <DotIcon className={classes.dot} />
              <Chip color="warning" label={`${1 + ' / ' + 3} Reassigned`} />
            </> */}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PatrolHeader;

PatrolHeader.propTypes = {
  loading: PropTypes.bool,
  closeDrawer: PropTypes.func,
  handleBackBtn: PropTypes.func,
  shiftData: PropTypes.object,
  headerTitle: PropTypes.string,
  subTitleText: PropTypes.string,
  shiftType: PropTypes.string,
  editButtons: PropTypes.node,
};
