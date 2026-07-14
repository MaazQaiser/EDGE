import { Chip, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import InfiniteScrollCustom from 'src/app/components/common/infiniteScrollCustom';
import SearchComponent from 'src/app/components/common/search';
import NoDataFound from 'src/app/components/common/SideBarNoDataFound';
import SideBarListingSkeleton from 'src/app/components/common/skeletonLoader/sidebarListingCardSkeleton';
import { OBX_DISPATCH_DETAILS } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { setSideBarData } from 'src/helper/utilityFunctions';
import useDateTime from 'src/hooks/useDateTime';
import usePersistentApiData from 'src/hooks/usePresistantApiData';
import { getDispatches, getDispatchTypes } from 'src/services/dispatch.services';
import { dayjsFormatsEnum, paginationOptions } from 'src/utils/constants';

import { DISPATCH_STATUS_ENUM } from '../../dispatch.constant';
import { useStyles } from './sideBarStyles';

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
};
const SidebarListings = ({ className, updatedObject }) => {
  const { t } = useTranslation();
  const { data: DISPATCH_TYPE_ENUM } = usePersistentApiData('dispatch-types', getDispatchTypes);
  const { formatDayjsDateTime } = useDateTime();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState(params);
  const [totalRecords, setTotalRecords] = useState(1);
  const [query, setQuery] = useState('');
  const [lastElement, setLastElement] = useState(null);
  const classes = useStyles();
  const { id } = useParams();

  const [currentId, setCurrentId] = useState('');

  const fetchSites = async (queryP) => {
    setLoading(true);
    try {
      const response = await getDispatches(queryP);

      if (response && response?.statusCode === 200) {
        setSideBarData(response, queryP, setItems, setQueryParams, setTotalRecords, 'dispatches');

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

  const handleSelectedDispatch = (dispatch) => {
    history.push(
      `${OBX_DISPATCH_DETAILS}/${dispatch?.id}${dispatch.franchiseId ? `?franchiseId=${dispatch?.franchiseId}` : ''}`,
    );
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
        {items?.map((dispatch, index) => {
          // it is being used to determine if it is the last element so it could get its reference and apply infinite scroll methods
          const isLastElement =
            index === items.length - 1 && !loading && items.length <= totalRecords;
          return (
            <ListItem
              key={dispatch?.id}
              alignItems="flex-start"
              sx={{ borderBottom: '1px solid #e6e6e7', padding: 0 }}
              ref={isLastElement ? setLastElement : null}
              className={classNames(classes.detailSideList, applySelectedClass(dispatch?.id))}
            >
              <ListItemButton
                onClick={(_e) => handleSelectedDispatch(dispatch)}
                className={classes.ListItemButton}
              >
                <ListItemText
                  className={classes.listText}
                  primary={
                    <>
                      <Box className={classes.flexBox}>
                        <Typography variant="body3" className={classes.createdAt}>
                          {formatDayjsDateTime({
                            value: dispatch?.createdAt,
                            formatType: dayjsFormatsEnum.date,
                          })}
                        </Typography>
                        <Chip
                          label={
                            DISPATCH_STATUS_ENUM(t)?.[dispatch?.status]?.label || dispatch?.status
                          }
                          color={DISPATCH_STATUS_ENUM(t)?.[dispatch?.status]?.color}
                        />
                      </Box>
                      <Typography variant="subtitle1" className={classes.ownerName}>
                        {dispatch?.siteName}
                      </Typography>
                    </>
                  }
                  secondary={
                    <>
                      <Typography variant="body3" className={classes.type}>
                        {DISPATCH_TYPE_ENUM[dispatch?.dispatchType] || dispatch?.dispatchType}
                      </Typography>
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

  useEffect(() => {
    if (updatedObject) {
      setItems((prev) =>
        prev.map((item) => (item.id === updatedObject.id ? { ...updatedObject } : item)),
      );
    }
  }, [updatedObject]);

  return (
    <>
      <Box className={`${className}`}>
        <Box className={classes.searchComponentWrapper}>
          <SearchComponent
            className={classes.searchComponent}
            query={query}
            setQuery={setQuery}
            onSearch={handleSearch}
            placeholder={t('obx.dispatch.searchBySitename')}
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
  refreshId: PropTypes.string,
  className: PropTypes.string,
  updatedObject: PropTypes.object,
};

export default SidebarListings;
