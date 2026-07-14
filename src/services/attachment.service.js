import { deleteHttpRequest, postHttpRequest } from 'helper/axios';
const REACT_APP_BASE_URL = process.env.REACT_APP_SALES;
import { throwAPIError } from 'src/utils/throwAPIError';

export const uploadAttachment = async (data) => {
  try {
    return await postHttpRequest(`${REACT_APP_BASE_URL}/web/attachments`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteAttachment = async (attachmentId) => {
  try {
    return await deleteHttpRequest(`${REACT_APP_BASE_URL}/web/attachments/${attachmentId}`);
  } catch (e) {
    return throwAPIError(e);
  }
};
