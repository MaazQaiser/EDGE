import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import PropTypes from 'prop-types';
import {
  adjustHourForTimePayloadInIso,
  adjustHourForTimePopulationWrtCurrentDate,
  getTimezone,
} from 'src/app/obx/pages/schedules/helper';
import useDateTime from 'src/hooks/useDateTime';

/**
 * @param {String} value - Selected Time.
 * @param {String} placeholder - Placeholder
 * @param {String} helperText - Helper Text
 * @param {error} - if true, will make dropdown border red.
 * @param {Function} onChange - A function to react to the selected values.
 * @param {number} minValue - Minimum time which would be selectable.
 * @param {number} maxValue - Maximum time which would be selectable.
 * @param {disabled} - To disable the timePicker.
 * @param {boolean} minValue - To disable Time picker.
 * @param {string} timezone - used to set different timezones.
 * @param {Boolean} error - if true, will make dropdown border red.
 * @return Component
 */

dayjs.extend(utc);
dayjs.extend(timezone);

const useStyles = makeStyles((theme) => ({
  timePickerContainer: {
    '& .MuiStack-root': {
      padding: '0px',
      overflow: 'unset',
    },
    '& .MuiSvgIcon-root': {
      width: '20px',
      height: '20px',
      fill: theme.palette.textPlaceholder,
    },
    '& .MuiButtonBase-root': {
      padding: '5px',
      marginRight: '-10px',
    },

    '& .MuiInputBase-root': {
      height: '44px',
      '&.Mui-disabled': {
        '& .MuiSvgIcon-root': {
          fill: theme.palette.textDisabled,
          '& path': {
            stroke: 'none',
          },
        },
      },
    },
  },
  timePickerPopper: {
    '& .MuiPickersPopper-paper': {
      boxShadow:
        '0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)',
      borderRadius: '8px',

      '& .MuiPickersLayout-root': {
        '& .MuiPickersLayout-contentWrapper': {
          '& .MuiMultiSectionDigitalClock-root ': {
            '& .MuiList-root': {
              '& .MuiButtonBase-root': {
                lineHeight: '24px',
                '&.Mui-selected': {
                  backgroundColor: theme.palette.surfaceBrand,
                },
              },
            },
          },
        },
        '& .MuiPickersLayout-actionBar': {
          '& .MuiButtonBase-root': {
            color: theme.palette.textBrand,
          },
        },
      },
    },
  },
}));

const ResponsiveTimePickers = ({
  value,
  onChange,
  minValue,
  maxValue,
  disabled,
  helperText,
  error,
  placeholder,
  timeStepsMinutes,
  useLocalTimeZone,
}) => {
  const classes = useStyles();
  const { is24Hours } = useDateTime();

  const onChangeValue = (value) => {
    if (useLocalTimeZone) {
      onChange(value);
    } else {
      if (dayjs(value).isValid()) {
        onChange(dayjs(adjustHourForTimePayloadInIso(value)));
      } else {
        onChange(null);
      }
    }
  };

  return (
    <Box className={classes.timePickerContainer}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={['DatePicker', 'DesktopDatePicker', 'StaticDatePicker']}>
          <TimePicker
            value={useLocalTimeZone ? value : adjustHourForTimePopulationWrtCurrentDate(value)}
            onChange={onChangeValue}
            minTime={minValue}
            maxTime={maxValue}
            disabled={disabled}
            timezone={useLocalTimeZone ? 'UTC' : getTimezone()}
            ampm={!is24Hours}
            timeSteps={{ minutes: timeStepsMinutes }}
            slotProps={{
              textField: { helperText: helperText, error: error, placeholder: placeholder },
              popper: {
                className: classes.timePickerPopper,
              },
            }}
          />
        </DemoContainer>
      </LocalizationProvider>
    </Box>
  );
};

ResponsiveTimePickers.propTypes = {
  value: PropTypes.any,
  minValue: PropTypes.any,
  maxValue: PropTypes.any,
  timezone: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  helperText: PropTypes.string,
  error: PropTypes.bool,
  placeholder: PropTypes.string,
  timeStepsMinutes: PropTypes.number,
  useLocalTimeZone: PropTypes.bool,
  enableAmPm: PropTypes.bool,
};

ResponsiveTimePickers.defaultProps = {
  minValue: null,
  maxValue: null,
  disabled: false,
  timezone: 'UTC',
  placeholder: 'hh:mm aa',
  timeStepsMinutes: 5,
  useLocalTimeZone: false,
  error: false,
  helperText: null,
  enableAmPm: true,
};

export default ResponsiveTimePickers;
