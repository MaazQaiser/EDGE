import { Tooltip, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import classNames from 'classnames';
import SearchComponent from 'commonComponents/searchWithQuery';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getSites } from 'services/sites.services';
import NoDataFound from 'src/app/components/common/SideBarNoDataFound';
import SideBarListingSkeleton from 'src/app/components/common/skeletonLoader/sidebarListingCardSkeleton';
import ChipComponent from 'src/app/homeOffice/pages/franchise/detail/components/chip';
import { siteStatusEnum } from 'src/app/homeOffice/pages/franchise/utils/enums';
import { HO_SITES_DETAIL_ROUTE, OBX_SITES_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { setSideBarData } from 'src/helper/utilityFunctions';
import {
  franchiseIdUrlQueryParam,
  paginationOptions,
  rolesEnumWithName,
  timeZoneKeyUrlQueryParam,
} from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { truncateString } from 'src/utils/string/truncate';

import InfiniteScrollCustom from '../../../../../../components/common/infiniteScrollCustom/index';
import { useStyles } from './siteSideBarStyles';

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
};
const SitesSidebarListings = ({ className }) => {
  const { t } = useTranslation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState(params);
  const [totalRecords, setTotalRecords] = useState(1);
  const [query, setQuery] = useState('');
  const [lastElement, setLastElement] = useState(null);
  const classes = useStyles();
  const { id } = useParams();

  const urlParams = new URLSearchParams(location.search);
  const timezoneKeyFromUrl = urlParams.get(timeZoneKeyUrlQueryParam);
  const franchiseId = urlParams.get(franchiseIdUrlQueryParam);

  const [currentId, setCurrentId] = useState('');

  // Get User info from redux
  const userRole = useSelector((state) => state.auth.userRole);
  const reduxFranchiseId = useSelector((state) => state.auth.franchiseId);

  const fetchSites = async (queryP) => {
    setLoading(true);
    try {
      const response = await getSites(queryP);

      if (response && response?.statusCode === 200) {
        setSideBarData(response, queryP, setItems, setQueryParams, setTotalRecords, 'sites');

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
    /*
     * if the logged-in user is HO and page is site detail
     * then goto HO site detail page
     * otherwise goto obx site detail page
     * */
    if (userRole?.slug === rolesEnumWithName.home_officer.slug) {
      const sitePath = HO_SITES_DETAIL_ROUTE.replace(':id', site.id);
      const queryParams = new URLSearchParams({
        [franchiseIdUrlQueryParam]: reduxFranchiseId || franchiseId,
        [timeZoneKeyUrlQueryParam]: timezoneKeyFromUrl,
      }).toString();
      history.push(`${sitePath}?${queryParams}`);
      return;
    }
    history.push(`${OBX_SITES_DETAIL}/${site?.id}`);
  };

  const applySelectedClass = (id) => {
    return `${classes.listItem} ${currentId == id && classes.activeListItem}`;
  };

  const scrollBody = () => {
    if (items.length < 1 && queryParams?.search.length > 0) {
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
    return (
      <>
        {items?.map((site, index) => {
          // it is being used to determine if it is the last element so it could get its reference and apply infinite scroll methods
          const isLastElement =
            index === items.length - 1 && !loading && items.length <= totalRecords;
          return (
            <ListItem
              key={site?.id}
              alignItems="flex-start"
              sx={{ borderBottom: '1px solid #e6e6e7', padding: 0 }}
              ref={isLastElement ? setLastElement : null}
              className={classNames(classes.detailSideList, applySelectedClass(site?.id))}
            >
              <ListItemButton
                onClick={(_e) => handleSelectedSite(site)}
                className={classes.ListItemButton}
              >
                <ListItemText
                  className={classes.listText}
                  primary={
                    <>
                      <Typography variant="subtitle1" className={classes.ownerName}>
                        {/*{capitalizeFirstLetter(site?.name)}*/}
                        {site?.name?.length > 50 ? (
                          <>
                            <Tooltip title={site?.name} arrow>
                              {truncateString(capitalizeFirstLetter(site?.name), 50) || NA}
                            </Tooltip>
                          </>
                        ) : (
                          <>{capitalizeFirstLetter(site?.name) || NA}</>
                        )}
                      </Typography>
                    </>
                  }
                  secondary={
                    <>
                      <Typography variant="body3" className={classes.ownerName}>
                        {site?.owner?.name}
                      </Typography>
                      <Typography variant="body3" className={classes.type}>
                        {t('obx.sites.table.listing.columns.zone')}:{' '}
                        {site?.zone ? capitalizeFirstLetter(site?.zone) : 'N/A'}
                      </Typography>
                      {(site.status === siteStatusEnum.requiresAttention ||
                        site.status === siteStatusEnum.nonFunctional) && (
                        <Box className={classes.typeChip}>
                          <ChipComponent status={site?.status} isSite={true} />
                        </Box>
                      )}
                    </>
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

  // This function handles the search logic
  const handleSearch = (query) => {
    const { value } = query?.target ?? '';

    const queryParam = { ...queryParams, search: value, page: paginationOptions.defaultPerPage };

    setQueryParams(queryParam);

    fetchSites(queryParam);
  };

  useEffect(() => {
    fetchSites(queryParams);
  }, []);

  useEffect(() => {
    setCurrentId(id);
  }, [id]);

  return (
    <>
      <Box className={`${className}`}>
        <Box className={classes.searchComponentWrapper}>
          <SearchComponent
            className={classes.searchComponent}
            query={query}
            setQuery={setQuery}
            onSearch={handleSearch}
          />
        </Box>
        <Box className={classes.customScroll}>
          <List className={classes.listCustomClass}>
            <InfiniteScrollCustom
              totalNoOfRecords={totalRecords}
              noOfRecordsBeingDisplayed={items.length}
              lastElement={lastElement}
              body={scrollBody}
              getMoreData={getMoreData}
            />
          </List>
        </Box>
      </Box>
    </>
  );
};

SitesSidebarListings.propTypes = {
  className: PropTypes.string,
};

export default SitesSidebarListings;
