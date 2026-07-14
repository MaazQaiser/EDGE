import { Button, Chip, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { MoreVert } from 'assets/svg';
import { EditIcon } from 'assets/svg';
import { TrashIcon } from 'assets/svg';
import { ReactComponent as EyeIcon } from 'assets/svg/eye.svg?react';
import CustomDropDown from 'commonComponents/customDropDown';
import SearchComponentWithQuery from 'commonComponents/searchWithQuery';
import TableSkeleton from 'commonComponents/skeletonLoader/tableSkeleton';
import TableComponent from 'commonComponents/table';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import { toast } from 'react-toastify';
import PopoverButton from 'src/app/components/common/popoverButton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import {
  HO_COUNTRY_CONFIGURATION_CREATE,
  HO_COUNTRY_CONFIGURATION_UPDATE,
} from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { PlusIcon } from 'src/assets/svg';
import { ReactComponent as DeleteIcon } from 'src/assets/svg/delete-modal.svg?react';
import { useApiControllers } from 'src/helper/axios';
import {
  deleteCountryConfigurations,
  getCountryConfigurations,
} from 'src/services/countryConfigurations.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { countries, toastSettings } from 'src/utils/constants';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';

import { useStyles } from './countryConfigurations.styles';

const params = {
  countryName: '',
  status: {},
};

export const statuses = {
  published: 'published',
  draft: 'draft',
};

const statusFilter = (t) => {
  return [
    { value: '', label: t('ho.countryConfigurations.dropdownLabel') },
    { value: 'published', label: t('ho.countryConfigurations.published') },
    { value: 'draft', label: t('ho.countryConfigurations.draft') },
  ];
};

const i18ColumnName = (t, _hoverIconClass) => {
  return [
    {
      id: 'countryName',
      label: `${t('ho.countryConfigurations.country')}`,
      sortable: false,
      align: 'left',
    },
    {
      id: 'status',
      label: `${t('ho.countryConfigurations.status')}`,
      align: 'left',
    },
    {
      id: 'actions',
      label: `${t('ho.countryConfigurations.actions')}`,
      sortable: false,
      align: 'left',
    },
  ];
};

const columnIdsEnum = {
  countryName: 'countryName',
  status: 'status',
  actions: 'actions',
};

