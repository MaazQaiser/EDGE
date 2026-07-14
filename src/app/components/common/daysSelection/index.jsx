import { Box } from '@mui/material';
import classNames from 'classnames';
import { useStyles } from 'commonComponents/daysSelection/style';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

/**
 * DaysSelection is a component for selecting days.
 *
 * @param {Array} data - An array of objects representing the days to be displayed for selection.
 * @param {Array} selectedDays - An array of values representing the days that are currently selected.
 * @param {Function} handleChange - A function that is called when a day is toggled (selected/unselected).
 * @param {String} name - Name associated with the selection input.
 * @param {Number} truncateTo - Maximum length to which the label of each day should be truncated.
 * @param {String} styledClass - Optional class name to be applied to individual day elements for custom styling.
 * @param {array} disabled - Optional array of days(numbers) to disable days selection
 * @return Component
 *
 */
const DaysSelection = ({
  data,
  selectedDays,
  handleChange,
  name,
  truncateTo,
  styledClass,
  disabled,
}) => {
  const classes = useStyles();

  const toggleDay = (day) => {
    const daysSelected = [...selectedDays];
    const presentIndex = daysSelected.findIndex((a) => a === day.value);

    // Remove Day
    if (presentIndex !== -1) daysSelected.splice(presentIndex, 1);
    // Add Day
    else daysSelected.push(day.value);

    const formData = {
      target: {
        value: daysSelected,
        name: name,
      },
    };

    handleChange(formData);
  };

  const exceptionDates = useMemo(() => {
    return data?.map((d, key) => {
      const isDisabled = disabled?.includes(d?.value);
      const className = classNames(
        styledClass ? styledClass : classes.dayOuterLayer,
        selectedDays?.includes(d?.value) && classes.daySelected,
        isDisabled && classes.daySelectedDisabled,
      );

      return (
        <Box onClick={() => toggleDay(d)} className={className} key={key}>
          {d?.label?.substring(0, truncateTo)}
        </Box>
      );
    });
  }, [selectedDays, data, disabled, toggleDay, truncateTo, classes, styledClass]);

  return <>{exceptionDates.length > 0 ? exceptionDates : null}</>;
};

export default DaysSelection;

DaysSelection.propTypes = {
  data: PropTypes.array,
  selectedDays: PropTypes.array,
  handleChange: PropTypes.func,
  truncateTo: PropTypes.number,
  name: PropTypes.string.isRequired,
  styledClass: PropTypes.string,
  disabled: PropTypes.array,
};

DaysSelection.defaultProps = {
  truncateTo: 1,
  styledClass: '',
  disabled: [],
};
