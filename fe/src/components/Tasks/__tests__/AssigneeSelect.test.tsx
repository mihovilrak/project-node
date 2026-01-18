import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssigneeSelect } from '../AssigneeSelect';
import { ProjectMember } from '../../../types/project';
import { TaskFormState } from '../../../types/task';

const mockProjectMembers: ProjectMember[] = [
  {
    project_id: 1,
    user_id: 1,
    created_on: '2023-01-01',
    name: 'John',
    surname: 'Doe',
    role: 'Developer'
  },
  {
    project_id: 1,
    user_id: 2,
    created_on: '2023-01-01',
    name: 'Jane',
    surname: 'Smith',
    role: 'Project Manager'
  }
];

const mockFormData: TaskFormState = {
  name: 'Test Task',
  description: '',
  project_id: 1,
  type_id: 1,
  priority_id: 1,
  status_id: 1,
  parent_id: null,
  holder_id: 1,
  assignee_id: null,
  start_date: null,
  due_date: null,
  estimated_time: null
};

const mockHandleChange = jest.fn();

describe('AssigneeSelect', () => {
  const renderAssigneeSelect = () => {
    return render(
      <AssigneeSelect
        label="Assignee"
        name="assignee_id"
        projectMembers={mockProjectMembers}
        formData={mockFormData}
        handleChange={mockHandleChange}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with correct label', async () => {
    renderAssigneeSelect();
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /assignee/i })).toBeInTheDocument();
    });
  });

  test('shows unassigned option', async () => {
    renderAssigneeSelect();
    // Open the dropdown to see options
    const selectElement = screen.getByRole('combobox', { name: /assignee/i });
    fireEvent.mouseDown(selectElement);

    await waitFor(() => {
      expect(screen.getByText('Unassigned')).toBeInTheDocument();
    });
  });

  test('displays all project members', async () => {
    renderAssigneeSelect();
    // Open the dropdown to see options
    const selectElement = screen.getByRole('combobox', { name: /assignee/i });
    fireEvent.mouseDown(selectElement);

    await waitFor(() => {
      mockProjectMembers.forEach(member => {
        expect(screen.getByText(`${member.name} ${member.surname}`)).toBeInTheDocument();
      });
    });
  });

  test('calls handleChange when selection changes', async () => {
    renderAssigneeSelect();
    const select = screen.getByRole('combobox', { name: /assignee/i });

    // Open the dropdown
    fireEvent.mouseDown(select);

    // Wait for the dropdown to open
    await waitFor(() => {
      const option = screen.getByText('Jane Smith');
      fireEvent.click(option);
    });

    expect(mockHandleChange).toHaveBeenCalled();
  });

  test('uses correct initial value from formData', async () => {
    const formDataWithAssignee = {
      ...mockFormData,
      assignee_id: 1
    };

    const { container } = render(
      <AssigneeSelect
        label="Assignee"
        name="assignee_id"
        projectMembers={mockProjectMembers}
        formData={formDataWithAssignee}
        handleChange={mockHandleChange}
      />
    );

    await waitFor(() => {
      // Check if the displayed value shows the expected user
      expect(screen.getByRole('combobox', { name: /assignee/i })).toBeInTheDocument();
      // The input has the selected value or its display value
      const selectText = container.querySelector('.MuiSelect-select');
      expect(selectText?.textContent).toContain('John Doe');
    });
  });

  test('applies full width style', async () => {
    const { container } = renderAssigneeSelect();

    await waitFor(() => {
      // Select itself should be there
      expect(screen.getByRole('combobox', { name: /assignee/i })).toBeInTheDocument();
      // Verify the component render with the fullWidth prop
      const textFieldRoot = container.querySelector('.MuiFormControl-fullWidth');
      expect(textFieldRoot).not.toBeNull();
    });
  });

  test('handles empty project members array', async () => {
    render(
      <AssigneeSelect
        label="Assignee"
        name="assignee_id"
        projectMembers={[]}
        formData={mockFormData}
        handleChange={mockHandleChange}
      />
    );

    // Open the dropdown
    const selectElement = screen.getByRole('combobox', { name: /assignee/i });
    fireEvent.mouseDown(selectElement);

    // Material-UI renders menu items in a portal, so we need to look at the document body
    await waitFor(() => {
      const unassignedItem = screen.getByRole('option', { name: /unassigned/i });
      expect(unassignedItem).toBeInTheDocument();

      // Make sure there's only one option (Unassigned)
      const options = screen.getAllByRole('option');
      expect(options.length).toBe(1);
    });
  });
});