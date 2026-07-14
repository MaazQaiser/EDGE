import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getInternsOptions, getSalesPersonOptions } from 'src/services/location.service';
import { toastSettings } from 'src/utils/constants';
import { updateSelectedOption } from 'src/utils/dropdownSelectedValue';
import { toaster } from 'src/utils/toast';

import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import SalesPersonsAndInterns from '../salesPersonsAndInterns';
import { locationDropDownNames } from '../sidebarDropdowns/editLocation.constant';
import { useStyles } from './assignedTo';
import { assignToOptions, detailPageDropDowns } from './location.constant';

const defaultState = {
  salesPerson: null,
  intern: null,
};

const AssignedToDrawer = ({ anchor, assignCloseDrawer, data, updateLocation }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [formData, setFormData] = useState(defaultState);
  const [interns, setInterns] = useState([]);
  const [salesPersons, setSalesPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInternChecked, setIsInternChecked] = useState(
    data?.assignTo?.intent === assignToOptions[1]?.value,
  );

  // verify interns conditons
  const isNewInternAssigned =
    isInternChecked &&
    formData.intern !== null &&
    formData.intern !== '' &&
    formData.salesPerson !== null &&
    formData.salesPerson !== '';

  // verify sales person condition
  const isNewSalesPersonAssigned =
    !isInternChecked && formData.salesPerson !== null && formData.salesPerson !== '';
  const isEdited = formData.salesPerson?.value || formData.intern?.value;

  /**
   * use to format assign to object for create Location API
   * @param {*} assignTo
   * @returns
   */
  const updateAssignTo = () => {
    if (isInternChecked) {
      return {
        intent: assignToOptions[1].value,
        userId: formData.intern.id,
        supervisorId: formData.salesPerson.id,
      };
    }
    return { intent: assignToOptions[0].value, userId: formData.salesPerson.id, supervisorId: 0 };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...updateAssignTo(),
      };

      await updateLocation({ assignTo: payload }, detailPageDropDowns.USER);
      setLoading(false);
    } catch (error) {
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    updateFormHandler(name, value);
  };

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

  /**
   * Fetch sales person listing
   * for dropdown options
   * @param {*} page
   * @param {*} query
   */
  const fetchSalesPersonsList = async () => {
    try {
      const response = await getSalesPersonOptions();
      if (response.statusCode === 200) setSalesPersons(response?.data?.salesPersons);
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

  /**
   * Fetch sales Interns listing
   * for dropdown options
   * @param {*} page
   * @param {*} query
   */
  const fetchIntersList = async () => {
    try {
      const response = await getInternsOptions();
      if (response.statusCode === 200) setInterns(response?.data?.interns);
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
    fetchSalesPersonsList();
    fetchIntersList();
  }, []);

  /**
   * show the assigned user
   */
  useEffect(() => {
    if (data) {
      /**
       * set the value of intent which is already selected
       */
      /**
       * sales perons
       */
      if (data?.assignTo?.intent === assignToOptions[0]?.value && salesPersons?.length) {
        // Update associatedFranchiseId
        updateSelectedOption(
          locationDropDownNames.SALES_PERSON,
          salesPersons,
          data?.assignTo?.assignedUserId,
          setFormData,
        );
        return;
      } else if (
        data?.assignTo?.intent === assignToOptions[1]?.value &&
        salesPersons?.length &&
        interns?.length
      ) {
        // Update associatedFranchiseId
        updateSelectedOption(
          locationDropDownNames.SALES_PERSON,
          salesPersons,
          data?.assignTo?.assignedSupervisorId,
          setFormData,
        );
        // Update associatedFranchiseId
        updateSelectedOption(
          locationDropDownNames.INTER,
          interns,
          data?.assignTo?.assignedUserId,
          setFormData,
        );
      }
    }
  }, [data, salesPersons, interns]);

  return (
    <Box
      className={classes.sideBarBox}
      role="presentation"
      component="form"
      onSubmit={handleFormSubmit}
    >
      <Box className={classes.boxInner}>
        <Box className={classes.sideHeader}>
          <DrawerHeader
            title={t('sales.locations.locationAssignments')}
            subtext={t('sales.locations.selectPeopleText')}
            handleCloseDrawer={assignCloseDrawer}
            anchor={anchor}
          />
          <Box className={classes.locationForm}>
            <SalesPersonsAndInterns
              formData={formData}
              salesPersons={salesPersons}
              interns={interns}
              isInternChecked={isInternChecked}
              setIsInternChecked={setIsInternChecked}
              inputChangedHandler={inputChangedHandler}
            />
          </Box>
        </Box>
        <DrawerFooter
          bulkApply={t('sales.locations.assigns')}
          bulkCancel={t('sales.locations.cancel')}
          handleCloseDrawer={assignCloseDrawer}
          anchor={anchor}
          type="submit"
          disabled={(!isNewInternAssigned && !isNewSalesPersonAssigned) || !isEdited || loading}
        />
      </Box>
    </Box>
  );
};

AssignedToDrawer.propTypes = {
  anchor: PropTypes.string,
  assignCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  data: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  updateLocation: PropTypes.func,
  loading: PropTypes.bool,
};
export default AssignedToDrawer;
