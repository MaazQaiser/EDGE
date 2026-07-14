import { Button, TableCell, TableRow, TableSortLabel } from '@mui/material';
import Box from '@mui/material/Box';
import { ReactComponent as TrashIcon } from 'assets/icons/TrashBorderIcon.svg?react';
import { PlusIcon } from 'assets/svg';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import SearchComponent from 'commonComponents/searchWithQuery';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getAllSites } from 'services/sites.services';
import { deleteTemplate, getTemplates, replaceTemplate } from 'services/template.services';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import {
  ACL_OBX_SITE_REPORTS_CREATE,
  ACL_OBX_SITE_REPORTS_UPDATE,
} from 'src/app/router/constant/OBXMODULE';
import {
  HO_TEMPLATE_CREATE,
  HO_TEMPLATE_PREVIEW,
  HO_TEMPLATE_UPDATE,
} from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { useApiControllers } from 'src/helper/axios';
import { updateSearchParams } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useDateTime from 'src/hooks/useDateTime';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toaster } from 'src/utils/toast';
import {
  dayjsFormatsEnum,
  paginationOptions,
  rolesEnumWithName,
  toastSettings,
} from 'utils/constants';

import ReplaceModal from './components/ReplaceModal';
import TemplateActions from './components/templateActions';
import { useStyles } from './templates.styles.js';

const templateTypeFilter = (t) => {
  return [
    { value: '', label: t('ho.templates.searchKeys.all') },
    { value: 'homeOfficer', label: t('ho.templates.searchKeys.homeOffice') },
    { value: 'franchiseOwner', label: t('ho.templates.searchKeys.franchise') },
  ];
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

const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'title',
      label: `${t('obx.templates.listing.columns.title')}`,
      sortable: false,
      align: 'left',
      className: hoverIconClass,
    },
    {
      id: 'createdAt',
      label: `${t('obx.templates.listing.columns.createdOn')}`,
      align: 'left',
    },
    {
      id: 'templateableType',
      label: `${t('obx.templates.listing.columns.templateType')}`,
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
  createdAt: 'createdAt',
  templateableType: 'templateableType',
  actions: 'actions',
};

const CATEGORIES = [
  'equipmentInspection',
  'vehicleInspection',
  'tourReports',
  'shiftDayEndReport',
  // 'incidentReport',
];

