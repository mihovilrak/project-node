import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import TaskTypesTable from './TaskTypesTable';
import ActivityTypesTable from './ActivityTypesTable';
import RolesTable from './RolesTable';
import TaskTypeDialog from './TaskTypeDialog';
import ActivityTypeDialog from './ActivityTypeDialog';
import RoleDialog from './RoleDialog';
import {
  deleteActivityType,
  updateActivityType,
  getActivityTypes
} from '../../api/activityTypes';
import {
  getRoles,
  updateRole
} from '../../api/roles';
import { 
  getTaskTypes,
  deleteTaskType,
  updateTaskType
} from '../../api/taskTypes';
import {
  TypesAndRolesState,
  TaskType,
  ActivityType,
  Role as AdminRole
} from '../../types/setting';
import type { Role, Permission } from '../../types/admin';

const TypesAndRolesManager: React.FC = () => {
  const [state, setState] = useState<TypesAndRolesState>({
    activeTab: 0,
    taskTypes: [],
    activityTypes: [],
    roles: [],
    loading: true,
    error: null,
    dialogOpen: false,
    selectedItem: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const [taskTypesData, activityTypesData, rolesData] = await Promise.all([
        getTaskTypes().then(data => data.map((t: any) => ({ ...t, is_active: t.active || t.is_active || false }))),
        getActivityTypes().then(data => data.map((t: any) => ({ ...t, is_active: t.active || t.is_active || false }))),
        getRoles()
      ]);

      setState(prev => ({
        ...prev,
        taskTypes: taskTypesData as TaskType[],
        activityTypes: activityTypesData as ActivityType[],
        roles: rolesData as AdminRole[],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch data',
        loading: false
      }));
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setState(prev => ({ ...prev, activeTab: newValue }));
  };

  const handleCreate = (): void => {
    setState(prev => ({ ...prev, dialogOpen: true, selectedItem: null }));
  };

  const handleEdit = (item: TaskType | ActivityType | AdminRole): void => {
    setState(prev => ({ ...prev, dialogOpen: true, selectedItem: item }));
  };

  const handleDialogClose = (): void => {
    setState(prev => ({ ...prev, dialogOpen: false, selectedItem: null }));
  };

  const handleSave = async (item: Partial<TaskType | ActivityType | Role>): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      if (!item.id) {
        throw new Error('Item ID is required');
      }
  
      if (state.activeTab === 0) {
        await updateTaskType(item.id, item as TaskType);
      } else if (state.activeTab === 1) {
        await updateActivityType(item.id, item as ActivityType);
      } else if (state.activeTab === 2) {
        const roleData = item as Partial<Role>;
        await updateRole(item.id, roleData);
      }
      handleDialogClose();
      await fetchData();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save item',
        loading: false
      }));
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      if (state.activeTab === 0) {
        await deleteTaskType(id);
      } else if (state.activeTab === 1) {
        await deleteActivityType(id);
      }
      await fetchData();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete item',
        loading: false
      }));
    }
  };

  const getActiveDialog = () => {
    switch (state.activeTab) {
      case 0:
        return (
          <TaskTypeDialog
            open={state.dialogOpen}
            taskType={state.selectedItem as TaskType}
            onClose={handleDialogClose}
            onSave={handleSave}
          />
        );
      case 1:
        return (
          <ActivityTypeDialog
            open={state.dialogOpen}
            activityType={state.selectedItem as ActivityType}
            onClose={handleDialogClose}
            onSave={handleSave}
          />
        );
      case 2:
        return (
          <RoleDialog
            open={state.dialogOpen}
            role={state.selectedItem as AdminRole}
            onClose={handleDialogClose}
            onSave={handleSave}
          />
        );
      default:
        return null;
    }
  };

  const fetchRoles = async () => {
    try {
      const roles = await getRoles();
      setState(prev => ({
        ...prev,
        roles: roles as AdminRole[],
        loading: false
      }));
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const handleRoleUpdate = async (updatedRole: Role) => {
    try {
      const roleToUpdate: Partial<Role> = {
        id: updatedRole.id,
        name: updatedRole.name,
        description: updatedRole.description,
        permissions: (updatedRole.permissions || []).map(p => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          active: true,
          created_on: new Date().toISOString(),
          updated_on: null
        } as Permission))
      } as Partial<Role>;
      
      await updateRole(updatedRole.id, roleToUpdate);
      await fetchRoles();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h5">Types & Roles Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Create {state.activeTab === 0 ? 'Task Type' : state.activeTab === 1 ? 'Activity Type' : 'Role'}
        </Button>
      </Box>

      {state.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {state.error}
        </Alert>
      )}

      <Tabs value={state.activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Task Types" />
        <Tab label="Activity Types" />
        <Tab label="Roles" />
      </Tabs>

      {state.activeTab === 0 && (
        <TaskTypesTable
          taskTypes={state.taskTypes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={state.loading}
        />
      )}
      {state.activeTab === 1 && (
        <ActivityTypesTable
          activityTypes={state.activityTypes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={state.loading}
        />
      )}
      {state.activeTab === 2 && (
        <RolesTable
          roles={state.roles}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={state.loading}
        />
      )}

      {getActiveDialog()}
    </Paper>
  );
};

export default TypesAndRolesManager;
