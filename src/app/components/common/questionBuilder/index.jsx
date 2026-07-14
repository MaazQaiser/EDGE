import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import { makeStyles } from '@mui/styles';
import { PlusIcon } from 'assets/svg/index';
import { ReactComponent as DeleteIcon } from 'assets/svg/trash-2.svg?react';
import CustomInput from 'commonComponents/templates/customInput';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as AddIcon } from 'src/assets/svg/plus.svg?react';

import CreateTemplateField from './templateField';

const initalQuestionObject = {
  questionStatement: '',
  instruction: '',
  optionsAttributes: [],
  responseType: 0,
  required: false,
};

const responseTypeKey = 'responseType';

/**
 * CreateTemplateQuestion is a reusable React component for displaying button bars.
 * @param {array} questions  -questions array .
 * @param {string} title -  title of the section.
 * @param {string} description - description of the section.
 * @param {function} updateQuestions - Function to update question state.
 * @param {function} handleSectionChange - function to change section state.
 * @param {function} removeSection - function to change section state.
 * @param {number} sectionIndex - section index of current section.
 * @param {boolean} isEdit - bool to check if its edit or create.
 * @param {object} errorMessages - Error messages to handle errors.
 *
 */

const useStyles = makeStyles((theme) => ({
  createTemplateItem: {
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: 'rgba(230, 230, 231, 0.30)',
    padding: '16px',
    borderTop: `8px solid ${theme.palette.borderBrand}`,
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
  createTemplateInputDescription: {
    '& .MuiInputBase-root': {
      alignItems: 'baseline',
    },
  },

  createTemplateAddQuestions: {
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  createTemplateSectionBox: {
    padding: '16px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
    borderRadius: '8px',
  },

  createTemplateField: {
    marginTop: '16px',
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

  createTemplateAddQuestionsBtn: {
    '&.MuiButtonBase-root': {
      '& .MuiButton-startIcon': {
        '& svg ': {
          width: '20px',
          height: '20px',
        },
      },
    },
  },

  createTemplateDropdown: {
    backgroundColor: theme.palette.surfaceWhite,
    height: '44px !important',
    width: '410px',

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
}));

const CreateTemplateSection = ({
  questions,
  title,
  description,
  updateQuestions,
  handleSectionChange,
  removeSection,
  sectionIndex,
  isEdit,
  errorMessages,
  showSection,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [showDescription, setShowDescription] = React.useState(!!description);
  const addQuestion = () => {
    updateQuestions([...questions, initalQuestionObject], sectionIndex);
  };
  const removeQuestion = (questionIndex) => {
    if (isEdit) {
      const tempQuestions = questions.map((question, index) => {
        if (index == questionIndex) {
          if (question?.id) return { ...question, _destroy: true };
          return null;
        }
        return question;
      });
      updateQuestions(
        tempQuestions.filter((question) => question != null),
        sectionIndex,
      );
    } else {
      const tempQuestions = questions.filter((question, index) => index != questionIndex);
      updateQuestions(tempQuestions, sectionIndex);
    }
  };

  const updateQuestionOptions = (options, questionIndex) => {
    const tempQuestions = questions.map((question, index) => {
      if (index == questionIndex) {
        return { ...question, optionsAttributes: options };
      }
      return question;
    });
    updateQuestions(tempQuestions, sectionIndex);
  };

  const getOptionAttributes = (key, question) => {
    if (key == responseTypeKey) {
      return [];
    }
    return question.optionsAttributes;
  };

  const handleQuestionFieldChange = (event) => {
    const splitNameIndex = event.target.name.split('-');
    const tempQuestions = questions.map((question, index) => {
      if (index == splitNameIndex[1]) {
        return {
          ...question,
          [splitNameIndex[0]]: event.target.value,
          optionsAttributes: getOptionAttributes(splitNameIndex[0], question),
        };
      }
      return question;
    });
    updateQuestions(tempQuestions, sectionIndex);
  };

  /**
   * Generate Key for Joi
   * @param {*} key
   * @param {*} formDataKey
   * @param {*} index
   * @returns
   */
  const getErrorKey = (key, formDataKey, index) => {
    return `${formDataKey},${index},${key}`;
  };

  /**
   * Show error messages on state
   * @param {*} key
   * @param {*} formDataKey
   * @param {*} index
   * @returns
   */
  const showError = (key, formDataKey, index) => {
    return errorMessages?.[`${getErrorKey(key, formDataKey, index)}`];
  };
  return (
    <Box className={classes.createTemplateItem}>
      {showSection && (
        <Box className={classes.createTemplateSectionBox}>
          <Box className={classes.createTemplateInput}>
            <CustomInput
              name={`title-${sectionIndex}`}
              value={title}
              onChange={handleSectionChange}
              label={t('ho.templates.create.section.title')}
              multiline
              errorMessage={showError('title', 'sectionsAttributes', sectionIndex)}
              placeholder={t('ho.templates.create.section.titlePlaceholder')}
              required={true}
              id={`title-${sectionIndex}`}
            />
          </Box>
          <Box className={classes.createTemplateInput}>
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
                name={`description-${sectionIndex}`}
                value={description}
                onChange={handleSectionChange}
                label={t('ho.templates.create.section.description')}
                multiline
                placeholder={t('ho.templates.create.section.descriptionPlaceholder')}
                id={`description-${sectionIndex}`}
                className={classes.createTemplateInputDescription}
                rows={4}
              />
            )}
          </Box>
        </Box>
      )}
      <Box className={classes.createTemplateField}>
        <CreateTemplateField
          questions={questions}
          handleQuestionFieldChange={handleQuestionFieldChange}
          updateQuestionOptions={updateQuestionOptions}
          removeQuestion={removeQuestion}
          errorMessages={errorMessages}
          sectionIndex={sectionIndex}
          isEdit={isEdit}
        />
      </Box>
      <Box className={classes.createTemplateAddQuestions}>
        <Button
          className={classes.createTemplateAddQuestionsBtn}
          variant="secondaryGrey"
          onClick={addQuestion}
          startIcon={<PlusIcon color="#4D4D51" />}
        >
          {t('ho.templates.create.btn.addQuestion')}
        </Button>

        {questions?.filter((question) => !question?._destroy).length == 0 && (
          <Button
            variant="destructiveSecondary"
            onClick={() => removeSection(sectionIndex)}
            startIcon={<DeleteIcon />}
            className={classes.createTemplateAddQuestionsBtn}
          >
            {t('ho.templates.create.btn.delete')}
          </Button>
        )}
      </Box>
      {!!showError('questionsAttributes', 'sectionsAttributes', sectionIndex) && (
        <Box className={classes.invalidFeedback}>
          {showError('questionsAttributes', 'sectionsAttributes', sectionIndex)}
        </Box>
      )}
    </Box>
  );
};

CreateTemplateSection.propTypes = {
  questions: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  updateQuestions: PropTypes.func.isRequired,
  handleSectionChange: PropTypes.func.isRequired,
  removeSection: PropTypes.func.isRequired,
  errorMessages: PropTypes.object.isRequired,
  sectionIndex: PropTypes.number.isRequired,
  isEdit: PropTypes.bool,
  showSection: PropTypes.bool,
};

CreateTemplateSection.defaultProps = {
  questions: [],
  title: '',
  description: '',
  sectionIndex: 0,
  isEdit: false,
  errorMessages: {},
  showSection: true,
};

export default CreateTemplateSection;
