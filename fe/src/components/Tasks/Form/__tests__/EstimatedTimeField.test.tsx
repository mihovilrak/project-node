import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { EstimatedTimeField } from '../EstimatedTimeField';
import { TaskFormState } from '../../../../types/task';

describe('EstimatedTimeField', () => {
    const mockHandleChange = jest.fn();
    const mockFormData: TaskFormState = {
        name: '',
        description: '',
        project_id: null,
        type_id: null,
        priority_id: null,
        status_id: null,
        parent_id: null,
        holder_id: null,
        assignee_id: null,
        start_date: null,
        due_date: null,
        estimated_time: 10
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with initial value', () => {
        render(
            <EstimatedTimeField
                formData={mockFormData}
                handleChange={mockHandleChange}
            />
        );

        const input = screen.getByLabelText('Estimated Time (hours)') as HTMLInputElement;
        expect(input).toBeInTheDocument();
        expect(input.value).toBe('10');
        expect(input.type).toBe('number');
    });

    it('calls handleChange when value changes', () => {
        render(
            <EstimatedTimeField
                formData={mockFormData}
                handleChange={mockHandleChange}
            />
        );

        const input = screen.getByLabelText('Estimated Time (hours)');
        fireEvent.change(input, { target: { value: '15' } });

        expect(mockHandleChange).toHaveBeenCalled();
    });

    it('has correct step and min attributes', () => {
        render(
            <EstimatedTimeField
                formData={mockFormData}
                handleChange={mockHandleChange}
            />
        );

        const input = screen.getByLabelText('Estimated Time (hours)') as HTMLInputElement;
        expect(input.step).toBe('0.5');
        expect(input.min).toBe('0');
    });
});