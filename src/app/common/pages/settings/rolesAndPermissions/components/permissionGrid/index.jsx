import { Box, Checkbox, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { ReactComponent as ACLCalendar } from 'src/assets/svg/ACLCalendar.svg?react';
import { ReactComponent as ACLCar } from 'src/assets/svg/ACLCar.svg?react';
import { ReactComponent as ACLDispatch } from 'src/assets/svg/ACLDispatch.svg?react';
import { ReactComponent as ACLFranchises } from 'src/assets/svg/ACLFranchises.svg?react';
import { ReactComponent as ACLFull } from 'src/assets/svg/ACLFull.svg?react';
import { ReactComponent as ACLInvoice } from 'src/assets/svg/ACLInvoice.svg?react';
import { ReactComponent as ACLMobile } from 'src/assets/svg/ACLMobile.svg?react';
import { ReactComponent as ACLPayroll } from 'src/assets/svg/ACLPayroll.svg?react';
import { ReactComponent as ACLRunsheet } from 'src/assets/svg/ACLRunsheet.svg?react';
import { ReactComponent as ACLSetting } from 'src/assets/svg/ACLSetting.svg?react';
import { ReactComponent as AClShipfReport } from 'src/assets/svg/AClShipfReport.svg?react';
import { ReactComponent as ACLSites } from 'src/assets/svg/ACLSites.svg?react';
import { ReactComponent as ACLTimeOffRequest } from 'src/assets/svg/ACLTimeOffRequest.svg?react';
import { ReactComponent as ACLUser } from 'src/assets/svg/ACLUser.svg?react';
import { ReactComponent as ACLZones } from 'src/assets/svg/ACLZones.svg?react';
import { ReactComponent as Regular } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as Iregular } from 'src/assets/svg/checkbox-checked.svg?react';
import { deepClone, isObjectEmpty, sortObjectByKey } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { accessControlList } from 'src/utils/constants';

import { Analytics } from '../../../../../../../assets/svg/index';
import { useStyles } from './permissionStyle';

const PERMISSION_TYPES = {
  FO: 'FO',
};

const standardKeys = ['view', 'create', 'update', 'delete', 'type'];

const removeRootStandardKeys = (obj) => {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !standardKeys.includes(key)));
};

const updateAllPermissions = (obj, permissionType, value) => {
  const newObj = deepClone(obj);
  const recursiveUpdate = (currentObj) => {
    if (currentObj[permissionType] !== undefined) {
      currentObj[permissionType] = value;
    }
    Object.keys(currentObj).forEach((key) => {
      if (
        typeof currentObj[key] === 'object' &&
        !Array.isArray(currentObj[key]) &&
        !standardKeys.includes(key)
      ) {
        recursiveUpdate(currentObj[key]);
      }
    });
  };

  recursiveUpdate(newObj);
  return newObj;
};

const PermissionCheckbox = React.memo(function PermissionCheckbox({
  checked,
  onChange,
  disabled = false,
}) {
  const classes = useStyles();

  return (
    <Box className={`${classes.cell} checkboxCell`}>
      <Checkbox
        icon={<Regular />}
        checkedIcon={<Iregular />}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="custom-checkbox"
      />
    </Box>
  );
});

PermissionCheckbox.propTypes = {
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
};

