export const UPDATE_RUNSHEET_STATE = 'UPDATE_STATE';
export const SET_ENTIRE_STATE = 'SET_ENTIRE_STATE';
export const ADDED_HIT = 'added';
export const DELETED_HIT = 'deleted';

export const runSheetInitialState = {
  runsheetName: null,
  startsAt: null,
  startDate: null,
  endsAt: null,
  startEndLocation: null,
  dutyDay: null,
  visitSet: [],
  pathData: [],
  mapPath: [],
  totalHits: 0,
  breakRule: {},
  isBreakPayable: null,
  isVisitsUpdated: false,
};

export const createRunSheetReducer = (state = runSheetInitialState, action) => {
  /* eslint-disable no-case-declarations */
  switch (action.type) {
    case UPDATE_RUNSHEET_STATE:
      const { key, value } = action.payload;
      // Dynamically update the state based on the payload
      return { ...state, [key]: value };
    case SET_ENTIRE_STATE:
      return action.payload;
    default:
      return state;
  }
};
