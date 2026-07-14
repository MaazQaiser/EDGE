import { Box, Button, Divider, InputLabel } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { PlusIcon } from 'assets/svg';
import { ReactComponent as DeleteIcon } from 'assets/svg/trash-2.svg?react';
import CustomDropDown from 'commonComponents/customDropDown';
import CheckBoxLabel from 'commonComponents/templates/checkBoxLabel';
import CustomInput from 'commonComponents/templates/customInput';
import CustomInputIcon from 'commonComponents/templates/customInputIcon';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { ReactComponent as AddIcon } from 'src/assets/svg/plus.svg?react';

const initalQuestionObject = {
  questionStatement: '',
  instruction: '',
  optionsAttributes: [],
  responseType: 0,
  isMendatory: false,
};
const initalQuestionOptionObject = {
  optionText: '',
};

/**
 * CreateTemplateQuestion is a reusable React component for displaying button bars.
 * @param {object} question  - object contains function data.
 * @param {function} handleQuestionFieldChange - Function to handle change in option attributes.
 * @param {function} updateQuestionOptions - Function to update question option attributes.
 * @param {function} removeQuestion - Function to remove a question.
 * @param {number} questionIndex - index of current question.
 * @param {object} errorMessages - Error messages to handle errors.
 * @param {number} sectionIndex - section index of current section.
 */

const enumResponseType = {
  text: 0,
  number: 1,
  multiselect: 2,
  datetime: 3,
  radio: 4,
  date: 5,
  imageVideo: 6,
  time: 7,
  signature: 13,
};

const useStyles = makeStyles((theme) => ({
  createTemplateQuestion: {
    padding: '20px 16px',
    background: theme.palette.surfaceWhite,
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    marginTop: '16px',

    '&:first-child': {
      marginTop: '0px',
    },
  },
  createTemplateInput: {
    marginTop: '16px',

    '&:first-child': {
      marginTop: '0px',
    },
  },
  createTemplateDropdown: {
    backgroundColor: theme.palette.surfaceWhite,
    height: '44px !important',
    width: '410px',
    marginBottom: '16px',

    '& h6': {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: '400',
    },

    '& p': {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: '400',
      color: theme.palette.textSecondary1,
    },
  },

  createTemplateInputIcons: {
    marginTop: '12px',
  },

  createTemplateOptions: {
    marginTop: '16px',
    maxWidth: '410px',
    width: '100%',
  },

  createTemplateActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '20px',
  },

  createTemplateDivider: {
    display: 'block',
    '&.MuiDivider-root': {
      marginTop: '16px',
      marginBottom: '16px',
      borderColor: theme.palette.borderSubtle1,
    },
  },

  createTemplateDeleteAction: {
    '&.MuiButtonBase-root': {
      '& .MuiButton-startIcon': {
        '& svg': {
          width: '20px',
          height: '20px',
        },
      },
    },
  },

  createTemplateAddOptionBtn: {
    '&.MuiButtonBase-root': {
      '&:disabled': {
        '& .MuiButton-startIcon': {
          '& svg': {
            '& path': {
              stroke: theme.palette.textBrandDisabled,
            },
          },
        },
      },
    },
  },

  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '6px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },

  createTemplateInputDescription: {
    '& .MuiInputBase-root': {
      alignItems: 'baseline',
    },
  },

  createTemplateAddDescriptionBtn: {
    '&.MuiButtonBase-root': {
      padding: '0',
      height: 'auto',
      color: theme.palette.textSecondary2,

      '& .MuiButton-startIcon': {
        marginRight: '4px',

        '& svg path': {
          stroke: theme.palette.textSecondary2,
        },
      },

      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  },
}));

