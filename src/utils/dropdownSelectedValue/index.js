import { locationDropDownNames } from 'src/app/components/salesComponents/locations/sidebarDropdowns/editLocation.constant';

export const updateSelectedOption = (
  responseKey,
  optionsArray,
  responseValue,
  setSelectedOption,
) => {
  const selectedObject = optionsArray.find((item) => item.id === responseValue);
  const updatedObject = selectedObject
    ? {
        id: selectedObject.id,
        label:
          selectedObject.name ||
          selectedObject.title ||
          selectedObject.label ||
          selectedObject.fullName,
        ...(selectedObject?.image && { image: selectedObject.image }),
      }
    : responseKey === locationDropDownNames.SCORE
      ? null
      : { id: null, label: '' };

  setSelectedOption((prevSelectedOption) => ({
    ...prevSelectedOption,
    [responseKey]: updatedObject,
  }));
};

export const verifyDropDownName = (name) => {
  return (
    name === locationDropDownNames.ASSOCIATED_FRANCHISE_ID ||
    name === locationDropDownNames.LEVEL ||
    name === locationDropDownNames.SCORE
  );
};

export const getTaxSelectedOption = (options, id) => {
  return options?.find((item) => item.key === id);
};
