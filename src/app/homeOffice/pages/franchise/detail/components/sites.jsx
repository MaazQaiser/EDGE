import { Box, TableCell, TableRow, TableSortLabel } from '@mui/material';
import { makeStyles } from '@mui/styles';
// import { ReactComponent as ExportUploadIcon } from 'assets/images/downloadcloud.svg';
import SearchComponentWithQuery from 'commonComponents/searchWithQuery';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getAllZones, getSites } from 'services/client.services';
import CustomDropDown from 'src/app/components/common/customDropDown';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton.jsx';
import { HO_SITES_DETAIL_ROUTE, OBX_CREATE_SITE } from 'src/app/router/constant/ROUTE.jsx';
import history from 'src/app/router/utils/history';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { useCurrency } from 'src/hooks/useCurrency.jsx';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions.js';
import { numberToAmountFormat } from 'src/utils/currencyFormater/index.js';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor/index.js';
import capitalize from 'src/utils/string/capitalize.jsx';
import { capitalizeFirstLetter } from 'src/utils/string/common.jsx';

import {
  franchiseIdUrlQueryParam,
  paginationOptions,
  rolesEnumWithName,
  timeZoneKeyUrlQueryParam,
} from '../../../../../../utils/constants/index.js';
import TableComponent from '../../../../../components/common/table/index.jsx';
import NoRecordFound from '../../../../../components/common/table/noRecordFound.jsx';
import TableImage from '../../../../../components/common/tableImage/index.jsx';
// import { franchiseStatusEnum } from '../../utils/enums.js';
import ChipComponent from './chip.jsx';
const i18ColumnName = (t, hoverIconClass, getLabel) => {
  return [
    {
      id: 'name',
      label: `${t('ho.sites.table.listing.columns.site')}`,
      sortable: true,
      className: hoverIconClass,
    },
    {
      id: 'company',
      label: `${t('ho.sites.table.listing.columns.company')}`,
      sortable: false,
    },
    {
      id: 'zone',
      label: `${t('ho.sites.table.listing.columns.zone')}`,
      sortable: false,
    },
    {
      id: 'supervisor',
      label: `${getLabel('roles', 'supervisor', t)}`,
      sortable: false,
      hasImage: true,
    },
    {
      id: 'noOfOfficers',
      label: `${getLabel('terms', 'officers', t)}`,
      sortable: false,
    },
    // {
    //   id: 'status',
    //   label: `${t('ho.sites.table.listing.columns.status')}`,
    //   sortable: false,
    // },
    {
      id: 'monthlyRevenue',
      label: `${t('ho.sites.table.listing.columns.monthlyRevenue')}`,
      sortable: false,
    },
    {
      id: 'termsAndConditionsVersion',
      label: `${t('ho.sites.table.listing.columns.termsAndConditionsVersion')}`,
      sortable: true,
      homeOfficerOnly: true,
    },
    {
      id: 'client',
      label: `${t('ho.sites.table.listing.columns.clientsName')}`,
      sortable: false,
      hasImage: true,
    },
    {
      id: 'phoneNumber',
      label: `${t('ho.sites.table.listing.columns.contact')}`,
      sortable: false,
    },
  ];
};

const columnIdsEnum = {
  id: 'id',
  site: 'site',
  zone: 'zone',
  owner: 'owner',
  type: 'type',
  name: 'name',
  client: 'client',
  supervisor: 'supervisor',
  status: 'status',
  monthlyRevenue: 'monthlyRevenue',
  company: 'company',
};

const checkKeyNames = {
  all: 'all',
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  zones: [],
  sortBy: '',
  orderBy: '',
};
const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const zonesFilter = [{ value: 'all', label: 'All Zones' }];

