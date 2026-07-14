import { Box, Button, InputLabel, Typography } from '@mui/material';
import { ReactComponent as TrashIcon } from 'assets/svg/trash.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import FieldError from 'src/app/components/common/fieldError';
import { ReactComponent as PlusIcon } from 'src/assets/svg/plus.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useStyles } from '../assignmentSideDrawer.styles';

const occurancesInitialValue = {
  repeatTour: null,
  repeatAfterTime: null,
};

const Occurances = ({
  formData,
  setFormData,
  errorMessages,
  index,
  setErrorMessagesTours,
  readOnlyMode,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const handleChangeOccurances = (e) => {
    setFormData((prev) => {
      return prev.map((data) => {
        if (data?.key === formData?.key) {
          return {
            ...data,
            occurances: {
              ...(data?.occurances || {}),
              [e.target.name]: e.target.value,
            },
          };
        }
        return data;
      });
    });

    // remove Error Message
    if (!errorMessages?.occurances?.[e.target.name]) return;
    setErrorMessagesTours((prev = []) => {
      prev[index].occurances[e.target.name] = null;
      return [...prev];
    });
  };

  const handleAddDeleteOccurances = (value) => {
    setFormData((prev) => {
      return prev.map((data) => {
        if (data?.key === formData?.key) {
          return {
            ...data,
            occurances: value,
          };
        }
        return data;
      });
    });

    // remove Error Message
    if (!errorMessages?.occurances) return;
    setErrorMessagesTours((prev = []) => {
      prev[index].occurances = null;
      return [...prev];
    });
  };

  return (
    <>
      {!formData?.occurances && (
        <Box className={classes.assignShiftBodyAddTours}>
          <Button
            className={classes.assignShiftBodyAddToursBtn}
            disableRipple
            variant="onlyText"
            startIcon={<PlusIcon opacity={readOnlyMode ? 0.5 : 1} />}
            onClick={() => handleAddDeleteOccurances(occurancesInitialValue)}
            disabled={readOnlyMode}
          >
            {t('obx.schedules.assignDedicatedDuty.assignShift.addOccurances')}
          </Button>
          <Typography variant="subtitle2" className={classes.assignShiftBodyAddToursText}>
            {t('obx.schedules.assignDedicatedDuty.assignShift.optional')}
          </Typography>
        </Box>
      )}
      {formData?.occurances && (
        <Box className={classes.createToursOccurances}>
          <Button
            variant="tertiaryGrey"
            className={classes.createToursOccurancesBtn}
            endIcon={<TrashIcon opacity={readOnlyMode ? 0.5 : 1} />}
            disableRipple
            onClick={() => handleAddDeleteOccurances(null)}
            disabled={readOnlyMode}
          >
            {t('obx.schedules.assignDedicatedDuty.assignShift.occurances')}
          </Button>
          <Box className={classes.createToursTime}>
            <Box className={classes.createToursTimePicker}>
              <InputLabel>
                {t('obx.schedules.assignDedicatedDuty.assignShift.repeatTourLabel', {
                  tour: getLabel('terms', 'tour', t),
                })}
              </InputLabel>
              <CustomDropDown
                label={t('obx.schedules.assignDedicatedDuty.assignShift.repeatTourPlaceholder', {
                  tour: getLabel('terms', 'tour', t),
                })}
                name="repeatTour"
                placeHolder={t(
                  'obx.schedules.assignDedicatedDuty.assignShift.repeatTourPlaceholder',
                  { tour: getLabel('terms', 'tour', t) },
                )}
                selectedValues={formData?.occurances?.repeatTour || {}}
                options={repeatTourOptions(t)}
                handleChange={handleChangeOccurances}
                bordered
                className={classes.createToursDropDown}
                isError={errorMessages?.occurances?.repeatTour}
                disabled={readOnlyMode}
              />
              <FieldError error={errorMessages?.occurances?.repeatTour} />
            </Box>
            <Box className={classes.createToursDuration}>
              <InputLabel>
                {t('obx.schedules.assignDedicatedDuty.assignShift.repeatAfterTimeLabel')}
              </InputLabel>
              <CustomDropDown
                label={t(
                  'obx.schedules.assignDedicatedDuty.assignShift.repeatAfterTimePlaceholder',
                )}
                name="repeatAfterTime"
                placeHolder={t(
                  'obx.schedules.assignDedicatedDuty.assignShift.repeatAfterTimePlaceholder',
                )}
                selectedValues={formData?.occurances?.repeatAfterTime || {}}
                options={repeatAfterTimeOptions}
                handleChange={handleChangeOccurances}
                bordered
                className={classes.createToursDropDown}
                isError={errorMessages?.occurances?.repeatAfterTime}
                disabled={readOnlyMode}
              />
              <FieldError error={errorMessages?.occurances?.repeatAfterTime} />
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Occurances;

Occurances.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  errorMessages: PropTypes.object,
  index: PropTypes.number,
  setErrorMessagesTours: PropTypes.func,
  readOnlyMode: PropTypes.bool,
};

export const INFINITE_REPEAT_TOUR = 'infinite';

const repeatTourOptions = (t) => [
  {
    value: '2',
    label: '2',
  },
  {
    value: '3',
    label: '3',
  },
  {
    value: '4',
    label: '4',
  },
  {
    value: '5',
    label: '5',
  },
  {
    value: '6',
    label: '6',
  },
  {
    value: INFINITE_REPEAT_TOUR,
    label: t('obx.schedules.assignDedicatedDuty.assignShift.repeatInfinite'),
  },
];

const repeatAfterTimeOptions = [
  {
    value: '10',
    label: '10',
  },
  {
    value: '20',
    label: '20',
  },
  {
    value: '30',
    label: '30',
  },
  {
    value: '40',
    label: '40',
  },
  {
    value: '50',
    label: '50',
  },
  {
    value: '60',
    label: '60',
  },
];
