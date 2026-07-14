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

import AttachmentsUpload from '../dealsAttachmentsUpload';
import { useStyles } from './dealsAccordians';

const DealsDetailsAccordians = ({ data, setData, id }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const [_fileInfo, setFileInfo] = useState({ name: '', type: '', size: 0 });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [_loading, setLoading] = useState(false);
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

      const formData = new FormData();
      formData.append('attachableId', id);
      formData.append('attachableType', 'Deal');
      formData.append('file', selectedFile);

      try {
        const upload = await uploadAttachment(formData);
        if (upload?.statusCode === 200) {
          const newArray = [upload?.data?.attachment, ...(data?.attachments ?? [])];
          setData((prevOptions) => ({
            ...prevOptions,
            attachments: newArray,
          }));
          setIsSuccess(false);
          toaster.success({
            text: t('sales.locations.attachmentUploaded'),
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
      } catch (error) {
        setIsSuccess(false);
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
    }
    event.target.value = '';
  };

  const { company = {}, location = {}, contact = {}, franchise = {} } = data;

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
      {isSuccess && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box className={classes.accordianWrapper}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>{t('sales.deals.aboutThis')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.name')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {capitalizeFirstLetter(data?.dealName) || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.amount')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {data?.amount && data?.amount > 0 ? `$${data?.amount}` : NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.dealOwner')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {capitalize(data?.owner?.name) || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.createdBy')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {capitalize(data?.createdBy || NA)}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.creationDate')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {formatISOTimestampToDate(data?.createdAt) || NA}
                </Typography>
              </Box>
              <Box className={classes.dataColWrap}>
                <Typography className={classes.dataColmLabel}>
                  {t('sales.locations.lastUpdated')}
                </Typography>
                <Typography className={classes.dataColmDetail}>
                  {formatISOTimestampToDate(data?.updatedAt) || NA}
                </Typography>
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
            <Box className={classes.accordionData}>
              {!isObjectEmpty(company) ? (
                <>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.name')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{capitalizeFirstLetter(company?.name) || NA}</Typography>
                    </Box>
                    <RedirectIcon
                      onClick={() =>
                        handleRedirect(routes.SALES_COMPANY_DETAIL.replace(':id', company?.id))
                      }
                      style={{ cursor: 'pointer', alignSelf: 'center' }}
                    />
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.companies.companyOwner')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{capitalize(company?.companyOwner) || NA}</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.contact')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Link className={classes.dataLink} href={`tel:${company?.contact}`}>
                        <Typography>{company?.contact || NA}</Typography>
                      </Link>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.email')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Link className={classes.dataLink} href={`mailto:${company?.email}`}>
                        {company?.email ? (
                          <Typography className={classes.emailIcon}>
                            {company.email} <DetailEmailIcon />
                          </Typography>
                        ) : (
                          NA
                        )}
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
                          capitalizeFirstLetter(company?.address),
                          capitalizeFirstLetter(company?.city),
                          capitalizeFirstLetter(company?.state),
                          company?.postalCode,
                        ) || NA}
                      </Typography>
                    </Box>
                  </Box>
                </>
              ) : (
                <>{t('sales.deals.noCompanyDeals')}</>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography>{t('sales.deals.location')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionData}>
              {!isObjectEmpty(location) ? (
                <>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.name')}
                    </Typography>
                    <Typography className={classes.dataColmDetail}>
                      {capitalizeFirstLetter(location?.name) || NA}
                    </Typography>
                    <RedirectIcon
                      onClick={() =>
                        handleRedirect(routes.SALES_LOCATION_DETAIL.replace(':id', location?.id))
                      }
                      style={{ cursor: 'pointer', alignSelf: 'center' }}
                    />
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.companies.industry')}
                    </Typography>
                    <Typography className={classes.dataColmDetail}>
                      {capitalizeFirstLetter(location?.industry) || NA}
                    </Typography>
                  </Box>
                  <Box key={`index-industry`} className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.users.parentCompany')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{company?.parentCompanyName || NA}</Typography>
                    </Box>
                  </Box>
                  <Box key={`index-createdBy`} className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.createdBy')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{capitalizeFirstLetter(location?.createdBy) || NA}</Typography>
                    </Box>
                  </Box>
                  <Box key={`index-creationDate`} className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.creationDate')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>
                        {capitalizeFirstLetter(formatISOTimestampToDate(location?.createdAt)) || NA}
                      </Typography>
                    </Box>
                  </Box>
                  <Box key={`index-lastUpdated`} className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.lastUpdated')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>
                        {capitalizeFirstLetter(formatISOTimestampToDate(location?.updatedAt)) || NA}
                      </Typography>
                    </Box>
                  </Box>
                  {/* new colum? */}
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.managementCompany')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>
                        {capitalizeFirstLetter(location?.managementCompany) || NA}
                      </Typography>
                    </Box>
                  </Box>
                  {/* new colum? */}
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.units')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>{location?.numberOfUnits || NA}</Typography>
                    </Box>
                  </Box>
                  {/* new colum? */}
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.accupancyRate')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>
                        {location?.occupancyRate ? `${location?.occupancyRate}%` : NA}
                      </Typography>
                    </Box>
                  </Box>
                  {/* new colum? */}
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.avgRent')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Typography>
                        {`$${fomatNumbersWithCommas(location?.averageRent)}` || NA}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.address')}
                    </Typography>
                    <Typography className={classes.dataColmDetail}>
                      {formatAddress(
                        capitalizeFirstLetter(location?.address),
                        capitalizeFirstLetter(location?.city),
                        capitalizeFirstLetter(location?.state),
                        location?.postalCode,
                      ) || NA}
                    </Typography>
                  </Box>
                  {/* <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.deals.source')}
                    </Typography>
                    <Typography className={classes.dataColmDetail}>
                      {location?.source || NA}
                    </Typography>
                  </Box> */}
                  {/* commentyed because it's not in figma and not removed because in case if neded in future */}
                  {/* <Box className={classes.dataColWrap}>
              <Typography className={classes.dataColmLabel}>{t('sales.locations.type')}</Typography>
              <Typography className={classes.dataColmDetail}>{location?.type || NA}</Typography>
            </Box> */}
                  {/* <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.level')}
                    </Typography>
                    <Typography className={classes.dataColmDetail}>
                      {location?.level || NA}
                    </Typography>
                  </Box> */}
                </>
              ) : (
                <>{t('sales.deals.noLocation')}</>
              )}
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
                {!isObjectEmpty(contact) ? (
                  <>
                    <Box className={classes.contatcAvtar}>
                      <img src={contact?.image || defaultImage} className={classes.userImage} />
                    </Box>
                    <Box className={classes.contactDetails}>
                      <Typography className={classes.dataColmLabel}>
                        {contact?.fullName || `${t('sales.contract.name')}: ${NA}`}
                        {contact?.designation ? ` • ${contact?.designation}` : null}
                      </Typography>
                      <Box className={classes.dataColmDetail}>
                        <Link className={classes.dataLink} href={`mailto:${contact?.email}`}>
                          {contact?.email ? (
                            <Typography className={classes.emailIcon}>
                              {contact.email} <DetailEmailIcon />
                            </Typography>
                          ) : (
                            <Typography>{`${t('sales.contacts.email')}: ${NA}`}</Typography>
                          )}
                        </Link>
                      </Box>
                      <Box className={classes.dataColmDetail}>
                        <Link className={classes.dataLink} href={'#'}>
                          <Typography>
                            {contact?.contact || `${t('sales.contacts.phoneNumber')}: ${NA}`}
                          </Typography>
                        </Link>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <>{t('sales.deals.noContacts')}</>
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
              {!isObjectEmpty(franchise) ? (
                <>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.name')}
                    </Typography>
                    <Typography className={classes.dataColmDetail}>
                      {capitalizeFirstLetter(franchise?.franchiseName) || NA}
                    </Typography>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.franchiseOwner')}
                    </Typography>
                    <Typography className={classes.dataColmDetail}>
                      {capitalizeFirstLetter(franchise?.firstName) || NA}{' '}
                      {franchise?.firstName && capitalizeFirstLetter(franchise?.lastName)}
                    </Typography>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.email')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Link className={classes.dataLink} href={`mailto:${franchise?.email}`}>
                        {franchise?.email ? (
                          <Typography className={classes.emailIcon}>
                            {franchise.email} <DetailEmailIcon />
                          </Typography>
                        ) : (
                          NA
                        )}
                      </Link>
                    </Box>
                  </Box>
                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.contact')}
                    </Typography>
                    <Box className={classes.dataColmDetail}>
                      <Link className={classes.dataLink} href={'#'}>
                        <Typography>{franchise?.phoneNumber || NA}</Typography>
                      </Link>
                    </Box>
                  </Box>

                  <Box className={classes.dataColWrap}>
                    <Typography className={classes.dataColmLabel}>
                      {t('sales.locations.address')}
                    </Typography>
                    <Typography className={classes.dataColmDetail}>
                      {formatAddress(
                        capitalizeFirstLetter(franchise?.address),
                        capitalizeFirstLetter(franchise?.city?.name),
                        capitalizeFirstLetter(franchise?.state?.name),
                        franchise?.zipCode,
                      ) || NA}
                    </Typography>
                  </Box>
                </>
              ) : (
                <>{t('sales.deals.noAssciatedFranchiseLocation')}</>
              )}
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
                        key={file?.id}
                        placement="bottom"
                        arrow
                      >
                        <Box
                          key={file?.id}
                          className={classes.attachSuccess}
                          // onClick={() => openFile(file?.fileName, file?.fileUrl)}
                        >
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
          title={t('sales.deals.areYouSureToDelete')}
          text={t('sales.deals.areYouSureToDeleteDesc')}
          cancelButtonText={t('sales.deals.cancelBtn')}
          confirmButtonText={t('sales.deals.deleteBtn')}
          show={showDeleteModal?.active}
          handleConfirmButton={() => handleDeleteAttachment(showDeleteModal?.id)}
          handleCancelButton={() => setShowDeleteModal({ id: null, active: false })}
          icon={<DeleteSweetAlertIcon />}
        />
      )}
    </>
  );
};

DealsDetailsAccordians.propTypes = {
  data: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setData: PropTypes.func,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default DealsDetailsAccordians;
