import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Link, Tooltip } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { ReactComponent as DeleteSweetAlertIcon } from 'assets/svg/delete-modal.svg?react';
import { ReactComponent as DetailEmailIcon } from 'assets/svg/DetailEmailIcon.svg?react';
import { ReactComponent as RedirectIcon } from 'assets/svg/redirect-icon.svg?react';
import { ReactComponent as TrasIcon } from 'assets/svg/trash.svg?react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoaderComponent from 'src/app/components/common/loader';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import * as routes from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { _InputPDFDocx, Featuredicon } from 'src/assets/svg';
import { getCount, isObjectEmpty } from 'src/helper/utilityFunctions';
import { deleteAttachment, uploadAttachment } from 'src/services/attachment.service';
import { attachmentSettings, defaultImage, toastSettings } from 'src/utils/constants';
import { fomatNumbersWithCommas } from 'src/utils/currencyFormater';
import { formatISOTimestampToDate } from 'src/utils/date';
import { openFile } from 'src/utils/files';
import { formatAddress } from 'src/utils/formatAddress/formatAddress';
import capitalize from 'src/utils/string/capitalize';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import AttachmentsUpload from '../locationsAttachmentsUpload';
import { useStyles } from './detailsAccordians';
const DetailsAccordians = ({ data, setData, franchise, id }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');

  const franchiseAssociated = [
    {
      label: t('sales.locations.name'),
      value: capitalizeFirstLetter(franchise?.franchiseName) || NA,
    },
    {
      label: t('sales.locations.franchiseOwner'),
      value:
        franchise?.firstName || franchise?.lastName
          ? capitalizeFirstLetter(franchise?.firstName) +
            ' ' +
            capitalizeFirstLetter(franchise.lastName)
          : NA,
    },
    {
      label: t('sales.locations.email'),
      value: franchise?.email || NA,
    },
    {
      label: `${t('sales.locations.contact')}`,
      value: franchise?.phoneNumber || NA,
    },
    {
      label: t('sales.locations.address'),
      value:
        (franchise?.address ? `${capitalizeFirstLetter(franchise?.address)}, ` : NA) +
        (franchise?.city?.name ? `${capitalizeFirstLetter(franchise?.city?.name)}, ` : NA) +
        (franchise?.state?.name ? `${capitalizeFirstLetter(franchise?.state?.name)}, ` : NA) +
        (franchise?.zipCode ? `${franchise?.zipCode}` : NA),
    },
  ];

  // Use this array in your component
  <Box className={classes.accordionData}>
    {franchiseAssociated.map((item, index) => (
      <Box key={index} className={classes.dataColWrap}>
        <Typography className={classes.dataColmLabel}>{item.label}</Typography>
        <Box className={classes.dataColmDetail}>
          {item.label === 'Email' || item.label === 'Contact #' ? (
            <Link
              className={classes.dataLink}
              href={item.label === 'Email' ? `mailto:${item.value}` : `tel:${item.value}`}
            >
              <Typography>{item.value}</Typography>
            </Link>
          ) : (
            <Typography>{item.value}</Typography>
          )}
        </Box>
      </Box>
    ))}
  </Box>;

  const [_fileInfo, setFileInfo] = useState({ name: '', type: '', size: 0 });
  const [_isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState({ id: null, active: false });

  const handleFileChange = async (event) => {
    if (!event?.target?.files?.length) return;

    const selectedFile = event.target.files[0];
    const { name, type, size } = selectedFile;
    const sizeInMB = (size / (1024 * 1024)).toFixed(2);

    /**
     * show error if file size exce
     */
    if (sizeInMB > attachmentSettings.FILE_SIZE_LIMIT) {
      toaster.error({
        text: t('sales.commonText.fileSizeLimit'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      event.target.value = '';
      return;
    }
    const duplicateFile = data?.attachments?.some((file) => file?.fileName === name);
    if (duplicateFile) {
      toaster.error({
        text: t('sales.commonText.fileAlreadyExists'),
        position: 'top-right',
        autoClose: 2000,
      });
      event.target.value = '';
      return;
    }

    if (selectedFile) {
      setFileInfo({ name, type, size: sizeInMB });
      setIsSuccess(true);
      setIsError(false);
      setLoading(true);

      /**
       * before sending the API call insert the new fine in local state and reflect
       */

      const formData = new FormData();
      formData.append('attachableId', id);
      formData.append('attachableType', 'Lead');
      formData.append('file', selectedFile);

      try {
        const upload = await uploadAttachment(formData);
        if (upload?.statusCode === 200) {
          const newArray = [upload?.data?.attachment, ...(data?.attachments ?? [])];
          setData((prevOptions) => ({
            ...prevOptions,
            attachments: newArray,
          }));
          toaster.success({
            text: t('sales.locations.attachmentUploaded'),
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } else {
      setFileInfo({ name: '', type: '', size: 0 });
      setIsSuccess(false);
      setIsError(true);
      setLoading(false);
    }
    event.target.value = '';
  };

  const handleRedirect = (path) => {
    history.push(path);
  };

  const handleDeleteAttachment = async (id) => {
    try {
      const deleteResp = await deleteAttachment(id);
      if (deleteResp?.statusCode === 200) {
        // Filter out the attachment with the specified id
        const newArray = data?.attachments?.filter((attachment) => attachment.id !== id) ?? [];

        // Update the state with the new array
        setData((prevOptions) => ({
          ...prevOptions,
          attachments: newArray,
        }));
        toaster.success({
          text: t('sales.locations.attachmentDeleted'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setLoading(false);
        setShowDeleteModal({ id: null, active: false });
      }
    } catch (error) {
      setLoading(false);
      setShowDeleteModal({ id: null, active: false });
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box className={classes.accordianWrapper}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>{t('sales.locations.locationDetails')} </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              <Box key={`index-name`} className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.name')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{capitalizeFirstLetter(data?.locationName) || NA}</Typography>
                </Box>
              </Box>
              <Box key={`index-industry`} className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.industry')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{capitalizeFirstLetter(data?.industry) || NA}</Typography>
                </Box>
              </Box>
              {/* new colum? */}
              <Box key={`index-industry`} className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.users.parentCompany')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{data?.company?.parentCompany || NA}</Typography>
                </Box>
              </Box>
              <Box key={`index-createdBy`} className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.createdBy')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{capitalizeFirstLetter(data?.createdBy) || NA}</Typography>
                </Box>
              </Box>
              <Box key={`index-creationDate`} className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.creationDate')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>
                    {capitalizeFirstLetter(formatISOTimestampToDate(data?.creationDate)) || NA}
                  </Typography>
                </Box>
              </Box>
              <Box key={`index-lastUpdated`} className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.lastUpdated')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>
                    {capitalizeFirstLetter(formatISOTimestampToDate(data?.lastUpdated)) || NA}
                  </Typography>
                </Box>
              </Box>
              {/* new colum? */}
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.managementCompany')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{capitalizeFirstLetter(data?.managementCompany) || NA}</Typography>
                </Box>
              </Box>
              {/* new colum? */}
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.units')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{data?.numberOfUnits || NA}</Typography>
                </Box>
              </Box>
              {/* new colum? */}
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.accupancyRate')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{data?.occupancyRate ? `${data?.occupancyRate}%` : NA}</Typography>
                </Box>
              </Box>
              {/* new colum? */}
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.avgRent')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>{`$${fomatNumbersWithCommas(data?.averageRent)}` || NA}</Typography>
                </Box>
              </Box>
              <Box key={`index-address`} className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.address')}
                </Typography>
                <Box className={classes.dataColmDetail}>
                  <Typography>
                    {formatAddress(
                      capitalizeFirstLetter(data?.street),
                      capitalizeFirstLetter(data?.city),
                      capitalizeFirstLetter(data?.state),
                      data?.postalCode,
                    ) || NA}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography>{t('sales.locations.companyAccount')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {data?.company ? (
              <Box key={data?.company?.id || 1} className={classes.accordionData}>
                <Box className={classes.dataColWrap}>
                  <Typography className={classes.dataColmLabel}>
                    {t('sales.locations.name')}
                  </Typography>
                  <Box className={classes.dataColmDetail}>
                    <Typography>{capitalizeFirstLetter(data?.company?.name) || NA}</Typography>
                  </Box>
                  <RedirectIcon
                    onClick={() =>
                      handleRedirect(routes.SALES_COMPANY_DETAIL.replace(':id', data?.company?.id))
                    }
                    style={{ cursor: 'pointer', alignSelf: 'center' }}
                  />
                </Box>
                <Box className={classes.dataColWrap}>
                  <Typography className={classes.dataColmLabel}>
                    {t('sales.locations.companyOwner')}
                  </Typography>
                  <Box className={classes.dataColmDetail}>
                    <Typography>{capitalize(data?.company?.companyOwner) || NA}</Typography>
                  </Box>
                </Box>
                <Box className={classes.dataColWrap}>
                  <Typography className={classes.dataColmLabel}>
                    {t('sales.locations.contact')}
                  </Typography>
                  <Box className={classes.dataColmDetail}>
                    <Link
                      className={classes.dataLink}
                      href={`tel:${data?.company?.contact || '#'}`}
                    >
                      <Typography>{data?.company?.contact || NA}</Typography>
                    </Link>
                  </Box>
                </Box>
                <Box className={classes.dataColWrap}>
                  <Typography className={classes.dataColmLabel}>
                    {t('sales.locations.address')}
                  </Typography>
                  <Box className={classes.dataColmDetail}>
                    <Typography>
                      {formatAddress(
                        capitalizeFirstLetter(data?.company?.address),
                        capitalizeFirstLetter(data?.company?.city),
                        capitalizeFirstLetter(data?.company?.state),
                        data?.company?.postalCode,
                      ) || NA}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : (
              t('sales.locations.noCompanyLocation')
            )}
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography>
              {t('sales.locations.deals')} • {getCount(data?.deals?.length)}{' '}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              {data?.deals && data?.deals.length > 0
                ? data?.deals.map((deal, index) => (
                    <Box key={index} className={classes.dealsData}>
                      <Box className={classes.dealsDataFlex}>
                        <Typography className={classes.dataLabel}>
                          {capitalizeFirstLetter(deal?.name) || NA}
                        </Typography>
                        <RedirectIcon
                          onClick={() =>
                            handleRedirect(routes.SALES_DEAL_DETAIL.replace(':id', deal?.id))
                          }
                          style={{
                            cursor: 'pointer',
                            width: '20px',
                            height: '20px',
                            alignSelf: 'center',
                          }}
                        />
                      </Box>
                      <Typography className={classes.dataColmDetail}>
                        {t('sales.locations.amount')}: {`$${deal?.amount}` || NA}
                      </Typography>
                      <Typography className={classes.dataColmDetail}>
                        {t('sales.companies.date')}: {formatISOTimestampToDate(deal?.date) || NA} •{' '}
                        {t('sales.locations.stage')}: {deal?.stage || NA}
                      </Typography>
                    </Box>
                  ))
                : t('sales.locations.noDeals')}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography>{t('sales.locations.contacts')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              <Box key={`contact-details`} className={classes.contactWrap}>
                {data?.contact ? (
                  <>
                    <Box className={classes.contatcAvtar}>
                      <img
                        src={data?.contact?.image || defaultImage}
                        className={classes.userImage}
                      />
                    </Box>
                    <Box className={classes.contactDetails}>
                      <Typography className={classes.dataColmLabel}>
                        {data?.contact?.fullName || `${t('sales.contract.name')}: ${NA}`}
                        {data?.contact?.jobTitle ? ` • ${data?.contact?.jobTitle}` : null}
                      </Typography>
                      <Link className={classes.dataLink} href={`mailto:${data?.contact?.email}`}>
                        {data?.contact?.email ? (
                          <Typography className={classes.emailIcon}>
                            {data.contact.email} <DetailEmailIcon />
                          </Typography>
                        ) : (
                          <Typography>{`${t('sales.contacts.email')}: ${NA}`}</Typography>
                        )}
                      </Link>
                      <Link className={classes.dataLink} href={`tel:${data?.contact?.phone}`}>
                        <Typography>
                          {data?.contact?.phone || `${t('sales.contacts.phoneNumber')}: ${NA}`}
                        </Typography>
                      </Link>
                    </Box>
                  </>
                ) : (
                  t('sales.contacts.noContacts')
                )}
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography>{t('sales.locations.franchiseAssociated')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              {!isObjectEmpty(franchise) > 0
                ? franchiseAssociated.map((item, index) => (
                    <Box key={index} className={classes.dataColWrap}>
                      <Typography className={classes.dataColmLabel}>{item?.label}</Typography>
                      <Box className={classes.dataColmDetail}>
                        {item?.label === 'Email' || item?.label === 'Contact #' ? (
                          <Link
                            className={classes.dataLink}
                            href={
                              item?.label === 'Email'
                                ? `mailto:${item?.value}`
                                : `tel:${item?.value}`
                            }
                          >
                            <Typography>{item?.value}</Typography>
                          </Link>
                        ) : (
                          <Typography>{capitalizeFirstLetter(item?.value)}</Typography>
                        )}
                      </Box>
                    </Box>
                  ))
                : t('sales.deals.noAssciatedFranchiseLocation')}
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            className={classes.attachAccordian}
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography>
              {t('sales.locations.attachments')} • {getCount(data?.attachments?.length)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              {data?.attachments && data?.attachments?.length
                ? data?.attachments?.map((file) => {
                    return (
                      <Tooltip
                        className={classes.toolTipBox}
                        title={`Download ${file?.fileName}`}
                        key={file?.fileName}
                        placement="bottom"
                        arrow
                      >
                        <Box key={file.id} className={classes.attachSuccess}>
                          <Box
                            onClick={() => openFile(file?.fileName, file?.fileUrl)}
                            className={classes.attachSuccessFile}
                          >
                            <Featuredicon className={classes.attachIcons} />
                            <Box className={classes.attachNameWrap}>
                              <Typography className={classes.attachName}>
                                {file?.fileName}
                              </Typography>
                              <Typography className={classes.attachSize}>
                                {file?.fileSize}
                              </Typography>
                            </Box>
                          </Box>
                          <Box
                            className={classes.trashIconBox}
                            onClick={() => setShowDeleteModal({ id: file.id, active: true })}
                          >
                            <TrasIcon />
                          </Box>
                        </Box>
                      </Tooltip>
                    );
                  })
                : null}
              {isError && (
                <Typography variant="body1" style={{ color: 'red' }}>
                  {t('sales.commonText.inValidFile')}
                </Typography>
              )}
            </Box>
            <AttachmentsUpload
              fileUploadHandler={handleFileChange}
              acceptAttachment={attachmentSettings.ACCEPT}
            />
          </AccordionDetails>
        </Accordion>
      </Box>

      {showDeleteModal?.active && (
        <SweetAlertModal
          type="warning"
          title={t('sales.locations.areYouSureToDelete')}
          text={t('sales.locations.areYouSureToDeleteDesc')}
          cancelButtonText={t('sales.locations.cancelBtn')}
          confirmButtonText={t('sales.locations.deleteBtn')}
          show={showDeleteModal?.active}
          handleConfirmButton={() => handleDeleteAttachment(showDeleteModal?.id)}
          handleCancelButton={() => setShowDeleteModal({ id: null, active: false })}
          icon={<DeleteSweetAlertIcon />}
        />
      )}
    </>
  );
};

DetailsAccordians.propTypes = {
  data: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setData: PropTypes.func,
  franchise: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default DetailsAccordians;
