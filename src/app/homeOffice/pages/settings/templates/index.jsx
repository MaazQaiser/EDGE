import { Button, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { ReactComponent as TrashIcon } from 'assets/icons/TrashBorderIcon.svg?react';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import SearchComponent from 'commonComponents/searchWithQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import CustomDropDown from 'src/app/components/common/customDropDown';
import LoaderComponent from 'src/app/components/common/loader';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import TableImage from 'src/app/components/common/tableImage';
import {
  HO_TEMPLATE_CREATE,
  HO_TEMPLATE_PREVIEW,
  HO_TEMPLATE_UPDATE,
} from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { useApiControllers } from 'src/helper/axios';
import { updateSearchParams } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { toaster } from 'src/utils/toast';

import { DownloadCloudIcon, PlusIcon } from '../../../../../assets/svg';
import {
  cloneTemplate,
  deleteTemplate,
  getTemplates,
} from '../../../../../services/template.services';
import { dayjsFormatsEnum, paginationOptions, toastSettings } from '../../../../../utils/constants';
import { rolesEnumWithName } from '../../../../../utils/constants';
import TableComponent from '../../../../components/common/table';
import classes from '../templates/components/templateConfirmAlert/templateConfirmAlert.module.scss';
import CloneModal from './components/cloneModal';
import TemplateActions from './components/templateActions';
import TemplateConfirmAlert from './components/templateConfirmAlert';
import { useStyles } from './templates.styles.js';

const TEMPLATE_TYPE_VALUES = {
  HOME_OFFICER: 'homeOfficer',
  FRANCHISE_OWNER: 'franchiseOwner',
};

const getTemplateTypeOptions = (t, userRoleSlug) => {
  const options = [
    { value: TEMPLATE_TYPE_VALUES.HOME_OFFICER, label: t('ho.templates.searchKeys.homeOffice') },
    { value: TEMPLATE_TYPE_VALUES.FRANCHISE_OWNER, label: t('ho.templates.searchKeys.franchise') },
  ];

  return userRoleSlug === rolesEnumWithName.franchiseOwner
    ? options.filter(({ value }) => value === TEMPLATE_TYPE_VALUES.FRANCHISE_OWNER)
    : options;
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  selectedTemplatesFilter: '',
  sortBy: '',
  orderBy: '',
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const FRANCHISE_CATEGORIES_FOR_FO = ['vehicleInspection', 'incidentReport', 'activityReport'];
const HO_CATEGORIES_FOR_FO = ['dispatch', 'activityReport'];
const CATEGORIES = [
  'equipmentInspection',
  'vehicleInspection',
  'tourReports',
  'shiftDayEndReport',
  'incidentReport',
  'dispatch',
  'activityReport',
];
const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'title',
      label: `${t('ho.templates.listing.columns.title')}`,
      sortable: false,
      align: 'left',
      className: hoverIconClass,
    },
    // {
    //   id: 'createdBy',
    //   label: `${t('ho.templates.listing.columns.createdBy')}`,
    //   sortable: false,
    //   align: 'left',
    //   hasImage: true,
    // },
    {
      id: 'createdAt',
      label: `${t('ho.templates.listing.columns.createdOn')}`,
      align: 'left',
    },
    {
      id: 'templateableType',
      label: `${t('ho.templates.listing.columns.templateType')}`,
      align: 'left',
    },
    {
      id: 'actions',
      label: '',
      sortable: false,
      align: 'right',
    },
  ];
};

const columnIdsEnum = {
  title: 'title',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  templateableType: 'templateableType',
  actions: 'actions',
};

const textHtml = (t) => {
  return (
    <Box>
      <Typography className={classes.templateConfirmAlertDescription}>
        {t('ho.templates.delete.description')}
      </Typography>
      <Typography className={classes.templateConfirmAlertDescription}>
        {t('ho.templates.delete.subDescription')}
      </Typography>
    </Box>
  );
};

