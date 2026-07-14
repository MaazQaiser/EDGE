import { useEffect, useRef } from 'react';

import { mockAsync } from 'src/helper/mockData/mockHelpers';
import { resolveMockResponse } from 'src/helper/mockData/urlRouter';

let abortController = new AbortController();

async function handleMockRequest(method, url, data = null, config = {}) {
  if (config?.signal?.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'));
  }

  const response = resolveMockResponse(method, url, data);
  return mockAsync(response);
}

export async function getHttpRequest(url, config = {}) {
  return handleMockRequest('GET', url, null, config);
}

export async function postHttpRequest(url, data, config = {}) {
  return handleMockRequest('POST', url, data, config);
}

export async function putHttpRequest(url, data, config = {}) {
  return handleMockRequest('PUT', url, data, config);
}

export async function patchHttpRequest(url, data, config = {}) {
  return handleMockRequest('PATCH', url, data, config);
}

export async function deleteHttpRequest(url, config = {}) {
  return handleMockRequest('DELETE', url, null, config);
}

export function cancelOngoingHttpRequest() {
  abortController.abort();
  abortController = new AbortController();
}

export const useApiControllers = () => {
  const previousApiCallController = useRef(null);

  useEffect(() => {
    return () => {
      if (previousApiCallController.current) {
        previousApiCallController.current.abort();
      }
    };
  }, []);

  const abortPreviousApiCall = () => {
    if (previousApiCallController.current) {
      previousApiCallController.current.abort();
    }
  };

  const getNewApiController = () => {
    abortPreviousApiCall();

    const newApiController = new AbortController();
    previousApiCallController.current = newApiController;

    return newApiController;
  };

  return { getNewApiController };
};
