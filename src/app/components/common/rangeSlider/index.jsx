import { Box, TextField, Typography } from '@mui/material';
import Slider from '@mui/material/Slider';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';
// import { useTranslation } from 'react-i18next';
const useStyles = makeStyles((theme) => ({
  popoverBox: {
    padding: '14px 14px 28px 14px',
  },
  ValuesCols: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0px',
    '& .MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'uppercase',
      fontWeight: '400',
    },
  },
  InlineRangeField: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    '& .MuiOutlinedInput-root': {
      minWidth: '118px',
      maxWidth: '118px',
    },
  },
}));

function valuetext(value) {
  return `${value}°C`;
}
const RangeSlider = ({
  min,
  max,
  // valSymbol,
  value,
  handleChange,
  name,
  label,
  minPlaceholder,
  maxPlaceholder,
  minInputDisabled,
  maxInputDisabled,
}) => {
  // const { t } = useTranslation();
  const classes = useStyles();

  const updateRangeSlider = (e, index) => {
    let val = e.target.value === '' ? '0' : e.target.value;

    if (val !== '0') val = val?.replace(/^0+/, '');

    if (val <= max) {
      const data = [...value];

      data[index] = parseInt(val);
      handleChange(name, data);
    }
  };

  const handleSliderValChange = (e, newVal) => {
    handleChange(name, newVal);
  };

  return (
    <Box className={classes.popoverBox}>
      <Typography variant="h5">{label}</Typography>
      <Box className={classes.ValuesCols}>
        <Typography variant="subtitle3">
          {/*{valSymbol}*/}
          {minPlaceholder}
        </Typography>
        <Typography variant="subtitle3">
          {/*{valSymbol}*/}
          {maxPlaceholder}
        </Typography>
      </Box>
      <Box>
        <Slider
          sx={{
            '& .MuiSlider-thumb': {
              width: '12px',
              height: '12px',
              backgroundColor: '#146DFF',
            },
            '& .MuiSlider-track': {
              backgroundColor: '#146DFF',
            },
          }}
          getAriaLabel={() => 'Temperature range'}
          value={value}
          onChange={handleSliderValChange}
          valueLabelDisplay="auto"
          getAriaValueText={valuetext}
          color="primary"
          min={min}
          max={max}
        />
      </Box>
      <Box className={classes.InlineRangeField}>
        <TextField
          type="number"
          inputProps={{ max: max - 1, min: 0 }}
          value={parseInt(value[0])}
          min={0}
          max={max}
          fullWidth
          className={classes.customDropdownSearchField}
          onChange={(a) => updateRangeSlider(a, 0)}
          placeholder={minPlaceholder}
          disabled={minInputDisabled}
        />
        -
        <TextField
          type="number"
          inputProps={{ max: max, min: value[0] }}
          value={parseInt(value[1])}
          min={0}
          max={max}
          fullWidth
          className={classes.customDropdownSearchField}
          onChange={(a) => updateRangeSlider(a, 1)}
          placeholder={maxPlaceholder}
          disabled={maxInputDisabled}
        />
      </Box>
    </Box>
  );
};

RangeSlider.propTypes = {
  min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  valSymbol: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.number).isRequired,
  handleChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  minPlaceholder: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  maxPlaceholder: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minInputDisabled: PropTypes.bool,
  maxInputDisabled: PropTypes.bool,
};

RangeSlider.defaultProps = {
  min: 0,
  max: 100,
  valSymbol: '$',
  minInputDisabled: false,
  maxInputDisabled: false,
};

export default RangeSlider;
