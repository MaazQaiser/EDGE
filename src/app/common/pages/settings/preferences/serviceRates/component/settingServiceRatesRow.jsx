import { Box, TextField, Typography } from '@mui/material';
import TableImage from 'commonComponents/tableImage';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { showError } from 'src/helper/utilityFunctions';

import { useStyles } from '../../settingsStyle';

const SettingServiceRatesRow = ({
  data,
  onValueChange,
  index,
  errors,
  name,
  secValKey,

  valKey = 'value',
  descKey = 'description',
  isRange = false,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const handleInputChange = (e) => {
    onValueChange(e, index, valKey);
  };

  const handleInputChangeSecValKey = (e) => {
    onValueChange(e, index, secValKey);
  };

  const valueError = showError({
    key: valKey,
    formDataKey: name,
    index,
    errors,
  });

  const secValueError = showError({
    key: secValKey,
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
      <Box className={classes.dropDownSectionBoxFlexText}>
        <Box>
          <TextField
            className={isRange && secValKey ? classes.inputStylesRange : classes.inputStyles}
            value={data?.[valKey] || ''}
            onChange={handleInputChange}
            name={name}
            helperText={valueError}
            fullWidth
            error={valueError}
            type={'number'}
          />
        </Box>
        {isRange && secValKey && <Box className={classes.servicesDash}>-</Box>}
        {isRange && secValKey && (
          <Box>
            <TextField
              className={isRange && secValKey ? classes.inputStylesRange : classes.inputStyles}
              value={data?.[secValKey] || ''}
              onChange={handleInputChangeSecValKey}
              name={name}
              helperText={secValueError}
              fullWidth
              error={secValueError}
              type={'number'}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

SettingServiceRatesRow.propTypes = {
  data: PropTypes.object.isRequired, // Assuming data is an object, adjust as needed
  onValueChange: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  errors: PropTypes.object.isRequired, // Assuming errors is an object, adjust as needed
  name: PropTypes.string.isRequired,
  valKey: PropTypes.string,
  descKey: PropTypes.string,
  secValKey: PropTypes.string,
  isRange: PropTypes.bool,
};

export default SettingServiceRatesRow;
