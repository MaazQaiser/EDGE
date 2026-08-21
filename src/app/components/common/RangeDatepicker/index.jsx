import styled from '@emotion/styled';
import { Box } from '@mui/material';
import TextField from '@mui/material/TextField';
import { makeStyles } from '@mui/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { CalenderIcon } from 'assets/svg';
import dayjs from 'dayjs';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { formatDate } from 'src/helper/utilityFunctions';
import useDateTime from 'src/hooks/useDateTime';
import { theme } from 'src/theme/index';

dayjs.extend(isBetweenPlugin);

const CustomPickersDay = styled(PickersDay)`
  border-radius: 0;

  &.between-days {
    background-color: #e5f6ff !important;
    color: #262527 !important;
    border-radius: 0;
    border: 0;
  }

  &.start-selected {
    background-color: #146dff !important;
    color: #ffffff !important;
    border-radius: 0 !important;
    border-top-left-radius: 50% !important;
    border-bottom-left-radius: 50% !important;
  }

  &.end-selected {
    background-color: #146dff !important;
    color: #ffffff !important;
    border-radius: 0 !important;
    border-top-right-radius: 50% !important;
    border-bottom-right-radius: 50% !important;
  }

  &.same-days {
    background-color: #146dff !important;
    color: #ffffff !important;
    border-radius: 30px !important;
    //border-top-left-radius: 50% !important;
    //border-bottom-left-radius: 50% !important;
  }

  ${(props) =>
    props.day.day() === 0 &&
    `
    border-top-left-radius: 50% !important;
    border-bottom-left-radius: 50% !important;
  `}

  ${(props) =>
    props.day.day() === 6 &&
    `
    border-top-right-radius: 50% !important;
    border-bottom-right-radius: 50% !important;
  `}
`;

