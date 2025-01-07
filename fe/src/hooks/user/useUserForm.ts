import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchRoles,
  createUser,
  getUserById,
  updateUser,
} from '../../api/users';
import { Role } from '../../types/role';
import {
  FormData,
  UserCreate,
  UserUpdate,
  UserFormProps
} from '../../types/user';

export const useUserForm = ({ userId }: UserFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formValues, setFormValues] = useState<FormData>({
    login: '',
    name: '',
    surname: '',
    email: '',
    password: '',
    currentPassword: '',
    confirmPassword: '',
    role_id: 4,
  });

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoading(true);
        const roleData = await fetchRoles();
        setRoles(roleData);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch roles', error);
        setError('Failed to load roles');
      } finally {
        setLoading(false);
      }
    };

    loadRoles();

    if (userId) {
      fetchUserData(parseInt(userId));
    }
  }, [userId]);

  const fetchUserData = async (id: number) => {
    try {
      const user = await getUserById(id);
      setFormValues({
        login: user.login || '',
        name: user.name || '',
        surname: user.surname || '',
        email: user.email || '',
        password: '',
        currentPassword: '',
        confirmPassword: '',
        role_id: Number(user.role_id)
      });
    } catch (error) {
      console.error('Failed to fetch user data', error);
      setError('Failed to fetch user data');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: name === 'role_id' ? Number(value) : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEditMode = window.location.pathname.includes('/edit');
    
    // Validate passwords based on mode
    if (isEditMode) {
      // Edit mode
      if (formValues.password) {
        if (!formValues.currentPassword) {
          setError('Current password is required to change password');
          return;
        }
        if (formValues.password !== formValues.confirmPassword) {
          setError('New passwords do not match');
          return;
        }
      }
    } else {
      // Create mode
      if (!formValues.password) {
        setError('Password is required');
        return;
      }
      if (!formValues.confirmPassword) {
        setError('Please confirm your password');
        return;
      }
      if (formValues.password !== formValues.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    // Validate other required fields
    if (!formValues.login || !formValues.name || !formValues.surname || !formValues.email) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const userData = {
        login: formValues.login,
        name: formValues.name,
        surname: formValues.surname,
        email: formValues.email,
        role_id: formValues.role_id,
        ...(formValues.status_id && { status_id: formValues.status_id }),
        // Only include password fields if setting a new password in edit mode
        // or if creating a new user
        ...(isEditMode ? (
          formValues.password ? {
            password: formValues.password,
            currentPassword: formValues.currentPassword
          } : {}
        ) : {
          password: formValues.password
        })
      };
      
      if (userId) {
        await updateUser(parseInt(userId), userData as UserUpdate);
      } else {
        await createUser(userData as UserCreate);
      }
      navigate('/users');
    } catch (error: any) {
      console.error('Failed to save user', error);
      setError(error.response?.data?.message || 'Failed to save user');
    }
  };

  return {
    loading,
    error,
    roles,
    formValues,
    handleInputChange,
    handleSubmit,
  };
};
