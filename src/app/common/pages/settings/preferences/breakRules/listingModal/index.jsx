import CloseIcon from '@mui/icons-material/Close';
import { Box, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { ReactComponent as NoDataIcon } from 'assets/images/Nodata.svg?react';
import { MoreVert } from 'assets/svg';
import { ReactComponent as Dustbin } from 'assets/svg/DeleteIconBin.svg?react';
import { ReactComponent as EditGroupIcon } from 'assets/svg/EditGroupIcon.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import PopoverButton from 'src/app/components/common/popoverButton';
import { minutesToHoursFormat } from 'src/app/obx/pages/schedules/helper';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { getBreakRuleById } from 'src/services/breakRules.service';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import DeleteBreakeRuleModal from '../deleteBreakRule';
import AssociatedJobRunsheets from './component/associatedJobRunsheets';
import { useStyles } from './ListingModal.style';
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
const ListingModal = ({
  openModal,
  handleCloseModal,
  handlePreview,
  selectedBreakRule,
  refreshBreakRules,
}) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [breakRuleDetails, setBreakRuleDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);
  const handleDelete = () => {
    setOpenDeleteModal(true);
  };

  const handleCloseModalAndResetData = () => {
    handleCloseModal();
    setBreakRuleDetails(null);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const fetchBreakRuleDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getBreakRuleById(selectedBreakRule?.id);
      if (response && response?.statusCode === 200) {
        setBreakRuleDetails(response?.data?.breakRule);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModalAndCloseListingModal = () => {
    handleDelete();
    // handleCloseModal();
  };

  const handleEditModalAndCloseListingModal = () => {
    handleCloseModal();
    handlePreview(selectedBreakRule);
  };

  useEffect(() => {
    if (selectedBreakRule?.id) fetchBreakRuleDetails();
  }, [selectedBreakRule]);

  const deleteModalBody = (
    <Box className={classes.modalWrapper}>
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Typography variant="h3" className={classes.headerTitle}>
            {isLoading ? <Skeleton variant="text" width={100} /> : breakRuleDetails?.name}
          </Typography>
        </Box>
        <Box className={classes.headerRight}>
          <PopoverButton
            className={classes.questionBankActions}
            label="icon"
            variant="icon"
            Icon={MoreVert}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
          >
            <Box className={classes.questionBankActionsMenu}>
              <Box
                className={classes.questionBankActionsRegular}
                onClick={() => handleEditModalAndCloseListingModal()}
              >
                <EditGroupIcon className={classes.questionBankActionsIconRegular} />
                <Typography className={classes.questionBankActionsTextRegular} variant="subtitle2">
                  {t('obx.settings.preferences.breakRules.editRule')}
                </Typography>
              </Box>
              <Box
                className={classes.questionBankActionsDelete}
                onClick={() => handleDeleteModalAndCloseListingModal()}
              >
                <Dustbin className={classes.questionBankActionsIconDelete} />
                <Typography className={classes.questionBankActionsTextDelete} variant="subtitle2">
                  {t('obx.settings.preferences.breakRules.deleteRule')}
                </Typography>
              </Box>
            </Box>
          </PopoverButton>
          <CloseIcon
            onClick={() => handleCloseModalAndResetData()}
            className={classes.closeDrawerIcon}
          />
        </Box>
      </Box>
      <Box>
        <Box className={classes.tabWrapper}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Break Rules" {...a11yProps(0)} />
            <Tab label="Associated Jobs/Runsheets" {...a11yProps(1)} />
          </Tabs>
          <CustomTabPanel className={classes.tabContent} value={value} index={0}>
            <Typography variant="h4" className={classes.MainTitle}>
              Break Conditions
            </Typography>
            <Box className={classes.conditionDetailsWrapper}>
              {isLoading ? (
                <Box className={classes.languageModalSkeletonWrapper}>
                  <Skeleton
                    variant="rectangular"
                    height={45}
                    className={classes.languageModalSkeleton}
                  />
                  <Skeleton
                    variant="rectangular"
                    height={45}
                    className={classes.languageModalSkeleton}
                  />
                  <Skeleton
                    variant="rectangular"
                    height={45}
                    className={classes.languageModalSkeleton}
                  />
                </Box>
              ) : (
                <Box>
                  {breakRuleDetails?.breakRuleConditions?.length === 0 ? (
                    <Box className={classes.notRecordFounWrapper}>
                      <Box className={classes.noRecordFound}>
                        <NoDataIcon />
                        <Typography variant="h2">{t('commonText.table.noRecordFound')}</Typography>
                      </Box>
                    </Box>
                  ) : (
                    breakRuleDetails?.breakRuleConditions?.map((condition, index) => (
                      <Box className={classes.conditionDetailsInner} key={index}>
                        <Box className={classes.conditionDetailsHeader}>
                          <Typography variant="subtitle1" className={classes.conditionDetailsTitle}>
                            {t('obx.settings.preferences.breakRules.condition')} {index + 1}
                          </Typography>
                        </Box>
                        <Box className={classes.conditionContent}>
                          <Box className={classes.conditionItem}>
                            <Typography variant="subtitle2" className={classes.title}>
                              {t('obx.settings.preferences.breakRules.type')}
                            </Typography>
                            <Typography variant="subtitle2" className={classes.value}>
                              {condition?.breakTypeName ? condition?.breakTypeName : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box className={classes.conditionContent}>
                          <Box className={classes.conditionItem}>
                            <Typography variant="subtitle2" className={classes.title}>
                              {t('obx.settings.preferences.breakRules.duration')}
                            </Typography>
                            <Typography variant="subtitle2" className={classes.value}>
                              {condition?.breakDurationInMinutes
                                ? condition?.breakDurationInMinutes
                                : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box className={classes.conditionContent}>
                          <Box className={classes.conditionItem}>
                            <Typography variant="subtitle2" className={classes.title}>
                              {t('obx.settings.preferences.breakRules.breakTime')}
                            </Typography>
                            <Typography variant="subtitle2" className={classes.value}>
                              {condition?.breakStartOffsetMinutes
                                ? `${minutesToHoursFormat(condition?.breakStartOffsetMinutes)} after clocking in`
                                : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box className={classes.conditionContent}>
                          <Box className={classes.conditionItem}>
                            <Typography variant="subtitle2" className={classes.title}>
                              {t('obx.settings.preferences.breakRules.notifyOfficer', {
                                officer: getLabel('terms', 'officer', t),
                              })}
                            </Typography>
                            <Typography variant="subtitle2" className={classes.value}>
                              {condition?.preBreakAlertMinutes
                                ? `${minutesToHoursFormat(condition?.preBreakAlertMinutes)} before break`
                                : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box className={classes.conditionContent}>
                          <Box className={classes.conditionItem}>
                            <Typography variant="subtitle2" className={classes.title}>
                              {t('obx.settings.preferences.breakRules.payOfficer', {
                                officer: getLabel('terms', 'officer', t),
                              })}
                            </Typography>
                            <Typography variant="subtitle2" className={classes.value}>
                              {condition?.payable
                                ? t('obx.settings.preferences.breakRules.yes')
                                : t('obx.settings.preferences.breakRules.no')}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              )}
            </Box>
          </CustomTabPanel>
          <CustomTabPanel className={classes.tabContent} value={value} index={1}>
            <AssociatedJobRunsheets selectedBreakRule={selectedBreakRule} />
          </CustomTabPanel>
        </Box>
      </Box>
      <DeleteBreakeRuleModal
        openModal={openDeleteModal}
        handleCloseModal={handleCloseDeleteModal}
        selectedBreakRule={selectedBreakRule}
        refreshBreakRules={() => {
          handleCloseModalAndResetData();
          refreshBreakRules();
        }}
      />
    </Box>
  );

  return <ModalComponent open={openModal} body={deleteModalBody} />;
};

ListingModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  handlePreview: PropTypes.func,
  selectedBreakRule: PropTypes.object,
  refreshBreakRules: PropTypes.func,
};

export default ListingModal;
