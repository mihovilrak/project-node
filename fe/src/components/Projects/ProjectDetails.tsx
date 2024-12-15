import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import ProjectEditDialog from './ProjectEditDialog';
import TaskForm from '../Tasks/TaskForm';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import { useProjectDetails } from '../../hooks/useProjectDetails';
import { getProjectTasks } from '../../api/tasks';
import TimeLogDialog from '../TimeLog/TimeLogDialog';
import { TimeLogCreate, TimeLog } from '../../types/timeLog';
import { createTimeLog } from '../../api/timeLogService';
import { addProjectMember } from '../../api/projects';
import { getTaskTimeLogs } from '../../api/timeLogService';
import { deleteTimeLog } from '../../api/timeLogService';
import { getProjectSpentTime } from '../../api/projects';
import { Task } from '../../types/task';
import ProjectOverview from './tabs/ProjectOverview';
import ProjectMembersList from './tabs/ProjectMembersList';
import ProjectTaskList from './tabs/ProjectTaskList';
import ProjectGantt from './ProjectGantt';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState(0);
  const [timeLogDialogOpen, setTimeLogDialogOpen] = useState(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [spentTime, setSpentTime] = useState<number>(0);

  const {
    project,
    members,
    tasks,
    loading,
    error,
    editDialogOpen,
    deleteDialogOpen,
    createTaskDialogOpen,
    handleProjectUpdate,
    handleProjectDelete,
    handleTaskCreate,
    handleMemberRemove,
    handleMemberUpdate,
    setEditDialogOpen,
    setDeleteDialogOpen,
    setCreateTaskDialogOpen,
    canManageMembers
  } = useProjectDetails(id!);

  useEffect(() => {
    const fetchTimeLogs = async () => {
      if (id) {
        try {
          const logs = await getTaskTimeLogs(Number(id));
          setTimeLogs(logs);
        } catch (error) {
          console.error('Failed to fetch time logs:', error);
        }
      }
    };
    fetchTimeLogs();
  }, [id]);

  useEffect(() => {
    const fetchSpentTime = async () => {
      if (project?.id) {
        try {
          const response = await getProjectSpentTime(project.id);
          setSpentTime(response || 0);
        } catch (error) {
          console.error('Failed to fetch spent time:', error);
        }
      }
    };
    fetchSpentTime();
  }, [project]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (id) {
        try {
          const tasks = await getProjectTasks(Number(id));
          setProjectTasks(tasks);
        } catch (error) {
          console.error('Failed to fetch tasks:', error);
        }
      }
    };
    fetchTasks();
  }, [id]);

  const handleTimeLogSubmit = async (timeLogData: TimeLogCreate) => {
    try {
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
      setTimeLogs(timeLogs.filter(log => log.id !== timeLogId));
    } catch (error) {
      console.error('Failed to delete time log:', error);
    }
  };

  const handleAddMember = async (userId: number) => {
    try {
      const newMember = await addProjectMember(Number(id), userId);
      // Update members state with the new member
      members.push(newMember);
      setAddMemberDialogOpen(false);
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) return <CircularProgress />;
  if (error || !project) return <Alert severity="error">{error || 'Project not found'}</Alert>;

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">{project.name}</Typography>
          <Box>
            {canManageMembers && (
              <>
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setEditDialogOpen(true)}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                  color="error"
                >
                  Delete
                </Button>
              </>
            )}
          </Box>
        </Box>

        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="Members" />
          <Tab label="Tasks" />
          <Tab label="Timeline" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <ProjectOverview {...project} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ProjectMembersList
            members={members}
            canManageMembers={canManageMembers}
            onMemberRemove={handleMemberRemove}
            onMemberUpdate={handleMemberUpdate}
            onAddMember={() => setAddMemberDialogOpen(true)}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <ProjectTaskList
            tasks={tasks}
            onCreateTask={() => setCreateTaskDialogOpen(true)}
            onTimeLogCreate={(taskId) => {
              setSelectedTimeLog(null);
              setTimeLogDialogOpen(true);
            }}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <ProjectGantt 
            projectId={Number(id)}
            tasks={tasks}
          />
        </TabPanel>
      </Paper>

      <ProjectEditDialog
        open={editDialogOpen}
        project={project}
        onClose={() => setEditDialogOpen(false)}
        onSaved={() => handleProjectUpdate(project)}
      />

      {createTaskDialogOpen && (
        <TaskForm
          open={createTaskDialogOpen}
          projectId={project.id}
          onClose={() => setCreateTaskDialogOpen(false)}
          onCreated={() => {
            handleTaskCreate({ project_id: project.id } as any);
            setCreateTaskDialogOpen(false);
          }}
        />
      )}

      <TimeLogDialog
        open={timeLogDialogOpen}
        projectId={Number(id)}
        timeLog={selectedTimeLog}
        onClose={() => {
          setTimeLogDialogOpen(false);
          setSelectedTimeLog(null);
        }}
        onSubmit={handleTimeLogSubmit}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete Project"
        content="Are you sure you want to delete this project?"
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleProjectDelete}
      />
    </Box>
  );
};

export default ProjectDetails;