import {
  Box,
  Button,
  Chip,
  Paper,
  Tab,
  TableCell,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import CustomCheckbox from 'commonComponents/checkBox';
import CustomAccordion from 'commonComponents/customAccordion';
import CustomTabPanel from 'commonComponents/customTabPanel';
import ModalComponent from 'commonComponents/modal';
import ReportAIModifiedBadge from 'commonComponents/reportAIModifiedBadge';
import SelectInput from 'commonComponents/Select';
import TableComponent from 'commonComponents/table';
import CustomInput from 'commonComponents/templates/customInput';
import CustomRadioGroup from 'commonComponents/templates/customRadioGroup';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const BUTTON_VARIANTS = [
  'primary',
  'secondaryGrey',
  'tertiaryGrey',
  'onlyText',
  'destructive',
  'destructiveSecondary',
  'secondaryBlue',
];

const SELECT_OPTIONS = [
  { id: '1', value: 'Option One' },
  { id: '2', value: 'Option Two' },
  { id: '3', value: 'Option Three' },
];

const RADIO_OPTIONS = [
  { id: 'a', optionText: 'Option A' },
  { id: 'b', optionText: 'Option B' },
  { id: 'c', optionText: 'Option C' },
];

const TABLE_COLUMNS = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'role', label: 'Role', sortable: false },
  { id: 'status', label: 'Status', sortable: false },
];

const TABLE_DATA = [
  { id: 1, name: 'Alice Johnson', role: 'Officer', status: 'Active' },
  { id: 2, name: 'Bob Smith', role: 'Supervisor', status: 'Active' },
  { id: 3, name: 'Carol Davis', role: 'Officer', status: 'On Leave' },
];

const Section = ({ title, source, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h5" sx={{ mb: 0.5, color: '#262527', fontWeight: 600 }}>
      {title}
    </Typography>
    <Typography variant="caption" sx={{ color: '#86868b', display: 'block', mb: 2 }}>
      {source}
    </Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>{children}</Box>
  </Box>
);

Section.propTypes = {
  title: PropTypes.string.isRequired,
  source: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const ComponentsTab = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('a');
  const [selectValue, setSelectValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [tablePage, setTablePage] = useState(0);

  const renderTableBody = (data) =>
    data.map((row) => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.role}</TableCell>
        <TableCell>{row.status}</TableCell>
      </TableRow>
    ));

  return (
    <Box>
      <Section
        title={t('designSystemPage.components.button')}
        source="src/theme/overrides/muiButton.js"
      >
        {BUTTON_VARIANTS.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
        <Button variant="primary" disabled>
          primary (disabled)
        </Button>
      </Section>

      <Section
        title={t('designSystemPage.components.input')}
        source="src/app/components/common/templates/customInput/index.jsx"
      >
        <Box sx={{ width: 320 }}>
          <CustomInput
            label="Label"
            name="demo-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter text..."
          />
        </Box>
        <Box sx={{ width: 320 }}>
          <CustomInput
            label="With error"
            name="demo-input-error"
            value=""
            onChange={() => {}}
            errorMessage="This field is required"
          />
        </Box>
      </Section>

      <Section
        title={t('designSystemPage.components.select')}
        source="src/app/components/common/Select/index.jsx"
      >
        <Box sx={{ width: 280 }}>
          <SelectInput
            name="demo-select"
            options={SELECT_OPTIONS}
            selectedValue={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
          />
        </Box>
      </Section>

      <Section
        title={t('designSystemPage.components.checkbox')}
        source="src/app/components/common/checkBox/index.jsx"
      >
        <CustomCheckbox
          name="demo-checkbox"
          label="Accept terms"
          checked={checkboxChecked}
          onChange={(_name, checked) => setCheckboxChecked(checked)}
        />
      </Section>

      <Section
        title={t('designSystemPage.components.radio')}
        source="src/app/components/common/templates/customRadioGroup/index.jsx"
      >
        <CustomRadioGroup
          label="Choose an option"
          options={RADIO_OPTIONS}
          value={radioValue}
          handleChange={(e) => setRadioValue(e.target.value)}
        />
      </Section>

      <Section
        title={t('designSystemPage.components.modal')}
        source="src/app/components/common/modal/index.jsx"
      >
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          {t('designSystemPage.components.openModal')}
        </Button>
        <ModalComponent
          open={modalOpen}
          handleClose={() => setModalOpen(false)}
          body={
            <Paper
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                p: 3,
                borderRadius: 2,
                minWidth: 320,
              }}
            >
              <Typography sx={{ mb: 2 }}>
                {t('designSystemPage.components.modalContent')}
              </Typography>
              <Button variant="secondaryGrey" onClick={() => setModalOpen(false)}>
                {t('designSystemPage.components.close')}
              </Button>
            </Paper>
          }
        />
      </Section>

      <Section
        title={t('designSystemPage.components.chipBadge')}
        source="Mui Chip + commonComponents/reportAIModifiedBadge"
      >
        <Chip label="Default Chip" />
        <Chip label="Brand" sx={{ backgroundColor: '#E5F6FF', color: '#146DFF' }} />
        <ReportAIModifiedBadge isAIModified />
        <ReportAIModifiedBadge isAIModified={false} />
      </Section>

      <Section
        title={t('designSystemPage.components.tabs')}
        source="src/app/components/common/customTabPanel/index.jsx"
      >
        <Box sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v)}>
            <Tab label="Tab One" />
            <Tab label="Tab Two" />
            <Tab label="Tab Three" />
          </Tabs>
          <CustomTabPanel value={tabValue} index={0}>
            <Typography>Content for Tab One</Typography>
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={1}>
            <Typography>Content for Tab Two</Typography>
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={2}>
            <Typography>Content for Tab Three</Typography>
          </CustomTabPanel>
        </Box>
      </Section>

      <Section
        title={t('designSystemPage.components.accordion')}
        source="src/app/components/common/customAccordion/index.jsx"
      >
        <Box sx={{ width: '100%', maxWidth: 480 }}>
          <CustomAccordion summary="Accordion header" defaultExpanded>
            <Typography variant="body2">Accordion panel content goes here.</Typography>
          </CustomAccordion>
        </Box>
      </Section>

      <Section
        title={t('designSystemPage.components.table')}
        source="src/app/components/common/table/index.jsx"
      >
        <Box sx={{ width: '100%' }}>
          <TableComponent
            data={TABLE_DATA}
            columns={TABLE_COLUMNS}
            tableBody={renderTableBody}
            totalRecords={TABLE_DATA.length}
            page={tablePage}
            pagination={false}
            handleChangePage={(_e, newPage) => setTablePage(newPage)}
            applySorting={() => {}}
          />
        </Box>
      </Section>
    </Box>
  );
};

export default ComponentsTab;
