import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoginRequest } from '../../types/auth';

export const useLogin = () => {
  const { login } = useAuth();
  const [loginDetails, setLoginDetails] = useState<LoginRequest>({ login: '', password: '' });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setLoginDetails((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      await login(loginDetails.login, loginDetails.password);
      navigate('/');
    } catch (error) {
      console.error(error);
      setError('Login error. Please try again.');
    }
  };

  return {
    loginDetails,
    error,
    handleInputChange,
    handleSubmit
  };
};
