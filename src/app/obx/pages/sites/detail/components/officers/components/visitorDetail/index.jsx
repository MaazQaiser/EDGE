import {
  Box,
  Button,
  Chip,
  TableCell,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReactComponent as BanIcon } from 'assets/svg/ban-icon.svg?react';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import {
  getSiteVisitorDetail,
  getSiteVisitorVisits,
  getSiteVisitorVisitsTypes,
} from 'src/services/sites.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import {
  BanUnban,
  defaultImage,
  paginationOptions,
  toastSettings,
  visitorLoadCategory,
  VisitorStatusEnum,
} from 'src/utils/constants';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';

const category = visitorLoadCategory.visitor;

import MultipleImageListing from 'commonComponents/multipleImages';
import PropTypes from 'prop-types';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import BanUnbanModal from 'src/app/obx/pages/sites/detail/components/visitors/components/banUnbanModal';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import useDateTime from 'src/hooks/useDateTime';
import capitalize from 'src/utils/string/capitalize';
import { toaster } from 'src/utils/toast';

import { useStyles } from './visitorDetailsStyles';
const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const columnsNames = {
  image: 'image',
  checkinDate: 'checkinDate',
  checkinTime: 'checkinTime',
  checkoutDate: 'checkoutDate',
  checkoutTime: 'checkoutTime',
};

const defaultColumns = [
  {
    id: '1',
  },
  {
    id: '2',
  },
  {
    id: '3',
  },
  {
    id: '4',
  },
  {
    id: '5',
  },
  {
    id: '6',
  },
  {
    id: '7',
  },
];

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  visitorsType: {},
};

