import queryString from 'query-string';

import {
  deleteHttpRequest,
  getHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from '../helper/axios';
import { throwAPIError } from '../utils/throwAPIError';

export const FRANCHISE_SERVICE = process.env.REACT_APP_FRANCHISE;

// Get Country Configurations List
export async function getCountryConfigurations(params) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${FRANCHISE_SERVICE}/home_office/country_configurations?${query}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Get Country Configurations List
export async function getCountryConfigurationsById(id) {
  try {
    // Correct the URL to include 'id' in the path, not as a query parameter
    return await getHttpRequest(`${FRANCHISE_SERVICE}/home_office/country_configurations/${id}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Update Country Configurations
export async function updateCountryConfigurations(data, id) {
  try {
    return await putHttpRequest(
      `${FRANCHISE_SERVICE}/home_office/country_configurations/${id}`,
      data,
    );
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Creating Country Configurations
export const createCountryConfigurations = async (data) => {
  try {
    return await postHttpRequest(`${FRANCHISE_SERVICE}/home_office/country_configurations`, data);
  } catch (e) {
    throw throwAPIError(e);
  }
};

// Delete Country Configurations List
export async function deleteCountryConfigurations(id) {
  console.log(id);
  try {
    return await deleteHttpRequest(`${FRANCHISE_SERVICE}/home_office/country_configurations/${id}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Get Country Configurations List
export async function getCountries(params) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${FRANCHISE_SERVICE}/home_office/country_configurations/eligible_countries?${query}`,
    );
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Get Country Configurations List
export async function getCountriesConfigurations(params) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${FRANCHISE_SERVICE}/home_office/country_configurations?${query}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Creating Country Configurations
export const updateOrPublishCountryConfiguration = async (data) => {
  try {
    return await postHttpRequest(
      `${FRANCHISE_SERVICE}/home_office/country_configurations/draft_or_publish`,
      data,
    );
  } catch (e) {
    throw throwAPIError(e);
  }
};
