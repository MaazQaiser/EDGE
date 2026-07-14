import { Box, Button, InputLabel } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CustomInput from 'commonComponents/templates/customInput';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { ReactComponent as AddIcon } from 'src/assets/svg/plus.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';

/**
 * CreateTemplateQuestion is a reusable React component for displaying button bars.
 * @param {string} title -  title of the section.
 * @param {string} description - description of the section.
 * @param {function} handleChange - update the template state.
 * @param {object} errorMessages - Error messages to handle errors.
 *
 */

const useStyles = makeStyles((theme) => ({
  createTemplateInput: {
    marginTop: '16px',

    '&:first-child': {
      marginTop: '0px',
    },
  },
  createTemplateInputDescription: {
    '& .MuiInputBase-root': {
      alignItems: 'baseline',
    },
  },
  createTemplateAddDescriptionBtn: {
    '&.MuiButtonBase-root': {
      padding: '0',
      height: 'auto',
      color: theme.palette.textSecondary2,

      '& .MuiButton-startIcon': {
        marginRight: '4px',

        '& svg path': {
          stroke: theme.palette.textSecondary2,
        },
      },

      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  },
  createTemplateDropdown: {
    backgroundColor: theme.palette.surfaceWhite,
    height: '44px !important',
    width: '410px',

    '& h6': {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: '400',
    },

    '& p': {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: '400',
      color: theme.palette.textSecondary1,
    },
  },
}));

const CreateTemplateTitle = ({
  title,
  handleChange,
  description,
  errorMessages,
  templateableType,
  isEdit,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { getLabel } = useTenantLabel();
  const [showDescription, setShowDescription] = React.useState(!!description);
  const dropDownOptions = [
    {
      value: 'equipmentInspection',
      label: t('ho.templates.create.report.dropdown.equipmentInspection'),
    },
    {
      value: 'vehicleInspection',
      label: t('ho.templates.create.report.dropdown.vehicleInspection'),
    },
    {
      value: 'tourReports',
      label: t('ho.templates.create.report.dropdown.tourReports', {
        tour: getLabel('terms', 'tour', t),
      }),
    },
    {
      value: 'shiftDayEndReport',
      label: t('ho.templates.create.report.dropdown.shiftDayEndReport'),
    },
    {
      value: 'incidentReport',
      label: t('ho.templates.create.report.dropdown.incidentReport'),
    },
  ];

  const enumDropdown = {
    equipmentInspection: 'Equipment Inspection',
    vehicleInspection: 'Vehicle Inspection',
    tourReports: 'Tour Reports',
    shiftDayEndReport: 'Shift Day End Report',
    incidentReport: 'Incident Report',
  };
  const handleDropDown = (event) => {
    if (!event.target.value.value) return;
    handleChange({
      target: {
        name: event.target.name,
        value: event.target.value.value,
      },
    });
  };
  return (
    <>
      <Box className={classes.createTemplateInput}>
        <CustomInput
          value={title}
          name={'title'}
          onChange={handleChange}
          label={t('ho.templates.create.report.title')}
          multiline
          errorMessage={errorMessages.title}
          placeholder={t('ho.templates.create.report.titlePlaceholder')}
          required={true}
          id="reportName"
        />
      </Box>
      <Box className={classes.createTemplateInput}>
        {!showDescription ? (
          <Button
            variant="tertiaryGrey"
            className={classes.createTemplateAddDescriptionBtn}
            startIcon={<AddIcon />}
            disableRipple
            onClick={() => setShowDescription(!showDescription)}
          >
            {t('reportProblem.addDescription')}
          </Button>
        ) : (
          <CustomInput
            value={description}
            name={'description'}
            onChange={handleChange}
            label={t('ho.templates.create.report.description')}
            multiline
            placeholder={t('ho.templates.create.report.descriptionPlaceholder')}
            id="reportDescription"
            className={classes.createTemplateInputDescription}
            rows={4}
          />
        )}
      </Box>
      <Box className={classes.createTemplateInput}>
        <InputLabel>
          {t('ho.templates.create.report.type')}
          <RequiredAsterik />
        </InputLabel>
        <CustomDropDown
          placeHolder={t('ho.templates.create.report.type')}
          name={`templateableType`}
          options={dropDownOptions}
          selectedValues={{
            label: enumDropdown[templateableType],
            value: templateableType,
          }}
          disabled={isEdit}
          bordered={true}
          handleChange={handleDropDown}
          className={classes.createTemplateDropdown}
        />
      </Box>
    </>
  );
};

CreateTemplateTitle.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  errorMessages: PropTypes.object.isRequired,
  isEdit: PropTypes.bool,
  templateableType: PropTypes.string.isRequired,
};

CreateTemplateTitle.defaultProps = {
  title: '',
  description: '',
  errorMessages: {},
  isEdit: false,
};

export default CreateTemplateTitle;