const useStyles = makeStyles((theme) => ({
  searchSectionMain: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
    justifyContent: 'space-between',
  },

  searchSection: {
    gap: '12px',
    display: 'flex',
  },

  dropdownCommonSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  mainWrapper: {
    padding: '24px 32px 0 32px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    [theme.breakpoints.down('lg')]: {
      padding: '24px 24px 0 24px',
    },
  },

  franchiseSitesListing: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
  },
}));
export default function Sites({ franchiseId: id, franchiseData }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [allZones, setAllZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);

  const [queryParams, setQueryParams] = useState(params);
  const userRole = useSelector((state) => state.auth.userRole.slug);
  const isHomeOfficer = userRole === rolesEnumWithName.home_officer.slug;
  const { getCurrencyOfFranchise } = useCurrency();
  const { getLabel } = useTenantLabel();

  const columns = i18ColumnName(t, '', getLabel).filter(
    (column) => !column.homeOfficerOnly || isHomeOfficer,
  );

  const NA = t('commonText.nA');

  function updateFormHandler(name, value) {
    setQueryParams((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  }

  function inputChangedHandler(event) {
    // Get name of changed input, and its corresponding value
    const { name, value } = event.target;
    // Update form state against the target input field
    updateFormHandler(name, value);
  }

  const removeAllFromSelected = (arr) => {
    return arr?.filter((i) => i !== checkKeyNames.all);
  };

  const fetchAllZones = async () => {
    try {
      const response = await getAllZones(id);
      if (response.statusCode === 200) {
        let data = zonesFilter;

        data = [...data, ...transformArrayForOptions(response?.data?.zones, 'name', 'id')];

        if (data.length > 1) {
          setAllZones(data);
        } else {
          setAllZones([]);
        }
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
    }
  };

  const fetchSites = async (params) => {
    try {
      setLoading(true);
      params = {
        ...params,
        zones: removeAllFromSelected(extractValuesByKeyFromInput(params.zones, 'value')),
      };
      const response = await getSites(id, params);
      if (response?.statusCode === 200) {
        setData(response?.data?.sites);
        setTotalRows(response?.data?.pagination?.totalCount);
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_, newPage) => {
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
    if (column?.id === columnIdsEnum?.supervisor) {
      return (
        <>
          {row?.supervisor ? (
            <div className="tableavatar">
              <TableImage
                imageUrl={row?.supervisor?.imageUrl}
                alt={`${t('commonText.image.alt', {
                  name: `${row?.supervisor?.name}`,
                })}`}
              />
              {capitalize(row?.supervisor?.name)}
            </div>
          ) : (
            NA
          )}
        </>
      );
    }
    if (column?.id === columnIdsEnum?.client) {
      return (
        <>
          {row?.client ? (
            <Box className="tableavatar">
              <TableImage
                imageUrl={row?.client?.imageUrl}
                alt={`${t('commonText.image.alt', {
                  name: `${row?.client?.name}`,
                })}`}
              />
              {capitalize(row?.client?.name) || NA}
            </Box>
          ) : (
            NA
          )}
        </>
      );
    }

    if (column?.id === columnIdsEnum?.monthlyRevenue) {
      return (
        <>{`${getCurrencyOfFranchise(id)?.currencySymbol}${numberToAmountFormat(row[column.id])}`}</>
      );
    }

    if (
      column?.id === columnIdsEnum?.company ||
      column.id === columnIdsEnum.name ||
      column.id === columnIdsEnum.zone
    ) {
      return <>{capitalizeFirstLetter(row[column.id]) || NA}</>;
    }

    if (column?.id === columnIdsEnum.status) {
      return <ChipComponent status={row[column.id]} />;
    }
    return <>{row[column.id] || NA}</>;
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

  const _gotoSiteDetail = (column, rowId) => {
    if (column.id === columnIdsEnum.name) {
      const sitePath = HO_SITES_DETAIL_ROUTE.replace(':id', rowId.id);
      const queryParams = new URLSearchParams({
        [franchiseIdUrlQueryParam]: id,
        [timeZoneKeyUrlQueryParam]: franchiseData?.franchiseTimezone,
      }).toString();
      history.push(`${sitePath}?${queryParams}`);
    }
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
    return loading === true ? (
      <TableSkeleton numberOfRows={10} columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.length > 0 &&
          data.map((row) => (
            <TableRow key={row?.id}>
              {columns.map((column) => {
                const showHandCursor = column.id === columnIdsEnum.name ? 'pointer' : '';

                return (
                  <TableCell
                    key={column?.id}
                    // onClick={() => gotoSiteDetail(column, row)}
                    sx={{ cursor: showHandCursor }}
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

  useEffect(() => {
    fetchAllZones();
  }, []);

  useEffect(() => {
    fetchSites(queryParams);
  }, [queryParams, id]);

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
  };

  const _gotoSiteCreate = () => {
    const queryParams = new URLSearchParams({
      [franchiseIdUrlQueryParam]: id,
      [timeZoneKeyUrlQueryParam]: franchiseData?.franchiseTimezone,
    }).toString();
    history.push(`${OBX_CREATE_SITE}?${queryParams}`);
  };

  return (
    <Box className={classes.mainWrapper}>
      <Box className={classes.searchSectionMain}>
        {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
        <Box className={classes.searchSection}>
          <SearchComponentWithQuery
            name="search"
            placeHolder={`${t('form.input.textField.search.placeHolder')}`}
            value={queryParams?.search}
            onSearch={inputChangedHandler}
          />
          <Box className={classes.dropdowncommonsction}>
            <CustomDropDown
              label={t('obx.form.input.dropDown.selectZones.label')}
              name="zones"
              options={allZones}
              selectedValues={queryParams.zones}
              handleChange={inputChangedHandler}
              multiSelect={true}
              checkmark={true}
              withTiles={true}
              className={classes.heloCustom}
              selectFranchise
            />
          </Box>
        </Box>
        {/* <Box className={classes.searchSection}>
          <Button variant="secondaryGrey" disabled startIcon={<ExportUploadIcon />}>
            Export
          </Button>
          {franchiseData?.status === franchiseStatusEnum.functional &&
            userRole !== rolesEnumWithName.supervisor.slug && (
              <Button
                onClick={gotoSiteCreate}
                variant="primary"
              >{`${t('obx.sites.createSite.createSite')}`}</Button>
            )}
        </Box> */}
      </Box>
      <Box className={classes.franchiseSitesListing}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={queryParams.page - 1}
          rowsPerPage={queryParams.perPage}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          applySorting={applySorting}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Box>
    </Box>
  );
}

Sites.propTypes = {
  franchiseData: PropTypes.object,
  franchiseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
