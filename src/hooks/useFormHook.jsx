import { useCallback, useState } from 'react';
import { removeKey } from 'src/helper/utilityFunctions';

const useFormHook = ({ defaultFormData }) => {
  const [formData, setFormData] = useState(defaultFormData);

  const [errorMessages, setErrorMessages] = useState({});

  const [disabled, setDisabled] = useState(false);

  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      if (value) {
        setErrorMessages((prev) => removeKey([name], prev));
      }
      updateFormHandler(name, value);
    },
    [updateFormHandler],
  );

  const removeError = (name) => {
    setErrorMessages((prev) => removeKey([name], prev));
  };

  return {
    disabled,
    setDisabled,
    errorMessages,
    setErrorMessages,
    formData,
    setFormData,
    handleInputChange,
    updateFormHandler,
    removeError,
  };
};

export default useFormHook;
