import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  labels: null,
  loading: false,
  error: null,
};

export const tenantConfigsSlice = createSlice({
  name: 'tenantConfigs',
  initialState,
  reducers: {
    setTenantLabels(state, { payload: tenantLabels }) {
      state.labels = tenantLabels.labels;
      state.loading = false;
      state.error = null;
    },
    setTenantLabelsLoading(state, { payload: loading }) {
      state.loading = loading;
    },
    setTenantLabelsError(state, { payload: error }) {
      state.error = error;
      state.loading = false;
    },
    clearTenantConfigs(state) {
      state.labels = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setTenantLabels, setTenantLabelsLoading, setTenantLabelsError, clearTenantConfigs } =
  tenantConfigsSlice.actions;

export default tenantConfigsSlice.reducer;
