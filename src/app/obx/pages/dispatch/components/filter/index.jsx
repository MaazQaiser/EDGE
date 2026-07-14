import { Box, Button, InputLabel, Stack, SwipeableDrawer, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown';
import { Clossicon } from 'src/assets/svg';
import { MoreFilter } from 'src/assets/svg';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { getDispatchTypes } from 'src/services/dispatch.services';
import { getFranchiseSitesbyId, getFranchisesList } from 'src/services/franchise.services';
import { rolesEnumWithName, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

// import { TIME_ELAPSED_OPTIONS } from '../../dispatch.constant';
import { useCallFromMonitoringServiceTypeOptions } from '../../helper';
import { useStyles } from './filterStyle';

const Filter = ({ open, anchor, onChange, toggleDrawer }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [selected, setSelected] = useState({});
  const [franchises, setFranchises] = useState([]);
  const [sites, setSites] = useState([]);
  const [dipatchTypeOptions, setDipatchTypeOptions] = useState([]);
  const { getLabel } = useTenantLabel();

  const getDispatchTypesFunc = async () => {
    try {
      const response = await getDispatchTypes();

      const DISPATCH_TYPE_OPTIONS = Object.keys(response || {}).map((key) => ({
        value: key,
        label: response[key],
      }));

      setDipatchTypeOptions(DISPATCH_TYPE_OPTIONS || []);
    } catch (error) {
      toaster.error({
        text: error?.response?.data?.message || error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const dispatchOptions = useCallFromMonitoringServiceTypeOptions(t);

  const userRole = useSelector((state) => state.auth.userRole);

  const userInfo = useSelector((state) => state.user.info);

  const fetchFranchiseList = async () => {
    try {
      const response = await getFranchisesList({ status: 'functional' });
      if (response && response?.statusCode === 200) {
        setFranchises(response?.data?.franchises || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFranchiseSites = async (id) => {
    try {
      const response = await getFranchiseSitesbyId(id, {
        status: 'functional',
      });
      if (response && response?.statusCode === 200) {
        setSites(response?.data?.sites || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleApplyFilter = (state) => {
    setSelected(state);
    onChange(state);
  };

  const handleClearAll = () => setSelected(null);

  const franchiseOptions =
    franchises.map((franchise) => ({
      label: franchise.name,
      value: franchise.id,
    })) || [];

  const sitesOptions =
    sites.map((site) => ({
      label: site.name,
      value: site.id,
    })) || [];

  useEffect(() => {
    getDispatchTypesFunc();

    if (
      userRole.slug === rolesEnumWithName.home_officer.slug ||
      userRole.slug === rolesEnumWithName.ho_agent.slug
    ) {
      fetchFranchiseList();
    }
  }, []);

  useEffect(() => {
    if (
      (userRole.slug === rolesEnumWithName.home_officer.slug ||
        userRole.slug === rolesEnumWithName.ho_agent.slug) &&
      selected?.franchise?.value
    ) {
      fetchFranchiseSites(selected?.franchise?.value);
      return;
    }
    if (userInfo?.franchiseId) {
      fetchFranchiseSites(userInfo.franchiseId);
      return;
    }
  }, [selected?.franchise]);

  const filters = selected
    ? Object.values(selected).filter((v) => v?.length || v?.value)?.length
    : 0;

  const List = ({ anchor, selected = {} }) => {
    const [state, setState] = useState(() => {
      return selected;
    });
    const handleChange = (event) => {
      const { name, value } = event.target;
      setState((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    return (
      <Box
        key={anchor}
        className={classes.siderBarBox}
        sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 399 }}
        role="presentation"
      >
        <Box className={classes.sideHeader}>
          <Stack
            direction="row"
            spacing={2}
            className={classes.sideHeaderTop}
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h3">{`${t('commonText.allFilters')}`}</Typography>
            <div className={classes.cancelBtn} onClick={() => toggleDrawer(false)}>
              <Clossicon className={classes.crossIcons} />
            </div>
          </Stack>
          <Button
            onClick={handleClearAll}
            className={classes.clearAll}
            variant="tertiaryGrey"
            disableRipple
            endIcon={<Clossicon className={classes.filterIcon} />}
          >
            {`${t('commonText.clearAll')}`}
          </Button>
        </Box>
        <Box className={classNames(classes.filedArea, 'innerScrollBar')}>
          {/* <Box>
            <InputLabel>{`${t('obx.dispatch.timeElapsed')}`}</InputLabel>
            <CustomDropDown
              placeHolder={`${t('commonText.select')} ${t('obx.dispatch.timeElapsed')}`}
              name="timeElapsed"
              label={t('obx.dispatch.timeElapsed')}
              options={TIME_ELAPSED_OPTIONS(t)}
              clearAll={true}
              selectedValues={state?.timeElapsed || {}}
              handleChange={handleChange}
              bordered
              className={classes.dropHigh}
            />
          </Box> */}
          <Box>
            <Box className={classes.marginBotom}>
              <InputLabel>{`${t('obx.dispatch.dispatchType', { dispatch: getLabel('terms', 'dispatch', t) })}`}</InputLabel>
              <CustomDropDown
                placeHolder={`${t('commonText.select')} ${t('obx.dispatch.dispatchType', { dispatch: getLabel('terms', 'dispatch', t) })}`}
                name="types"
                label={t('obx.dispatch.dispatchType', {
                  dispatch: getLabel('terms', 'dispatch', t),
                })}
                options={dipatchTypeOptions}
                selectedValues={state?.types || []}
                multiSelect={true}
                clearAll={true}
                handleChange={handleChange}
                bordered
                className={classes.dropHigh}
              />
            </Box>
          </Box>
          <Box>
            <Box className={classes.marginBotom}>
              <InputLabel htmlFor={t('obx.dispatch.filters.monitoringService.label')}>
                {t('obx.dispatch.filters.monitoringService.label')}
              </InputLabel>
              <CustomDropDown
                label={t('obx.dispatch.filters.monitoringService.label')}
                placeHolder={`${t('obx.dispatch.filters.monitoringService.placeholder')}`}
                name="monitoringServiceTypes"
                options={dispatchOptions}
                selectedValues={state?.monitoringServiceTypes || []}
                bordered
                className={classes.dropHigh}
                handleChange={handleChange}
                multiSelect={true}
                clearAll={true}
              />
            </Box>
          </Box>
          {(userRole.slug === rolesEnumWithName.home_officer.slug ||
            userRole.slug === rolesEnumWithName.ho_agent.slug) && (
            <Box>
              <Box className={classes.marginBotom}>
                <InputLabel>{`${t('obx.dispatch.franchise')}`}</InputLabel>
                <CustomDropDown
                  placeHolder={`${t('commonText.select')} ${t('obx.dispatch.franchise')}`}
                  name="franchise"
                  label={t('obx.dispatch.franchise')}
                  options={franchiseOptions}
                  selectedValues={state?.franchise || {}}
                  clearAll={true}
                  clear={true}
                  handleChange={handleChange}
                  bordered
                  className={classes.dropHigh}
                />
              </Box>
            </Box>
          )}
          <Box>
            <Box className={classes.marginBotom}>
              <InputLabel>{`${t('obx.dispatch.sites')}`}</InputLabel>
              <CustomDropDown
                placeHolder={`${t('commonText.select')} ${t('obx.dispatch.sites')}`}
                name="sites"
                search={true}
                options={sitesOptions}
                selectedValues={state?.sites || []}
                multiSelect={true}
                clearAll={true}
                handleChange={handleChange}
                bordered
                className={classes.dropHigh}
              />
            </Box>
          </Box>
        </Box>

        <Box className={classes.sideFooter}>
          <Stack direction="row" justifyContent="end" className={classes.buttonStacks}>
            <Button onClick={() => toggleDrawer(false)} variant="secondaryGrey">
              {t('visitor.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={() => handleApplyFilter(state)}
            >{`${t('commonText.applyFilters')}`}</Button>
          </Stack>
        </Box>
      </Box>
    );
  };

  List.propTypes = {
    anchor: PropTypes.string.isRequired,
    selected: PropTypes.object,
  };
  return (
    <>
      <Button
        onClick={toggleDrawer}
        className={classes.moreFilter}
        variant="onlyText"
        disableRipple
      >
        {t('sales.locations.moreFilters')}
        {filters ? <Box className={classes.redCircle}>{filters}</Box> : null}
        <MoreFilter className={classes.filterIcon} />
      </Button>
      <SwipeableDrawer
        key={open}
        className={classes.sideDraw}
        anchor={anchor}
        open={open}
        onClose={() => toggleDrawer(false)}
        onOpen={() => toggleDrawer(true)}
      >
        <List anchor={anchor} selected={selected} />
      </SwipeableDrawer>
    </>
  );
};

Filter.propTypes = {
  open: PropTypes.bool.isRequired,
  anchor: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  toggleDrawer: PropTypes.func,
};

export default Filter;
