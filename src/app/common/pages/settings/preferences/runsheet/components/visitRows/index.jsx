import { Box, TextField, Tooltip, Typography } from '@mui/material';
import { ReactComponent as CautionIcon } from 'assets/svg/caution-thin.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { showError } from 'src/helper/utilityFunctions';

import { useStyles } from '../../runsheetStyle';

const VisitRows = ({
  data,
  onValueChange,
  index,
  errors,
  name,
  valKey = 'value',
  descKey = 'description',
}) => {
  const classes = useStyles();

  const handleInputChange = (e) => {
    onValueChange(e, index, valKey);
  };

  const valueError = showError({
    key: valKey,
    formDataKey: name,
    index,
    errors,
  });

  return (
    <Box className={classes.serviceHeader}>
      <Box className={classes.titleField}>
        <Typography variant="subtitle2" className={classes.titleFieldText}>
          {data.key || 'N/A'}
        </Typography>
        <Tooltip arrow title={data[descKey] || ''}>
          <CautionIcon />
        </Tooltip>
      </Box>
      <Box>
        <TextField
          className={classes.inputField}
          value={data[valKey] || ''}
          onChange={handleInputChange}
          name={name}
          helperText={valueError}
          error={!!valueError}
          type="number"
        />
      </Box>
    </Box>
  );
};

VisitRows.propTypes = {
  data: PropTypes.object.isRequired,
  onValueChange: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  errors: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  valKey: PropTypes.string,
  descKey: PropTypes.string,
};

export default VisitRows;
