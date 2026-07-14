import { Chip } from '@mui/material';
import { ReactComponent as FunctionalIcon } from 'assets/svg/check-circle-green.svg?react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReactComponent as AlertIcon } from 'src/assets/svg/info.svg?react';

export const statusEnum = {
  functional: 'functional',
  nonFunctional: 'nonFunctional',
  requiresAttention: 'requiresAttention',
};

const ChipComponent = ({ status, isSite = false }) => {
  const { t } = useTranslation();

  const getStatusText = () => {
    switch (status) {
      case statusEnum.functional:
        return t('commonText.statuses.franchise.functional');
      case statusEnum.nonFunctional:
        return isSite
          ? t('commonText.statuses.franchise.nonFunctional')
          : t('commonText.statuses.franchise.requiresAttention');
      case statusEnum.requiresAttention:
        return t('commonText.statuses.franchise.requiresAttention');
      default:
        return t('commonText.statuses.franchise.requiresAttention');
    }
  };

  const styles = {
    functional: {
      backgroundColor: '#EFF8EF',
      borderColor: '#EFF8EF',
    },
    nonFunctional: {
      backgroundColor: '#FBEEED',
      borderColor: '#FBEEED',
    },
    requiresAttention: {
      backgroundColor: '#FBEEED',
      borderColor: '#FBEEED',
    },
  };
  const getStyles = () => {
    switch (status) {
      case statusEnum.functional:
        return styles.functional;
      case statusEnum.nonFunctional:
        return isSite ? styles.nonFunctional : styles.requiresAttention;
      case statusEnum.requiresAttention:
        return styles.requiresAttention;
      default:
        return styles.requiresAttention;
    }
  };

  const chipColor = {
    functional: 'success',
    nonFunctional: 'error',
    requiresAttention: 'error',
  };

  const getChipColor = () => {
    switch (status) {
      case statusEnum.functional:
        return chipColor.functional;
      case statusEnum.nonFunctional:
        return isSite ? chipColor.nonFunctional : chipColor.requiresAttention;
      case statusEnum.requiresAttention:
        return chipColor.requiresAttention;
      default:
        return chipColor.requiresAttention;
    }
  };

  const getIcon = () => {
    switch (status) {
      case statusEnum.functional:
        return <FunctionalIcon style={{ width: '12px', height: '12px' }} />;
      case statusEnum.nonFunctional:
        return isSite ? <AlertIcon /> : <AlertIcon />;
      case statusEnum.requiresAttention:
        return <AlertIcon />;
      default:
        return <AlertIcon />;
    }
  };

  // const style = {
  //   backgroundColor: status === franchiseStatusEnum.functional ? '#ECFDF3' : '#f6e9e8',
  //   borderColor: status === franchiseStatusEnum.functional ? '#ECFDF3' : '#f6e9e8',
  // };
  // const chipColor = status === franchiseStatusEnum.functional ? 'success' : 'error';
  // const statusText =
  // status === franchiseStatusEnum.functional
  //   ? `${t('commonText.statuses.franchise.functional')}`
  //   : `${t('commonText.statuses.franchise.requiresAttention')}`;
  // const icon =
  //   status === franchiseStatusEnum.functional ? (
  //     <CheckCircleOutlineOutlinedIcon />
  //   ) : (
  //     <ErrorOutlineOutlinedIcon />
  //   );
  return (
    <Chip
      color={getChipColor()}
      icon={getIcon()}
      size="small"
      label={getStatusText()}
      variant="outlined"
      style={getStyles()}
    />
  );
};

ChipComponent.propTypes = {
  status: PropTypes.string,
  isSite: PropTypes.bool,
};

export default ChipComponent;
