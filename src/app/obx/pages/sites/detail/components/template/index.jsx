import { Box, Button, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import { ReactComponent as Dustbin } from 'assets/svg/Dustbin.svg?react';
import { ReactComponent as EditIcon } from 'assets/svg/edit-drop.svg?react';
import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg?react';
import SearchComponentWithQuery from 'commonComponents/searchWithQuery';
import TableComponent from 'commonComponents/table';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import TableImage from 'commonComponents/tableImage';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import CustomDropDown from 'src/app/components/common/customDropDown';
import PopoverButton from 'src/app/components/common/popoverButton';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import {
  ACL_OBX_SITE_VISITOR_CREATE,
  ACL_OBX_SITE_VISITOR_LOAD_CREATE,
} from 'src/app/router/constant/OBXMODULE';
import {
  HO_TEMPLATE_CREATE,
  HO_TEMPLATE_PREVIEW,
  HO_TEMPLATE_UPDATE,
} from 'src/app/router/constant/ROUTE';
import { DeleteAlterIcon, MoreVert } from 'src/assets/svg';
import { useApiControllers } from 'src/helper/axios';
import { updateSearchParams } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useDateTime from 'src/hooks/useDateTime';
import { deleteTemplate } from 'src/services/template.services';
import { getVisitorsLoadsTemplates } from 'src/services/visitorsLoads.service';
import {
  dayjsFormatsEnum,
  defaultImage,
  paginationOptions,
  toastSettings,
} from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import { useStyles } from './templateStyles';

const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'type',
      label: `${t('obx.visitors.tables.listing.columns.reportTitle')}`,
      sortable: false,
      className: hoverIconClass,
    },

    {
      id: 'createdAt',
      label: `${t('obx.visitors.tables.listing.columns.createdAt')}`,
      sortable: false,
    },
    {
      id: 'templateableType',
      label: `${t('obx.visitors.tables.listing.columns.type')}`,
      sortable: false,
    },
    {
      id: 'createdBy',
      label: `${t('obx.visitors.tables.listing.columns.createdBy')}`,
      sortable: false,
      className: hoverIconClass,
      hasImage: true,
    },
    {
      id: 'action',
      label: `${t('obx.visitors.tables.listing.columns.action')}`,
      sortable: false,
    },
  ];
};

const columnIdsEnum = {
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  action: 'action',
  type: 'type',
  templateableType: 'templateableType',
};

const enumTypeCategory = {
  visitors: 'visitors',
  loads: 'loads',
};

const typeOptionsValues = (t) => [
  {
    id: 'checkOut',
    title: 'Check Out',
    value: 'checkOut',
    label: t(`obx.visitors.tables.listing.columns.checkOut`),
  },
  {
    id: 'checkIn',
    title: 'Check In',
    value: 'checkIn',
    label: t(`obx.visitors.tables.listing.columns.checkIn`),
  },
];

const initializeParams = (_categoryType) => {
  return {
    page: paginationOptions.defaultPerPage,
    perPage: paginationOptions.perPageRows,
    siteId: '',
    templateableType: '',
    title: '',
    types: null,
  };
};

