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
  const [profile, setProfile] = useState<User | null>(null);
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
      const profileData = await getProfile();
      setProfile(profileData);
      
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
    return profile as ProfileData;
  };

  const getProfileStats = () => {
    const typedProfile = getTypedProfile();
    if (!typedProfile) return DEFAULT_STATS;

    return {
      totalTasks: typedProfile.total_tasks ?? 0,
      completedTasks: typedProfile.completed_tasks ?? 0,
      activeProjects: typedProfile.active_projects ?? 0,
      totalHours: typedProfile.total_hours ?? 0
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
