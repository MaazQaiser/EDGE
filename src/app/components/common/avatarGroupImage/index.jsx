import { Avatar, AvatarGroup, Box, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { capitalizeFirstLetter } from 'src/utils/string/common';

const useStyles = makeStyles((theme) => ({
  avatarIcon: {
    '& .MuiAvatar-root': {
      position: 'unset !important',
      width: '24px',
      height: '24px',
      border: `1px solid ${theme.palette.borderSubtle1} !important`,

      '&.MuiAvatar-colorDefault': {
        fontSize: '12px',
        backgroundColor: '#CFEFFF',
        color: '#0059FF',
        fontWeight: '500',
      },
    },
  },
  tooltip: {
    display: 'flex',
    gap: '8px',
    flexDirection: 'column',
  },
  tooltipImage: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: `1px solid ${theme.palette.borderSubtle1}`,
  },
  tooltipItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'flex-start',
  },
}));

const AvatarGroupImage = ({ data }) => {
  const classes = useStyles();
  return (
    <Box>
      <Tooltip
        title={
          <Box className={classes.tooltip}>
            {data?.map((d, index) => (
              <Box key={index} className={classes.tooltipItem}>
                <img src={d?.image} alt={d?.name} className={classes.tooltipImage} />
                <span>{capitalizeFirstLetter(d?.name)}</span>
              </Box>
            ))}
          </Box>
        }
      >
        <AvatarGroup className={classes.avatarIcon} max={3} total={data?.length}>
          {data?.map((d, index) => (
            <Avatar key={index} alt={d?.name} src={d?.image} />
          ))}
        </AvatarGroup>
      </Tooltip>
    </Box>
  );
};

AvatarGroupImage.propTypes = {
  data: PropTypes.array,
};

export default AvatarGroupImage;
