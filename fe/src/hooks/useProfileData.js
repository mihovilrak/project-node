import { useState, useEffect, useCallback } from 'react';
import { getUserProfile, getRecentTasks, getRecentProjects } from '../api/profile';

export const useProfileData = () => {
  const [profile, setProfile] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileData, tasksData, projectsData] = await Promise.all([
        getUserProfile(),
        getRecentTasks(),
        getRecentProjects()
      ]);
      setProfile(profileData);
      setRecentTasks(tasksData);
      setRecentProjects(projectsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch profile data');
      console.error('Failed to fetch profile data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  return { 
    profile, 
    recentTasks, 
    recentProjects, 
    loading, 
    error,
    refreshData: fetchProfileData
  };
}; 