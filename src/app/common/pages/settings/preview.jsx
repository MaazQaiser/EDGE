/**
 * DEV PREVIEW — the Settings page with permission filtering switched off.
 *
 * A role whose ACL payload comes back empty renders Settings with no tabs at all, so
 * there is otherwise no way to look at a settings screen without a working permission
 * set. This renders the *real* page — same tabs, same components, same styles — with
 * only the ACL filter bypassed, so what you see here is what the permissioned route
 * will show.
 *
 * It is its own module rather than an inline wrapper in the route config because the
 * router's `withSuspense` forwards a `ref` into whatever it wraps: a plain arrow
 * function declared in the route file receives a ref it cannot take, where a lazily
 * imported module component matches the pattern every other route already uses.
 *
 * Delete this file and its route once the ACL payload is sorted.
 */
import React from 'react';

import ObxSettings from './index';

const SettingsPreview = () => <ObxSettings bypassPermissions />;

export default SettingsPreview;
