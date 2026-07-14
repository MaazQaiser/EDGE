import { Box, Chip } from '@mui/material';
import { ReactComponent as DeleteIcon } from 'assets/svg/x-primary.svg?react';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

const PermissionChips = ({ permissionData = {}, onPermissionChange = () => {} }) => {
  const [showAll, setShowAll] = useState(false);

  const selectedPermissions = useMemo(() => {
    const chips = [];

    const processLevel = (obj = {}, depth = 0, parentPath = '', parentName = '') => {
      if (!obj || typeof obj !== 'object') {
        return;
      }

      Object.entries(obj).forEach(([key, value]) => {
        if (parentPath === '' && ['create', 'view', 'update', 'delete'].includes(key)) {
          return;
        }

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          Object.entries(value).forEach(([permKey, permValue]) => {
            if (['create', 'view', 'update', 'delete'].includes(permKey) && permValue === true) {
              const currentPath = parentPath ? `${parentPath}.${key}` : key;
              const displayPath = parentName
                ? `${parentName}/${permKey} ${key}`
                : `${key}/${permKey}`;
              chips.push({
                label: displayPath,
                path: `${currentPath}.${permKey}`,
              });
            }
          });

          if (depth < 2) {
            const newParentPath = parentPath ? `${parentPath}.${key}` : key;
            const newParentName = parentName ? `${parentName}/${key}` : key;
            processLevel(value, depth + 1, newParentPath, newParentName);
          }
        }
      });
    };

    if (permissionData && typeof permissionData === 'object') {
      processLevel(permissionData);
    }

    return chips;
  }, [permissionData]);

  const handleChipDelete = (path) => {
    if (path && onPermissionChange) {
      onPermissionChange(path, false);
    }
  };

  const displayedChips = showAll ? selectedPermissions : selectedPermissions.slice(0, 5);
  const hasMoreChips = selectedPermissions.length > 5;
  return (
    <Box>
      {displayedChips.map((chip) => (
        <Chip
          key={chip.path}
          label={chip.label}
          size="small"
          color="primary"
          onDelete={() => handleChipDelete(chip.path)}
          deleteIcon={<DeleteIcon />}
        />
      ))}
      {hasMoreChips && (
        <Chip
          label={showAll ? 'Show Less' : `View All (${selectedPermissions.length})`}
          size="small"
          color="primary"
          variant="filled-primary"
          onClick={() => setShowAll(!showAll)}
        />
      )}
    </Box>
  );
};

export default PermissionChips;

PermissionChips.propTypes = {
  permissionData: PropTypes.object,
  onPermissionChange: PropTypes.func,
};
