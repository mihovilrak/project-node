import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoleForm } from '../RoleForm';
import { Permission } from '../../../types/setting';
import { RoleFormData } from '../../../types/role';

const mockPermissions: Permission[] = [
    {
        id: 1,
        name: 'Create Users'
    },
    {
        id: 2,
        name: 'Edit Users'
    },
    {
        id: 3,
        name: 'View Projects'
    }
];

const mockGroupedPermissions: Record<string, Permission[]> = {
    users: [mockPermissions[0], mockPermissions[1]],
    projects: [mockPermissions[2]]  
};

const mockFormData: RoleFormData = {
    name: 'Test Role',
    description: 'Test Description',
    active: true,
    permissions: [1]
};

describe('RoleForm', () => {
    const defaultProps = {
        formData: mockFormData,
        groupedPermissions: mockGroupedPermissions,
        onChange: jest.fn(),
        onPermissionToggle: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Previous tests remain the same...

    it('validates required name field', () => {
        render(<RoleForm {...defaultProps} />);
        const nameInput = screen.getByLabelText(/name/i);
        
        expect(nameInput).toBeRequired();
    });

    it('allows empty description field', () => {
        const propsWithEmptyDesc = {
            ...defaultProps,
            formData: {
                ...mockFormData,
                description: ''
            }
        };
        render(<RoleForm {...propsWithEmptyDesc} />);
        const descInput = screen.getByLabelText(/description/i);
        
        expect(descInput).not.toBeRequired();
        expect(descInput).toHaveValue('');
    });

    it('maintains permissions state after form updates', () => {
        render(<RoleForm {...defaultProps} />);
        
        const nameInput = screen.getByLabelText(/name/i);
        fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
        
        // Check permissions remain unchanged
        expect(screen.getByLabelText('Create Users')).toBeChecked();
        expect(screen.getByLabelText('Edit Users')).not.toBeChecked();
    });

    it('handles multiple permission toggles', () => {
        render(<RoleForm {...defaultProps} />);
        
        const createUsersCheckbox = screen.getByLabelText('Create Users');
        const editUsersCheckbox = screen.getByLabelText('Edit Users');
        
        fireEvent.click(createUsersCheckbox);
        fireEvent.click(editUsersCheckbox);
        
        expect(defaultProps.onPermissionToggle).toHaveBeenCalledTimes(2);
        expect(defaultProps.onPermissionToggle).toHaveBeenCalledWith(mockPermissions[0]);
        expect(defaultProps.onPermissionToggle).toHaveBeenCalledWith(mockPermissions[1]);
    });

    it('renders multiline description field correctly', () => {
        render(<RoleForm {...defaultProps} />);
        const descriptionInput = screen.getByLabelText(/description/i);
        
        expect(descriptionInput).toHaveAttribute('rows', '3');
        expect(descriptionInput).toHaveAttribute('multiline', '');
    });

    it('renders permission categories in correct order', () => {
        render(<RoleForm {...defaultProps} />);
        
        const categories = screen.getAllByRole('heading', { level: 6 });
        expect(categories[0]).toHaveTextContent('users');
        expect(categories[1]).toHaveTextContent('projects');
    });
});