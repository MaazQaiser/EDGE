import { Box, Checkbox, Divider, InputLabel } from '@mui/material';
import Button from '@mui/material/Button';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import CustomDropDown from 'src/app/components/common/customDropDown';
import LoaderComponent from 'src/app/components/common/loader';
import { COMMON_SETTING } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { ReactComponent as Regular } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as Iregular } from 'src/assets/svg/checkbox-checked.svg?react';
import { ReactComponent as CheckBoxCheckedDisabled } from 'src/assets/svg/checkbox-checked-disabled.svg?react';
import { ReactComponent as CheckboxDisabled } from 'src/assets/svg/checkbox-disabled.svg?react';
import {
  convertErrorsToJoiObject,
  convertJoiErrorsToArrayOfObjects,
  isObjectEmpty,
  removeKey,
} from 'src/helper/utilityFunctions';
import useBackNavigation from 'src/hooks/useBackNavigation';
import {
  createTemplate,
  getTemplate,
  getTemplateTypesForReports,
  updateTemplate,
} from 'src/services/template.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import joiTemplateValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { PlusIcon } from '../../../../../../assets/svg/index';
import ButtonGroup from '../components/buttonGroup';
import CreateTemplateSection from '../components/createTemplateSection';
import CreateTemplateTitle from '../components/createTemplateTitle';
import { useStyles } from './createTemplate.styles';

const initialSectionObject = {
  title: '',
  description: '',
  questionsAttributes: [],
};

// const secondFieldConditionalValues = ['visitorsCheckOut', 'loadsCheckOut'];
const templateStaticType = ['visitorsCheckIn', 'visitorsCheckOut', 'loadsCheckIn', 'loadsCheckOut'];
const pageType = {
  visitor: 'visitors',
  loads: 'loads',
};

const nestedKeys = {
  sectionKey: {
    formKey: 'sectionsAttributes',
    errorKey: 'Sections',
  },
  questionKey: 'questionsAttributes',
  optionKey: 'optionAttributes',
};

const enumResponseType = {
  text: 0,
  number: 1,
  multiselect: 2,
  datetime: 3,
  radio: 4,
  date: 5,
  imageVideo: 6,
  time: 7,
  webCam: 10,
  signature: 13,
};

const enumReports = {
  activityReport: 'activityReport',
  tourReports: 'tourReports',
  incidentReport: 'incidentReport',
};

