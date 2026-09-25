import { useState } from 'react';
import {
  TypesAndRolesState,
  TypesAndRolesItem,
  TaskType,
  ActivityType,
} from '../../types/setting';
import { Tag } from '../../types/tag';
import { Role as AdminRole } from '../../types/role';
import { Permission } from '../../types/admin';
import {
  deleteActivityType,
  updateActivityType,
  getActivityTypes,
  createActivityType,
} from '../../api/activityTypes';
import { getRoles, updateRole, createRole, deleteRole } from '../../api/roles';
import {
  getTaskTypes,
  deleteTaskType,
  updateTaskType,
  createTaskType,
} from '../../api/taskTypes';
import { createTag, deleteTag, getTags, updateTag } from '../../api/tags';
import { useAsyncResource } from '../common/useAsyncResource';
import { useLookups } from '../../context/LookupsContext';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

interface TypesAndRolesData {
  taskTypes: TaskType[];
  activityTypes: ActivityType[];
  roles: AdminRole[];
  tags: Tag[];
}

const EMPTY_DATA: TypesAndRolesData = {
  taskTypes: [],
  activityTypes: [],
  roles: [],
  tags: [],
};

export const TAG_TAB = 3;
const LOOKUP_BY_TAB = { 0: 'types', 2: 'roles', [TAG_TAB]: 'tags' } as const;

// API rows expose the flag as either `active` or `is_active` depending on age of the record
const withActive = <T extends { active?: boolean; is_active?: boolean }>(
  rows: T[],
): T[] => rows.map((r) => ({ ...r, active: r.active ?? r.is_active ?? false }));

export const useTypesAndRoles = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TypesAndRolesItem | null>(
    null,
  );
  const [showInactive, setShowInactive] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const { invalidate } = useLookups();

  const {
    data,
    loading,
    error: fetchError,
    refetch: fetchData,
  } = useAsyncResource<TypesAndRolesData>(
    async (signal) => {
      const [taskTypesData, activityTypesData, rolesData, tagsData] =
        await Promise.all([
          getTaskTypes(signal, showInactive),
          getActivityTypes(signal, showInactive),
          getRoles(signal),
          getTags(signal, showInactive),
        ]);
      return {
        taskTypes: withActive(taskTypesData) as TaskType[],
        activityTypes: withActive(activityTypesData) as ActivityType[],
        roles: rolesData as AdminRole[],
        tags: withActive(tagsData || []) as Tag[],
      };
    },
    [showInactive],
    { initialData: EMPTY_DATA, errorMessage: 'Failed to fetch data' },
  );

  const state: TypesAndRolesState = {
    activeTab,
    taskTypes: data.taskTypes,
    activityTypes: data.activityTypes,
    roles: data.roles,
    tags: data.tags,
    showInactive,
    loading: loading || mutating,
    error: mutationError ?? fetchError,
    dialogOpen,
    selectedItem,
  };

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: number,
  ): void => {
    setActiveTab(newValue);
  };

  const handleCreate = (): void => {
    setDialogOpen(true);
    setSelectedItem(null);
  };

  const handleShowInactiveChange = (checked: boolean): void => {
    setShowInactive(checked);
  };

  const handleEdit = (item: TypesAndRolesItem): void => {
    setDialogOpen(true);
    setSelectedItem(item);
  };

  const handleDialogClose = (): void => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  // With `rethrow`, the caller (a dialog) shows the error instead of the page.
  const runMutation = async (
    mutate: () => Promise<void>,
    fallbackMessage: string,
    rethrow = false,
  ): Promise<void> => {
    try {
      setMutating(true);
      setMutationError(null);
      await mutate();
      const lookup =
        LOOKUP_BY_TAB[activeTab as keyof typeof LOOKUP_BY_TAB] ?? null;
      if (lookup) invalidate(lookup);
      await fetchData();
    } catch (error) {
      if (rethrow) throw error;
      setMutationError(getApiErrorMessage(error, fallbackMessage));
    } finally {
      setMutating(false);
    }
  };

  const handleSave = async (
    item: Partial<TypesAndRolesItem>,
  ): Promise<void> => {
    // Fall back to selectedItem.id so editing updates the record when the dialog omits it
    const id = item.id ?? (selectedItem as { id?: number } | null)?.id;
    const resolvedId = id != null ? Number(id) : undefined;

    await runMutation(
      async () => {
        if (activeTab === 0) {
          if (resolvedId != null) {
            await updateTaskType(resolvedId, item as TaskType);
          } else {
            await createTaskType(item as TaskType);
          }
        } else if (activeTab === 1) {
          if (resolvedId != null) {
            await updateActivityType(resolvedId, item as ActivityType);
          } else {
            await createActivityType(item as ActivityType);
          }
        } else if (activeTab === 2) {
          const roleData = item as Partial<AdminRole>;
          if (resolvedId != null) {
            await updateRole(resolvedId, roleData);
          } else {
            await createRole(roleData);
          }
        } else if (activeTab === TAG_TAB) {
          const { name, color } = item as Partial<Tag>;
          if (resolvedId != null) {
            await updateTag(resolvedId, { name, color });
          } else {
            await createTag({ name, color });
          }
        }
        handleDialogClose();
      },
      'Failed to save item',
      true,
    );
  };

  const handleDelete = async (id: number): Promise<void> =>
    runMutation(async () => {
      if (activeTab === 0) {
        await deleteTaskType(id);
      } else if (activeTab === 1) {
        await deleteActivityType(id);
      } else if (activeTab === 2) {
        await deleteRole(id);
      } else if (activeTab === TAG_TAB) {
        await deleteTag(id);
      }
    }, 'Failed to delete item');

  const handleReactivate = async (
    item: TaskType | ActivityType | Tag,
  ): Promise<void> =>
    runMutation(async () => {
      if (activeTab === 0) {
        await updateTaskType(item.id, { active: true });
      } else if (activeTab === 1) {
        await updateActivityType(item.id, { active: true });
      } else if (activeTab === TAG_TAB) {
        await updateTag(item.id, { active: true });
      }
    }, 'Failed to reactivate item');

  const handleRoleUpdate = async (updatedRole: AdminRole): Promise<void> =>
    runMutation(async () => {
      const roleToUpdate: Partial<AdminRole> = {
        id: updatedRole.id,
        name: updatedRole.name,
        description: updatedRole.description,
        permissions: (updatedRole.permissions || []).map(
          (p) =>
            ({
              id: typeof p === 'number' ? p : p.id,
              name: typeof p === 'number' ? String(p) : p.name,
              active: true,
              created_on: new Date().toISOString(),
              updated_on: null,
            }) as Permission,
        ),
      };

      await updateRole(updatedRole.id, roleToUpdate);
    }, 'Failed to update role');

  return {
    state,
    handleTabChange,
    handleCreate,
    handleEdit,
    handleDialogClose,
    handleSave,
    handleDelete,
    handleReactivate,
    handleShowInactiveChange,
    handleRoleUpdate,
  };
};
