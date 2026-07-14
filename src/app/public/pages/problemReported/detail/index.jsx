import { Box, Button, Skeleton, Tooltip, Typography } from '@mui/material';
import { ReactComponent as BackIcon } from 'assets/svg/BackIcon.svg?react';
import { ReactComponent as EnvalopIcon } from 'assets/svg/EnvalopIcon.svg?react';
import { ReactComponent as TickIcon } from 'assets/svg/TickIcon.svg?react';
import CustomDropDown from 'commonComponents/customDropDown';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { changeProblemStatus, getDetailOfProblems, getStatusEnum } from 'services/faqs.services';
import { PROBLEMS_REPORTED } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { useApiControllers } from 'src/helper/axios';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import EmailModal from '../Components/emailModal';
import ReportHeader from '../Components/header';
import { useStyles } from './ProblemDetails';

const i18Statuses = (t) => [
  // { label: `${t('reportProblem.statuses.all')}`, value: 'all' },
  { label: `${t('reportProblem.statuses.toDo')}`, value: '0' },
  { label: `${t('reportProblem.statuses.inProgress')}`, value: '1' },
  { label: `${t('reportProblem.statuses.cancelled')}`, value: '2' },
  { label: `${t('reportProblem.statuses.resolved')}`, value: '3' },
];

