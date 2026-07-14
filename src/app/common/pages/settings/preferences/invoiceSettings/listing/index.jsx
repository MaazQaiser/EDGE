import { Box, Button, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import { MoreVert } from 'assets/svg';
import { EditIcon } from 'assets/svg';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PopoverButton from 'src/app/components/common/popoverButton';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { ReactComponent as PlusIcon } from 'src/assets/svg/plus.svg?react';
import { useApiControllers } from 'src/helper/axios';
import { getSageItems } from 'src/services/invoice.services';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import CreateEditModal from '../components';
import { useStyles } from './invoiceSettings.styles';

const i18ColumnName = (t) => {
  return [
    {
      id: 'lineItemNumber',
      label: `${t('obx.settings.preferences.invoiceSettings.lineItemNumber')}`,
      sortable: false,
    },
    {
      id: 'lineItemName',
      label: `${t('obx.settings.preferences.invoiceSettings.lineItemName')}`,
      sortable: false,
    },
    {
      id: 'glGroup',
      label: `${t('obx.settings.preferences.invoiceSettings.glGroup')}`,
      sortable: false,
    },

    {
      id: 'action',
      label: `${t('obx.settings.preferences.invoiceSettings.action')}`,
      sortable: false,
    },
  ];
};

const columnIdsEnum = {
  action: 'action',
  lineItemName: 'lineItemName',
  glGroup: 'glGroup',
};

const InvoiceSettings = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const columns = i18ColumnName(t);
  const NA = t('commonText.nA');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [lineItem, setLineItem] = useState(null);
  const { getNewApiController } = useApiControllers();

  const fetchSageItems = async () => {
    const apiController = getNewApiController();
    setLoading(true);
    try {
      const response = await getSageItems();

      if (response && response?.statusCode === 200) {
        setData(response?.data?.sageItems || []);
      }
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchSageItems();
  }, []);

  const tableBody = (data, columns) => {
    return loading ? (
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.length > 0 &&
          data.map((row, index) => (
            <TableRow key={row.id}>
              {columns.map((column) => {
                return <TableCell key={column.id}>{renderTableCell(row, column, index)}</TableCell>;
              })}
            </TableRow>
          ))}
      </>
    );
  };

  const handleEditLineItem = (row) => {
    setOpenModal(true);
    setLineItem(row);
  };

  const handleCreateLineItem = () => {
    setOpenModal(true);
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.lineItemName) {
      if (row[column.id].length > 40)
        return (
          <Tooltip title={capitalizeFirstLetter(row[column.id])} arrow>
            {capitalizeFirstLetter(row[column.id]).substring(0, 40) + '...'}
          </Tooltip>
        );
      return capitalizeFirstLetter(row[column.id]);
    }

    if (column.id === columnIdsEnum.glGroup) {
      return row[column.id].label;
    }

    if (column.id === columnIdsEnum.action) {
      return (
        <>
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
              <Box
                onClick={() => handleEditLineItem(row)}
                className={classes.templateActionsRegular}
              >
                <EditIcon className={classes.templateActionsIconRegular} />
                <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
                  {t('obx.settings.preferences.invoiceSettings.editLineItem')}
                </Typography>
              </Box>
            </Box>
          </PopoverButton>
        </>
      );
    }

    return <>{row[column.id] || NA}</>;
  };

  return (
    <>
      <Box className={classes.invoiceSettings}>
        <Box className={classes.invoiceSettingsHeader}>
          <Typography variant="h4" className={classes.invoiceSettingsTitle}>
            {t('obx.settings.preferences.invoiceSettings.invoiceSettingTitle')}
          </Typography>
          <Typography variant="body2" className={classes.invoiceSettingsText}>
            {t('obx.settings.preferences.invoiceSettings.invoiceSettingDesc')}
          </Typography>
        </Box>
        <Box className={classes.invoiceSettingsBody}>
          <TableComponent data={data} columns={columns} tableBody={tableBody} pagination={false} />
        </Box>
        <Button
          disableRipple
          className={classes.notesCloseBtn}
          variant="onlyText"
          startIcon={<PlusIcon />}
          onClick={handleCreateLineItem}
        >
          {t('obx.settings.preferences.invoiceSettings.lineItemBtnText')}
        </Button>
      </Box>
      {openModal && (
        <CreateEditModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          lineItem={lineItem}
          setLineItem={setLineItem}
          fetchSageItems={fetchSageItems}
        />
      )}
    </>
  );
};

export default InvoiceSettings;
