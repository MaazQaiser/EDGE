import { configureStore } from '@reduxjs/toolkit';

import reducer from './reducers/auth';

const store = configureStore({
  reducer: {
    reducers: reducer,
  },
});
export default store;
