import { useState, useEffect } from 'react';
import { SystemSettingsState } from '../../types/setting';
import {
  getSystemSettings,
  updateSystemSettings
} from '../../api/settings';

export const useSystemSettings = () => {
  const [state, setState] = useState<SystemSettingsState>({
    settings: {
      id: 1,
      app_name: '',
      company_name: '',
      sender_email: '',
      time_zone: '',
      theme: 'system',
      welcome_message: ''
    },
    loading: true,
    error: null,
    success: false
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSystemSettings();
        setState(prev => ({ 
          ...prev, 
          settings: data,
          loading: false 
        }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to fetch system settings',
          loading: false 
        }));
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setState(prev => ({ ...prev, loading: true }));
      await updateSystemSettings(state.settings);
      setState(prev => ({ 
        ...prev, 
        success: true,
        loading: false 
      }));
      setTimeout(() => setState(prev => ({ ...prev, success: false })), 3000);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to update system settings',
        loading: false 
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, [name]: value }
    }));
  };

  return {
    state,
    handleSubmit,
    handleChange
  };
};