const VisitorDetails = ({ siteId, visitorId, setShowDrawer, onSubmit, disableButton }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const NA = t('commonText.nA');
  const [visitorDetail, setVisitorDetail] = useState({});
  const { formatDayjsDateTime } = useDateTime();
  const [columns, setColumns] = useState(defaultColumns || []);

  const [data, setData] = useState([]);

  const [totalRows, setTotalRows] = useState(0);

  const [loading, setLoading] = useState(true);

  const [visitorTypeOptions, setVisitorTypeOptions] = useState([]);

  const [orderState, setOrderState] = useState(order);

  const [queryParams, setQueryParams] = useState(params);

  const [showActionModal, setShowActionModal] = useState(false);

  const fetchVisitorDetails = async (visitorTypeId) => {
    setLoading(true);
    try {
      const typeId = queryParams.visitorsType?.id
        ? extractValuesByKeyFromInput(queryParams.visitorsType, 'value')
        : visitorTypeId;
      const response = await getSiteVisitorDetail(siteId, visitorId, typeId);
      if (response?.data) {
        setVisitorDetail(response.data);
      }
      // setLoading(false);
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
    } finally {
      // setLoading(false);
    }
  };
  const fetchVisitorVisits = async (visitorTypeId, { visitorsType, ...rest }) => {
    setLoading(true);
    try {
      const params = {
        siteId,
        visitorId,
        visitorTypeId: !visitorsType?.id
          ? visitorTypeId
          : extractValuesByKeyFromInput(visitorsType, 'value'),
        ...rest,
      };
      const response = await getSiteVisitorVisits(params);
      if (response?.data?.visits) {
        setColumns(response?.data?.visits?.columns);
        setData(response?.data?.visits?.data);
        setTotalRows(response?.data?.visits?.pagination?.totalCount);
      }
      // setLoading(false);
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
    } finally {
      // setLoading(false);
    }
  };
  const fetchSiteVisitorsTypes = async (id, visitorId) => {
    try {
      setLoading(true);
      const response = await getSiteVisitorVisitsTypes(id, category, visitorId);
      if (response?.data?.visitorTypes) {
        // const allObj = {
        //   id: 'all',
        //   title: 'All Visitors',
        // };
        setVisitorTypeOptions([...response.data.visitorTypes]);
        if (!response.data.visitorTypes.length) setLoading(false);
        setQueryParams((prev) => ({
          ...prev,
          visitorsType: {
            id: response.data.visitorTypes[0]?.id,
            title: response.data.visitorTypes[0]?.title,
            value: response.data.visitorTypes[0]?.id,
            label: response.data.visitorTypes[0]?.title,
            description: '',
          },
        }));
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      // setLoading(false);
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
  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };
  const orderDirection = (column) => {
    /**
     * Determine the order direction for a column.
     *
     * @param {Object} column - The column configuration object.
     * @return {String} - The order direction ('asc' or 'desc').
     */
    return orderState.orderBy === column.id ? orderState.orderType : 'asc';
  };
  const handleSort = (columnId) => {
    const isAsc = orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, orderState?.orderType);
  };

  const transformImagesObj = (imagesArr) => {
    return imagesArr.map((image) => ({ url: image, alt: '' }));
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
  const renderTableCell = (row, column) => {
    if (column.id === columnsNames.image) {
      return (
        <>
          {row.image ? (
            <MultipleImageListing images={transformImagesObj(row?.image)} />
          ) : (
            // <TableImage imageUrl={row.images?.[0]?.url} alt={`${row.makeModelYear}'s Image`} />
            NA
          )}
        </>
        // <TableImage imageUrl={row[column.id]} alt="" />
      );
    }

    if (column.id === columnsNames.checkinDate || column.id === columnsNames.checkoutDate) {
      return (
        <>{formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.date })}</>
      );
    }

    if (column.id === columnsNames.checkinTime || column.id === columnsNames.checkoutTime) {
      return (
        <>{formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.time })}</>
      );
    }

    return <>{row[column.id]}</>;
  };
  const tableBody = (data, columns) => {
    return loading ? (
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.length > 0 &&
          data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => {
                return (
                  <TableCell key={column.id} className={column.className}>
                    {renderTableCell(row, column)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
      </>
    );
  };
  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };
  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
  };
  const closeDrawer = () => {
    setShowDrawer(false);
  };

  const handleBanUnbanModal = () => {
    setShowActionModal((a) => !a);
  };

  const TopBarNameElement = ({ data }) => (
    <>
      <Box
        className={
          data.status === VisitorStatusEnum.banned ? classes.asideHeaderBan : classes.asideHeader
        }
      >
        <Box className={classes.headerInner}>
          <Box className={classes.headerLeft}>
            <Box className={classes.profileWrapper}>
              <Box className={classes.imageWrapper}>
                <img src={!loading && data?.image ? data?.image : defaultImage} />
              </Box>

              <Box className={classes.userNamme}>
                <Typography variant="h4" className={classes.name}>
                  {capitalize(data?.name) || NA}
                  {data.status === VisitorStatusEnum.banned && (
                    <>
                      <Chip label={data.status} size="small" color="error" />
                    </>
                  )}
                </Typography>
                <Typography variant="subtitle3" className={classes.status}>
                  {data?.phoneNumber || NA}
                </Typography>
              </Box>
            </Box>
            {data.status === VisitorStatusEnum.banned && (
              <Box className={classes.banVisitorReasons}>
                <Typography className={classes.banVisitorReasonDetail} variant="body2">
                  {t('obx.visitors.tables.listing.visitorBannedOn')}{' '}
                  <strong>
                    {formatDayjsDateTime({
                      value: data.bannedAt,
                      formatType: dayjsFormatsEnum.date,
                    })}{' '}
                  </strong>
                  {t('obx.visitors.tables.listing.visitorBannedBy')}{' '}
                  <strong>{capitalize(data.bannedByName) || NA}</strong>.
                </Typography>
                <Typography className={classes.banVisitorReasonText} variant="body2">
                  {t('obx.visitors.tables.listing.reason')}:{' '}
                  {data?.banReason.length > 75 ? (
                    <Tooltip
                      slotProps={{
                        popper: {
                          modifiers: [
                            {
                              name: 'offset',
                              options: {
                                offset: [0, -14],
                              },
                            },
                          ],
                        },
                      }}
                      title={data?.banReason}
                      arrow
                    >
                      <strong>{data?.banReason.substring(0, 75) + '...'}</strong>
                    </Tooltip>
                  ) : (
                    <strong>{data?.banReason}</strong>
                  )}
                </Typography>
              </Box>
            )}
          </Box>

          <Box className={classes.visitorHeaderRight}>
            {!isObjectEmpty(data) && (
              <Button
                variant={
                  data.status !== VisitorStatusEnum.banned
                    ? 'destructiveSecondary'
                    : 'secondaryGrey'
                }
                startIcon={<BanIcon />}
                className={data.status === VisitorStatusEnum.banned ? classes.unbanBtn : ''}
                onClick={handleBanUnbanModal}
                disabled={loading}
              >
                {data.status === VisitorStatusEnum.banned
                  ? t('obx.visitors.tables.listing.unbanVisitor')
                  : t('obx.visitors.tables.listing.banVisitor')}
              </Button>
            )}
            <Button
              disableRipple
              className={classes.closeBtn}
              onClick={() => {
                closeDrawer();
              }}
            >
              <CloseIcon />
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );

  const SecondaryBarElement = () => (
    <Box className={classes.StatsWrapper}>
      <Box className={classes.statsList}>
        <Typography variant="body3" className={classes.label}>
          {t('obx.visitors.detail.lastVisit')}
        </Typography>
        <Typography variant="button" className={classes.labelData}>
          01-01-2024
        </Typography>
      </Box>
      <Box className={classes.statsList}>
        <Typography variant="body3" className={classes.label}>
          {t('obx.visitors.detail.lastCheckIn')}
        </Typography>
        <Typography variant="button" className={classes.labelData}>
          8: 09 AM
        </Typography>
      </Box>
      <Box className={classes.statsList}>
        <Typography variant="body3" className={classes.label}>
          {t('obx.visitors.detail.lastCheckout')}
        </Typography>
        <Typography variant="button" className={classes.labelData}>
          12:55 Pm
        </Typography>
      </Box>
      <Box className={classes.statsList}>
        <Typography variant="body3" className={classes.label}>
          {t('obx.visitors.detail.totalVisits')}
        </Typography>
        <Typography variant="button" className={classes.labelData}>
          12
        </Typography>
      </Box>
    </Box>
  );

  useEffect(() => {
    fetchSiteVisitorsTypes(siteId, visitorId);
  }, [siteId, visitorId]);

  useEffect(() => {
    if (visitorTypeOptions.length) {
      Promise.all([
        fetchVisitorDetails(visitorTypeOptions[0]?.id),
        fetchVisitorVisits(visitorTypeOptions[0]?.id, queryParams),
      ])
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [visitorTypeOptions, queryParams]);

  SecondaryBarElement.propTypes = {
    data: PropTypes.object,
  };

  TopBarNameElement.propTypes = {
    data: PropTypes.object,
  };

  return (
    <>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <TopBarNameElement data={visitorDetail} />
      <SecondaryBarElement data={visitorDetail} />

      <Box className={classes.dropdownWrapper}>
        <CustomDropDown
          label={`${visitorTypeOptions[0]?.title || ''}`}
          options={transformArrayForOptions(visitorTypeOptions, 'title', 'id')}
          selectedValues={queryParams?.visitorsType}
          handleChange={inputChangedHandler}
          multiple={false}
          name="visitorsType"
        />
      </Box>
      <Box className={classes.mainTableWrapper}>
        <TableComponent
          className={''}
          data={data}
          columns={(data.length > 0 && columns) || []}
          tableHead={data.length > 0 && tableHead}
          tableBody={() => tableBody(data || [], columns)}
          pagination={data.length > 0 && true}
          page={queryParams.page - 1}
          perPage={queryParams.perPage}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          applySorting={applySorting}
        />
      </Box>
      {showActionModal && (
        <>
          <BanUnbanModal
            loading={disableButton}
            showActionModal={showActionModal}
            closeActionModal={handleBanUnbanModal}
            status={
              visitorDetail.status === VisitorStatusEnum.banned ? BanUnban.ban : BanUnban.unBan
            }
            onSubmit={onSubmit}
          />
        </>
      )}
    </>
  );
};

VisitorDetails.propTypes = {
  siteId: PropTypes.number,
  visitorId: PropTypes.number,
  showDrawer: PropTypes.func,
  setShowDrawer: PropTypes.func,
  data: PropTypes.object,
  handleBanUnbanModal: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disableButton: PropTypes.bool.isRequired,
};

export default VisitorDetails;
