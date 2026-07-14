import { Box, Checkbox, InputLabel, Skeleton } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ModalComponent from 'src/app/components/common/modal';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg?react';
import { useApiControllers } from 'src/helper/axios';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { getVisitorsLoadsOfficersOptions } from 'src/services/visitorsLoads.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';

import { useStyles } from './addOfficer.styles';

const AddOfficerModal = ({
  open,
  onClose,
  siteId,
  category,
  assignOfficer,
  modalButtonDisabled,
}) => {
  const classes = useStyles();
  const { getNewApiController } = useApiControllers();
  const [officersOptions, setOfficersOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOfficer, setSelectedOfficer] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const getOfficersOptions = async () => {
    const apiController = getNewApiController();

    try {
      setLoading(true);

      const response = await getVisitorsLoadsOfficersOptions({
        signal: apiController.signal,
      });
      if (response?.data.statusCode === 200) {
        setOfficersOptions(response?.data.officers);
        setLoading(false);
      }
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const additionalCategory = category === 'loads' ? 'visitors' : 'loads';

  const payload = {
    userId: selectedOfficer.id,
    category: category,
    ...(isChecked && { [additionalCategory]: true }),
  };

  const handleSaveOfficer = () => {
    if (payload.userId) {
      setErrorMessage('');
      assignOfficer(siteId, payload);
      return;
    }
    setErrorMessage(
      t('obx.visitorsLoadsOfficer.dropdownErrorMessage', {
        officer: getLabel('terms', 'officer', t),
      }),
    );
  };

  useEffect(() => {
    getOfficersOptions();
  }, []);

  const selectableOfficer = officersOptions?.length
    ? transformArrayForOptions(officersOptions, 'name', 'id')
    : [];

  const handleUpdate = (e) => {
    const { value } = e.target;
    if (!isObjectEmpty(value)) {
      setSelectedOfficer(value);
    }
  };

  const addOfficerBody = (
    <Box className={classes.rejectModal}>
      <Box className={classes.rejectModalContent}>
        <Typography variant="h3" className={classes.rejectModalTitle}>
          {t('obx.visitorsLoadsOfficer.officerModalTitle', {
            officer: getLabel('terms', 'officer', t),
          })}
        </Typography>
        <Box className={classes.addOfficerDropdown}>
          <InputLabel>
            {t('obx.visitorsLoadsOfficer.dropdownLabel', {
              officer: getLabel('terms', 'officer', t),
            })}
          </InputLabel>
          {loading ? (
            <Skeleton className={classes.dropDownSkeleton} />
          ) : (
            <CustomDropDown
              name="assign-officer"
              label={t('obx.visitorsLoadsOfficer.dropdownLabel', {
                officer: getLabel('terms', 'officer', t),
              })}
              placeHolder={t('obx.visitorsLoadsOfficer.dropdownPlaceholder', {
                officer: getLabel('terms', 'officer', t),
              })}
              selectedValues={selectedOfficer || {}}
              handleChange={handleUpdate}
              bordered
              searchable
              options={selectableOfficer}
              className={classes.addOfficerDropdownField}
              isError={!!errorMessage}
            />
          )}
          {errorMessage && <Box className={classes.invalidFeedback}>{errorMessage}</Box>}
        </Box>
        <Box className={classes.addOfficerCheckbox}>
          <Checkbox
            id="allow-officer"
            onChange={handleCheckboxChange}
            icon={<CheckBoxRegularIcon />}
            checkedIcon={<CheckBoxCheckedIcon />}
            className={classes.checkBoxCustom}
          />
          <InputLabel
            sx={{
              marginBottom: 0,
            }}
            htmlFor="allow-officer"
          >
            Also allow this {getLabel('terms', 'officer', t)} to access{' '}
            {category === 'loads'
              ? t('obx.visitorsLoadsOfficer.visitorsManagement')
              : t('obx.visitorsLoadsOfficer.loadsManagement')}
          </InputLabel>
        </Box>
      </Box>

      <Box className={classes.rejectModalActions}>
        <Button variant="secondaryGrey" disabled={modalButtonDisabled} onClick={onClose}>
          {t('obx.visitorsLoadsOfficer.cancel')}
        </Button>
        <Button onClick={handleSaveOfficer} disabled={modalButtonDisabled} variant="primary">
          {t('obx.visitorsLoadsOfficer.save')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={addOfficerBody} />;
};

AddOfficerModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  siteId: PropTypes.string,
  category: PropTypes.string,
  assignOfficer: PropTypes.func,
  modalButtonDisabled: PropTypes.bool,
};

export default AddOfficerModal;
