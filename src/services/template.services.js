import queryString from 'query-string';

import {
  deleteHttpRequest,
  getHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from '../helper/axios';
import { throwAPIError } from '../utils/throwAPIError';

export const TEMPLATE_SERVICE = process.env.REACT_APP_TEMPLATE;
export const ROUTING_SERVICE = process.env.REACT_APP_ROUTING;
export const SCHEDULING_SERVICE = process.env.REACT_APP_SCHEDULING;

//Listing
export async function getTemplates(params, config = {}) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    const data = await getHttpRequest(`${TEMPLATE_SERVICE}/templates?${query}`, config);
    return data;
  } catch (e) {
    return throwAPIError(e);
  }
}

//Detail
export async function getTemplate(templateId) {
  try {
    const data = await getHttpRequest(`${TEMPLATE_SERVICE}/templates/${templateId}`);
    return data;
  } catch (e) {
    return throwAPIError(e);
  }
}

//Delete
export async function deleteTemplate(templateId) {
  try {
    if (!templateId) {
      throw new Error('Template id not provided');
    }
    const data = await deleteHttpRequest(`${TEMPLATE_SERVICE}/templates/${templateId}`);
    return data;
  } catch (e) {
    return throwAPIError(e);
  }
}

//Create
export async function createTemplate({ template }) {
  try {
    if (!template) {
      throw new Error('Template not provided');
    }
    const data = await postHttpRequest(`${TEMPLATE_SERVICE}/templates`, { template });
    return data;
  } catch (e) {
    return throwAPIError(e);
  }
}

//Update
export async function updateTemplate({ template, templateId }) {
  try {
    if (!template || !templateId) {
      throw new Error('Template not provided');
    }
    const data = await putHttpRequest(`${TEMPLATE_SERVICE}/templates/${templateId}`, {
      template,
    });

    return data;
  } catch (e) {
    return throwAPIError(e);
  }
}

//Clone
export async function cloneTemplate(templateId, title) {
  try {
    const data = await postHttpRequest(`${TEMPLATE_SERVICE}/templates/${templateId}/clone`, {
      title,
    });
    return data;
  } catch (e) {
    return throwAPIError(e);
  }
}

//template report types
export async function getTemplateReportTypes() {
  try {
    const data = await getHttpRequest(`${TEMPLATE_SERVICE}/templates/template_types`);
    return data;
  } catch (e) {
    return throwAPIError(e);
  }
}

export const replaceTemplate = async (templateId, payload) => {
  try {
    return await putHttpRequest(`${TEMPLATE_SERVICE}/templates/${templateId}/replace`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

/**
 *
 * @param {*} siteId
 * @param {*} templateType
 * @param {*} addParentTemplateNull
 * @returns
 */
export const getTemplateTypesForReports = async (
  siteId,
  templateType,
  addParentTemplateNull = false,
) => {
  try {
    let url = `${TEMPLATE_SERVICE}/templates?siteId=${siteId}&templateableType=${templateType}`;
    if (addParentTemplateNull) {
      url += '&child=none';
    }
    return await getHttpRequest(url);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getUploadGenerationToken = async () => {
  try {
    return await getHttpRequest(`${SCHEDULING_SERVICE}/storage-token/getAssestsToken`);
  } catch (e) {
    return throwAPIError(e);
  }
};
