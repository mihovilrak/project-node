import React from 'react';
import { TaskType, ActivityType } from '../../types/setting';
import { Role as AdminRole } from '../../types/role';
import TaskTypeDialog from './TaskTypeDialog';
import ActivityTypeDialog from './ActivityTypeDialog';
import RoleDialog from './RoleDialog';
import { TypesAndRolesDialogProps } from '../../types/setting';

export const TypesAndRolesDialog: React.FC<TypesAndRolesDialogProps> = ({
  activeTab,
  dialogOpen,
  selectedItem,
  onClose,
  onSave
}) => {
  if (!dialogOpen) return null;

  switch (activeTab) {
    case 0:
      return (
        <TaskTypeDialog
          open={dialogOpen}
          taskType={selectedItem as TaskType || undefined}
          onClose={onClose}
          onSave={onSave}
        />
      );
    case 1:
      return (
        <ActivityTypeDialog
          open={dialogOpen}
          activityType={selectedItem as ActivityType || undefined}
          onClose={onClose}
          onSave={onSave}
        />
      );
    case 2:
      return (
        <RoleDialog
          open={dialogOpen}
          role={selectedItem as AdminRole || undefined}
          onClose={onClose}
          onSave={onSave}
        />
      );
    default:
      return null;
  }
};
