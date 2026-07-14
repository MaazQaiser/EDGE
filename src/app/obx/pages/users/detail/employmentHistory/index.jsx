import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Skeleton,
  Typography,
} from '@mui/material';
import { ReactComponent as ChevronUpIcon } from 'assets/svg/chevron-up.svg?react';
import { ReactComponent as DotLight } from 'assets/svg/dot-light.svg?react';
import { ReactComponent as Hired } from 'assets/svg/hiredEmployee.svg?react';
import { ReactComponent as Rehired } from 'assets/svg/hiredEmployee.svg?react';
import { ReactComponent as Terminated } from 'assets/svg/terminatedEmployee.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { useApiControllers } from 'src/helper/axios';
import useDateTime from 'src/hooks/useDateTime';
import { getEmploymentHistory } from 'src/services/user.services';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './employmentHistory.style';

const SkeletonComponent = () => {
  const classes = useStyles();

  return (
    <Box>
      <Typography className={classes.skeletonMain} variant="subtitle2" sx={{ mb: 1 }}>
        <Skeleton
          width="100%"
          variant="text"
          height="50px"
          sx={{ borderRadius: '4px !important' }}
        />
      </Typography>
      {[1, 2, 3].map((_, idx) => (
        <Box key={idx} sx={{ display: 'flex', mb: 3 }}>
          <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
          <Box>
            <Skeleton variant="text" width={150} height={20} />
            <Skeleton variant="text" width={280} height={18} />
            {idx === 1 && (
              <>
                <Skeleton variant="text" width={60} height={16} sx={{ mt: 1 }} />
                <Skeleton variant="text" width={100} height={16} />
              </>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

const getStatusTypeEnum = (classes, t) => ({
  hired: {
    dateTitle: t('obx.users.employmentHistory.hired.dateTitle'),
    type: 'hired',
    icon: <Hired />,
    classes: classes.avatarHired,
    title: t('obx.users.employmentHistory.hired.title'),
  },
  rehired: {
    dateTitle: t('obx.users.employmentHistory.rehired.dateTitle'),
    type: 'rehired',
    icon: <Rehired />,
    classes: classes.avatarRehired,
    title: t('obx.users.employmentHistory.rehired.title'),
  },
  terminated: {
    dateTitle: t('obx.users.employmentHistory.terminated.dateTitle'),
    type: 'terminated',
    icon: <Terminated />,
    classes: classes.avatarTerminated,
    title: t('obx.users.employmentHistory.terminated.title'),
  },
});

const EmploymentHistory = ({ id }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const statusTypeEnum = getStatusTypeEnum(classes, t);
  const [isLoading, setLoading] = useState(true);
  const { getNewApiController } = useApiControllers();
  const [employmentHistory, setEmploymentHistory] = useState([]);
  const { franchiseId } = useSelector((state) => state.auth);
  const [selectedAccordion, setSelectedAccordion] = useState(null);
  const { formatDayjsDateTime } = useDateTime();

  const handleChange = (panel) => (event, isExpanded) => {
    setSelectedAccordion(isExpanded ? panel : false);
  };

  const fetchEmployementHistory = async () => {
    if (!id) return;
    setLoading(true);
    const apiController = getNewApiController();

    try {
      const response = await getEmploymentHistory(id, { signal: apiController.signal });
      if (response && response?.statusCode === 200) {
        setEmploymentHistory(response?.data?.employmentHistory || []);
        if (!franchiseId) setSelectedAccordion(response?.data?.employmentHistory[0]?.franchiseId);
        setLoading(false);
      }
    } catch (err) {
      if (!apiController.signal.aborted) {
        toaster.error({
          text: err?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };

  useEffect(() => {
    fetchEmployementHistory();
  }, [id]);

  const displayEmploymentHistory = (employmentHistory) => {
    return (
      <Box className={classes.accordionContainerSingle}>
        {employmentHistory?.map((item) => (
          <Box key={item.id} className={classes.item}>
            <Avatar className={`${classes.avatar} ${statusTypeEnum?.[item?.statusType]?.classes}`}>
              {statusTypeEnum?.[item?.status]?.icon}{' '}
            </Avatar>
            <Box className={classes.itemContentInner}>
              <Box className={classes.itemContent}>
                <Typography variant="h5" className={classes.itemContentText}>
                  {statusTypeEnum?.[item?.status]?.title}
                </Typography>
                <DotLight />
                <Typography variant="h5" className={classes.itemContentTextName}>
                  {statusTypeEnum?.[item?.status]?.dateTitle}:{' '}
                  <span className={classes.itemContentTextNameDate}>
                    {formatDayjsDateTime({ value: item?.date, formatType: dayjsFormatsEnum.date })}
                  </span>
                </Typography>
              </Box>
              {item?.status === statusTypeEnum.terminated?.type ? (
                <Box className={classes.itemContentInner}>
                  <Typography variant="body3" className={classes.reasonText}>
                    {t('obx.users.employmentHistory.reason')}
                  </Typography>
                  <Typography variant="body2" className={classes.detailsText}>
                    {item?.reason}
                  </Typography>
                </Box>
              ) : null}
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box className={classes.container}>
      <Box className={classes.itemContainer}>
        {isLoading ? (
          <Box>
            <SkeletonComponent />
            <SkeletonComponent />
          </Box>
        ) : (
          <Box>
            {!franchiseId ? (
              <Box className={classes.accordionContainer}>
                {employmentHistory?.map((item) => (
                  <Accordion
                    className={classes.accordion}
                    key={item?.id}
                    expanded={selectedAccordion === item?.franchiseId}
                    onChange={handleChange(item?.franchiseId)}
                  >
                    <AccordionSummary
                      expandIcon={<ChevronUpIcon />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                    >
                      <Box className={classes.franchiseName}>
                        <Typography
                          variant="subtitle2"
                          component="span"
                          className={classes.franchiseNameText}
                        >
                          {t('obx.users.employmentHistory.franchise')}
                        </Typography>
                        <Typography
                          component="span"
                          variant="subtitle2"
                          className={classes.franchiseNameValue}
                        >
                          {item?.franchiseName}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>{displayEmploymentHistory(item?.history)}</AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            ) : (
              <>{displayEmploymentHistory(employmentHistory)}</>
            )}
          </Box>
        )}
        {!isLoading && <NoRecordFound data={employmentHistory} noOfColumns={1} t={t} />}
      </Box>
    </Box>
  );
};

export default EmploymentHistory;

EmploymentHistory.propTypes = {
  id: PropTypes.string,
};

EmploymentHistory.defaultProps = {
  id: null,
};
