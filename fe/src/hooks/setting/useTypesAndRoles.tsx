import { useState, useEffect } from 'react';
import { TypesAndRolesState, TaskType, ActivityType } from '../../types/setting';
import { Role as AdminRole } from '../../types/role';
import { Permission } from '../../types/admin';
import {
  deleteActivityType,
  updateActivityType,
  getActivityTypes,
  createActivityType
} from '../../api/activityTypes';
import {
  getRoles,
  updateRole,
  createRole
} from '../../api/roles';
import {
  getTaskTypes,
  deleteTaskType,
  updateTaskType,
  createTaskType
} from '../../api/taskTypes';

export const useTypesAndRoles = () => {
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
        getTaskTypes().then(data => data.map((t: any) => ({ ...t, active: t.active ?? t.is_active ?? false }))),
        getActivityTypes().then(data => data.map((t: any) => ({ ...t, active: t.active ?? t.is_active ?? false }))),
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

  const handleSave = async (item: Partial<TaskType | ActivityType | AdminRole>): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      if (state.activeTab === 0) {
        if (item.id) {
          await updateTaskType(item.id, item as TaskType);
        } else {
          await createTaskType(item as TaskType);
        }
      } else if (state.activeTab === 1) {
        if (item.id) {
          await updateActivityType(item.id, item as ActivityType);
        } else {
          await createActivityType(item as ActivityType);
        }
      } else if (state.activeTab === 2) {
        const roleData = item as Partial<AdminRole>;
        if (item.id) {
          await updateRole(item.id, roleData);
        } else {
          await createRole(roleData);
        }
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

  const handleRoleUpdate = async (updatedRole: AdminRole) => {
    try {
      const roleToUpdate: Partial<AdminRole> = {
        id: updatedRole.id,
        name: updatedRole.name,
        description: updatedRole.description,
        permissions: (updatedRole.permissions || []).map(p => ({
          id: typeof p === 'number' ? p : p.id,
          name: typeof p === 'number' ? String(p) : p.name,
          active: true,
          created_on: new Date().toISOString(),
          updated_on: null
        } as Permission))
      };

      await updateRole(updatedRole.id, roleToUpdate);
      await fetchData();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update role',
        loading: false
      }));
    }
  };

  return {
    state,
    handleTabChange,
    handleCreate,
    handleEdit,
    handleDialogClose,
    handleSave,
    handleDelete,
    handleRoleUpdate
  };
};
