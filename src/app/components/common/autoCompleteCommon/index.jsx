import { Autocomplete, Box, Chip, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import { useStyles } from './autoCompleteStyle';
const AutoCompleteCommon = ({
  name,
  handleChange,
  placeholder,
  errorMessages,
  value,
  errorMessage,
}) => {
  const classes = useStyles();

  const handleMultipleSelectedValues = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.target.value) {
      const val = [...value, event.target.value];
      const eventData = {
        target: {
          value: val,
          name,
        },
      };

      handleChange(eventData);
    }
  };

  const handleChipDelete = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    const data = [...value];

    const afterRemove = data.filter((_a, i) => i !== index);

    const event = {
      target: {
        value: afterRemove,
        name,
      },
    };

    handleChange(event);
  };

  return (
    <>
      <Autocomplete
        multiple
        disableClearable={true}
        id={name}
        options={[]}
        // defaultValue={{}}
        value={value}
        className={classes.autoCompleteField}
        freeSolo
        onChange={(event) => handleMultipleSelectedValues(event, name)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index });

            return (
              <Chip
                color="primary"
                label={option}
                key={key}
                {...tagProps}
                onDelete={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleChipDelete(event, index);
                }}
              />
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            name={'name'}
            variant="filled"
            label=""
            placeholder={placeholder}
            className={classes.autoCompleteTextField}
          />
        )}
      />
      {Object.entries(errorMessages).filter(([key]) => key.includes(name)).length ? (
        <Box className={classes.invalidFeedback}>{errorMessage}</Box>
      ) : null}
    </>
  );
};

AutoCompleteCommon.propTypes = {
  name: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  errorMessages: PropTypes.object,
  errorMessage: PropTypes.string,
  value: PropTypes.array.isRequired,
};

export default AutoCompleteCommon;
