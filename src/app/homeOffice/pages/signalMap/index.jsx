import { Box, Drawer, List, Skeleton, Typography } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import roomImage from 'assets/images/roomImage.png';
import classNames from 'classnames';
import SearchComponent from 'commonComponents/search';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import NoDataFound from 'src/app/components/common/SideBarNoDataFound';
import SideBarListingSkeleton from 'src/app/components/common/skeletonLoader/sidebarListingCardSkeleton';
import { findParentAndSiblingsPolygon, setSideBarData } from 'src/helper/utilityFunctions';
import useCountryCityStateHook from 'src/hooks/useCountryCItyStateHook';
import { getFranchiseMap } from 'src/services/franchise.services';
import { getAllSites } from 'src/services/sites.services';
import { actionItemTypeKeys, paginationOptions } from 'src/utils/constants';
const params = {
  page: paginationOptions.defaultPerPage,
  // perPage: paginationOptions.perPageRows,
  perPage: 10,
  search: '',
};

import { locationDrawerTypes } from 'salesComponents/locations/newLocationsDrawer/location.constant';
import FranchiseListDropDown from 'src/app/components/common/franchiseListDropDown';
import InfiniteScrollCustom from 'src/app/components/common/infiniteScrollCustom';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import CommonSignalMap from 'src/app/components/common/signalMap';
import { toaster } from 'src/utils/toast';

