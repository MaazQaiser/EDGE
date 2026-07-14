import { Box, Button, Checkbox, InputLabel, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg?react';

import { useStyles } from './BillingDetailsTab.style';
import ViewBillingDetails from './viewBillingDetails';

const BillingDetailsTab = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const dedicatedJobsOptions = [
    { value: 'driver', label: 'Driver' },
    { value: 'dispatcher', label: 'Dispatcher' },
    { value: 'manager', label: 'Manager' },
    { value: 'technician', label: 'Technician' },
    { value: 'supervisor', label: 'Supervisor' },
  ];

  const formData = {
    dedicatedJobs: ['driver', 'manager'],
  };

  const handleChange = (selected) => {
    console.log('Selected Values:', selected);
  };

  return (
    <>
      <Box className={classes.visitorsTab}>
        <Box>
          <Typography variant="body1" className={classes.tabheading}>
            {t('obx.billing.contacts')}
          </Typography>
          <Box className={classes.fieldWrapper}>
            <InputLabel htmlFor={'label'}>
              {t('obx.billing.primaryContact')} <RequiredAsterik />
            </InputLabel>
            <CustomDropDown
              name="dedicatedJobs"
              label={t('obx.billing.selectPrimaryContact')}
              placeholder={t('obx.billing.selectPrimaryContact')}
              options={dedicatedJobsOptions || []}
              selectedValues={formData?.dedicatedJobs || []}
              handleChange={handleChange}
              className={classes.dropHight}
              placeHolderClassName={classes.placeHolderSize}
              multiSelect
              bordered
            />
          </Box>
          <ViewBillingDetails />
        </Box>

        <Box>
          <Box className={classes.fieldWrapper}>
            <InputLabel htmlFor={'label'}>
              {t('obx.billing.billTo')} <RequiredAsterik />
            </InputLabel>
            <Box className={classes.fieldWrapperInner}>
              <CustomDropDown
                name="billTo"
                label={t('obx.billing.billTo')}
                placeholder={t('obx.billing.selectBillToContact')}
                options={dedicatedJobsOptions || []}
                selectedValues={formData?.dedicatedJobs || []}
                handleChange={handleChange}
                className={classes.dropHight}
                placeHolderClassName={classes.placeHolderSize}
                multiSelect
                bordered
              />
              <Box className={classes.internalMapBox}>
                <Checkbox
                  id="mark-emergency-contact"
                  // onChange={(e) => handleFieldChange(index, 'isEmergencyContact', e.target.checked)}
                  icon={<CheckBoxRegularIcon />}
                  // checked={form.isEmergencyContact}
                  checkedIcon={<CheckBoxCheckedIcon />}
                  className={classes.checkBoxCustom}
                />
                <Typography className={classes.checkBoxText}>
                  {t('obx.billing.sameAsPrimaryContact')}
                </Typography>
              </Box>
            </Box>
          </Box>
          <ViewBillingDetails />
        </Box>

        <Box>
          <Box className={classes.fieldWrapper}>
            <InputLabel htmlFor={'label'}>
              {t('obx.billing.shipTo')} <RequiredAsterik />
            </InputLabel>
            <Box className={classes.fieldWrapperInner}>
              <CustomDropDown
                name="sendTo"
                label={t('obx.billing.shipTo')}
                placeholder={t('obx.billing.selectShipToContact')}
                options={dedicatedJobsOptions || []}
                selectedValues={formData?.dedicatedJobs || []}
                handleChange={handleChange}
                className={classes.dropHight}
                placeHolderClassName={classes.placeHolderSize}
                multiSelect
                bordered
              />
              <Box className={classes.internalMapBox}>
                <Checkbox
                  id="sameAsPrimaryContact"
                  icon={<CheckBoxRegularIcon />}
                  checkedIcon={<CheckBoxCheckedIcon />}
                  className={classes.checkBoxCustom}
                />
                <Typography className={classes.checkBoxText}>
                  {t('obx.billing.sameAsPrimaryContact')}
                </Typography>
              </Box>
            </Box>
          </Box>
          <ViewBillingDetails />
        </Box>
      </Box>
      <Box className={classes.footer}>
        <Button variant="primary">{t('obx.billing.update')}</Button>
      </Box>
    </>
  );
};

export default BillingDetailsTab;
