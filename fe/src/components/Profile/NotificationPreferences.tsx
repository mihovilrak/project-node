import React, { useState } from 'react';
import {
  Alert,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Paper,
  Switch,
  Typography,
} from '@mui/material';
import { useAsyncResource } from '../../hooks/common/useAsyncResource';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../../api/settings';
import { NotificationPreferences as Preferences } from '../../types/setting';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

const DEFAULTS: Preferences = {
  notifications_enabled: true,
  email_notifications_enabled: true,
};

const NotificationPreferences: React.FC = () => {
  const {
    data: preferences,
    setData,
    loading,
    error: loadError,
  } = useAsyncResource<Preferences>(
    (signal) => getNotificationPreferences(signal),
    [],
    {
      initialData: DEFAULTS,
      errorMessage: 'Failed to load notification preferences',
    },
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleChange = async (key: keyof Preferences, value: boolean) => {
    const previous = preferences;
    setData({ ...preferences, [key]: value });
    setSaving(true);
    setSaveError(null);
    try {
      setData(await updateNotificationPreferences({ [key]: value }));
    } catch (err: unknown) {
      setData(previous);
      setSaveError(
        getApiErrorMessage(err, 'Failed to save notification preferences'),
      );
    } finally {
      setSaving(false);
    }
  };

  const disabled = loading || saving || Boolean(loadError);
  const inAppOn = preferences.notifications_enabled;

  return (
    <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Notifications
      </Typography>
      {(loadError || saveError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {saveError || loadError}
        </Alert>
      )}
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={inAppOn}
              onChange={(e) =>
                handleChange('notifications_enabled', e.target.checked)
              }
              disabled={disabled}
            />
          }
          label="Notifications"
        />
        <FormControlLabel
          control={
            <Switch
              checked={inAppOn && preferences.email_notifications_enabled}
              onChange={(e) =>
                handleChange('email_notifications_enabled', e.target.checked)
              }
              disabled={disabled || !inAppOn}
              slotProps={{
                // Overriding the input slot drops MUI's default role.
                input: {
                  role: 'switch',
                  'aria-describedby': 'email-notifications-hint',
                },
              }}
            />
          }
          label="Email notifications"
        />
        <FormHelperText id="email-notifications-hint">
          {inAppOn
            ? 'Also send your notifications by email.'
            : 'Turn on notifications to receive them by email.'}
        </FormHelperText>
      </FormGroup>
    </Paper>
  );
};

export default NotificationPreferences;
