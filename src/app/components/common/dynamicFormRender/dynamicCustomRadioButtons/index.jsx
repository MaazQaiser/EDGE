import { Box } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types'; // Import PropTypes
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as RadioBgIcon } from 'src/assets/svg/radio-bg.svg?react';
import { ReactComponent as RadioBgDisabledIcon } from 'src/assets/svg/radio-bg-disabled.svg?react';
import { ReactComponent as RadioCheckedIcon } from 'src/assets/svg/radio-checked.svg?react';
import { ReactComponent as RadioCheckedDisabledIcon } from 'src/assets/svg/radio-checked-disabled.svg?react';

const useStyles = makeStyles((_theme) => ({
  customRadioGroup: {
    '& .MuiFormGroup-root ': {
      '& .MuiFormControlLabel-root': {
        marginRight: '24px',
        marginLeft: '0px',
        '& .MuiButtonBase-root': {
          padding: '0',
          paddingRight: '8px',
        },
      },
    },
  },
}));

const DynamicCustomRadioButtons = (props) => {
  const classes = useStyles();

  const { t } = useTranslation();
  const [value, setValue] = useState(props?.answers || '');

  useEffect(() => {
    if (props?.answers?.length > 0) {
      setValue(props?.answers?.[0]?.id);
    }
  }, [props?.answers]);

  const handleLocalChange = ({ target: { value } }) => {
    setValue(value);
  };

  useEffect(() => {
    if (value) {
      const findOptionText = props?.options.find((a) => a?.id == value);
      const data = {
        target: {
          value: [{ ...findOptionText }],
          name: props?.id,
        },
      };
      props?.removeError(props?.nameField);
      props?.handleChange(data);
    }
  }, [value]);

  return (
    <FormControl className={classes.customRadioGroup}>
      <FormLabel>{props?.label}</FormLabel>
      <RadioGroup row name="radio" value={value} onChange={handleLocalChange}>
        {props?.options.map((option, index) => (
          <FormControlLabel
            key={index}
            value={option?.id}
            disabled={props?.fieldDisable}
            control={
              <Radio
                icon={props?.fieldDisable ? <RadioBgDisabledIcon /> : <RadioBgIcon />}
                checkedIcon={
                  props?.fieldDisable ? <RadioCheckedDisabledIcon /> : <RadioCheckedIcon />
                }
              />
            }
            label={option?.optionText}
          />
        ))}
      </RadioGroup>
      <Box>
        {!!props?.errorMessage && (
          <Box className={props.classes.invalidData}>{t('errors.dynamic.option.required')}</Box>
        )}
      </Box>
    </FormControl>
  );
};

DynamicCustomRadioButtons.propTypes = {
  options: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  removeError: PropTypes.func,
  errorMessage: PropTypes.string,
  classes: PropTypes.object,
  fieldDisable: PropTypes.bool,
  nameField: PropTypes.string,
  id: PropTypes.number,
  answers: PropTypes.string,
};
export default DynamicCustomRadioButtons;