const Templates = () => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const userInfo = useSelector((state) => state.user.info);
  const userRole = useSelector((state) => state.auth.userRole);
  const [loading, setLoading] = useState(true);
  const [loadingModal, setLoadingModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [queryParams, setQueryParams] = useState(params);
  const [disabled, setDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [orderState, setOrderState] = useState(order);
  const [isCloneModalOpen, setCloneModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const { getNewApiController } = useApiControllers();
  const { formatDayjsDateTime } = useDateTime();

  let options = getTemplateTypeOptions(t, userRole?.slug);

  // if (userRole?.slug == 'franchise_owner') {
  //   options.shift();
  // }

  const [dropDownOptions, _setDropDownOptions] = useState(options);
  const classes = useStyles();
  const hoverIconClass = classes.templatesTD;
  const NA = t('commonText.nA');
  const enumTemplateType = {
    equipmentInspection: t('ho.templates.create.report.dropdown.equipmentInspection'),
    vehicleInspection: t('ho.templates.create.report.dropdown.vehicleInspection'),
    tourReports: t('ho.templates.create.report.dropdown.tourReports', {
      tour: getLabel('terms', 'tour', t),
    }),
    shiftDayEndReport: t('ho.templates.create.report.dropdown.shiftDayEndReport'),
    incidentReport: t('ho.templates.create.report.dropdown.incidentReport'),
    dispatch: t('ho.templates.create.report.dropdown.dispatch'),
    activityReport: t('ho.templates.create.report.dropdown.activityReport'),
  };
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);

  const activeTab = searchParams.get('activeTab');

  const showActionsButton = (createdBy) => {
    if (userRole?.slug == TEMPLATE_TYPE_VALUES.FRANCHISE_OWNER && createdBy?.id == userInfo.id) {
      return true;
    } else if (
      userRole.slug == TEMPLATE_TYPE_VALUES.HOME_OFFICER &&
      createdBy.role == TEMPLATE_TYPE_VALUES.HOME_OFFICER
    ) {
      return true;
    }
    return false;
  };

  const columns = i18ColumnName(t, hoverIconClass);
  const handleAlertCancel = () => {
    setShowModal(false);
  };
  const showAlert = (template) => {
    setShowModal(true);
    setSelectedTemplate(template);
  };
  const handleDeleteTemplate = async () => {
    try {
      setLoadingModal(true);
      setShowModal(false);
      const response = await deleteTemplate(selectedTemplate?.id);
      setDisabled(false);

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        if (queryParams?.page == 1) {
          fetchTemplates(queryParams);
          return;
        }
        setQueryParams((prev) => ({
          ...prev,
          page: 1,
        }));
      }
    } catch (error) {
      setDisabled(false);
      setLoadingModal(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoadingModal(false);
      setSelectedTemplate({});
    }
  };

  const handleEdit = (template) => {
    history.push(`${HO_TEMPLATE_UPDATE}/${template?.id}`);
  };

  const handlePreview = (template) => {
    history.push(`${HO_TEMPLATE_PREVIEW}/${template?.id}`);
  };

  const handleCreate = () => {
    history.push(`${HO_TEMPLATE_CREATE}`);
  };

  const handleCloneModal = (template) => {
    setSelectedTemplate(template);
    setCloneModalOpen(true);
  };

  const handleClone = async (title) => {
    try {
      setLoadingModal(true);
      const response = await cloneTemplate(selectedTemplate?.id, title);
      setCloneModalOpen(false);
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setLoading(false);
        handleEdit(response?.data?.template);
      }
    } catch (error) {
      setLoadingModal(false);
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.actions) {
      return (
        <>
          {showActionsButton(row?.createdBy) && (
            <TemplateActions
              handleDelete={showAlert}
              handleCloneModal={handleCloneModal}
              handleEdit={handleEdit}
              template={row}
              disabled={disabled}
            />
          )}
        </>
      );
    }

    if (column.id === columnIdsEnum.title) {
      return (
        <Box className={classes.templatesTitle}>
          <Box className={classes.templatesTitleText}>{row[column.id] || NA}</Box>
          <Box className={classes.templatesTitleIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.createdBy) {
      if (row?.createdBy?.name) {
        return (
          <Box className={classes.templateCreator}>
            <TableImage
              imageUrl={row?.createdBy?.image}
              alt={`${t('commonText.image.alt', {
                name: `${row?.createdBy?.name}`,
              })}`}
            />
            {row?.createdBy?.name} ({row?.createdBy?.roleLabel})
          </Box>
        );
      } else {
        return <>{NA}</>;
      }
    }

    if (column.id === columnIdsEnum.createdAt) {
      return (
        <>
          {formatDayjsDateTime({
            value: row[column.id],
            formatType: dayjsFormatsEnum.date,
            bypassFranchiseTimezone: true,
          }) || NA}
        </>
      );
    }

    if (column.id === columnIdsEnum.templateableType)
      return <>{enumTemplateType[row[column.id]] || NA}</>;
    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
    }

    return <>{row[column.id] || NA}</>;
  };

  const fetchTemplates = async ({ page, perPage, search, selectedTemplatesFilter, orderBy }) => {
    const apiController = getNewApiController();
    try {
      let params = {
        page,
        perPage,
        title: search ? search : undefined,
        templateableId: '', // to be done in future
        orderBy: orderBy,
        createdBy: selectedTemplatesFilter.value ? selectedTemplatesFilter.value : undefined,
      };
      if (activeTab === 'reportTemplates') {
        let templateableType = CATEGORIES;
        if (userRole?.slug == TEMPLATE_TYPE_VALUES.FRANCHISE_OWNER) {
          if (selectedTemplatesFilter.value === 'franchiseOwner') {
            templateableType = FRANCHISE_CATEGORIES_FOR_FO;
          } else if (selectedTemplatesFilter.value === 'homeOfficer') {
            templateableType = HO_CATEGORIES_FOR_FO;
          }
        } else if (userRole?.slug == TEMPLATE_TYPE_VALUES.HOME_OFFICER) {
          if (selectedTemplatesFilter.value === 'franchiseOwner') {
            templateableType = FRANCHISE_CATEGORIES_FOR_FO;
          } else if (selectedTemplatesFilter.value === 'homeOfficer') {
            templateableType = CATEGORIES;
          }
        }

        params = { ...params, templateableType: templateableType };
      }
      const response = await getTemplates(params, { signal: apiController.signal });
      if (response?.data?.templates?.length) {
        setTemplates(response?.data?.templates);
        setTotalRows(response?.data?.pagination?.totalCount);
      } else {
        setTemplates([]);
        setTotalRows(0);
      }
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
        setTemplates([]);
      }
    }
  };

  const handleChangePage = async (_, newPage) => {
    const newPageNumber = newPage + 1;

    updateSearchParams({ key: 'pageNumber', value: newPageNumber }, history);

    setQueryParams((prev) => ({
      ...prev,
      page: newPageNumber,
    }));
  };

  const handleChangeRowsPerPage = (event) => {
    const perPage = parseInt(event.target.value, 10);

    const params = [
      { key: 'pageNumber', value: paginationOptions.defaultPerPage },
      { key: 'perPage', value: perPage },
    ];
    updateSearchParams(params, history);

    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: perPage,
    }));
  };

  useEffect(() => {
    setLoading(true);
    if (queryParams.selectedTemplatesFilter !== '') {
      fetchTemplates(queryParams);
    }
  }, [queryParams]);

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
  };

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
  const dropdownChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value
    const { name, value } = event.target;

    if (Object.keys(value).length === 0) {
      return;
    }

    const params = [
      { key: 'pageNumber', value: paginationOptions.defaultPerPage },
      { key: 'filter', value: value?.value },
    ];
    updateSearchParams(params, history);

    // Update form state against the target input field
    updateFormHandler(name, value);
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id} align={column.align} sortDirection={sortDirection(column)}>
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

  const tableBody = (tableData, columns) => {
    return loading ? (
      <TableSkeleton numberOfRows={10} columns={columns} />
    ) : (
      <>
        <NoRecordFound data={tableData} noOfColumns={columns.length} t={t} />
        {tableData.length > 0 &&
          tableData.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  className={column.className}
                  onClick={() => column.id === 'title' && handlePreview(row)}
                >
                  {renderTableCell(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
      </>
    );
  };

  const renderTableWithLoader = () => {
    // if (loading) return <LoaderComponent size={50} />;
    return (
      <TableComponent
        data={templates}
        tableHead={tableHead}
        columns={columns}
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
    );
  };

  useEffect(() => {
    const filter = searchParams.get('filter');
    const pageNumber = searchParams.get('pageNumber');
    let perPage = searchParams.get('perPage');
    const selectedOption = dropDownOptions?.find((option) => option?.value === filter) || null;

    if (pageNumber || perPage) {
      // it will be true, when coming back from preview template page or edit template page

      if (perPage && perPage > 100) {
        // if someone will try to put value greater than 100 in search params, this check will automatically replace that value with 100.
        updateSearchParams({ key: 'perPage', value: 100 }, history);
        perPage = 100;
      }
      setQueryParams((a) => {
        return {
          ...a,
          page: pageNumber || a?.page,
          perPage: perPage || a?.perPage,
        };
      });
    }

    let selectedFilterValue = '';
    if (selectedOption) {
      // it will be true, when coming back from preview template page or edit template page
      selectedFilterValue = selectedOption;
    } else if (userRole?.slug == TEMPLATE_TYPE_VALUES.FRANCHISE_OWNER) {
      selectedFilterValue = dropDownOptions[dropDownOptions.length - 1];
    } else {
      selectedFilterValue = dropDownOptions[0];
    }

    setQueryParams((a) => {
      return {
        ...a,
        selectedTemplatesFilter: selectedFilterValue,
      };
    });
  }, [userRole?.slug]);

  return (
    <>
      {loadingModal && <LoaderComponent size={50} />}
      <Box className={classes.templateHeader}>
        <Box className={classes.templateHeaderLeft}>
          <SearchComponent
            name="search"
            value={queryParams?.search}
            onSearch={inputChangedHandler}
            className={classes.templateSearch}
          />

          <CustomDropDown
            label={`${t('form.input.textField.selectOption.label')}`}
            name="selectedTemplatesFilter"
            options={dropDownOptions}
            selectedValues={queryParams?.selectedTemplatesFilter}
            handleChange={dropdownChangedHandler}
          />
        </Box>
        <Box className={classes.templateHeaderRight}>
          <Button
            disabled
            variant="secondaryGrey"
            className={classes.templateExportButton}
            startIcon={<DownloadCloudIcon />}
          >
            {`${t('links.export')}`}
          </Button>
          <Button onClick={handleCreate} variant="primary" startIcon={<PlusIcon />}>
            {t('ho.templates.create.addReportTemplate')}
          </Button>
        </Box>
      </Box>
      <Box className={classes.templateBody}>{renderTableWithLoader()}</Box>
      <TemplateConfirmAlert
        type="warning"
        title={t('ho.templates.delete.title')}
        textHtml={textHtml(t)}
        cancelButtonText={t('ho.templates.delete.cancelButtonText')}
        confirmButtonText={t('ho.templates.delete.deleteButtonText')}
        show={showModal}
        handleConfirmButton={handleDeleteTemplate}
        handleCancelButton={handleAlertCancel}
        reverseButtons={true}
        icon={<TrashIcon />}
      />
      <CloneModal
        open={isCloneModalOpen}
        handleClose={() => setCloneModalOpen(false)}
        handleClone={handleClone}
        template={selectedTemplate}
        title={t('ho.templates.clone.title')}
        titlePlaceHolder={t('ho.templates.clone.titlePlaceHolder')}
        description={t('ho.templates.clone.description')}
        titleFiledLabel={t('ho.templates.clone.titleFiledLabel')}
        cloneButtonText={t('ho.templates.clone.cloneButtonText')}
        cancelButtonText={t('ho.templates.clone.cancelButtonText')}
      />
    </>
  );
};

export default Templates;
