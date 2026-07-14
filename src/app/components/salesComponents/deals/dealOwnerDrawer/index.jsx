import { InputLabel, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import { getDealOwnerOptions, updateDeal } from 'src/services/deal.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import { useStyles } from './dealOwnerDrawer.js';

const DealsOwner = ({ anchor, assignmentCloseDrawer, width, dealOwner, dealId, onSuccess }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [formData, setFormData] = useState({
    dealOwner: {
      id: dealOwner?.id,
      value: dealOwner?.id,
      label: dealOwner?.name,
      image: dealOwner?.image,
    },
  });
  const [errorMessages, setErrorMessages] = useState({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const [dealOwners, setDealOwners] = useState([]);

  /**
   * Fetch deal owners
   */
  const fetchDealOwners = async () => {
    try {
      const response = await getDealOwnerOptions();
      if (response?.statusCode === 200) {
        setDealOwners(response?.data?.owners);
      }
    } catch (error) {
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    fetchDealOwners();
  }, []);

  /**
   * common function to update data to formDat object
   */
  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [name]: key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    updateFormHandler(name, value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    try {
      const errors = await formValidatorJoi(formData, t);
      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }
      const payload = {
        dealOwnerId: formData.dealOwner.id,
      };

      const apiResponse = await updateDeal(dealId, payload);

      if (apiResponse.statusCode === 200) {
        onSuccess(apiResponse.data?.deal);
        toaster.success({
          text: t('sales.deals.updatedDeal'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        /**
         * close the side drawer after successful response
         */
        assignmentCloseDrawer(anchor);
      }
    } catch (error) {
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <Box
      className={classes?.siderBarBox}
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
      role="presentation"
      component="form"
      onSubmit={handleFormSubmit}
    >
      <Stack className={classes?.boxInner} justifyContent="space-between">
        <Box className={classes?.sideHeader}>
          <DrawerHeader
            title={t('sales.deals.dealsAssignment')}
            subtext={t('sales.deals.dealowner')}
            handleCloseDrawer={assignmentCloseDrawer}
            anchor={anchor}
          />
          <Box className={classes.locationForm}>
            <Box className={classes.sideBySideCol}>
              <Box className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}>
                <InputLabel htmlFor="dealOwner">{t('sales.locations.selectDealOwner')}</InputLabel>
                <CustomDropDown
                  name="dealOwner"
                  id="dealOwner"
                  placeHolder="Harvy Spector"
                  placeHolderClassName={classes?.placeHolderColor}
                  options={transformArrayForOptions(dealOwners, 'name', 'id', 'email') || []}
                  label={formData?.dealOwner?.description}
                  selectedValues={formData?.dealOwner || {}}
                  handleChange={inputChangedHandler}
                  className={classes?.dropdownWrap}
                  bordered
                  searchable
                  showEmailInLine={true}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <DrawerFooter
          bulkApply={t('sales.locations.assignedUserName')}
          bulkCancel={t('sales.locations.cancel')}
          handleCloseDrawer={assignmentCloseDrawer}
          anchor={anchor}
          type="submit"
          disabled={isSubmittingForm}
        />
      </Stack>
    </Box>
  );
};

DealsOwner.propTypes = {
  anchor: PropTypes.string,
  assignmentCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  dealOwner: PropTypes.string, // Adjust the type accordingly based on the expected data structure
  dealId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func,
};

export default DealsOwner;
