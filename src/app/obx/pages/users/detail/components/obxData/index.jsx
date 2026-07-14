import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ReactComponent as RequiredIcon } from 'assets/svg/required.svg?react';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { ACL_OBX_USERS_OBX_FORM_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import useDateTime from 'src/hooks/useDateTime';
import { getObxDataFormOfUser } from 'src/services/user.services';
import userHasPermission from 'src/utils/auth/userHasPermission';
import {
  dayjsFormatsEnum,
  OBX_DATA_STATUS_ENUM,
  OBX_DATA_TITLE_ENUM,
  toastSettings,
} from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import { useStyles } from './obxData.styles';
import ObxDataModal from './obxDataModal';
import ObxDataSkeleton from './obxDataSkeleton';

const ObxDataComponent = ({ id, isProfile }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [expanded, setExpanded] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [obxData, setObxData] = useState(null);
  const [allowedManagers, setAllowedManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id: currentUserId } = useSelector((state) => state.user?.info);
  const { formatDayjsDateTime } = useDateTime();

  const handleChange = useCallback(
    (panel) => (event, isExpanded) => {
      setExpanded(isExpanded ? panel : '');
    },
    [],
  );

  const handleOpenModal = useCallback((data) => {
    setSelectedData(data);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedData(null);
  }, []);

  const fetchObxData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await getObxDataFormOfUser({ user_id: id });
      if (response?.statusCode === 200) {
        setObxData(response?.data?.obxForms || []);
        setAllowedManagers(response?.data?.managerIds || []);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchObxData();
  }, [fetchObxData]);

  const getStatusConfig = useCallback(
    (status) => {
      const statusConfig = {
        complete: {
          chipClass: classes.statusChipComplete,
          color: 'success',
        },
        pending: {
          chipClass: classes.statusChipPending,
          color: 'warning',
        },
      };

      return (
        statusConfig[status] || {
          chipClass: classes.statusChip,
          color: 'default',
        }
      );
    },
    [classes],
  );

  const renderAnswer = (value) => {
    if (value === true) return t('obx.users.obxData.yes');
    if (value === false) return t('obx.users.obxData.no');
    return '';
  };

  /*
    1. If the user is a profile, show the notification if the employee response is empty.
    2. If the user is a manager, show the notification if the manager response is empty.
  */
  const shouldShowNotification = (data) =>
    isProfile
      ? isObjectEmpty(data?.employeeResponse)
      : isObjectEmpty(data?.managerResponse) &&
        allowedManagers?.includes(+currentUserId) &&
        userHasPermission(ACL_OBX_USERS_OBX_FORM_UPDATE);

  /*
    1. If the user is a profile, show the table if the employee response is not empty.
    2. If the user is a manager, the table should be shown.
  */

  const shouldShowTable = (data) => (isProfile ? !isObjectEmpty(data?.employeeResponse) : true);

  const renderAccordionItem = useCallback(
    (data) => {
      const hasDueDateInFuture =
        dayjsWithStandardOffset(data?.enabledAt) > dayjsWithStandardOffset();
      const statusConfig = getStatusConfig(data?.status);
      const dataQuestions = data?.template?.sectionsAttributes?.[0]?.questionsAttributes;

      return (
        <Accordion
          key={data?.id}
          expanded={expanded === data?.id}
          onChange={handleChange(data?.id)}
          className={classes.accordion}
          disabled={hasDueDateInFuture}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}
            className={classes.accordionSummary}
          >
            <Box className={classes.accordionHeader}>
              <Box className={classes.accordionTitle}>
                <Typography variant="h6" className={classes.accordionTitleText}>
                  {OBX_DATA_TITLE_ENUM(t)?.[data?.formType]}
                </Typography>
                {!hasDueDateInFuture && (
                  <>
                    <Chip
                      label={data?.status}
                      className={statusConfig.chipClass}
                      size="small"
                      color={statusConfig.color}
                    />
                    {data?.status !== OBX_DATA_STATUS_ENUM.COMPLETE && (
                      <Box className={classes.lastWorkingDayContainer}>
                        <Typography variant="body3" className={classes.dueDateTitle}>
                          {t('obx.users.obxData.due')}:{' '}
                        </Typography>
                        <Typography variant="body3" className={classes.dueDateValue}>
                          {formatDayjsDateTime({
                            value: data?.dueDate,
                            formatType: dayjsFormatsEnum.date,
                          })}
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </Box>
              {!hasDueDateInFuture && (
                <Box className={classes.submissionInfo}>
                  <Typography variant="body2" className={classes.emoloyeeInfo}>
                    {`${isProfile ? t('obx.users.obxData.yourSubmission') : t('obx.users.obxData.employee')}:`}
                    {isObjectEmpty(data?.employeeResponse) ? (
                      <Chip
                        label={t('status.pending')}
                        className={statusConfig.chipClass}
                        size="small"
                        color={statusConfig.color}
                      />
                    ) : (
                      <Box>
                        <Typography variant="body2" className={classes.submissionText}>
                          {!isProfile && t('obx.users.obxData.submittedOn')}{' '}
                          {formatDayjsDateTime({
                            value: data?.employeeResponse?.submittedAt,
                            formatType: dayjsFormatsEnum.date,
                          })}
                        </Typography>
                      </Box>
                    )}
                  </Typography>
                  <Box className={classes.managerInfo}>
                    <Typography variant="body2" className={classes.submissionText}>
                      {`${t('obx.users.obxData.manager')}:`}
                    </Typography>
                    {isObjectEmpty(data?.managerResponse) ? (
                      <Chip
                        label={t('status.pending')}
                        className={statusConfig.chipClass}
                        size="small"
                        color={statusConfig.color}
                      />
                    ) : (
                      <Box className={classes.managerInfo}>
                        <Avatar
                          src={data?.managerResponse?.submittedBy?.imageUrl}
                          className={classes.managerAvatar}
                        />
                        <Typography variant="body2" className={classes.submissionText}>
                          <span className={classes.submissionBoldText}>
                            {capitalizeFirstLetter(data?.managerResponse?.submittedBy?.fullName)}
                          </span>
                          {`${t('obx.users.obxData.on')} `}
                          <span className={classes.submissionBoldText}>
                            {formatDayjsDateTime({
                              value: data?.managerResponse?.submittedAt,
                              formatType: dayjsFormatsEnum.date,
                            })}
                          </span>
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </AccordionSummary>

          <AccordionDetails className={classes.accordionDetails}>
            {shouldShowNotification(data) && (
              <Box className={classes.notificationCard}>
                <Box className={classes.notificationContent}>
                  <Box className={classes.notificationText}>
                    <Typography variant="h6" className={classes.notificationTitle}>
                      {`${t('obx.users.obxData.waitingForSubmission')}`}
                    </Typography>
                    <RequiredIcon />
                  </Box>
                  <Typography variant="body2" className={classes.notificationMessage}>
                    {t('obx.users.obxData.pendingSubmissionDescription')}
                  </Typography>
                </Box>
                <Button variant="primary" onClick={() => handleOpenModal(data)}>
                  {t('obx.users.obxData.submitForm')}
                </Button>
              </Box>
            )}
            {shouldShowTable(data) && (
              <Table className={classes.checklistTable}>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeader}>
                      {t('obx.users.obxData.questions')}
                    </TableCell>
                    <TableCell className={classes.tableHeader} align="center">
                      {isProfile
                        ? t('obx.users.obxData.yourAnswers')
                        : t('obx.users.obxData.employee')}
                    </TableCell>
                    {!isProfile && (
                      <TableCell className={classes.tableHeader} align="center">
                        {t('obx.users.obxData.manager')}
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataQuestions?.map((item) => (
                    <TableRow key={item?.id} className={classes.tableRow}>
                      <TableCell className={classes.questionCell}>
                        {item?.questionStatement}
                      </TableCell>
                      <TableCell align="center" className={classes.answerCell}>
                        <Typography variant="body2" className={classes.answerText}>
                          {renderAnswer(data?.employeeResponse[item?.id])}
                        </Typography>
                      </TableCell>
                      {!isProfile && (
                        <TableCell align="center" className={classes.answerCell}>
                          <Typography variant="body2" className={classes.answerText}>
                            {renderAnswer(data?.managerResponse[item?.id])}
                          </Typography>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </AccordionDetails>
        </Accordion>
      );
    },
    [expanded, handleChange, classes, getStatusConfig, handleOpenModal, t],
  );

  if (loading) {
    return <ObxDataSkeleton isProfile={isProfile} />;
  }

  if (!loading && obxData?.length > 0) {
    return (
      <Box className={classes.obxDataContainer}>
        {obxData?.map(renderAccordionItem)}
        <ObxDataModal
          open={modalOpen}
          onClose={handleCloseModal}
          data={selectedData}
          refetchData={fetchObxData}
          isProfile={isProfile}
        />
      </Box>
    );
  }
};

ObxDataComponent.propTypes = {
  data: PropTypes.object,
  id: PropTypes.string,
  loading: PropTypes.bool,
  isProfile: PropTypes.bool,
};

ObxDataComponent.defaultProps = {
  data: {},
  id: '',
  loading: false,
  isProfile: false,
};

export default ObxDataComponent;
