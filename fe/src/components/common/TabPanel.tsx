import React from 'react';
import { Box } from '@mui/material';
import { TabPanelProps } from '../../types/common';

const TabPanel: React.FC<TabPanelProps> = React.memo(
  ({ children, value, index, idPrefix = 'app' }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`${idPrefix}-tabpanel-${index}`}
      aria-labelledby={`${idPrefix}-tab-${index}`}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 3, width: '100%', overflow: 'auto' }}>{children}</Box>
      )}
    </div>
  ),
);
TabPanel.displayName = 'TabPanel';

export default TabPanel;
