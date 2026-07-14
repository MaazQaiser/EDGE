import { Box, TableCell, TableRow, TableSortLabel } from '@mui/material';
import { Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as ExportUploadIcon } from 'assets/images/downloadcloud.svg?react';
import SearchComponentWithQuery from 'commonComponents/searchWithQuery';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllSites, getDevices } from 'services/device.services';
import CustomDropDown from 'src/app/components/common/customDropDown/index.jsx';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton.jsx';
import TableImage from 'src/app/components/common/tableImage/index.jsx';
import useDateTime from 'src/hooks/useDateTime.jsx';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions.js';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor/index.js';
import capitalize from 'src/utils/string/capitalize.jsx';
import { capitalizeFirstLetter } from 'src/utils/string/common.jsx';
import { toaster } from 'src/utils/toast/index.jsx';

import {
  dayjsFormatsEnum,
  paginationOptions,
  toastSettings,
} from '../../../../../../utils/constants/index.js';
import TableComponent from '../../../../../components/common/table';
import NoRecordFound from '../../../../../components/common/table/noRecordFound';

const i18ColumnName = (t) => {
  return [
    {
      id: 'id',
      label: `${t('ho.devices.tables.listing.columns.id')}`,
      sortable: true,
    },
    {
      id: 'name',
      label: `${t('ho.devices.tables.listing.columns.name')}`,
      sortable: true,
    },
    { id: 'type', label: `${t('ho.devices.tables.listing.columns.type')}`, hasImage: true },
    {
      id: 'installationDate',
      label: `${t('ho.devices.tables.listing.columns.installationDate')}`,
      sortable: false,
    },
    // {
    //   id: 'batteryRenewal',
    //   label: `${t('ho.devices.tables.listing.columns.batteryRenewal')}`,
    //   sortable: false,
    // },
    {
      id: 'lastScanned',
      label: `${t('ho.devices.tables.listing.columns.lastScannedOn')}`,
      sortable: false,
    },
    {
      id: 'lastScannedBy',
      label: `${t('ho.devices.tables.listing.columns.lastScannedBy')}`,
      sortable: false,
    },
    // {
    //   id: 'zone',
    //   label: `${t('ho.devices.tables.listing.columns.zone')}`,
    //   sortable: false,
    // },
    {
      id: 'siteName',
      label: `${t('ho.devices.tables.listing.columns.site')}`,
      sortable: false,
    },
  ];
};

const devicesFilter = [
  { value: 'all', label: 'All Devices' },
  { value: 'beacon', label: 'Beacon' },
  { value: 'nfc', label: 'NFC' },
  { value: 'qr', label: 'QR Code' },
];

const columnIdsEnum = {
  batteryRenewal: 'batteryRenewal',
  type: 'type',
  name: 'name',
  lastScannedBy: 'lastScannedBy',
  siteName: 'siteName',
  installationDate: 'installationDate',
  lastScanned: 'lastScanned',
};

const checkKeyNames = {
  all: 'all',
  states: 'states',
  cities: 'cities',
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  deviceType: {},
  sites: [],
  sortBy: '',
  orderBy: '',
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

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

const Devices = ({ franchiseId: id }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [allSites, setAllSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [queryParams, setQueryParams] = useState(params);
  const { formatDayjsDateTime } = useDateTime();

  const columns = i18ColumnName(t);

  const NA = t('commonText.nA');

  const removeAllFromSelected = (arr) => {
    return arr?.filter((i) => i !== checkKeyNames.all);
  };

  const fetchSites = async () => {
    try {
      const response = await getAllSites(id, params);
      if (response?.statusCode === 200) {
        setAllSites(response?.data?.sites);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchDevices = async (params) => {
    try {
      params = {
        ...queryParams,
        sites: removeAllFromSelected(extractValuesByKeyFromInput(params.sites, 'value')),
        deviceType:
          extractValuesByKeyFromInput(params.deviceType, 'value') !== checkKeyNames.all
            ? extractValuesByKeyFromInput(params.deviceType, 'value')
            : '',
      };
      setLoading(true);
      const response = await getDevices(id, params);

      if (response?.statusCode === 200) {
        setData(response?.data?.devices);
        setTotalRows(response?.data?.pagination?.totalCount);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormHandler = (name, value) => {
    setQueryParams((prevState) => {
      return {
        ...prevState,
        page: paginationOptions.defaultPerPage,
        [name]: value,
      };
    });
  };
  const inputChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value
    const { name, value } = event.target;
    // Update form state against the target input field
    updateFormHandler(name, value);
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
    if (column.id === columnIdsEnum.batteryRenewal) {
      const dayOrDays =
        row[column.id] > 1 ? `${t('commonText.text.days')}` : `${t('commonText.text.day')}`;
      return (
        <>
          {row[column.id]} {`${dayOrDays}`}
        </>
      );
    }
    if (column?.id === columnIdsEnum?.type) {
      return (
        <>
          {row?.type ? (
            <div className="tableavatar">
              <TableImage
                imageUrl={row?.type?.imageUrl}
                alt={`${t('commonText.image.alt', {
                  name: `${row?.type?.name}`,
                })}`}
              />
              {row?.type?.name}
            </div>
          ) : (
            'NA'
          )}
        </>
      );
    }

    if (column.id === columnIdsEnum.name || column.id === columnIdsEnum.siteName) {
      return <>{capitalizeFirstLetter(row[column.id]) || NA}</>;
    }

    if (column.id === columnIdsEnum.installationDate || column.id === columnIdsEnum.lastScanned) {
      return (
        <>{formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.date })}</>
      );
    }

    if (column.id === columnIdsEnum.lastScannedBy) {
      return <>{capitalize(row[column.id]) || NA}</>;
    }

    return <>{row[column.id]}</>;
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
              {columns.map((column) => (
                <TableCell key={column.id}>{renderTableCell(row, column)}</TableCell>
              ))}
            </TableRow>
          ))}
      </>
    );
  };

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    fetchDevices(queryParams);
  }, [queryParams, id]);

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
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
          <Box className={classes.dropdownCommonSection}>
            <CustomDropDown
              label={t('obx.form.input.dropDown.selectDevices.label')}
              name="deviceType"
              options={devicesFilter}
              selectedValues={queryParams.deviceType}
              handleChange={inputChangedHandler}
              multiSelect={false}
              checkmark={false}
              searchable={false}
              withTiles={false}
              className={''}
            />
            <CustomDropDown
              label={t('obx.form.input.dropDown.selectSites.label')}
              name="sites"
              options={transformArrayForOptions(allSites, 'name', 'id')}
              selectedValues={queryParams.sites}
              handleChange={inputChangedHandler}
              multiSelect={true}
              checkmark={true}
              searchable={true}
              withTiles={true}
              className={''}
            />
          </Box>
        </Box>

        <Box>
          <Button variant="secondaryGrey" startIcon={<ExportUploadIcon />} disabled>
            {`${t('links.export')}`}
          </Button>
        </Box>
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
};

Devices.propTypes = {
  franchiseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Devices;
