import { Box, Button, Typography } from '@mui/material';
import { SignalIcon } from 'assets/svg';
import classNames from 'classnames';
import { t } from 'i18next';
import PropTypes from 'prop-types';
import React from 'react';
import { ACL_OBX_INVOICES_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { ReactComponent as PlusIcon } from 'src/assets/svg/plus.svg?react';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';

import LineItemTable from './listing';
import { useStyles } from './previewInvoiceDrawer';

const PreviewInvoiceDrawer = ({ setShowDrawer }) => {
  const classes = useStyles();

  const closeDrawer = () => {
    setShowDrawer(false);
  };

  return (
    <Box className={classes.drawerWrapper}>
      <Box className={classes.headerArea}>
        <SignalIcon className={classes.signalLogo} />
        <Box className={classes.headerWrapper}>
          <Box className={classes.headerCol}>
            <Typography variant="subtitle1"> {t('obx.invoice.billFrom')}</Typography>
            <Typography variant="subtitle1"> Signal 88, LLC.</Typography>
            <Typography variant="body2">PO Box 8246</Typography>
            <Typography variant="body2">Omaha, NE 68108</Typography>
            <Typography variant="body2">
              {t('obx.invoice.email')} remittance@teamsignal.com
            </Typography>
          </Box>
          <Box className={classes.headerCol}>
            <Typography variant="subtitle1"> {t('obx.invoice.billTo')}</Typography>
            <Typography variant="subtitle1">Fremont Opera House</Typography>
            <Typography variant="body2">14508 Owen Tech Blvd Austin, TX 78728</Typography>
            <Typography variant="body2">
              {t('obx.invoice.contactPerson')} Contact Person: John Hairgrove
            </Typography>
            <Typography variant="body2">{t('obx.invoice.phone')} (512) 251-4900</Typography>
            <Typography variant="body2">
              {t('obx.invoice.email')} john.hairgrove@teamsignal.com
            </Typography>
          </Box>
          <Box className={classes.headerCol}>
            <Typography variant="subtitle1"> {t('obx.invoice.invoiceNumber')}</Typography>
            <Typography variant="body2">US-12345-CA-7873</Typography>
          </Box>
        </Box>
      </Box>
      <Box className={classes.contentArea}>
        <Box className={classes.fieldColms}>
          <Box className={classes.colmData}>
            <Typography variant="subtitle1"> {t('obx.invoice.contractDetails')}</Typography>
          </Box>
          <Box className={classes.colmData}>
            <Typography variant="subtitle2"> {t('obx.invoice.invoiceNumber')}</Typography>
            <Typography variant="body2">Fremont Opera House</Typography>
          </Box>
          <Box className={classes.colmData}>
            <Typography variant="subtitle2"> {t('obx.invoice.contract')}</Typography>
            <Typography variant="body2">Q1-2024</Typography>
          </Box>
        </Box>
        <Box className={classNames(classes.fieldColms, classes.padTop)}>
          <Box className={classes.colmData}>
            <Typography variant="subtitle1"> {t('obx.invoice.billingDetails')}</Typography>
          </Box>
          <Box className={classes.colmData}>
            <Typography variant="subtitle2"> {t('obx.invoice.invoiceGenerated')}</Typography>
            <Typography variant="body2">12/12/2024</Typography>
          </Box>
          <Box className={classes.colmData}>
            <Typography variant="subtitle2"> {t('obx.invoice.dueDate')}</Typography>
            <Typography variant="body2">12/12/2024</Typography>
          </Box>
          <Box className={classes.colmData}>
            <Typography variant="subtitle2"> {t('obx.invoice.invoiceDuration')}</Typography>
            <Typography variant="body2">12/12/2024 to 12/12/2024</Typography>
          </Box>
        </Box>
        <Box className={classes.tableWrapper}>
          <LineItemTable />
          <Button
            disableRipple
            className={classes.notesCloseBtn}
            variant="onlyText"
            startIcon={<PlusIcon />}
          >
            {t('obx.invoice.lineItem')}
          </Button>
        </Box>
        <Box className={classes.footerColms}>
          <Box className={classes.inlineTD}>
            <Typography variant="subtitle2"> {t('obx.invoice.lineItems')}</Typography>
            <Typography variant="subtitle1">$0.00</Typography>
          </Box>
          <Box className={classes.inlineTD}>
            <Typography variant="subtitle2"> {t('obx.invoice.taxes')}</Typography>
            <Typography variant="subtitle1">TBD</Typography>
          </Box>
          <Box className={classes.inlineTD}>
            <Typography variant="subtitle2"> {t('obx.invoice.grandTotal')}</Typography>
            <Typography variant="subtitle1">TBD</Typography>
          </Box>
        </Box>
      </Box>
      <Box className={classes.footerArea}>
        <Button
          variant="secondaryGrey"
          onClick={() => {
            closeDrawer();
          }}
        >
          {t('obx.invoice.cancel')}
        </Button>
        <RenderIfHasPermission name={ACL_OBX_INVOICES_UPDATE}>
          <Button variant="primary">{t('obx.invoice.save')}</Button>
        </RenderIfHasPermission>
      </Box>
    </Box>
  );
};
PreviewInvoiceDrawer.propTypes = {
  setShowDrawer: PropTypes.func,
  data: PropTypes.object,
};
export default PreviewInvoiceDrawer;
