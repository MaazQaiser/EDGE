import 'draft-js/dist/Draft.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import DOMPurify from 'dompurify';
import { ContentState, convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { useTranslation } from 'react-i18next';

import { useStyles } from './richTextStyles';

const defaultOptions = {
  options: ['inline', 'list', 'blockType'],
  inline: {
    inDropdown: false,
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
    options: ['bold', 'italic'],
  },
  list: {
    inDropdown: false,
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
    options: ['unordered', 'ordered'],
  },
  blockType: {
    inDropdown: false,
    options: ['H1', 'H2'],
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
  },
  // colorPicker: {
  //   // icon: color,
  //   className: undefined,
  //   component: undefined,
  //   popupClassName: undefined,
  //   colors: [
  //     'rgb(97,189,109)',
  //     'rgb(26,188,156)',
  //     'rgb(84,172,210)',
  //     'rgb(44,130,201)',
  //     'rgb(147,101,184)',
  //     'rgb(71,85,119)',
  //     'rgb(204,204,204)',
  //     'rgb(65,168,95)',
  //     'rgb(0,168,133)',
  //     'rgb(61,142,185)',
  //     'rgb(41,105,176)',
  //     'rgb(85,57,130)',
  //     'rgb(40,50,78)',
  //     'rgb(0,0,0)',
  //     'rgb(247,218,100)',
  //     'rgb(251,160,38)',
  //     'rgb(235,107,86)',
  //     'rgb(226,80,65)',
  //     'rgb(163,143,132)',
  //     'rgb(239,239,239)',
  //     'rgb(255,255,255)',
  //     'rgb(250,197,28)',
  //     'rgb(243,121,52)',
  //     'rgb(209,72,65)',
  //     'rgb(184,49,47)',
  //     'rgb(124,112,107)',
  //     'rgb(209,213,216)',
  //   ],
  // },
};

export const convertDataToHtml = (data) => {
  const contentState = data?.getCurrentContent();

  const plainText = contentState.getPlainText('');

  return plainText
    ? DOMPurify.sanitize(draftToHtml(convertToRaw(data?.getCurrentContent())))
    : null;
};

export const getPlainTextOfDraft = (data) => {
  const contentState = data?.getCurrentContent();

  return contentState.getPlainText('');
};

export const convertToDraft = (val) => {
  const html = val || '';
  const cleanHTML = DOMPurify.sanitize(html);
  const contentBlock = htmlToDraft(cleanHTML);

  if (contentBlock) {
    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
    return EditorState.createWithContent(contentState);
  }
  return EditorState.createEmpty();
};

const RichTextEditor = ({
  handleChange,
  placeholder,
  className,
  error,
  readOnly,
  value,
  defaultValue,
  textLimit,
  name,
  customClassEditor,
  showTotalCountInsteadOfRemaining,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [checkText, setChecktext] = useState(false);

  const holder = placeholder ? placeholder : t('form.input.textField.editor.placeHolder');

  useEffect(() => {
    if (defaultValue) {
      updateOuterVal(convertToDraft(defaultValue));
    }
  }, []);

  const handleEditorChange = (newEditorState) => {
    const contentState = newEditorState?.getCurrentContent();
    const text = contentState.getPlainText('');

    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        setChecktext(true);
      }
    }

    if (textLimit > 0) {
      if (text.length >= textLimit && newEditorState.getLastChangeType() === 'split-block') {
        return;
      }

      if (
        text.length >= textLimit &&
        newEditorState.getLastChangeType() === 'backspace-character'
      ) {
        updateOuterVal(newEditorState);

        return;
      }

      if (text.length >= textLimit) {
        const truncatedContentStateOld = truncateContent(contentState, textLimit);

        const latestData = EditorState.push(
          newEditorState,
          truncatedContentStateOld,
          'insert-characters',
        );

        updateOuterVal(EditorState.moveFocusToEnd(latestData));
        return;
      }
    }

    updateOuterVal(newEditorState);
  };

  const updateOuterVal = (val) => {
    const event = {
      target: {
        value: val,
        name,
      },
    };

    handleChange(event);
  };

  const truncateContent = (contentState, limit) => {
    // Get plain text from content state
    const text = contentState.getPlainText('');

    // Truncate text if it exceeds the limit
    if (text.length > limit) {
      // Calculate how many characters to truncate
      const diff = text.length - limit;

      // Get the first 'limit' characters
      const truncatedText = text.substring(0, text.length - diff);

      // Create a new ContentState with truncated text
      const truncatedContentState = ContentState.createFromText(truncatedText);

      return truncatedContentState;
    }

    // Return original content state if within limit
    return contentState;
  };

  const currentContent = value?.getCurrentContent();
  const currentText = currentContent?.getPlainText('');
  const remainingCharacters = textLimit - currentText.length;

  let editorClass = classNames(classes.editorClass, customClassEditor && customClassEditor);

  return (
    <Box
      className={
        !readOnly
          ? !error
            ? `${classes.richTextEditor} ${className}`
            : `${classes.richTextEditor} ${classes.richTextEditorError} ${className}`
          : ``
      }
    >
      <Box
        className={
          checkText
            ? classNames(classes.removePlaceholder, classes.richTextBox)
            : classes.richTextBox
        }
      >
        <Editor
          editorState={value}
          onEditorStateChange={handleEditorChange}
          wrapperClassName={classes.wrapperClass}
          editorClassName={editorClass}
          toolbarClassName={classes.toolbarClass}
          toolbar={defaultOptions}
          placeholder={holder}
          readOnly={readOnly}
        />
      </Box>

      {textLimit > 0 && (
        <Box className={classes.limitText}>
          <Typography variant="body2">
            {currentText.length} /{' '}
            {showTotalCountInsteadOfRemaining ? textLimit : remainingCharacters}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

RichTextEditor.propTypes = {
  className: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  error: PropTypes.bool,
  name: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  defaultValue: PropTypes.string,
  customClassEditor: PropTypes.string,
  textLimit: PropTypes.number,
  showTotalCountInsteadOfRemaining: PropTypes.bool,
};

RichTextEditor.defaultProps = {
  className: '',
  placeholder: '',
  value: '',
  error: false,
  readOnly: false,
  defaultValue: '',
  textLimit: 0,
  customClassEditor: '',
  showTotalCountInsteadOfRemaining: false,
};

export default RichTextEditor;
