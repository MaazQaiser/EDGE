const DEFAULT_DELAY_MS = 80;

export function mockResponse(data, message = 'Success', statusCode = 200, pagination = null) {
  const response = { statusCode, message, data };
  if (pagination) {
    response.pagination = pagination;
  }
  return response;
}

export function mockSuccess(message = 'The record has been saved successfully!', data = {}) {
  return mockResponse(data, message, 200);
}

export function mockMutationSuccess(
  message = 'The record has been saved successfully!',
  data = null,
) {
  const response = { statusCode: 200, message };
  if (data !== null) {
    response.data = data;
  }
  return response;
}

export function delay(ms = DEFAULT_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockAsync(response, ms = DEFAULT_DELAY_MS) {
  await delay(ms);
  return response;
}

export function mockPaginate(list = [], queryParams = {}) {
  const page = Number(queryParams.page || queryParams.currentPage || 1);
  const perPage = Number(queryParams.perPage || queryParams.pageSize || 10);
  const totalCount = list.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const start = (page - 1) * perPage;
  const items = list.slice(start, start + perPage);

  return {
    items,
    pagination: {
      currentPage: page,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      totalPages,
      totalCount,
    },
  };
}

export function extractPath(url = '') {
  if (!url) return '';
  try {
    if (url.startsWith('http')) {
      const parsed = new URL(url);
      return `${parsed.pathname}${parsed.search}`;
    }
    const match = String(url).match(/(\/[^?#]*)(\?[^#]*)?/);
    return match ? `${match[1]}${match[2] || ''}` : String(url);
  } catch {
    return String(url);
  }
}

export function extractPathParams(path, pattern) {
  const pathOnly = path.split('?')[0];
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathOnly.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const part = patternParts[i];
    if (part.startsWith(':')) {
      params[part.slice(1)] = pathParts[i];
    } else if (part !== pathParts[i]) {
      return null;
    }
  }

  return params;
}

export function getQueryParams(path = '') {
  const query = path.includes('?') ? path.split('?')[1] : '';
  return Object.fromEntries(new URLSearchParams(query));
}