import { useStyles } from './signalMap';
const SignalMap = () => {
  const { t } = useTranslation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState(params);
  const [totalRecords, setTotalRecords] = useState(1);
  // const [query, setQuery] = useState('');
  const [lastElement, setLastElement] = useState(null);
  const { id } = useParams();
  const [currentId, setCurrentId] = useState('');
  // const defaultCenter = { lat: 41.216362, lng: -96.13607 };
  const [refetchFranchises, setRefetchFranchises] = useState(false);
  const [franchiseMapData, setFranchiseMapData] = useState([]);
  const classes = useStyles();
  const [showSearch, setShowSearch] = useState(false);
  const [formData, setFormData] = useState({ states: [], franchises: [] });
  const [focusPoint, setFocusPoint] = useState({});

  const closeSearch = () => {
    setShowSearch(false);
    // setQuery('');
    setQueryParams(params);
    // setItems([]);
    setFormData({ states: [], franchises: [] });
  };

  const fetchSites = async (queryParams) => {
    setLoading(true);
    try {
      let response = await getAllSites(queryParams);

      if (response && response?.statusCode === 200) {
        setSideBarData(response, queryParams, setItems, setQueryParams, setTotalRecords, 'sites');

        setLoading(false);
      }
      setLoading(false);
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
      setLoading(false);
    }
  };

  const getMoreData = () => {
    if (items.length < totalRecords && !loading) {
      setQueryParams((prev) => {
        const qParams = {
          ...prev,
          page: prev.page + 1,
        };

        fetchSites(qParams);
        return qParams;
      });
    }
  };

  const handleSelectedSite = (site) => {
    setFocusPoint(site);
  };

  const applySelectedClass = (id) => {
    return `${classes.listItem} ${currentId == id && classes.activeListItem}`;
  };

  const scrollBody = () => {
    if (items?.length < 1 && queryParams?.search?.length > 0 && !loading) {
      return (
        <NoDataFound
          title={`${t('obx.sites.sidebarListing.noFranchiseFound')}`}
          searchedQuery={queryParams?.search}
          searchedTermText={`${t('obx.sites.sidebarListing.searchedTermNotFound', {
            searchedTerm: queryParams?.search,
          })}`}
        />
      );
    }
    if (
      items?.length < 1 &&
      !loading &&
      (queryParams?.states?.length !== 0 || queryParams?.franchises?.length !== 0)
    ) {
      return (
        <NoDataFound
          showFilteredResult={true}
          title={`${t('obx.sites.sidebarListing.noSiteFound')}`}
          searchedQuery={[]}
          searchedTermText={`${t('obx.sites.sidebarListing.filteredDataFound')}`}
        />
      );
    }
    return (
      <>
        {items?.length > 0 &&
          items?.map((site, index) => {
            // it is being used to determine if it is the last element so it could get its reference and apply infinite scroll methods
            const isLastElement =
              index === items.length - 1 && !loading && items.length <= totalRecords;
            return (
              <ListItem
                key={site?.id}
                alignItems="flex-start"
                sx={{
                  borderBottom: '1px solid #e6e6e7',
                  borderTop: '1px solid #e6e6e7',
                  padding: 0,
                }}
                ref={isLastElement ? setLastElement : null}
                className={classNames(classes.detailSideList, applySelectedClass(site?.id))}
              >
                <ListItemButton
                  onClick={() => handleSelectedSite(site)}
                  className={classes.ListItemButton}
                >
                  <ListItemText
                    className={classes.listText}
                    primary={
                      <Box className={classes.hotelContent}>
                        <Typography variant="h4">{site?.name || t('commonText.nA')}</Typography>
                        <Typography variant="body3" className={classes.ownerName}>
                          {t('obx.sites.table.listing.columns.zone')}:{' '}
                          {site?.zone ? site?.zone : t('commonText.nA')}
                        </Typography>
                        <Typography className={classes.ownerName} variant="body3">
                          {site?.address || t('commonText.nA')}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box className={classes.hotelDetailSections}>
                        <img
                          alt={site?.name}
                          src={site?.images[0]?.url || roomImage}
                          className={classes.roomImage}
                        />
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        {loading && <SideBarListingSkeleton />}
      </>
    );
  };

  const handleSearchClick = () => {
    setFocusPoint({});
  };

  const handleContentClick = async () => {
    setRefetchFranchises(true);
    setShowSearch((prevShowSearch) => !prevShowSearch);
  };

  const updateFormHandler = useCallback(
    (value, name) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value?.target?.value,
      }));
      setItems([]);
      let franchises = value?.target?.value;
      let payload = JSON.parse(JSON.stringify(queryParams));
      if (franchises?.length > 0) {
        let selectedFranchises = franchises?.map((franchise) => franchise?.id);
        payload = { ...payload, franchises: selectedFranchises };
      } else {
        let { franchises: _deletedFranchise, ...rest } = payload;
        payload = rest;
      }
      setQueryParams(payload);
      fetchSites(payload);
    },
    [setFormData],
  );

  /**
   * hook to for address
   */
  const { StateHookComponent } = useCountryCityStateHook({
    formData,
    setFormData,
    errorMessages: {},
    setErrorMessages: () => {},
    multiStates: true,
    multiCities: true,
    stateProps: {
      disabled: loading,
      bordered: true,
      className: classes.dropdownWrap,
      placeHolderClassName: classes.placeHolderColor,
      checkmark: true,
      withTiles: false,
      allOption: true,
    },
  });

  const fetchGeoLocationData = async () => {
    try {
      const data = await getFranchiseMap();
      const { franchiseArea } = findParentAndSiblingsPolygon(null, data, actionItemTypeKeys.site);

      setFranchiseMapData(franchiseArea);
    } catch (e) {
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };

  const handleSearch = (query) => {
    const { value } = query?.target ?? '';
    // let queryParam = { ...queryParams, page: paginationOptions.defaultPerPage };
    let rest;
    if (value) {
      rest = { ...queryParams, search: value };
    } else {
      let { search: _deletedSearch, ...plucked } = queryParams;
      rest = plucked;
    }
    setItems([]);
    setQueryParams(rest);
    fetchSites(rest);
  };

  useEffect(() => {
    setCurrentId(id);
  }, [id]);

  useEffect(() => {
    if (!franchiseMapData?.franchises?.length) {
      fetchGeoLocationData();
    }
    setItems([]);
    let payload = JSON.parse(JSON.stringify(queryParams));

    /** Handle states filter */
    if (formData?.states?.length > 0) {
      let selectedStates = formData?.states?.map((state) => state?.id);
      payload = { ...payload, states: selectedStates };
    } else {
      let { states: _deletedStates, ...rest } = payload;
      payload = rest;
    }
    let { franchises: _deletedFranchise, ...rest } = payload;
    payload = rest;
    setQueryParams(payload);
    setFormData((prev) => ({ ...prev, franchises: [] }));
    setRefetchFranchises(true);
    fetchSites(payload);
  }, [formData?.states]);

  const siteCountLabel =
    !loading &&
    (totalRecords === 0
      ? `0 ${t('sideNavBar.linkText.sites')}`
      : totalRecords === 1
        ? `${totalRecords} ${t('sideNavBar.linkText.sites').slice(0, -1)}`
        : `${totalRecords} ${t('sideNavBar.linkText.sites')}`);

  return (
    <>
      <Box className={classes.mainMapSectionWrapper}>
        <Box className={classes.mainMapSection}>
          {!showSearch && (
            <Box className={classes.leftMapSection} onClick={handleContentClick}>
              <SearchComponent
                className={classes.customSearchColor}
                placeholder={t('commonText.searchPlaceholders.siteFilter.placeHolder')}
                fullWidth
                onClick={handleSearchClick}
              />
            </Box>
          )}
          <Drawer
            anchor={locationDrawerTypes.LEFT}
            open={showSearch}
            onClose={closeSearch}
            className={classes.lefrDrawer}
            transitionDuration={400}
          >
            <Box className={classes.leftMapSectionInternal}>
              {/* <div onClick={closeSearch}>
                <MapIcon className={classes.mapIconClose} />
              </div> */}
              <Box className={classes.borderedSection}>
                <Box className={classes.flexSection}>
                  <SearchComponentWithQuery
                    disabled={false}
                    className={classes.customSearchColor}
                    onSearch={handleSearch}
                    placeHolder={t('commonText.searchPlaceholders.siteFilter.placeHolder')}
                  />
                  <Box className={classes.dropDownSection}>
                    <StateHookComponent bordered={true} />
                    <FranchiseListDropDown
                      disabled={loading}
                      formKey="franchises"
                      bordered={true}
                      updataFormHandler={updateFormHandler}
                      selectedValues={formData?.franchises}
                      dependentValue={formData?.states}
                      refetch={refetchFranchises}
                      setRefetch={setRefetchFranchises}
                      className={classes.franchiseCustomDropdown}
                    />
                  </Box>
                  <Typography variant="subtitle2" className={classes.numberOfRooms}>
                    {siteCountLabel}
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.hotelMainSection}>
                <div
                  style={{ height: 'calc(100vh - 203px)', overflowY: 'auto' }}
                  className="customscroll"
                >
                  <List className={classes.listMapSection}>
                    <InfiniteScrollCustom
                      totalNoOfRecords={totalRecords}
                      noOfRecordsBeingDisplayed={items.length}
                      lastElement={lastElement}
                      body={scrollBody}
                      getMoreData={getMoreData}
                    />
                  </List>
                </div>
              </Box>
            </Box>
          </Drawer>
        </Box>

        {!loading && franchiseMapData?.franchises && (
          <CommonSignalMap
            mapCenter={franchiseMapData?.franchises?.[0]?.franchiseLocation}
            franchiseData={franchiseMapData}
            createOrUpdate={false}
            externalCenter={focusPoint}
          />
        )}
        {loading && <Skeleton variant="rect" width={'100vw'} height={'100vh'} />}
      </Box>
    </>
  );
};

export default SignalMap;
