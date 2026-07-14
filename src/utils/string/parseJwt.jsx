export default function parseJwt(token) {
  if (!token) {
    return null;
  }

  const base64Url = token.split('.')[1];
  if (!base64Url || typeof base64Url !== 'string') {
    return null;
  }

  const base64Str = base64Url.replace(/-/g, '+').replace(/_/g, '/');

  const jsonPayload = decodeURIComponent(
    atob(base64Str)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );

  return JSON.parse(jsonPayload);
}