const CreateTemplate = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const siteId = searchParams.get('siteId');

  const initialCreateTemplateFormObject = {
    title: '',
    description: '',
    templateableType: siteId ? enumReports.tourReports : enumReports.incidentReport,
    sectionsAttributes: [],
    includeSiteSummary: true,
  };

  const { t } = useTranslation();
  const [template, setTemplate] = useState(initialCreateTemplateFormObject);
  const [prevTemplate, setPrevTemplate] = useState(initialCreateTemplateFormObject);
  const [errorMessages, setErrorMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const { id } = useParams();
  const [extraFields, setExtraFields] = useState([]);

  const [disableVistorSecondDD, setDisableVistorSecondDD] = useState(true);
  const [extraFieldSecondDD, setExtraFieldsSecondDD] = useState([]);

  const returnPage = searchParams.get('page');

  const { navigateBack } = useBackNavigation();

  useEffect(() => {
    if (
      !id &&
      (returnPage === pageType.loads || returnPage === pageType.visitor) &&
      extraFieldSecondDD?.length === 0
    ) {
      getVisitorTemplateTypes();
    }
  }, []);

  /**
   * if we have loads and visits, set dynamic default value to the state in create scenario
   */
  useEffect(() => {
    if (
      siteId &&
      !id &&
      returnPage &&
      (returnPage === pageType.visitor || returnPage === pageType.loads)
    ) {
      setExtraFields({ dynamicValue1: {} });
    }
  }, [returnPage]);

  useEffect(() => {
    if (id && extraFieldSecondDD?.length === 0) {
      setLoading(true);
      getTemplateDetails();
    }

    if (
      !id &&
      extraFields?.dynamicValue1?.value === 'visitorsCheckIn' &&
      returnPage === pageType.visitor
    ) {
      let staticQuestionFields = [
        {
          questionStatement: 'Full Name',
          responseType: 0,
          required: true,
          disable: true,
        },
        {
          questionStatement: 'Phone Number',
          responseType: 12,
          required: false,
          disable: true,
        },
        {
          questionStatement: 'Profile Picture',
          responseType: 10,
          required: true,
          disable: true,
        },
      ];

      // set the initial value of the static fields
      let defaultStateForVisitorSecton = {
        ...initialCreateTemplateFormObject,
        // templateableType: 'visitorReports',
        sectionsAttributes: [
          { ...initialSectionObject, questionsAttributes: staticQuestionFields },
        ],
      };
      setTemplate(defaultStateForVisitorSecton);
    }
    if (
      !id &&
      extraFields?.dynamicValue1?.value === 'loadsCheckIn' &&
      returnPage === pageType.loads
    ) {
      let staticQuestionFields = [
        // {
        //   questionStatement: "Driver's Name",
        //   responseType: 0,
        //   required: true,
        //   disable: true,
        // },
        {
          questionStatement: 'Vehicle Number',
          responseType: 0,
          required: true,
          disable: true,
        },
        {
          questionStatement: 'Trailer Number',
          responseType: 0,
          required: false,
          disable: true,
        },
        {
          questionStatement: 'Carrier Name',
          responseType: 0,
          required: false,
          disable: true,
        },
        {
          questionStatement: 'Bob Number',
          responseType: 0,
          required: false,
          disable: true,
        },
        // {
        //   questionStatement: 'Image',
        //   responseType: 10,
        //   required: false,
        //   disable: true,
        // },
      ];

      // set the initlial value of the static fields
      let defaultStateForVisitorSecton = {
        ...initialCreateTemplateFormObject,
        // templateableType: 'visitorReports',
        sectionsAttributes: [
          { ...initialSectionObject, questionsAttributes: staticQuestionFields },
        ],
      };
      setTemplate(defaultStateForVisitorSecton);
    }
    if (
      !id &&
      ['loadsCheckOut', 'visitorsCheckOut'].includes(extraFields?.dynamicValue1?.value) &&
      [pageType.loads, pageType.visitor].includes(returnPage)
    ) {
      let staticQuestionFields = [];

      let defaultStateForVisitorSecton = {
        ...initialCreateTemplateFormObject,
        sectionsAttributes: [
          { ...initialSectionObject, questionsAttributes: staticQuestionFields },
        ],
      };
      setTemplate(defaultStateForVisitorSecton);
    }
  }, [id, extraFields?.dynamicValue1]);

  useEffect(() => {
    if (extraFieldSecondDD?.length > 0 && !loading) {
      if (templateStaticType.includes(template?.templateableType)) {
        let value = visitorOptions?.[returnPage]?.selectedObject?.[template?.templateableType];
        setExtraFields({ dynamicValue1: value });
        let parentTemplateId = template?.parentTemplateId;
        if (parentTemplateId) {
          let finalSecondValue = extraFieldSecondDD?.find((data) => data?.id == parentTemplateId);
          setExtraFields((prev) => ({ ...prev, dynamicValue2: finalSecondValue }));
        }
      }
    }
  }, [extraFieldSecondDD]);

  const classes = useStyles();
  const isEdit = id ? true : false;

  const handleChange = (event) => {
    if (event?.target?.name === 'includeSiteSummary') {
      setTemplate((prevState) => ({
        ...prevState,
        [event?.target?.name]: event?.target?.checked,
      }));
      return;
    }
    setTemplate((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  const addSection = () => {
    setTemplate((prevState) => ({
      ...prevState,
      sectionsAttributes: [...template.sectionsAttributes, initialSectionObject],
    }));
  };

  const checkIfOptionsDeleted = () => {
    const tempTemplate = {
      ...template,
      sectionsAttributes: template.sectionsAttributes.map((item, _index) => {
        if (item?._destroy || !item?.id) return item;
        const prevSection = prevTemplate.sectionsAttributes.filter(
          (sectionItem) => item?.id == sectionItem?.id,
        )?.[0];
        return {
          ...item,
          questionsAttributes: item?.questionsAttributes.map((question, _questionIndex) => {
            if (question?._destroy || !question?.id) return question;
            let tempOptionAttributes = [];
            const preQuestion = prevSection.questionsAttributes.filter(
              (questionItem) => question?.id == questionItem?.id,
            )?.[0];
            const preResponseType = preQuestion?.responseType;
            const prevOption = preQuestion?.optionsAttributes;
            if (
              question?.responseType !== preResponseType &&
              (preResponseType == enumResponseType.radio ||
                preResponseType == enumResponseType?.multiselect)
            ) {
              tempOptionAttributes = prevOption?.map((option) => ({ ...option, _destroy: true }));
            } else if (
              question?.responseType === preResponseType &&
              (preResponseType == enumResponseType.radio ||
                preResponseType == enumResponseType?.multiselect)
            ) {
              tempOptionAttributes = prevOption
                ?.map((option) => {
                  const found = question?.optionsAttributes?.find(
                    (tempOption) => tempOption?.id == option?.id,
                  );
                  if (found?.id) {
                    return null;
                  }
                  return {
                    ...option,
                    _destroy: true,
                  };
                })
                .filter((option) => option?.id);
            }
            return {
              ...question,
              optionsAttributes: [...(question?.optionsAttributes ?? []), ...tempOptionAttributes],
            };
          }),
        };
      }),
    };
    return tempTemplate;
  };

  const removeErrorMessage = (sectionIndex, questionIndex) => {
    const sectionsAttributesErrors = convertJoiErrorsToArrayOfObjects(errorMessages);

    if (typeof questionIndex === 'number') {
      // for removing question, from a section

      // Handle removing a specific question from a section
      const section = sectionsAttributesErrors[sectionIndex];
      if (section && section.questionsAttributes) {
        const updatedQuestions = [...section.questionsAttributes]; // Create a shallow copy of questions array
        updatedQuestions.splice(questionIndex, 1); // Remove the question at questionIndex

        // Update the section with the modified questions array
        const updatedSection = {
          ...section,
          questionsAttributes: updatedQuestions?.length > 0 ? updatedQuestions : null,
        };

        // Update the sectionsAttributesErrors array
        const updatedSectionsAttributesErrors = [...sectionsAttributesErrors];
        updatedSectionsAttributesErrors[sectionIndex] = updatedSection;

        // Convert back to the Joi object format and update errorMessages
        const updatedErrorMessages = convertErrorsToJoiObject(updatedSectionsAttributesErrors);
        setErrorMessages({ ...updatedErrorMessages });
      }
    } else {
      // for removing section
      const updatedErrors = [...sectionsAttributesErrors];
      updatedErrors?.splice(sectionIndex, 1);
      const updatedErrorMessages = convertErrorsToJoiObject(updatedErrors);
      setErrorMessages({ ...updatedErrorMessages });
    }
  };

  const removeSection = (sectionIndex) => {
    removeErrorMessage(sectionIndex);

    if (isEdit) {
      //template edit form
      const tempsectionsAttributes = template?.sectionsAttributes?.map((section, index) => {
        if (sectionIndex == index) {
          if (section?.id) return { ...section, _destroy: true };
          return null;
        }
        return section;
      });
      setTemplate((prevState) => ({
        ...prevState,
        sectionsAttributes: tempsectionsAttributes.filter((section) => !!section),
      }));
      return;
    }
    setTemplate((prevState) => ({
      ...prevState,
      sectionsAttributes: template?.sectionsAttributes?.filter(
        (section, index) => sectionIndex != index,
      ),
    }));
  };

  const handleSectionChange = (event) => {
    const splitNameIndex = event.target.name.split('-');
    setTemplate((prevState) => {
      const tempsectionsAttributes = prevState.sectionsAttributes.map((section, index) => {
        if (index == splitNameIndex[1]) {
          return { ...section, [splitNameIndex[0]]: event.target.value };
        }
        return section;
      });
      return { ...prevState, sectionsAttributes: tempsectionsAttributes };
    });
  };

  const updateQuestions = (questions, sectionIndex, questionIndex) => {
    if (typeof questionIndex === 'number') {
      removeErrorMessage(sectionIndex, questionIndex);
    }

    setTemplate((prevState) => {
      const tempsectionsAttributes = prevState.sectionsAttributes.map((section, index) => {
        if (index == sectionIndex) {
          return { ...section, questionsAttributes: questions };
        }
        return section;
      });
      return { ...prevState, sectionsAttributes: tempsectionsAttributes };
    });
  };
  const handleSubmit = async () => {
    setDisabled(true);
    setLoading(true);
    setErrorMessages({});
    let extraDynamicParams = {};
    // ? NOTE: if the variable "description" is not getting used add _ before it or this rule will suffice the need here.
    // eslint-disable-next-line no-unused-vars
    let { description, ...filterDeletedQuestionsTemp } = template;
    // if first dynamic DD is set then send to joi
    if (extraFields?.dynamicValue1) {
      extraDynamicParams.dynamicValue1 = extraFields?.dynamicValue1?.value || null;
    }
    //if first dd is set to a value such that the second is displayed on UI then and its not selected then set it to null to make joi throw the error
    if (
      !isObjectEmpty(extraFields?.dynamicValue1) &&
      extraFields?.dynamicValue1.value === visitorOptions?.[returnPage]?.changeableValueCriteria &&
      !extraFields?.dynamicValue2
    ) {
      extraDynamicParams.dynamicValue2 = null;
    }
    // pluck value of second dynamic value
    if (!isObjectEmpty(extraFields?.dynamicValue2)) {
      extraDynamicParams.dynamicValue2 = extraFields?.dynamicValue2?.value || null;
    }

    // merge extra inputs with the payload
    filterDeletedQuestionsTemp = { ...filterDeletedQuestionsTemp, ...extraDynamicParams };

    const errors = await joiTemplateValidate(filterDeletedQuestionsTemp, t);
    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      setDisabled(false);
      setLoading(false);

      return;
    }
    let finalTemplate = template;
    finalTemplate = {
      ...template,
      templateableType: extraDynamicParams?.dynamicValue1 || template?.templateableType,
    };

    // manually set the custom value for parentTemplateId if the second dynamic value is selected
    if (!isObjectEmpty(extraFields?.dynamicValue2) && extraDynamicParams?.dynamicValue2) {
      finalTemplate = { ...finalTemplate, parentTemplateId: extraDynamicParams?.dynamicValue2 };
    }

    let addDeletedOptionAttribute = isEdit ? checkIfOptionsDeleted() : finalTemplate;

    if (templateStaticType.includes(template.templateableType)) {
      addDeletedOptionAttribute = {
        ...addDeletedOptionAttribute,
        parentTemplateId: finalTemplate?.parentTemplateId,
        templateableType: finalTemplate?.templateableType,
      };
    }

    // Removing the key if report type is not Activity Report
    if (template?.templateableType !== enumReports.activityReport) {
      delete finalTemplate.includeSiteSummary;
    }

    try {
      const response = isEdit
        ? await updateTemplate({
            template: addDeletedOptionAttribute,
            templateId: id,
          })
        : await createTemplate({ template: { siteId, ...finalTemplate } });

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        handleBack();
      }

      setLoading(false);
      setDisabled(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDisabled(false);
      setLoading(false);
    }
  };
  const handleBack = () => {
    navigateBack({ fallbackUrl: `${COMMON_SETTING}?activeTab=reportTemplates` });
  };

  const getTemplateDetails = async () => {
    try {
      const res = await getTemplate(id);
      setTemplate(res?.data?.template);
      setPrevTemplate(res?.data?.template);
      if (
        id &&
        (returnPage === pageType.loads || returnPage === pageType.visitor) &&
        extraFieldSecondDD?.length === 0
      ) {
        getVisitorTemplateTypes();
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      history.push(`${COMMON_SETTING}?activeTab=reportTemplates`);
    }
  };
  const getVisitorTemplateTypes = async () => {
    try {
      let params = {
        visitors: {
          checkIn: 'visitorsCheckIn',
        },
        loads: {
          checkIn: 'loadsCheckIn',
        },
      };
      let data = await getTemplateTypesForReports(siteId, params?.[returnPage]?.checkIn, true);

      if (data?.data?.templates?.length > 0) {
        setExtraFieldsSecondDD(transformArrayForOptions(data?.data?.templates, 'title', 'id'));
        setDisableVistorSecondDD(false);
        setLoading(false);
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const addSectionErrorMessage = errorMessages[nestedKeys.sectionKey?.formKey];
  const handleVisitorCheck = (e) => {
    if (e.target.name === 'dynamicValue2') {
      setExtraFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
      return;
    }
    /** if updating first key, reset the second */
    setExtraFields((prev) => removeKey(['dynamicValue2'], prev));

    setTemplate((prev) => removeKey(['parentTemplateId'], prev));
    setExtraFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /** Configuration for dynamic fields for loads and visitors */
  const visitorOptions = {
    visitors: {
      label: t('ho.templates.staticFields.visitor.visitorLabel'),
      placeholder: t('ho.templates.staticFields.visitor.placeholder'),
      firstInputLabel: t('ho.templates.staticFields.visitor.checkIn'),
      secondInputLabel: t('ho.templates.staticFields.visitor.checkOut'),
      secondDropdownLabel: t('ho.templates.staticFields.visitor.secondDropdownLabel'),
      changeableValueCriteria: 'visitorsCheckOut',
      selectedObject: {
        visitorsCheckOut: {
          id: 2,
          label: t('ho.templates.staticFields.visitor.checkOut'),
          value: 'visitorsCheckOut',
        },
        visitorsCheckIn: {
          id: 1,
          label: t('ho.templates.staticFields.visitor.checkIn'),
          value: 'visitorsCheckIn',
        },
      },
      options: [
        {
          id: 1,
          label: t('ho.templates.staticFields.visitor.checkIn'),
          value: 'visitorsCheckIn',
        },
        {
          id: 2,
          label: t('ho.templates.staticFields.visitor.checkOut'),
          value: 'visitorsCheckOut',
        },
      ],
    },
    loads: {
      selectedObject: {
        loadsCheckIn: {
          id: 1,
          label: t('ho.templates.staticFields.loads.checkIn'),
          value: 'loadsCheckIn',
        },
        loadsCheckOut: {
          id: 2,
          label: t('ho.templates.staticFields.loads.checkOut'),
          value: 'loadsCheckOut',
        },
      },
      label: t('ho.templates.staticFields.loads.loadsLabel'),
      placeholder: t('ho.templates.staticFields.loads.placeholder'),
      firstInputLabel: t('ho.templates.staticFields.loads.checkIn'),
      secondInputLabel: t('ho.templates.staticFields.loads.checkOut'),
      secondDropdownLabel: t('ho.templates.staticFields.loads.secondDropdownLabel'),
      changeableValueCriteria: 'loadsCheckOut',
      options: [
        {
          id: 1,
          label: t('ho.templates.staticFields.loads.checkIn'),
          value: 'loadsCheckIn',
        },
        {
          id: 2,
          label: t('ho.templates.staticFields.loads.checkOut'),
          value: 'loadsCheckOut',
        },
      ],
    },
  };

  const StaticFields = {
    visitor: [
      { label: 'Full Name', key: 'fullName', editable: false },
      { label: " Driver's Name", key: 'phone', editable: false },
    ],
  };

  const showAddSection = !(returnPage == pageType.visitor || returnPage == pageType.loads);
  const dynamicValues1 = extraFields?.dynamicValue1 || null;

  // const dynamicValue2 = extraFields?.dynamicValue2 || null;
  const productTypeDropDownCondition = [pageType.visitor, pageType.loads].includes(returnPage)
    ? returnPage
    : null;

  const _updateFirstObjectInSectionsAttributes = () => {
    const conditionMet = !['visitorsCheckIn', 'loadsCheckIn'].includes(
      extraFields?.dynamicValue1?.value,
    );

    // Clone the sectionsAttributes array to avoid mutating the original array
    const clonedSectionsAttributes = [...template.sectionsAttributes];

    // Update the first object in the cloned array if the condition is met
    if (conditionMet) {
      clonedSectionsAttributes[0] = {
        ...clonedSectionsAttributes[0],
        questionsAttributes: clonedSectionsAttributes[0]?.questionAttributes?.filter(
          (data) => data?.disable,
        ),
      };
    }

    // Return the updated template with the modified sectionsAttributes array
    return { ...template, sectionsAttributes: clonedSectionsAttributes };
  };

  const finalData = _updateFirstObjectInSectionsAttributes();
  const showExtraDD =
    returnPage && (returnPage === pageType.visitor || returnPage === pageType.loads) && !id;

  const isIncidentReport = template?.templateableType === enumReports.incidentReport;

  const renderTemplateForm = () => {
    if (isEdit && loading) return <LoaderComponent size={50} />;
    return (
      <>
        {template?.templateableType === enumReports.activityReport && (
          <Box className={classes.checkboxWrapper}>
            <Box className={classes.internalMapBox}>
              <Checkbox
                checked={template?.includeSiteSummary}
                onClick={handleChange}
                name="includeSiteSummary"
                icon={isIncidentReport ? <CheckboxDisabled /> : <Regular />}
                checkedIcon={isIncidentReport ? <CheckBoxCheckedDisabled /> : <Iregular />}
                className={classes.checkBoxCustom}
                disabled={isIncidentReport}
              />
              <InputLabel className={classes.mb0}>
                {t('ho.templates.create.includeDailySummary')}
              </InputLabel>
            </Box>
          </Box>
        )}
        <Box className={classes.createTemplateContent}>
          <Box className={classes.createTemplateTitle}>
            {showExtraDD && (
              <>
                {' '}
                <Box className={classes.checkInWrapper}>
                  <CustomDropDown
                    className={classes.checkInWrapperDD}
                    // label={visitorOptions?.[returnPage]?.label}
                    placeHolder={visitorOptions?.[returnPage]?.placeholder}
                    options={visitorOptions?.[returnPage]?.options}
                    selectedValues={extraFields?.dynamicValue1 || {}}
                    handleChange={handleVisitorCheck}
                    name="dynamicValue1"
                    isError={!!errorMessages?.dynamicValue1}
                    bordered
                  />
                </Box>
                <Box className={classes.checkInWrapperLast}>
                  {!isObjectEmpty(dynamicValues1) &&
                    extraFields?.dynamicValue1?.value ===
                      visitorOptions?.[returnPage]?.changeableValueCriteria && (
                      <>
                        <CustomDropDown
                          className={classes.checkInWrapperDD}
                          label={visitorOptions?.[returnPage]?.secondDropdownLabel}
                          options={extraFieldSecondDD}
                          selectedValues={extraFields?.dynamicValue2 || {}}
                          handleChange={handleVisitorCheck}
                          name="dynamicValue2"
                          disabled={disableVistorSecondDD}
                          isError={!!errorMessages?.dynamicValue2}
                          bordered
                        />
                        <Box>
                          {!!errorMessages?.dynamicValue2 && (
                            <div className={classes.invalidFeedback}>
                              {t('obx.form.input.dropDown.checkInNotSelected.label')}
                            </div>
                          )}
                        </Box>
                      </>
                    )}
                </Box>
              </>
            )}
            <CreateTemplateTitle
              staticProps={productTypeDropDownCondition}
              staticFields={StaticFields?.[returnPage]}
              title={finalData?.title}
              description={finalData?.description}
              handleChange={handleChange}
              errorMessages={errorMessages}
              isEdit={isEdit}
              templateableType={finalData?.templateableType}
            />
          </Box>

          {template?.sectionsAttributes?.map(
            (section, index) =>
              !section?._destroy && (
                <Fragment key={`section-${index}`}>
                  <CreateTemplateSection
                    questions={section?.questionsAttributes}
                    sectionIndex={index}
                    handleSectionChange={handleSectionChange}
                    updateQuestions={updateQuestions}
                    title={section?.title}
                    description={section?.description}
                    errorMessages={errorMessages}
                    isEdit={isEdit}
                    removeSection={removeSection}
                  />
                </Fragment>
              ),
          )}
          {showAddSection && (
            <Box className={classes.createTemplateAddSection}>
              <Button variant="primary" onClick={addSection} startIcon={<PlusIcon />}>
                {t('ho.templates.create.btn.addSection')}
              </Button>
            </Box>
          )}
        </Box>
        {!!addSectionErrorMessage && (
          <Box className={classes.invalidFeedback}>{addSectionErrorMessage}</Box>
        )}
      </>
    );
  };

  return (
    <>
      {disabled && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box className={classes.createTemplate}>
        <Box className={classes.createTemplateHeader}>
          <ButtonGroup
            showBack={true}
            handleBack={handleBack}
            handleCancel={handleBack}
            handleSave={handleSubmit}
            disabled={disabled}
          />
        </Box>
        <Divider className={classes.createTemplateDivider} />
        {renderTemplateForm()}
        <ButtonGroup
          showBack={false}
          handleBack={handleBack}
          handleCancel={handleBack}
          handleSave={handleSubmit}
          disabled={disabled}
        />
      </Box>
    </>
  );
};

export default CreateTemplate;
