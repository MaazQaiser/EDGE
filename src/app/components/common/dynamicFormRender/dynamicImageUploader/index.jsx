import { Box } from '@mui/material';
import classNames from 'classnames';
import FileUpload from 'commonComponents/fileUpload';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { generateURLFromObject } from 'src/helper/utilityFunctions';
import useFormHook from 'src/hooks/useFormHook';

const DynamicImageUploader = (props) => {
  const { formData, updateFormHandler } = useFormHook({
    defaultFormData: {
      [props?.nameField]: [],
    },
  });
  const saasToken = useSelector((state) => state.auth.saasToken);

  const [attachmentFiles, setAttachmentFiles] = useState([]);

  useEffect(() => {
    const data = {
      target: {
        value: attachmentFiles,
        name: props?.id,
      },
    };
    props?.removeError(props?.nameField);
    props?.handleChange(data);
  }, [attachmentFiles]);

  useEffect(() => {
    if (props?.answers?.length) {
      const updatedAnswers = props?.answers?.map((a) => {
        return {
          ...a,
          name: a?.filename,
          type: a?.contentType,
          size: a?.byteSize,
          url: generateURLFromObject(a, saasToken),
          alreadyUploaded: true,
        };
      });

      setAttachmentFiles(updatedAnswers);
    }
  }, [props?.answers]);

  return (
    <Box
      className={classNames(
        props?.classes.previewTemplateField,
        props?.fieldDisable && props?.classes.disabledEvent,
      )}
    >
      <FileUpload
        formData={formData}
        formImageKey={props?.nameField}
        updateFormHandler={updateFormHandler}
        errorMessages={props?.errorMessages}
        setErrorMessages={props?.setErrorMessages}
        selectedFiles={attachmentFiles}
        setFile={setAttachmentFiles}
        supportedTypes={props?.supportedTypes}
        supportedTypesText={props?.supportedTypesText}
        allowedExtensions={props?.allowedExtensions}
        disableFileUploading={false}
        maxAllowedFiles={15}
        maxFileSizeAllowed={5}
      />
    </Box>
  );
};

DynamicImageUploader.propTypes = {
  handleChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  removeError: PropTypes.func,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
  classes: PropTypes.object,
  fieldDisable: PropTypes.bool,
  nameField: PropTypes.string,
  id: PropTypes.number,
  answers: PropTypes.string,
  type: PropTypes.string,
  supportedTypes: PropTypes.array,
  allowedExtensions: PropTypes.array,
  supportedTypesText: PropTypes.string,
};

export default DynamicImageUploader;
