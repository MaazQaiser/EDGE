import { Box, Chip, Typography } from '@mui/material';
import { ReactComponent as RoundedBoxIcon } from 'assets/svg/rounded-box.svg?react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ServicesSkelton } from 'src/app/obx/pages/sites/detail/components/addendumModal/steps/skelton';
import { ReactComponent as ArrowNextIcon } from 'src/assets/svg/arrowNext.svg?react';
import { showError } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';

import CustomAccordion from '../../../../../../../../components/common/customAccordion';
import NoChanges from '../noChanges';
import ServiceItem from './serviceItem';
import ServiceListItem from './serviceListItem';
import { useStyles } from './servicesStyle';

// const serviceKeys = {
//   jobType: 'Duty Type',
//   officerType: 'Officer Type',
//   pricePerHit: 'Price Per Hit',
//   pricePerVisit: 'Price Per Visit',
//   invoiceLineItem: 'Invoice Line Item',
//   days: 'Days',
//   officers: 'Officers',
//   times: 'Times',
// };

const ServiceAccordionBody = ({
  service,
  formData,
  setFormData,
  handleInputChange,
  serviceIndex,
  errorMessages,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const selectedShifts = formData?.find(
    (f) => f?.serviceId?.toString() === service?.shiftsToDelete?.[0]?.serviceId?.toString(),
  )?.shiftIds?.length;

  return (
    <>
      {service?.visits?.map((visit, index) => {
        if (!visit?.shiftsToDelete || visit?.shiftsToDelete?.length < 1) return;
        return (
          <>
            <Box key={index} className={classes.serviceBody}>
              <Box className={classes.serviceHeader}>
                <Box className={classes.serviceHeaderTop}>
                  <Typography variant="h4" className={classes.serviceHeaderTitle}>
                    {service?.serviceType === 'Patrol'
                      ? t('obx.requireAttention.selectHitsKeep', {
                          hits: getLabel('terms', 'hits', t),
                        })
                      : t('obx.requireAttention.selectShiftsKeep')}
                  </Typography>
                  <Box className={classes.valueBox}>
                    <Typography variant="body2" className={classes.minValue}>
                      {visit?.officersChange?.old}
                    </Typography>
                    <ArrowNextIcon />

                    <Typography variant="body2" className={classes.maxValue}>
                      {visit?.officersChange?.new}
                    </Typography>
                  </Box>
                </Box>

                <Box className={classes.serviceShiftContainer}>
                  <Box className={classes.serviceShift}>
                    <Typography variant="body3" className={classes.serviceShiftLabel}>
                      {t('obx.requireAttention.totalShifts')}:
                    </Typography>
                    <Typography variant="subtitle2" className={classes.serviceShiftCount}>
                      {visit?.officersChange?.old}
                    </Typography>
                  </Box>
                  <Box className={classes.serviceShift}>
                    <Typography variant="body3" className={classes.serviceShiftLabel}>
                      {t('obx.requireAttention.selectedShifts')}:
                    </Typography>
                    <Typography variant="subtitle2" className={classes.serviceShiftCount}>
                      {selectedShifts || 0}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${t('obx.requireAttention.toSelect')}: ${visit?.officersChange?.new}`}
                    variant="outlinedError"
                  />
                </Box>
                <Box className={classes.twoBox}>
                  {showError({
                    key: `${service?.serviceType === 'Dedicated' ? 'dedicatedShiftIds' : 'patrolShiftIds'}`,
                    formDataKey: 'addendumContracts',
                    index: `${serviceIndex}-${index}`,
                    errors: errorMessages,
                  }) ? (
                    <Typography variant="body2" color="error" className={classes.invalidFeedback}>
                      {showError({
                        key: `${service?.serviceType === 'Dedicated' ? 'dedicatedShiftIds' : 'patrolShiftIds'}`,
                        formDataKey: 'addendumContracts',
                        index: `${serviceIndex}-${index}`,
                        errors: errorMessages,
                      })}
                      {/*{*/}
                      {/*  errorMessages?.['addendumContracts']?.[`${serviceIndex}-${index}`]?.[*/}
                      {/*    'patrolShiftIds'*/}
                      {/*  ]*/}
                      {/*}*/}
                      {/*Please selects {service?.officersChange?.new || 0} shifts you want to keep*/}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
              <Box className={classes.serviceContent}>
                {visit?.shiftsToDelete?.map((shift, sIndex) => (
                  <ServiceItem
                    key={`${index}-${sIndex}`}
                    shift={shift}
                    formData={formData}
                    setFormData={setFormData}
                    handleInputChange={handleInputChange}
                    service={visit}
                    shiftIndex={sIndex}
                    formDataIndex={serviceIndex}
                  />
                ))}
              </Box>
            </Box>
          </>
        );
      })}
    </>
  );
};

ServiceAccordionBody.propTypes = {
  shiftsToRemove: PropTypes.object,
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  handleInputChange: PropTypes.func,
  service: PropTypes.object,
  serviceIndex: PropTypes.number,
  errorMessages: PropTypes.object,
};

const ServiceAddedItem = ({ serviceItem }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const NA = t('commonText.nA');

  const serviceName = serviceItem?.serviceName;

  const dutyType = serviceItem?.serviceType;

  return (
    <>
      <Box className={classes.serviceContentWrapper}>
        <Box className={classes.serviceAddItemTitleWrapper}>
          {dutyType && (
            <Typography variant="h5" className={classes.serviceAddItemTitle}>
              {dutyType} &nbsp; <RoundedBoxIcon />
            </Typography>
          )}
          <Typography variant="h5" className={classes.serviceAddItemTitle}>
            {serviceName}
          </Typography>
        </Box>

        <Box className={classes.column}>
          {/*here is out loop*/}
          {serviceItem?.changes?.map((item, index) => {
            if (item.key === 'Id') return;
            return (
              <Box
                key={index}
                className={
                  item?.key !== 'Instructions'
                    ? classes.serviceAddItemContent
                    : classes.serviceInstructionsContent
                }
              >
                <Typography variant="overline" className={classes.serviceAddItemContentTitle}>
                  {item?.key}
                </Typography>
                <Typography variant="body3">{item?.new || NA}</Typography>
              </Box>
            );
          })}
        </Box>
        <Box className={classes.services}>
          {serviceItem?.visits?.map((sVisit, sIndex) => {
            if (sVisit.key === 'Id') return;
            return (
              <Box key={sIndex} className={classes.bg}>
                {sVisit?.type !== 'Dedicated' && (
                  <Typography className={classes.servicesName} variant="h5">
                    Visit Set {sIndex + 1}
                  </Typography>
                )}
                <Box className={classes.column}>
                  {sVisit?.changes?.map((visit, index) => {
                    if (visit.key === 'Id') return;
                    if (visit?.new === null) return;
                    return (
                      <Box key={index} className={classes.serviceAddItemContent}>
                        <Typography
                          variant="overline"
                          className={classes.serviceAddItemContentTitle}
                        >
                          {visit?.key}
                        </Typography>
                        <Typography variant="body3">{visit?.new || NA}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </>
  );
};

ServiceAddedItem.propTypes = {
  serviceItem: PropTypes.object,
};

const ServiceRemovedItem = ({ title, description }) => {
  const classes = useStyles();
  return (
    <Box className={classes.serviceContentWrapper}>
      <Typography variant="h5" className={classes.serviceAddItemTitle}>
        {title}
      </Typography>
      <Typography variant="subtitle3" className={classes.serviceAddItemContentTitle}>
        {description}
      </Typography>
    </Box>
  );
};
ServiceRemovedItem.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};
const ServiceChangedItem = ({ title, children }) => {
  const classes = useStyles();
  return (
    <Box className={classes.serviceContentWrapper}>
      <Typography variant="h5" className={classes.serviceAddItemTitle}>
        {title}
      </Typography>
      {children}
    </Box>
  );
};
ServiceChangedItem.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
};

const DedicatedService = ({ serviceItem }) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const NA = t('commonText.nA');

  const visits = serviceItem?.visits;

  return (
    <>
      <Box className={classes.dedicatedServiceWrapper}>
        {serviceItem?.changes?.map((item, index) => {
          if (item?.key === 'Id') {
            return;
          }
          if (item?.key === 'Instruction') {
            return (
              <Box key={index} className={classes.dedicatedServiceInstructions}>
                <Typography variant="body3" className={classes.serviceAddItemContentTitle}>
                  {t('obx.requireAttention.instructions')}
                </Typography>
                <Box className={classes.valueBox}>
                  <Typography
                    variant="body2"
                    className={`${classes.minValue} ${classes.minValueLine}`}
                  >
                    {item?.old}
                  </Typography>
                  <ArrowNextIcon />

                  <Typography variant="body2" className={classes.maxValue}>
                    {item?.new}
                  </Typography>
                </Box>
              </Box>
            );
          }
          return (
            <ServiceListItem
              key={index}
              label={item?.key || NA}
              oldValue={item?.old || NA}
              newValue={item?.new || NA}
            />
          );
        })}

        {/* Iterating through the visits array and rendering changes */}
        {serviceItem?.serviceType === 'Dedicated' && (
          <DedicatedVisitChanges dedicatedVisits={visits} />
        )}

        {serviceItem?.serviceType === 'Patrol' && <PatrolVisitChanges patrolVisits={visits} />}
      </Box>
    </>
  );
};

DedicatedService.propTypes = {
  serviceItem: PropTypes.array,
};

const DedicatedVisitChanges = ({ dedicatedVisits }) => {
  return (
    <>
      {dedicatedVisits?.map((dedicatedVisit) => (
        <>
          {dedicatedVisit?.changes?.map((visit, index) => {
            if (visit.key === 'Id') return;
            if (visit?.key === 'Visit Type' && visit?.old === null && visit?.new === null) return;
            return (
              <ServiceListItem
                key={`visit-${index}`}
                label={visit?.key} // Label as "changeKey - subKey"
                oldValue={visit?.old}
                newValue={visit?.new}
              />
            );
          })}
        </>
      ))}
    </>
  );
};

DedicatedVisitChanges.propTypes = {
  dedicatedVisits: PropTypes.array,
};

const PatrolVisitChanges = ({ patrolVisits }) => {
  return (
    <>
      {patrolVisits?.map((patrolVisit) => {
        return (
          <>
            <Box>{patrolVisit?.type}</Box>
            {patrolVisit?.changes?.map((visit, index) => {
              if (visit.key === 'Id') return;
              if (visit?.key === 'Visit Type' && visit?.old === null && visit?.new === null) return;
              return (
                <ServiceListItem
                  key={`visit-${index}`}
                  label={visit?.key} // Label as "changeKey - subKey"
                  oldValue={visit?.old}
                  newValue={visit?.new}
                />
              );
            })}
          </>
        );
        // if (patrolVisit?.action === 'updated') {
        // }
      })}
    </>
  );
};

PatrolVisitChanges.propTypes = {
  patrolVisits: PropTypes.array,
};

const Services = ({
  contractName,
  services,
  formData,
  setFormData,
  errorMessages,
  handleInputChange,
  loading,
}) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const { getLabel } = useTenantLabel();

  const NA = t('commonText.nA');

  const changeMade = services?.length > 0;

  const addedServices = changeMade ? services?.filter((service) => service.action === 'added') : [];
  const patrolRemovedServices = changeMade
    ? services
        ?.filter((service) => service.action === 'removed' && service?.serviceType === 'Patrol')
        ?.map((service) => service?.serviceName)
    : [];
  const dedicatedRemovedServices = changeMade
    ? services
        ?.filter((service) => service.action === 'removed' && service?.serviceType === 'Dedicated')
        ?.map((service) => service?.serviceName)
    : [];
  const updatedServices = changeMade
    ? services?.filter((service) => service.action === 'updated')
    : [];

  const dedicatedDeletedShifts = changeMade
    ? services
        ?.filter((service) => {
          // Filter services that match criteria
          return (
            service?.action === 'updated' &&
            service?.serviceType === 'Dedicated' &&
            service?.visits?.some((visit) => visit?.shiftsToDelete?.length > 0)
          );
        })
        .map((service) => ({
          // Update the filtered services' visits array
          ...service,
          visits: service?.visits?.filter((visit) => visit?.shiftsToDelete?.length > 0),
        }))
    : [];

  const patrolDeletedVisits = changeMade
    ? services
        ?.filter((service) => {
          // Filter services that match criteria
          return (
            service?.action === 'updated' &&
            service?.serviceType === 'Patrol' &&
            service?.visits?.some((visit) => visit?.shiftsToDelete?.length > 0)
          );
        })
        .map((service) => ({
          // Update the filtered services' visits array
          ...service,
          visits: service?.visits?.filter((visit) => visit?.shiftsToDelete?.length > 0),
        }))
    : [];

  // TODO: find sum of officer reduced and make user select that number of shifts

  // const patrolRemovedServices = removedServices
  //   ?.filter((service) => service?.serviceType === 'Patrol')
  //   .map((service) => service?.serviceName);
  //
  // const dedicatedRemovedServices = addedServices
  //   ?.filter((service) =>
  //     service?.changes?.some(
  //       (change) =>
  //         change?.key === 'Duty Type' && (change?.new === 'Dedicated' || change?.old === 'Patrol'),
  //     ),
  //   )
  //   .map((service) => service?.serviceName);

  return (
    <>
      {loading ? (
        <ServicesSkelton />
      ) : (
        <Box className={classes.servicesContainer}>
          <Box className={classes.header}>
            <Typography variant="h3" className={classes.title}>
              {contractName}
            </Typography>
            <Box className={classes.titleContainer}>
              <Typography variant="h3" className={classes.title}>
                {t('obx.requireAttention.services')}
              </Typography>
            </Box>
          </Box>

          {!changeMade && <NoChanges />}
          <Box className={classes.servicesContent}>
            {dedicatedDeletedShifts?.map((service, dIndex) => (
              <>
                <Typography variant="body3" className={classes.subTitle}>
                  {t('obx.requireAttention.jobsAreReduced')}
                </Typography>
                <CustomAccordion
                  key={dIndex}
                  summary={
                    <Box className={classes.twoBox}>
                      <Typography>{service?.serviceName}</Typography>
                      {/*{showError({*/}
                      {/*  key: 'dedicatedShiftIds',*/}
                      {/*  formDataKey: 'addendumContracts',*/}
                      {/*  index: dIndex,*/}
                      {/*  errors: errorMessages,*/}
                      {/*}) ? (*/}
                      {/*  <Typography*/}
                      {/*    variant="body2"*/}
                      {/*    color="error"*/}
                      {/*    className={classes.invalidFeedback}*/}
                      {/*  >*/}
                      {/*    {showError({*/}
                      {/*      key: 'dedicatedShiftIds',*/}
                      {/*      formDataKey: 'addendumContracts',*/}
                      {/*      index: dIndex,*/}
                      {/*      errors: errorMessages,*/}
                      {/*    })}*/}
                      {/*    /!*Please selects {service?.officersChange?.new || 0} shifts you want to keep*!/*/}
                      {/*  </Typography>*/}
                      {/*) : null}*/}
                    </Box>
                  }
                  defaultExpanded={true}
                >
                  <ServiceAccordionBody
                    shiftsToRemove={[]}
                    formData={formData}
                    setFormData={setFormData}
                    service={service}
                    handleInputChange={handleInputChange}
                    serviceIndex={dIndex}
                    errorMessages={errorMessages}
                  />
                </CustomAccordion>
              </>
            ))}
            {patrolDeletedVisits?.map((service, pIndex) => (
              <>
                <Typography variant="body3" className={classes.subTitle}>
                  {t('obx.requireAttention.jobsAreReduced')}
                </Typography>
                <CustomAccordion
                  key={pIndex}
                  summary={
                    <Box className={classes.twoBox}>
                      <Typography>{service?.serviceName}</Typography>
                      {/*{showError({*/}
                      {/*  key: 'patrolShiftIds',*/}
                      {/*  formDataKey: 'addendumContracts',*/}
                      {/*  index: pIndex,*/}
                      {/*  errors: errorMessages,*/}
                      {/*}) ? (*/}
                      {/*  <Typography*/}
                      {/*    variant="body2"*/}
                      {/*    color="error"*/}
                      {/*    className={classes.invalidFeedback}*/}
                      {/*  >*/}
                      {/*    {showError({*/}
                      {/*      key: 'patrolShiftIds',*/}
                      {/*      formDataKey: 'addendumContracts',*/}
                      {/*      index: pIndex,*/}
                      {/*      errors: errorMessages,*/}
                      {/*    })}*/}
                      {/*    /!*Please selects {service?.officersChange?.new || 0} shifts you want to keep*!/*/}
                      {/*  </Typography>*/}
                      {/*) : null}*/}
                    </Box>
                  }
                  defaultExpanded={true}
                >
                  <ServiceAccordionBody
                    shiftsToRemove={[]}
                    formData={formData}
                    setFormData={setFormData}
                    service={service}
                    handleInputChange={handleInputChange}
                    serviceIndex={pIndex}
                    errorMessages={errorMessages}
                  />
                </CustomAccordion>
              </>
            ))}
          </Box>
          {/* Service Added Section */}
          {addedServices?.length > 0 && (
            <Box className={classes.servicesCommonWrapper}>
              <Typography variant="h3" className={classes.title}>
                {t('obx.requireAttention.servicesAdded')}
              </Typography>
              {addedServices?.map((service, index) => (
                <ServiceAddedItem key={index} serviceItem={service} />
              ))}
            </Box>
          )}

          {/* Service Removed Section */}
          {(patrolRemovedServices?.length > 0 || dedicatedRemovedServices?.length > 0) && (
            <Box className={classes.servicesCommonWrapper}>
              <Typography variant="h3" className={classes.title}>
                {t('obx.requireAttention.servicesRemoved')}
              </Typography>
              <Box className="grid-col-2">
                {patrolRemovedServices.length > 0 && (
                  <ServiceRemovedItem
                    title={t('obx.requireAttention.patrolService', {
                      patrol: getLabel('terms', 'patrol', t),
                    })}
                    description={patrolRemovedServices?.join(', ') || NA}
                  />
                )}

                {dedicatedRemovedServices?.length > 0 && (
                  <ServiceRemovedItem
                    title={t('obx.requireAttention.dedicatedService', {
                      dedicated: getLabel('terms', 'dedicated', t),
                    })}
                    description={dedicatedRemovedServices?.join(', ') || NA}
                  />
                )}
              </Box>
            </Box>
          )}
          {/* Service Changed Section */}

          {updatedServices?.length > 0 && (
            <Box className={classes.servicesCommonWrapper}>
              <Typography variant="h3" className={classes.title}>
                {t('obx.requireAttention.servicesChanged')}
              </Typography>
              {updatedServices?.map((service, index) => (
                <>
                  <ServiceChangedItem
                    key={index}
                    title={
                      <>
                        {service?.serviceType} &nbsp; <RoundedBoxIcon /> &nbsp;{' '}
                        {service?.serviceName}
                      </>
                    }
                  >
                    <DedicatedService serviceItem={service} />
                  </ServiceChangedItem>
                </>
              ))}
            </Box>
          )}
        </Box>
      )}
    </>
  );
};

Services.propTypes = {
  contractName: PropTypes.string,
  services: PropTypes.array,
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  errorMessages: PropTypes.object,
  handleInputChange: PropTypes.func,
  loading: PropTypes.bool,
};

export default Services;
