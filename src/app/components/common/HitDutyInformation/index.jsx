import {
  Box,
  Button,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { ReactComponent as VisitIcon } from 'assets/svg/VisitIcon.svg?react';
import { ReactComponent as PlusIcon } from 'assets/svg/Whiteplus.svg?react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  serviceTypes,
  visitTypes,
} from 'src/app/components/salesComponents/contractCreation/addServices/helper';
import { DeleteIcon } from 'src/assets/svg';
import { FormKeys } from 'src/helper/contract';
import {
  getUniqueOrderedDaysOfWeekBetweenDates,
  removeKey,
  removeKeysFromObject,
} from 'src/helper/utilityFunctions';
import { useCurrency } from 'src/hooks/useCurrency';
import { daysOfWeekWithVal } from 'src/utils/constants';

import DaysSelection from '../daysSelection';
import FuelSurchargeInputDropdown from '../fuelSurchargeInputDropdown';
import DateRangePickerWithButtons from '../RangeDatepicker';
import RequiredAsterik from '../requiredAsterik';
import ResponsiveTimePickers from '../timePicker';
import { useStyles } from './HitDutyInformation.style';

const MAX_NUMBER_OF_VISITS = 50;

const defaultVisit = {
  visitType: visitTypes.RANDOM,
  visitsPerDay: 1,
  startTime: null,
  endTime: null,
  visitTime: null,
};

const defaultService = {
  pricePerVisit: '',
  fuelSurchargeEnabled: false,
  fuelSurchargeType: 'percentage',
  fuelSurchargeValue: '',
  dateRange: [],
  visitDays: [],
  visits: [defaultVisit],
};

