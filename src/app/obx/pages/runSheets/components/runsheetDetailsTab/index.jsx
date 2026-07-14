import { Box, InputLabel, Skeleton, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import { isObjectEmpty, removeKey } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { UPDATE_RUNSHEET_STATE } from 'src/redux/reducers/runSheetReducer';
import { getBreakRulesDropdownListing } from 'src/services/breakRules.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { dayjsFormatsEnum, daysOfWeekWithVal, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import {
  dayjsWithStandardOffset,
  getDayName,
  getStartEndTimeWithDesiredDate,
} from '../../../schedules/helper';
import { useStyles } from './RunsheetDetailsTab';

const RunSheetDetailsTabs = (props) => {
  const { state, dispatch, errorMessages, setErrorMessages, setIsSameDate, isEditRunsheet } = props;
  const [startDate, setStartDate] = useState(null);
  const [isLoadingBreakRules, setIsLoadingBreakRules] = useState(true);
  const [breakRules, setBreakRules] = useState([]);
  const { t } = useTranslation();
  const { formatDayjsDateTime } = useDateTime();
  const { getLabel } = useTenantLabel();

  const onChangeHandler = (name, e) => {
    if (e) {
      setErrorMessages((prev) => removeKey([name], prev));
    }

    if (name === 'startsAt') {
      dispatch({ type: UPDATE_RUNSHEET_STATE, payload: { key: 'endsAt', value: null } });
    }

    if (name === 'endsAt') {
      const { endTime: endsAt } = getStartEndTimeWithDesiredDate(
        state?.startDate || state?.startsAt,
        state?.startsAt,
        e,
        null,
        true,
      );
      dispatch({ type: UPDATE_RUNSHEET_STATE, payload: { key: name, value: endsAt } });
    } else {
      dispatch({ type: UPDATE_RUNSHEET_STATE, payload: { key: name, value: e } });
    }

    if (name === 'startDate') setStartDate(e);
  };

  useEffect(() => {
    if (startDate === state?.startDate) setIsSameDate(true);
    else setIsSameDate(false);
  }, [state?.startDate]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'isBreakPayable') value = JSON.parse(value);
    dispatch({ type: UPDATE_RUNSHEET_STATE, payload: { key: name, value } });
  };

  useEffect(() => {
    if (!isEditRunsheet)
      dispatch({
        type: UPDATE_RUNSHEET_STATE,
        payload: {
          key: 'isBreakPayable',
          value: isObjectEmpty(state?.breakRule) ? null : true,
        },
      });
  }, [state?.breakRule]);

  const fetchBreakRules = async () => {
    setIsLoadingBreakRules(true);
    try {
      const response = await getBreakRulesDropdownListing();
      if (response && response?.statusCode === 200) {
        setBreakRules(transformArrayForOptions(response?.data?.breakRules, 'name', 'id'));
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoadingBreakRules(false);
    }
  };

  useEffect(() => {
    // Updating breakRule in state if
    // 1. Runsheet is in edit mode
    // 2. BreakRuleId is present in state
    // 3. Break rules are present
    // 4. BreakRule is not present in state
    if (
      isEditRunsheet &&
      state?.breakRuleId &&
      breakRules?.length &&
      state?.breakRule === undefined
    ) {
      let selectedBreakRule = breakRules.find((rule) => rule?.id === state?.breakRuleId);
      if (selectedBreakRule === undefined) {
        selectedBreakRule = null; // if breakRuleId exists in state but not in breakRules list
      }
      dispatch({
        type: UPDATE_RUNSHEET_STATE,
        payload: { key: 'breakRule', value: selectedBreakRule },
      });
    }
  }, [state, breakRules]);

  useEffect(() => {
    if (state?.startsAt && !state?.startDate && isEditRunsheet) {
      dispatch({
        type: UPDATE_RUNSHEET_STATE,
        payload: { key: 'startDate', value: dayjsWithStandardOffset(state?.startsAt) },
      });
    }
  }, [state]);

  useEffect(() => {
    fetchBreakRules();
  }, []);

  const classes = useStyles();
  return (
    <>
      <Box className={classes.runsheetWrapper}>
        <Typography variant="h4">
          {t('obx.runsheet.runsheetDetails', {
            runsheet: getLabel('terms', 'runsheet', t),
          })}
        </Typography>
        {isEditRunsheet && (
          <Box className={classes.runsheetFields}>
            <Box className={classes.splitColms}>
              <Box className={classes.fifityFifty}>
                {(state?.startDate || state?.startsAt) && (
                  <Typography variant="body2" className={classes.smallText}>
                    {t('obx.runsheet.startDate')}:{' '}
                    <Box component="span">
                      {/* {dayjsWithStandardOffset(state?.startDate || state?.startsAt).format(
                        'MM/DD/YYYY',
                      )} */}
                      {formatDayjsDateTime({
                        value: state?.startDate || state?.startsAt,
                        formatType: dayjsFormatsEnum.date,
                      })}
                      {/* {formatDate(dayjsWithStandardOffset(state?.startDate || state?.startsAt))} */}
                    </Box>{' '}
                    <Box component="span" className={classes.dayColor}>
                      {`(${getDayName(state?.startDate || state?.startsAt, t)})`}
                    </Box>
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}
        <Box className={classes.runsheetFields}>
          <InputLabel htmlFor="runsheetName">
            {t('obx.runsheet.runsheetName', {
              runsheet: getLabel('terms', 'runsheet', t),
            })}{' '}
            <RequiredAsterik />
          </InputLabel>
          <TextField
            name="runsheetName"
            id="runsheetName"
            fullWidth
            onChange={(e) => onChangeHandler('runsheetName', e.target.value)}
            placeholder={t('obx.runsheet.enterRunsheetName', {
              runsheet: getLabel('terms', 'runsheet', t),
            })}
            type="text"
            value={state?.runsheetName || null}
            error={!!errorMessages?.runsheetName}
            helperText={!!errorMessages?.runsheetName ? errorMessages?.runsheetName : null}
            className={classes?.textFiledFilter}
          />
        </Box>
        {!isEditRunsheet && (
          <Box className={classes.runsheetFields}>
            <Box className={classes.splitColms}>
              <Box className={classes.fifityFifty}>
                <InputLabel htmlFor="Service Name">
                  {t('obx.runsheet.startDate')} <RequiredAsterik />
                </InputLabel>
                <ResponsiveDatePickers
                  id="startDate"
                  error={!!errorMessages?.startDate}
                  helperText={!!errorMessages?.startDate ? errorMessages?.startDate : null}
                  format="MM/DD/YYYY"
                  inputFormat="MM/DD/YYYY"
                  onChange={(e) => {
                    onChangeHandler('startDate', e);
                    onChangeHandler(
                      'dutyDay',
                      daysOfWeekWithVal(t).find((data) => data?.label === getDayName(e, t))?.value,
                    );
                  }}
                  placeholder={t('obx.runsheet.selectStartDate')}
                  value={state.startDate || null}
                  minDate={dayjs()}
                />
                {state?.startDate && (
                  <Typography variant="body2" className={classes.smallText}>
                    {t('obx.runsheet.selectedDay')}:{' '}
                    <Box component="span" className={classes.dayColor}>
                      {getDayName(state?.startDate, t)}
                    </Box>
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}
        <Box className={classes.runsheetFields}>
          <Box className={classes.splitColms}>
            <Box className={classes.fifityFifty}>
              <InputLabel htmlFor="startTime">
                {t('obx.runsheet.startTime')} <RequiredAsterik />
              </InputLabel>
              <ResponsiveTimePickers
                name="startsAt"
                timeStepsMinutes={1}
                disabled={!!!state?.startDate && !!!state?.startsAt}
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
                disabled={!!!state?.startsAt}
                onChange={(e) => onChangeHandler('endsAt', e)}
                value={state?.endsAt || null}
                id="endsAt"
                placeholder={t('obx.runsheet.selectEndTime')}
              />
            </Box>
          </Box>
        </Box>
        <Typography variant="h4">{t('obx.runsheet.breakConfigurations')}</Typography>
        <Box className={classes.runsheetFields}>
          <Box className={classes.splitColms}>
            <Box className={classes.fifityFifty}>
              <InputLabel htmlFor="associateBreakRule">
                {t('obx.runsheet.associateBreakRule')}
              </InputLabel>
              {isLoadingBreakRules && !breakRules?.length ? (
                <Skeleton className={classes.skeletonDropdown} />
              ) : (
                <CustomDropDown
                  name={'breakRule'}
                  label={t('obx.runsheet.placeholders.selectBreakRule')}
                  placeholder={t('obx.runsheet.placeholders.selectBreakRule')}
                  options={breakRules || []}
                  selectedValues={state?.breakRule || {}}
                  handleChange={handleChange}
                  isError={false}
                  bordered={true}
                  className={'selectInnerWrapper'}
                  searchable
                />
              )}
            </Box>
            {/* <Box className={classes.fifityFifty}>
              <InputLabel htmlFor="payOfficerForBreaks">
                {t('obx.runsheet.payOfficerForBreaks')}
              </InputLabel>
              <Box className={classes.radioWrapper}>
                <RadioGroup
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  className={classes.radioDiv}
                  value={state?.isBreakPayable ?? null}
                  name={t('obx.runsheet.keys.isBreakPayable')}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    control={<Radio />}
                    value={true}
                    label={t('obx.runsheet.yes')}
                  />
                  <FormControlLabel
                    control={<Radio />}
                    value={false}
                    label={t('obx.runsheet.no')}
                  />
                </RadioGroup>
              </Box>
            </Box> */}
          </Box>
        </Box>
      </Box>
    </>
  );
};
RunSheetDetailsTabs.propTypes = {
  state: PropTypes.shape({
    runsheetName: PropTypes.string,
    startsAt: PropTypes.string,
    startDate: PropTypes.string,
    endsAt: PropTypes.string, // Ensure this line is present
    startEndLocation: PropTypes.object,
    dutyDay: PropTypes.array,
    breakRule: PropTypes.object,
    isBreakPayable: PropTypes.boolean ?? null,
    breakRuleId: PropTypes.number,
  }).isRequired,
  activeStep: PropTypes.string,
  dispatch: PropTypes.function,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
  setIsSameDate: PropTypes.func,
  isSameDate: PropTypes.bool,
  isEditRunsheet: PropTypes.bool,
};

export default RunSheetDetailsTabs;
