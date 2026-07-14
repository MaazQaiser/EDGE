import { Box, Checkbox, InputLabel } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import InternsComponent from './internsComponent';
import SalesPersons from './salesPersons';
import { useStyles } from './salesPersonsAndInterns';

const SalesPersonsAndInterns = ({
  formData,
  salesPersons,
  interns,
  isInternChecked,
  setIsInternChecked,
  inputChangedHandler,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.conditionBox}>
      <SalesPersons
        formData={formData}
        salesPersons={salesPersons}
        inputChangedHandler={inputChangedHandler}
      />
      <Box className={classes.checkBoxWrapper}>
        <Box className={classes.inineField}>
          <Checkbox
            id="addIntern"
            checked={isInternChecked}
            onChange={() => setIsInternChecked(!isInternChecked)}
          />
          <InputLabel htmlFor="addIntern"> {t('sales.locations.addIntern')}</InputLabel>
        </Box>

        {isInternChecked && (
          <InternsComponent
            formData={formData}
            inputChangedHandler={inputChangedHandler}
            interns={interns}
          />
        )}
      </Box>
    </Box>
  );
};

SalesPersonsAndInterns.propTypes = {
  formData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  salesPersons: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  interns: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  isInternChecked: PropTypes.bool,
  setIsInternChecked: PropTypes.func,
  inputChangedHandler: PropTypes.func,
};
export default SalesPersonsAndInterns;