const MasterControlRow = React.memo(function MasterControlRow({
  localPermissionData = {},
  onPermissionChange = () => {},
  disabled = false,
  label = 'masterControl',
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const permissionTypes = ['view', 'create', 'update', 'delete'];
  console.log({ label });
  const getMasterState = useCallback(
    (permissionType) => {
      let hasTrue = false;
      let hasFalse = false;

      const checkState = (obj) => {
        Object.entries(obj).forEach(([key, value]) => {
          if (typeof value === 'object' && !Array.isArray(value) && !standardKeys.includes(key)) {
            checkState(value);
          } else if (key === permissionType) {
            value ? (hasTrue = true) : (hasFalse = true);
          }
        });
      };

      checkState(localPermissionData);
      return hasTrue && hasFalse ? null : hasTrue;
    },
    [localPermissionData],
  );

  return (
    <Box className={`${classes.gridContainer} ${classes.subHeaderGrid}`}>
      <Box className={classes.cell}>
        <ACLFull />
        <Typography variant="subtitle2" className={classes.moduleName}>
          {t(`obx.settings.rolesPermissions.masterControl`)}
        </Typography>
      </Box>

      {permissionTypes.map((type) => (
        <PermissionCheckbox
          key={type}
          disabled={disabled}
          checked={getMasterState(type) ?? false}
          onChange={(e) => {
            const newPermissions = updateAllPermissions(
              localPermissionData,
              type,
              e.target.checked,
            );
            onPermissionChange('', newPermissions);
          }}
        />
      ))}
    </Box>
  );
});

MasterControlRow.propTypes = {
  onPermissionChange: PropTypes.func,
  localPermissionData: PropTypes.object,
  disabled: PropTypes.bool,
  label: PropTypes.string,
};

const PermissionRow = React.memo(function PermissionRow({
  moduleName = '',
  moduleData = {},
  currentLevel = 1,
  parentPath = '',
  onPermissionChange = () => {},
  localPermissionData = undefined,
  setLocationPermissionData = () => {},
  disabled = false,
}) {
  if (currentLevel > 2) {
    return null;
  }

  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const permissionTypes = ['view', 'create', 'update', 'delete'];

  const mainClass =
    currentLevel > 1
      ? `${classes.gridContainer} ${classes.subPermissions}`
      : `${classes.gridContainer} ${classes.subHeaderGrid}`;

  const subClass = currentLevel > 1 ? `${classes.subPermissionsCell}` : `${classes.cell}`;
  const fullPath = parentPath ? `${parentPath}.${moduleName}` : moduleName;

  const getNestedProperty = useCallback(
    (keys) => {
      return keys.reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
      }, localPermissionData);
    },
    [localPermissionData],
  );
  const icons = {
    sites: <ACLSites />,
    users: <ACLUser />,
    zones: <ACLZones />,
    others: <ACLSetting />,
    settings: <ACLSetting />,
    analytics: <Analytics />,
    vehicles: <ACLCar />,
    schedules: <ACLCalendar />,
    franchises: <ACLFranchises />,
    franchiseMap: <ACLFranchises />,
    shiftReports: <AClShipfReport />,
    mobileApp: <ACLMobile />,
    dispatch: <ACLDispatch />,
    invoices: <ACLInvoice />,
    payrolls: <ACLPayroll />,
    timeOffRequests: <ACLTimeOffRequest />,
    runsheets: <ACLRunsheet />,
  };
  const nonStandardData = removeRootStandardKeys(moduleData);
  const hasSubModules = Object.keys(nonStandardData).length > 0;
  return (
    <Box className={classes.subModuleWrapper}>
      <Box className={mainClass}>
        <Box className={`${subClass} subModuleCell ${classes.parentCol}`}>
          {currentLevel < 2 && icons?.[moduleName]}
          <Typography variant="subtitle2" className={classes.moduleName}>
            {t(`obx.settings.rolesPermissions.${moduleName}`, {
              extra: getLabel('terms', 'extra', t),
              dispatch: getLabel('terms', 'dispatch', t),
              runsheets: getLabel('terms', 'runsheets', t),
            })}
          </Typography>
        </Box>

        {permissionTypes.map((type) => {
          const pathWithAction = `${fullPath}.${type}`;
          const value = getNestedProperty(pathWithAction.split('.'));
          if (value === undefined) {
            return (
              <Box key={type} className={`${classes.cell} checkboxCell`}>
                -
              </Box>
            );
          }
          return (
            <PermissionCheckbox
              disabled={disabled}
              key={type}
              checked={!!value}
              onChange={(e) => onPermissionChange(pathWithAction, e.target.checked)}
            />
          );
        })}
      </Box>

      {hasSubModules &&
        Object.entries(nonStandardData).map(([subModuleName, subModuleData]) => (
          <PermissionRow
            key={subModuleName}
            moduleName={subModuleName}
            moduleData={subModuleData}
            onPermissionChange={onPermissionChange}
            parentPath={fullPath}
            localPermissionData={localPermissionData}
            setLocationPermissionData={setLocationPermissionData}
            disabled={disabled}
            currentLevel={currentLevel + 1}
          />
        ))}
    </Box>
  );
});

PermissionRow.propTypes = {
  disabled: PropTypes.bool,
  currentLevel: PropTypes.number,
  moduleName: PropTypes.string,
  moduleData: PropTypes.object,
  onPermissionChange: PropTypes.func,
  parentPath: PropTypes.string,
  localPermissionData: PropTypes.object,
  setLocationPermissionData: PropTypes.func,
};

