import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import LoaderComponent from 'src/app/components/common/loader';
import {
  bulkAssignMentLocation,
  getInternsOptions,
  getSalesPersonOptions,
} from 'src/services/location.service';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import BulkAssignment from '../../locations/bulkAssignments';
import { assignToOptions } from '../../locations/newLocationsDrawer/location.constant';
import DrawerFooter from '../drawerFooter';
import DrawerHeader from '../drawerHeader';
import { useStyles } from './sideDrawer';

const defaultState = {
  salesPerson: null,
  intern: null,
};
const BulkDrawer = ({
  anchor,
  bulkCloseDrawer,
  width,
  selectedItems,
  setSelectedItems,
  filtersData,
  setSelectAll,
  setBulkOperationPerformed,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [formData, setFormData] = useState(defaultState);
  const [interns, setInterns] = useState([]);
  const [salesPersons, setSalesPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInternChecked, setIsInternChecked] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  /**
   * use to format assign to object for create Location API
   * @param {*} assignTo
   * @returns
   */
  const updateAssignTo = () => {
    let assignTo = {};
    if (isInternChecked) {
      assignTo.intent = assignToOptions[2].value;
      assignTo.userId = formData.intern.value;
      assignTo.supervisorId = formData.salesPerson.value;
      return assignTo;
    }

    assignTo.intent = assignToOptions[1].value;
    assignTo.userId = formData.salesPerson.value;
    assignTo.supervisorId = 0;
    return assignTo;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        leadIds: selectedItems,
        ...updateAssignTo(),
      };

      const bulkResp = await bulkAssignMentLocation(payload);
      if (bulkResp.statusCode === 200) {
        setBulkOperationPerformed();
        toaster.success({
          text: t('sales.locations.leadsAssigned'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        /**
         * close the side drawer after successful response
         * and empty the selected items array
         */
        setSelectedItems([]);
        setSelectAll(false);
        bulkCloseDrawer(anchor);
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
      setLoading(false);
    }
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

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    updateFormHandler(name, value);
  };

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
   * condition to enable/disable the Assign to button
   */
  useEffect(() => {
    if (isInternChecked) {
      setIsButtonDisabled(!formData.salesPerson || !formData.intern);
    } else {
      setIsButtonDisabled(!formData.salesPerson);
    }
  }, [isInternChecked, formData.salesPerson, formData.intern]);

  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />}
      <Box
        className={classes.siderBarBox}
        sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
        role="presentation"
        component="form"
        onSubmit={handleFormSubmit}
      >
        <Stack className={classes.boxInner} justifyContent="space-between">
          <Box className={classes.sideHeader}>
            <DrawerHeader
              title={t('sales.locations.locationAssignment')}
              subtext={t('sales.locations.bulkText')}
              handleCloseDrawer={bulkCloseDrawer}
              anchor={anchor}
            />
            <BulkAssignment
              formData={formData}
              salesPersons={salesPersons}
              interns={interns}
              inputChangedHandler={inputChangedHandler}
              selectedItems={selectedItems}
              filtersData={filtersData}
              isInternChecked={isInternChecked}
              setIsInternChecked={setIsInternChecked}
            />
          </Box>
          <DrawerFooter
            bulkApply={t('sales.locations.assign')}
            bulkCancel={t('sales.locations.cancel')}
            handleCloseDrawer={bulkCloseDrawer}
            anchor={anchor}
            onSubmit={handleFormSubmit}
            type="submit"
            disabled={isButtonDisabled}
          />
        </Stack>
      </Box>
    </>
  );
};

BulkDrawer.propTypes = {
  anchor: PropTypes.string,
  bulkCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  selectedItems: PropTypes.array,
  setSelectedItems: PropTypes.func,
  filtersData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setSelectAll: PropTypes.func,
  setBulkOperationPerformed: PropTypes.func,
};

export default BulkDrawer;
