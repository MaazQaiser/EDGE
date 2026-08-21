import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { CalenderIcon } from 'assets/svg';
import classNames from 'classnames';
import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import PropTypes from 'prop-types';
import useDateTime from 'src/hooks/useDateTime';

dayjs.extend(updateLocale);
// Update the 'en' locale to start the week on Saturday (6)
dayjs.updateLocale('en', {
  weekStart: 6, // Saturday = 6, Sunday = 0, Monday = 1, ...,
});

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
      marginRight: '-2px',
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
        },
      },
    },
  },
}));

const ResponsiveDatePickers = ({
  value,
  onChange,
  format,
  minDate,
  maxDate,
  disabled,
  helperText,
  error,
  placeholder,
  views,
  className,
  timezone,
  setToStartOfDay,
  setToEndOfDay,
  isInputFieldReadOnly,
  label,
}) => {
  const classes = useStyles();

  const { dateformat } = useDateTime();

  // An explicit `format` prop is the caller opting out of the tenant's own date format
  // for this one field, so it wins; otherwise fall back to the tenant's format.
  const effectiveFormat = format || dateformat;

  return (
    <Box className={classes.datePickerContainer}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={['DatePicker', 'DesktopDatePicker', 'StaticDatePicker']}>
          <DatePicker
            label={label}
            value={dayjs(value)}
            onChange={(newValue) => {
              if (!newValue) return;
              let processedValue = newValue;
              if (setToStartOfDay) {
                processedValue = dayjs(newValue).startOf('day');
              } else if (setToEndOfDay) {
                processedValue = dayjs(newValue).endOf('day');
              }
              onChange(processedValue);
            }}
            views={views}
            format={effectiveFormat}
            className={classNames(className, 'calendar')}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
            timezone={timezone}
            slots={{
              openPickerIcon: CalenderIcon,
            }}
            slotProps={{
              textField: {
                helperText: helperText,
                error: error,
                placeholder: placeholder,
                readOnly: isInputFieldReadOnly,
              },
              popper: {
                className: classes.datePickerPopper,
              },
            }}
          />
        </DemoContainer>
      </LocalizationProvider>
    </Box>
  );
};

ResponsiveDatePickers.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  label: PropTypes.string,
  minDate: PropTypes.string,
  maxDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChange: PropTypes.func.isRequired,
  format: PropTypes.string,
  disabled: PropTypes.bool,
  helperText: PropTypes.string,
  error: PropTypes.bool,
  placeholder: PropTypes.string,
  views: PropTypes.array,
  className: PropTypes.string,
  timezone: PropTypes.string,
  setToStartOfDay: PropTypes.bool,
  setToEndOfDay: PropTypes.bool,
  isInputFieldReadOnly: PropTypes.bool,
};

ResponsiveDatePickers.defaultProps = {
  label: '',
  minDate: null,
  maxDate: null,
  disabled: false,
  /* No default here any more — `format` had one (`MM/DD/YYYY`) that `effectiveFormat`
     never actually reached, because a defaulted prop is never `undefined` and always
     out-ranked the tenant's own `dateformat`. Leaving it unset is what lets a caller's
     explicit `format` mean something while every other screen still gets the tenant's
     own setting. */
  placeholder: 'mm/dd/yyyy',
  helperText: '',
  error: false,
  views: null,
  timezone: 'default',
  setToStartOfDay: false,
  setToEndOfDay: false,
  isInputFieldReadOnly: false,
};

export default ResponsiveDatePickers;
