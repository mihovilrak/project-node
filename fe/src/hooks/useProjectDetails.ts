import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Project, ProjectMember } from '../types/project';
import { Task } from '../types/task';
import {
    getProjectById,
    getProjectMembers,
    updateProject,
    deleteProject,
    updateProjectMember,
    removeProjectMember
} from '../api/projects';
import { getProjectTasks, createTask } from '../api/tasks';

export const useProjectDetails = (projectId: string) => {
    const [state, setState] = useState({
        project: null as Project | null,
        members: [] as ProjectMember[],
        tasks: [] as Task[],
        loading: true,
        error: null as string | null,
        editDialogOpen: false,
        deleteDialogOpen: false,
        createTaskDialogOpen: false,
        membersDialogOpen: false
    });

    const navigate = useNavigate();
    const { currentUser, hasPermission } = useAuth();

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                setState(prev => ({ ...prev, loading: true, error: null }));

                const [projectData, membersData, tasksData] = await Promise.all([
                    getProjectById(Number(projectId)),
                    getProjectMembers(Number(projectId)),
                    getProjectTasks(Number(projectId))
                ]);

                setState(prev => ({
                    ...prev,
                    project: projectData,
                    members: membersData,
                    tasks: tasksData,
                    loading: false
                }));
            } catch (error) {
                setState(prev => ({
                    ...prev,
                    error: 'Failed to load project details',
                    loading: false
                }));
            }
        };

        fetchProjectData();
    }, [projectId]);

    const handleProjectUpdate = async (updatedProject: Project) => {
        try {
            await updateProject(Number(projectId), updatedProject);
            setState(prev => ({
                ...prev,
                project: { ...prev.project!, ...updatedProject },
                editDialogOpen: false
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: 'Failed to update project'
            }));
        }
    };

    const handleProjectDelete = async () => {
        try {
            await deleteProject(Number(projectId));
            navigate('/projects');
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: 'Failed to delete project'
            }));
        }
    };

    const handleMemberUpdate = async (memberId: number, role: string) => {
        try {
            await updateProjectMember(Number(projectId), memberId, role);
            const updatedMembers = state.members.map(member =>
                member.user_id === memberId ? { ...member, role } : member
            );
            setState(prev => ({
                ...prev,
                members: updatedMembers
            }));
        } catch (error) {
            console.error('Failed to update member role:', error);
        }
    };

    const handleMemberRemove = async (memberId: number) => {
        try {
            await removeProjectMember(Number(projectId), memberId);
            const updatedMembers = state.members.filter(member => member.user_id !== memberId);
            setState(prev => ({
                ...prev,
                members: updatedMembers
            }));
        } catch (error) {
            console.error('Failed to remove member:', error);
        }
    };

    const handleTaskCreate = async (task: Task) => {
        try {
            const createdTask = await createTask({ ...task, project_id: Number(projectId) });
            setState(prev => ({
                ...prev,
                tasks: [...prev.tasks, createdTask],
                createTaskDialogOpen: false
            }));
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    return {
        ...state,
        handleProjectUpdate,
        handleProjectDelete,
        handleMemberUpdate,
        handleMemberRemove,
        handleTaskCreate,
        setEditDialogOpen: (open: boolean) => 
            setState(prev => ({ ...prev, editDialogOpen: open })),
        setDeleteDialogOpen: (open: boolean) => 
            setState(prev => ({ ...prev, deleteDialogOpen: open })),
        setCreateTaskDialogOpen: (open: boolean) => 
            setState(prev => ({ ...prev, createTaskDialogOpen: open })),
        setMembersDialogOpen: (open: boolean) => 
            setState(prev => ({ ...prev, membersDialogOpen: open })),
        isProjectMember: state.members.some(member => member.user_id === currentUser?.id),
        canEdit: hasPermission('Edit projects'),
        canDelete: hasPermission('Delete projects'),
        canManageMembers: hasPermission('Manage project members')
    };
}; 