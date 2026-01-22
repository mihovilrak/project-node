import { useState, useEffect, useCallback } from 'react';
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
        setError(prev => (prev ? null : prev));
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
        role_id: Number(user.role_id) || 4
      });
    } catch (error) {
      console.error('Failed to fetch user data', error);
      setError('Failed to fetch user data');
    }
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: name === 'role_id' ? Number(value) : value,
    }));
    setError(prev => (prev ? null : prev));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    console.log('DEBUG formValues at submit:', formValues);
    e.preventDefault();

    // Validate all required fields first, regardless of mode
    if (
      !formValues.login ||
      !formValues.name ||
      !formValues.surname ||
      !formValues.email ||
      !formValues.password ||
      !formValues.confirmPassword
    ) {
      setError('Please fill in all required fields');
      return;
    }

    const isEditMode = !!userId;

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
      // Create mode: validate all required fields first
      if (!formValues.login || !formValues.name || !formValues.surname || !formValues.email || !formValues.password || !formValues.confirmPassword) {
        setError('Please fill in all required fields');
        return;
      }
      if (formValues.password !== formValues.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
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
  }, [formValues, userId, navigate]);

  return {
    loading,
    error,
    roles,
    formValues,
    handleInputChange,
    handleSubmit,
  };
};
