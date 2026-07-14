import { Box, Button, Skeleton, Tooltip, Typography } from '@mui/material';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import { ReactComponent as TrashIcon } from 'assets/svg/trash.svg?react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import FieldError from 'src/app/components/common/fieldError';
import { convertToDraft } from 'src/app/components/common/richText';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import { DeleteAlterIcon, PlusIcon } from 'src/assets/svg';
import { formatDeviceTypeName } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { deleteTourTemplate, fetchTourTemplatesById } from 'src/services/duty.services';
import { fetchSettingsPreferences } from 'src/services/settings.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { DRAWER_TYPE } from 'src/utils/constants/schedules';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import { useStyles } from '../assignmentSideDrawer.styles';
import CreateTourTemplate from '../tourTemplate/CreateTourTemplate';
import Occurances from '../tourTemplate/Occurances';
import { AddTourComp } from '.';

const SingleTour = ({
  index,
  changeOnlyDrawerType,
  formDataTours,
  formDataTour,
  setFormDataTours,
  setDeletedTours,
  tourTemplates,
  setTourTemplates,
  reports,
  checkpoints,
  errorMessages,
  setErrorMessagesTours,
  readOnlyMode,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const [selectedTour, setSelectedTour] = useState({});
  const [fetchingTourDetail, setFetchingTourDetail] = useState(false);
  const [serviceTime, setServiceTime] = useState(120);

  const fetchSettingsServiceTime = async () => {
    try {
      const response = await fetchSettingsPreferences();
      if (response.statusCode === 200) {
        const data = response?.data?.preferences?.visitConfigurations?.[0]?.timeValue ?? 120;
        setServiceTime(data);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    fetchSettingsServiceTime();
  }, []);

  const handleSelectTour = async (e) => {
    try {
      // remove Error Message of selected tour, if exist
      setErrorMessagesTours((prev = []) => {
        const updated = prev.map((tourError, idx) => (index === idx ? undefined : tourError));
        return updated;
      });

      setFetchingTourDetail(true);
      const response = await fetchTourTemplatesById(e.target?.value?.id);
      setSelectedTour({ ...response?.data?.tourTemplate, value: response?.data?.tourTemplate?.id });
      setFetchingTourDetail(false);
    } catch (error) {
      setFetchingTourDetail(false);
      setSelectedTour({});
    }
  };

  const handleInputChangeTours = (e) => {
    setFormDataTours((prev) => {
      return prev.map((data) => {
        if (data?.key === formDataTour?.key) {
          return {
            ...data,
            [e.target.name]: e.target.value,
          };
        }
        return data;
      });
    });

    // remove Error Message
    if (!errorMessages?.[e.target.name]) return;
    setErrorMessagesTours((prev = []) => {
      prev[index][e.target.name] = null;
      return [...prev];
    });
  };

  // populate tour data into form upon selecting a tour template
  useEffect(() => {
    if (!selectedTour?.id) return;

    let tourData = {};
    tourData = {
      name: selectedTour?.name,
      startTime: dayjs(selectedTour?.startTime),
      duration: {
        id: selectedTour?.duration,
        value: selectedTour?.duration,
        label: selectedTour?.duration,
      },
      templateSelected: true,
    };
    if (checkpoints?.length > 0) {
      const tourCheckpointIds = selectedTour?.checkpoints?.map((chkpt) => chkpt?.id);
      tourData.checkpoints = checkpoints
        ?.filter((checkpoint) => tourCheckpointIds?.includes(checkpoint?.id))
        ?.map((checkpoint) => {
          const matchedCheckpoint = selectedTour?.checkpoints?.find(
            (chkpt) => chkpt?.id === checkpoint?.id,
          );
          return {
            ...checkpoint,
            moreDescription: matchedCheckpoint?.description
              ? convertToDraft(matchedCheckpoint?.description)
              : null,
          };
        });
    }
    if (reports?.length > 0) {
      tourData.report = reports?.find((template) => template?.id == selectedTour?.reportId);
    }
    setFormDataTours((prev) => {
      return prev.map((data) => {
        if (data?.key === formDataTour?.key) {
          return {
            ...data,
            ...tourData,
          };
        }
        return data;
      });
    });
  }, [selectedTour, checkpoints, reports]);

  const deleteTour = () => {
    if (formDataTour?.id) {
      // id will only exist, if tour is comming from backend-side
      setDeletedTours((prev) => [...prev, formDataTour]);
    }

    setFormDataTours((prev) => {
      return prev.filter((value) => value?.key !== formDataTour?.key);
    });

    // remove Error Messages
    setErrorMessagesTours((prev = []) => {
      const updated = prev.filter((_tourError, idx) => index !== idx);
      return updated;
    });
  };

  return (
    <TourSelectionLayout
      {...{
        fetchingTourDetail,
        readOnlyMode,
        deleteTour,
        tourName: t('obx.schedules.assignDedicatedDuty.assignShift.defaultTourName', {
          index: index + 1,
          tour: getLabel('terms', 'tour', t),
        }),
        canDelete: true,
      }}
    >
      <>
        {selectedTour?.id || formDataTour?.id || formDataTour?.templateSelected ? (
          <Box className={classes.assignShiftShowToursBodyInside}>
            <CreateTourTemplate
              {...{
                formData: formDataTour,
                handleInputChange: handleInputChangeTours,
                reports,
                checkpoints,
                errorMessages,
                readOnlyMode,
                maxServiceTime: serviceTime,
              }}
            >
              <Occurances
                {...{
                  formData: formDataTour,
                  setFormData: setFormDataTours,
                  errorMessages,
                  index,
                  setErrorMessagesTours,
                  readOnlyMode,
                }}
              />
              {formDataTour?.errors?.map((error, index) => (
                <FieldError key={index} error={error} />
              ))}
            </CreateTourTemplate>
          </Box>
        ) : (
          <TourSelectionDropdown
            {...{
              changeOnlyDrawerType,
              setTourTemplates,
              errorMessages,
              handleSelectTour,
              tourTemplates,
            }}
          />
        )}
        <Box className={classes.singleTourAddWrapper}>
          <Box className={classes.singleTourAdd}>
            {index + 1 === formDataTours?.length && (
              <AddTourComp
                {...{ setFormDataTours, isOptional: true, readOnlyMode }}
                showToursInfo={false}
              />
            )}
          </Box>
        </Box>
      </>
    </TourSelectionLayout>
  );
};

export default SingleTour;

SingleTour.propTypes = {
  index: PropTypes.number,
  changeOnlyDrawerType: PropTypes.func,
  formDataTours: PropTypes.array,
  formDataTour: PropTypes.object,
  setFormDataTours: PropTypes.func,
  setDeletedTours: PropTypes.func,
  tourTemplates: PropTypes.array,
  setTourTemplates: PropTypes.func,
  reports: PropTypes.array,
  checkpoints: PropTypes.array,
  errorMessages: PropTypes.object,
  setErrorMessagesTours: PropTypes.func,
  readOnlyMode: PropTypes.bool,
};

const getDescription = (checkpoint) => {
  if (!checkpoint?.checkpointType || !checkpoint?.locationName) return <></>;
  return <>{formatDeviceTypeName(checkpoint?.checkpointType) + ' • ' + checkpoint?.locationName}</>;
};

export const TourSelectionDropdown = ({
  changeOnlyDrawerType,
  tourTemplates,
  handleSelectTour,
  setTourTemplates,
  errorMessages,
  isPatrol = false,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [deleteableTourTemplate, setDeleteableTourTemplate] = useState(null);
  const { getLabel } = useTenantLabel();
  const deleteTourTemplateHandler = async (data) => {
    try {
      const response = await deleteTourTemplate(data?.id);
      setTourTemplates?.((prev) => prev?.filter((tourTemplate) => tourTemplate?.id !== data?.id));
      toaster.success({
        text: response?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  return (
    <Box className={classes.assignShiftShowToursBody}>
      <CustomDropDown
        label={t('obx.schedules.assignDedicatedDuty.assignShift.selectTourPlaceholder', {
          tour: getLabel('terms', 'tour'),
        })}
        name="selectTour"
        placeHolder={t('obx.schedules.assignDedicatedDuty.assignShift.selectTourPlaceholder', {
          tour: getLabel('terms', 'tour'),
        })}
        selectedValues={{}}
        additionalOption={
          <Box
            onClick={() =>
              changeOnlyDrawerType(
                isPatrol ? DRAWER_TYPE.TOUR_TEMPLATE_PATROL : DRAWER_TYPE.TOUR_TEMPLATE,
              )()
            }
            className={classNames(classes.customDropdownOptionLink)}
          >
            <PlusIcon />
            <Typography variant="body2">
              {t('obx.schedules.assignDedicatedDuty.assignShift.tourCreateBtn', {
                tour: getLabel('terms', 'tour'),
              })}
            </Typography>
          </Box>
        }
        options={transformArrayForOptions(tourTemplates, '', 'id') || []}
        handleChange={handleSelectTour}
        className={classes.assignShiftShowToursBodyDropDown}
        multiSelect={false}
        bordered
        overrideOption={(data) => {
          const description = getDescription(data?.checkpoints?.[0] || {});
          const tooltipData = data?.checkpoints?.map((checkpoint, index) => {
            return <div key={index}>{getDescription(checkpoint || {})}</div>;
          });
          return (
            <Box className={classes.singleTourOption}>
              <Box style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Box>
                  <Typography variant="h4" className={classes.singleTourOptionTitle}>
                    {capitalizeFirstLetter(data?.name)}
                  </Typography>
                  <Typography variant="body2" className={classes.singleTourOptionDescText}>
                    <Tooltip
                      PopperProps={{ style: { zIndex: 10000 } }}
                      arrow
                      title={tooltipData}
                      slotProps={{
                        popper: {
                          modifiers: [
                            {
                              name: 'offset',
                              options: {
                                offset: [0, -14],
                              },
                            },
                          ],
                        },
                      }}
                    >
                      {description?.length > 80
                        ? description.substring(0, 80) + '...'
                        : description}
                    </Tooltip>
                  </Typography>
                </Box>

                <Button
                  disableRipple
                  className={classes.singleTourOptionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteableTourTemplate(data);
                  }}
                >
                  <CloseIcon />
                </Button>
              </Box>
            </Box>
          );
        }}
        isError={!!errorMessages}
      />

      <SweetAlertModal
        type="warning"
        title={t(
          'obx.schedules.assignDedicatedDuty.assignShift.deleteTourTemplateConfirmation.title',
          {
            tour: getLabel('terms', 'tour'),
          },
        )}
        text={t(
          'obx.schedules.assignDedicatedDuty.assignShift.deleteTourTemplateConfirmation.description',
          {
            tour: getLabel('terms', 'tour'),
          },
        )}
        confirmButtonText={t(
          'obx.schedules.assignDedicatedDuty.assignShift.deleteTourTemplateConfirmation.deleteBtn',
          {
            tour: getLabel('terms', 'tour'),
          },
        )}
        cancelButtonText={t(
          'obx.schedules.assignDedicatedDuty.assignShift.deleteTourTemplateConfirmation.cancelBtn',
          {
            tour: getLabel('terms', 'tour'),
          },
        )}
        show={!!deleteableTourTemplate}
        handleConfirmButton={() => deleteTourTemplateHandler(deleteableTourTemplate)}
        handleCancelButton={() => setDeleteableTourTemplate(null)}
        reverseButtons={true}
        icon={<DeleteAlterIcon />}
      />
    </Box>
  );
};

TourSelectionDropdown.propTypes = {
  changeOnlyDrawerType: PropTypes.func,
  handleSelectTour: PropTypes.func,
  setTourTemplates: PropTypes.func,
  tourTemplates: PropTypes.array,
  errorMessages: PropTypes.object,
  isPatrol: PropTypes.bool,
};

export const TourSelectionLayout = ({
  children,
  fetchingTourDetail,
  readOnlyMode,
  deleteTour,
  tourName,
  canDelete,
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.assignShiftShowTours}>
      <Box className={classes.assignShiftShowToursHeader}>
        <Typography variant="h4" className={classes.assignShiftShowToursTitle}>
          {tourName}
        </Typography>
        {canDelete && (
          <TrashIcon
            className={classNames(
              classes.assignShiftToursDelete,
              readOnlyMode ? classes.assignShiftToursDeleteDisable : '',
            )}
            opacity={readOnlyMode ? 0.5 : 1}
            onClick={deleteTour}
          />
        )}
      </Box>
      {fetchingTourDetail ? (
        <Box className={classes.singleTourSkeleton}>
          <Skeleton animation="wave" />
          <Skeleton animation="wave" />
          <Skeleton animation="wave" />
        </Box>
      ) : (
        <>{children}</>
      )}
    </Box>
  );
};

TourSelectionLayout.propTypes = {
  fetchingTourDetail: PropTypes.func,
  readOnlyMode: PropTypes.bool,
  deleteTour: PropTypes.func,
  tourName: PropTypes.string,
  children: PropTypes.node,
  canDelete: PropTypes.bool,
};
