function base64UrlEncode(value) {
  const json = typeof value === 'string' ? value : JSON.stringify(value);
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function generateMockJwt(role = 'franchise_owner') {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    Role: role,
    Username: 'demo-user',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
    iat: Math.floor(Date.now() / 1000),
  };

  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.mock-signature`;
}
