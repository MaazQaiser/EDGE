const transformArrayForOptions = (arr, label, value, description, image) => {
  return arr?.map((a) => {
    let objData = {
      ...a,
      value: a[value]?.toString() || '',
      label: a[label]?.toString() || '',
    };

    if (a[description]) {
      objData['description'] = a[description] || '';
    }

    if (a[image]) {
      objData['image'] = a[image] || '';
    }

    return objData;
  });
};

export default transformArrayForOptions;
