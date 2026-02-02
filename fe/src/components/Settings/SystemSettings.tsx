import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  SelectChangeEvent,
  Tooltip,
  IconButton,
  Divider,
  Grid
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  LooksOne,
  LooksTwo,
  Looks3,
  Send as SendIcon
} from '@mui/icons-material';
import { useSystemSettings } from '../../hooks/setting/useSystemSettings';
import { sanitizeHtml } from '../../utils/sanitize';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { testSmtpConnection, SmtpTestResult, getEnvSettings, updateEnvSettings, EnvEntry } from '../../api/settings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <Box sx={{ mb: 2, '& button': { mr: 1, mb: 1 } }}>
      <Tooltip title="Bold">
        <IconButton
          size="small"
          color={editor.isActive('bold') ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBold />
        </IconButton>
      </Tooltip>
      <Tooltip title="Italic">
        <IconButton
          size="small"
          color={editor.isActive('italic') ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalic />
        </IconButton>
      </Tooltip>
      <Tooltip title="Underline">
        <IconButton
          size="small"
          color={editor.isActive('underline') ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <FormatUnderlined />
        </IconButton>
      </Tooltip>
      <Tooltip title="Heading 1">
        <IconButton
          size="small"
          color={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <LooksOne />
        </IconButton>
      </Tooltip>
      <Tooltip title="Heading 2">
        <IconButton
          size="small"
          color={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <LooksTwo />
        </IconButton>
      </Tooltip>
      <Tooltip title="Heading 3">
        <IconButton
          size="small"
          color={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Looks3 />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const SystemSettings: React.FC = () => {
  const { state, handleSubmit, handleChange } = useSystemSettings();
  const [tabValue, setTabValue] = React.useState(0);
  const [smtpTestEmail, setSmtpTestEmail] = React.useState('');
  const [smtpTestLoading, setSmtpTestLoading] = React.useState(false);
  const [smtpTestResult, setSmtpTestResult] = React.useState<SmtpTestResult | null>(null);
  const [envEntries, setEnvEntries] = React.useState<EnvEntry[]>([]);
  const [envLoading, setEnvLoading] = React.useState(false);
  const [envError, setEnvError] = React.useState<string | null>(null);
  const [envSaving, setEnvSaving] = React.useState(false);
  const [envSuccess, setEnvSuccess] = React.useState<string | null>(null);
  const [envEdits, setEnvEdits] = React.useState<Record<string, string>>({});
  const [envValidation, setEnvValidation] = React.useState<Record<string, string>>({});

  const EDITABLE_KEYS = ['PORT', 'FE_URL', 'LOG_LEVEL', 'EMAIL_ENABLED', 'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_FROM'];
  const LOG_LEVEL_OPTIONS = ['error', 'warn', 'info', 'debug'];

  const validateEnvValue = (key: string, value: string): string | null => {
    const v = String(value).trim();
    switch (key) {
      case 'PORT':
      case 'EMAIL_PORT': {
        const num = parseInt(v, 10);
        if (v !== '' && (Number.isNaN(num) || num < 1 || num > 65535)) {
          return 'Must be a number between 1 and 65535';
        }
        return null;
      }
      case 'LOG_LEVEL':
        if (v !== '' && !LOG_LEVEL_OPTIONS.includes(v.toLowerCase())) {
          return `Must be one of: ${LOG_LEVEL_OPTIONS.join(', ')}`;
        }
        return null;
      case 'EMAIL_ENABLED':
        if (v !== '' && v !== 'true' && v !== 'false') return 'Must be true or false';
        return null;
      case 'FE_URL':
      case 'EMAIL_HOST':
      case 'EMAIL_FROM':
        if (v.length === 0 && EDITABLE_KEYS.includes(key)) return 'Cannot be empty';
        return null;
      default:
        return null;
    }
  };

  const handleEnvEdit = (key: string, value: string) => {
    setEnvEdits((prev) => ({ ...prev, [key]: value }));
    const err = validateEnvValue(key, value);
    setEnvValidation((prev) => (err ? { ...prev, [key]: err } : { ...prev, [key]: '' }));
  };

  const handleSaveEnv = async () => {
    const updates: Record<string, string> = {};
    let hasError = false;
    for (const key of Object.keys(envEdits)) {
      const value = envEdits[key];
      const err = validateEnvValue(key, value);
      if (err) {
        setEnvValidation((prev) => ({ ...prev, [key]: err }));
        hasError = true;
      } else {
        updates[key] = String(value).trim();
      }
    }
    if (hasError || Object.keys(updates).length === 0) return;
    setEnvSaving(true);
    setEnvError(null);
    setEnvSuccess(null);
    try {
      await updateEnvSettings(updates);
      setEnvEdits({});
      setEnvValidation({});
      setEnvSuccess('Environment variables updated. Changes are applied in the container.');
      await loadEnvSettings();
    } catch {
      setEnvError('Failed to update environment variables.');
    } finally {
      setEnvSaving(false);
    }
  };

  const handleSmtpTest = async () => {
    if (!smtpTestEmail) {
      setSmtpTestResult({ success: false, message: 'Please enter an email address' });
      return;
    }

    setSmtpTestLoading(true);
    setSmtpTestResult(null);

    try {
      const result = await testSmtpConnection(smtpTestEmail);
      setSmtpTestResult(result);
    } catch (error) {
      setSmtpTestResult({ success: false, message: 'Failed to test SMTP connection' });
    } finally {
      setSmtpTestLoading(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline
    ],
    content: state.settings.welcome_message || '',
    onUpdate: ({ editor }) => {
      handleChange({
        target: {
          name: 'welcome_message',
          value: editor.getHTML()
        }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  });

  React.useEffect(() => {
    if (editor && state.settings.welcome_message !== editor.getHTML()) {
      editor.commands.setContent(state.settings.welcome_message || '');
    }
  }, [editor, state.settings.welcome_message]);

  // Update document title when app_name changes
  React.useEffect(() => {
    if (state.settings.app_name) {
      document.title = state.settings.app_name;
    }
  }, [state.settings.app_name]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleThemeChange = (event: SelectChangeEvent<string>) => {
    handleChange({
      target: {
        name: 'theme',
        value: event.target.value
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const loadEnvSettings = React.useCallback(async () => {
    setEnvLoading(true);
    setEnvError(null);
    try {
      const data = await getEnvSettings();
      setEnvEntries(data || []);
    } catch {
      setEnvError('Failed to load environment variables.');
      setEnvEntries([]);
    } finally {
      setEnvLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadEnvSettings();
  }, [loadEnvSettings]);

  if (state.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        System Settings
      </Typography>

      {state.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {state.error}
        </Alert>
      )}

      {state.success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings updated successfully
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="App Name"
                name="app_name"
                value={state.settings.app_name || ''}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Company Name"
                name="company_name"
                value={state.settings.company_name || ''}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Sender Email"
                name="sender_email"
                value={state.settings.sender_email || ''}
                onChange={handleChange}
                fullWidth
                type="email"
              />
              <TextField
                label="Time Zone"
                name="time_zone"
                value={state.settings.time_zone || ''}
                onChange={handleChange}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel id="theme-label">Theme</InputLabel>
                <Select
                  labelId="theme-label"
                  name="theme"
                  value={state.settings.theme || 'light'}
                  label="Theme"
                  onChange={handleThemeChange}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ width: '100%', mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Welcome Message
                </Typography>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Editor" />
                    <Tab label="Preview" />
                  </Tabs>
                </Box>
                <TabPanel value={tabValue} index={0}>
                  <Box sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    '.ProseMirror': {
                      minHeight: '200px',
                      padding: 2,
                      '&:focus': {
                        outline: 'none'
                      }
                    }
                  }}>
                    <MenuBar editor={editor} />
                    <EditorContent editor={editor} />
                  </Box>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  <Box sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    minHeight: '200px',
                    bgcolor: 'background.paper'
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(state.settings.welcome_message ?? '') }} />
                  </Box>
                </TabPanel>
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={state.loading}
                sx={{ mt: 2 }}
              >
                {state.loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </form>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Email Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Send a test email to verify your SMTP configuration is working correctly.
            </Typography>

            {smtpTestResult && (
              <Alert
                severity={smtpTestResult.success ? 'success' : 'error'}
                sx={{ mb: 2 }}
                onClose={() => setSmtpTestResult(null)}
              >
                {smtpTestResult.message}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <TextField
                label="Test Email Address"
                type="email"
                value={smtpTestEmail}
                onChange={(e) => setSmtpTestEmail(e.target.value)}
                placeholder="recipient@example.com"
                size="small"
                sx={{ minWidth: 300 }}
                disabled={smtpTestLoading}
                data-testid="smtp-test-email"
              />
              <Button
                variant="outlined"
                color="primary"
                onClick={handleSmtpTest}
                disabled={smtpTestLoading || !smtpTestEmail}
                startIcon={smtpTestLoading ? <CircularProgress size={20} /> : <SendIcon />}
                data-testid="smtp-test-button"
              >
                {smtpTestLoading ? 'Sending...' : 'Send Test Email'}
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ pl: { md: 2 } }}>
            <Typography variant="h6" gutterBottom>
              Environment Variables
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Editable configuration. Changes update the .env file in the container. Passwords and secrets are not displayed.
            </Typography>
            {envError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setEnvError(null)}>
                {envError}
              </Alert>
            )}
            {envSuccess && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setEnvSuccess(null)}>
                {envSuccess}
              </Alert>
            )}
            {envLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : envEntries.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {envEntries.map((entry) => {
                  const isEditable = EDITABLE_KEYS.includes(entry.key) && !entry.masked;
                  const displayValue = envEdits[entry.key] !== undefined ? envEdits[entry.key] : (entry.masked ? '****' : entry.value);
                  const error = envValidation[entry.key];
                  return (
                    <Box key={entry.key}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {entry.key}
                      </Typography>
                      {isEditable ? (
                        entry.key === 'LOG_LEVEL' ? (
                          <FormControl fullWidth size="small" error={Boolean(error)}>
                            <Select
                              value={displayValue || ''}
                              onChange={(e) => handleEnvEdit(entry.key, e.target.value)}
                              displayEmpty
                            >
                              {LOG_LEVEL_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                            {error && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{error}</Typography>}
                          </FormControl>
                        ) : entry.key === 'EMAIL_ENABLED' ? (
                          <FormControl fullWidth size="small" error={Boolean(error)}>
                            <Select
                              value={displayValue === 'true' || displayValue === 'false' ? displayValue : ''}
                              onChange={(e) => handleEnvEdit(entry.key, e.target.value)}
                              displayEmpty
                            >
                              <MenuItem value="true">true</MenuItem>
                              <MenuItem value="false">false</MenuItem>
                            </Select>
                            {error && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{error}</Typography>}
                          </FormControl>
                        ) : (
                          <TextField
                            fullWidth
                            size="small"
                            value={displayValue}
                            onChange={(e) => handleEnvEdit(entry.key, e.target.value)}
                            onBlur={() => validateEnvValue(entry.key, envEdits[entry.key] ?? entry.value)}
                            error={Boolean(error)}
                            helperText={error}
                            type={entry.key === 'PORT' || entry.key === 'EMAIL_PORT' ? 'number' : 'text'}
                          />
                        )
                      ) : (
                        <TextField fullWidth size="small" value={displayValue} disabled />
                      )}
                    </Box>
                  );
                })}
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleSaveEnv}
                  disabled={envSaving || Object.keys(envEdits).length === 0}
                  sx={{ mt: 2 }}
                >
                  {envSaving ? 'Saving...' : 'Save env changes'}
                </Button>
              </Box>
            ) : !envError && !envLoading && (
              <Typography color="text.secondary">No environment variables available.</Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SystemSettings;