const Template = ({ siteId, categoryType }) => {
  const { t } = useTranslation();
  const { getNewApiController } = useApiControllers();
  const history = useHistory();
  const classes = useStyles();

  const { formatDayjsDateTime } = useDateTime();
  const NA = t('commonText.nA');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [queryParams, setQueryParams] = useState(initializeParams());

  const hoverIconClass = classes.SitesTD;
  const columns = i18ColumnName(t, hoverIconClass);

  const handleCreate = () => {
    const urlParams = new URLSearchParams(location.search);
    const existingParams = urlParams.toString();
    history.push(
      `${HO_TEMPLATE_CREATE}?siteId=${siteId}&page=${categoryType}${existingParams ? `&${existingParams}` : ''}`,
    );
  };

  const inputChangedHandler = (event) => {
    const { value } = event.target;
    fetchTemplatesVisitorLoads({ value, ...queryParams });
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
  const handleSelectUpdate = (event) => {
    const { name, value } = event.target;

    const filtersArr = value?.map((filter) => filter?.value);
    const params = [
      { key: 'pageNumber', value: paginationOptions.defaultPerPage },
      { key: 'filter', value: filtersArr },
    ];
    updateSearchParams(params, history);

    updateFormHandler(name, value);
  };

  useEffect(() => {
    // if filter query params exist, select dropdown values
    const searchParams = new URLSearchParams(location.search);
    const filters = searchParams.get('filter');
    const pageNumber = searchParams.get('pageNumber');
    let perPage = searchParams.get('perPage');

    if (perPage && perPage > 100) {
      // if someone will try to put value greater than 100 in search params, this check will automatically replace that value with 100.
      updateSearchParams({ key: 'perPage', value: 100 }, history);
      perPage = 100;
    }

    let selectedDropdownValues = [];
    if (filters) {
      const templateTypeFilter = filters?.split(',');
      selectedDropdownValues = typeOptionsValues(t)?.filter((option) =>
        templateTypeFilter?.includes(option?.value),
      );
    }

    setQueryParams((a) => {
      return {
        ...a,
        page: pageNumber || a?.page,
        perPage: perPage || a?.perPage,
        types: selectedDropdownValues,
      };
    });
  }, []);

  const categoryTypeConstant = {
    checkIn: `${categoryType}CheckIn`,
    checkOut: `${categoryType}CheckOut`,
  };
  const fetchTemplatesVisitorLoads = async ({ value, ...queryParams }) => {
    const apiController = getNewApiController();
    const searchParams = new URLSearchParams(location.search);
    const filters = searchParams.get('filter');

    let templateTypeFilter = [];

    if (filters) {
      templateTypeFilter = filters?.split(',')?.map((filter) => categoryTypeConstant[filter]);
    } else if (queryParams?.types.length) {
      templateTypeFilter = queryParams?.types?.map((type) => categoryTypeConstant[type?.value]);
    } else {
      templateTypeFilter = typeOptionsValues(t)?.map((type) => categoryTypeConstant[type?.value]);
    }

    try {
      setLoading(true);
      let params = {
        ...queryParams,
        siteId: siteId,
        templateableType: templateTypeFilter,
      };
      delete params?.types;

      if (value) {
        params.title = value;
      }

      const response = await getVisitorsLoadsTemplates(params, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        setData(response.data.templates);
        setTotalRows(response?.data?.pagination?.totalCount);
        setLoading(false);
      }
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const handleEdit = (template) => {
    const urlParams = new URLSearchParams(location.search);
    const existingParams = urlParams.toString();
    history.push(
      `${HO_TEMPLATE_UPDATE}/${template?.id}?siteId=${siteId}&page=${categoryType}${existingParams ? `&${existingParams}` : ''}`,
    );
  };
  const handleAlertCancel = () => {
    setShowModal(false);
  };

  const showAlert = (template) => {
    setShowModal(true);
    setSelectedTemplate(template);
  };

  const handleDeleteTemplate = async () => {
    try {
      setLoading(true);
      setShowModal(false);
      const response = await deleteTemplate(selectedTemplate?.id);

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        setQueryParams((prev) => ({
          ...prev,
          page: 1,
        }));
      }
    } catch (error) {
      setLoading(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
      setSelectedTemplate({});
    }
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.type) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>{capitalizeFirstLetter(row.title) || NA}</Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.createdBy) {
      return (
        <Box className={classes.franchiseName}>
          <TableImage imageUrl={row[column.id].image || defaultImage} alt="" />
          <Box className={classes.franchiseNameText}>
            {capitalizeFirstLetter(row[column.id].name) || NA}
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.templateableType) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>
            {t(`obx.visitors.tables.listing.columns.${row[column.id]}`) || NA}
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.action) {
      return (
        <PopoverButton
          className={classes.visitorsActions}
          variant="icon"
          Icon={MoreVert}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <Box
            onClick={() => {
              handleEdit(row);
            }}
            className={classes.simpleList}
          >
            <EditIcon />
            <Typography className={classes.simpleListText} variant="subtitle2">
              {t('obx.visitors.edit')}
            </Typography>
          </Box>
          <Box
            onClick={() => {
              showAlert(row);
            }}
            className={classes.visitorsActionsDelete}
          >
            <Dustbin />
            <Typography className={classes.visitorsActionsTextDelete} variant="subtitle2">
              {t('obx.visitors.delete')}
            </Typography>
          </Box>
        </PopoverButton>
      );
    }

    if (column.id === columnIdsEnum.createdAt) {
      return (
        <>{formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.date })}</>
      );
    }

    return <>{row[column.id] || NA}</>;
  };
  const handlePreview = (template) => {
    const urlParams = new URLSearchParams(location.search);
    const existingParams = urlParams.toString();
    history.push(
      `${HO_TEMPLATE_PREVIEW}/${template?.id}?siteId=${siteId}&page=${categoryType}${existingParams ? `&${existingParams}` : ''}`,
    );
  };
  const openVisitorDetail = (column, row) => {
    if (column.id === 'type') {
      handlePreview(row);
    }
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns?.map((column) => (
            <TableCell key={column?.id}>
              {column?.sortable ? (
                <TableSortLabel>{column?.label}</TableSortLabel>
              ) : (
                `${column?.label}`
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
        {data.length > 0 &&
          data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  onClick={() => openVisitorDetail(column, row)}
                  className={column.className}
                >
                  {renderTableCell(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
      </>
    );
  };

  useEffect(() => {
    if (Array.isArray(queryParams?.types)) fetchTemplatesVisitorLoads(queryParams);
  }, [siteId, queryParams]);

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

  const modalText = {
    visitors: {
      title: t('ho.templates.delete.visitorTitle'),
      description: t('ho.templates.delete.visitorDescription'),
    },
    loads: {
      title: t('ho.templates.delete.loadsTitle'),
      description: t('ho.templates.delete.loadsDescription'),
    },
  };

  return (
    <Box className={classes.visitors}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.visitorsHeader}>
        <Box className={classes.visitorsHeaderSearch}>
          <SearchComponentWithQuery
            name="search"
            placeHolder={t('obx.visitorsLoadsOfficer.searchTemplateType')}
            onSearch={inputChangedHandler}
          />
          <CustomDropDown
            label={t('obx.visitors.dropdownTypeLabel')}
            name={`types`}
            options={typeOptionsValues(t)}
            selectedValues={queryParams?.types}
            handleChange={handleSelectUpdate}
            clearAll
            searchable
            checkmark
            multiSelect
          />
        </Box>
        <RenderIfHasPermission
          name={
            categoryType === enumTypeCategory.loads
              ? ACL_OBX_SITE_VISITOR_LOAD_CREATE
              : ACL_OBX_SITE_VISITOR_CREATE
          }
        >
          <Box className={classes.visitorsHeaderRight}>
            <Button
              onClick={handleCreate}
              className={classes.addBannedVisitorBtn}
              variant="primary"
              startIcon={<PlusIcon />}
            >
              {t('obx.visitors.tables.listing.columns.createNewTemplate')}
            </Button>
          </Box>
        </RenderIfHasPermission>
      </Box>
      <Box className={classes.visitorsTable}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={queryParams.page - 1}
          handleChangePage={handleChangePage}
          totalRecords={totalRows}
          rowsPerPage={queryParams?.perPage}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Box>

      <SweetAlertModal
        type="warning"
        title={modalText?.[categoryType]?.title}
        text={t('ho.templates.delete.templateDescription')}
        confirmButtonText={t('ho.templates.delete.deleteButtonText')}
        cancelButtonText={t('ho.templates.delete.cancelButtonText')}
        show={showModal}
        handleConfirmButton={handleDeleteTemplate}
        handleCancelButton={handleAlertCancel}
        reverseButtons={true}
        icon={<DeleteAlterIcon />}
      />
    </Box>
  );
};

Template.propTypes = {
  siteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  categoryType: PropTypes.string,
};

export default Template;
