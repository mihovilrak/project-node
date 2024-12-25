import { useState, useEffect } from 'react';
import {
  getProfile,
  getRecentTasks,
  getRecentProjects
} from '../../api/profile';
import { User } from '../../types/user';
import { Task } from '../../types/task';
import { Project } from '../../types/project';
import { ProfileStats } from '../../types/profile';

// Create a concrete implementation
const DEFAULT_STATS: ProfileStats = {
  totalTasks: 0,
  completedTasks: 0,
  activeProjects: 0,
  totalHours: 0
};

export const useProfileData = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProfileStats>(DEFAULT_STATS);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileData = await getProfile();
      setProfile(profileData);
      
      // Update stats whenever profile changes
      setStats({
        totalTasks: profileData?.total_tasks ?? 0,
        completedTasks: profileData?.completed_tasks ?? 0,
        activeProjects: profileData?.active_projects ?? 0,
        totalHours: profileData?.total_hours ?? 0
      });

      const [tasksData, projectsData] = await Promise.all([
        getRecentTasks(),
        getRecentProjects()
      ]);
      
      setRecentTasks(tasksData);
      setRecentProjects(projectsData);
      setError(null);
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Error fetching profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    profile,
    stats,
    recentTasks,
    recentProjects,
    loading,
    error,
    refreshData: fetchData
  } as const;
};