const CountryConfigurations = () => {
  const { t } = useTranslation();

  const NA = t('commonText.nA');

  const classes = useStyles();
  const hoverIconClass = classes.templatesTD;

  const [loading, setLoading] = useState(true);
  const [countriesData, setCountriesData] = useState([]);
  const [queryParams, setQueryParams] = useState(params);
  const { getNewApiController } = useApiControllers();
  const statusOptions = statusFilter(t);
  const columns = i18ColumnName(t, hoverIconClass);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [countryId, setCountryId] = useState(null);

  const getCountryDetails = (shortCode) => {
    const country = countries.find((c) => c.country.label === shortCode);
    return country;
  };

  // const [dropDownOptions, _setDropDownOptions] = useState(statusOptions);

  const fetchCountryConfigurations = async (params) => {
    const apiController = getNewApiController();
    try {
      setLoading(true);
      const updatedParams = {
        ...params,
        countryName: params?.countryName || '',
        status: extractValuesByKeyFromInput(queryParams.status, 'value'),
      };

      const response = await getCountryConfigurations(updatedParams, {
        signal: apiController.signal,
      });

      if (response?.statusCode === 200) {
        setCountriesData(response?.data?.countryConfigurations);
      }

      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toast.error(error?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setLoading(false);
      }
    }
  };

  const toggleDeleteModal = (id) => {
    setCountryId(id || null);
    setShowDeleteModal((a) => !a);
  };

  const deleteDraftCountry = async () => {
    try {
      setLoading(true);
      const response = await deleteCountryConfigurations(countryId);

      if (response?.statusCode === 200) {
        fetchCountryConfigurations();

        toast.success(response?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (e) {
      toast.error(e?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    history.push(HO_COUNTRY_CONFIGURATION_CREATE);
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id} align={column.align}>
              {column.sortable ? (
                <TableSortLabel>{column.label}</TableSortLabel>
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
    if (column.id === columnIdsEnum.actions) {
      return (
        <PopoverButton
          className={classes.templateActions}
          label="icon"
          variant="icon"
          Icon={MoreVert}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <Box className={classes.templateActionsMenu}>
            {row.status === statuses.published ? (
              <Link
                to={`${HO_COUNTRY_CONFIGURATION_UPDATE}/${row?.id}`}
                className={classes.templateActionsRegular}
              >
                <EyeIcon className={classes.questionBankActionsIconRegular} />
                <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
                  {t('obx.contracts.viewDetails')}
                </Typography>
              </Link>
            ) : (
              <>
                <Link
                  to={`${HO_COUNTRY_CONFIGURATION_UPDATE}/${row?.id}`}
                  className={classes.templateActionsRegular}
                >
                  <EditIcon className={classes.templateActionsIconRegular} />
                  <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
                    {t('links.edit')}
                  </Typography>
                </Link>
                <Box
                  onClick={() => {
                    toggleDeleteModal(row?.id);
                  }}
                  className={classes.templateActionsDelete}
                >
                  <TrashIcon className={classes.templateActionsIconDelete} />
                  <Typography className={classes.templateActionsTextDelete} variant="subtitle2">
                    {t('links.delete')}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </PopoverButton>
      );
    }

    if (column.id === columnIdsEnum.countryName) {
      const matchedCountry = getCountryDetails(row[column.id]);

      return (
        <Box className={classes.templatesTitle}>
          <img src={matchedCountry.country.image} className={classes.flagImage} />
          {matchedCountry.country.label}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.status) {
      return (
        <Chip
          color={row[column.id] === statuses.draft ? 'warning' : 'success'}
          label={row[column.id]}
        />
      );
    }

    return <>{row[column.id] || NA}</>;
  };

  const tableBody = (tableData, columns) => {
    return loading ? (
      <TableSkeleton numberOfRows={6} columns={columns} />
    ) : (
      <>
        <NoRecordFound data={tableData} noOfColumns={columns.length} t={t} />
        {tableData.length > 0 &&
          tableData.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align} className={column.className}>
                  {renderTableCell(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
      </>
    );
  };

  const updateFormHandler = (name, value) => {
    setQueryParams((prevState) => {
      return {
        ...prevState,
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

  const renderTableWithLoader = () => {
    // if (loading) return <LoaderComponent size={50} />;
    return (
      <TableComponent
        data={countriesData}
        tableHead={tableHead}
        columns={columns}
        tableBody={tableBody}
        pagination={false}
      />
    );
  };

  useEffect(() => {
    fetchCountryConfigurations(queryParams);
  }, [queryParams]);

  return (
    <>
      <Box className={classes.templateHeader}>
        <Box className={classes.templateHeaderLeft}>
          <SearchComponentWithQuery name="countryName" onSearch={inputChangedHandler} />

          <CustomDropDown
            label={`${t('ho.countryConfigurations.dropdownLabel')}`}
            name="status"
            options={transformArrayForOptions(statusOptions, 'label', 'value')}
            selectedValues={queryParams.status}
            handleChange={inputChangedHandler}
          />
        </Box>
        <Box className={classes.templateHeaderRight}>
          <Button onClick={handleCreate} variant="primary" startIcon={<PlusIcon />}>
            {t('ho.countryConfigurations.createNewCountry')}
          </Button>
        </Box>
      </Box>

      <Box className={classes.templateBody}>{renderTableWithLoader()}</Box>
      {showDeleteModal && (
        <SweetAlertModal
          type="warning"
          title={t('commonText.modal.areYouSure.title')}
          text={t('commonText.modal.areYouSure.desc')}
          cancelButtonText={t('buttons.no')}
          confirmButtonText={t('buttons.yes')}
          show={showDeleteModal}
          handleConfirmButton={deleteDraftCountry}
          handleCancelButton={toggleDeleteModal}
          icon={<DeleteIcon />}
        />
      )}
    </>
  );
};

export default CountryConfigurations;
