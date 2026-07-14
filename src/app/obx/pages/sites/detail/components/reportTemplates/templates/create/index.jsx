import { Box, Divider } from '@mui/material';
import Button from '@mui/material/Button';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import LoaderComponent from 'src/app/components/common/loader';
import { COMMON_SETTING } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { createTemplate, getTemplate, updateTemplate } from 'src/services/template.services';
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

const initialCreateTemplateFormObject = {
  title: '',
  description: '',
  templateableType: 'equipmentInspection',
  sectionsAttributes: [],
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
};

const CreateTemplate = () => {
  const { t } = useTranslation();
  const [template, setTemplate] = useState(initialCreateTemplateFormObject);
  const [prevTemplate, setPrevTemplate] = useState(initialCreateTemplateFormObject);
  const [errorMessages, setErrorMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const { id } = useParams();
  const classes = useStyles();

  const isEdit = id ? true : false;

  const handleChange = (event) => {
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

  const removeSection = (sectionIndex) => {
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
        sectionsAttributes: tempsectionsAttributes.filter((section) => section?.id),
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

  const updateQuestions = (questions, sectionIndex) => {
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
    setErrorMessages({});

    // ? NOTE: if the variable "description" is not getting used add _ before it or this rule will suffice the need here.
    // eslint-disable-next-line no-unused-vars
    const { description, ...filterDeletedQuestionsTemp } = template;
    const errors = await joiTemplateValidate(filterDeletedQuestionsTemp, t);
    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      setDisabled(false);
      return;
    }

    const addDeletedOptionAttribute = isEdit ? checkIfOptionsDeleted() : template;
    try {
      const response = isEdit
        ? await updateTemplate({ template: addDeletedOptionAttribute, templateId: id })
        : await createTemplate({ template });

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        handleBack();
      }
      setDisabled(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDisabled(false);
    }
  };

  const handleBack = () => {
    history.push(`${COMMON_SETTING}?activeTab=reportTemplates`);
  };

  const getTemplateDetails = async () => {
    try {
      const res = await getTemplate(id);
      setTemplate(res?.data?.template);
      setPrevTemplate(res?.data?.template);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      history.push(`${COMMON_SETTING}?activeTab=reportTemplates`);
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      getTemplateDetails();
    }
  }, [id]);

  const addSectionErrorMessage = errorMessages[nestedKeys.sectionKey?.formKey];

  const renderTemplateForm = () => {
    if (isEdit && loading) return <LoaderComponent size={50} />;
    return (
      <>
        <Box className={classes.createTemplateContent}>
          <Box className={classes.createTemplateTitle}>
            <CreateTemplateTitle
              title={template?.title}
              description={template?.description}
              handleChange={handleChange}
              errorMessages={errorMessages}
              isEdit={isEdit}
              templateableType={template.templateableType}
            />
          </Box>

          {template?.sectionsAttributes.map(
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

          <Box className={classes.createTemplateAddSection}>
            <Button variant="primary" onClick={addSection} startIcon={<PlusIcon />}>
              {t('ho.templates.create.btn.addSection')}
            </Button>
          </Box>
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
