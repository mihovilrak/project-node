import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/projects');
        break;
      case 2:
        navigate('/users');
        break;
      case 3:
        navigate('/tasks');
        break;
      case 4:
        navigate('/settings');
        break;
      case 5:
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  return {
    activeTab,
    handleTabChange
  };
};
