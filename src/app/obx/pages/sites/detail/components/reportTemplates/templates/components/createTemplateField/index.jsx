import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import CreateTemplateQuestion from '../createTemplateQuestion';

/**
 * TemplateField Component
 *
 * @description Renders a list of questions using the CreateTemplateQuestion component.
 *
 * @param {object[]} questions - An array of question objects.
 * @param {function} handleQuestionFieldChange - Handler to update question field.
 * @param {function} updateQuestionOptions - Function to update question options.
 * @param {function} removeQuestion - Function to remove a specific question.
 * @param {object} errorMessages - Object containing error messages.
 * @param {number} sectionIndex - Index of the current section.
 *
 * @param isEdit
 * @returns {JSX.Element}
 */
const TemplateField = ({
  questions,
  handleQuestionFieldChange,
  updateQuestionOptions,
  removeQuestion,
  errorMessages,
  sectionIndex,
  isEdit,
}) => {
  const { t } = useTranslation();
  return (
    <>
      {questions?.map((question, index) => (
        <React.Fragment key={`question-${index}`}>
          {!question?._destroy && (
            <>
              <CreateTemplateQuestion
                handleQuestionFieldChange={handleQuestionFieldChange}
                updateQuestionOptions={updateQuestionOptions}
                removeQuestion={removeQuestion}
                questionIndex={index}
                question={question}
                errorMessages={errorMessages}
                sectionIndex={sectionIndex}
                placeholder={t('obx.templates.create.section.field.titlePlaceholder')}
                isEdit={isEdit}
              />
            </>
          )}
        </React.Fragment>
      ))}
    </>
  );
};

TemplateField.propTypes = {
  questions: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleQuestionFieldChange: PropTypes.func.isRequired,
  updateQuestionOptions: PropTypes.func.isRequired,
  removeQuestion: PropTypes.func.isRequired,
  errorMessages: PropTypes.object.isRequired,
  sectionIndex: PropTypes.number.isRequired,
  isEdit: PropTypes.bool,
};

export default TemplateField;
