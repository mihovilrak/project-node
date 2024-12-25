import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { useProjectDetails } from '../../hooks/project/useProjectDetails';
import ProjectTaskList from './tabs/ProjectTaskList';
import ProjectGantt from './ProjectGantt';
import ProjectMembersList from './tabs/ProjectMembersList';
import ProjectEditDialog from './ProjectEditDialog';
import TaskForm from '../Tasks/TaskForm';
import TimeLogList from '../TimeLog/TimeLogList';
import ProjectOverview from './tabs/ProjectOverview';
import TimeLogDialog from '../TimeLog/TimeLogDialog';
import {
  getProjectMembers,
  addProjectMember,
  removeProjectMember
} from '../../api/projects';
import { getProjectTasks } from '../../api/tasks';
import {
  createTimeLog,
  getTaskTimeLogs,
  deleteTimeLog
} from '../../api/timeLogs';
import { TimeLog, TimeLogCreate } from '../../types/timeLog';
import { Task } from '../../types/task';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import EditMembersDialog from './EditMembersDialog';
import { TabPanelProps } from '../../types/project';

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [timeLogDialogOpen, setTimeLogDialogOpen] = useState(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [manageMembersOpen, setManageMembersOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);

  const {
    project,
    projectDetails,
    members,
    loading,
    error,
    canManageMembers,
    setState,
    handleProjectUpdate,
    handleProjectDelete
  } = useProjectDetails(id!);

  useEffect(() => {
    const loadTimeLogs = async () => {
      if (id && activeTab === 3) {
        try {
          const tasks = await getProjectTasks(Number(id));
          let allLogs: TimeLog[] = [];
          for (const task of tasks) {
            const taskLogs = await getTaskTimeLogs(task.id);
            allLogs = [...allLogs, ...taskLogs];
          }
          setTimeLogs(allLogs);
        } catch (error) {
          console.error('Failed to load time logs:', error);
        }
      }
    };
    loadTimeLogs();
  }, [id, activeTab]);

  useEffect(() => {
    const loadTasks = async () => {
      if (id) {
        try {
          const tasks = await getProjectTasks(Number(id));
          setProjectTasks(tasks);
        } catch (error) {
          console.error('Failed to load tasks:', error);
        }
      }
    };
    loadTasks();
  }, [id]);

  const handleCreateTask = () => {
    navigate(`/tasks/new?projectId=${id}`);
  };

  const handleTaskFormClose = () => {
    setTaskFormOpen(false);
  };

  const handleTaskCreated = async () => {
    setTaskFormOpen(false);
    try {
      const tasks = await getProjectTasks(Number(id));
      setProjectTasks(tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const handleTimeLogSubmit = async (timeLogData: TimeLogCreate) => {
    try {
      if (!id) return;
      await createTimeLog(timeLogData.task_id, timeLogData);
      const updatedLogs = await getTaskTimeLogs(Number(id));
      setTimeLogs(updatedLogs);
      setTimeLogDialogOpen(false);
      setSelectedTimeLog(null);
    } catch (error) {
      console.error('Failed to submit time log:', error);
    }
  };

  const handleTimeLogEdit = (timeLog: TimeLog) => {
    setSelectedTimeLog(timeLog);
    setTimeLogDialogOpen(true);
  };

  const handleTimeLogDelete = async (timeLogId: number) => {
    try {
      await deleteTimeLog(timeLogId);
      const updatedLogs = await getTaskTimeLogs(Number(id));
      setTimeLogs(updatedLogs);
    } catch (error) {
      console.error('Failed to delete time log:', error);
    }
  };

  const handleMemberRemove = async (userId: number) => {
    try {
      if (!id) return;
      await removeProjectMember(Number(id), userId);
      const updatedMembers = await getProjectMembers(Number(id));
      setState(prev => ({ ...prev, members: updatedMembers }));
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleManageMembers = () => {
    setManageMembersOpen(true);
  };

  const handleMembersDialogClose = () => {
    setManageMembersOpen(false);
  };

  const handleMembersUpdate = async (selectedUsers: number[]) => {
    try {
      // Remove members that are no longer selected
      const membersToRemove = members
        .filter(member => !selectedUsers.includes(member.user_id))
        .map(member => member.user_id);

      // Add new members
      const membersToAdd = selectedUsers.filter(
        userId => !members.some(member => member.user_id === userId)
      );

      for (const userId of membersToRemove) {
        await removeProjectMember(Number(id), userId);
      }

      for (const userId of membersToAdd) {
        await addProjectMember(Number(id), userId);
      }

      // Refresh members list
      const updatedMembers = await getProjectMembers(Number(id));
      setState(prev => ({ ...prev, members: updatedMembers }));
    } catch (error) {
      console.error('Failed to update members:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!project) return <Alert severity="error">Project not found</Alert>;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            {project.name}
          </Typography>
          <Box>
            <Button
              startIcon={<EditIcon />}
              onClick={() => setEditDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Tasks" />
          <Tab label="Members" />
          <Tab label="Time Log" />
          <Tab label="Gantt" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <ProjectOverview project={project} 
          projectDetails={projectDetails} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTask}
            >
              Create Task
            </Button>
          </Box>
          <ProjectTaskList
            tasks={projectTasks}
            onTimeLogCreate={(taskId: number) => {
              setSelectedTimeLog(null);
              setTimeLogDialogOpen(true);
            }}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleManageMembers}
              startIcon={<GroupIcon />}
            >
              Manage Members
            </Button>
          </Box>
          <ProjectMembersList
            projectId={Number(id)}
            members={members}
            canManageMembers={canManageMembers}
            onMemberRemove={handleMemberRemove}
            onMembersChange={() => {}}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2 
          }}>
            <Typography variant="h6">Time Logs</Typography>
            <Button
              variant="contained"
              onClick={() => {
                setSelectedTimeLog(null);
                setTimeLogDialogOpen(true);
              }}
            >
              Log Time
            </Button>
          </Box>
          <TimeLogList
            timeLogs={timeLogs}
            onEdit={handleTimeLogEdit}
            onDelete={handleTimeLogDelete}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <ProjectGantt projectId={project.id} tasks={projectTasks} />
        </TabPanel>
      </Paper>

      <ProjectEditDialog
        open={editDialogOpen}
        project={project}
        onClose={() => setEditDialogOpen(false)}
        onSaved={() => handleProjectUpdate(project)}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete Project"
        content="Are you sure you want to delete this project? This action cannot be undone."
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleProjectDelete}
      />

      <TimeLogDialog
        open={timeLogDialogOpen}
        onClose={() => {
          setTimeLogDialogOpen(false);
          setSelectedTimeLog(null);
        }}
        onSubmit={handleTimeLogSubmit}
        timeLog={selectedTimeLog}
        projectId={Number(id)}
      />

      <EditMembersDialog
        open={manageMembersOpen}
        onClose={handleMembersDialogClose}
        projectId={Number(id)}
        currentMembers={members}
        onSave={handleMembersUpdate}
      />

      {taskFormOpen && (
        <TaskForm
          projectId={Number(id)}
          onClose={handleTaskFormClose}
          onCreated={handleTaskCreated}
          open={taskFormOpen}
        />
      )}
    </Box>
  );
};

export default ProjectDetails;
