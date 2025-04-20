import { render, screen, fireEvent, within } from '@testing-library/react';
import { ProjectSelect } from '../ProjectSelect';
import { Project } from '../../../types/project';
import { TaskFormState } from '../../../types/task';

const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Project Alpha',
    description: 'Test project 1',
    parent_id: null,
    parent_name: null,
    status_id: 1,
    status_name: 'Active',
    start_date: '2023-01-01',
    due_date: '2023-12-31',
    end_date: null,
    created_by: 1,
    created_by_name: 'John Doe',
    created_on: '2023-01-01',
    updated_on: null,
    estimated_time: 100,
    spent_time: 50,
    progress: 50
  },
  {
    id: 2,
    name: 'Project Beta',
    description: 'Test project 2',
    parent_id: null,
    parent_name: null,
    status_id: 1,
    status_name: 'Active',
    start_date: '2023-01-01',
    due_date: '2023-12-31',
    end_date: null,
    created_by: 1,
    created_by_name: 'John Doe',
    created_on: '2023-01-01',
    updated_on: null,
    estimated_time: 100,
    spent_time: 50,
    progress: 50
  }
];

const mockFormData: TaskFormState = {
  name: '',
  description: '',
  project_id: 1,
  type_id: null,
  priority_id: null,
  status_id: null,
  parent_id: null,
  holder_id: null,
  assignee_id: null,
  start_date: null,
  due_date: null,
  estimated_time: null
};

const mockHandleChange = jest.fn();

describe('ProjectSelect', () => {
  const renderProjectSelect = (projectIdFromQuery?: string | null) => {
    return render(
      <ProjectSelect
        projects={mockProjects}
        formData={mockFormData}
        handleChange={mockHandleChange}
        projectIdFromQuery={projectIdFromQuery}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with correct label', () => {
    renderProjectSelect();
    // Material-UI select doesn't use textbox role, it uses button role
    const selectElement = screen.getByLabelText(/project/i);
    expect(selectElement).toBeInTheDocument();
  });

  test('displays all projects', () => {
    renderProjectSelect();
    // Open the select dropdown
    const selectElement = screen.getByLabelText(/project/i);
    fireEvent.mouseDown(selectElement);
    
    const listbox = document.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
    
    mockProjects.forEach(project => {
      expect(within(listbox as HTMLElement).getByText(project.name)).toBeInTheDocument();
    });
  });

  test('calls handleChange when selection changes', () => {
    renderProjectSelect();
    // Open the select dropdown
    const selectElement = screen.getByLabelText(/project/i);
    fireEvent.mouseDown(selectElement);
    
    // Get options from the dropdown in the portal
    const listbox = document.querySelector('[role="listbox"]');
    expect(listbox).not.toBeNull();
    
    // Select the second option
    const options = within(listbox as HTMLElement).getAllByRole('option');
    fireEvent.click(options[1]); // Second project
    
    expect(mockHandleChange).toHaveBeenCalled();
  });

  test('uses correct initial value from formData', () => {
    const { container } = renderProjectSelect();
    // Find the select input's displayed value
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
  });

  test('is disabled when projectIdFromQuery is provided', () => {
    const { container } = renderProjectSelect('1');
    
    const selectElement = container.querySelector('input[name="project_id"]');
    expect(selectElement).not.toBeNull();
    expect(selectElement).toHaveAttribute('disabled');
  });

  test('is enabled when projectIdFromQuery is null', () => {
    const { container } = renderProjectSelect(null);
    
    const selectElement = container.querySelector('input[name="project_id"]');
    expect(selectElement).not.toBeNull();
    expect(selectElement).not.toHaveAttribute('disabled');
  });

  test('applies full width style', () => {
    renderProjectSelect();
    // Find the containing div instead of the input directly
    const formControl = screen.getByTestId('ProjectSelectFormControl');
    expect(formControl).toHaveStyle({ width: '100%' });
  });

  test('is marked as required', () => {
    renderProjectSelect();
    const label = screen.getByText('Project');
    // Check if the label has a required indicator
    expect(label.textContent).toMatch(/Project.?\*/);
  });

  test('handles empty projects array', () => {
    render(
      <ProjectSelect
        projects={[]}
        formData={mockFormData}
        handleChange={mockHandleChange}
      />
    );
    
    // The select should still render
    const selectElement = screen.getByTestId('ProjectSelectFormControl');
    expect(selectElement).toBeInTheDocument();
    
    // Open dropdown
    fireEvent.mouseDown(selectElement);
    
    // Should have no options
    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBe(0);
  });
});