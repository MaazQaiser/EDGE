import { Box, Button } from '@mui/material';
import { Step, StepLabel, Stepper, Typography } from '@mui/material';
import { ReactComponent as DemandServicesIcon } from 'assets/svg/add-file.svg?react';
import { ReactComponent as CheckIcon } from 'assets/svg/checked.svg?react';
import { ReactComponent as DevicesIcon } from 'assets/svg/device-signal.svg?react';
import { ReactComponent as PaymentIcon } from 'assets/svg/dollar-sign.svg?react';
import { ReactComponent as PeopleIcon } from 'assets/svg/feather.svg?react';
import { ReactComponent as DescriptionIcon } from 'assets/svg/file-text.svg?react';
import { ReactComponent as ServicesIcon } from 'assets/svg/services.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { acknowledgeAddendumContract, getAddendumHistory } from 'services/sites.services';
import ModalComponent from 'src/app/components/common/modal';
import { useApiControllers } from 'src/helper/axios';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useFormHook from 'src/hooks/useFormHook';
import { toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import { useStyles } from './addendumModal';
import Description from './steps/description';
import Devices from './steps/devices';
import OnDemandServices from './steps/onDemandServices';
import PaymentTerms from './steps/paymentTerms';
import Services from './steps/services';
import Signees from './steps/signees';

const stepKeys = {
  services: 'services',
  devices: 'devices',
  onDemandServices: 'onDemandServices',
  paymentTerms: 'paymentTerms',
  description: 'description',
  signees: 'signees',
};

const defaultSteps = (t) => [
  {
    label: t('obx.requireAttention.serviceStepperTitle'),
    subtext: t('obx.requireAttention.serviceStepperSubText'),
    icon: <ServicesIcon />,
    completed: false,
    key: stepKeys.services,
  },
  {
    label: t('obx.requireAttention.devicesStepperTitle'),
    subtext: t('obx.requireAttention.devicesStepperSubText'),
    icon: <DevicesIcon />,
    completed: false,
    key: stepKeys.devices,
  },
  {
    label: t('obx.requireAttention.onDemandServiceStepperTitle'),
    subtext: t('obx.requireAttention.onDemandServiceStepperSubText'),
    icon: <DemandServicesIcon />,
    completed: false,
    key: stepKeys.onDemandServices,
  },
  {
    label: t('obx.requireAttention.paymentTermsStepperTitle'),
    subtext: t('obx.requireAttention.paymentTermsStepperSubText'),
    icon: <PaymentIcon />,
    completed: false,
    key: stepKeys.paymentTerms,
  },
  {
    label: t('obx.requireAttention.descriptionStepperTitle'),
    subtext: t('obx.requireAttention.descriptionStepperSubText'),
    icon: <DescriptionIcon />,
    completed: false,
    key: stepKeys.description,
  },
  {
    label: t('obx.requireAttention.signeesStepperTitle'),
    subtext: t('obx.requireAttention.signeesStepperSubText'),
    icon: <PeopleIcon />,
    completed: false,
    key: stepKeys.signees,
  },
];

const renderStepContent = ({ key, ...props }) => {
  const components = {
    [stepKeys.services]: <Services key={key} {...props} />,
    [stepKeys.devices]: <Devices key={key} {...props} />,
    [stepKeys.onDemandServices]: <OnDemandServices key={key} {...props} />,
    [stepKeys.paymentTerms]: <PaymentTerms key={key} {...props} />,
    [stepKeys.description]: <Description key={key} {...props} />,
    [stepKeys.signees]: <Signees key={key} {...props} />,
  };

  return components[key];
};

const AddendumModalBody = ({ id, handleCloseModal, source }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const defaultDefinedSteps = defaultSteps(t);

  const { getNewApiController } = useApiControllers();

  const [loading, setLoading] = useState(true);
  const [submitCalled, setSubmitCalled] = useState(false);
  const [changeHistory, setChangeHistory] = useState({});

  const [steps, setSteps] = useState([]);
  const [activeStepKey, setActiveStepKey] = useState(stepKeys.services);

  const isDispatchOnlyContract = (changeHistory) => {
    if (changeHistory?.isDispatchContract) {
      // Filter out services and devices steps for dispatch-only contracts
      const filteredSteps = defaultDefinedSteps.filter(
        (step) => step.key !== stepKeys.services && step.key !== stepKeys.devices,
      );
      setSteps(filteredSteps);
      // Set to first available step (onDemandServices) after filtering
      setActiveStepKey(filteredSteps[0]?.key || stepKeys.onDemandServices);
    } else {
      setSteps(defaultDefinedSteps);
      setActiveStepKey(stepKeys.services);
    }
  };

  const {
    handleInputChange,
    formData,
    setFormData,
    updateFormHandler,
    errorMessages,
    setErrorMessages,
    // setDisabled,
  } = useFormHook({
    defaultFormData: [
      // {
      //   serviceId: 1,
      //   shiftIds: [], //[2, 4],
      // },
    ],
  });

  const validateAddendumForm = async () => {
    const addendumContracts = [...formData];

    const errors = await joiValidate({ addendumContracts }, t);

    if (errors && Object.keys(errors).length) {
      console.log({ errors });
      setErrorMessages(errors);
      setActiveStepKey(stepKeys.services);
      return false;
    }
    return true;
  };

  const resetStepsCompletion = () => {
    setSteps((prevSteps) =>
      prevSteps.map((step) => ({
        ...step,
        completed: false,
      })),
    );
  };

  // Function to process the update
  const checkIfAllTheRespectiveShiftsAreSelected = (data, formData) => {
    let errorsObj = {};
    setErrorMessages({});
    // data?.services?.forEach((service) => {
    //   if (service?.action === 'updated' && service?.shiftsToDelete?.length > 0) {
    //     // Get the serviceId from the first shiftToDelete (all shifts are the same)
    //     const serviceId = service?.shiftsToDelete?.[0]?.serviceId?.toString();
    //
    //     // Find the corresponding formData entry by serviceId
    //     const formEntry = formData?.find((entry) => entry?.serviceId === serviceId);
    //
    //     if (formEntry) {
    //       // Compare shiftIds.length with officersChange.new
    //       if (formEntry?.shiftIds?.length < Number(service?.officersChange?.new)) {
    //         errorsObj = {
    //           ...errorsObj,
    //           [`addendumContracts,${formData?.indexOf(formEntry)},shiftIds`]: `${t(
    //             'obx.requireAttention.shiftSelectErrorMin',
    //             {
    //               number: `${service?.officersChange?.new}`,
    //             },
    //           )}`,
    //         };
    //       } else if (formEntry?.shiftIds?.length > Number(service?.officersChange?.new)) {
    //         errorsObj = {
    //           ...errorsObj,
    //           [`addendumContracts,${formData?.indexOf(formEntry)},shiftIds`]: `${t(
    //             'obx.requireAttention.shiftSelectErrorMax',
    //             {
    //               number: `${service?.officersChange?.new}`,
    //             },
    //           )}`,
    //         };
    //       }
    //     }
    //   }
    // });

    const dedicatedDeletedShifts = data?.services
      ?.filter((service) => {
        // Filter services that match criteria
        return (
          service?.action === 'updated' &&
          service?.serviceType === 'Dedicated' &&
          service?.visits?.some((visit) => visit?.shiftsToDelete?.length > 0)
        );
      })
      ?.map((service) => ({
        // Update the filtered services' visits array
        ...service,
        visits: service?.visits?.filter((visit) => visit?.shiftsToDelete?.length > 0),
      }));

    const patrolDeletedVisits = data?.services
      ?.filter((service) => {
        // Filter services that match criteria
        return (
          service?.action === 'updated' &&
          service?.serviceType === 'Patrol' &&
          service?.visits?.some((visit) => visit?.shiftsToDelete?.length > 0)
        );
      })
      ?.map((service) => ({
        // Update the filtered services' visits array
        ...service,
        visits: service?.visits?.filter((visit) => visit?.shiftsToDelete?.length > 0),
      }));

    dedicatedDeletedShifts?.forEach((service, serviceIndex) => {
      service?.visits?.forEach((visit, visitIndex) => {
        if (visit?.shiftsToDelete?.length > 0) {
          // Get the serviceId from the first shiftToDelete (all shifts are the same)
          const serviceId = visit?.shiftsToDelete?.[0]?.serviceId?.toString();

          const visitId = visit?.shiftsToDelete?.[0]?.visitId?.toString();

          // Find the corresponding formData entry by serviceId
          const formEntry = formData?.find(
            (entry) =>
              entry?.serviceId === serviceId &&
              entry?.visitId?.toString() === visitId?.toString() &&
              entry?.serviceType === 'Dedicated',
          );

          if (formEntry) {
            // Compare shiftIds.length with officersChange.new
            if (formEntry?.shiftIds?.length < Number(visit?.officersChange?.new)) {
              errorsObj = {
                ...errorsObj,
                [`addendumContracts,${serviceIndex}-${visitIndex},dedicatedShiftIds`]:
                  service?.serviceType === 'Patrol'
                    ? `${t('obx.requireAttention.hitSelectErrorMin', {
                        number: `${visit?.officersChange?.new}`,
                        hits: getLabel('terms', 'hits', t).toLowerCase(),
                      })}`
                    : `${t('obx.requireAttention.shiftSelectErrorMin', {
                        number: `${visit?.officersChange?.new}`,
                      })}`,
              };
            } else if (formEntry?.shiftIds?.length > Number(visit?.officersChange?.new)) {
              errorsObj = {
                ...errorsObj,
                [`addendumContracts,${serviceIndex}-${visitIndex},dedicatedShiftIds`]:
                  service?.serviceType === 'Patrol'
                    ? `${t('obx.requireAttention.hitSelectErrorMax', {
                        number: `${visit?.officersChange?.new}`,
                        hits: getLabel('terms', 'hits', t).toLowerCase(),
                      })}`
                    : `${t('obx.requireAttention.shiftSelectErrorMax', {
                        number: `${visit?.officersChange?.new}`,
                      })}`,
              };
            }
          }
        }
      });
    });
    patrolDeletedVisits?.forEach((service, serviceIndex) => {
      service?.visits?.forEach((visit, visitIndex) => {
        if (visit?.shiftsToDelete?.length > 0) {
          // Get the serviceId from the first shiftToDelete (all shifts are the same)
          const serviceId = visit?.shiftsToDelete?.[0]?.serviceId?.toString();

          const visitId = visit?.shiftsToDelete?.[0]?.visitId?.toString();

          // Find the corresponding formData entry by serviceId
          const formEntry = formData?.find(
            (entry) =>
              entry?.serviceId === serviceId &&
              entry?.visitId?.toString() === visitId?.toString() &&
              entry?.serviceType !== 'Dedicated',
          );

          if (formEntry) {
            // Compare shiftIds.length with officersChange.new
            if (formEntry?.shiftIds?.length < Number(visit?.officersChange?.new)) {
              errorsObj = {
                ...errorsObj,
                [`addendumContracts,${serviceIndex}-${visitIndex},patrolShiftIds`]: `${t(
                  'obx.requireAttention.shiftSelectErrorMin',
                  {
                    number: `${visit?.officersChange?.new}`,
                  },
                )}`,
              };
            } else if (formEntry?.shiftIds?.length > Number(visit?.officersChange?.new)) {
              errorsObj = {
                ...errorsObj,
                [`addendumContracts,${serviceIndex}-${visitIndex},patrolShiftIds`]:
                  service?.serviceType === 'Patrol'
                    ? `${t('obx.requireAttention.hitSelectErrorMax', {
                        number: `${visit?.officersChange?.new}`,
                        hits: getLabel('terms', 'hits', t).toLowerCase(),
                      })}`
                    : `${t('obx.requireAttention.shiftSelectErrorMax', {
                        number: `${visit?.officersChange?.new}`,
                      })}`,
              };
            }
          } else {
            errorsObj = {
              ...errorsObj,
              [`addendumContracts,${serviceIndex}-${visitIndex},patrolShiftIds`]:
                service?.serviceType === 'Patrol'
                  ? `${t('obx.requireAttention.hitSelectErrorMin', {
                      number: `${visit?.officersChange?.new}`,
                      hits: getLabel('terms', 'hits', t).toLowerCase(),
                    })}`
                  : `${t('obx.requireAttention.shiftSelectErrorMin', {
                      number: `${visit?.officersChange?.new}`,
                    })}`,
            };
          }
        }
      });
    });
    setErrorMessages((prev) => ({
      ...prev,
      ...errorsObj,
    }));
    return !isObjectEmpty(errorsObj);
  };

  const checkValidations = async () => {
    // Extract unique serviceIds
    const uniqueServiceIds = [...new Set(formData?.map((item) => item.serviceId))];

    if (
      (Number(changeHistory?.totalServicesToAcknowledge) > 0 && !uniqueServiceIds?.length) ||
      uniqueServiceIds?.length !== Number(changeHistory?.totalServicesToAcknowledge)
    ) {
      // TODO: show toast to select the shifts from all the services
      setActiveStepKey(stepKeys.services);

      resetStepsCompletion();

      toaster.error({
        text: `${t('obx.requireAttention.selectShiftFromAllServicesError', {
          numberOfServiceToAcknowledge: `${changeHistory?.totalServicesToAcknowledge}`,
        })}`,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return false;
    }

    // check if the selected shift ids are equal to the no of the shifts required
    if (checkIfAllTheRespectiveShiftsAreSelected(changeHistory, formData)) {
      // Go to service step
      setActiveStepKey(stepKeys.services);
      resetStepsCompletion();

      return false;
    }

    // If formData exists then Go for validation
    if (formData?.length && !(await validateAddendumForm())) {
      // if there are errors return;
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    //
    // if (
    //   (Number(changeHistory?.totalServicesToAcknowledge) > 0 && !formData?.length) ||
    //   formData?.length !== Number(changeHistory?.totalServicesToAcknowledge)
    // ) {
    //   // TODO: show toast to select the shifts from all the services
    //   setActiveStep(1);
    //
    //   resetStepsCompletion();
    //
    //   toaster.error({
    //     text: `${t('obx.requireAttention.selectShiftFromAllServicesError', {
    //       numberOfServiceToAcknowledge: `${changeHistory?.totalServicesToAcknowledge}`,
    //     })}`,
    //     position: 'top-right',
    //     autoClose: toastSettings.AUTO_CLOSE,
    //   });
    //   return;
    // }
    //
    // // check if the selected shift ids are equal to the no of the shifts required
    // if (checkIfAllTheRespectiveShiftsAreSelected(changeHistory, formData)) {
    //   // Go to service step
    //   setActiveStep(1);
    //   resetStepsCompletion();
    //
    //   return;
    // }
    //
    // // If formData exists then Go for validation
    // if (formData?.length && !(await validateAddendumForm())) {
    //   // if there are errors return;
    //   return;
    // }
    // console.log('')
    if (!changeHistory?.isDispatchContract && !(await checkValidations())) {
      return;
    }

    setErrorMessages({});
    setSubmitCalled(true);

    try {
      // Create a dictionary to track unique serviceIds and their shiftIds
      let serviceMap = {};

      formData.forEach((entry) => {
        let serviceId = entry.serviceId;
        if (!serviceMap[serviceId]) {
          serviceMap[serviceId] = { shiftIds: [] };
        }

        // Extend the shiftIds, avoiding duplicates
        serviceMap[serviceId].shiftIds.push(...entry.shiftIds);
      });

      // Prepare the output
      let outputData = { formData: [] };

      Object.keys(serviceMap).forEach((serviceId) => {
        outputData.formData.push({
          serviceId: serviceId,
          shiftIds: [...new Set(serviceMap[serviceId].shiftIds)], // Ensure uniqueness of shiftIds
        });
      });

      const payload = {
        services: outputData,
      };

      // Call the acknowledgement API
      const response = await acknowledgeAddendumContract(id, outputData?.length ? payload : {});
      if (response?.statusCode === 200) {
        // TODO: set loading to false and close modal
        setSubmitCalled(false);
        handleCloseModal();
      }
    } catch (e) {
      setSubmitCalled(false);
      // Do what you want
      handleCloseModal();
    }
  };

  const handleNext = async () => {
    const currentIndex = steps?.findIndex((step) => step?.key === activeStepKey);

    // Validate if needed (e.g., for first step)
    if (activeStepKey === stepKeys.services && !(await checkValidations())) {
      return;
    }

    // Update completed status
    setSteps((prevSteps) =>
      prevSteps.map((step) => (step?.key === activeStepKey ? { ...step, completed: true } : step)),
    );

    // Move to next step if available
    if (currentIndex < steps?.length - 1) {
      const nextStepKey = steps?.[currentIndex + 1]?.key;
      setActiveStepKey(nextStepKey);
    }
  };
  const handleBack = () => {
    const currentIndex = steps.findIndex((step) => step.key === activeStepKey);
    if (currentIndex <= 0) return;

    // Mark current step as not completed when going back
    setSteps((prevSteps) =>
      prevSteps.map((step) => (step.key === activeStepKey ? { ...step, completed: false } : step)),
    );

    const previousStepKey = steps[currentIndex - 1].key;
    setActiveStepKey(previousStepKey);
  };

  const CustomStepIcon = ({ completed, active, icon }) => {
    if (completed) {
      return (
        <div className={`${classes.stepIcon} completed`}>
          <CheckIcon />
        </div>
      );
    }
    if (active) {
      return <div className={`${classes.stepIcon} active`}>{icon}</div>;
    }
    return <div className={classes.stepIcon}>{icon}</div>;
  };
  CustomStepIcon.propTypes = {
    completed: PropTypes.bool,
    active: PropTypes.bool,
    icon: PropTypes.node,
  };

  const getChangeHistory = async (id) => {
    setLoading(true);
    const apiController = getNewApiController();
    try {
      const response = await getAddendumHistory(id, { signal: apiController.signal });
      if (response?.statusCode === 200) {
        setChangeHistory(response?.data);
        isDispatchOnlyContract(response?.data);
        // Sample response required from BE. Do not remove
        // let dummyData = {
        //   data: {
        //     signee: [],
        //     // devices: [],
        //     // services: [
        //     //   {
        //     //     action: 'updated',
        //     //     visits: [
        //     //       {
        //     //         type: 'Random',
        //     //         action: 'updated',
        //     //         changes: [
        //     //           {
        //     //             key: 'Id',
        //     //             new: '749',
        //     //             old: '747',
        //     //           },
        //     //           {
        //     //             key: 'Visits',
        //     //             new: '1',
        //     //             old: '2',
        //     //           },
        //     //         ],
        //     //         officersChange: {
        //     //           key: 'Visits',
        //     //           new: '1',
        //     //           old: '2',
        //     //         },
        //     //         shiftsToDelete: [
        //     //           {
        //     //             id: '6810d805e34aebb9e18f3c7c',
        //     //             name: 'Hit 1',
        //     //             startTime: '2025-04-29T20:00:00.000Z',
        //     //             endTime: '2025-05-31T21:00:00.000Z',
        //     //             shiftDays: [2],
        //     //             isSplit: false,
        //     //             parentId: '',
        //     //             visitId: 706,
        //     //             officer: {
        //     //               id: 1158,
        //     //               name: 'kyle',
        //     //               email: 'kyle@yopmail.com',
        //     //               imageUrl:
        //     //                 'https://signalassets.blob.core.windows.net/signal/assets/Avatar.png',
        //     //               phoneNumber: null,
        //     //             },
        //     //             children: [],
        //     //             serviceId: 4180,
        //     //           },
        //     //           {
        //     //             id: '6810d805e34aebb9e18f3c7d',
        //     //             name: 'Hit 2',
        //     //             startTime: '2025-04-29T20:00:00.000Z',
        //     //             endTime: '2025-05-31T21:00:00.000Z',
        //     //             shiftDays: [2],
        //     //             isSplit: false,
        //     //             parentId: '',
        //     //             visitId: 706,
        //     //             officer: {
        //     //               id: 1158,
        //     //               name: 'kyle',
        //     //               email: 'kyle@yopmail.com',
        //     //               imageUrl:
        //     //                 'https://signalassets.blob.core.windows.net/signal/assets/Avatar.png',
        //     //               phoneNumber: null,
        //     //             },
        //     //             children: [],
        //     //             serviceId: 4180,
        //     //           },
        //     //         ],
        //     //       },
        //     //     ],
        //     //     changes: [
        //     //       {
        //     //         key: 'Id',
        //     //         new: '680',
        //     //         old: '678',
        //     //       },
        //     //     ],
        //     //     serviceName: 'Service #1',
        //     //     serviceType: 'Patrol',
        //     //   },
        //     // ],
        //     description: {
        //       new: "<p>This proposal reflects services including:</p> <p>&nbsp;</p> <p><strong>Service #1</strong>:</p><p><strong>1</strong> vehicle patrols per week entailing <strong> 1</strong> visits per day from <strong>02:00 PM</strong> to <strong>03:00 PM</strong> randomly on <strong>Tuesday</strong>.</p> <p>&nbsp;</p> <p><strong>WHAT WE DO:</strong></p> <p>At Signal Security, your community's security needs are our priority. Our duties include:</p> <p>&nbsp;</p> <p>Deter – Our uniformed Security Officers, licensed by DPS, will provide a constant presence at your front entrance.</p> <p>&nbsp;</p> <p>Detect – Our Security Officers perform slow patrols of common areas, looking for suspicious or unauthorized activity. They investigate unsecured gates/garage doors and attempt to notify property owners. Customized checkpoints can be set up for inspecting perimeter fencing or monitoring specific points of interest.</p> <p>&nbsp;</p> <p>Disrupt – We respond to incidents and initiate appropriate action (calling fire, police, or EMS). Our officers make contact with unknown or unauthorized persons and coordinate with local police as needed.</p> <p>&nbsp;</p> <p>&nbsp;</p> <p><strong>HOW WE'RE DIFFERENT:</strong></p> <p></p> <p><br>While other security providers may compete solely on price, Signal Security focuses on quality. We pay our guards competitive wages, resulting in low turnover and higher-quality candidates. Our exclusive Signal Performance Institute is an online training program that keeps our officers up-to-date with the latest tactics, techniques, and procedures. With Signal Security, your residents can rely on a skilled Security Officer when they need one most.</p> <p><br>An annual rate increase will be applied at the beginning of each year at the rate of <strong>10.0%</strong> or the current rate of inflation if higher than <strong>5%</strong> as of 10/31/24.</p>",
        //       old: "<p>This proposal reflects services including:&nbsp;</p>\n<p>&nbsp;&nbsp;</p>\n<p><strong>Service #1</strong>:</p>\n<p><strong>2</strong> vehicle patrols per week entailing <strong> 2</strong> visits per day from <strong>02:00 PM</strong> to <strong>03:00 PM</strong> randomly on <strong>Tuesday</strong>.&nbsp;</p>\n<p>&nbsp;&nbsp;</p>\n<p><strong>WHAT WE DO:</strong>&nbsp;</p>\n<p>At Signal Security, your community's security needs are our priority. Our duties include:&nbsp;</p>\n<p>&nbsp;&nbsp;</p>\n<p>Deter – Our uniformed Security Officers, licensed by DPS, will provide a constant presence at your front entrance.&nbsp;</p>\n<p>&nbsp;&nbsp;</p>\n<p>Detect – Our Security Officers perform slow patrols of common areas, looking for suspicious or unauthorized activity. They investigate unsecured gates/garage doors and attempt to notify property owners. Customized checkpoints can be set up for inspecting perimeter fencing or monitoring specific points of interest.&nbsp;</p>\n<p>&nbsp;&nbsp;</p>\n<p>Disrupt – We respond to incidents and initiate appropriate action (calling fire, police, or EMS). Our officers make contact with unknown or unauthorized persons and coordinate with local police as needed.&nbsp;</p>\n<p>&nbsp;&nbsp;</p>\n<p>&nbsp;&nbsp;</p>\n<p><strong>HOW WE'RE DIFFERENT:</strong>&nbsp;</p>\n<p>&nbsp;</p>\n<p><br>While other security providers may compete solely on price, Signal Security focuses on quality. We pay our guards competitive wages, resulting in low turnover and higher-quality candidates. Our exclusive Signal Performance Institute is an online training program that keeps our officers up-to-date with the latest tactics, techniques, and procedures. With Signal Security, your residents can rely on a skilled Security Officer when they need one most.&nbsp;</p>\n<p><br>An annual rate increase will be applied at the beginning of each year at the rate of <strong>10.0%</strong> or the current rate of inflation if higher than <strong>5%</strong> as of 10/31/24.</p>\n",
        //     },
        //     contractName: 'Addendum - New Contract Patrol For Ghassan (1)',
        //     paymentTerms: {
        //       changes: [],
        //     },
        //     onDemandServices: [
        //       {
        //         action: 'updated',
        //         changes: [
        //           {
        //             key: 'Id',
        //             new: '1095',
        //             old: '1094',
        //           },
        //         ],
        //         serviceName: 'Load Management',
        //       },
        //       {
        //         action: 'updated',
        //         changes: [
        //           {
        //             key: 'Id',
        //             new: '1096',
        //             old: '1093',
        //           },
        //         ],
        //         serviceName: 'Visitor Management',
        //       },
        //       {
        //         action: 'updated',
        //         changes: [
        //           {
        //             key: 'Id',
        //             new: '1097',
        //             old: '1092',
        //           },
        //         ],
        //         serviceName: 'Extra Job',
        //       },
        //       {
        //         action: 'updated',
        //         changes: [
        //           {
        //             key: 'Id',
        //             new: '1098',
        //             old: '1091',
        //           },
        //         ],
        //         serviceName: 'Dispatch Request',
        //       },
        //     ],
        //     totalServicesToAcknowledge: 1,
        //     isDispatchContract: true,
        //   },
        //   statusCode: 200,
        //   message: 'The record has been fetched successfully!',
        // };
        // isDispatchOnlyContract(dummyData?.data);
        // setChangeHistory(dummyData?.data);
      }
      setLoading(false);
    } catch (e) {
      console.log(e);
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (id) getChangeHistory(id);
  }, [id]);

  return (
    <Box className={classes.modalWrapper}>
      <Box className={classes.stepperContainer}>
        <Box className={classes.stepperWrapper}>
          <Box className={classes.stepperLeft}>
            <Box className={classes.stepperHeader}>
              <Typography variant="h4" className={classes.stepperHeaderText}>
                {/*Contract Addendum*/}
                {t('obx.requireAttention.contractAddendum', {
                  type: capitalizeFirstLetter(source),
                })}
              </Typography>
              <Typography variant="body2" className={classes.stepperSubtext}>
                {t('obx.requireAttention.contractAddendumDesc', {
                  type: capitalizeFirstLetter(source),
                })}
              </Typography>
            </Box>
            <Stepper
              activeStep={steps?.findIndex((step) => step?.key === activeStepKey)}
              orientation="vertical"
              className={classes.stepper}
            >
              {steps?.map((step) => (
                <Step
                  key={step?.label}
                  completed={step?.completed && step?.key !== activeStepKey}
                  className={classes.stepperItem}
                >
                  <StepLabel
                    StepIconComponent={(props) => (
                      <CustomStepIcon
                        {...props}
                        completed={step?.completed && step?.key !== activeStepKey}
                        active={step?.key === activeStepKey}
                        icon={step?.icon}
                      />
                    )}
                  >
                    <Box className={classes.stepperLabel}>
                      <Typography variant="subtitle2" className={classes.stepperLabelText}>
                        {step?.label}
                      </Typography>
                      <Typography variant="body3" className={classes.stepSubtext}>
                        {step?.subtext}
                      </Typography>
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <Box className={classes.stepperRight}>
            {renderStepContent({
              // step: activeStep,
              key: activeStepKey,
              contractName: changeHistory?.contractName,
              services: changeHistory?.services,
              devices: changeHistory?.devices,
              paymentTerms: changeHistory?.paymentTerms,
              onDemandServices: changeHistory?.onDemandServices,
              handleInputChange: handleInputChange,
              formData: formData,
              setFormData: setFormData,
              updateFormHandler: updateFormHandler,
              errorMessages: errorMessages,
              setErrorMessages: setErrorMessages,
              loading: loading,
              description: changeHistory?.description || {},
              signees: changeHistory?.signee,
            })}

            <Box className={classes.inlineButtons}>
              {activeStepKey !== steps[0]?.key ? (
                <Button
                  // disabled={activeStepKey === stepKeys.services}
                  onClick={handleBack}
                  variant="secondaryGrey"
                >
                  {t('obx.requireAttention.backButton')}
                </Button>
              ) : (
                <Button onClick={handleCloseModal} variant="secondaryGrey">
                  {t('obx.requireAttention.cancelButton')}
                </Button>
              )}

              {activeStepKey === steps?.[steps?.length - 1]?.key ? (
                <Button variant="primary" onClick={handleSubmit} disabled={submitCalled}>
                  {t('obx.requireAttention.acknowledgeButton')}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={activeStepKey === steps?.length || loading}
                >
                  {t('obx.requireAttention.nextButton')}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

AddendumModalBody.propTypes = {
  id: PropTypes.string,
  source: PropTypes.string,
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
};

const AddendumModal = ({ id, openModal, handleCloseModal, handleSubmit, source }) => {
  return (
    <ModalComponent
      id={id}
      open={openModal}
      // handleClose={handleCloseModal}
      body={
        <AddendumModalBody
          id={id}
          handleCloseModal={handleCloseModal}
          handleSubmit={handleSubmit}
          source={source}
        />
      }
    />
  );
};

AddendumModal.propTypes = {
  id: PropTypes.string,
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
  source: PropTypes.string,
};

export default AddendumModal;