const useStyles = makeStyles((theme) => ({
  dateRangePicker: {
    '& .MuiStack-root': {
      paddingTop: 0,
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
    heights: {
      '& .MuiInputBase-root ': {
        maxHeight: '36px !important',
        height: '36px !important',
      },
    },
  },
  datePickerPopper: {
    '& .MuiPickersPopper-paper': {
      boxShadow:
        '0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)',
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      padding: '0 8px',

      '& .MuiPickersLayout-root': {
        '& .MuiPickersLayout-contentWrapper': {
          '& .MuiDateCalendar-root ': {
            '& .MuiPickersFadeTransitionGroup-root': {
              '& .MuiDayCalendar-root': {
                '& .MuiPickersSlideTransition-root': {
                  '& .MuiDayCalendar-monthContainer': {
                    '& .MuiDayCalendar-weekContainer': {
                      '& .MuiTypography-root': {},
                      '& .MuiButtonBase-root': {
                        '&.MuiPickersDay-root': {
                          border: 0,
                          paddingLeft: 0,
                          paddingRight: 0,

                          '&:focus': {
                            background: 'transparent',
                          },
                          '&:hover': {
                            background: `${theme.palette.surfaceBrandHover} !important`,
                            color: `${theme.palette.textOnColor} !important`,
                          },
                        },
                        '&.MuiPickersDay-today': {
                          paddingLeft: 0,
                          paddingRight: 0,
                          border: `1px solid ${theme.palette.borderBrand}`,
                        },
                        '&.Mui-selected': {
                          background: theme.palette.surfaceBrand,
                          color: theme.palette.textOnColor,
                        },
                      },
                    },
                  },
                },
              },
              '& .MuiYearCalendar-root': {
                '& .MuiPickersYear-root': {
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
  },
}));

const _areAllDatesSelected = (dayA, dayB, dayC) => {
  const isStartBetween = dayC.isSame(dayA, 'day');
  const isEndBetween = dayC.isSame(dayB, 'day');
  const isSameDaySelected = dayC.isSame(dayA, 'day');

  if (!dayB) {
    return isSameDaySelected;
  }
  return (
    dayC.isBetween(dayA, dayB, 'day', '()') || isStartBetween || isEndBetween || isSameDaySelected
  );
};

// const isInSameWeek = (dayA, dayB) => {
//   if (dayB == null && !dayA) {
//     return false;
//   }
//
//   return dayA?.isBetween(dayB);
// };

function Day(props) {
  const { day, endDate, startDate, ...other } = props;

  // Function to check if a day is the start or end date
  const isStartDay = startDate && day?.utc()?.isSame(dayjs(startDate).utc(), 'day');
  const isEndDay = endDate && day?.utc()?.isSame(dayjs(endDate).utc(), 'day');
  const isBetween =
    startDate &&
    endDate &&
    day?.utc()?.isBetween(dayjs(startDate).utc(), dayjs(endDate).utc(), 'day', '[]');

  // Function to check if the current day is after the start date and before the end date
  const isAfterStart = startDate && day?.utc()?.isAfter(dayjs(startDate).utc(), 'day');
  const isBeforeEnd = endDate && day?.utc()?.isBefore(dayjs(endDate).utc(), 'day');

  // Conditionally add classes based on selected dates
  const classes = [];

  if (isStartDay && !(isAfterStart && !isBeforeEnd)) {
    classes.push('start-selected');
  }
  if (isEndDay && !(isBeforeEnd && !isAfterStart)) {
    classes.push('end-selected');
  }
  if (isBetween) {
    classes.push('between-days');
  }

  if (
    endDate &&
    startDate &&
    day?.utc()?.isSame(dayjs(startDate).utc(), 'day') &&
    day?.utc()?.isSame(dayjs(endDate).utc(), 'day')
  ) {
    classes.push('same-days');
  }

  return (
    <CustomPickersDay
      {...other}
      day={day}
      sx={{ px: 2.5 }}
      disableMargin
      theme={theme}
      className={classes.join(' ')}
    />
  );
}

// eslint-disable-next-line react/display-name
const CustomTextInput = React.forwardRef((props, ref) => {
  let containerRef = useRef(null);

  if (props?.InputProps?.ref) {
    containerRef = props?.InputProps?.ref;
  }

  return (
    <div id={props.id} ref={ref}>
      <TextField
        ref={ref}
        slotProps={{
          ...props?.slotProps,
          root: { ...props.slotProps.root, ref: containerRef },
        }}
        inputProps={{
          ...props.InputProps,
          placeholder: props?.placeHolder,
        }}
        {...props}
      />
    </div>
  );
});

const DateRangePicker = (props) => {
  const { onChange, startDate, endDate, placeHolder, selectedVal, disabled, ...rest } = props;

  const [hoveredDay, setHoveredDay] = React.useState(null);

  const classes = useStyles();

  const [value, _setValue] = React.useState(dayjs(startDate));

  return (
    <DatePicker
      value={value}
      onChange={onChange}
      closeOnSelect={false}
      showDaysOutsideCurrentMonth
      disabled={disabled}
      shouldDisableDate={rest?.shouldDisableDate}
      slots={{
        day: Day,
        openPickerIcon: CalenderIcon,
        field: CustomTextInput,
      }}
      slotProps={{
        day: (ownerState) => ({
          selectedDay: value,
          endDate,
          startDate,
          hoveredDay,
          onPointerEnter: () => setHoveredDay(ownerState.day),
          onPointerLeave: () => setHoveredDay(null),
        }),
        field: () => ({
          onChange: () => {},
          value: selectedVal,
          placeHolder: placeHolder,
        }),
        popper: {
          className: classes.datePickerPopper,
        },
      }}
      {...rest}
    />
  );
};

export default function DateRangePickerWithButtons({
  selectedDates,
  setDates,
  format,
  placeHolder,
  styleClass,
  minDate,
  maxDate,
  onClose,
  onOpen,
  disabled,
  shouldDisableDate,
  syncSelectedDatesOnStateChange,
  // convertToFranchiseTimezone,
}) {
  const [startDate, setStartDate] = React.useState(selectedDates?.[0] || null);

  const [endDate, setEndDate] = React.useState(selectedDates?.[1] || null);

  const [datesPicked, setDatesPicked] = React.useState(0);
  const classes = useStyles();
  const { dateformat } = useDateTime();

  // An explicit `format` prop is the caller opting out of the tenant's own date format
  // for this one field, so it wins; otherwise fall back to the tenant's format.
  const effectiveFormat = format || dateformat;
  const dateRangePlaceholder = `${effectiveFormat} - ${effectiveFormat}`;

  /**
   * @description handle single date selection
   */
  const handleClose = () => {
    if (startDate && !endDate) {
      setEndDate(startDate);
      // setDates([startDate, startDate]);
    }
  };
  useEffect(() => {
    /**
     * it will only trigger the event when both start and end dates are available
     */
    if (endDate) {
      setDates([startDate, endDate]);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (syncSelectedDatesOnStateChange) {
      if (selectedDates?.[0]) setStartDate(selectedDates[0]);
      if (selectedDates?.[1]) setEndDate(selectedDates[1]);
    }
  }, [selectedDates]);

  const handleChangeDate = (date) => {
    setDatesPicked((prev) => prev + 1);

    if (endDate && date.isSame(endDate, 'day')) {
      // Set the end date as the new start date and clear the end date
      setStartDate(endDate);
      setEndDate(null);
      return;
    }

    if (datesPicked % 2 === 0) {
      // First selection (or every other click) is for the start date
      setStartDate(date);
      setEndDate(date); // Automatically set the end date to the same as start date initially
    } else {
      // Second selection is for the end date
      if (!startDate.isBefore(date)) {
        // If selected end date is before or same as start date, reset start and end date
        setEndDate(startDate);
        setStartDate(date);
      } else {
        // If selected end date is after the start date, update the end date
        setEndDate(date);
      }
    }
  };

  // const formattedDayjs = convertToFranchiseTimezone ? dayjsWithStandardOffset : dayjs;
  // const formattedStartDate = startDate ? formattedDayjs(startDate).format('YYYY-MM-DD') : null;
  // const formattedEndDate = endDate ? formattedDayjs(endDate).format('YYYY-MM-DD') : null;

  return (
    <Box className={classes.dateRangePicker}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={['DatePicker', 'DesktopDatePicker', 'StaticDatePicker']}>
          <DateRangePicker
            onChange={handleChangeDate}
            startDate={startDate ? dayjs(startDate).format('YYYY-MM-DD') : null}
            setStartDate={setStartDate}
            endDate={endDate ? dayjs(endDate).format('YYYY-MM-DD') : null}
            setEndDate={setEndDate}
            format={format}
            placeHolder={dateRangePlaceholder || placeHolder}
            className={styleClass}
            minDate={minDate}
            maxDate={maxDate}
            onClose={() => {
              handleClose();
              onClose();
            }}
            onOpen={onOpen}
            selectedVal={getPlaceholderSelectedValue(
              startDate,
              endDate,
              effectiveFormat || 'MM/DD/YYYY',
              formatDate,
            )}
            disabled={disabled}
            shouldDisableDate={shouldDisableDate}
          />
        </DemoContainer>
      </LocalizationProvider>
    </Box>
  );
}

CustomTextInput.propTypes = {
  disabled: PropTypes.bool,
  id: PropTypes.string,
  label: PropTypes.node,
  InputProps: PropTypes.shape({
    ref: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
    ]),
    startAdornment: PropTypes.node,
    endAdornment: PropTypes.node,
  }),
  formControlSx: PropTypes.object,
  endDecorator: PropTypes.node,
  startDecorator: PropTypes.node,
  slotProps: PropTypes.object,
  placeHolder: PropTypes.string,
};

DateRangePicker.propTypes = {
  onClose: PropTypes.func,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  renderInput: PropTypes.func,
  startDate: PropTypes.any,
  endDate: PropTypes.any,
  setStartDate: PropTypes.func,
  setEndDate: PropTypes.func,
  placeHolder: PropTypes.string,
  selectedVal: PropTypes.string,
  disabled: PropTypes.bool,
  shouldDisableDate: PropTypes.func,
};

DateRangePickerWithButtons.propTypes = {
  selectedDates: PropTypes.array.isRequired,
  setDates: PropTypes.func.isRequired,
  format: PropTypes.string,
  enableSingleDateSelection: PropTypes.bool,
  placeHolder: PropTypes.string,
  styleClass: PropTypes.string,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  disabled: PropTypes.bool,
  convertToFranchiseTimezone: PropTypes.bool,
  shouldDisableDate: PropTypes.func,
  syncSelectedDatesOnStateChange: PropTypes.bool,
};

DateRangePickerWithButtons.defaultProps = {
  placeHolder: 'mm/dd/yyyy – mm/dd/yyyy',
  onClose: () => {},
  onOpen: () => {},
  disabled: false,
  shouldDisableDate: () => {},
  // convertToFranchiseTimezone: false,
};

Day.propTypes = {
  day: PropTypes.any,
  selectedDay: PropTypes.any,
  hoveredDay: PropTypes.any,
  startDate: PropTypes.any,
  endDate: PropTypes.any,
};

const getPlaceholderSelectedValue = (startDate, endDate, format, formatDate) => {
  let selectedVal = '';

  if (startDate) {
    let startVal = formatDate(startDate, format); // Use formatDate here
    selectedVal = startVal;
  }

  if (endDate) {
    let endVal = formatDate(endDate, format); // Use formatDate here
    selectedVal += ' - ';
    selectedVal += endVal;
  }

  return selectedVal;
};
