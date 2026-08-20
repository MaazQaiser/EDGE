import { createSlice } from '@reduxjs/toolkit';

/**
 * Bump when the shape **or the content** of the labels payload changes — adding
 * the `roles` category was a shape change; Filter Go's runsheet becoming a
 * "Route", and its officer becoming an "Installer", are content ones. Persisted
 * caches written before the change are
 * otherwise kept forever, so a returning session keeps the old vocabulary and
 * only a fresh login sees the new word.
 */
export const TENANT_LABELS_VERSION = 5;

const initialState = {
  labels: null,
  /**
   * Which tenant `labels` were fetched for. Labels are persisted, but nothing
   * recorded their origin — so a cache written under one tenant silently
   * survived a switch and the UI kept the previous tenant's vocabulary.
   * Consumers compare this against the active tenant and refetch on a mismatch.
   */
  tenant: null,
  /** Shape version of the cached payload; see TENANT_LABELS_VERSION. */
  version: null,
  loading: false,
  error: null,
};

export const tenantConfigsSlice = createSlice({
  name: 'tenantConfigs',
  initialState,
  reducers: {
    setTenantLabels(state, { payload: tenantLabels }) {
      state.labels = tenantLabels.labels;
      state.tenant = tenantLabels.tenant ?? null;
      state.version = TENANT_LABELS_VERSION;
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
      state.tenant = null;
      state.version = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setTenantLabels, setTenantLabelsLoading, setTenantLabelsError, clearTenantConfigs } =
  tenantConfigsSlice.actions;

export default tenantConfigsSlice.reducer;
