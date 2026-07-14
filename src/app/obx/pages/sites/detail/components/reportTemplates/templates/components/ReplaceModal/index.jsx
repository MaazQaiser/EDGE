import { InputLabel } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ReactComponent as ReplaceModalIcon } from 'assets/svg/replace-modal-icon.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSitesReportTemplates } from 'services/sites.services';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ModalComponent from 'src/app/components/common/modal';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import useFormHook from 'src/hooks/useFormHook';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './replaceModal.styles';

const defaultForm = {
  site: {},
  template: {},
  siteId: null,
  target_id: null,
};
const ReplaceModal = ({
  currentSelected,
  showReplaceModal,
  setShowReplaceModal,
  sites,
  onSubmit,
  disabled,
  setDisabled,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [siteTemplates, setSiteTemplates] = useState([]);

  const [templateText, setTemplateText] = useState({
    loading: false,
    text: 'This Site has no templates yet.',
  });

  const { handleInputChange, formData, setFormData, errorMessages, setErrorMessages } = useFormHook(
    { defaultFormData: defaultForm },
  );

  const _resetFormData = () => {
    setFormData(defaultForm);
    setShowReplaceModal(false);
  };

  const fetchTemplatesOfThisSite = (event) => {
    if (event.target.value) {
      setSiteTemplates([]);
      fetchTemplatesOfSite(event.target.value?.id);
    }
    handleInputChange(event);
  };

  const selectTemplate = (event) => {
    setDisabled(false);
    handleInputChange(event);
  };

  const fetchTemplatesOfSite = async (siteId) => {
    try {
      setDisabled(true);
      setTemplateText({ loading: true, text: 'Loading...' });
      const response = await getSitesReportTemplates(siteId, currentSelected.templateableType);

      if (response && response?.statusCode === 200) {
        if (!response?.data?.templates?.length) {
          setTemplateText({ loading: false, text: 'This Site has no templates yet.' });
          return;
        }
        setSiteTemplates(transformArrayForOptions(response?.data?.templates, 'title', 'id'));
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      setTemplateText({ loading: false, text: 'This Site has no templates yet.' });
    }
  };

  const submitHandler = async () => {
    let joiPayload = {
      site: extractValuesByKeyFromInput(formData.site, 'value'),
      template: extractValuesByKeyFromInput(formData.template, 'value'),
    };
    const errors = await formValidatorJoi(joiPayload, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages((prev) => ({ ...prev, ...errors }));
      return;
    }

    onSubmit(joiPayload);
  };

  const replaceModalBody = (
    <Box className={classes.cloneModal}>
      <ReplaceModalIcon />
      <Box className={classes.cloneModalContent}>
        <Typography variant="h3" className={classes.cloneModalTitle}>
          {t('obx.templates.replace.title')}
        </Typography>
        <Typography variant="body2" className={classes.cloneModalText}>
          {t('obx.templates.replace.bothDescription')}
          <span> ‘{currentSelected?.title}’</span>
        </Typography>
      </Box>
      <Box className={classes.cloneModalFieldsReplace}>
        <Box className={classes.cloneModalField}>
          <InputLabel className={classes.cloneModalFieldLabel}>
            {t('obx.templates.replace.siteDropdownLabel')}
          </InputLabel>
          <CustomDropDown
            label="Select sites"
            placeHolder="Select sites"
            name="site"
            searchable
            selectedValues={formData.site}
            options={sites}
            handleChange={fetchTemplatesOfThisSite}
            bordered
            className={classes.replaceModalDropdown}
            error={!!errorMessages?.site}
          />
        </Box>
        {!isObjectEmpty(formData?.site) &&
          (siteTemplates.length ? (
            <Box className={classNames(classes.cloneModalField, classes.cloneFieldMargin)}>
              <InputLabel className={classes.cloneModalFieldLabel}>
                {t('obx.templates.replace.reportDropdownLabel')}
              </InputLabel>
              <CustomDropDown
                label="Select templates"
                placeHolder="Select templates"
                name="template"
                selectedValues={formData.template}
                options={siteTemplates}
                searchable
                handleChange={selectTemplate}
                bordered
                className={classes.replaceModalDropdown}
                error={!!errorMessages?.template}
              />
            </Box>
          ) : (
            <>
              {templateText?.loading ? (
                <>
                  <Box className={classes.loaderWrapper}>
                    <Box className={classes.loadingState}> </Box>
                  </Box>
                </>
              ) : (
                <Box className={classes.invalidFeedback}>{templateText.text}</Box>
              )}
            </>
          ))}
      </Box>
      <Box className={classes.cloneModalActions}>
        <Button
          variant="secondaryGrey"
          onClick={() => {
            setDisabled(true);
            setShowReplaceModal(false);
          }}
        >
          {t('obx.templates.replace.cancelButtonText')}
        </Button>
        <Button variant="primary" onClick={submitHandler} disabled={disabled}>
          {t('obx.templates.replace.replaceButtonText')}
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <ModalComponent
        open={showReplaceModal}
        handleClose={() => {
          setShowReplaceModal(false);
          setDisabled(true);
        }}
        body={replaceModalBody}
      />
    </>
  );
};

ReplaceModal.propTypes = {
  currentSelected: PropTypes.object.isRequired,
  showReplaceModal: PropTypes.bool,
  setShowReplaceModal: PropTypes.func,
  sites: PropTypes.array,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  setDisabled: PropTypes.func.isRequired,
};

export default ReplaceModal;
