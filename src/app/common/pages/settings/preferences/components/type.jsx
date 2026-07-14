import AddIcon from '@mui/icons-material/Add';
import { Box, TableCell, TableRow, TableSortLabel } from '@mui/material';
import Button from '@mui/material/Button';
import SearchComponent from 'commonComponents/searchWithQuery';
import TableComponent from 'commonComponents/table';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getSettingsAttributesList, getTypes } from 'services/settings.services';
import { preferencesType } from 'src/app/common/pages/settings/constants';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import { DownloadCloudIcon } from 'src/assets/svg';
import { useApiControllers } from 'src/helper/axios';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum, paginationOptions, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import AddType from './addType';
import classes from './type.module.scss';

const perPage = paginationOptions.perPageRows;

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const params = {
  page: 1,
  perPage: perPage,
  search: '',
  sortBy: '',
  orderBy: '',
};

const Type = ({ columns, listType }) => {
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [sites, setSites] = useState([]);
  const [dynamicFormChecks, setDynamicFormChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const { formatDayjsDateTime } = useDateTime();

  const [query, setQuery] = useState(params);
  const { getNewApiController } = useApiControllers();
  const [open, setOpen] = useState(false);
  const [typeId, setTypeId] = useState(null);

  const franchiseId = useSelector((state) => state?.auth?.franchiseId);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setTypeId(null);
  };

  const openTypeModel = () => {
    setTypeId(null);
    handleOpen();
  };

  const fetchTypes = async (queryParams) => {
    const apiController = getNewApiController();
    try {
      setLoading(true);
      const response = await getTypes(
        franchiseId,
        { ...queryParams, category: listType?.value },
        { signal: apiController.signal },
      );

      if (response?.statusCode === 200) {
        const data = response?.data?.visitorTypes?.map((a) => {
          return {
            ...a,
            associatedSites: a?.sites?.map((b) => b.name),
          };
        });

        setData(data);
        setTotalRows(response?.data?.pagination?.totalCount);
      }

      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toaster.error({
          text: error,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setLoading(false);
      }
    }
  };

  const getFormFields = async () => {
    try {
      setLoading(true);
      const queryParam = {
        category: listType?.value,
      };
      const response = await getSettingsAttributesList(franchiseId, queryParam);

      if (response.statusCode === 200) {
        const data = response?.data?.defaultSettings.map((data) => {
          return {
            ...data,
            key: data?.key,
            isChecked: data?.value,
            isDisabled: data?.required,
          };
        });

        const sitesData = response?.data?.sites.map((site) => {
          return {
            label: site?.name,
            key: site?.id,
            value: site?.id,
            id: site?.id,
          };
        });

        setSites(sitesData);

        setDynamicFormChecks(data);
        fetchTypes(query);
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
    setPage(newPage);
    const params = {
      ...query,
      page: newPage + 1,
      perPage: perPage,
    };
    setQuery(params);
    await fetchTypes(params);
  };

  const handleChangeRowsPerPage = async (event) => {
    const params = {
      ...query,
      page: 1,
      perPage: parseInt(event.target.value, 10),
    };
    setQuery(params);

    await fetchTypes(params);
  };

  const renderTableCell = (row, column) => {
    if (column.id === 'associatedSites') {
      const associatedSites = row[column.id];
      if (associatedSites.length > 2) {
        return (
          <>
            <Box className={classes.associatedSites}>
              <Box className={classes.associatedSitesItem}>{associatedSites[0]}</Box>
              <Box className={classes.associatedSitesItem}>{associatedSites[1]}</Box>
              <Box className={classes.associatedSitesNo}>+{associatedSites.length - 2}</Box>
            </Box>
            {/* {associatedSites.slice(0, 2).join(' ')} +{associatedSites.slice(2).length} */}
          </>
        );
      } else if (associatedSites?.length) {
        return (
          <Box className={classes.associatedSites}>
            {associatedSites.map((a) => {
              return (
                <Box key={a} component="span" className={classes.associatedSitesItem}>
                  {a}
                </Box>
              );
            })}
          </Box>
        );
      }
    }

    if (column.id === 'createdOn') {
      return (
        <>{formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.dateTime })}</>
      );
    }
    if (column.id === 'title') {
      return <div>{row[column.id]}</div>;
    }

    return <>{row[column.id]}</>;
  };

  const openEditModel = (id) => {
    setTypeId(id);
    handleOpen();
  };

  const [orderState, setOrderState] = useState(order);

  /**
   * Handle column sorting.
   *
   * @param {String} columnId - The ID of the column being sorted.
   */
  const handleSort = (columnId) => {
    const isAsc = orderState.orderBy === columnId && orderState.orderType === 'asc';
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
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.map((row) => (
          <TableRow
            onClick={() => {
              openEditModel(row.id);
            }}
            key={row.id}
          >
            {columns.map((column) => (
              <TableCell key={column.id}>{renderTableCell(row, column)}</TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  };

  // This function handles the search logic
  const handleSearch = async (event) => {
    const params = {
      ...query,
      page: page + 1,
      perPage: perPage,
      search: event.target.value,
    };

    setQuery(params);
    await fetchTypes(params);
  };

  const applySorting = async (sortBy, orderBy) => {
    const params = {
      ...query,
      page: page + 1,
      perPage: perPage,
      sortBy: sortBy,
      orderBy: orderBy,
    };
    setQuery(params);
    await fetchTypes(params);
  };

  useEffect(() => {
    getFormFields();
  }, []);

  const typeText =
    listType.value === preferencesType.LOAD_TYPE.value
      ? t('obx.settings.preferences.visitorTypes.addLoadType')
      : t('obx.settings.preferences.visitorTypes.addVisitorType');

  return (
    <Box className={classes.type}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.typeHeader}>
        <Box className={classes.typeSearch}>
          <SearchComponent name="search" onSearch={handleSearch} />
        </Box>
        <Box className={classes.typeBtns}>
          <Button variant="secondaryGrey" startIcon={<DownloadCloudIcon />}>
            {t('obx.settings.preferences.visitorTypes.export')}
          </Button>
          <Button
            onClick={openTypeModel}
            disabled={loading}
            variant="primary"
            startIcon={<AddIcon />}
          >
            {typeText}
          </Button>
          {open && (
            <AddType
              listType={listType}
              handleClose={handleClose}
              handleOpen={handleOpen}
              open={open}
              id={typeId}
              refreshData={() => {
                const params = {
                  ...query,
                  page: 1,
                  perPage: perPage,
                };
                fetchTypes(params);
              }}
              formCheckFields={dynamicFormChecks}
              sitesData={sites}
            />
          )}
        </Box>
      </Box>
      <TableComponent
        data={data}
        columns={columns}
        tableHead={tableHead}
        tableBody={tableBody}
        pagination={true}
        page={page}
        totalRecords={totalRows}
        handleChangePage={handleChangePage}
        applySorting={applySorting}
        rowsPerPage={query.perPage}
        rowsPerPageOptions={paginationOptions.perPageOptions}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Box>
  );
};

Type.propTypes = {
  columns: PropTypes.array,
  listType: PropTypes.string,
};

export default Type;
