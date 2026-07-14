import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  info: null,
  currentLanguage: null,
  countries: [],
};

export const authSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setInfoData(state, { payload: userData }) {
      state.info = userData;
    },
    setCountryData(state, { payload: countryData }) {
      state.countries = countryData;
    },
  },
});

export const { setInfoData } = authSlice.actions;

export const { setCountryData } = authSlice.actions;
export default authSlice.reducer;
