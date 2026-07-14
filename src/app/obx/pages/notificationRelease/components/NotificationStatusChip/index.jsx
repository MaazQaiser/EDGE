import { Box, Chip, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { ReactComponent as InfoIcon } from 'src/assets/svg/infoCurrentColor.svg?react';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';

const NotificationStatusChip = ({
  status,
  statusColorMap = {},
  statusChipClassName = '',
  tooltipPlacement = 'top',
  tooltipArrow = true,
  scheduledAt,
  sentAt,
  triggeredAt,
  createdAt,
}) => {
  const { formatDayjsDateTime } = useDateTime();

  const statusLabel = capitalizeFirstLetter(status);

  let statusTooltip = statusLabel;

  if (status === 'draft') {
    statusTooltip = 'Still in Draft. Review and send when ready';
  } else {
    const scheduledAtDateTime = scheduledAt
      ? formatDayjsDateTime({
          value: scheduledAt,
          formatType: dayjsFormatsEnum.dateTime,
        })
      : '';

    const fallbackSentAt = sentAt || triggeredAt || createdAt;
    const fallbackSentAtDateTime =
      !scheduledAtDateTime && fallbackSentAt
        ? formatDayjsDateTime({
            value: fallbackSentAt,
            formatType: dayjsFormatsEnum.dateTime,
          })
        : '';

    const finalDateTime = scheduledAtDateTime || fallbackSentAtDateTime;

    // UX wording:
    // - scheduled: "Scheduled for <time>"
    // - sent: "Sent on <time>"
    const joiner = status === 'sent' ? 'on' : status === 'scheduled' ? 'for' : 'at';
    statusTooltip = finalDateTime ? `${statusLabel} ${joiner} ${finalDateTime}` : statusLabel;
  }

  return (
    <Chip
      color={statusColorMap?.[status]}
      label={
        <Box className={statusChipClassName}>
          {statusLabel}
          <Tooltip title={statusTooltip} placement={tooltipPlacement} arrow={tooltipArrow}>
            <span>
              <InfoIcon />
            </span>
          </Tooltip>
        </Box>
      }
    />
  );
};

NotificationStatusChip.propTypes = {
  status: PropTypes.string,
  statusColorMap: PropTypes.object,
  statusChipClassName: PropTypes.string,
  tooltipPlacement: PropTypes.string,
  tooltipArrow: PropTypes.bool,
  scheduledAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  sentAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  triggeredAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
};

export default NotificationStatusChip;
