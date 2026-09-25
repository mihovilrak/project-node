import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser, getUserById, updateUser } from '../../api/users';
import { useLookup, useLookups } from '../../context/LookupsContext';
import {
  UserFormData,
  UserCreate,
  UserUpdate,
  UserFormProps,
} from '../../types/user';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

/**
 * Manage user form state and submission for creating or editing user accounts.
 *
 * @param root0 Object containing optional userId to load existing user data for
 *   editing.
 */
export const useUserForm = ({ userId }: UserFormProps) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const {
    data: roles,
    loading: rolesLoading,
    error: rolesError,
  } = useLookup('roles');
  const [userLoading, setUserLoading] = useState<boolean>(!!userId);
  const { invalidate } = useLookups();
  const loading = rolesLoading || userLoading;
  const [formValues, setFormValues] = useState<UserFormData>({
    login: '',
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role_id: 4,
  });

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    getUserById(parseInt(userId), controller.signal)
      .then((user) => {
        if (controller.signal.aborted) return;
        setFormValues({
          login: user.login || '',
          name: user.name || '',
          surname: user.surname || '',
          email: user.email || '',
          password: '',
          confirmPassword: '',
          role_id: Number(user.role_id) || 4,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        logger.error('Failed to fetch user data', error);
        setError(getApiErrorMessage(error, 'Failed to fetch user data'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setUserLoading(false);
      });
    return () => controller.abort();
  }, [userId]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormValues((prev) => ({
        ...prev,
        [name]: name === 'role_id' ? Number(value) : value,
      }));
      setError(null);
      setFieldErrors((prev) => {
        if (prev[name]) {
          const next = { ...prev };
          delete next[name];
          return next;
        }
        return prev;
      });
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const isEditMode = !!userId;
      const err: Record<string, string> = {};

      if (!formValues.login?.trim()) err.login = 'Login is required';
      if (!formValues.name?.trim()) err.name = 'First name is required';
      if (!formValues.surname?.trim()) err.surname = 'Last name is required';
      if (!formValues.email?.trim()) err.email = 'Email is required';

      if (isEditMode) {
        if (
          formValues.password &&
          formValues.password !== formValues.confirmPassword
        ) {
          err.confirmPassword = 'New passwords do not match';
        }
      } else {
        if (!formValues.password) err.password = 'Password is required';
        else if (formValues.password !== formValues.confirmPassword) {
          err.confirmPassword = 'Passwords do not match';
        }
        if (!formValues.confirmPassword && !err.confirmPassword)
          err.confirmPassword = 'Please confirm password';
      }

      if (Object.keys(err).length > 0) {
        setFieldErrors(err);
        setError('Please fill in all required fields');
        return;
      }
      setFieldErrors({});
      setError(null);

      try {
        const userData = {
          login: formValues.login,
          name: formValues.name,
          surname: formValues.surname,
          email: formValues.email,
          role_id: formValues.role_id,
          ...(formValues.status_id && { status_id: formValues.status_id }),
          // A blank password in edit mode keeps the existing one.
          ...(formValues.password && { password: formValues.password }),
        };

        if (userId) {
          await updateUser(parseInt(userId), userData as UserUpdate);
        } else {
          await createUser(userData as UserCreate);
        }
        invalidate('users');
        navigate('/users');
      } catch (error: unknown) {
        logger.error('Failed to save user', error);
        setError(getApiErrorMessage(error, 'Failed to save user'));
      }
    },
    [formValues, userId, navigate, invalidate],
  );

  return {
    loading,
    error: error ?? (rolesError ? 'Failed to load roles' : null),
    fieldErrors,
    roles,
    formValues,
    handleInputChange,
    handleSubmit,
  };
};
