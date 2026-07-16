import { Alert, Autocomplete, Button, Checkbox, InputLabel, Stack, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import { ReactComponent as AddPersonIcon } from 'assets/svg/person-add.svg?react';
import { ReactComponent as DeleteIcon } from 'assets/svg/trash-2.svg?react';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg?react';
import { isObjectEmpty, removeKey } from 'src/helper/utilityFunctions';

import { useStyles } from '.';

const MAX_CONTACTS = 4;

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('') || '?';

/**
 * Directory-driven contacts for the site information form.
 *
 * Contacts originate from the external application ("SET"), so their identity
 * fields (name / phone / email) are read-only here. Only the site-specific
 * attributes (role on this site, emergency flag) are editable.
 */
const ExternalContactsComponent = ({
  errorMessages,
  formDataKey,
  formData,
  updateFormHandler,
  setErrorMessages,
  options = [],
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const selected = formData?.[formDataKey] ?? [];
  const visibleContacts = selected.filter((c) => !c?._destroy);

  const availableOptions = useMemo(() => {
    const usedExternalIds = new Set(
      selected.filter((c) => !c?._destroy && c?.externalId).map((c) => String(c.externalId)),
    );
    return options.filter((o) => !usedExternalIds.has(String(o.id)));
  }, [options, selected]);

  const atLimit = visibleContacts.length >= MAX_CONTACTS;

  const getErrorKey = (key, index) => `${formDataKey},${index},${key}`;

  const addContactFromDirectory = (option) => {
    if (!option || atLimit) return;
    const newContact = {
      externalId: option.id,
      name: option.name,
      contact: option.phone,
      email: option.email ?? null,
      role: option.defaultRole ?? '',
      isEmergencyContact: false,
      source: option.source,
    };
    setErrorMessages((prev) => removeKey([formDataKey], prev));
    updateFormHandler(formDataKey, [...(formData?.[formDataKey] ?? []), newContact]);
  };

  const removeContact = (index) => {
    const updated = selected
      .map((form, i) => {
        if (i === index && form?.id) return { ...form, _destroy: true };
        if (i === index && !form?.id) return {};
        return form;
      })
      .filter((data) => !isObjectEmpty(data));
    updateFormHandler(formDataKey, updated);
    ['role', 'isEmergencyContact'].forEach((key) =>
      setErrorMessages((prev) => removeKey([getErrorKey(key, index)], prev)),
    );
  };

  const updateField = (index, field, value) => {
    const updated = [...selected];
    updated[index] = { ...updated[index], [field]: value };
    updateFormHandler(formDataKey, updated);
    if (value) setErrorMessages((prev) => removeKey([getErrorKey(field, index)], prev));
  };

  return (
    <Box className={classes.wrapper}>
      <Box className={classes.picker}>
        <span className={classes.pickerHeader}>
          <AddPersonIcon />
          {t('obx.buttons.addContacts')}
        </span>
        <Autocomplete
          className={classes.autocomplete}
          disabled={atLimit}
          options={availableOptions}
          value={null}
          blurOnSelect
          clearOnBlur
          getOptionLabel={(option) => option?.name ?? ''}
          onChange={(_e, option) => addContactFromDirectory(option)}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Box className={classes.optionRow}>
                <span className={classes.optionName}>{option.name}</span>
                <span className={classes.optionMeta}>
                  {[option.defaultRole, option.email].filter(Boolean).join(' · ')}
                </span>
              </Box>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={
                atLimit ? `You can add up to ${MAX_CONTACTS} contacts` : 'Search contacts'
              }
            />
          )}
        />
        {atLimit && (
          <span
            className={classes.pickerHint}
          >{`Maximum of ${MAX_CONTACTS} contacts reached.`}</span>
        )}
      </Box>

      {selected.map((form, index) => {
        if (form?._destroy) return null;
        return (
          <Box key={form?.externalId ?? form?.id ?? index} className={classes.card}>
            <Box className={classes.cardHeader}>
              <Box className={classes.cardHeaderLeft}>
                <span className={classes.avatar}>{getInitials(form?.name)}</span>
                <Box className={classes.headerText}>
                  <span className={classes.contactName}>
                    {form?.name || `${t('obx.sites.siteInformation.person')} ${index + 1}`}
                  </span>
                </Box>
              </Box>
              <Button
                onClick={() => removeContact(index)}
                variant="destructiveSecondary"
                className={classes.removeBtn}
                startIcon={<DeleteIcon />}
                disableRipple
              >
                {t('obx.buttons.removeContact')}
              </Button>
            </Box>

            <Box className={classes.cardBody}>
              {/* Read-only identity, shown as label/value fields to match the
                  client and location cards. */}
              <Box className={classes.readOnlyRow}>
                <Box className={classes.readOnlyItem}>
                  <span className={classes.readOnlyLabel}>
                    {t('form.input.textField.contact.label')}
                  </span>
                  <span className={classes.readOnlyValue}>{form?.contact || '—'}</span>
                </Box>
                <Box className={classes.readOnlyItem}>
                  <span className={classes.readOnlyLabel}>
                    {t('form.input.textField.email.label')}
                  </span>
                  <span className={classes.readOnlyValue}>{form?.email || '—'}</span>
                </Box>
              </Box>

              {/* Site-specific details: role is auto-filled from the directory
                  (read-only), the emergency flag is editable. */}
              <Box className={classes.editableSection}>
                <span className={classes.editableTitle}>Site-specific details</span>
                <Box className={classes.editableRow}>
                  <Box className={classes.editableControl}>
                    <InputLabel htmlFor={`contact-role-${index}`}>
                      {t('obx.users.userInformation.role')}
                    </InputLabel>
                    <TextField
                      id={`contact-role-${index}`}
                      fullWidth
                      value={form?.role ?? ''}
                      disabled
                      placeholder={t('obx.users.userInformation.role')}
                      className={classes.editableInput}
                    />
                  </Box>
                  <Box className={classes.emergencyCheckbox}>
                    <Checkbox
                      id={`mark-emergency-contact-${index}`}
                      onChange={(e) => updateField(index, 'isEmergencyContact', e.target.checked)}
                      icon={<CheckBoxRegularIcon />}
                      checked={!!form?.isEmergencyContact}
                      checkedIcon={<CheckBoxCheckedIcon />}
                      className={classes.checkBoxCustom}
                    />
                    <InputLabel htmlFor={`mark-emergency-contact-${index}`}>
                      {t('obx.form.input.textField.markEmergencyContact.label')}
                    </InputLabel>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        );
      })}

      {errorMessages?.[formDataKey] && (
        <Stack sx={{ width: '100%', alignItems: 'center' }} spacing={2}>
          <Alert severity="error">{errorMessages?.[formDataKey]}</Alert>
        </Stack>
      )}
    </Box>
  );
};

export default ExternalContactsComponent;

ExternalContactsComponent.propTypes = {
  formData: PropTypes.object,
  errorMessages: PropTypes.object,
  updateFormHandler: PropTypes.func,
  formDataKey: PropTypes.string,
  setErrorMessages: PropTypes.func,
  options: PropTypes.array,
};
