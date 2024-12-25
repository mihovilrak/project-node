import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const useHeader = () => {
  const { currentUser } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    currentUser,
    isScrolled
  };
};
