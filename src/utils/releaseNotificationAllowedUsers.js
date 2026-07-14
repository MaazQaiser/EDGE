/**
 * User ids allowed to access Release Notifications (sidebar + page actions).
 * Mirrors `REACT_APP_ALLOWED_USER_IDS` env (comma-separated), default `902`.
 */
export function getReleaseNotificationAllowedUserIds() {
  return (process.env.REACT_APP_ALLOWED_USER_IDS?.split(',') || [])
    .map((id) => String(id).trim())
    .filter(Boolean);
}

export function isUserAllowedForReleaseNotifications(userId) {
  const id = userId?.toString();
  if (!id) return false;
  return getReleaseNotificationAllowedUserIds().includes(id);
}
