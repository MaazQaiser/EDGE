import { Box, Button, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import ReportProblemImage from 'assets/images/report-problem.png';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import { ReactComponent as EnvalopIcon } from 'assets/svg/EnvalopIcon.svg?react';
import { ReactComponent as TickIcon } from 'assets/svg/TickIcon.svg?react';
import classNames from 'classnames';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import SearchComponentWithQuery from 'commonComponents/searchWithQuery';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getListOfProblems, getStatusEnum } from 'services/faqs.services';
import CustomDropDown from 'src/app/components/common/customDropDown';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import ReportHeader from 'src/app/public/pages/problemReported/Components/header';
import { PROBLEMS_REPORTED_DETAILS } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { useApiControllers } from 'src/helper/axios';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum, paginationOptions } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { truncateString } from 'src/utils/string/truncate';

import CredentialsModal from './Components/credentialsModal';
import EmailModal from './Components/emailModal';
import { useStyles } from './ProblemReported';

const i18ColumnName = (t, classDealName) => {
  return [
    {
      id: 'ticketId',
      label: `${t('reportProblem.id')}`,
      sortable: false,
    },
    {
      id: 'title',
      label: `${t('reportProblem.titleDescription')}`,

      hasImage: true,
      className: classDealName,
    },
    {
      id: 'email',
      label: `${t('reportProblem.submittedBy')}`,
      sortable: false,
    },
    {
      id: 'createdAt',
      label: `${t('reportProblem.date')}`,
      sortable: false,
    },
    {
      id: 'status',
      label: `${t('reportProblem.status')}`,
      sortable: false,
    },
    {
      id: 'action',
      label: `${t('reportProblem.action')}`,
      sortable: false,
    },
  ];
};

const i18Statuses = (t) => [
  { label: `${t('reportProblem.statuses.all')}`, value: 'all' },
  { label: `${t('reportProblem.statuses.toDo')}`, value: '0' },
  { label: `${t('reportProblem.statuses.inProgress')}`, value: '1' },
  { label: `${t('reportProblem.statuses.cancelled')}`, value: '2' },
  { label: `${t('reportProblem.statuses.resolved')}`, value: '3' },
];

const _dummyData = [
  {
    id: 2300,
    titleDescription: 'Unable to locate alert button',
    submittedBy: 'john.doe@example.com',
    date: '02-25-2024, 05:30 PM',
    status: 'In Progress',
    action: 'Send Email',
  },
  {
    id: 2213,
    titleDescription: 'Error received on file upload',
    submittedBy: 'john.doe@example.com',
    date: '02-25-2024, 05:30 PM',
    status: 'Resolved',
    action: 'Send Email',
  },
  {
    id: 2300,
    titleDescription: 'Unable to locate alert button',
    submittedBy: 'john.doe@example.com',
    date: '02-25-2024, 05:30 PM',
    status: 'To Do',
    action: 'Send Email',
  },
  {
    id: 2213,
    titleDescription: 'Error received on file upload',
    submittedBy: 'john.doe@example.com',
    date: '02-25-2024, 05:30 PM',
    status: 'Won’t Do',
    action: 'Send Email',
  },
  // Add more objects as needed
];

const statusValues = {
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  TO_DO: 'To Do',
  DEFERRED: 'Deferred',
};

const _statusColorClassesMethod = (classes) => {
  return {
    [statusValues.IN_PROGRESS]: classes.brandColor,
    [statusValues.RESOLVED]: classes.greenColor,
    [statusValues.TO_DO]: classes.orangeColor,
    [statusValues.DEFERRED]: classes.alertColor,
  };
};

const today = dayjs();
const sixtyDaysEarlier = today.subtract(60, 'day');

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const columnIdsEnum = {
  title: 'title',
  status: 'status',
  action: 'action',
  createdAt: 'createdAt',
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  status: {},
  startDate: '',
  endDate: '',
  selectedDates: [sixtyDaysEarlier, today],
  // more filters
  // ...emptyState,
};

