import { throwAPIError } from 'src/utils/throwAPIError';

import {
  deleteHttpRequest,
  getHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from '../helper/axios';

export const TEMPLATE_SERVICE = process.env.REACT_APP_TEMPLATE;

// question bank listing
export async function getQuestionsTemplates(params, industryVerticalId) {
  try {
    const data = await getHttpRequest(
      `${TEMPLATE_SERVICE}/industryVerticals/${industryVerticalId}/questions`,
      { params },
    );
    return data;
  } catch (e) {
    return throwAPIError(e);
  }
}

//question Detail
export async function getQuestion(questionId) {
  try {
    const data = await getHttpRequest(`${TEMPLATE_SERVICE}/questions/${questionId}`);
    return data;
  } catch (e) {
    return throwAPIError(e);
  }
}

//Delete Question
export async function deleteQuestion(questionId) {
  try {
    const data = await deleteHttpRequest(`${TEMPLATE_SERVICE}/questions/${questionId}`);
    return data;
  } catch (e) {
    return throwAPIError(e);
  }
}

//Create Quetion
export async function createQuestion({ question }) {
  try {
    const data = await postHttpRequest(`${TEMPLATE_SERVICE}/questions`, { question });
    return data;
  } catch (e) {
    return throwAPIError(e);
  }
}

//Update Question
export async function updateQuestion({ question, questionId }) {
  try {
    const data = await putHttpRequest(`${TEMPLATE_SERVICE}/questions/${questionId}`, {
      question,
    });

    return data;
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function updateQuestionsOrder(body, config) {
  try {
    return await putHttpRequest(`${TEMPLATE_SERVICE}/questions/reordered`, body, config);
  } catch (e) {
    return throwAPIError(e);
  }
}