const TypeSection = ({
  type,
  permissions,
  onPermissionChange,
  localPermissionData,
  setLocationPermissionData,
  disabled,
}) => {
  // const { t } = useTranslation();
  const classes = useStyles();

  if (Object.keys(permissions).length === 0) {
    return null;
  }

  const nonStandardPermissions = Object.entries(permissions).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

  return (
    <Box className={classes.sectionWrapper}>
      {/*<Typography variant="h4" className={classes.sectionTitle}>*/}
      {/*  {t(`obx.settings.rolesPermissions.section.${type}`)}*/}
      {/*</Typography>*/}

      <MasterControlRow
        localPermissionData={nonStandardPermissions}
        onPermissionChange={(_, value) => {
          const updatedPermissions = { ...localPermissionData };

          Object.keys(value).forEach((path) => {
            updatedPermissions[path] = value[path];
          });
          onPermissionChange('', updatedPermissions);
        }}
        disabled={disabled}
        label={`${type.toLowerCase()}MasterControl`}
      />

      {Object.entries(nonStandardPermissions).map(([path, moduleData]) => (
        <PermissionRow
          key={path}
          moduleName={path.split('.').pop()}
          moduleData={moduleData}
          parentPath={path.split('.').slice(0, -1).join('.')}
          onPermissionChange={onPermissionChange}
          localPermissionData={localPermissionData}
          setLocationPermissionData={setLocationPermissionData}
          disabled={disabled}
          currentLevel={path.split('.').length}
        />
      ))}
    </Box>
  );
};

TypeSection.propTypes = {
  type: PropTypes.string.isRequired,
  permissions: PropTypes.object.isRequired,
  onPermissionChange: PropTypes.func.isRequired,
  localPermissionData: PropTypes.object.isRequired,
  setLocationPermissionData: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

const PermissionsGrid = ({
  selectedRole = {},
  isPending = false,
  setFormValues = () => {},
  disabled = false,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const permissionState = useMemo(() => accessControlList, [JSON.stringify(selectedRole)]);
  const [localPermissionData, setLocationPermissionData] = useState(() => {
    let result = {};
    if (isObjectEmpty(selectedRole?.privileges)) {
      result = JSON.parse(JSON.stringify(accessControlList));
    }
    result = selectedRole?.privileges || {};
    return sortObjectByKey(result);
  });

  const groupedPermissions = useMemo(() => {
    const result = {
      [PERMISSION_TYPES.FO]: {},
      [PERMISSION_TYPES.HO]: {},
      [PERMISSION_TYPES.SET]: {},
    };

    const processObject = (structureObj, valuesObj = {}, currentPath = '') => {
      for (const [key, value] of Object.entries(valuesObj)) {
        if (value && typeof value === 'object') {
          const newPath = currentPath ? `${currentPath}.${key}` : key;

          const structureType = structureObj[key]?.type;
          const valueType = value?.type;
          const type = valueType || structureType;

          if (type && Object.values(PERMISSION_TYPES).includes(type)) {
            if (!valueType) {
              value.type = type;
            }

            const parentPath = currentPath;
            const parentObj = parentPath ? structureObj : null;
            const parentType = parentObj?.type;

            if (!parentType) {
              result[type][newPath] = value;
            }
          }

          if (!standardKeys.includes(key)) {
            processObject(structureObj[key] || {}, value, newPath);
          }
        }
      }
    };
    processObject(permissionState, localPermissionData);
    return result;
  }, [permissionState, localPermissionData]);

  const onPermissionChange = (keys, value) => {
    if (!keys) {
      setLocationPermissionData(value);
      setFormValues(value);
      return;
    }

    const keysToMap = keys.split('.');
    let tempLocationPermissionData = { ...localPermissionData };
    let obj = tempLocationPermissionData;
    keysToMap.forEach((data, i) => {
      if (i === keysToMap?.length - 1) {
        obj[data] = value;
      } else {
        obj = obj[data];
      }
    });
    setLocationPermissionData(tempLocationPermissionData);
    setFormValues(tempLocationPermissionData);
  };

  if (!isObjectEmpty(selectedRole) && isObjectEmpty(selectedRole?.privileges)) {
    return <NoRecordFound data={[]} noOfColumns={5} t={t} />;
  }

  if (isPending) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box className={classes.moduleWrapper}>
      <Box className={`${classes.gridContainer} ${classes.headerGrid}`}>
        <Typography variant="subtitle2" className={classes.moduleCell}>
          {t('obx.settings.rolesPermissions.modules')}
        </Typography>
        {['view', 'create', 'update', 'delete'].map((type) => (
          <Typography key={type} variant="subtitle2" className={classes.headerCell}>
            {t(`obx.settings.rolesPermissions.${type}`)}
          </Typography>
        ))}
      </Box>

      {Object.values(PERMISSION_TYPES).map((type) => (
        <TypeSection
          key={type}
          type={type}
          permissions={groupedPermissions[type]}
          onPermissionChange={onPermissionChange}
          localPermissionData={localPermissionData}
          setLocationPermissionData={setLocationPermissionData}
          disabled={disabled}
        />
      ))}
    </Box>
  );
};

PermissionsGrid.propTypes = {
  selectedRole: PropTypes.array,
  setFormValues: PropTypes.func,
  isPending: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default PermissionsGrid;
