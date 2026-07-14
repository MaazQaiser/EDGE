import queryString from 'query-string';
import { getHttpRequest } from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

const GOOGLE_PLACE_URL = 'https://places.googleapis.com/v1';
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

/**
 *
 * @param {object} payload {lat: 19.2000, lng: 20.21033}
 * It will recieve lat and lng for a location and
 * return location details
 * @returns
 */
export const getLocationAddressFromGoogle = async (payload) => {
  try {
    var geocoder = new window.google.maps.Geocoder();
    var OK = window.google.maps.GeocoderStatus.OK;

    return await new Promise((resolve, reject) => {
      geocoder.geocode({ location: payload }, (results, status) => {
        if (status !== OK) {
          reject(status);
        }
        resolve(results);
      });
    });
  } catch (e) {
    return throwAPIError(e);
  }
};

/**
 *
 * @param {string} placeId - The Google Maps placeId for a location
 * @param {string} fields - The Google Maps place object fields name array that you want in return
 * It will receive a placeId and return detailed place information using Google Places REST API
 * @returns {Promise<object>} - Place details from Google Maps
 */
export const getPlaceInformationFromGoogle = async (placeId, fields) => {
  try {
    const queryParams = {
      fields: fields,
      key: GOOGLE_MAPS_API_KEY,
    };
    const url = `${GOOGLE_PLACE_URL}/places/${placeId}?${queryString.stringify(queryParams)}`;
    const data = await getHttpRequest(url, { skipAuth: true });
    return data;
  } catch (e) {
    return throwAPIError(e);
  }
};

/**
 *
 * @param {string} photo - The Google Maps place photo object.
 * It will receive a photo and return photo name and photoUrl
 * @returns {Promise<object>} - Photo details from Google Maps
 */
export const getPlaceImage = async (photo) => {
  try {
    if (!photo) return null;
    const queryParams = {
      maxWidthPx: photo.widthPx,
      maxHeightPx: photo.heightPx,
      skipHttpRedirect: true,
      key: GOOGLE_MAPS_API_KEY,
    };
    const url = `${GOOGLE_PLACE_URL}/${photo.name}/media?${queryString.stringify(queryParams)}`;
    const data = await getHttpRequest(url, { skipAuth: true });
    return data;
  } catch (e) {
    return throwAPIError(e);
  }
};
