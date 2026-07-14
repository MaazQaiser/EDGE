import { Box, InputLabel } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';

import { useStyles } from './salesPersonsAndInterns';

const InternsComponent = ({ formData, inputChangedHandler, interns }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Box>
      <Box>
        <InputLabel> {t('sales.locations.intern')}</InputLabel>
        <CustomDropDown
          name="intern"
          id="intern"
          label={t('sales.locations.intern')}
          options={transformArrayForOptions(interns, 'fullName', 'id', 'email') || []}
          selectedValues={formData?.intern || {}}
          handleChange={inputChangedHandler}
          placeHolder={t('sales.locations.selectIntern')}
          searchable
          bordered
          className={classes.dropHigh}
          showEmailInLine={true}
        />
      </Box>
    </Box>
  );
};

InternsComponent.propTypes = {
  formData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  inputChangedHandler: PropTypes.func,
  interns: PropTypes.array, // Adjust the type accordingly based on the expected data structure
};

export default React.memo(InternsComponent);
