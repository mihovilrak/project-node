import { useState, useEffect } from 'react';
import { SelectChangeEvent } from '@mui/material';
import {
  User,
  FormData,
  UserUpdate,
  UserCreate
} from '../../types/user';
import { createUser, updateUser } from '../../api/users';

export const useUserDialog = (
  user: User | null | undefined,
  open: boolean,
  onClose: () => void,
  onUserSaved: (user: User) => void
) => {
  const [formData, setFormData] = useState<FormData>({
    login: '',
    name: '',
    surname: '',
    email: '',
    password: '',
    role_id: 3,
    status_id: 1
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        login: user.login || '',
        name: user.name || '',
        surname: user.surname || '',
        email: user.email || '',
        password: '',
        role_id: user.role_id || 3,
        status_id: user.status_id
      });
    } else {
      setFormData({
        login: '',
        name: '',
        surname: '',
        email: '',
        password: '',
        role_id: 3,
        status_id: 1
      });
    }
  }, [user, open]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e: SelectChangeEvent<number>): void => {
    setFormData(prev => ({
      ...prev,
      role_id: e.target.value as number
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      let savedUser;
      if (user) {
        // For update, only send changed fields
        const updates: UserUpdate = {
          id: user.id
        };
        if (formData.name !== user.name) updates.name = formData.name;
        if (formData.surname !== user.surname) updates.surname = formData.surname;
        if (formData.email !== user.email) updates.email = formData.email;
        if (formData.password) updates.password = formData.password;
        if (formData.role_id !== user.role_id) updates.role_id = formData.role_id;
        
        savedUser = await updateUser(user.id, updates);
      } else {
        savedUser = await createUser(formData as UserCreate);
      }
      onUserSaved(savedUser);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to save user');
    }
  };

  return {
    formData,
    error,
    handleTextChange,
    handleRoleChange,
    handleSubmit
  };
};
