import { Box, Tab, Tabs, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ColorsTab from './components/colorsTab';
import ComponentsTab from './components/componentsTab';
import TypographyTab from './components/typographyTab';

const DesignSystem = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: t('designSystemPage.tabs.colors'), component: <ColorsTab /> },
    { label: t('designSystemPage.tabs.typography'), component: <TypographyTab /> },
    { label: t('designSystemPage.tabs.components'), component: <ComponentsTab /> },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h3" sx={{ mb: 1, color: '#262527', fontWeight: 700 }}>
        {t('designSystemPage.title')}
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: '#86868b' }}>
        Light theme reference — colors, typography, and common components
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_e, value) => setActiveTab(value)}
        sx={{
          mb: 3,
          borderBottom: '1px solid #e6e6e7',
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
        }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.label} label={tab.label} />
        ))}
      </Tabs>

      <Box>{tabs[activeTab].component}</Box>
    </Box>
  );
};

export default DesignSystem;
