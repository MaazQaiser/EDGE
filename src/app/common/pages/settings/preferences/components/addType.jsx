import { Button, Skeleton, Switch, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import CustomDropDown from 'commonComponents/customDropDown';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { preferencesType } from 'src/app/common/pages/settings/constants';
import ModalComponent from 'src/app/components/common/modal';
import { scrollToInValidField } from 'src/helper/utilityFunctions';
import useFormHook from 'src/hooks/useFormHook';
import { createType, getTypeById, updateType } from 'src/services/settings.services';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import classes from './addType.module.scss';

const initialFormData = {
  title: '',
  associatedSites: [],
};

const label = { inputProps: { 'aria-label': 'Switch demo' } };

export default function AddType({
  handleClose,
  listType,
  open,
  id = null,
  refreshData,
  formCheckFields,
  sitesData,
}) {
  const typeId = id;

  const { t } = useTranslation();
  const [showNewFieldForm, setShowNewFieldForm] = useState(false);
  const [dynamicFormChecks, setDynamicFormChecks] = useState(
    JSON.parse(JSON.stringify(formCheckFields)),
  );
  const [sites, _setSites] = useState(sitesData);
  const [loading, setLoading] = useState(false);

  const {
    handleInputChange,
    formData,
    setFormData,
    errorMessages,
    setErrorMessages,
    setDisabled,
    disabled,
  } = useFormHook({ defaultFormData: initialFormData });

  const handleChange = (event, index) => {
    const data = [...dynamicFormChecks];

    data[index].isChecked = event.target.checked;

    setDynamicFormChecks(data);
  };

  const _toggleNewField = () => setShowNewFieldForm((a) => !a);

  const franchiseId = useSelector((state) => state?.auth?.franchiseId);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const form = {
      ...formData,
      category: listType?.value,
    };

    const errors = await formValidatorJoi(form, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      scrollToInValidField();
      return;
    }

    const toggledAttributes = dynamicFormChecks.map((b) => {
      return {
        ...b,
        key: b?.key,
        value: !!b?.isChecked,
      };
    });

    const siteIds = formData.associatedSites?.map((a) => {
      return a?.value;
    });

    form.sites = siteIds;
    form.settings = toggledAttributes;

    setLoading(true);
    setDisabled(true);

    try {
      let response = {};
      if (typeId) {
        response = await updateType(franchiseId, typeId, form);
      } else {
        response = await createType(franchiseId, form);
      }
      setDisabled(false);
      if (response?.statusCode === 201 || response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        handleClose();
      }
      refreshData();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setDisabled(false);
      setErrorMessages(error?.errorObj);
      scrollToInValidField();
    }
  };

  const fetchTypeById = async (id) => {
    try {
      setLoading(true);
      const response = await getTypeById(franchiseId, id);

      if (response.statusCode === 200) {
        const typeData = response?.data?.visitorType;
        const obj = {
          title: typeData.title,
        };

        const selectedSettings = [...dynamicFormChecks];

        obj.associatedSites = sites
          ?.filter((b) => typeData.sites?.find((c) => c.id == b.id))
          .map((a) => {
            return {
              ...a,
              label: a.label,
              value: a.id,
            };
          });

        typeData.settings.map((a) => {
          const activeIndex = dynamicFormChecks.findIndex((b) => b.key == a.key);

          if (activeIndex != -1) {
            selectedSettings[activeIndex].isChecked = a.value;
            selectedSettings[activeIndex].id = a.id;
          }
        });

        setDynamicFormChecks(selectedSettings);
        setFormData(obj);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDisabled(false);
    }
  };

  useEffect(() => {
    if (typeId) {
      fetchTypeById(typeId);
    }
  }, []);

  const CheckListComponent = ({ data, index }) => {
    return (
      <Box className={classes.addTypeModalSection} key={index}>
        {loading ? (
          <Skeleton variant="text" className={classes.textSkeleton} />
        ) : (
          <Typography className={classes.addTypeModalSectionText}>{data.key}</Typography>
        )}
        <Box className={classes.addTypeModalSectionRight}>
          {loading ? (
            <Skeleton variant="rounded" className={classes.toggleSkeleton} />
          ) : (
            <AntSwitch
              {...label}
              checked={data.isChecked}
              onChange={(e) => {
                handleChange(e, index);
              }}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          )}
        </Box>
      </Box>
    );
  };

  CheckListComponent.propTypes = {
    data: PropTypes.object,
    index: PropTypes.number,
  };

  const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 36,
    height: 20,
    padding: 0,
    borderRadius: 12,
    display: 'flex',
    '&:active': {
      '& .MuiSwitch-thumb': {
        width: 15,
      },
      '& .MuiSwitch-switchBase.Mui-checked': {
        transform: 'translateX(9px)',
      },
    },
    '& .MuiSwitch-switchBase': {
      padding: 2,
      '&.Mui-checked': {
        transform: 'translateX(15px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: '#177ddc',
        },
      },
    },
    '& .MuiSwitch-thumb': {
      boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
      width: 16,
      height: 16,
      borderRadius: 8,
      transition: theme.transitions.create(['width'], {
        duration: 200,
      }),
    },
    '& .MuiSwitch-track': {
      borderRadius: 20 / 2,
      opacity: 1,
      backgroundColor: '#F2F7F7',
      boxSizing: 'border-box',
    },
  }));

  const loadTypeText = id
    ? t('obx.settings.preferences.visitorTypes.updateLoadType')
    : t('obx.settings.preferences.visitorTypes.addLoadType');

  const visitorTypeText = id
    ? t('obx.settings.preferences.visitorTypes.updateVisitorType')
    : t('obx.settings.preferences.visitorTypes.addVisitorType');

  const typeText =
    listType.value === preferencesType.LOAD_TYPE.value ? loadTypeText : visitorTypeText;

  const logNameText =
    listType.value === preferencesType.LOAD_TYPE.value
      ? t('obx.settings.preferences.visitorTypes.loaderLog')
      : t('obx.settings.preferences.visitorTypes.visitorLog');

  const modalBody = (
    <Box className={classes.addTypeModal}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Typography
        className={classes.addTypeModalTitle}
        id="modal-modal-title"
        variant="h6"
        component="h2"
      >
        {typeText}
      </Typography>
      <Box
        id="modal-modal-description"
        component="form"
        onSubmit={handleFormSubmit}
        noValidate
        autoComplete="off"
        className={classes.modalBody}
      >
        <Box className={classes.addTypeModalSection}>
          <Typography className={classes.addTypeModalSectionText}>{logNameText}</Typography>

          <TextField
            className={classes.addTypeModalSectionInput}
            error={!!errorMessages?.title}
            id="outlined-search"
            onChange={handleInputChange}
            name="title"
            value={formData.title}
            placeholder={t('form.input.textField.visitorType.placeHolder')}
            variant="outlined"
            type="text"
            helperText={!!errorMessages?.title ? errorMessages?.title : null}
          />
        </Box>
        <Box className={classes.addTypeModalSection}>
          <Typography className={classes.addTypeModalSectionText}>
            {t('obx.settings.preferences.visitorTypes.associatedSites')}
          </Typography>

          <Box className={classes.addTypeModalDropdown}>
            <CustomDropDown
              label={`${t('form.input.textField.selectSites.label')}`}
              options={sites}
              selectedValues={formData?.associatedSites}
              handleChange={handleInputChange}
              name="associatedSites"
              multiSelect
              checkmark
              searchable
              isError={!!errorMessages?.associatedSites}
              bordered
            />
            <Box>
              {!!errorMessages?.associatedSites && (
                <div className={classes.invalidFeedback}>{errorMessages?.associatedSites}</div>
              )}
            </Box>
          </Box>
        </Box>
        <Box className={classes.addTypeModalContent}>
          <Typography className={`${classes.addTypeModalText} ${classes.addTypeModalRight}`}>
            {t('obx.settings.preferences.visitorTypes.fields')}
          </Typography>
          <Typography className={classes.addTypeModalText}>
            {t('obx.settings.preferences.visitorTypes.addQuestions')}
          </Typography>
        </Box>
        {dynamicFormChecks?.map((data, i) => {
          return <CheckListComponent key={i} data={data} index={i} />;
        })}
      </Box>
      <Box className={classes.addTypeModalBtns}>
        <Button onClick={handleClose} type="button" variant="secondaryGrey">
          {t('obx.settings.preferences.visitorTypes.cancel')}
        </Button>

        <Button
          className={classes.addTypeModalBtnBlue}
          disabled={disabled || showNewFieldForm}
          type="button"
          variant="primary"
          onClick={handleFormSubmit}
        >
          {typeText}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={handleClose} body={modalBody}></ModalComponent>;
}

AddType.propTypes = {
  info: PropTypes.object,
  handleClose: PropTypes.func,
  listType: PropTypes.string,
  open: PropTypes.bool,
  id: PropTypes.number,
  refreshData: PropTypes.func,
  formCheckFields: PropTypes.array,
  sitesData: PropTypes.object,
};
