export const throwAPIError = (error) => {
  error = error?.response?.data ? error?.response?.data : error;
  throw error;
};
