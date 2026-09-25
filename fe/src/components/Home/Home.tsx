import React from 'react';
import ActiveTasks from './ActiveTasks';
import { Box } from '@mui/material';
import { getWelcomeMessage } from '../../api/settings';
import { useAsyncResource } from '../../hooks/common/useAsyncResource';
import { sanitizeHtml } from '../../utils/sanitize';

const Home: React.FC = (): React.ReactElement => {
  // A missing banner is not worth an error message; failures are only logged.
  const { data: welcomeMessage } = useAsyncResource<string | null>(
    async (signal) => (await getWelcomeMessage(signal)).welcome_message,
    [],
    { initialData: null, errorMessage: 'Failed to load welcome message' },
  );

  return (
    <Box>
      {welcomeMessage && (
        <Box
          data-testid="welcome-message"
          sx={{
            mb: 4,
            '& h1, & h2, & h3': {
              color: 'primary.main',
              mb: 2,
            },
          }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(welcomeMessage) }}
        />
      )}
      <ActiveTasks />
    </Box>
  );
};

export default Home;
