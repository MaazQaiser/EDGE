import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import classNames from 'classnames';
import InfiniteScrollCustom from 'commonComponents/infiniteScrollCustom';
import SearchComponentWithQuery from 'commonComponents/searchWithQuery';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { getFranchises } from 'services/franchise.services';
import NoDataFound from 'src/app/components/common/SideBarNoDataFound';
import SideBarListingSkeleton from 'src/app/components/common/skeletonLoader/sidebarListingCardSkeleton';
import { HO_FRANCHISE_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { setSideBarData } from 'src/helper/utilityFunctions';
import { paginationOptions } from 'src/utils/constants';
import capitalize from 'src/utils/string/capitalize';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { franchiseStatusEnum } from '../../../utils/enums';
import ChipComponent from '../chip';
import { useStyles } from './franchiseSidebarListing';
const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
};
const FranchiseSidebarListings = ({ className }) => {
  const { t } = useTranslation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState(params);
  const [totalRecords, setTotalRecords] = useState(1);
  const [lastElement, setLastElement] = useState(null);

  const { id } = useParams();
  const classes = useStyles();
  const location = useLocation();
  const urlQueryParams = new URLSearchParams(location.search);
  const reloadFranchise = urlQueryParams.get('reload');

  const [currentId, setCurrentId] = useState('');

  const fetchFranchises = async (queryParams) => {
    setLoading(true);
    try {
      const response = await getFranchises(queryParams);
      if (response && response?.statusCode === 200) {
        setSideBarData(
          response,
          queryParams,
          setItems,
          setQueryParams,
          setTotalRecords,
          'franchises',
        );
        setLoading(false);
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
      setLoading(false);
    }
  };

  // This function handles the search logic
  const handleSearch = (query) => {
    const { value } = query?.target ?? '';

    const queryParam = { ...queryParams, search: value, page: paginationOptions.defaultPerPage };

    setQueryParams(queryParam);

    fetchFranchises(queryParam);
  };

  const getMoreData = () => {
    if (items.length < totalRecords && !loading) {
      setQueryParams((prev) => {
        const qParams = {
          ...prev,
          page: prev.page + 1,
        };
        fetchFranchises(qParams);
        return qParams;
      });
    }
  };

  const handleSelectedFranchise = (id) => {
    history.push(`${HO_FRANCHISE_DETAIL}/${id}`);
  };

  const applySelectedClass = (id) => {
    return `${classes.listItem} ${currentId == id && classes.activeListItem}`;
  };

  const scrollBody = () => (
    <>
      {items.length < 1 && queryParams?.search.length > 0 && (
        <NoDataFound
          title={`${t('ho.ho_franchise.sidebarListing.noFranchiseFound')}`}
          searchedQuery={queryParams?.search}
          searchedTermText={`${t('ho.ho_franchise.sidebarListing.searchedTermNotFound', {
            searchedTerm: queryParams?.search,
          })}`}
        />
      )}
      {items.length > 0 &&
        items.map((franchise, index) => {
          // it is being used to determine if it is the last element so it could get its reference and apply infinite scroll methods
          const isLastElement =
            index === items.length - 1 && !loading && items.length <= totalRecords;
          return (
            <ListItem
              key={franchise?.id}
              alignItems="flex-start"
              sx={{ borderBottom: '1px solid #e6e6e7', padding: 0 }}
              ref={isLastElement ? setLastElement : null}
              // this is css for selected items
              className={classNames(classes.detailSideList, applySelectedClass(franchise?.id))}
            >
              <ListItemButton
                className={classes.ListItemButton}
                onClick={(_e) => handleSelectedFranchise(franchise?.id)}
              >
                {
                  <ListItemText
                    className={classes.listText}
                    primary={`${capitalizeFirstLetter(franchise?.franchiseName)}`}
                    secondary={
                      <>
                        <Typography variant="body3">
                          {capitalize(franchise?.owner?.name)}
                        </Typography>
                        <Box className={classes.statusBody}>
                          <Typography className={classes.id}>#{franchise?.id}</Typography>
                          {franchise?.status === franchiseStatusEnum.functional ? (
                            ''
                          ) : (
                            <ChipComponent status={franchise?.status || ''} />
                          )}
                        </Box>
                      </>
                    }
                  />
                }
              </ListItemButton>
            </ListItem>
          );
        })}
      {loading && <SideBarListingSkeleton />}
    </>
  );

  const findItemAndUpdateStatus = (id) => {
    const index = items.findIndex((o) => o.id == id);
    if (index > -1) {
      const data = [...items];
      data[index].status =
        data[index].status === franchiseStatusEnum.nonFunctional
          ? franchiseStatusEnum.functional
          : franchiseStatusEnum.nonFunctional;
      setItems(data);
    }
  };

  useEffect(() => {
    fetchFranchises(queryParams);
  }, []);

  useEffect(() => {
    if (reloadFranchise) {
      findItemAndUpdateStatus(id);
      handleSelectedFranchise(id);
    }
  }, [reloadFranchise]);

  useEffect(() => {
    setCurrentId(id);
  }, [id]);

  return (
    <Box className={`${className}`}>
      <Box className={classes.searchComponentWrapper}>
        <SearchComponentWithQuery
          name="search"
          placeHolder={`${t('form.input.textField.search.placeHolder')}`}
          value={queryParams?.search}
          onSearch={handleSearch}
          className={classes.searchCustomClass}
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
  );
};

FranchiseSidebarListings.propTypes = {
  className: PropTypes.string,
};

export default FranchiseSidebarListings;
