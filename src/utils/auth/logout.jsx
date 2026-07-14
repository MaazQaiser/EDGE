import storage from 'redux-persist/lib/storage';
import { clearCookies } from 'src/helper/utilityFunctions';

import { logoutUser } from '../../redux/store/actionCreator';
import store from '../../redux/store/index';

export default function LogoutRedux() {
  // Remove all keys defined in persistConfig(s) of `redux-persist` (to make sure `store` does not get rehydrated after page refresh)
  clearCookies();

  storage.removeItem('persist:root');

  localStorage.clear();
  // Reset Redux store to its initial state
  store.dispatch(logoutUser());
  // Redirect the user to login screen before reloading (so that no location state is persisted on page reload)
  // history.push(LOGIN);
  window.location.reload();
}
