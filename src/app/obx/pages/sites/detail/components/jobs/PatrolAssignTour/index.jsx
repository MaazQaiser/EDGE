import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { convertDataToHtml, convertToDraft } from 'src/app/components/common/richText';
import SideDrawer from 'src/app/components/common/sideDrawer';
import { formatDeviceTypeName } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useFormHook from 'src/hooks/useFormHook';
import {
  addTourToHit,
  createTourTemplate,
  fetchCheckpointsBySiteId,
  fetchTourTemplatesById,
  fetchTourTemplatesBySiteId,
  getReportTemplatesList,
} from 'src/services/duty.services';
import { getHitsDetailDataForRunSheet } from 'src/services/runsheet.services';
import { fetchSettingsPreferences } from 'src/services/settings.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { DRAWER_TYPE, SCHEDULE_DUTIES_TOUR_TEMPLATES } from 'src/utils/constants/schedules';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from '../assignmentSideDrawer/assignmentSideDrawer.styles';
import {
  TourSelectionDropdown,
  TourSelectionLayout,
} from '../assignmentSideDrawer/AssignShift/SingleTour';
import Layout from '../assignmentSideDrawer/Layout';
import CreateTourTemplate from '../assignmentSideDrawer/tourTemplate/CreateTourTemplate';

export const defaultPatrolCreateTourTemplateValues = {
  name: '',
  checkpoints: [],
  report: {},
  serviceTime: '',
};

