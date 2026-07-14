/**
 * @description
 * Create and export our own `history` object to use with `react-router` so that we can use this browser history in non-React files as well
 * Converted to ESM import so it works correctly under Vite (no `require` at runtime).
 */
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();
export default history;
