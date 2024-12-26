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
} from '../../types/user';

interface UseUserFormProps {
  userId?: string;
}

export const useUserForm = ({ userId }: UseUserFormProps) => {
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
        login: user.login,
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: '',
        role_id: user.role_id || 4,
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
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (userId) {
        await updateUser(parseInt(userId), formValues as UserUpdate);
      } else {
        await createUser(formValues as UserCreate);
      }
      navigate('/users');
    } catch (error) {
      console.error('Failed to save user', error);
      setError('Failed to save user');
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
