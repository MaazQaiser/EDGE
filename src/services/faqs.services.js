import queryString from 'query-string';
import { getHttpRequest, postHttpRequest, putHttpRequest } from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

const faqsServiceEndpoint = process.env.REACT_APP_USER;
export const reportAProblem = async (payload, config = {}) => {
  try {
    return await postHttpRequest(`${faqsServiceEndpoint}/support_tickets`, payload, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getListOfProblems = async (queryParams, config = {}) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${faqsServiceEndpoint}/support_tickets?${query}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDetailOfProblems = async (id, config = {}) => {
  try {
    return await getHttpRequest(`${faqsServiceEndpoint}/support_tickets/${id}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getStatusEnum = async () => {
  try {
    return await getHttpRequest(`${faqsServiceEndpoint}/support_tickets/statuses`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const sendEmail = async (problemId, payload, config = {}) => {
  try {
    return await postHttpRequest(
      `${faqsServiceEndpoint}/support_tickets/${problemId}/send_email`,
      payload,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const changeProblemStatus = async (problemId, payload, config = {}) => {
  try {
    return await putHttpRequest(
      `${faqsServiceEndpoint}/support_tickets/${problemId}`,
      payload,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};
