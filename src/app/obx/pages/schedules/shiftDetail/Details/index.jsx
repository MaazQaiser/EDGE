import { Avatar, Box, Chip, Skeleton, Switch, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ShiftVisitsStatus from 'src/app/components/obxComponents/ShiftVisitsStatus';
import { ReactComponent as CheckoutShiftIcon } from 'src/assets/svg/CheckoutShiftIcon.svg';
import { convertMinutesToHMFormat, isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { toggleAutoCheckoutStatus } from 'src/services/runsheet.services';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import { SCHEDULE_DUTIES, ShiftStatus } from 'src/utils/constants/schedules';
import { toaster } from 'src/utils/toast';

import HitsAccordionListing from '../../../runSheets/components/hitsAccordionListing';
import { getCurrentStandardTimeInIsoWrtTimezone } from '../../helper';
import { PANEL_ACCENT_LIGHT } from '../panelAccent';
import { useStyles } from './details.styles';

const Details = ({ shiftData, loading, loadInstructions, shiftId }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const [checkpoints, setCheckpoints] = useState([]);
  const [autoShiftToggle, setAutoShiftToggle] = useState(null);
  const { formatDayjsDateTime } = useDateTime();

  useEffect(() => {
    if (shiftData?.tours) {
      const checkpoints = shiftData.tours.reduce((acc, tour) => {
        // Ensure checkpoints is an array before spreading
        const tourCheckpoints = (tour?.checkpoints || []).map((checkpoint) => ({
          ...checkpoint,
          isDisabled: tour?.isDisabled,
        }));
        acc.push(...tourCheckpoints);
        return acc;
      }, []);

      setCheckpoints(checkpoints);
    }

    setAutoShiftToggle(shiftData?.autoClockoutOff);
  }, [shiftData]);

  const isPatrolDispatchOrHit = [
    SCHEDULE_DUTIES.PATROL,
    SCHEDULE_DUTIES.HIT,
    SCHEDULE_DUTIES.DISPATCH,
  ].includes(shiftData?.shiftType);

  const toggleAutoShift = async () => {
    try {
      if (!shiftId) return;
      const response = await toggleAutoCheckoutStatus(shiftId);
      if (response && response?.statusCode === 200) {
        setAutoShiftToggle(!autoShiftToggle);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const dispatchTours = shiftData?.tours?.filter((tour) => !!tour.dispatchId) || [];

  return (
    <>
      <Box className={classes.dutyDetailTabs}>
        {loading ? (
          <Box className={classes.detailsSkeletonWrapper}>
            <Box className={classes.detailsSkeletonTitle}>
              <Skeleton />
            </Box>
            <Box className={classes.detailsSkeletonContent}>
              <Skeleton />
              <Skeleton />
            </Box>
            <Box className={classes.detailsSkeletonContent}>
              <Skeleton />
              <Skeleton />
            </Box>
            <Box className={classes.detailsSkeletonContent}>
              <Skeleton />
              <Skeleton />
            </Box>
            <Box className={classes.detailsSkeletonCard}>
              <Skeleton />
            </Box>
            <Box className={classes.detailsSkeletonCard}>
              <Skeleton />
            </Box>
          </Box>
        ) : (
          <>
            <Box className={classes.dutyDetailGI}>
              <Typography variant="h4" className={classes.dutyDetailGITitle}>
                {t('obx.schedules.dutyDetail.detail.generalInfo')}
              </Typography>
              <Box className={classes.dutyDetailGIList}>
                <Box className={classes.dutyDetailGIListItem}>
                  <Typography className={classes.dutyDetailGIListItemTitle} variant="subtitle2">
                    {t('obx.schedules.dutyDetail.detail.tours', {
                      tours: getLabel('terms', 'tours', t),
                    })}
                    :
                  </Typography>
                  <Typography className={classes.dutyDetailGIListItemText} variant="subtitle1">
                    {shiftData?.totalTours
                      ? t('obx.schedules.dutyDetail.detail.toursCompletionRatio', {
                          completedTours: shiftData?.completedTours,
                          totalNoOfTours: shiftData?.totalTours,
                        })
                      : 0}
                  </Typography>
                </Box>

                <Box className={classes.dutyDetailGIListItem}>
                  <Typography className={classes.dutyDetailGIListItemTitle} variant="subtitle2">
                    {t('obx.schedules.dutyDetail.detail.dutyTime')}:
                  </Typography>
                  <Typography className={classes.dutyDetailGIListItemText} variant="subtitle1">
                    {convertMinutesToHMFormat(shiftData?.totalHours * 60)}
                  </Typography>
                </Box>
                <Box className={classes.dutyDetailGIListItem}>
                  <Typography className={classes.dutyDetailGIListItemTitle} variant="subtitle2">
                    {t('obx.schedules.dutyDetail.detail.assignedTo')}:
                  </Typography>
                  <Box className={classes.dutyDetailGIListPerson}>
                    <Avatar
                      className={classes.dutyDetailGIListAvatar}
                      alt={''}
                      src={shiftData?.officer?.imageUrl}
                    />
                    <Typography className={classes.dutyDetailGIListItemText} variant="subtitle1">
                      {shiftData?.officer?.name}
                    </Typography>
                  </Box>
                </Box>
                {/* <Box className={classes.dutyDetailGIListItem}>
            <Typography className={classes.dutyDetailGIListItemTitle} variant="subtitle2">
              {t('obx.schedules.dutyDetail.detail.payRate')}:
            </Typography>
            <Typography className={classes.dutyDetailGIListItemText} variant="subtitle1">
              ${shiftData?.hourlyRate}/{t('commonText.perHour')}
            </Typography>
          </Box> */}
              </Box>

              <ShiftVisitsStatus
                {...{
                  startsAt: shiftData?.startsAt,
                  endsAt: shiftData?.endsAt,
                  status: shiftData?.tourShiftStatus,
                  completedTours: shiftData?.completedTours,
                  totalTours: shiftData?.totalTours,
                }}
              />
            </Box>

            {/* Reassigned Officer Detail */}
            {shiftData?.reassignedShift && (
              <Box className={classes.dutyDetailGI}>
                <Box className={classes.reassignedShift}>
                  <Typography variant="subtitle2" className={classes.reassignedShiftTitle}>
                    {t('obx.schedules.dutyDetail.detail.reassignedTo')}:
                  </Typography>
                  <Box className={classes.reassignedShiftDetail}>
                    <Avatar
                      src={shiftData?.reassignedShift?.officer?.imageUrl}
                      className={classes.reassignedShiftAvatar}
                    />
                    <Typography variant="body2" className={classes.reassignedShiftText}>
                      {shiftData?.reassignedShift?.officer?.name} •{' '}
                      {`${formatDayjsDateTime({
                        value: shiftData?.reassignedShift?.startsAt,
                        formatType: dayjsFormatsEnum.date,
                      })} • ${formatDayjsDateTime({
                        value: shiftData?.reassignedShift?.startsAt,
                        formatType: dayjsFormatsEnum.time,
                      })}`}
                    </Typography>
                  </Box>
                </Box>
                <ShiftVisitsStatus
                  {...{
                    startsAt: shiftData?.reassignedShift?.startsAt,
                    endsAt: shiftData?.reassignedShift?.endsAt,
                    status: shiftData?.reassignedShift?.reassignedTourShiftStatus,
                    completedTours: shiftData?.reassignedShift?.completedTours,
                    totalTours: shiftData?.reassignedShift?.totalTours,
                  }}
                />
              </Box>
            )}
            {dispatchTours?.length ? (
              <>
                <Typography variant="h4" className={classes.dutyDetailGITitle}>
                  {t('obx.schedules.dutyDetail.dispatchTour', {
                    tour: getLabel('terms', 'tour', t),
                    dispatch: getLabel('terms', 'dispatch', t),
                  })}
                </Typography>
                <HitsAccordionListing
                  showOrder={isPatrolDispatchOrHit}
                  showMissedHits={false}
                  shiftDetails={shiftData}
                  state={shiftData}
                  hitsList={dispatchTours}
                  showVisitedPoints={true}
                  isDispatched={true}
                  isPatrolDispatchOrHit={isPatrolDispatchOrHit}
                />
              </>
            ) : null}

            {autoShiftToggle !== null && (
              <Box className={classes.autoCheckout}>
                <Box className={classes.autoLeft}>
                  <CheckoutShiftIcon />
                  <Typography variant="h5">{t('obx.schedules.autoClockoutShift')}</Typography>
                </Box>
                <Box className={classes.autoRight}>
                  <Switch
                    /* The same green the drawer's tabs use — see `panelAccent`. */
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: PANEL_ACCENT_LIGHT },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: PANEL_ACCENT_LIGHT,
                      },
                    }}
                    checked={!autoShiftToggle}
                    onChange={toggleAutoShift}
                    disabled={
                      getCurrentStandardTimeInIsoWrtTimezone() >= shiftData?.endsAt ||
                      [ShiftStatus.SHIFT_ENDED, ShiftStatus.SHIFT_AUTO_ENDED].includes(shiftData)
                        ?.shiftStatus
                    }
                  />
                </Box>
              </Box>
            )}

            {checkpoints && checkpoints?.length > 0 ? (
              <>
                <Typography variant="h4" className={classes.dutyDetailGITitle}>
                  {t('obx.schedules.dutyDetail.detail.checkpoints')}:
                </Typography>
                <Box className={classes.dutyDetailCheckpoints}>
                  {checkpoints?.map((checkpoint) => (
                    <Box key={checkpoint?.id} className={classes.dutyDetailCheckpoint}>
                      {checkpoint?.imageUrl ? (
                        <img
                          src={checkpoint?.imageUrl}
                          className={classes.dutyDetailCheckpointImage}
                          alt="device"
                        />
                      ) : (
                        <div className={classes.dutyDetailCheckpointImage}></div>
                      )}
                      <Box className={classes.dutyDetailCheckpointDetail}>
                        <Box className={classes.dutyDetailCheckpointTitle}>
                          <Typography variant="h4">{checkpoint?.checkpointType}</Typography>
                          {checkpoint?.isDisabled && (
                            <Chip
                              label={t('obx.schedules.dutyDetail.detail.outOfShiftTime')}
                              size="small"
                            />
                          )}
                        </Box>
                        <Typography
                          className={classes.dutyDetailCheckpointText}
                          variant="subtitle3"
                        >
                          {checkpoint?.location?.locationName}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </>
            ) : shiftData?.tours?.length < 1 &&
              [ShiftStatus.SHIFT_ENDED, ShiftStatus.SHIFT_AUTO_ENDED].includes(
                shiftData?.shiftStatus,
              ) ? (
              <Typography variant="h5" className={classes.dutyDetailGITitleAlert}>
                {t('obx.tourReportAbendum', {
                  tour: getLabel('terms', 'tour', t).toLowerCase(),
                })}
              </Typography>
            ) : null}
          </>
        )}

        {loadInstructions ? (
          <Box className={classes.detailsSkeletonWrapper}>
            <Box className={classes.detailsSkeletonCard}>
              <Skeleton />
            </Box>
          </Box>
        ) : (
          shiftData?.instruction?.content && (
            <Box className={classes.dutyDetailInstructions}>
              <Typography variant="h4" className={classes.dutyDetailGITitle}>
                {t('obx.schedules.dutyDetail.detail.instructions')}:
              </Typography>

              {!isObjectEmpty(shiftData?.instruction) && (
                <>
                  <Box
                    className={classes.instructionContent}
                    dangerouslySetInnerHTML={{
                      __html: shiftData?.instruction?.content,
                    }}
                  />
                </>
              )}
            </Box>
          )
        )}
      </Box>
    </>
  );
};

Details.propTypes = {
  shiftData: PropTypes.object,
  loading: PropTypes.bool,
  loadInstructions: PropTypes.bool,
  shiftId: PropTypes.string,
};

export default Details;
