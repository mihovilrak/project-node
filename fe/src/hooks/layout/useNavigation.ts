import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<number>(0);

  // Sync activeTab with current route (order: Home, Projects, Tasks, Users, Settings)
  useEffect(() => {
    const pathname = location.pathname;

    if (pathname === '/' || pathname === '/home') {
      setActiveTab(0);
    } else if (pathname.startsWith('/projects')) {
      setActiveTab(1);
    } else if (pathname.startsWith('/tasks')) {
      setActiveTab(2);
    } else if (pathname.startsWith('/users')) {
      setActiveTab(3);
    } else if (pathname === '/settings') {
      setActiveTab(4);
    } else if (pathname === '/profile') {
      setActiveTab(0);
    }
  }, [location.pathname]);

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
        navigate('/tasks');
        break;
      case 3:
        navigate('/users');
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
