import { Avatar, Box, Button, Drawer, InputLabel, Skeleton, Typography } from '@mui/material';
import { ReactComponent as ChevronDown } from 'assets/svg/commonDropdown/chevronDown.svg?react';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import CustomDropDown from 'src/app/components/common/customDropDown';
// import LoaderComponent from 'src/app/components/common/loader';
import {
  getFranchisesOptions,
  getLevelAndScoreOptions,
  updateLocationDetail,
} from 'src/services/location.service.js';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions.js';
import { KEY } from 'src/utils/constants/events/keyPressEvents';
import { defaultImage, toastSettings } from 'src/utils/constants/index.js';
import { updateSelectedOption, verifyDropDownName } from 'src/utils/dropdownSelectedValue/index.js';
import { toaster } from 'src/utils/toast/index.jsx';

import AssignedToDrawer from '../assignedTo/index.jsx';
import { detailPageDropDowns } from '../assignedTo/location.constant.js';
import { locationDrawerTypes } from '../newLocationsDrawer/location.constant.js';
import { locationDropDownNames } from './editLocation.constant.js';
import { useStyles } from './sidebarDropdowns.js';

const SidebarDropdowns = ({ data, setData, fetchFranchise, isFetchingLocationDetails }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { id } = useParams();
  const NA = t('commonText.nA');

  const [selectedOption, setSelectedOption] = useState({
    associatedFranchiseId: {},
    level: {},
    score: null,
  });
  const [options, setOptions] = useState({
    franchises: [],
    level: [],
    score: [],
  });
  const [errorMessages, setErrorMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [optionLoading, setOptionLoading] = useState(true);

  /**
   * Fetch franchise listing
   * @param {*} page
   * @param {*} query
   */
  const fetchFranchises = async () => {
    try {
      const response = await getFranchisesOptions();
      if (response?.statusCode === 200) {
        setOptions((prevOptions) => ({
          ...prevOptions,
          franchises: response?.data?.franchises,
        }));
      }
      setOptionLoading(false);
    } catch (error) {
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setOptionLoading(false);
    }
  };

  /**
   * Fetch Level and scores options for dropdown
   * @param {*} page
   * @param {*} query
   */
  const fetchLevelAndScore = async () => {
    try {
      const response = await getLevelAndScoreOptions();
      if (response?.statusCode === 200) {
        setOptions((prevOptions) => ({
          ...prevOptions,
          level: response?.data?.levels,
          score: response?.data?.scores,
        }));
      }
      setOptionLoading(false);
    } catch (error) {
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setOptionLoading(false);
    }
  };

  const updateLocation = async (data, type) => {
    try {
      setLoading(true);
      const update = await updateLocationDetail(id, data);

      if (update?.statusCode === 200) {
        setData(update?.data?.location);

        /**
         * refetch franchise
         * only refetch franchise if franchise is updated
         */
        if (update?.data?.location?.franchiseId && type === detailPageDropDowns.FRANCHISE)
          fetchFranchise(update?.data?.location?.franchiseId);

        /**
         * conditonally render the success message as per the value updated
         */
        let updatedType;
        if (type === detailPageDropDowns.LEVEL) {
          updatedType = t('sales.locations.level');
        } else if (type === detailPageDropDowns.SCORE) {
          updatedType = t('sales.locations.score');
        } else if (type === detailPageDropDowns.FRANCHISE) {
          updatedType = t('sales.locations.linkedFranchise');
        } else if (type === detailPageDropDowns.USER) {
          updatedType = t('sales.locations.userAssigned');
        }

        toaster.success({
          text: `${updatedType} ${t('sales.locations.updatedLocation')}`,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        assignCloseDrawer(locationDrawerTypes.RIGHT);
        setLoading(false);
      }
    } catch (error) {
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };
  /**
   * common function to update data to formDat object
   */
  const updateFormHandler = useCallback(
    (name, value) => {
      setSelectedOption((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setSelectedOption],
  );

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    /**
     * check the specific dropdown to instant update
     */
    if (verifyDropDownName(name))
      updateLocation(
        {
          [name]: value?.id !== undefined && value?.id !== null ? value?.id : value,
        },
        name,
      );
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [name]: key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    updateFormHandler(name, value);
  };

  const [convertState, setConvertState] = useState({
    right: false,
  });
  const toggleDrawerConvert = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setConvertState({ ...convertState, [anchor]: open });
  };
  const assignCloseDrawer = (anchor) => {
    setConvertState({ ...convertState, [anchor]: false });
  };
  useEffect(() => {
    fetchFranchises();
    fetchLevelAndScore();
  }, []);

  /**
   * show the linked franchise in Linked Franchise dropdown as selected value
   */
  useEffect(() => {
    if (data) {
      // Update associatedFranchiseId
      if (options?.franchises?.length) {
        updateSelectedOption(
          locationDropDownNames.ASSOCIATED_FRANCHISE_ID,
          options.franchises,
          data?.franchiseId,
          setSelectedOption,
        );
      }

      // Update level
      if (options?.level?.length) {
        updateSelectedOption(
          locationDropDownNames.LEVEL,
          options.level,
          data?.level,
          setSelectedOption,
        );
      }

      // // Update score
      // if (options?.score?.length) {
      //   updateSelectedOption(
      //     locationDropDownNames.SCORE,
      //     options.score,
      //     data?.score,
      //     setSelectedOption,
      //   );
      // }
    }
  }, [data, options?.franchises, options?.level]);

  return (
    <>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />} */}
      <Box className={classes.dropinnerWrap}>
        <Box className={classes.inlineDropdwon} component="div">
          <InputLabel variant="standard" className={classes.blueLabel} htmlFor="score">
            {t('sales.locations.score')}
          </InputLabel>
          {isFetchingLocationDetails ? (
            <Skeleton
              variant="text"
              width={100}
              height={36}
              sx={{ display: 'block', marginLeft: '8px' }}
            />
          ) : (
            <Typography variant="body2" className={classes.title}>
              {data?.score && data?.score > 0 ? `${data?.score} %` : NA}
            </Typography>

            //prev flow
            // <CustomDropDown
            //   name="score"
            //   id="score"
            //   placeHolder="10/100"
            //   placeHolderClassName={classes.holderColor}
            //   options={transformArrayForOptions(options?.score, 'name', 'id')}
            //   selectedValues={selectedOption?.score || {}}
            //   handleChange={inputChangedHandler}
            //   className={classes.borderLessDrop}
            // />
          )}
        </Box>
        <Box className={classes.inlineDropdwon} component="div">
          <InputLabel variant="standard" className={classes.blueLabel} htmlFor="level">
            {t('sales.locations.level')}
          </InputLabel>
          {optionLoading ? (
            <Skeleton
              variant="text"
              width={100}
              height={36}
              sx={{ display: 'block', marginLeft: '8px' }}
            />
          ) : (
            <CustomDropDown
              name="level"
              id="level"
              placeHolder={`${t('sales.locations.select')}  ${t('sales.locations.level')}`}
              options={transformArrayForOptions(options?.level, 'title', 'id') || []}
              selectedValues={selectedOption?.level || {}}
              handleChange={inputChangedHandler}
              className={classes.borderLessDrop}
              customDropdownOptionsListClass={classes.dropdwonValues}
              placeHolderClassName={classes.holderColor}
            />
          )}
        </Box>
        <Box className={classes.inlineDropdwon} component="div">
          <InputLabel variant="standard" className={classes.blueLabel} htmlFor="assignedTo">
            {t('sales.locations.assignedUserName')}
          </InputLabel>
          {optionLoading ? (
            <Skeleton
              variant="text"
              width={100}
              height={36}
              sx={{ display: 'block', marginLeft: '8px' }}
            />
          ) : data?.assignTo?.assignedUserName ? (
            <Button
              className={classes.btnColor}
              onClick={toggleDrawerConvert('right', true)}
              variant="onlyText"
              disableRipple
              endIcon={<ChevronDown className={classes.dropIcon} />}
            >
              <Avatar
                className={classes.assignAvatar}
                alt="Remy Sharp"
                src={data?.assignTo?.image || defaultImage}
              />
              {data?.assignTo?.assignedUserName || NA}
            </Button>
          ) : (
            <Button
              className={classes.empthyUser}
              onClick={toggleDrawerConvert('right', true)}
              variant="onlyText"
              disableRipple
            >
              {t('sales.locations.assignUser')}
            </Button>
          )}

          <Drawer
            anchor={locationDrawerTypes.RIGHT}
            open={convertState[locationDrawerTypes.RIGHT]}
            onClose={toggleDrawerConvert(locationDrawerTypes.RIGHT, false)}
          >
            <AssignedToDrawer
              anchor={locationDrawerTypes.RIGHT}
              assignCloseDrawer={assignCloseDrawer}
              data={data}
              updateLocation={updateLocation}
              loading={loading}
            />
          </Drawer>
        </Box>
        <Box className={classes.inlineDropdwon} component="div">
          <InputLabel variant="standard" className={classes.blueLabel} htmlFor="linkedFranchise">
            {t('sales.locations.linkedFranchise')}
          </InputLabel>
          {optionLoading ? (
            <Skeleton
              variant="text"
              width={100}
              height={36}
              sx={{ display: 'block', marginLeft: '8px' }}
            />
          ) : (
            <CustomDropDown
              name="associatedFranchiseId"
              id="associatedFranchiseId"
              placeHolder={t(`sales.locations.linkFranchise`)}
              // placeHolderClassName={classes.linkFranchise}
              options={transformArrayForOptions(options?.franchises, 'name', 'id') || []}
              selectedValues={selectedOption?.associatedFranchiseId || {}}
              handleChange={inputChangedHandler}
              className={classes.borderLessDrop}
              searchable
              searchPlaceholder={t(`sales.locations.searchFranchise`)}
              placeHolderClassName={classes.holderColor}
            />
          )}
        </Box>
      </Box>
    </>
  );
};

SidebarDropdowns.propTypes = {
  data: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setData: PropTypes.func,
  fetchFranchise: PropTypes.func,
  isFetchingLocationDetails: PropTypes.bool,
};

export default SidebarDropdowns;
