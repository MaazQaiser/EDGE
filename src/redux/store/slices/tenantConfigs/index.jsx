import { createSlice } from '@reduxjs/toolkit';

/**
 * Bump when the shape of the labels payload changes — e.g. adding the `roles`
 * category. Persisted caches written before the change are otherwise kept
 * forever, and the missing category silently renders as an empty string.
 */
export const TENANT_LABELS_VERSION = 3;

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
