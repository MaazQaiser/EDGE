import { Box, Skeleton, Typography } from '@mui/material';
import { ReactComponent as AssignDispatchAlertIcon } from 'assets/svg/AssignDispatchAlertIcon.svg?react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import { useTenantLabel } from 'src/helper/utilityHooks';

import SupervisorCard from '../supervisorCard';
import { useStyles } from './supervisorList.style';

const SupervisorList = ({ supervisors, loading, selectedSupervisor, handleSupervisorChange }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const [search, setSearch] = useState('');

  const handleSearchKeyPress = (event) => setSearch(event.target.value);
  const filterSupervisors =
    supervisors?.filter((supervisor) =>
      supervisor?.name?.trim()?.toLowerCase()?.includes(search.toLowerCase()),
    ) || [];

  if (loading)
    return (
      <Box className={classes.skeletonContainer}>
        <Box className={classes.skeletonWrapper}>
          <Skeleton variant="rounded" width={150} height={18} />
          <Skeleton variant="rounded" width={'100%'} height={74} />
          <Skeleton variant="rounded" width={'100%'} height={74} />
        </Box>
        <Box className={classes.skeletonWrapper}>
          <Skeleton variant="rounded" width={150} height={18} />
          <Skeleton variant="rounded" width={'100%'} height={74} />
          <Skeleton variant="rounded" width={'100%'} height={74} />
          <Skeleton variant="rounded" width={'100%'} height={74} />
        </Box>
      </Box>
    );

  return (
    <>
      <Box className={classes.assignOfficerHeader}>
        <Box className={classes.blueBox}>
          <AssignDispatchAlertIcon />
          <Typography variant="subtitle2">{`${t('obx.dispatch.assignOfficerlAert', {
            dispatch: getLabel('terms', 'dispatch', t).toLowerCase(),
            supervisor: getLabel('terms', 'supervisor', t).toLowerCase(),
            officer: getLabel('terms', 'officer', t).toLowerCase(),
          })}`}</Typography>
        </Box>
        <Box className={classes.searchSection}>
          <SearchComponentWithQuery
            name="search"
            placeHolder={`${t('obx.dispatch.searchSupervisor', {
              supervisor: getLabel('terms', 'supervisor', t).toLowerCase(),
            })}`}
            className={classes.fullWidth}
            onSearch={handleSearchKeyPress}
          />
        </Box>
      </Box>
      <Box className={classes.officerListing}>
        {filterSupervisors.map((supervisor) => (
          <SupervisorCard
            key={supervisor?.id}
            supervisor={supervisor}
            selectedSupervisor={selectedSupervisor}
            handleSupervisorChange={handleSupervisorChange}
          />
        ))}
      </Box>
    </>
  );
};

SupervisorList.propTypes = {
  loading: PropTypes.bool,
  supervisors: PropTypes.array,
  handleSupervisorChange: PropTypes.func,
  selectedSupervisor: PropTypes.object,
};

export default SupervisorList;
