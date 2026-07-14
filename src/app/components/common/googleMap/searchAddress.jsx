import {
  Box,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  TextField,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { Search } from 'src/assets/svg';

import RequiredAsterik from '../requiredAsterik';
import { useStyles } from './mapsStyle';

const GoogleMapSearchAddressComponent = ({
  placeHolder = null,
  collapseSearch = false,
  isUsedInMap = false,
  disabled = false,
  isLoaded = false,
  updateMapValue = () => {},
  errorMessages,
  formKey,
  setAddress,
  address,
  setActiveMarker,
  setSelectedLocation = () => {},
  setCenter = () => {},
  onFocus = () => {},
  onBlur = () => {},
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  // const { isLoaded } = useJsApiLoader({
  //   googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  //   libraries,
  // });

  /**
   * get the selected option
   * @param {*} selected
   */
  const handleSelect = async (selected) => {
    try {
      const results = await geocodeByAddress(selected);
      const latLng = await getLatLng(results[0]);

      const location = {
        id: results.length && results[0].place_id,
        name: selected,
        position: { lat: latLng.lat, lng: latLng.lng },
      };
      // Handle the selected location data as needed

      // Update state if needed
      setAddress(selected);
      updateMapValue(formKey, location);
      setCenter(location?.position);
      setSelectedLocation(location);
    } catch (error) {
      console.error('Error selecting place', error);
    }
  };

  /**
   * Use to get the value entered in the input field
   * @param {*} value
   */
  const handleInputChange = (value) => {
    if (value.length > 100) {
      return;
    }
    // If the input value is empty, reset the selectedLocation state
    if (!value.trim()) {
      updateMapValue(formKey, null);
      setSelectedLocation({});
      setActiveMarker(null);
    }
    setAddress(value);
  };
  return (
    <>
      {isLoaded && (
        <>
          <PlacesAutocomplete
            value={address}
            onChange={(value) => handleInputChange(value)}
            onSelect={handleSelect}
            googleCallbackName={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
              <Box className={classes.fieldWrapper}>
                {!isUsedInMap && (
                  <InputLabel htmlFor="address">
                    {`${t('sales.locations.address')}`} <RequiredAsterik />
                  </InputLabel>
                )}
                <Box className={classes.inputWrapper}>
                  <TextField
                    name={formKey}
                    id={formKey}
                    fullWidth
                    {...getInputProps({
                      placeholder: ` ${placeHolder ? placeHolder : t('sales.locations.typeAddress')}`,
                    })}
                    error={!!errorMessages?.[formKey]}
                    onFocus={onFocus}
                    helperText={errorMessages?.[formKey] && t('errors.addressValidationErr')}
                    onBlur={onBlur}
                    disabled={disabled}
                    className={`${isUsedInMap ? `${classes.searchInputHeight} ${classes.customDefaultSearch}` : ''} ${collapseSearch ? classes.customSearchColor : ''}`}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {loading && (
                    <Box className={classes.loaderWrapper}>
                      <Box className={classes.loadingState}> </Box>
                    </Box>
                  )}
                </Box>

                {suggestions?.length ? (
                  <List className={classes.mapListing}>
                    {suggestions?.map((suggestion) => (
                      <ListItem key={suggestion.placeId} {...getSuggestionItemProps(suggestion)}>
                        <ListItemText primary={suggestion.description} />
                      </ListItem>
                    ))}
                  </List>
                ) : null}
                {/* {suggestions && suggestions.length === 0 && (
                  <List className={classes.mapListing}>
                    <ListItem>
                      <ListItemText primary={t('sales.locations.noRecords')} />
                    </ListItem>
                  </List>
                )} */}
              </Box>
            )}
          </PlacesAutocomplete>
        </>
      )}
    </>
  );
};

GoogleMapSearchAddressComponent.propTypes = {
  isUsedInMap: PropTypes.bool,
  disabled: PropTypes.bool,
  updateMapValue: PropTypes.func,
  isLoaded: PropTypes.bool.isRequired,
  errorMessages: PropTypes.object,
  formKey: PropTypes.string,
  setAddress: PropTypes.func,
  address: PropTypes.string,
  setActiveMarker: PropTypes.func,
  collapseSearch: PropTypes.false,
  setSelectedLocation: PropTypes.func,
  setCenter: PropTypes.func,
  placeHolder: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};
export default GoogleMapSearchAddressComponent;
