import { Avatar, Box, Chip, Skeleton, Typography } from '@mui/material';
import { ReactComponent as CheckMark } from 'assets/svg/commonDropdown/checkBox.svg';
import { ReactComponent as NotChecked } from 'assets/svg/commonDropdown/unChecked.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown';
import FieldError from 'src/app/components/common/fieldError';
import { useTenantLabel } from 'src/helper/utilityHooks';
// import { ReactComponent as WarningIcon } from 'src/assets/svg/info-icon-officer.svg';
// import { ReactComponent as DangerIcon } from 'src/assets/svg/not-available-icon-officer.svg';
import { officerUnavailabilityReason, rolesEnumWithName } from 'src/utils/constants';

import { useStyles } from '../assignmentSideDrawer.styles';
const OfficerDropdown = ({
  handleChangeValue,
  selectedValue,
  allOfficers,
  name,
  classNew,
  errorMsg,
  disabled = false,
  label,
  placeHolder,
}) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const currentUserRole = useSelector((state) => state?.auth?.userRole?.slug);

  const handleAssignSupervisor = () => {
    const supervisorData = {
      ...(allOfficers?.assignMe || {}),
      value: allOfficers?.assignMe?.id,
      label: allOfficers?.assignMe?.name,
    };
    const e = {
      target: {
        name,
        value: supervisorData,
      },
    };
    handleChangeValue(e);
  };

  const updatedSelectedValue = selectedValue || {};

  const unassignedOfficers = allOfficers?.unassigned || [];
  const assignedOfficers = allOfficers?.assigned || [];
  const allOfficersData = [
    allOfficers?.unassignOfficer || {},
    ...unassignedOfficers,
    ...assignedOfficers,
  ];

  const isAssignMeDisabled = allOfficers?.assignMe?.disabled;
  const isSupervisorSelected = allOfficers?.assignMe?.id === updatedSelectedValue?.id;

  const CheckBoxComponent = () => {
    return (
      <Box className={classes.customDropdownCheckbox}>
        <Box className={classes.customDropdownCheckboxIcon}>
          <CheckMark />
        </Box>
      </Box>
    );
  };

  const NotCheckedComponent = () => {
    return (
      <Box className={classes.customDropdownCheckbox}>
        <Box className={classes.customDropdownCheckboxIcon}>
          <NotChecked />
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      {typeof allOfficers === 'undefined' ? (
        <Skeleton className={classes.officerDropdownSkeleton} />
      ) : (
        <CustomDropDown
          maxWidth="600px"
          label={
            label ||
            t('obx.schedules.assignDedicatedDuty.assignShift.officerPlaceholder', {
              officer: getLabel('roles', 'officer', t),
            })
          }
          name={name}
          placeHolder={
            placeHolder ||
            t('obx.schedules.assignDedicatedDuty.assignShift.officerPlaceholder', {
              officer: getLabel('roles', 'officer', t),
            })
          }
          selectedValues={{
            ...updatedSelectedValue,
            image: updatedSelectedValue?.imageUrl,
            value: updatedSelectedValue?.id,
          }}
          options={allOfficersData || []}
          additionalOption={
            rolesEnumWithName.supervisor.slug === currentUserRole && allOfficers?.assignMe ? (
              <Box
                onClick={handleAssignSupervisor}
                className={classNames(
                  classes.assignShiftOfficerMe,
                  isAssignMeDisabled && classes.assignShiftOfficerMeDisabled,
                  isSupervisorSelected && classes.assignShiftOfficerMeSelected,
                )}
              >
                <Box className={classes.singleOfficerOptionLeft}>
                  <Avatar
                    className={classes.singleOfficerOptionImage}
                    src={allOfficers?.assignMe?.imageUrl}
                  />
                  <Typography variant="body2" className={classes.assignShiftOfficerMeText}>
                    {t('obx.schedules.assignDedicatedDuty.assignShift.officerAssignMe')}
                  </Typography>
                </Box>
                <SelectChip officerData={allOfficers?.assignMe} />
              </Box>
            ) : null
          }
          searchable
          overrideOption={(data, isSelected) => {
            return (
              <Box className={classes.singleOfficerOption}>
                <Box className={classes.singleOfficerOptionLeft}>
                  {isSelected ? <CheckBoxComponent /> : <NotCheckedComponent />}
                  <Avatar className={classes.singleOfficerOptionImage} src={data?.imageUrl} />
                  <Box className={classes.labelFlex}>
                    <Typography variant="body2" className={classes.singleOfficerOptionText}>
                      {data?.name ? data?.name : data?.label}
                    </Typography>
                    <Typography variant="body3">{data?.role}</Typography>
                  </Box>
                </Box>
                <SelectChip officerData={data} />
              </Box>
            );
          }}
          handleChange={handleChangeValue}
          bordered
          className={classNames(classes.assignShiftBodyDropDown, classNew)}
          isError={errorMsg}
          disabled={disabled}
        />
      )}
      <FieldError error={errorMsg} />
    </Box>
  );
};

export default OfficerDropdown;

OfficerDropdown.propTypes = {
  handleChangeValue: PropTypes.func,
  selectedValue: PropTypes.object,
  allOfficers: PropTypes.array,
  name: PropTypes.string,
  classNew: PropTypes.string,
  errorMsg: PropTypes.string,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  placeHolder: PropTypes.string,
  maxWidth: PropTypes.string,
};

export const SelectChip = ({ officerData }) => {
  const { t } = useTranslation();

  const classes = useStyles();

  return (
    <Box className={classes.colorChip}>
      {(officerData?.reason === officerUnavailabilityReason.OFFLINE ||
        officerData?.reason === officerUnavailabilityReason.TERMINATED) && (
        <Chip
          color="error"
          label={t('obx.schedules.assignDedicatedDuty.assignShift.unavailable')}
        />
      )}
      {officerData?.reason === officerUnavailabilityReason.ASSIGNED && (
        <Chip
          color="warning"
          label={t('obx.schedules.assignDedicatedDuty.assignShift.officerAllocated')}
        />
      )}
      {officerData?.reason === officerUnavailabilityReason.NOT_IN_ZONE && (
        <Chip color="error" label={t('obx.schedules.assignDedicatedDuty.assignShift.notInZone')} />
      )}
      {officerData?.reason === officerUnavailabilityReason.ON_LEAVE && (
        <Chip color="warning" label={t('obx.schedules.assignDedicatedDuty.assignShift.onLeave')} />
      )}
      {officerData?.reason === officerUnavailabilityReason.AVAILABLE && (
        <Chip
          color="success"
          label={t('obx.schedules.assignDedicatedDuty.assignShift.available')}
        />
      )}
    </Box>
  );
};

SelectChip.propTypes = {
  officerData: PropTypes.object,
};
