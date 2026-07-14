import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const DynamicMultiOptionsSelector = (props) => {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState(props?.answers || []);

  const onOptionClick = (selection) => {
    setSelectedOption((prevState) => {
      let prevSelection = [...prevState];
      const isAlreadyPresent = prevSelection.find((a) => a.id === selection.id);
      if (isAlreadyPresent) {
        return prevSelection.filter((a) => a.id !== selection.id);
      }
      return [...prevSelection, selection];
    });
  };

  useEffect(() => {
    const data = {
      target: {
        value: selectedOption,
        name: props?.id,
      },
    };
    props?.removeError(props?.nameField);
    props?.handleChange(data);
  }, [selectedOption]);

  return (
    <>
      <Box
        className={classNames(
          props?.classes.previewTemplateOptions,
          props?.fieldDisable && props?.classes.disabledEvent,
        )}
      >
        {props?.options.map((option) => {
          const isSelected = selectedOption.find((a) => a.id === option.id);

          return (
            <Typography
              variant="body1"
              key={option?.id}
              sx={{ cursor: 'pointer' }}
              className={classNames(
                props?.classes.previewTemplateOption,
                isSelected && props?.classes.previewTemplateOptionSelected,
              )}
              onClick={() => {
                onOptionClick(option);
              }}
            >
              {option.optionText}
            </Typography>
          );
        })}
      </Box>
      <Box>
        {!!props?.errorMessage && (
          <Box className={props.classes.invalidData}>{t('errors.dynamic.option.required')}</Box>
        )}
      </Box>
    </>
  );
};

DynamicMultiOptionsSelector.propTypes = {
  handleChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  removeError: PropTypes.func,
  errorMessage: PropTypes.string,
  classes: PropTypes.object,
  fieldDisable: PropTypes.bool,
  nameField: PropTypes.string,
  id: PropTypes.number,
  answers: PropTypes.string,
  type: PropTypes.string,
  options: PropTypes.array,
};
export default DynamicMultiOptionsSelector;
