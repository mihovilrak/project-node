import React from 'react';
import { AssigneeSelect } from '../../AssigneeSelect';
import { TaskFormState } from '../../../../types/task';
import { ProjectMember } from '../../../../types/project';

interface AssigneeSelectionSectionProps {
  formData: TaskFormState;
  projectMembers: ProjectMember[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AssigneeSelectionSection: React.FC<AssigneeSelectionSectionProps> = ({
  formData,
  projectMembers,
  handleChange
}) => (
  <>
    <AssigneeSelect 
      label="Holder" 
      name="holder_id" 
      projectMembers={projectMembers} 
      formData={formData} 
      handleChange={handleChange} 
    />

    <AssigneeSelect 
      label="Assignee" 
      name="assignee_id" 
      projectMembers={projectMembers} 
      formData={formData} 
      handleChange={handleChange} 
    />
  </>
);
