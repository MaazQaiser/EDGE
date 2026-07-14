import { Box, FormControl, MenuItem, Select } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const DynamicDropdown = (props) => {
  const { t } = useTranslation();

  // Extract ID from answers (like multiselect uses answers directly)
  const getInitialValue = () => {
    if (Array.isArray(props?.answers) && props.answers.length > 0) {
      return props.answers[0]?.id || '';
    }
    if (props?.answers && typeof props.answers === 'object' && props.answers.id) {
      return props.answers.id;
    }
    return props?.answers || '';
  };

  const [selectedOption, setSelectedOption] = useState(getInitialValue());

  // Call handleChange whenever selectedOption changes (exact same pattern as multiselect)
  useEffect(() => {
    const selectedOptionObj = props?.options?.find((opt) => +opt.id === +selectedOption);
    const data = {
      target: {
        value: selectedOptionObj ? [selectedOptionObj] : null,
        name: props?.id,
      },
    };
    props?.removeError(props?.nameField);
    props?.handleChange(data);
  }, [selectedOption]);

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <>
      <FormControl fullWidth>
        <Select
          value={selectedOption}
          onChange={handleChange}
          disabled={props?.disable || props?.fieldDisable}
          displayEmpty
          sx={{
            '& .MuiSelect-select': {
              padding: '10px 14px',
            },
          }}
        >
          {props?.options?.map((option) => {
            const isSelected = selectedOption === option?.id;
            return (
              <MenuItem
                key={option?.id}
                value={option?.id}
                sx={{
                  backgroundColor: isSelected ? '#ebf6fd' : 'transparent',
                  '&:hover': {
                    backgroundColor: isSelected ? '#ebf6fd' : '#f5f5f5',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#ebf6fd',
                    '&:hover': {
                      backgroundColor: '#ebf6fd',
                    },
                  },
                }}
              >
                {option.optionText}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      {!!props?.errorMessage && (
        <Box sx={{ mt: 1 }}>
          <Box className={props.classes?.invalidData || ''}>
            {props.errorMessage || t('errors.dynamic.option.required')}
          </Box>
        </Box>
      )}
    </>
  );
};

DynamicDropdown.propTypes = {
  handleChange: PropTypes.func.isRequired,
  removeError: PropTypes.func,
  errorMessage: PropTypes.string,
  classes: PropTypes.object,
  disable: PropTypes.bool,
  fieldDisable: PropTypes.bool,
  nameField: PropTypes.string,
  id: PropTypes.number,
  answers: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string,
    PropTypes.number,
  ]),
  type: PropTypes.string,
  options: PropTypes.array,
};

export default DynamicDropdown;
