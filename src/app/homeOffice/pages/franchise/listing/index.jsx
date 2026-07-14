import { Box, Button, TableCell, TableRow, TableSortLabel, Tooltip } from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import { ReactComponent as GraphCollapseIconUpward } from 'assets/svg/collapse-upward-icon.svg?react';
import { ReactComponent as ReloadIcon } from 'assets/svg/reload.svg?react';
import CustomDropDown from 'commonComponents/customDropDown';
import SearchComponentWithQuery from 'commonComponents/searchWithQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import TableImage from 'src/app/components/common/tableImage';
import TopGraphComponent from 'src/app/components/homeOfficeComponents/graph';
import { HO_FRANCHISE_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { useApiControllers } from 'src/helper/axios';
import useCountryCityStateHook from 'src/hooks/useCountryCItyStateHook';
import { useCurrency } from 'src/hooks/useCurrency';
import { getFranchises, refreshFranchiseListingData } from 'src/services/franchise.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { paginationOptions, toastSettings } from 'src/utils/constants';
import { numberToAmountFormat } from 'src/utils/currencyFormater';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';
import capitalize from 'src/utils/string/capitalize';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import ChipComponent from '../detail/components/chip';
import { useStyles } from './listing';

const i18ColumnName = (t, classFranchiseName) => {
  return [
    {
      id: 'id',
      label: `${t('ho.ho_franchise.tables.franchiseListing.columns.id')}`,
      sortable: true,
    },
    {
      id: 'franchiseName',
      label: `${t('ho.ho_franchise.tables.franchiseListing.columns.name')}`,
      sortable: true,
      className: classFranchiseName,
    },
    {
      id: 'owner',
      label: `${t('ho.ho_franchise.tables.franchiseListing.columns.owner')}`,
      hasImage: true,
    },
    {
      id: 'monthlyRevenue',
      label: `${t('ho.ho_franchise.tables.franchiseListing.columns.monthlyRevenue')}`,
      sortable: false,
    },
    {
      id: 'noOfCustomer',
      label: `${t('ho.ho_franchise.tables.franchiseListing.columns.noOfCustomer')}`,
      sortable: false,
    },
    {
      id: 'status',
      label: `${t('ho.ho_franchise.tables.franchiseListing.columns.status')}`,
      sortable: false,
    },
    {
      id: 'state',
      label: `${t('ho.ho_franchise.tables.franchiseListing.columns.state')}`,
      sortable: false,
    },
    {
      id: 'city',
      label: `${t('ho.ho_franchise.tables.franchiseListing.columns.city')}`,
      sortable: false,
    },
    {
      id: 'noOfUsers',
      label: `${t('ho.ho_franchise.tables.franchiseListing.columns.noOfUser')}`,
      sortable: false,
    },
    {
      id: 'noOfServiceZips',
      label: `${t('ho.ho_franchise.tables.franchiseListing.columns.noOfServiceZips')}`,
      sortable: false,
    },
    // {
    //   id: 'laborEfficiencyPercent',
    //   label: `${t('ho.ho_franchise.tables.franchiseListing.columns.laborEfficiencyPercent')}`,
    //   sortable: false,
    // },
    // {
    //   id: 'customerRetentionPercent',
    //   label: 'Customer Retention',
    //   sortable: false,
    // },
  ];
};

const statusFilter = (t) => [
  { value: 'all', label: t('obx.sites.filters.sitesType.allStatus') },
  { value: 'functional', label: t('obx.sites.filters.sitesType.functional') },
  { value: 'nonFunctional', label: t('obx.sites.filters.sitesType.requiresAttention') },
];

const columnIdsEnum = {
  id: 'id',
  franchiseName: 'franchiseName',
  status: 'status',
  owner: 'owner',
  monthlyRevenue: 'monthlyRevenue',
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  states: [],
  cities: [],
  status: {},
  sortBy: '',
  orderBy: '',
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const checkKeyNames = {
  all: 'all',
  states: 'states',
  cities: 'cities',
};

export default function Dashboard() {
  const { t } = useTranslation();
  const classes = useStyles();
  const NA = t('commonText.nA');
  const { getCurrencyOfFranchise } = useCurrency();

  const classFranchiseName = classes.franchiseTD;
  const { getNewApiController } = useApiControllers();
  // const [filterLocalState, setFilterLocalState] = useState({
  //   cities: [],
  //   states: [],
  //   status: '',
  // });
  const [graphCollapse, setGraphCollapse] = useState(false);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);

  const [queryParams, setQueryParams] = useState(params);

  const { CityHookComponent, StateHookComponent } = useCountryCityStateHook({
    formData: queryParams,
    setFormData: setQueryParams,
    errorMessages: {},
    setErrorMessages: () => {},
    multiStates: true,
    multiCities: true,
    cityPlaceholder: t('ho.ho_franchise.tables.franchiseListing.filters.citiesDropdown.label'),
    statePlaceholder: t('ho.ho_franchise.tables.franchiseListing.filters.statesDropdown.label'),
    stateProps: {
      placeHolderClassName: classes.dropdownPlaceholder,
    },
    cityProps: {
      placeHolderClassName: classes.dropdownPlaceholder,
    },
  });

  const columns = i18ColumnName(t, classFranchiseName);

  useEffect(() => {
    fetchFranchises(queryParams);
  }, [queryParams]);

  const removeAllFromSelected = (arr) => {
    return arr?.filter((i) => i !== checkKeyNames.all);
  };
  /**
   * ? NOTE: Cities here is an independent filter. User can only select city without state.
   * So there is not need for this function
   */
  // const updateCitiesFilter = (stateObj) => {
  //   const cities = filterLocalState.states?.find((o) => o.name === stateObj.name);
  //   setFilterLocalState((prev) => ({
  //     ...prev,
  //     cities,
  //   }));
  // };

  const fetchFranchises = async (queryParams) => {
    const apiController = getNewApiController();
    setLoading(true);
    try {
      const params = {
        ...queryParams,
        states: removeAllFromSelected(extractValuesByKeyFromInput(queryParams.states, 'value')),
        cities: removeAllFromSelected(extractValuesByKeyFromInput(queryParams.cities, 'value')),
        status:
          extractValuesByKeyFromInput(queryParams.status, 'value') !== checkKeyNames.all
            ? extractValuesByKeyFromInput(queryParams.status, 'value')
            : '',
      };
      const response = await getFranchises(params, { signal: apiController.signal });
      if (response && response?.statusCode === 200) {
        setData(response?.data?.franchises);
        const total = response?.data?.pagination?.totalCount;
        setTotalRows(total);
      }
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };
  const syncFranchiseData = async () => {
    setLoading(true);
    try {
      const response = await refreshFranchiseListingData();
      setLoading(false);
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      setLoading(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value, 10),
    }));
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.franchiseName) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>
            {capitalizeFirstLetter(row[column.id]) || NA}
          </Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.owner) {
      return (
        <>
          {row?.owner ? (
            <Box className="tableavatar">
              <TableImage
                imageUrl={row?.owner?.image}
                // alt={`${t('commonText.image.alt', {
                //   name: `${row?.owner?.name}`,
                // })}`}
                alt=""
              />
              {capitalize(row?.owner?.name) || NA}
            </Box>
          ) : (
            NA
          )}
        </>
      );
    }
    if (column.id === columnIdsEnum.status) {
      // ? This should be handled by CSS. or some MUI way
      return <ChipComponent status={row?.status} />;
    }
    if (column.id === columnIdsEnum.monthlyRevenue) {
      return (
        <>{`${getCurrencyOfFranchise(row?.id)?.currencySymbol}${numberToAmountFormat(row[column.id])}`}</>
      );
    }
    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
    }

    return <>{row[column.id] || NA}</>;
  };

  const gotoFranchiseDetail = (column, rowId) => {
    if (column.id === columnIdsEnum.franchiseName) {
      history.push(`${HO_FRANCHISE_DETAIL}/${rowId}`);
    }
  };

  const [orderState, setOrderState] = useState(order);

  /**
   * Handle column sorting.
   *
   * @param {String} columnId - The ID of the column being sorted.
   */
  const handleSort = (columnId) => {
    const isAsc = orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, orderState.orderType);
  };

  /**
   * Determine the sort direction for a column.
   *
   * @param {Object} column - The column configuration object.
   * @return {Boolean|String} - The sort direction or false if not sorted.
   */
  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

  /**
   * Determine the order direction for a column.
   *
   * @param {Object} column - The column configuration object.
   * @return {String} - The order direction ('asc' or 'desc').
   */
  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : 'asc';
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id} sortDirection={sortDirection(column)}>
              {column.sortable ? (
                <TableSortLabel
                  active={orderState.orderBy === column.id}
                  direction={orderDirection(column)}
                  onClick={() => handleSort(column.id)}
                >
                  {column.label}
                </TableSortLabel>
              ) : (
                `${column.label}`
              )}
            </TableCell>
          ))}
        </TableRow>
      </>
    );
  };

  const tableBody = (data, columns) => {
    return loading ? (
      <TableSkeleton numberOfRows={10} columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.length > 0 &&
          data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => {
                const showHandCursor = column.id === columnIdsEnum.franchiseName ? 'pointer' : '';
                return (
                  <TableCell
                    key={column.id}
                    onClick={() => gotoFranchiseDetail(column, row.id)}
                    sx={{ cursor: showHandCursor }}
                    className={column.className}
                  >
                    {renderTableCell(row, column)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
      </>
    );
  };

  const updateFormHandler = (name, value) => {
    setQueryParams((prevState) => {
      return {
        ...prevState,
        page: paginationOptions.defaultPerPage,
        [name]: handleAllScenario(prevState, name, value),
      };
    });
  };
  const inputChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value
    const { name, value } = event.target;
    // Update form state against the target input field
    updateFormHandler(name, value);

    // // if event name is state update the cities dropdown accordingly
    // updateCitiesFilter();
  };

  /**
   * This Function handles all selection in states and cities dropdown
   * if prev state contains all remove it
   * if new state contains all remove prev state
   */
  const handleAllScenario = (prevState, keyName, newValue) => {
    if (keyName === checkKeyNames.states || keyName === checkKeyNames.cities) {
      const allExistInPrevState = prevState[keyName]?.find((v) => v.id === checkKeyNames.all);
      if (allExistInPrevState) {
        return newValue.filter((obj) => obj.id !== checkKeyNames.all);
      }
      const allExistInNewValue = newValue?.find((o) => o.id === checkKeyNames.all);
      if (allExistInNewValue) {
        return newValue.filter((obj) => obj.id === checkKeyNames.all);
      }
    }
    return newValue;
  };

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
  };

  return (
    <Box className={classes.franchiseListingContainer}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={!graphCollapse ? classes.mainWrapper : classes.graphHide}>
        <TopGraphComponent showYear={false} />
        {!graphCollapse && (
          <Button
            variant="secondaryGrey"
            onClick={() => setGraphCollapse(true)}
            className={classes.graphCollapseBtn}
          >
            <Box>
              <GraphCollapseIconUpward />
            </Box>
          </Button>
        )}
      </Box>
      {graphCollapse && (
        <Button
          variant="secondaryGrey"
          onClick={() => setGraphCollapse(false)}
          className={classes.graphExpandBtn}
        >
          <Box>
            <GraphCollapseIconUpward />
          </Box>
        </Button>
      )}
      <Box className={classes.searchSectionDashboard}>
        <Box className={classes.searchSection}>
          <SearchComponentWithQuery
            name="search"
            placeHolder={`${t(
              'commonText.searchPlaceholders.franchiseListing.searchBar.placeHolder',
            )}`}
            value={queryParams?.search}
            onSearch={inputChangedHandler}
          />

          <StateHookComponent />

          <CityHookComponent />

          <CustomDropDown
            label={t('obx.sites.filters.sitesType.allStatus')}
            name="status"
            options={transformArrayForOptions(statusFilter(t), 'label', 'value')}
            selectedValues={queryParams.status}
            handleChange={inputChangedHandler}
            multiSelect={false}
            checkmark={false}
            searchable={false}
            withTiles={false}
          />
        </Box>
        <Tooltip
          title={`${t('ho.ho_franchise.tables.franchiseListing.syncDataButton.tooltip')}`}
          placement="left"
          arrow
        >
          <Button onClick={syncFranchiseData} variant="onlyText" disableRipple disableTouchRipple>
            <ReloadIcon />
          </Button>
        </Tooltip>
      </Box>
      <Box className={classes.tableWrapper}>
        <TableComponent
          className={classes.tableComponent}
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={queryParams.page - 1}
          rowsPerPage={queryParams.perPage}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          applySorting={applySorting}
        />
      </Box>
    </Box>
  );
}
