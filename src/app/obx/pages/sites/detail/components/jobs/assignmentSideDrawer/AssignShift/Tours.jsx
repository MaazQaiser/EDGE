import { Box, Typography } from '@mui/material';
import { ReactComponent as TourFlagIcon } from 'assets/svg/tours-flag.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as InfoIcon } from 'src/assets/svg/infoCurrentColor.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { fetchTourTemplatesBySiteId } from 'src/services/duty.services';
import { SCHEDULE_DUTIES_TOUR_TEMPLATES } from 'src/utils/constants/schedules';

import { useStyles } from '../assignmentSideDrawer.styles';
import SingleTour from './SingleTour';

const Tours = ({
  changeOnlyDrawerType,
  formDataTours,
  setFormDataTours,
  setDeletedTours,
  reports,
  checkpoints,
  siteId,
  errorMessagesTours,
  setErrorMessagesTours,
  readOnlyMode,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const [tourTemplates, setTourTemplates] = useState([]);

  const getTourTemplates = async (siteId) => {
    try {
      const response = await fetchTourTemplatesBySiteId(
        siteId,
        SCHEDULE_DUTIES_TOUR_TEMPLATES.DEDICATED,
      );
      setTourTemplates(response.data?.tourTemplates || []);
    } catch (error) {
      setTourTemplates([]);
    }
  };

  useEffect(() => {
    getTourTemplates(siteId);
  }, []);

  return (
    <Box className={classes.assignShiftTours}>
      <Box className={classes.assignShiftToursContentRow}>
        <TourFlagIcon />
        <Box className={classes.assignShiftToursContentRowActions}>
          <Box className={classes.assignShiftToursContentRowInfo}>
            <Typography variant="h4" className={classes.assignShiftToursContentRowTitle}>
              {t('obx.schedules.assignDedicatedDuty.assignShift.toursTitle', {
                tours: getLabel('terms', 'tours', t),
              })}
            </Typography>
            <Typography variant="subtitle3" className={classes.assignShiftToursContentRowText}>
              {t('obx.schedules.assignDedicatedDuty.assignShift.toursSubtitle', {
                tours: getLabel('terms', 'tours', t),
              })}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box className={classes.toursInfoBannerBelowSubtitle}>
        <InfoIcon className={classes.toursInfoIcon} />
        <Typography variant="body2" className={classes.toursInfoText}>
          {t('obx.schedules.assignDedicatedDuty.assignShift.toursInfo', {
            defaultValue:
              'These tours will apply to all future shifts, regardless of selected shift type',
          })}
        </Typography>
      </Box>

      {/* TOURS */}
      {formDataTours?.map((formDataTour, index) => (
        <SingleTour
          key={formDataTour?.key}
          changeOnlyDrawerType={changeOnlyDrawerType}
          {...{
            index,
            formDataTours: formDataTours,
            formDataTour,
            setFormDataTours,
            setDeletedTours,
            tourTemplates,
            setTourTemplates,
            reports,
            checkpoints,
            errorMessages: errorMessagesTours[index],
            setErrorMessagesTours,
            readOnlyMode,
          }}
        />
      ))}
    </Box>
  );
};

export default Tours;

Tours.propTypes = {
  changeOnlyDrawerType: PropTypes.func,
  formDataTours: PropTypes.array,
  setFormDataTours: PropTypes.func,
  setDeletedTours: PropTypes.func,
  reports: PropTypes.array,
  checkpoints: PropTypes.array,
  siteId: PropTypes.number,
  errorMessagesTours: PropTypes.array,
  setErrorMessagesTours: PropTypes.func,
  readOnlyMode: PropTypes.bool,
};
