import {
  Avatar,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import { useStyles } from './supervisorCard.style';
const SupervisorCard = ({ supervisor, selectedSupervisor, handleSupervisorChange }) => {
  const classes = useStyles();
  const [value, setValue] = React.useState('Select');

  const { t } = useTranslation();

  const handleChange = (event) => setValue(event.target.value);

  const handleClick = () => handleSupervisorChange(supervisor);

  return (
    <Box className={classes.jobGrayBar} onClick={handleClick}>
      <Box className={classes.offierLeft}>
        <Avatar alt={supervisor?.name} src={supervisor?.image || '/static/images/avatar/1.jpg'} />
        <Box className={classes.jobDetails}>
          <Box className={classes.chipAndText}>
            <Typography variant="h5">
              {capitalizeFirstLetter(supervisor?.name) || t('commonText.nA')}
            </Typography>
            <Chip
              className={classes.eventSiteNameColor}
              size="small"
              variant="Filled"
              color="primary"
              label={supervisor?.status}
            />
          </Box>
          <Box className={classes.inlineValue}>
            <Typography variant="subtitle3">{supervisor?.type}</Typography>
            <Typography variant="subtitle3" className={classes.smallDot}>
              •
            </Typography>
            <Typography variant="subtitle3">
              (
              {supervisor?.phoneNumber ? supervisor?.phoneNumber : `Contact: ${t('commonText.nA')}`}
              )
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box className={classes.jobCheckbox}>
        <FormControl>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={value}
            onChange={handleChange}
          >
            <FormControlLabel
              value="Select"
              control={
                <Radio key={supervisor?.id} checked={supervisor?.id === selectedSupervisor?.id} />
              }
              label="Select"
            />
          </RadioGroup>
        </FormControl>
      </Box>
    </Box>
  );
};

SupervisorCard.propTypes = {
  supervisor: PropTypes.object,
  selectedSupervisor: PropTypes.object,
  handleSupervisorChange: PropTypes.func,
};

export default SupervisorCard;
