import { Typography } from '@mui/material';
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
import { useParams } from 'react-router-dom';
import SideBarListingSkeleton from 'src/app/components/common/skeletonLoader/sidebarListingCardSkeleton';
import { OBX_ATTENDANCE_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { setSideBarData } from 'src/helper/utilityFunctions';
import { getAttendances } from 'src/services/attendance.services';
import { paginationOptions } from 'src/utils/constants';

import { useStyles } from './sideBarStyles';
const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
};

const SidebarListings = ({ className }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queryParams, setQueryParams] = useState(params);
  const [totalRecords, setTotalRecords] = useState(1);
  const [query, setQuery] = useState('');
  const [lastElement, setLastElement] = useState(null);
  const classes = useStyles();
  const { id } = useParams();
  const [currentId, setCurrentId] = useState('');

  const fetchAttendances = async (queryParams) => {
    setLoading(true);
    try {
      const response = await getAttendances(queryParams);

      if (response && response?.statusCode === 200) {
        setSideBarData(response, queryParams, setItems, setQueryParams, setTotalRecords, 'summary');
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
          page: parseInt(prev.page) + 1,
        };
        fetchAttendances(qParams);
        return qParams;
      });
    }
  };

  const handleSelected = (id) => {
    history.push(`${OBX_ATTENDANCE_DETAIL}/${id}`);
  };

  const applySelectedClass = (id) => {
    return `${classes.listItem} ${currentId == id && classes.activeListItem}`;
  };

  const scrollBody = () => (
    <>
      {items.length > 0 &&
        items.map((current, index) => {
          // it is being used to determine if it is the last element so it could get its reference and apply infinite scroll methods
          const isLastElement =
            index === items.length - 1 && !loading && items.length <= totalRecords;
          return (
            <ListItem
              key={current?.id}
              alignItems="flex-start"
              sx={{ borderBottom: '1px solid #e6e6e7', padding: 0 }}
              ref={isLastElement ? setLastElement : null}
              className={classNames(
                classes.detailSideList,
                applySelectedClass(current?.id || current?.officer?.id),
              )}
            >
              <ListItemButton
                onClick={(_e) => handleSelected(current?.id || current?.officer?.id)}
                className={classes.ListItemButton}
              >
                <ListItemText
                  className={classes.listText}
                  sx={{
                    fontSize: '16px',
                    fontWeight: '500',
                    lineHeight: '24px',
                  }}
                  primary={`${current?.officer?.name || 'N/A'}`}
                  secondary={
                    <>
                      <Typography className={classes.type}>
                        Level {current?.officer?.level || 'N/A'}
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
  // This function handles the search logic
  const handleSearch = (query) => {
    const { value } = query?.target ?? '';

    const queryParam = { ...queryParams, search: value, page: paginationOptions.defaultPerPage };

    setQueryParams(queryParam);

    fetchAttendances(queryParam);
  };

  useEffect(() => {
    fetchAttendances(queryParams);
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
        <div style={{ height: 'calc(100vh - 100px)', overflowY: 'auto' }} className="customscroll">
          <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
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
    </>
  );
};

SidebarListings.propTypes = {
  className: PropTypes.string,
};

export default SidebarListings;
