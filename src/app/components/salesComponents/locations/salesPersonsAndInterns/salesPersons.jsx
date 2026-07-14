import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';

const useStyles = makeStyles((theme) => ({
  mainBoxSideDrawerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  dropHigh: {
    height: '44px !important',
  },
  salesText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },
}));

const SalesPersons = ({ formData, salesPersons, inputChangedHandler }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Box className={classes.mainBoxSideDrawerWrapper}>
      <Typography variant="subtitle2" className={classes.salesText}>
        {t('sales.locations.salesPerson')}
      </Typography>
      <CustomDropDown
        name="salesPerson"
        id="salesPerson"
        label={t('sales.locations.salesPerson')}
        options={transformArrayForOptions(salesPersons, 'fullName', 'id', 'email') || []}
        selectedValues={formData?.salesPerson || {}}
        handleChange={inputChangedHandler}
        placeHolder={t('sales.locations.selectsalesPerson')}
        searchable
        bordered
        className={classes.dropHigh}
        showEmailInLine={true}
      />
    </Box>
  );
};

SalesPersons.propTypes = {
  formData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  salesPersons: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  inputChangedHandler: PropTypes.func,
};

export default React.memo(SalesPersons);
