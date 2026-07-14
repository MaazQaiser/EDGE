import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import InfiniteScrollCustom from 'src/app/components/common/infiniteScrollCustom';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import NoDataFound from 'src/app/components/common/SideBarNoDataFound';
import SideBarListingSkeleton from 'src/app/components/common/skeletonLoader/sidebarListingCardSkeleton';
import { OBX_VEHICLE_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { setSideBarData } from 'src/helper/utilityFunctions';
import { getVehicles } from 'src/services/vehicles.services';
import { paginationOptions } from 'src/utils/constants';

import { useStyles } from './sideBarStyles';

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
};

const SidebarListings = ({ className }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState(params);
  const [totalRecords, setTotalRecords] = useState(1);
  const classes = useStyles();
  const [lastElement, setLastElement] = useState(null);

  const { id } = useParams();
  const [currentId, setCurrentId] = useState('');

  const NA = t('commonText.nA');

  const fetchVehicles = async (queryParams) => {
    setLoading(true);
    try {
      const response = await getVehicles(queryParams);

      if (response && response?.statusCode === 200) {
        setSideBarData(
          response,
          queryParams,
          setItems,
          setQueryParams,
          setTotalRecords,
          'vehicles',
        );
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
        fetchVehicles(qParams);
        return qParams;
      });
    }
  };

  const handleSelectedVehicle = (id) => {
    history.push(`${OBX_VEHICLE_DETAIL}/${id}`);
  };

  const scrollBody = () => {
    if (items.length < 1 && queryParams?.search.length > 0) {
      return (
        <NoDataFound
          title={`${t('obx.sites.sidebarListing.notFound', {
            sidebarModule: 'vehicle',
          })}`}
          searchedQuery={queryParams?.search}
          searchedTermText={`${t('obx.sites.sidebarListing.searchedTermNotFound', {
            searchedTerm: queryParams?.search,
          })}`}
        />
      );
    }
    return (
      <>
        {items?.map((vehicle, index) => {
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
                currentId == vehicle?.id && classes.activeListItem
              }`}
            >
              <ListItemButton
                onClick={(_e) => handleSelectedVehicle(vehicle?.id)}
                className={classes.ListItemButton}
              >
                <ListItemText
                  className={classes.listText}
                  sx={{
                    fontSize: '16px',
                    fontWeight: '500',
                    lineHeight: '24px',
                  }}
                  primary={`${vehicle?.registrationNumber || NA}`}
                  secondary={
                    <Box className={classes.vehicleName}>
                      <Typography className={classes.ownerName}>
                        {vehicle?.makeModelYear || NA}
                      </Typography>
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

  // This function handles the search logic
  const handleSearch = (query) => {
    const { value } = query?.target ?? '';

    const queryParam = { ...queryParams, search: value, page: paginationOptions.defaultPerPage };

    setQueryParams(queryParam);

    fetchVehicles(queryParam);
  };

  useEffect(() => {
    fetchVehicles(queryParams);
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
            placeHolder={`${t('form.input.textField.search.placeHolder')}`}
            value={queryParams?.search}
            onSearch={handleSearch}
            className={classes.searchCustomClass}
          />
        </Box>
        <Box style={{ height: 'calc(100vh - 100px)', overflowY: 'auto' }}>
          <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
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
