import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userRole: null,
  accessList: [],
  accessToken: '',
  user: {
    name: '',
    designation: '',
    imagePath: '',
  },
  currentLanguage: {},
  dashboardActive: '',
  franchiseId: '',
  toggleNotifications: false,
  notificationsCount: 0,
  saasToken: null,
  countryConfiguration: {},
  franchiseInfo: null,
  accessControlPermissions: {},
  franchises: {},
  defaultCountryConfiguration: {},
  timeFormat: '12hrs',
  tenantId: '',
  tenantInfo: {},
  tenantPermissions: {},
  invoiceInfo: {},
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserRole(state, { payload: userRole }) {
      state.userRole = userRole;
    },
    setUserAccessList(state, { payload: accessList }) {
      state.accessList = accessList;
    },
    setAccessControlPermissions(state, { payload: accessControlList }) {
      state.accessControlPermissions = accessControlList;
    },
    setAccessToken(state, { payload: accessToken }) {
      state.accessToken = accessToken;
    },
    setCurrentLanguage(state, { payload: currentLanguage }) {
      state.currentLanguage = currentLanguage;
    },
    setDashboardActive(state, { payload: dashboardActive }) {
      state.dashboardActive = dashboardActive;
    },
    setFranchiseId(state, { payload: franchiseId }) {
      state.franchiseId = franchiseId;
    },
    setFranchiseInfo(state, { payload: franchiseInfo }) {
      state.franchiseInfo = franchiseInfo;
    },
    toggleNotificationReceived(state) {
      state.toggleNotifications = !state.toggleNotifications;
    },
    setNotificationsCountRedux(state, { payload }) {
      state.notificationsCount = payload;
    },
    setSaasToken(state, { payload }) {
      state.saasToken = payload;
    },
    setFranchiseTimeZone(state, { payload }) {
      state.franchiseTimeZone = payload;
    },
    setCountryConfiguration(state, { payload }) {
      state.countryConfiguration = payload;
    },
    setFranchises(state, { payload: franchises }) {
      state.franchises = franchises;
    },
    setDefaultCountryConfiguration(state, { payload }) {
      state.defaultCountryConfiguration = payload;
    },
    setTimeFormat(state, { payload }) {
      state.timeFormat = payload;
    },
    setTenantId(state, { payload: tenantId }) {
      state.tenantId = tenantId;
    },
    setTenantInfo(state, { payload: tenantInfo }) {
      state.tenantInfo = tenantInfo;
    },
    setTenantPermissions(state, { payload: tenantPermissions }) {
      state.tenantPermissions = tenantPermissions;
    },
    setInvoiceInfo(state, { payload: invoiceInfo }) {
      state.invoiceInfo = invoiceInfo;
    },
  },
  extraReducers: {},
});

export const {
  setUserRole,
  setUserAccessList,
  setAccessToken,
  setCurrentLanguage,
  setDashboardActive,
  setFranchiseId,
  setNotificationsCountRedux,
  setSaasToken,
  toggleNotificationReceived,
  setFranchiseInfo,
  setFranchiseTimeZone,
  setCountryConfiguration,
  setAccessControlPermissions,
  setFranchises,
  setDefaultCountryConfiguration,
  setTimeFormat,
  setTenantId,
  setTenantInfo,
  setTenantPermissions,
  setInvoiceInfo,
} = authSlice.actions;

export default authSlice.reducer;
