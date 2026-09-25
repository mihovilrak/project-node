import React from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import TaskTypesTable from './TaskTypesTable';
import ActivityTypesTable from './ActivityTypesTable';
import RolesTable from './RolesTable';
import TagsTable from './TagsTable';
import { TypesAndRolesDialog } from './TypesAndRolesDialog';
import {
  TAG_TAB,
  useTypesAndRoles,
} from '../../hooks/setting/useTypesAndRoles';

const ADD_LABELS: Record<number, string> = {
  0: 'Add Task Type',
  1: 'Add Activity Type',
  2: 'Add Role',
  [TAG_TAB]: 'Add Tag',
};
import { usePermission } from '../../hooks/common/usePermission';

const TypesAndRolesManager: React.FC = () => {
  const { hasPermission: canManage, loading: permissionLoading } =
    usePermission('Admin');
  const {
    state,
    handleTabChange,
    handleCreate,
    handleEdit,
    handleDialogClose,
    handleSave,
    handleDelete,
    handleReactivate,
    handleShowInactiveChange,
  } = useTypesAndRoles();
  // Roles are hard-deleted, so there is nothing inactive to show.
  const supportsInactive = state.activeTab !== 2;

  const renderContent = () => {
    if (state.loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <Typography>Loading...</Typography>
        </Box>
      );
    }

    switch (state.activeTab) {
      case 0:
        return (
          <TaskTypesTable
            taskTypes={state.taskTypes || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReactivate={handleReactivate}
            loading={state.loading}
            canManage={canManage}
          />
        );
      case 1:
        return (
          <ActivityTypesTable
            activityTypes={state.activityTypes || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReactivate={handleReactivate}
            loading={state.loading}
            canManage={canManage}
          />
        );
      case 2:
        return (
          <RolesTable
            roles={state.roles || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={state.loading}
            canManage={canManage}
          />
        );
      case TAG_TAB:
        return (
          <TagsTable
            tags={state.tags || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReactivate={handleReactivate}
            loading={state.loading}
            canManage={canManage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={state.activeTab} onChange={handleTabChange}>
          <Tab label="Task Types" />
          <Tab label="Activity Types" />
          <Tab label="Roles" />
          <Tab label="Tags" />
        </Tabs>
      </Box>

      {state.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {state.error}
        </Alert>
      )}

      <Box
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={permissionLoading || !canManage}
        >
          {ADD_LABELS[state.activeTab]}
        </Button>
        {canManage && supportsInactive && (
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(state.showInactive)}
                onChange={(e) => handleShowInactiveChange(e.target.checked)}
              />
            }
            label="Show inactive"
          />
        )}
      </Box>

      {renderContent()}

      <TypesAndRolesDialog
        activeTab={state.activeTab}
        dialogOpen={state.dialogOpen}
        selectedItem={state.selectedItem}
        onClose={handleDialogClose}
        onSave={handleSave}
      />
    </Paper>
  );
};

export default TypesAndRolesManager;