const HitDutyInformation = ({
  formData,
  errorMessages,
  updateFormHandler,
  formDataKey,
  setErrorMessages,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { currency: franchiseCurrency } = useCurrency();

  const services = formData?.[formDataKey] ?? [];
  const isTrueFlag = (value) => value === true || `${value}`.toLowerCase() === 'true';
  const isFlatContract = isTrueFlag(formData?.isFlat) || isTrueFlag(formData?.IsFlat);

  useEffect(() => {
    if (!services.length) {
      updateFormHandler(formDataKey, [defaultService]);
    }
  }, [services]);

  const updateServices = (updated) => updateFormHandler(formDataKey, updated);

  const getErrorKey = (...keys) => keys.join(',');
  const showError = (...keys) => errorMessages?.[getErrorKey(...keys)];

  const updateServiceFuelCheck = (serviceIndex, isChecked) => {
    const updated = [...services];
    updated[serviceIndex] = {
      ...updated[serviceIndex],
      fuelSurchargeEnabled: isChecked,
      ...(!isChecked && {
        fuelSurchargeValue: '',
        fuelSurchargeType: 'percentage',
      }),
    };
    updateServices(updated);
    setErrorMessages((prev) =>
      removeKeysFromObject(prev, [
        getErrorKey('extraHitServices', serviceIndex, 'fuelSurchargeValue'),
        getErrorKey('extraHitServices', serviceIndex, 'fuelSurchargeType'),
      ]),
    );
  };

  // SERVICE FIELD CHANGE
  const updateServiceField = (s, field, value) => {
    const updated = [...services];
    updated[s] = { ...updated[s], [field]: value };

    /**
     * It will only store floating values upto 2 decimel places
     */
    if (field === 'pricePerVisit' && !value.match(/^(?:\d{1,3}(\.\d{1,2})?)?$/)) {
      return;
    }

    updateServices(updated);

    // Clear error for this field
    setErrorMessages((prev) => removeKey([getErrorKey('extraHitServices', s, field)], prev));

    for (let i = 0; i < updated[s].visits.length; i++) {
      // Removing end time key of all visits
      setErrorMessages((prev) =>
        removeKey([getErrorKey('extraHitServices', s, 'visits', i, 'endTime')], prev),
      );
    }
  };

  // VISIT FIELD CHANGE
  const updateVisitField = (s, v, field, value) => {
    const updated = [...services];
    const visits = [...updated[s].visits];
    visits[v] = { ...visits[v], [field]: value };

    // Conditional defaults
    if (field === 'visitType') {
      if (value === visitTypes.FIXED) {
        setErrorMessages((prev) =>
          removeKey([getErrorKey('extraHitServices', s, 'visits', v, 'startTime')], prev),
        );
        setErrorMessages((prev) =>
          removeKey([getErrorKey('extraHitServices', s, 'visits', v, 'endTime')], prev),
        );
        visits[v] = { ...visits[v], visitsPerDay: 1, startTime: null, endTime: null };
      }
      if (value === visitTypes.RANDOM) {
        setErrorMessages((prev) =>
          removeKey([getErrorKey('extraHitServices', s, 'visits', v, 'visitTime')], prev),
        );
        visits[v] = { ...visits[v], visitTime: null };
      }
    }
    if (field === 'visitsPerDay' && value > MAX_NUMBER_OF_VISITS) {
      visits[v].visitsPerDay = MAX_NUMBER_OF_VISITS;
    }

    updated[s].visits = visits;
    updateServices(updated);

    // Clear visit-level errors
    setErrorMessages((prev) =>
      removeKey([getErrorKey('extraHitServices', s, 'visits', v, field)], prev),
    );
  };

  const addService = () => updateServices([...services, defaultService]);
  const deleteService = (s) => {
    services[s].visits.forEach((_visit, visitIndex) => {
      ['visitType', 'visitsPerDay', 'startTime', 'endTime', 'visitTime'].forEach((key) => {
        setErrorMessages((prev) =>
          removeKey([getErrorKey('extraHitServices', s, 'visits', visitIndex, key)], prev),
        );
      });
    });

    ['pricePerVisit', 'dateRange', 'visitDays', 'fuelSurchargeValue', 'fuelSurchargeType'].forEach(
      (key) => {
        setErrorMessages((prev) => removeKey([getErrorKey('extraHitServices', s, key)], prev));
      },
    );

    if (services.length === 1) return;
    updateServices(services.filter((_, i) => i !== s));
  };

  const addVisit = (s) => {
    const updated = [...services];
    updated[s].visits.push(defaultVisit);
    updateServices(updated);
  };

  const deleteVisit = (serviceIndex, visitIndex) => {
    setErrorMessages((prev) => {
      // Copy previous errors
      const updatedErrors = { ...prev };

      // Remove service-level errors
      ['pricePerVisit', 'dateRange', 'visitDays'].forEach((key) => {
        const serviceKey = getErrorKey('extraHitServices', serviceIndex, key);
        delete updatedErrors[serviceKey];
      });

      // Remove visit-level errors
      ['visitType', 'visitsPerDay', 'startTime', 'endTime', 'visitTime'].forEach((key) => {
        const visitKey = getErrorKey('extraHitServices', serviceIndex, 'visits', visitIndex, key);
        console.log({ visitKey });
        delete updatedErrors[visitKey];
      });

      return updatedErrors;
    });

    // Update services array
    const updatedServices = [...services];

    // Prevent deleting last visit
    if (updatedServices[serviceIndex].visits.length <= 1) return;

    // Remove the visit
    updatedServices[serviceIndex].visits = updatedServices[serviceIndex].visits.filter(
      (_, i) => i !== visitIndex,
    );

    updateServices(updatedServices);
  };

  return (
    <Box>
      {services.map((service, serviceIndex) => {
        const daysBetween =
          service.dateRange?.[0] && service.dateRange?.[1]
            ? getUniqueOrderedDaysOfWeekBetweenDates(service.dateRange[0], service.dateRange[1])
            : [];

        const differenceInDays =
          service.dateRange?.[0] && service.dateRange?.[1]
            ? Math.abs(dayjs(service.dateRange[1]).diff(dayjs(service.dateRange[0]), 'day')) + 1
            : null;

        const daysToShow =
          differenceInDays && differenceInDays > 7
            ? daysOfWeekWithVal(t)
            : daysBetween.length
              ? daysBetween
              : daysOfWeekWithVal(t);

        return (
          <Box className={classes.visitAreaBox} key={serviceIndex}>
            {/* SERVICE HEADER */}
            <Box className={classes.petrolAreaHeader}>
              <Typography className={classes.visitAreaTitle} variant="h5">
                {t('sales.contract.service')} {serviceIndex + 1}
              </Typography>

              {services.length > 1 && (
                <Box className={classes.deleteBtn} onClick={() => deleteService(serviceIndex)}>
                  <DeleteIcon />
                </Box>
              )}
            </Box>

            {/* SERVICE FIELDS */}
            <Box className={classes.serviceWrapper}>
              <Box className={classes.fieldWrapper}>
                <InputLabel>
                  {`${t('sales.contract.pricePerVisit')} (${franchiseCurrency})`}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  fullWidth
                  type="number"
                  value={service.pricePerVisit}
                  onChange={(e) =>
                    updateServiceField(serviceIndex, 'pricePerVisit', e.target.value)
                  }
                  placeholder={`${franchiseCurrency}25`}
                  className={classes.inputField}
                  error={!!showError('extraHitServices', serviceIndex, 'pricePerVisit')}
                  helperText={showError('extraHitServices', serviceIndex, 'pricePerVisit')}
                />
              </Box>

              <Box className={classes.fieldWrapper}>
                <InputLabel>
                  {t('sales.contract.selectDateRange')}
                  <RequiredAsterik />
                </InputLabel>
                <DateRangePickerWithButtons
                  selectedDates={service.dateRange}
                  setDates={(dates) => updateServiceField(serviceIndex, 'dateRange', dates)}
                  styleClass={classes.dateRangePicker}
                />
                {!!showError('extraHitServices', serviceIndex, 'dateRange') && (
                  <Box>
                    <div className={classes.invalidFeedback}>
                      {showError('extraHitServices', serviceIndex, 'dateRange')}
                    </div>
                  </Box>
                )}
              </Box>
            </Box>

            {service.dateRange?.length ? (
              <Box className={classes.dayPicker}>
                <InputLabel>{t('sales.contract.visitDays')}</InputLabel>
                <Box className={classes.DaysWrap}>
                  <DaysSelection
                    data={daysToShow}
                    selectedDays={service.visitDays}
                    handleChange={(e) =>
                      updateServiceField(serviceIndex, 'visitDays', e.target.value)
                    }
                    name={FormKeys.DUTY_DAYS}
                    styledClass={classes.dutyDays}
                    truncateTo={3}
                  />
                </Box>
                {!!showError('extraHitServices', serviceIndex, 'visitDays') && (
                  <Box>
                    <div className={classes.invalidFeedback}>
                      {showError('extraHitServices', serviceIndex, 'visitDays')}
                    </div>
                  </Box>
                )}
              </Box>
            ) : null}

            {/* VISITS */}
            {service.visits.map((visit, visitIndex) => (
              <Box className={classes.visitAreaBox} key={visitIndex}>
                <Box className={classes.visitBox}>
                  <Box className={classes.petrolAreaHeader}>
                    <Typography className={classes.visitAreaTitle} variant="h5">
                      {t('sales.contract.visitsSet')} {visitIndex + 1}
                    </Typography>

                    {service.visits.length > 1 && (
                      <Box
                        className={classes.deleteBtn}
                        onClick={() => deleteVisit(serviceIndex, visitIndex)}
                      >
                        <DeleteIcon />
                      </Box>
                    )}
                  </Box>

                  <Box className={classes.radioOption}>
                    <RadioGroup
                      row
                      value={visit.visitType}
                      onChange={(e) =>
                        updateVisitField(serviceIndex, visitIndex, 'visitType', e.target.value)
                      }
                    >
                      <FormControlLabel
                        value={visitTypes.RANDOM}
                        control={<Radio />}
                        label={t('sales.contract.random')}
                      />
                      <FormControlLabel
                        value={visitTypes.FIXED}
                        control={<Radio />}
                        label={t('sales.contract.fixed')}
                      />
                    </RadioGroup>
                  </Box>

                  <Box className={classes.durationPriceDay}>
                    <Box>
                      <InputLabel>
                        {t('sales.contract.visitsPerDay')}
                        <RequiredAsterik />
                      </InputLabel>
                      <TextField
                        type="number"
                        value={visit.visitsPerDay}
                        onChange={(e) =>
                          updateVisitField(serviceIndex, visitIndex, 'visitsPerDay', e.target.value)
                        }
                        className={classes.inputField}
                        fullWidth
                        disabled={visit.visitType === visitTypes.FIXED}
                        error={
                          !!showError(
                            'extraHitServices',
                            serviceIndex,
                            'visits',
                            visitIndex,
                            'visitsPerDay',
                          )
                        }
                        helperText={showError(
                          'extraHitServices',
                          serviceIndex,
                          'visits',
                          visitIndex,
                          'visitsPerDay',
                        )}
                      />
                    </Box>
                  </Box>

                  <Typography className={classes.visitAreaTitle} variant="h5">
                    {t('sales.contract.timeDuration')}
                  </Typography>

                  {visit.visitType === visitTypes.RANDOM ? (
                    <Box className={classes.timePickerField}>
                      <Box className={classes.fieldWrapper}>
                        <InputLabel>
                          {t('obx.sites.createSite.startTime')}
                          <RequiredAsterik />
                        </InputLabel>
                        <ResponsiveTimePickers
                          value={visit.startTime}
                          onChange={(val) =>
                            updateVisitField(serviceIndex, visitIndex, 'startTime', val)
                          }
                          error={
                            !!showError(
                              'extraHitServices',
                              serviceIndex,
                              'visits',
                              visitIndex,
                              'startTime',
                            )
                          }
                          helperText={showError(
                            'extraHitServices',
                            serviceIndex,
                            'visits',
                            visitIndex,
                            'startTime',
                          )}
                        />
                      </Box>

                      <Box className={classes.fieldWrapper}>
                        <InputLabel>
                          {t('obx.sites.createSite.endTime')}
                          <RequiredAsterik />
                        </InputLabel>
                        <ResponsiveTimePickers
                          value={visit.endTime}
                          disabled={!visit.startTime}
                          onChange={(val) =>
                            updateVisitField(serviceIndex, visitIndex, 'endTime', val)
                          }
                          error={
                            !!showError(
                              'extraHitServices',
                              serviceIndex,
                              'visits',
                              visitIndex,
                              'endTime',
                            )
                          }
                          helperText={showError(
                            'extraHitServices',
                            serviceIndex,
                            'visits',
                            visitIndex,
                            'endTime',
                          )}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box className={classes.singleTime}>
                      <InputLabel>
                        {t('sales.contract.visitTime')}
                        <RequiredAsterik />
                      </InputLabel>
                      <ResponsiveTimePickers
                        value={visit.visitTime}
                        onChange={(val) =>
                          updateVisitField(serviceIndex, visitIndex, 'visitTime', val)
                        }
                        error={
                          !!showError(
                            'extraHitServices',
                            serviceIndex,
                            'visits',
                            visitIndex,
                            'visitTime',
                          )
                        }
                        helperText={showError(
                          'extraHitServices',
                          serviceIndex,
                          'visits',
                          visitIndex,
                          'visitTime',
                        )}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            ))}

            <Button
              disableRipple
              variant="onlyText"
              className={classes.notesCloseBtn}
              onClick={() => addVisit(serviceIndex)}
            >
              <VisitIcon />
              <Box component="span" sx={{ paddingLeft: '8px' }}>
                {t('sales.contract.addVisit')}
              </Box>
            </Button>

            {!isFlatContract && (
              <Box className={classes.includeFuelSurchargeBox}>
                <FuelSurchargeInputDropdown
                  name="fuelSurchargeValue"
                  id={`fuelSurchargeValue-${serviceIndex}`}
                  label={t('obx.sites.createSite.includeFuelSurcharge', 'Include Fuel Surcharge')}
                  checked={!!service.fuelSurchargeEnabled}
                  onCheckChange={(isChecked) => updateServiceFuelCheck(serviceIndex, isChecked)}
                  placeholder={t('obx.sites.createSite.enterFuelSurcharge', 'E.g; 20')}
                  value={service.fuelSurchargeValue || ''}
                  dropdownValue={service.fuelSurchargeType || 'percentage'}
                  onChange={(e) =>
                    updateServiceField(serviceIndex, 'fuelSurchargeValue', e.target.value)
                  }
                  onDropdownChange={(e) =>
                    updateServiceField(serviceIndex, 'fuelSurchargeType', e.target.value)
                  }
                  surchargeServiceType={serviceTypes.PATROL}
                  error={
                    !!(
                      showError('extraHitServices', serviceIndex, 'fuelSurchargeValue') ||
                      showError('extraHitServices', serviceIndex, 'fuelSurchargeType')
                    )
                  }
                  helperText={
                    showError('extraHitServices', serviceIndex, 'fuelSurchargeValue') ||
                    showError('extraHitServices', serviceIndex, 'fuelSurchargeType') ||
                    ''
                  }
                />
              </Box>
            )}
          </Box>
        );
      })}

      <Box className={classes.addServiceBtn}>
        <Button onClick={addService} variant="primary" startIcon={<PlusIcon />}>
          {t('obx.sites.createSite.addServices')}
        </Button>
      </Box>
    </Box>
  );
};

export default HitDutyInformation;

HitDutyInformation.propTypes = {
  formData: PropTypes.object,
  errorMessages: PropTypes.object,
  updateFormHandler: PropTypes.func,
  formDataKey: PropTypes.string,
  setErrorMessages: PropTypes.func,
};
