import { assignToOptions } from 'src/app/components/salesComponents/locations/newLocationsDrawer/location.constant';

/**
 * use to format assign to object for create Location API
 * @param {*} assignTo
 * @returns
 */
export const updateAssignToPayload = (assignTo, formData) => {
  let updatedAssignTo = { intent: assignTo };

  switch (assignTo) {
    case assignToOptions[0].value:
      updatedAssignTo.userId = 0;
      updatedAssignTo.supervisorId = 0;
      break;
    case assignToOptions[1].value:
      updatedAssignTo.userId = formData?.salesPerson.id;
      updatedAssignTo.supervisorId = 0;
      break;
    case assignToOptions[2].value:
      updatedAssignTo.userId = formData?.intern.id;
      updatedAssignTo.supervisorId = formData?.salesPerson.id;
      break;
    default:
      // Handle the default case if necessary
      break;
  }

  return updatedAssignTo;
};
