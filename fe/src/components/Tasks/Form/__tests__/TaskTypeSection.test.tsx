import React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskTypeSection } from '../TaskTypeSection';
import TaskTypeSelect from '../../TaskTypeSelect';
import { TaskFormState } from '../../../../types/task';

// Mock TaskTypeSelect component
jest.mock('../../TaskTypeSelect', () => {
  return jest.fn((props) => {
    return <div data-testid="mock-task-type-select">TaskTypeSelect Component</div>;
  });
});

describe('TaskTypeSection', () => {
  const defaultProps = {
    formData: {
      name: '',
      description: '',
      project_id: null,
      type_id: 1,
      priority_id: null,
      status_id: null,
      parent_id: null,
      holder_id: null,
      assignee_id: null,
      start_date: null,
      due_date: null,
      estimated_time: null
    } as TaskFormState,
    handleChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<TaskTypeSection {...defaultProps} />);
    expect(screen.getByTestId('mock-task-type-select')).toBeInTheDocument();
  });

  it('passes correct props to TaskTypeSelect', () => {
    render(<TaskTypeSection {...defaultProps} />);
    expect(TaskTypeSelect).toHaveBeenCalled();
    expect((TaskTypeSelect as jest.Mock).mock.calls[0][0]).toEqual(
      expect.objectContaining({
        value: defaultProps.formData.type_id || 0,
        required: true,
        onChange: expect.any(Function)
      })
    );
  });

  it('handles null type_id correctly', () => {
    const propsWithNullType = {
      ...defaultProps,
      formData: { ...defaultProps.formData, type_id: null }
    };
    render(<TaskTypeSection {...propsWithNullType} />);
    expect(TaskTypeSelect).toHaveBeenCalled();
    expect((TaskTypeSelect as jest.Mock).mock.calls[0][0]).toEqual(
      expect.objectContaining({
        value: 0,
        required: true,
        onChange: expect.any(Function)
      })
    );
  });

  it('calls handleChange with correct arguments when type changes', () => {
    render(<TaskTypeSection {...defaultProps} />);
    const taskSelectProps = (TaskTypeSelect as jest.Mock).mock.calls[0][0];

    taskSelectProps.onChange({ target: { value: 2 } });

    expect(defaultProps.handleChange).toHaveBeenCalledWith({
      target: {
        name: 'type_id',
        value: 2
      }
    });
  });

  it('has proper material-ui Box styling', () => {
    const { container } = render(<TaskTypeSection {...defaultProps} />);
    const boxElement = container.firstChild;
    expect(boxElement).toHaveStyle({ marginBottom: '16px' }); // mb: 2 converts to 16px
  });
});