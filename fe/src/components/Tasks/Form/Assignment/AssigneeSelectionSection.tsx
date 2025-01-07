import React from 'react';
import { AssigneeSelect } from '../../AssigneeSelect';
import { AssigneeSelectionSectionProps } from '../../../../types/task';

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
