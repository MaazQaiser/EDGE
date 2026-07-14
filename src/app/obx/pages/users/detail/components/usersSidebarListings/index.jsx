import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import classNames from 'classnames';
import InfiniteScrollCustom from 'commonComponents/infiniteScrollCustom';
import SearchComponent from 'commonComponents/searchWithQuery';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getUsers } from 'services/user.services';
import SideBarListingSkeleton from 'src/app/components/common/skeletonLoader/sidebarListingCardSkeleton';
import { OBX_USER_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { setSideBarData } from 'src/helper/utilityFunctions';
import { paginationOptions } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { useStyles } from './usersSideBarStyles';
// import classes from './index.module.scss';

const ROLE_TYPES = {
  HOME_OFFICER: 'Home',
  FRANCHISE_OFFICER: 'Franchise',
};

const params = {
  page: 1,
  perPage: paginationOptions.perPageRows,
  search: '',
};

const UsersSidebarListings = ({ className }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState(params);
  const [totalRecords, setTotalRecords] = useState(1);
  const [query, setQuery] = useState('');
  const [lastElement, setLastElement] = useState(null);
  const [selectedTab, setSelectedTab] = useState('');
  const classes = useStyles();
  const { id } = useParams();
  const [currentId, setCurrentId] = useState('');
  const franchiseId = useSelector((state) => state.auth.franchiseId);
  const { t } = useTranslation();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tabValue = queryParams.get('tab');
    if (tabValue) {
      setSelectedTab(tabValue);
    } else {
      setSelectedTab(ROLE_TYPES.HOME_OFFICER);
    }
  }, []);

  const fetchUsers = async (queryParams) => {
    setLoading(true);
    try {
      if (selectedTab === 'Franchise') {
        queryParams.roleable_type = selectedTab;
      } else {
        queryParams.roleable_type = '';
      }
      const response = await getUsers(queryParams);

      if (response && response?.statusCode === 200) {
        setSideBarData(response, queryParams, setItems, setQueryParams, setTotalRecords, 'users');
        setLoading(false);
      }

      setLoading(false);
    } catch (error) {
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
        fetchUsers(qParams);
        return qParams;
      });
    }
  };

  const handleSelectedUser = (id) => {
    history.push(`${OBX_USER_DETAIL}/${id}`);
  };

  const applySelectedClass = (id) => {
    return `${classes.listItem} ${currentId == id && classes.activeListItem}`;
  };

  const scrollBody = () => (
    <>
      {items &&
        items.length > 0 &&
        items.map((user, index) => {
          // it is being used to determine if it is the last element so it could get its reference and apply infinite scroll methods
          const isLastElement =
            index === items.length - 1 && !loading && items.length <= totalRecords;
          return (
            <ListItem
              key={user?.id}
              alignItems="flex-start"
              ref={isLastElement ? setLastElement : null}
              className={classNames(classes.detailSideList, applySelectedClass(user?.id))}
            >
              <ListItemButton
                onClick={(_e) => handleSelectedUser(user?.id)}
                className={classes.ListItemButton}
              >
                <ListItemText
                  className={classes.listText}
                  primary={`${capitalizeFirstLetter(user?.name)}`}
                  secondary={
                    <>
                      <Typography variant="body3" className={classes.listUserType}>
                        {t('obx.users.level')} {user?.level} {capitalizeFirstLetter(user?.label)}
                      </Typography>
                    </>
                  }
                />
                <Typography variant="body3" className={classes.listItemText}>
                  {capitalizeFirstLetter(user?.label)}
                </Typography>
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

    const queryParam = { ...queryParams, search: value, page: params?.page };

    setQueryParams(queryParam);

    fetchUsers(queryParam);
  };

  const handleSelection = (event) => {
    setSelectedTab(event.target.value);
    setQueryParams(params);
  };

  useEffect(() => {
    fetchUsers(queryParams);
  }, [selectedTab]);

  useEffect(() => {
    setCurrentId(id);
  }, [id]);

  return (
    <>
      <Box className={`${className}`}>
        <Box className={classes.searchComponentWrapper}>
          {!franchiseId && (
            <Box className={classes.userSection}>
              <ToggleButtonGroup
                value={selectedTab}
                className={classes.statesButtons}
                exclusive
                onChange={handleSelection}
                aria-label="toggle button tabs"
              >
                <ToggleButton
                  value={ROLE_TYPES.HOME_OFFICER}
                  aria-label="tab 1"
                  className={classes.firstButton}
                >
                  {t('obx.users.homeofficeusers')}
                </ToggleButton>
                <ToggleButton
                  value={ROLE_TYPES.FRANCHISE_OFFICER}
                  aria-label="tab 2"
                  className={classes.centerButton}
                >
                  {t('obx.users.franchiseusers')}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
          <SearchComponent query={query} setQuery={setQuery} onSearch={handleSearch} />
        </Box>
        <Box className={classes.customScroll}>
          <List className={classes.sidebarList}>
            <InfiniteScrollCustom
              totalNoOfRecords={totalRecords}
              noOfRecordsBeingDisplayed={items && items.length}
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

UsersSidebarListings.propTypes = {
  className: PropTypes.string,
};

export default UsersSidebarListings;
