const {
  Box,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
} = require('@mui/material');
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown/index.jsx';
import RequiredAsterik from 'src/app/components/common/requiredAsterik/index.jsx';
import { updateDealQuestions } from 'src/services/deal.service.js';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { calculatePoints } from 'src/utils/calPoints/index.js';
import { toastSettings } from 'src/utils/constants/index.js';
import { toaster } from 'src/utils/toast/index.jsx';

import RelevantEmptyState from '../emptyRelevant/index.jsx';
import { useStyles } from './relevantQuestions.js';

const RelevantQuestions = ({
  questions,
  setQuestions,
  leadId,
  questionsLoading,
  // data,
  setData,
  // className,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const isBtnDisabled = disabled || loading;

  const handleSaveQuestions = async () => {
    setLoading(true);
    try {
      const payload = {
        result: {
          questions: questions.questions,
        },
      };
      const response = await updateDealQuestions(leadId, payload);

      if (response.statusCode === 200) {
        // setDisabled(true);
        setQuestions(response?.data);
        /**
         * prev flow
         */
        // setData((prevData) => ({
        //   ...prevData, // Spread the current state
        //   isQuestionnaireFilled: true, // Update the isQuestionnaireFilled value
        //   // this will indicate to show Questions -> Proposal Deal Stage Transition Modal
        //   // once questionnaire is filled
        //   showProposalTransitionModal: true,
        // }));

        setData((prevData) => ({
          ...prevData, // Spread the current state
          score: response?.data?.score,
        }));
        toaster.success({
          text: t('sales.locations.updateLocationMessage'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      setLoading(false);
    } catch (error) {
      /**
       * show error in the corresponding field
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };
  // Function to update options and selected for a specific question
  function handleOptionSelection(questionId, selectedValues, type, options = []) {
    let updatedSelectedValues = selectedValues; // Initialize with the original value
    if (type === questionTypesInWords.RADIO && options.length) {
      const selectedOption = options.find((option) => option.id === parseInt(selectedValues));
      updatedSelectedValues = selectedOption; // Update with the selectedOption
    }

    /**
     * if it's dropdown with signle select than convert the seleted object into array.
     */
    // Check if selectedValues is an object
    const selectedArray = Array.isArray(updatedSelectedValues)
      ? updatedSelectedValues
      : [updatedSelectedValues];
    // Find the question with the specified ID
    const updatedQuestions = {
      ...questions,
      questions: questions?.questions?.map((question) => {
        if (question.id === questionId) {
          return {
            ...question,
            selected: selectedArray,
          };
        }
        return question;
      }),
    };

    // Update the state with the new questions
    setQuestions(updatedQuestions);
  }

  const renderQuestion = (question) => {
    switch (question.responseType) {
      case 2: // MULTISELECT
        return (
          <Box className={classes.questionRowWrap}>
            <Box className={classes.questionRow}>
              <Box className={classes.InnerColRow}>
                <Box className={classNames(classes.headingColm, classes.wrapClass)}>
                  <Typography variant="subtitle2">
                    {' '}
                    {question?.questionStatement} {question?.required && <RequiredAsterik />}
                  </Typography>
                </Box>
                <Box className={classNames(classes.optionColm, classes.wrapClass)}>
                  <Box className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}>
                    <CustomDropDown
                      name={question?.id}
                      id={question?.id}
                      placeHolder={`Select`}
                      placeHolderClassName={classes?.placeHolderColor}
                      options={transformArrayForOptions(
                        question?.optionsAttributes,
                        'optionText',
                        'id',
                      )}
                      selectedValues={question?.selected || []}
                      handleChange={(event) =>
                        handleOptionSelection(
                          question?.id,
                          event.target.value,
                          questionTypesInWords?.MULTISELECT,
                        )
                      }
                      searchPlaceholder={t('sales.locations.search')}
                      className={classes?.dropdownWrap}
                      multiSelect
                      checkmark
                      searchable
                      bordered
                      withTiles
                      // disabled={questions?.isQuestionnaireFilled}
                    />
                  </Box>
                </Box>
              </Box>
              <Box className={classNames(classes.pointColm, classes.wrapClass)}>
                <Typography variant="subtitle2"> {calculatePoints(question?.selected)}</Typography>
              </Box>
            </Box>
          </Box>
        );
      case 4: // RADIO
        return (
          <Box className={classes.questionRowWrap}>
            <Box className={classes.questionRow}>
              <Box className={classes.InnerColRow}>
                <Box className={classNames(classes.headingColm, classes.wrapClass)}>
                  <Typography variant="subtitle2">
                    {' '}
                    {question?.questionStatement} {question?.required && <RequiredAsterik />}
                  </Typography>
                </Box>
                <Box className={classNames(classes.optionColm, classes.wrapClass)}>
                  <FormControl className={classes.radioOption}>
                    <RadioGroup
                      row
                      className={classes.radioOptionGrid}
                      value={question?.selected ? question?.selected[0]?.id : {}} // Assuming you have a selected property in your question
                      onChange={(event) =>
                        handleOptionSelection(
                          question?.id,
                          event.target.value,
                          questionTypesInWords.RADIO,
                          question?.optionsAttributes,
                        )
                      }
                    >
                      {question?.optionsAttributes?.map((item, index) => {
                        return (
                          <FormControlLabel
                            key={index}
                            value={item?.id}
                            control={<Radio disableRipple />}
                            label={item?.optionText}
                            // disabled={questions?.isQuestionnaireFilled}
                          />
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Box>
              <Box className={classNames(classes.pointColm, classes.wrapClass)}>
                <Typography variant="subtitle2"> {calculatePoints(question?.selected)}</Typography>
              </Box>
            </Box>
          </Box>
        );
      case 8: // SIGNLE SELECT DROPDOWN
        return (
          <Box className={classes.questionRowWrap}>
            <Box className={classes.questionRow}>
              <Box className={classes.InnerColRow}>
                <Box className={classNames(classes.headingColm, classes.wrapClass)}>
                  <Typography variant="subtitle2">
                    {' '}
                    {question?.questionStatement} {question?.required && <RequiredAsterik />}
                  </Typography>
                </Box>
                <Box className={classNames(classes.optionColm, classes.wrapClass)}>
                  <Box className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}>
                    <CustomDropDown
                      name={question?.id}
                      id={question?.id}
                      placeHolder={`Select`}
                      placeHolderClassName={classes?.placeHolderColor}
                      options={transformArrayForOptions(
                        question?.optionsAttributes,
                        'optionText',
                        'id',
                      )}
                      selectedValues={question?.selected[0] || {}}
                      handleChange={(event) =>
                        handleOptionSelection(
                          question?.id,
                          event.target.value,
                          questionTypesInWords.DROPDOWN,
                        )
                      }
                      searchPlaceholder={t('sales.locations.search')}
                      className={classes?.dropdownWrap}
                      searchable
                      bordered
                      // disabled={questions?.isQuestionnaireFilled}
                    />
                  </Box>
                </Box>
              </Box>
              <Box className={classNames(classes.pointColm, classes.wrapClass)}>
                <Typography variant="subtitle2"> {calculatePoints(question?.selected)}</Typography>
              </Box>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  // Memoize the function to check if any selected array is empty
  const isAnySelectedMissing = useMemo(() => {
    return questions?.questions?.some(
      (question) => question?.required === true && question?.selected.length === 0,
    );
  }, [questions?.questions]);

  // Update the disabled state based on whether any selected array is empty
  useEffect(() => {
    setDisabled(isAnySelectedMissing);
  }, [isAnySelectedMissing]);

  return (
    <Box className={classes.questionWrapper}>
      {!questionsLoading && questions?.questions?.length ? (
        <Box className={classes.QuestionInnerBox}>
          <Box className={classes.relvantWrap}>
            <Box className={classNames(classes.questionHeaderMain, 'innerScrollBar')}>
              <Box className={classes.questionHeader}>
                <Box className={classes.largeCol}>
                  <Typography variant="subtitle2"> {t('sales.deals.questionHeading')}</Typography>
                </Box>
                <Box className={classes.pointHeading}>
                  <Typography variant="subtitle2"> {t('sales.deals.points')}</Typography>
                </Box>
              </Box>
              {questions?.questions?.map((question) => renderQuestion(question))}
            </Box>
          </Box>
          <Box className={classes.updateQuestion}>
            <Button
              variant="primary"
              className={classes.button}
              disabled={isBtnDisabled}
              onClick={handleSaveQuestions}
            >
              {t('sales.deals.savdContinue')}
            </Button>
          </Box>
        </Box>
      ) : !questionsLoading && !questions?.questions?.length ? (
        <>
          <RelevantEmptyState />
        </>
      ) : null}
    </Box>
  );
};

RelevantQuestions.propTypes = {
  questions: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  setQuestions: PropTypes.func,
  leadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  questionsLoading: PropTypes.bool,
  // data: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setData: PropTypes.func,
  // className: PropTypes.string,
};

export default RelevantQuestions;