const ProblemDetail = () => {
  const { id: problemId } = useParams();
  const { formatDayjsDateTime } = useDateTime();

  const classes = useStyles();
  const { t } = useTranslation();

  const _statusOptions = i18Statuses(t);

  const NA = t('commonText.nA');
  const { getNewApiController } = useApiControllers();

  const [open, setOpen] = useState(false);

  const [data, setData] = useState({});

  const [statusOptionsBE, setStatusOptionsBE] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState(statusOptionsBE?.[0]?.label);

  const [loading, setLoading] = useState(false);

  const toggleModal = () => setOpen((a) => !a);
  // const handleCloseModal = () => setOpen(false);

  const getStatusObject = (status) => {
    return statusOptionsBE?.find((option) => option?.label === status) || statusOptionsBE[0];
    // const statusMapping = {
    //   [statusValues.IN_PROGRESS]: statusOptionsBE.value, // Index 1 corresponds to 'In Progress'
    //   [statusValues.RESOLVED]: statusOptionsBE.value, // Index 3 corresponds to 'Resolved'
    //   [statusValues.TO_DO]: statusOptionsBE.value, // Index 0 corresponds to 'To Do'
    //   [statusValues.CANCELLED]: statusOptionsBE.value, // Index 2 corresponds to 'Cancelled'
    // };
    //
    // return statusMapping[status] || null;
  };

  const getStatusClass = (status) => {
    const found = getStatusObject(status);
    // const found = statusOptionsBE?.find((option) => option?.label === status) || statusOptionsBE[0];

    switch (found?.value) {
      case 0:
        return classes.toDoChip;
      case 1:
        return classes.inProgressChip;
      case 2:
        return classes.cancelledChip;
      case 3:
        return classes.resolvedChip;
      default:
        return classes.toDoChip;
    }
  };

  const statusClassName = getStatusClass(selectedStatus);

  const statusValue = Number(getStatusObject(data?.status)?.value);

  const getProblemDetail = async () => {
    const apiController = getNewApiController();

    try {
      setLoading(true);

      const response = await getDetailOfProblems(problemId, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        setData(response?.data);
        setSelectedStatus(response?.data?.status);
        setLoading(false);
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
        setStatusOptionsBE(response?.data);
      }
    } catch (e) {
      if (!apiController.signal.aborted) {
        // TODO: handle abort controller
        setLoading(false);
      }
    }
  };

  const changeStatus = async (event) => {
    const apiController = getNewApiController();
    const payload = {
      status: event.target.value?.value,
    };

    try {
      const response = await changeProblemStatus(problemId, payload, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        getProblemDetail();
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      if (!apiController.signal.aborted) {
        // TODO: handle abort controller
      }
    }
  };

  // const getStatusColor = () => {
  //   return statusColorClasses[data.status] || statusValues.TO_DO;
  // };

  const gotoListingPage = () => {
    history.push(PROBLEMS_REPORTED);
  };

  const checkIfDevLoggedIn = () => {
    // Check for existing user data in localStorage when the component mounts
    const devUserStored = localStorage.getItem('devLogin');

    if (!devUserStored) {
      gotoListingPage();
    }
  };

  useEffect(() => {
    checkIfDevLoggedIn();
    getStatusesList();
    getProblemDetail();

    document.body.style.overflow = 'hidden';
  }, []);

  return (
    <Box className={classes.reportProblemDetail}>
      <ReportHeader />
      <Box className={classes.pageMain}>
        <Box className={classes.pageWidth}>
          <Box className={classes.BackButton}>
            <Button variant="tertiaryGrey" startIcon={<BackIcon />} onClick={gotoListingPage}>
              {t('links.back')}
            </Button>
          </Box>

          {loading ? (
            <Box className={classes.flexContainer}>
              <Box className={classes.flexArea}>
                <Skeleton width={250} height={24} />
                <Skeleton width={150} height={24} />
              </Box>
              <Box>
                <Skeleton width={200} height={24} />
              </Box>
            </Box>
          ) : (
            <Box className={classes.flexContainer}>
              <Box>
                <Box className={classes.flexArea}>
                  {data?.title?.length > 75 ? (
                    <Typography className={classes.headText} variant="h1">
                      <Tooltip title={<>{data?.title}</>} arrow>
                        {data?.title.substring(0, 45) + '...'}
                      </Tooltip>
                    </Typography>
                  ) : (
                    <Typography className={classes.headText} variant="h1">
                      {data?.title || NA}{' '}
                    </Typography>
                  )}

                  {/*<Chip color="primary" size="small" label="In Progress" />*/}
                  {/*<Box*/}
                  {/*  component="span"*/}
                  {/*  className={classNames(classes.commonStatusColor, getStatusColor(data?.status))}*/}
                  {/*>*/}
                  {/*  {data?.status}*/}
                  {/*</Box>*/}
                  <Box>
                    <CustomDropDown
                      enableForceClose={false}
                      name={`status`}
                      label={`${t('reportProblem.allStatus')}`}
                      placeHolder={`${t('reportProblem.allStatus')}`}
                      options={statusOptionsBE}
                      selectedValues={getStatusObject(data?.status)}
                      handleChange={changeStatus}
                      className={statusClassName}
                    />
                  </Box>
                </Box>

                <Typography variant="body3" className={classes.subText}>
                  {t('reportProblem.id')}: {data?.ticketId} •{' '}
                  {formatDayjsDateTime({
                    value: data?.createdAt,
                    formatType: dayjsFormatsEnum.dateTime,
                  })}
                </Typography>
              </Box>
              {(statusValue === 0 || statusValue === 1) &&
                (!data?.emailSent ? (
                  <Box>
                    <Button
                      onClick={toggleModal}
                      disableRipple
                      variant="onlyText"
                      startIcon={<EnvalopIcon />}
                      className={classes.sendEmailBtn}
                    >
                      {t('reportProblem.SendEmail')}
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="subtitle2" className={classes.disbaleEmail}>
                    <TickIcon />
                    {t('reportProblem.EmailSent')}
                  </Typography>
                ))}
            </Box>
          )}
          <Box className={classes.emailText}>
            {loading ? (
              <Skeleton width={250} height={24} />
            ) : (
              <Typography variant="subtitle1" className={classes.headText}>
                {data?.email || NA}
              </Typography>
            )}
          </Box>
          {/*<Box className={classes.TextArea}>*/}
          {/*  <Typography variant="body3" className={classes.subText}>*/}
          {/*    {data?.description}*/}
          {/*  </Typography>*/}
          {/*</Box>*/}
          {loading ? (
            <Box className={classes.instructionContentLoader}>
              <Skeleton className={classes.instructionContentSkeleton} />
              <Skeleton className={classes.instructionContentSkeleton} />
            </Box>
          ) : (
            <>
              <Box
                className={classes.instructionContent}
                dangerouslySetInnerHTML={{
                  __html: data?.description,
                }}
              />
              {/* Show metadata - browser detail */}
              {/* style it according to the design */}
              <Box variant="subtitle1" className={classes.metaWrapper}>
                {!isObjectEmpty(data?.metadata) &&
                  Object.keys(data?.metadata).map((key) => (
                    <Box className={classes.metaDataWrapper} key={key}>
                      <Typography variant="subtitle3" className={classes.keyName}>
                        {key}:
                      </Typography>
                      <Typography variant="body3" className={classes.keyValue}>
                        {JSON.stringify(data?.metadata[key])}
                      </Typography>
                    </Box>
                  ))}
              </Box>
              <Box className={classes.problemImages}>
                {data?.files?.map((file, index) => (
                  <img key={index} src={file?.url} loading="lazy" />
                ))}
                {/*<img src="https://i.ibb.co/qkJrFZV/image-31.png" loading="lazy" />*/}
              </Box>
            </>
          )}
        </Box>
      </Box>
      {open && (
        <EmailModal
          data={data}
          open={open}
          handleClose={toggleModal}
          refreshData={getProblemDetail}
        />
      )}
    </Box>
  );
};

export default ProblemDetail;
