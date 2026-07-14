import { Box, Button, InputLabel, Typography } from '@mui/material';
import LocationPlaceHolder from 'assets/images/LocationPlaceHolder.jpeg';
import { ReactComponent as EditLocationIcon } from 'assets/svg/EditLocationIcon.svg?react';
import { ReactComponent as UnassignedLocationIcon } from 'assets/svg/UnassignedLocationIcon.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import { isObjectEmpty, removeKey } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { UPDATE_RUNSHEET_STATE } from 'src/redux/reducers/runSheetReducer';

import HitsAccordionListing from '../../hitsAccordionListing';
import LocationModal from '../../locationModal';
import { useStyles } from './hits';

const SplitRunSheetHits = (props) => {
  const { state, dispatch, errorMessages, setIsSameDate, setErrorMessages } = props;

  const classes = useStyles();
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(null);
  const { getLabel } = useTenantLabel();
  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const onChangeHandler = (name, e) => {
    if (e) {
      setErrorMessages((prev) => removeKey([name], prev));
    }
    dispatch({ type: UPDATE_RUNSHEET_STATE, payload: { key: name, value: e } });
    if (name === 'startDate') setStartDate(e);
  };

  useEffect(() => {
    if (startDate === state?.startDate) setIsSameDate(true);
    else setIsSameDate(false);
  }, [state?.startDate]);

  const finalProps = {
    ...props,
    idKey: 'hitId',
    hitsList: state?.hits,
    dispatch,
  };
  return (
    <Box className={classes.hitsSplitWrapper}>
      <Typography variant="h5">
        {t('obx.runsheet.selectStartTimeOfParentRunSheet', {
          runsheet: getLabel('terms', 'runsheet', t),
        })}
      </Typography>
      <Box className={classes.runsheetFields}>
        <Box className={classes.splitColms}>
          <Box className={classes.fifityFifty}>
            <InputLabel htmlFor="parentStartsAt">
              {t('obx.runsheet.startTime')} <RequiredAsterik />
            </InputLabel>
            <ResponsiveTimePickers
              name="parentStartsAt"
              timeStepsMinutes={1}
              disabled={true}
              onChange={(e) => onChangeHandler('parentStartsAt', e)}
              id="parentStartsAt"
              // useLocalTimeZone
              error={!!errorMessages?.parentStartsAt}
              helperText={!!errorMessages?.parentStartsAt ? errorMessages?.parentStartsAt : null}
              value={state?.parentStartsAt || null}
              placeholder={t('obx.runsheet.selectStartTime')}
            />
          </Box>
          <Box className={classes.fifityFifty}>
            <InputLabel htmlFor="Service Name">
              {t('obx.runsheet.endTime')} <RequiredAsterik />
            </InputLabel>
            <ResponsiveTimePickers
              error={!!errorMessages?.parentEndsAt}
              helperText={!!errorMessages?.parentEndsAt ? errorMessages?.parentEndsAt : null}
              name="parentEndsAt"
              timeStepsMinutes={1}
              // useLocalTimeZone
              // minValue={state?.startsAt}
              // disabled
              onChange={(e) => onChangeHandler('parentEndsAt', e)}
              value={state?.parentEndsAt || null}
              id="parentEndsAt"
              placeholder={t('obx.runsheet.selectEndTime')}
            />
          </Box>
        </Box>
      </Box>
      <Typography variant="h5">
        {t('obx.runsheet.selectStartTimeOfNewRunSheet', {
          runsheet: getLabel('terms', 'runsheet', t),
        })}
      </Typography>
      <Box className={classes.runsheetFields}>
        <Box className={classes.splitColms}>
          <Box className={classes.fifityFifty}>
            <InputLabel htmlFor="startTime">
              {t('obx.runsheet.startTime')} <RequiredAsterik />
            </InputLabel>
            <ResponsiveTimePickers
              name="startsAt"
              timeStepsMinutes={1}
              onChange={(e) => onChangeHandler('startsAt', e)}
              id="startsAt"
              error={!!errorMessages?.startsAt}
              helperText={!!errorMessages?.startsAt ? errorMessages?.startsAt : null}
              value={state?.startsAt || null}
              placeholder={t('obx.runsheet.selectStartTime')}
            />
          </Box>
          <Box className={classes.fifityFifty}>
            <InputLabel htmlFor="Service Name">
              {t('obx.runsheet.endTime')} <RequiredAsterik />
            </InputLabel>
            <ResponsiveTimePickers
              error={!!errorMessages?.endsAt}
              helperText={!!errorMessages?.endsAt ? errorMessages?.endsAt : null}
              name="endsAt"
              timeStepsMinutes={1}
              onChange={(e) => onChangeHandler('endsAt', e)}
              value={state?.endsAt || null}
              id="endsAt"
              placeholder={t('obx.runsheet.selectEndTime')}
            />
          </Box>
        </Box>
      </Box>
      <Typography variant="h5">
        {t('obx.runsheet.addStartingAndEndingPointOfNewRunsheet', {
          runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
        })}
      </Typography>
      <Box className={classes.locationButtons}>
        <InputLabel htmlFor="runsheetName">{t('obx.runsheet.startingEndingLocation')}</InputLabel>

        {isObjectEmpty(state?.startEndLocation) ? (
          <Button
            onClick={handleOpenModal}
            disableRipple
            startIcon={<UnassignedLocationIcon />}
            className={classes.redButton}
            type="button"
            variant="destructive"
          >
            {t('obx.runsheet.addStartingEndingLocation')}
          </Button>
        ) : (
          <Button
            onClick={handleOpenModal}
            disableRipple
            endIcon={<EditLocationIcon />}
            className={classes.editButton}
            type="button"
            variant="destructive"
          >
            <Box component="span" className={classes.editButtonInner}>
              <img src={LocationPlaceHolder} alt="" />{' '}
              {state?.startEndLocation?.name || state?.startEndLocation?.address}
            </Box>
          </Button>
        )}
      </Box>
      <Box>
        <Typography variant="h5">
          {t('obx.runsheet.selectHits', {
            hits: getLabel('terms', 'hits', t),
          })}
        </Typography>
        <InputLabel htmlFor="runsheetName">
          {t('obx.runsheet.selectHitsText', {
            hits: getLabel('terms', 'hits', t),
            runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
          })}
        </InputLabel>
      </Box>
      <Box className={classNames(classes.accordionWrapper, 'innerScrollBar')}>
        <HitsAccordionListing {...finalProps} />
        {props?.splitRunSheet &&
        state?.visitSet?.length &&
        state?.visitSet?.length === state?.hits?.length ? (
          <Typography variant="body2" className={classes.errorForAllHitsSelection}>
            {t('obx.runsheet.allHitsSelectedException', {
              hits: getLabel('terms', 'hits', t),
            })}
          </Typography>
        ) : null}
      </Box>
      <LocationModal openModal={openModal} handleCloseModal={handleCloseModal} {...props} />
    </Box>
  );
};

SplitRunSheetHits.propTypes = {
  state: PropTypes.shape({
    runsheetName: PropTypes.string,
    startsAt: PropTypes.string,
    hits: PropTypes.array,
    visitSet: PropTypes.array,
    parentStartsAt: PropTypes.object,
    parentEndsAt: PropTypes.object,
    startDate: PropTypes.string,
    endsAt: PropTypes.string, // Ensure this line is present
    startEndLocation: PropTypes.object,
    dutyDay: PropTypes.array,
  }).isRequired,
  activeStep: PropTypes.string,
  dispatch: PropTypes.function,
  setIsSameDate: PropTypes.func,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
  splitRunSheet: PropTypes.bool,
};

export default SplitRunSheetHits;