const ProblemReported = () => {
  const classes = useStyles();

  const { getNewApiController } = useApiControllers();

  const [data, setData] = useState([]);
  const [queryParams, setQueryParams] = useState(params);
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const classDealName = classes.locationTD;
  const columns = i18ColumnName(t, classDealName);
  const _statusOptions = i18Statuses(t);
  const { formatDayjsDateTime } = useDateTime();

  const [openModal, setOpenModal] = useState(true);
  const _handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  // const statusColorClasses = statusColorClassesMethod(classes);

  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [statusOptionsBE, setStatusOptionsBE] = useState([]);

  const [currentSelected, setCurrentSelected] = useState({});

  // const [devUser, setDevUser] = useState({});

  const getStatusObject = (status) => {
    return statusOptionsBE?.find((option) => option?.label === status) || statusOptionsBE[0];
  };

  const getStatusClass = (status) => {
    const found = getStatusObject(status);
    // statusOptionsBE?.find((option) => option?.label === status) || statusOptionsBE[0];

    switch (found?.value) {
      case 0:
        return classes.orangeColor;
      case 1:
        return classes.brandColor;
      case 2:
        return classes.alertColor;
      case 3:
        return classes.greenColor;
      default:
        return classes.orangeColor;
    }
  };

  const toggleModal = (data) => {
    setCurrentSelected(data || null);
    setOpen((a) => !a);
  };

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value, 10),
    }));
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const gotoDetailPage = (rowId) => {
    history.push(`${PROBLEMS_REPORTED_DETAILS}/${rowId}`);
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.title) {
      return (
        <>
          {row?.title ? (
            <Box className={classes.locationName} onClick={() => gotoDetailPage(row?.id)}>
              <Box className={classes.inlineFlex}>
                <Typography className={classes.headText} variant="subtitle2">
                  {truncateString(capitalizeFirstLetter(row?.title), 30)}
                </Typography>
                <Typography className={classes.subText} variant="body3">
                  {removeHTML(row?.description)}
                </Typography>
              </Box>
              <Box className={classes.locationNameIcon}>
                <ChevronRight />
              </Box>
            </Box>
          ) : (
            NA
          )}
        </>
      );
    }
    if (column.id === columnIdsEnum.status) {
      const statusColorClass = getStatusClass(row[column.id]);

      return (
        <Box component="span" className={classNames(classes.commonStatusColor, statusColorClass)}>
          {row[column.id]}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.createdAt) {
      return (
        <>{formatDayjsDateTime({ value: row?.createdAt, formatType: dayjsFormatsEnum.date })}</>
      );
    }

    if (column.id === columnIdsEnum.action) {
      return (
        <Box className={classNames(classes.sendEmails, classes.notSendEmail)}>
          {Number(getStatusObject(row?.status)?.value) === 0 ||
          Number(getStatusObject(row?.status)?.value) === 1 ? (
            !row?.emailSent ? (
              <Button
                onClick={() => toggleModal(row)}
                disableRipple
                variant="onlyText"
                startIcon={<EnvalopIcon />}
                className={classes.sendEmail}
              >
                {t('reportProblem.SendEmail')}
              </Button>
            ) : (
              <Box className={classes.disbaleEmail}>
                <TickIcon />
                {t('reportProblem.EmailSent')}
              </Box>
            )
          ) : (
            <Button
              disableRipple
              variant="onlyText"
              startIcon={<EnvalopIcon />}
              className={classes.sendEmailDisabled}
            >
              {t('reportProblem.SendEmail')}
            </Button>
          )}
        </Box>
      );
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
    const isAsc = orderState.orderBy === columnId && orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, orderState.orderType);
  };
  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
      page: paginationOptions.defaultPerPage,
    }));
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
  const tableBody = (data, i18ColumnName) => {
    return loading ? (
      <TableSkeleton columns={i18ColumnName} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={i18ColumnName.length} t={t} />
        {data?.length > 0 &&
          data.map((row) => (
            <TableRow key={row.id}>
              {i18ColumnName.map((column) => {
                return (
                  <TableCell className={column.className} key={column.id}>
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

  const removeHTML = (htmlString) => {
    const str = htmlString.replace(/<[^>]*>/g, '');
    return truncateString(str, 25);
  };

  const listProblems = async (queryParams) => {
    const apiController = getNewApiController();

    try {
      setLoading(true);
      const updatedParams = {
        ...queryParams,
        // zones: params?.zones.map((a) => a?.value),
        // status: params?.status?.value || '',
        status: queryParams.status?.value !== 'all' ? queryParams.status?.value : '',
        startDate: queryParams.selectedDates[0]
          ? dayjs(queryParams.selectedDates[0]).format('MM-DD-YYYY')
          : '',
        endDate: queryParams.selectedDates[1]
          ? dayjs(queryParams.selectedDates[1]).format('MM-DD-YYYY')
          : '',
      };

      delete updatedParams.selectedDates;

      const response = await getListOfProblems(updatedParams, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        setLoading(false);
        setData(response?.data?.supportTickets);
        const total = response?.data?.pagination?.totalCount;
        setTotalRows(total);
      }
    } catch (e) {
      if (!apiController.signal.aborted) {
        // TODO: handle abort controller
        setLoading(false);
      }
    }
  };

  const getStatusesList = async () => {
    const apiController = getNewApiController();

    try {
      const response = await getStatusEnum();
      if (response?.statusCode === 200) {
        setStatusOptionsBE([
          { label: `${t('reportProblem.statuses.all')}`, value: 'all' },
          ...(response?.data || []),
        ]);
      }
    } catch (e) {
      if (!apiController.signal.aborted) {
        // TODO: handle abort controller
        setLoading(false);
      }
    }
  };

  const checkIfDevLoggedIn = () => {
    // Check for existing user data in localStorage when the component mounts
    const devUserStored = localStorage.getItem('devLogin');

    if (devUserStored) {
      setOpenModal(false);
    }
  };

  // Add event listener to clear user data from localStorage on page reload or close
  const handleBeforeUnload = () => {
    localStorage.removeItem('devLogin');
  };

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);

    checkIfDevLoggedIn();
    getStatusesList();
    listProblems(queryParams);

    // Cleanup: remove event listener when the component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [queryParams]);

  return (
    <Box className={classes.reportProblem}>
      {openModal && <CredentialsModal open={openModal} handleClose={handleClose} />}

      <ReportHeader />
      <Box className={classes.mainWrapper}>
        <Box className={classes.ProblemBanner}>
          <Box className={classNames(classes.BannerWidth, classes.flexContainer)}>
            <Box>
              <Typography className={classes.primaryColor} variant="h1">
                {`${t('reportProblem.problemsReported')}`}
              </Typography>
              <Typography className={classes.subHeading} variant="body2">
                {`${t('reportProblem.problemsReportedText')}`}
              </Typography>
            </Box>

            <img src={ReportProblemImage} className={classes.faqImage} />
          </Box>
        </Box>
        <Box className={classes.pageWidth}>
          <Box className={classNames(classes.flexContainer, classes.filterBar)}>
            <Box className={classes.leftContent}>
              <SearchComponentWithQuery
                // placeHolder={`${t('reportProblem.search')}`}
                className="searchWidth"
                onSearch={inputChangedHandler}
                name={'search'}
                value={queryParams?.search}
              />
              <Box>
                <CustomDropDown
                  enableForceClose={false}
                  name={`status`}
                  label={`${t('reportProblem.allStatus')}`}
                  // placeHolder={`${t('reportProblem.allStatus')}`}
                  options={statusOptionsBE}
                  selectedValues={queryParams.status}
                  handleChange={inputChangedHandler}
                  bordered
                />
              </Box>
            </Box>

            <Box className={classes.DateRangePickerClass}>
              <DateRangePicker
                selectedDates={queryParams?.selectedDates}
                setDates={(dates) => {
                  setQueryParams((prevState) => {
                    return {
                      ...prevState,
                      page: paginationOptions.defaultPerPage,
                      selectedDates: dates,
                    };
                  });
                }}
                format={'MM/DD/YYYY'}
                placeHolder={'MM/DD/YYYY - MM/DD/YYYY'}
                maxDate={dayjs()}
              />
            </Box>
          </Box>
          <Box className={classes.tableWrapper}>
            <TableComponent
              data={data}
              columns={columns}
              tableHead={tableHead}
              tableBody={tableBody}
              pagination={true}
              page={queryParams.page - 1}
              totalRecords={totalRows}
              handleChangePage={handleChangePage}
              applySorting={applySorting}
              rowsPerPage={queryParams.perPage}
              rowsPerPageOptions={paginationOptions.perPageOptions}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </Box>
        </Box>
      </Box>
      {open && (
        <EmailModal
          data={currentSelected}
          open={open}
          handleClose={toggleModal}
          // refreshData={listProblems}
          refreshData={() => {
            listProblems(params);
          }}
        />
      )}
    </Box>
  );
};

export default ProblemReported;
