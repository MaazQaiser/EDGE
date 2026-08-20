import { Button, Chip, InputLabel, Skeleton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import { DisplayDateTimeRange } from 'src/app/components/obxComponents/ShiftVisitsStatus';
import { Clossicon } from 'src/assets/svg';
import { ReactComponent as HitDetailIcon } from 'src/assets/svg/runsheet-icon.svg';
import { useApiControllers } from 'src/helper/axios';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { getMissedHits } from 'src/services/duty.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { getCurrentTimeWithDisabledDlsInIso } from '../../helper';
import ReassignHitDrawerContent from '../reassignHitDrawerContent';
import { useStyles } from './MissedHitsDrawer';

/**
 * The endpoint has shipped both a bare array and an envelope over time. Anything
 * else (an unexpected object) previously reached `.map` and blanked the app, so
 * normalise here and let the empty state handle the rest.
 */
const toMissedHitsArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.missedHits)) return payload.missedHits;
  if (Array.isArray(payload?.hits)) return payload.hits;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const MissedHitsDrawer = ({
  missedHitDrawerData,
  setMissedHitDrawerData,
  refreshMissedHitsCount,
}) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const { getNewApiController } = useApiControllers();

  const [selectedMissedHit, setSelectedMissedHit] = useState(null);
  const [missedHitsList, setMissedHitsList] = useState([]);

  /* `endsAt` is the **last day in scope**, not the day after it.
     This used to subtract one, because the window it is handed came from the
     calendar's `activeEnd`, which FullCalendar makes exclusive. The month view's
     window is now the inclusive last visible date — the same convention the pill's
     own count is calculated on — so subtracting here would open a drawer listing
     fewer visits than the pill that opened it says exist. */
  const startDate = dayjs(missedHitDrawerData?.startsAt);
  const endDate = dayjs(missedHitDrawerData?.endsAt);
  const [selectedDates, setSelectedDates] = useState([startDate, endDate]);

  const closeDrawer = () => {
    setMissedHitDrawerData(null);
  };

  const handleShow = (missedHit) => {
    setSelectedMissedHit(missedHit);
  };
  const handleBackBtn = () => {
    setSelectedMissedHit(null);
  };

  const getMissedHitsList = async ({ startsAt, endsAt }) => {
    const apiController = getNewApiController();
    try {
      setMissedHitsList(undefined);
      const config = { signal: apiController.signal };

      const response = await getMissedHits({
        startsAt: getCurrentTimeWithDisabledDlsInIso(startsAt),
        endsAt: getCurrentTimeWithDisabledDlsInIso(dayjs(endsAt).endOf('day')),
        config,
      });
      setMissedHitsList(toMissedHitsArray(response?.data));
    } catch (err) {
      if (!apiController.signal.aborted) {
        setMissedHitsList(null);
        toaster.error({
          text: err?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };

  const selectDatesHandler = (dates) => {
    setSelectedDates(dates);
  };

  // get missed hits list as per selected date range
  useEffect(() => {
    if (
      selectedDates[0] &&
      selectedDates[1] &&
      dayjs(selectedDates[0]).isValid() &&
      dayjs(selectedDates[1]).isValid()
    ) {
      getMissedHitsList({
        startsAt: selectedDates[0],
        endsAt: selectedDates[1],
      });
    }
  }, [selectedDates[0], selectedDates[1]]);

  return (
    <>
      {selectedMissedHit ? (
        <ReassignHitDrawerContent
          {...{
            closeDrawer,
            handleBackBtn,
            shiftData: selectedMissedHit,
            headerTitle: t('obx.schedules.dutyDetail.reassignHit.headerTitle', {
              hit: getLabel('terms', 'hit', t),
            }),
            loading: false,
            callbackUponReassignHit: () => {
              getMissedHitsList({
                startsAt: selectedDates[0],
                endsAt: selectedDates[1],
              });
              refreshMissedHitsCount?.();
            },
          }}
        />
      ) : (
        <Box className={classes.activityDrawer}>
          <Box className={classes.drawerHeader}>
            <Typography variant="h2" className={classes.drawerHeaderTitle}>
              {t('obx.runsheet.missedHits', { hits: getLabel('terms', 'hits', t) })}
            </Typography>
            <Button
              className={classes.cancelIcon}
              disableRipple
              variant="onlyText"
              onClick={() => {
                closeDrawer();
              }}
            >
              <Clossicon />
            </Button>
          </Box>
          <Box className={classes.datePicker}>
            <InputLabel>{t('obx.runsheet.selectDateRange')}</InputLabel>
            <DateRangePickerWithButtons
              placeHolder="MM/DD/YYYY - MM/DD/YYYY"
              selectedDates={selectedDates}
              setDates={selectDatesHandler}
            />
          </Box>

          <Box className={classes.drawerBody}>
            <>
              {missedHitsList !== undefined && (
                <Typography variant="subtitle2" className={classes.labelClass}>
                  {t('obx.runsheet.missedHits', { hits: getLabel('terms', 'hits', t) })} (
                  {missedHitsList?.length})
                </Typography>
              )}
              <Box className={classes.drawerBodyInner}>
                {missedHitsList === undefined && (
                  <Box className={classes.loaderBox}>
                    <Skeleton variant="rectangular" />
                    <Skeleton variant="rectangular" />
                    <Skeleton variant="rectangular" />
                    <Skeleton variant="rectangular" />
                    <Skeleton variant="rectangular" />
                  </Box>
                )}
                {Array.isArray(missedHitsList) && missedHitsList.length === 0 && (
                  <Typography variant="body3" className={classes.emptyState}>
                    {t('obx.runsheet.noMissedHits', { hits: getLabel('terms', 'hits', t) })}
                  </Typography>
                )}
                {missedHitsList?.map((missedHit) => {
                  return (
                    <Box className={classes.missedBox} key={missedHit?.hitId}>
                      <Box className={classes.missedDetails}>
                        <Typography variant="h5">{missedHit?.siteName}</Typography>
                        <Typography variant="subtitle3">{missedHit?.runsheetName}</Typography>
                        <Typography variant="body3">
                          <DisplayDateTimeRange
                            startsAt={missedHit?.startsAt}
                            endsAt={missedHit?.endsAt}
                          />
                        </Typography>
                      </Box>
                      <Box className={classes.missedButton}>
                        <Chip color="primary" size="small" label={missedHit?.hitName} />
                        <Button
                          className={classes.hitIconButton}
                          onClick={() => handleShow(missedHit)}
                          disableRipple
                          variant="secondaryGrey"
                        >
                          <HitDetailIcon />
                        </Button>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </>
          </Box>
        </Box>
      )}
    </>
  );
};

MissedHitsDrawer.propTypes = {
  setMissedHitDrawerData: PropTypes.func,
  missedHitDrawerData: PropTypes.object,
  refreshMissedHitsCount: PropTypes.func,
};

export default MissedHitsDrawer;
