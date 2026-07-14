import { Box, Checkbox, Typography } from '@mui/material';
import { ReactComponent as RoundedBoxIcon } from 'assets/svg/rounded-box.svg?react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { sortDays } from 'src/app/obx/pages/sites/detail/components/jobs';
import { getDaysStringFromNumbers } from 'src/helper/utilityFunctions';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum } from 'src/utils/constants';

import { useStyles } from './servicesStyle';

const ServiceData = ({ shift }) => {
  const classes = useStyles();
  const { formatDayjsDateTime } = useDateTime();

  const { t } = useTranslation();

  const NA = t('commonText.nA');

  return (
    <>
      <Box className={classes.serviceItemLeftWrapper}>
        <Box className={classes.serviceItemLeft}>
          <Typography variant="h5" className={classes.serviceItemShiftName}>
            {shift?.name}
          </Typography>
          <Box className={classes.serviceItemUser}>
            <Box className={classes.serviceItemUserAvatar}>
              <img src={shift?.officer?.imageUrl} alt="avatar" height="16px" width="16px" />
            </Box>
            <Box className={classes.serviceItemUserDetailWrapper}>
              <Typography variant="subtitle3" className={classes.serviceItemUserDetail}>
                {shift?.officer?.name || NA}
              </Typography>
              <RoundedBoxIcon />
              <Typography variant="subtitle3" className={classes.serviceItemUserDetail}>
                {formatDayjsDateTime({
                  value: shift?.startTime,
                  formatType: dayjsFormatsEnum.time,
                })}{' '}
                -{' '}
                {formatDayjsDateTime({
                  value: shift?.endTime,
                  formatType: dayjsFormatsEnum.time,
                })}
              </Typography>
              <RoundedBoxIcon />
              <Typography variant="subtitle3" className={classes.serviceItemUserDetail}>
                {getDaysStringFromNumbers(sortDays(shift?.shiftDays))}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

ServiceData.propTypes = {
  shift: PropTypes.object,
};

const ServiceItem = ({ shift, formData, setFormData, service, formDataIndex }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { formatDayjsDateTime } = useDateTime();

  const NA = t('commonText.nA');

  // Function to handle checkbox change
  const handleCheckboxChange = (serviceId, shiftId, isChecked) => {
    // Find the service by ID
    let updatedFormData = [];
    if (formData?.length) {
      updatedFormData = formData.map((data) => {
        if (
          data?.serviceId?.toString() === serviceId &&
          data?.visitId?.toString() === shift?.visitId?.toString()
        ) {
          const updatedShiftIds = isChecked
            ? [...data.shiftIds, shiftId] // Add shiftId if checked
            : data?.shiftIds?.filter((id) => id !== shiftId); // Remove shiftId if unchecked

          return {
            ...data,
            shiftIds: updatedShiftIds,
            serviceType: service?.type,
            visitId: shift?.visitId?.toString(),
          };
        } else {
          return {
            ...data,
          };
        }
      });

      // If the serviceId is not found in the array, add a new object
      if (
        !updatedFormData.some(
          (data) =>
            data.serviceId?.toString() === serviceId?.toString() &&
            data?.visitId?.toString() === shift?.visitId?.toString(),
        )
      ) {
        updatedFormData.push({
          serviceId: serviceId?.toString(),
          shiftIds: [shiftId],
          serviceType: service?.type,
          visitId: shift?.visitId?.toString(),
        });
      }
    } else {
      updatedFormData = [
        {
          serviceId: serviceId?.toString(),
          shiftIds: [shiftId],
          serviceType: service?.type,
          visitId: shift?.visitId?.toString(),
        },
      ];
    }

    setFormData(updatedFormData);
  };

  return (
    <Box className={classes.serviceItem}>
      <Box className={classes.serviceItemLeftWrapper}>
        <Box className={classes.serviceItemLeft}>
          <Typography variant="h5" className={classes.serviceItemShiftName}>
            {shift?.name}
          </Typography>
          <Box className={classes.serviceItemUser}>
            <Box className={classes.serviceItemUserAvatar}>
              <img src={shift?.officer?.imageUrl} alt="avatar" height="16px" width="16px" />
            </Box>
            <Box className={classes.serviceItemUserDetailWrapper}>
              <Typography variant="subtitle3" className={classes.serviceItemUserDetail}>
                {shift?.officer?.name || NA}
              </Typography>
              <RoundedBoxIcon />
              <Typography variant="subtitle3" className={classes.serviceItemUserDetail}>
                {formatDayjsDateTime({
                  value: shift?.startTime,
                  formatType: dayjsFormatsEnum.time,
                })}{' '}
                -{' '}
                {formatDayjsDateTime({
                  value: shift?.endTime,
                  formatType: dayjsFormatsEnum.time,
                })}
              </Typography>
              <RoundedBoxIcon />
              <Typography variant="subtitle3" className={classes.serviceItemUserDetail}>
                {getDaysStringFromNumbers(sortDays(shift?.shiftDays))}
              </Typography>
            </Box>
          </Box>
        </Box>
        {shift?.children?.length > 0 &&
          shift?.children?.map((childShift, index) => (
            <ServiceData key={index} shift={childShift} />
          ))}
      </Box>
      <Box className={classes.serviceItemRight}>
        <Checkbox
          name={'shiftIds'}
          checked={formData?.[formDataIndex]?.shiftIds?.includes(shift?.id)}
          onChange={(e) =>
            handleCheckboxChange(
              shift?.serviceId?.toString(),
              shift?.id?.toString(),
              e.target.checked,
            )
          }
          value={shift?.id}
        />
      </Box>
    </Box>
  );
};

ServiceItem.propTypes = {
  shift: PropTypes.object,
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  handleInputChange: PropTypes.func,
  service: PropTypes.object,
  formDataIndex: PropTypes.number,
};
export default ServiceItem;