const CreateTemplateQuestion = ({
  question,
  handleQuestionFieldChange,
  updateQuestionOptions,
  removeQuestion,
  questionIndex,
  errorMessages,
  sectionIndex,
  placeholder,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [showDescription, setShowDescription] = React.useState(!!question.instruction);
  const dropDownOptions = [
    {
      value: 0,
      label: t('ho.templates.create.section.field.responseType.text'),
    },
    {
      value: 12,
      label: t('ho.templates.create.section.field.responseType.phoneNumber'),
    },
    {
      value: 11,
      label: t('ho.templates.create.section.field.responseType.description'),
    },
    {
      value: 1,
      label: t('ho.templates.create.section.field.responseType.number'),
    },
    {
      value: 2,
      label: t('ho.templates.create.section.field.responseType.multiselect'),
    },
    {
      value: 3,
      label: t('ho.templates.create.section.field.responseType.dateTime'),
    },
    {
      value: 4,
      label: t('ho.templates.create.section.field.responseType.radio'),
    },
    {
      value: 5,
      label: t('ho.templates.create.section.field.responseType.date'),
    },
    {
      value: 7,
      label: t('ho.templates.create.section.field.responseType.time'),
    },
    {
      value: 6,
      label: t('ho.templates.create.section.field.responseType.imageVideo'),
    },
    {
      value: 9,
      label: t('ho.templates.create.section.field.responseType.attachment'),
    },
    {
      value: 13,
      label: t('ho.templates.create.section.field.responseType.signature'),
    },
    // ,
    //     {
    //       value: 10,
    //       label: t('ho.templates.create.section.field.responseType.webCam'),
    // },
  ];

  const testEnum = {
    0: t('ho.templates.create.section.field.responseType.text'),
    1: t('ho.templates.create.section.field.responseType.number'),
    2: t('ho.templates.create.section.field.responseType.multiselect'),
    3: t('ho.templates.create.section.field.responseType.dateTime'),
    4: t('ho.templates.create.section.field.responseType.radio'),
    5: t('ho.templates.create.section.field.responseType.date'),
    6: t('ho.templates.create.section.field.responseType.imageVideo'),
    7: t('ho.templates.create.section.field.responseType.time'),
    9: t('ho.templates.create.section.field.responseType.attachment'),
    11: t('ho.templates.create.section.field.responseType.description'),
    12: t('ho.templates.create.section.field.responseType.phoneNumber'),
    13: t('ho.templates.create.section.field.responseType.signature'),
    // 10: t('ho.templates.create.section.field.responseType.webCam'),
  };

  const handleDelete = () => {
    removeQuestion(questionIndex);
  };

  const addOptionInQuestion = () => {
    updateQuestionOptions(
      [...(question?.optionsAttributes ?? []), initalQuestionOptionObject],
      questionIndex,
    );
  };

  const removeOptionInQuestion = (option, index) => {
    updateQuestionOptions(
      question?.optionsAttributes?.filter((item, optionIndex) => optionIndex !== index),
      questionIndex,
    );
  };

  const handleQuestionOption = (event) => {
    const splitNameIndex = event.target.name.split('-');
    const tempOptions = question?.optionsAttributes
      ? question.optionsAttributes.map((item, index) => {
          if (index == splitNameIndex[1]) {
            return { optionText: event.target.value };
          }
          return item;
        })
      : [];

    updateQuestionOptions(tempOptions, questionIndex);
  };

  const emptyOptionExist = () => {
    let emptyOption = false;
    question?.optionsAttributes?.forEach((element) => {
      if (element == '') emptyOption = true;
    });
    return emptyOption;
  };

  const getErrorKey = (key, formDataKey, index, formDataIndex, formQuestionKey) => {
    return `${formDataKey},${formDataIndex},${formQuestionKey},${index},${key}`;
  };

  const showError = (key) => {
    return errorMessages?.[
      `${getErrorKey(
        key,
        'sectionsAttributes',
        questionIndex,
        sectionIndex,
        'questionsAttributes',
      )}`
    ];
  };

  const getErrorKeyOptionAttributes = (index) => {
    return `sectionsAttributes,${sectionIndex},questionsAttributes,${questionIndex},optionsAttributes,${index},optionText`;
  };

  const getErrorMessageOptionAttributes = (index) => {
    return errorMessages?.[getErrorKeyOptionAttributes(index)];
  };

  const handleDropDown = (event) => {
    if (!event.target.value.label) return;
    handleQuestionFieldChange({
      target: {
        name: event.target.name,
        value: event.target.value.value,
      },
    });
  };

  const displayAddOptionButton =
    question?.responseType == enumResponseType.radio ||
    question?.responseType == enumResponseType.multiselect;
  return (
    <Box className={classes.createTemplateQuestion}>
      <Box className={classes.createTemplateInput}>
        <CustomInput
          value={question?.questionStatement}
          onChange={handleQuestionFieldChange}
          name={`questionStatement-${questionIndex}`}
          label={t('ho.templates.create.section.field.title')}
          multiline
          disabled={question?.disable || false}
          errorMessage={showError('questionStatement')}
          id={`${sectionIndex}-questionStatement-${questionIndex}`}
          placeholder={placeholder ? placeholder : `${t('commonText.input.defaultPlaceholder')}`}
          required={question?.required || false}
        />
      </Box>
      <Box className={classes.createTemplateInput}>
        {/** If there are static fields then they are supposed to be disabled so we dont show description or label or the input type  */}
        {!question?.disable && (
          <>
            {!showDescription ? (
              <Button
                variant="tertiaryGrey"
                className={classes.createTemplateAddDescriptionBtn}
                startIcon={<AddIcon />}
                disableRipple
                onClick={() => setShowDescription(!showDescription)}
              >
                {t('reportProblem.addDescription')}
              </Button>
            ) : (
              <CustomInput
                value={question?.instruction}
                label={t('ho.templates.create.section.field.description')}
                onChange={handleQuestionFieldChange}
                name={`instruction-${questionIndex}`}
                multiline
                placeholder={t('ho.templates.create.section.field.descriptionPlaceholder')}
                id={`${sectionIndex}-instruction-${questionIndex}`}
                className={classes.createTemplateInputDescription}
                rows={4}
              />
            )}
          </>
        )}
      </Box>
      <Box className={classes.createTemplateOptions}>
        {/** If its disabled then dont show the answer type */}
        {!question?.disable && (
          <Box className={classes.createTemplateInput}>
            <InputLabel>
              {t('ho.templates.create.section.field.answerType')}
              <RequiredAsterik />
            </InputLabel>
            <CustomDropDown
              placeHolder={t('ho.templates.create.section.field.answerType')}
              label={t('ho.templates.create.section.field.answerType')}
              name={`responseType-${questionIndex}`}
              options={dropDownOptions}
              selectedValues={{
                value: question.responseType?.toString(),
                label: testEnum[question.responseType],
              }}
              handleChange={handleDropDown}
              multiple={false}
              className={classes.createTemplateDropdown}
              bordered={true}
            />
          </Box>
        )}
        {question?.optionsAttributes?.map((option, index) => (
          <Box key={index} className={classes.createTemplateInputIcons}>
            <CustomInputIcon
              value={option?.optionText}
              handleChange={handleQuestionOption}
              name={`optionText-${index}`}
              handleRemove={() => removeOptionInQuestion(option, index)}
              errorMessage={getErrorMessageOptionAttributes(index)}
              placeholder={t('ho.templates.create.section.field.option.placeholder')}
              id={`${sectionIndex}-${questionIndex}-${index}-optionText`}
            />
          </Box>
        ))}
        {displayAddOptionButton && (
          <Box className={classes.createTemplateInput}>
            <Button
              variant="secondaryBlue"
              className={classes.createTemplateAddOptionBtn}
              onClick={addOptionInQuestion}
              disabled={emptyOptionExist()}
              startIcon={<PlusIcon color="#146DFF" />}
            >
              {t('ho.templates.create.btn.newOption')}
            </Button>

            {!!showError('optionsAttributes') && (
              <Box className={classes.invalidFeedback}>{showError('optionsAttributes')}</Box>
            )}
          </Box>
        )}
      </Box>
      <Divider className={classes.createTemplateDivider} />
      <Box className={classes.createTemplateActions}>
        <CheckBoxLabel
          value={question?.required}
          handleChange={handleQuestionFieldChange}
          name={`required-${questionIndex}`}
          disabled={question?.disable || false}
          label={t('ho.templates.create.checkbox.required')}
        />
        {/** Disabled fields are static and they can't be deleted */}
        {!question?.disable && (
          <Button
            className={classes.createTemplateDeleteAction}
            variant="destructiveSecondary"
            onClick={handleDelete}
            startIcon={<DeleteIcon />}
          >
            {t('ho.templates.create.btn.delete')}
          </Button>
        )}
      </Box>
    </Box>
  );
};

CreateTemplateQuestion.propTypes = {
  question: PropTypes.object.isRequired,
  handleQuestionFieldChange: PropTypes.func.isRequired,
  updateQuestionOptions: PropTypes.func.isRequired,
  removeQuestion: PropTypes.func.isRequired,
  questionIndex: PropTypes.number.isRequired,
  errorMessages: PropTypes.object.isRequired,
  sectionIndex: PropTypes.number.isRequired,
  placeholder: PropTypes.string,
};

CreateTemplateQuestion.defaultProps = {
  question: initalQuestionObject,
  questionIndex: 0,
  errorMessages: {},
  sectionIndex: 0,
};

export default CreateTemplateQuestion;
