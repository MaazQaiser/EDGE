import { createSlice } from '@reduxjs/toolkit';
import {
  emptyStateDedicated,
  emptyStatePatrol,
  emptyStatePatrolVisit,
  FormKeys,
  getDedicatedCalculations,
  getDefaultServicesData,
  getPatrolCalculations,
  serviceTypes,
  visitTypes,
} from 'salesComponents/contractCreation/addServices/helper';

const initialState = {
  startDate: '',
  endDate: '',
  timezone: null,
  services: [],
  errorMessages: {},
};

export const contractServicesSlice = createSlice({
  name: 'contractServices',
  initialState,
  reducers: {
    updateServiceFormData(state, { payload: { name, value } }) {
      state[name] = value;
      if ([FormKeys.START_DATE, FormKeys.END_DATE].includes(name)) {
        state.services = state.services.map((service) => ({
          ...service,
          [FormKeys.VISITS]: service[FormKeys.VISITS].map((visit) => ({
            ...visit,
            [FormKeys.DUTY_DAYS]: [],
            [FormKeys.START_TIME]: null,
            [FormKeys.END_TIME]: null,
          })),
        }));

        state['errorMessages'] = {};
      }
    },
    updateServiceCardData(state, { payload: { index, name, value, baseRates } }) {
      const updatedServices = state.services;

      if (name === FormKeys.TYPE) {
        updatedServices[index] =
          value === serviceTypes.DEDICATED
            ? {
                ...emptyStateDedicated,
                [FormKeys.NAME]: updatedServices[index][FormKeys.NAME],
                [FormKeys.CALCULATIONS]: {
                  [FormKeys.ESTIMATED_PROFIT]: 0,
                  [FormKeys.TOTAL]: 0,
                  [FormKeys.HOURS]: 0,
                },
              }
            : {
                ...emptyStatePatrol,
                [FormKeys.NAME]: updatedServices[index][FormKeys.NAME],
                [FormKeys.CALCULATIONS]: {
                  [FormKeys.ESTIMATED_PROFIT]: 0,
                  [FormKeys.TOTAL]: 0,
                  [FormKeys.TOTAL_DUTY_DAYS]: {},
                  [FormKeys.TOTAL_VISITS]: 0,
                },
              };
      } else {
        updatedServices[index][name] = value;
        updatedServices[index][FormKeys.CALCULATIONS] =
          updatedServices[index][FormKeys.TYPE] === serviceTypes.DEDICATED
            ? getDedicatedCalculations({
                service: { ...updatedServices[index] },
                baseRates: { ...baseRates },
              })
            : getPatrolCalculations({
                service: { ...updatedServices[index] },
                baseRates: { ...baseRates },
              });
      }
    },
    addNewService(state) {
      state.services.push(getDefaultServicesData(state?.services?.length));
    },
    deleteService(state, { payload: { deleteServiceIndex } }) {
      const services = state.services;
      state.services = services.filter((_, index) => index !== deleteServiceIndex);
    },
    updateServiceVisit(state, { payload: { name, value, visitIndex, index, baseRates } }) {
      const isTimeField = [FormKeys.START_TIME, FormKeys.END_TIME].includes(name);

      const isValidDate = !isNaN(value?.['$d']);

      const services = state?.services;
      if (!isTimeField) state.services[index][FormKeys.VISITS][visitIndex][name] = value;
      else state.services[index][FormKeys.VISITS][visitIndex][name] = isValidDate ? value : null;

      if (value === visitTypes.FIXED)
        state.services[index][FormKeys.VISITS][visitIndex][FormKeys.NUMBER_OF_VISITS] = 1;

      /**
       * set the value null for visit type random
       */
      if (value === visitTypes.RANDOM)
        state.services[index][FormKeys.VISITS][visitIndex][FormKeys.NUMBER_OF_VISITS] = '';

      state.services[index][FormKeys.CALCULATIONS] =
        services[index][FormKeys.TYPE] === serviceTypes.DEDICATED
          ? getDedicatedCalculations({
              service: services[index],
              baseRates: { ...baseRates },
            })
          : getPatrolCalculations({
              service: services[index],
              baseRates: { ...baseRates },
            });
    },
    addNewServiceVisit(state, { payload: { index } }) {
      state.services[index][FormKeys.VISITS].push(emptyStatePatrolVisit);
    },
    deleteServiceVisit(state, { payload: { index, deleteVisitIndex, baseRates } }) {
      const service = state.services[index];
      service[FormKeys.VISITS] = service[FormKeys.VISITS].filter(
        (_, index) => index !== deleteVisitIndex,
      );

      /**
       * recalculate the service price
       */
      const services = state?.services;
      state.services[index][FormKeys.CALCULATIONS] = getPatrolCalculations({
        service: services[index],
        baseRates: { ...baseRates },
      });
    },
    setContractErrorMessages(state, { payload }) {
      state.errorMessages = payload;
    },
    removeContractErrorKey(state, { payload }) {
      const { [payload]: _, ...rest } = state.errorMessages;
      state.errorMessages = rest;
    },
    // this will remove all the errors from index which service is deleted
    // it will reset the object indexes as well
    deleteErrorMessageAtIndex: (state, { payload: indexToDelete }) => {
      const updatedErrorMessages = {};
      for (const key in state.errorMessages) {
        if (Object.prototype.hasOwnProperty.call(state.errorMessages, key)) {
          const [prefix, currentIndex, ...rest] = key.split(',');
          const currentServiceIndex = parseInt(currentIndex, 10);
          if (currentServiceIndex !== indexToDelete) {
            updatedErrorMessages[
              `${prefix},${currentServiceIndex > indexToDelete ? currentServiceIndex - 1 : currentIndex},${rest.join(',')}`
            ] = state.errorMessages[key];
          }
        }
      }
      state.errorMessages = updatedErrorMessages;
    },
  },
});

export const {
  updateServiceCardData,
  addNewService,
  updateServiceFormData,
  updateServiceVisit,
  addNewServiceVisit,
  deleteServiceVisit,
  setContractErrorMessages,
  removeContractErrorKey,
  deleteService,
  deleteErrorMessageAtIndex,
} = contractServicesSlice.actions;

export default contractServicesSlice.reducer;
