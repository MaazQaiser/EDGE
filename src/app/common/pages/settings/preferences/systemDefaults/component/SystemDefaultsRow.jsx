import { Box, Switch, TextField, Typography } from '@mui/material';
import CustomDropDown from 'commonComponents/customDropDown';
import TableImage from 'commonComponents/tableImage';
import ResponsiveTimePickers from 'commonComponents/timePicker';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { showError } from 'src/helper/utilityFunctions';

import { useStyles } from '../../settingsStyle';

const SystemDefaultsRow = ({
  data,
  onValueChange,
  index,
  errors,
  name,
  valKey = 'value',
  descKey = 'description',
  type = 'input',
  // options = [],
  addExtraVal = false,
  isDisabled = false,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const handleInputChange = (e) => {
    onValueChange(e, index, valKey, addExtraVal);
  };

  const valueError = showError({
    key: valKey,
    formDataKey: name,
    index,
    errors,
  });

  return (
    <Box className={classes.serviceSectionWrapper}>
      <div className="tableavatar">
        {data?.image && (
          <TableImage
            imageUrl={data?.image}
            alt={`${t('commonText.image.alt', {
              name: `${data?.key}`,
            })}`}
          />
        )}
        <Typography variant="subtitle2" className={classes.weekDaysName}>
          {data?.key}
        </Typography>
      </div>
      <Box className={classes.dropDownSectionBox}>
        <Typography variant="subtitle2" className={classes.weekDaysName}>
          {data?.[descKey]}
        </Typography>
      </Box>
      <Box className={classes.dropDownSectionBox}>
        {type === 'input' && (
          <TextField
            value={data?.[valKey] ?? ''}
            onChange={handleInputChange}
            name={name}
            helperText={valueError}
            fullWidth
            error={valueError}
            type={'number'}
            className={classes.inputStyles}
            disabled={isDisabled}
          />
        )}
        {type === 'dropDown' && (
          <CustomDropDown
            options={data?.options}
            selectedValues={data?.[valKey] || {}}
            handleChange={handleInputChange}
            name={name}
            helperText={valueError}
            isError={valueError}
            bordered
            disabled={isDisabled}
          />
        )}
        {type === 'timer' && (
          <ResponsiveTimePickers
            value={
              data?.[valKey] && typeof data?.[valKey] !== 'number'
                ? dayjsWithStandardOffset(data?.[valKey])
                : null
            }
            onChange={(e) => {
              const event = {
                target: {
                  value: e,
                  name,
                },
              };

              handleInputChange(event);
            }}
            format="hh:mm A"
            inputFormat="hh:mm A"
            disabled={isDisabled}
          />
        )}
        {type === 'switch' && (
          <Box className={classes.switchSectionBox}>
            <Switch
              name={name}
              checked={Boolean(data?.[valKey])}
              onChange={(e) => {
                const event = {
                  target: {
                    value: e.target.checked,
                    name,
                  },
                };
                handleInputChange(event);
              }}
              inputProps={{ 'aria-label': name }}
              disabled={isDisabled}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

SystemDefaultsRow.propTypes = {
  info: PropTypes.object,
  loading: PropTypes.bool,
  data: PropTypes.object,
  onValueChange: PropTypes.func,
  index: PropTypes.number,
  errors: PropTypes.object,
  name: PropTypes.string,
  valKey: PropTypes.string,
  descKey: PropTypes.string,
  type: PropTypes.string,
  options: PropTypes.array,
  addExtraVal: PropTypes.bool,
  isDisabled: PropTypes.bool,
};

export default SystemDefaultsRow;
