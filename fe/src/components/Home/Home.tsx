import React from 'react';
import ActiveTasks from './ActiveTasks';
import { Box } from '@mui/material';
import { useSystemSettings } from '../../hooks/setting/useSystemSettings';
import { sanitizeHtml } from '../../utils/sanitize';

const Home: React.FC = (): React.ReactElement => {
  const { state } = useSystemSettings();

  return (
    <Box>
      {state?.settings?.welcome_message && (
        <Box
          data-testid="welcome-message"
          sx={{
            mb: 4,
            '& h1, & h2, & h3': {
              color: 'primary.main',
              mb: 2
            }
          }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(state.settings.welcome_message ?? '') }}
        />
      )}
      <ActiveTasks />
    </Box>
  );
};

export default Home;
