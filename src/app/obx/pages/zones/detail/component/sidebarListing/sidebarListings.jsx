import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import PropTypes from 'prop-types';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import AvatarGroupImage from 'src/app/components/common/avatarGroupImage';
import InfiniteScrollCustom from 'src/app/components/common/infiniteScrollCustom';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import NoDataFound from 'src/app/components/common/SideBarNoDataFound';
import SideBarListingSkeleton from 'src/app/components/common/skeletonLoader/sidebarListingCardSkeleton';
import { OBX_ZONES_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { setSideBarData } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { getZones } from 'src/services/zone.service';
import { paginationOptions } from 'src/utils/constants';
import _capitalize from 'src/utils/string/capitalize';

import { useStyles } from './sidebarListing.styles';

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
};

const SidebarListings = ({ className }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState(params);
  const [totalRecords, setTotalRecords] = useState(1);
  const classes = useStyles();
  const [lastElement, setLastElement] = useState(null);
  const NA = t('commonText.nA');

  const { id } = useParams();
  const [currentId, setCurrentId] = useState('');

  const fetchZones = async (queryParams) => {
    setLoading(true);
    try {
      const response = await getZones(queryParams);
      if (response && response?.statusCode === 200) {
        setSideBarData(response, queryParams, setItems, setQueryParams, setTotalRecords, 'zones');
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
        fetchZones(qParams);
        return qParams;
      });
    }
  };

  const handleSelectedZone = (id) => {
    history.push(`${OBX_ZONES_DETAIL}/${id}`);
  };

  const scrollBody = () => (
    <>
      {items.length < 1 && queryParams?.search.length > 0 && (
        <NoDataFound
          title={`${t('obx.ho_franchise.sidebarListing.noFranchiseFound')}`}
          searchedQuery={queryParams?.search}
          searchedTermText={`${t('obx.ho_franchise.sidebarListing.searchedTermNotFound', {
            searchedTerm: queryParams?.search,
          })}`}
        />
      )}
      {items.length > 0 &&
        items.map((zone, index) => {
          // it is being used to determine if it is the last element so it could get its reference and apply infinite scroll methods
          const isLastElement =
            index === items.length - 1 && !loading && items.length <= totalRecords;
          return (
            <ListItem
              key={index}
              alignItems="flex-start"
              sx={{ borderBottom: '1px solid #e6e6e7', padding: 0 }}
              ref={isLastElement ? setLastElement : null}
              // this is css for selected items
              className={`${classes.detailSideList} ${
                currentId == zone?.id && classes.activeListItem
              }`}
            >
              <ListItemButton
                onClick={(_e) => handleSelectedZone(zone?.id)}
                className={classes.ListItemButton}
              >
                <ListItemText
                  className={classes.listText}
                  primary={`${zone?.name}`}
                  secondary={
                    <>
                      <Box className={classes.type}>
                        <Typography component={'span'}>
                          {t('obx.zones.table.listing.columns.supervisors', {
                            supervisor: getLabel('roles', 'supervisor', t),
                          })}
                          :{' '}
                        </Typography>{' '}
                        {zone?.supervisors.length > 0 ? (
                          <AvatarGroupImage data={zone?.supervisors} />
                        ) : (
                          NA
                        )}
                      </Box>
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

  // This function handles the search logic
  const handleSearch = (query) => {
    const { value } = query?.target ?? '';

    const queryParam = { ...queryParams, search: value, page: paginationOptions.defaultPerPage };

    setQueryParams(queryParam);

    fetchZones(queryParam);
  };

  useEffect(() => {
    fetchZones(queryParams);
  }, []);

  useEffect(() => {
    setCurrentId(id);
  }, [id]);

  return (
    <>
      <Box className={className}>
        <Box className={classes.searchComponentWrapper}>
          <SearchComponentWithQuery
            name="search"
            className={classes.searchComponent}
            value={queryParams?.search}
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

SidebarListings.propTypes = {
  className: PropTypes.string,
};
export default SidebarListings;