const Templates = ({ id: siteId }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const userInfo = useSelector((state) => state.user.info);
  const userRole = useSelector((state) => state.auth.userRole);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [queryParams, setQueryParams] = useState(params);
  const [disabled, setDisabled] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [orderState, setOrderState] = useState(order);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [sites, setSites] = useState([]);
  const [currentSelected, setCurrentSelected] = useState({});
  const { formatDayjsDateTime } = useDateTime();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const { getNewApiController } = useApiControllers();

  let options = templateTypeFilter(t);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  if (userRole?.slug == 'franchise_owner') {
    options.shift();
  }

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
  };

  const _showActionsButton = (createdBy) => {
    if (userRole?.slug == 'franchise_owner' && createdBy?.id == userInfo.id) {
      return true;
    } else if (userRole.slug == 'home_officer' && createdBy.role == 'home_officer') {
      return true;
    }
    return false;
  };

  const columns = i18ColumnName(t, hoverIconClass);

  const handleAlertCancel = () => {
    setShowModal(false);
  };
  const showAlert = () => {
    setShowModal(true);
  };

  const handleReplaceTemplate = async (payload) => {
    try {
      setDisabled(true);
      const body = {
        target_id: payload.template,
      };
      // const response = { statusCode: 200, payload, body };
      const response = await replaceTemplate(currentSelected.id, body);

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        fetchTemplates(queryParams);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setDisabled(false);
      handleShowReplaceModal(null);
    }
  };

  const handleDeleteTemplate = async () => {
    try {
      setLoading(true);
      // const response = { statusCode: 200, message: 'Deleted Successfully' };
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
      setLoading(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
      setShowModal(false);
      setSelectedTemplate({});
    }
  };

  const handleEdit = (template) => {
    const urlParams = new URLSearchParams(location.search);
    const existingParams = urlParams.toString();
    history.push(
      `${HO_TEMPLATE_UPDATE}/${template?.id}?siteId=${siteId}&page=site${existingParams ? `&${existingParams}` : ''}`,
    );
  };

  const handlePreview = (template) => {
    const urlParams = new URLSearchParams(location.search);
    const existingParams = urlParams.toString();
    history.push(
      `${HO_TEMPLATE_PREVIEW}/${template?.id}?siteId=${siteId}&page=site${existingParams ? `&${existingParams}` : ''}`,
    );
  };

  const handleCreate = () => {
    const urlParams = new URLSearchParams(location.search);
    const existingParams = urlParams.toString();
    history.push(
      `${HO_TEMPLATE_CREATE}?siteId=${siteId}&page=site${existingParams ? `&${existingParams}` : ''}`,
    );
  };

  const handleShowReplaceModal = (record) => {
    setCurrentSelected(record);
    setShowReplaceModal((a) => !a);
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.actions) {
      return (
        <RenderIfHasPermission name={ACL_OBX_SITE_REPORTS_UPDATE}>
          <>
            {/*{showActionsButton(row?.createdBy) && (*/}
            <TemplateActions
              handleDelete={showAlert}
              handleReplaceModal={() => handleShowReplaceModal(row)}
              handleEdit={handleEdit}
              template={row}
              disabled={disabled}
            />
            {/*)}*/}
          </>
        </RenderIfHasPermission>
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

    if (column.id === columnIdsEnum.createdAt) {
      return (
        <>
          {formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.date }) || NA}
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

  const fetchTemplates = async ({ page, perPage, search, _selectedTemplatesFilter, orderBy }) => {
    const apiController = getNewApiController();
    try {
      const response = await getTemplates(
        {
          page,
          perPage,
          title: search ? search : undefined,
          templateableId: '', // to be done in future
          orderBy: orderBy,
          // createdBy: selectedTemplatesFilter.value ? selectedTemplatesFilter.value : undefined,
          siteId: siteId,
          templateableType: CATEGORIES,
        },
        { signal: apiController.signal },
      );
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
  const fetchSites = async (queryParams) => {
    try {
      let response = await getAllSites(queryParams);

      if (response && response?.statusCode === 200) {
        const sitesOtherThanThis = response?.data?.sites?.filter((o) => o.id !== Number(siteId));
        const mappedAddress = sitesOtherThanThis.map((o) => ({
          ...o,
          address: o.address || NA,
        }));
        setSites(transformArrayForOptions(mappedAddress, 'name', 'id', 'address'));
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
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

  useEffect(() => {
    fetchSites();
  }, []);

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
        rowsPerPage={queryParams.perPage}
        totalRecords={totalRows}
        handleChangePage={handleChangePage}
        applySorting={applySorting}
        rowsPerPageOptions={paginationOptions.perPageOptions}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    );
  };

  useEffect(() => {
    const pageNumber = searchParams.get('pageNumber');
    let perPage = searchParams.get('perPage');

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

    if (userRole?.slug === rolesEnumWithName.franchise_owner.slug) {
      setQueryParams((a) => {
        return {
          ...a,
          selectedTemplatesFilter: dropDownOptions[dropDownOptions.length - 1],
        };
      });
    } else {
      setQueryParams((a) => {
        return {
          ...a,
          selectedTemplatesFilter: dropDownOptions[0],
        };
      });
    }
  }, [userRole?.slug]);

  return (
    <Box className={classes.templates}>
      <Box className={classes.templateHeader}>
        <SearchComponent
          name="search"
          value={queryParams?.search}
          onSearch={inputChangedHandler}
          className={classes.templateSearch}
        />
        <RenderIfHasPermission name={ACL_OBX_SITE_REPORTS_CREATE}>
          <Button onClick={handleCreate} variant="primary" startIcon={<PlusIcon />}>
            {t('obx.visitors.tables.listing.columns.createNewTemplate')}
          </Button>
        </RenderIfHasPermission>
      </Box>
      <Box className={classes.templateBody}>{renderTableWithLoader()}</Box>
      <SweetAlertModal
        type="warning"
        title={t('obx.templates.delete.title')}
        text={t('obx.templates.delete.description')}
        cancelButtonText={t('obx.templates.delete.cancelButtonText')}
        confirmButtonText={t('obx.templates.delete.deleteButtonText')}
        show={showModal}
        handleConfirmButton={handleDeleteTemplate}
        handleCancelButton={handleAlertCancel}
        reverseButtons={true}
        icon={<TrashIcon />}
      />
      {showReplaceModal && (
        <ReplaceModal
          sites={sites}
          showReplaceModal={showReplaceModal}
          setShowReplaceModal={setShowReplaceModal}
          onSubmit={handleReplaceTemplate}
          currentSelected={currentSelected}
          disabled={disabled}
          setDisabled={setDisabled}
        />
      )}
    </Box>
  );
};

Templates.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default Templates;