const PatrolAssignTour = ({
  drawerData,
  closeSideDrawer,
  changeOnlyDrawerType,
  callbackUponAssignment,
  canDelete,
}) => {
  const classes = useStyles();
  const { getLabel } = useTenantLabel();
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const { formData, setFormData, handleInputChange, errorMessages, setErrorMessages } = useFormHook(
    {
      defaultFormData: defaultPatrolCreateTourTemplateValues,
    },
  );

  const [disableActionBtn, setDisableActionBtn] = useState(false);
  const [hitDetail, setHitDetail] = useState({});

  const [selectedTour, setSelectedTour] = useState({});
  const [fetchingTourDetail, setFetchingTourDetail] = useState(false);
  const [serviceTime, setServiceTime] = useState(120);

  const {
    formData: formDataTour,
    setFormData: setFormDataTour,
    handleInputChange: handleInputChangeTour,
    errorMessages: errorMessagesTour,
    setErrorMessages: setErrorMessagesTour,
  } = useFormHook({});

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

  const [tourTemplates, setTourTemplates] = useState([]);

  const getTourTemplates = async (siteId) => {
    try {
      const response = await fetchTourTemplatesBySiteId(
        siteId,
        SCHEDULE_DUTIES_TOUR_TEMPLATES.PATROL,
      );

      setTourTemplates(response.data?.tourTemplates || []);
    } catch (error) {
      setTourTemplates([]);
    }
  };

  const getReportTemplates = async (siteId) => {
    try {
      const response = await getReportTemplatesList(siteId);
      const reportTemplatesRes =
        transformArrayForOptions(response.data?.templates, 'title', 'id', 'description') || [];
      setReports(reportTemplatesRes);
    } catch (error) {
      setReports([]);
    }
  };
  const getCheckpointsOfSite = async (siteId) => {
    try {
      const response = await fetchCheckpointsBySiteId(siteId);
      const updatedCheckpoints = response?.data?.checkpoints?.map((checkpoint) => ({
        ...checkpoint,
        locationName: checkpoint?.location?.locationName,
      }));
      const checkpointsRes =
        transformArrayForOptions(updatedCheckpoints, 'checkpointType', 'id', 'locationName') || [];

      const checkPointUpdates = checkpointsRes?.map((a) => {
        return {
          ...a,
          ['label']: formatDeviceTypeName(a.label),
        };
      });

      setCheckpoints(checkPointUpdates);
    } catch (error) {
      setCheckpoints([]);
    }
  };

  const getHitDetail = async (hitId) => {
    try {
      setLoading(true);
      setHitDetail({});

      setFormDataTour({});
      // setFormDataTours([]);

      const response = await getHitsDetailDataForRunSheet(hitId);
      const hitDetail = response?.data || {};
      // const tourDetail = hitDetail?.tour || {};

      setHitDetail(hitDetail);
      // setFormDataTour(tourDetail);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setHitDetail({});
      setFormDataTour({});
    }
  };

  const joiValidateTourTemplatePatrol = async (formData, setErrorMessages) => {
    const joiValidatePayload = {
      name: formData?.name,
      report: formData?.report?.value || '',
      serviceTime: formData?.serviceTime,
    };

    const errors = await joiValidate({ tourTemplatePatrol: joiValidatePayload }, t);
    const serviceTimeRangeError = formData?.serviceTime < 1 || formData?.serviceTime > serviceTime;

    if ((errors && Object.keys(errors).length) || serviceTimeRangeError) {
      const updatedErrors = Object.entries(errors)?.reduce((acc, [key, value]) => {
        const [_joiKey, fieldName] = key.split(',');
        return { ...acc, [fieldName]: value };
      }, {});

      if (!updatedErrors.serviceTime && serviceTimeRangeError) {
        updatedErrors.serviceTime = t(
          'obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.serviceTimeBoundError',
          {
            max: serviceTime,
          },
        );
      }
      setErrorMessages(updatedErrors);

      return true;
    }
    return false;
  };

  const handleSubmit = async () => {
    if (drawerData?.type === DRAWER_TYPE.TOUR_TEMPLATE_PATROL) {
      const isError = await joiValidateTourTemplatePatrol(formData, setErrorMessages);
      if (isError) return;

      // Create Tour Template
      const payload = {
        name: formData?.name,
        reportId: formData?.report?.value,
        duration: formData?.serviceTime,
        jobType: SCHEDULE_DUTIES_TOUR_TEMPLATES.PATROL,
        checkpoints: formData?.checkpoints?.map((checkpoint) => ({
          checkpointId: checkpoint?.value,
          description: checkpoint?.moreDescription
            ? convertDataToHtml(checkpoint?.moreDescription)
            : null,
        })),
      };

      try {
        setDisableActionBtn(true);
        const response = await createTourTemplate({ payload, siteId: drawerData?.siteId });

        changeOnlyDrawerType(DRAWER_TYPE.TOUR_ASSIGNMENT)();
        getTourTemplates(drawerData?.siteId);
        setFormData(defaultPatrolCreateTourTemplateValues);
        setDisableActionBtn(false);
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      } catch (error) {
        setDisableActionBtn(false);
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }

      return;
    }
    if (drawerData?.type === DRAWER_TYPE.TOUR_ASSIGNMENT) {
      const isError = await joiValidateTourTemplatePatrol(formDataTour, setErrorMessagesTour);
      if (isError) return;

      try {
        setDisableActionBtn(true);

        // Create/Edit Tour Template
        const payload = {
          tour: {
            id: hitDetail?.tour?.id || undefined,
            title: formDataTour?.name,
            reportTemplateId: Number(formDataTour?.report?.value),
            duration: Number(formDataTour?.serviceTime),
            checkpoints: formDataTour?.checkpoints?.map((checkpoint) => ({
              ...checkpoint,
              reportTemplateId: checkpoint?.templateId,
              description: checkpoint?.moreDescription
                ? convertDataToHtml(checkpoint?.moreDescription)
                : null,
            })),
          },
        };
        const response = await addTourToHit({ hitId: drawerData?.hitId, payload });

        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        closeSideDrawer();
        callbackUponAssignment(drawerData?.hitId);
        setDisableActionBtn(false);
      } catch (error) {
        setDisableActionBtn(false);
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }

      return;
    }
  };

  useEffect(() => {
    getReportTemplates(drawerData?.siteId);
    getCheckpointsOfSite(drawerData?.siteId);
    getHitDetail(drawerData?.hitId);
    getTourTemplates(drawerData?.siteId);
  }, []);

  const clearTemplateStates = () => {
    setFormData(defaultPatrolCreateTourTemplateValues);
  };

  const handleSelectTour = async (e) => {
    try {
      // remove Error Message of selected tour, if exist
      setErrorMessagesTour({});

      setFetchingTourDetail(true);
      const response = await fetchTourTemplatesById(e.target?.value?.id);

      setSelectedTour({
        ...response?.data?.tourTemplate,
        value: response?.data?.tourTemplate?.id + '',
        serviceTime: response?.data?.tourTemplate?.duration + '',
      });
      setFetchingTourDetail(false);
    } catch (error) {
      setFetchingTourDetail(false);
      setSelectedTour({});
    }
  };

  // populate tour data into form upon selecting a tour template
  useEffect(() => {
    if (!selectedTour?.id) return;

    let tourData = {};
    tourData = {
      name: selectedTour?.name,
      serviceTime: selectedTour?.serviceTime,
      templateSelected: true,
    };

    if (checkpoints?.length > 0 && selectedTour?.checkpoints?.length > 0) {
      const checkpointIds = selectedTour?.checkpoints?.map((chkpt) => chkpt?.id);
      tourData.checkpoints = checkpoints
        ?.filter((checkpoint) => checkpointIds?.includes(checkpoint?.id))
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
    setFormDataTour(tourData);
  }, [selectedTour, checkpoints, reports]);

  const deleteTour = () => {
    setFormDataTour({});
    setSelectedTour({});

    // remove Error Messages
    setErrorMessagesTour({});
  };

  const populateAssignedTour = ({ tour, checkpoints, reports }) => {
    const tourCheckpointIds = tour?.checkpoints?.map((chkpt) => chkpt?.id);
    const matchedCheckpoints = checkpoints
      ?.filter((checkpoint) => tourCheckpointIds?.includes(checkpoint?.id))
      ?.map((checkpoint) => {
        const matchedCheckpoint = tour?.checkpoints?.find((chkpt) => chkpt?.id === checkpoint?.id);
        return {
          ...checkpoint,
          moreDescription: matchedCheckpoint?.description
            ? convertToDraft(matchedCheckpoint?.description)
            : null,
        };
      });

    const updatedTour = {
      id: tour?.id,
      name: tour?.title,
      checkpoints: matchedCheckpoints,
      report: reports?.find((report) => report?.id == tour?.reportTemplateId),
      serviceTime: tour?.duration + '',
    };

    setFormDataTour(updatedTour);
  };

  // Populate tours if tours are already assigned to selected shift date
  useEffect(() => {
    if (!!hitDetail?.tour && reports?.length > 0) {
      populateAssignedTour({ tour: hitDetail?.tour, checkpoints, reports });
    }
  }, [hitDetail?.tour, checkpoints, reports]);

  return (
    <SideDrawer totalWidth={'720px'} isOpen={!!drawerData?.type}>
      <Layout
        drawerData={drawerData}
        changeOnlyDrawerType={changeOnlyDrawerType}
        closeSideDrawer={closeSideDrawer}
        handleSubmit={handleSubmit}
        clearTemplateStates={clearTemplateStates}
        shiftDetail={{}}
        loading={loading}
        disableActionBtn={disableActionBtn}
        isPatrol={true}
        title={
          drawerData?.type === DRAWER_TYPE.TOUR_TEMPLATE_PATROL
            ? ''
            : hitDetail?.tour
              ? t('obx.schedules.assignDedicatedDuty.assignShift.patrolTour.editTourAssignment', {
                  tour: getLabel('terms', 'tour'),
                })
              : t('obx.schedules.assignDedicatedDuty.assignShift.patrolTour.tourAssignment', {
                  tour: getLabel('terms', 'tour'),
                })
        }
      >
        <Box className={classes.TourTemplatesDrawerWrapper}>
          {drawerData?.type === DRAWER_TYPE.TOUR_TEMPLATE_PATROL ? (
            // Create Tour Template on site level
            <CreateTourTemplate
              {...{
                formData,
                handleInputChange,
                reports,
                checkpoints,
                errorMessages,
                setFormData,
                setErrorMessages,
                isPatrol: true,
                maxServiceTime: serviceTime,
              }}
            />
          ) : (
            // Add Tour to a hit
            <TourSelectionLayout
              {...{
                fetchingTourDetail: fetchingTourDetail || loading,
                deleteTour,
                tourName: t(
                  'obx.schedules.assignDedicatedDuty.assignShift.patrolTour.tourTemplateTitle',
                  {
                    tour: getLabel('terms', 'tour'),
                  },
                ),
                canDelete:
                  canDelete === false ? canDelete : Object.keys(formDataTour || {}).length > 0,
              }}
            >
              <>
                {selectedTour?.id || formDataTour?.id || formDataTour?.templateSelected ? (
                  <Box className={classes.assignShiftShowToursBodyInside}>
                    <CreateTourTemplate
                      {...{
                        formData: formDataTour,
                        handleInputChange: handleInputChangeTour,
                        reports,
                        checkpoints,
                        errorMessages: errorMessagesTour,
                        isPatrol: true,
                        maxServiceTime: serviceTime,
                      }}
                    />
                  </Box>
                ) : (
                  <TourSelectionDropdown
                    {...{
                      changeOnlyDrawerType,
                      tourTemplates,
                      handleSelectTour,
                      setTourTemplates,
                      errorMessages: Object.keys(errorMessagesTour || {}).length,
                      isPatrol: true,
                    }}
                  />
                )}
              </>
            </TourSelectionLayout>
          )}
        </Box>
      </Layout>
    </SideDrawer>
  );
};

export default PatrolAssignTour;

PatrolAssignTour.propTypes = {
  drawerData: PropTypes.object,
  closeSideDrawer: PropTypes.func,
  callbackUponAssignment: PropTypes.func,
  changeOnlyDrawerType: PropTypes.func,
  canDelete: PropTypes.bool,
};

PatrolAssignTour.defaultProps = {
  drawerData: {},
  closeSideDrawer: () => {},
  callbackUponAssignment: () => {},
  changeOnlyDrawerType: () => {},
  canDelete: true,
};
