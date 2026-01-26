import { useState, useEffect } from 'react';
import {
  getProfile,
  getRecentTasks,
  getRecentProjects,
  updateProfile
} from '../../api/profiles';
import { User } from '../../types/user';
import { Task } from '../../types/task';
import { Project } from '../../types/project';
import { ProfileStats, ProfileUpdateData, ProfileData } from '../../types/profile';
import { useNavigate } from 'react-router-dom';

const DEFAULT_STATS: ProfileStats = {
  totalTasks: 0,
  completedTasks: 0,
  activeProjects: 0,
  totalHours: 0
};

export const useProfileData = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProfileStats>(DEFAULT_STATS);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await getProfile();
      
      if (!profileData) {
        setError('Profile data not found');
        setLoading(false);
        return;
      }

      setProfile(profileData);

      setStats({
        totalTasks: profileData.total_tasks ?? 0,
        completedTasks: profileData.completed_tasks ?? 0,
        activeProjects: profileData.active_projects ?? 0,
        totalHours: profileData.total_hours ?? 0
      });

      const [tasksData, projectsData] = await Promise.all([
        getRecentTasks().catch(err => {
          console.error('Failed to fetch recent tasks:', err);
          return [];
        }),
        getRecentProjects().catch(err => {
          console.error('Failed to fetch recent projects:', err);
          return [];
        })
      ]);

      setRecentTasks(tasksData || []);
      setRecentProjects(projectsData || []);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 
                          err?.message || 
                          'Failed to load profile data';
      setError(errorMessage);
      console.error('Error fetching profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedProfile: ProfileUpdateData) => {
    try {
      await updateProfile(updatedProfile);
      await fetchData();
      setEditDialogOpen(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleTaskClick = (taskId: number) => {
    navigate(`/tasks/${taskId}`);
  };

  const getTypedProfile = (): ProfileData | null => {
    return profile;
  };

  const getProfileStats = (): ProfileStats => {
    if (!profile) return DEFAULT_STATS;

    return {
      totalTasks: profile.total_tasks ?? 0,
      completedTasks: profile.completed_tasks ?? 0,
      activeProjects: profile.active_projects ?? 0,
      totalHours: profile.total_hours ?? 0
    };
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
    editDialogOpen,
    passwordDialogOpen,
    updateSuccess,
    setEditDialogOpen,
    setPasswordDialogOpen,
    setUpdateSuccess,
    handleProfileUpdate,
    handleTaskClick,
    getTypedProfile,
    getProfileStats,
    refreshData: fetchData
  } as const;
};
