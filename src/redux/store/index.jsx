import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';

import { USER_LOGOUT } from './actionTypes';
import authReducer from './slices/auth';
import contractServiceReducer from './slices/contractServices';
import tenantConfigsReducer from './slices/tenantConfigs';
import userReducer from './slices/user';

const persistConfig = {
  key: 'root',
  stateReconciler: autoMergeLevel2,
  blacklist: ['contractServices'],
  storage,
};

const appReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  contractServices: contractServiceReducer,
  tenantConfigs: tenantConfigsReducer,
});

const rootReducer = (state, action) => {
  if (action.type === USER_LOGOUT) {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
