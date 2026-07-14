import { Box, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DesktopDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { CalenderIcon } from 'assets/svg';
import classNames from 'classnames';
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
 *
 * @param {String} value - Selected Date.
 * @param {String} label - Label
 * @param {String} minDate - The date from which picker should allow date selection..
 * @param {String} maxDate - The date from which picker should allow date selection..
 * @param {String} format - Dropdown date format.
 * @param {Function} onChange - A function to react to the selected values.
 * @param {String} inputFormat - Input date value format
 * @param {Boolean} disabled - To disable the date picker.
 * @param {String} placeholder - Placeholder
 * @param {String} helperText - Helper Text
 * @param {error} - if true, will make dropdown border red.
 * @param {className} - use this for updating the styles of datepicker
 * @return Component
 */

dayjs.extend(utc);
dayjs.extend(timezone);
const useStyles = makeStyles((theme) => ({
  datePickerContainer: {
    '& .MuiStack-root': {
      padding: '0px',
      overflow: 'unset',
    },
    '& svg': {
      display: 'block',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
    '& .MuiButtonBase-root': {
      padding: '5px',
      marginRight: '-10px',
    },

    '& .MuiInputBase-root': {
      height: '44px',
      '&.Mui-disabled': {
        '& svg': {
          '& path': {
            stroke: theme.palette.textDisabled,
          },
        },
      },
    },
  },
  datePickerPopper: {
    '& .MuiPickersPopper-paper': {
      boxShadow:
        '0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)',
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,

      '& .MuiPickersLayout-root': {
        '& .MuiPickersLayout-contentWrapper': {
          '& .MuiDateCalendar-root ': {
            '& .MuiPickersFadeTransitionGroup-root': {
              '& .MuiDayCalendar-root': {
                '& .MuiPickersSlideTransition-root': {
                  '& .MuiDayCalendar-monthContainer': {
                    '& .MuiDayCalendar-weekContainer': {
                      '& .MuiButtonBase-root': {
                        '&.MuiPickersDay-root': {
                          '&.Mui-selected': {
                            background: theme.palette.surfaceBrand,
                          },
                        },
                      },
                    },
                  },
                },
              },
              '& .MuiYearCalendar-root': {
                '& .MuiPickersYear-yearButton': {
                  '&.Mui-selected': {
                    background: theme.palette.surfaceBrand,
                  },
                },
              },
            },
          },
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
          '& .MuiPickersLayout-actionBar': {
            '& .MuiButtonBase-root': {
              color: theme.palette.textBrand,
            },
          },
        },
      },
    },
  },
}));

const ResponsiveDateTimePickers = ({
  value,
  onChange,
  format,
  minDateTime,
  maxDateTime,
  disabled,
  helperText,
  error,
  placeholder,
  views,
  className,
  timeStepsMinutes,
  useLocalTimeZone,
  readOnly,
}) => {
  const classes = useStyles();
  const { is24Hours, dateTimeFormat } = useDateTime();
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
    <Box className={classes.datePickerContainer}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={['DesktopDateTimePicker']}>
          <DesktopDateTimePicker
            timeSteps={{ minutes: timeStepsMinutes }}
            value={useLocalTimeZone ? value : adjustHourForTimePopulationWrtCurrentDate(value)}
            onChange={onChangeValue}
            views={views}
            format={format ? format : dateTimeFormat}
            className={classNames(className)}
            disabled={disabled}
            minDateTime={adjustHourForTimePopulationWrtCurrentDate(minDateTime)}
            maxDateTime={adjustHourForTimePopulationWrtCurrentDate(maxDateTime)}
            timezone={useLocalTimeZone ? 'UTC' : getTimezone()}
            slots={{
              openPickerIcon: CalenderIcon,
            }}
            slotProps={{
              textField: { helperText: helperText, error: error, placeholder: placeholder },
              popper: {
                className: classes.datePickerPopper,
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  readOnly: readOnly, // Make the input read-only
                }}
              />
            )}
            ampm={!is24Hours}
          />
        </DemoContainer>
      </LocalizationProvider>
    </Box>
  );
};

ResponsiveDateTimePickers.propTypes = {
  value: PropTypes.string,
  label: PropTypes.string,
  minDateTime: PropTypes.string,
  maxDateTime: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  format: PropTypes.string,
  disabled: PropTypes.bool,
  helperText: PropTypes.string,
  error: PropTypes.bool,
  placeholder: PropTypes.string,
  views: PropTypes.array,
  className: PropTypes.object,
  timezone: PropTypes.string,
  timeStepsMinutes: PropTypes.number,
  useLocalTimeZone: PropTypes.bool,
  readOnly: PropTypes.bool,
};

ResponsiveDateTimePickers.defaultProps = {
  label: '',
  minDateTime: null,
  timeStepsMinutes: 5,
  maxDateTime: null,
  disabled: false,
  timezone: 'UTC',
  format: null,
  inputFormat: 'DD-MM-YYYY HH:mm A',
  placeholder: 'DD-MM-YYYY HH:mm A',
  helperText: '',
  error: false,
  views: null,
  useLocalTimeZone: false,
  readOnly: false,
};

export default ResponsiveDateTimePickers;
