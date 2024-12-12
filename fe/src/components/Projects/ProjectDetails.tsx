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
  Tab,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Link,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import ProjectEditDialog from './ProjectEditDialog';
import ProjectMembers from './ProjectMembers';
import TaskForm from '../Tasks/TaskForm';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import { useProjectDetails } from '../../hooks/useProjectDetails';
import { getProjectTasks } from '../../api/tasks';
import TimeLogDialog from '../TimeLog/TimeLogDialog';
import { TimeLogCreate, TimeLog } from '../../types/timeLog';
import { createTimeLog } from '../../api/timeLogService';
import { addProjectMember } from '../../api/projects';
import ProjectGantt from './ProjectGantt';
import { User } from '../../types/user';
import { getUsers } from '../../api/users';
import { getTaskTimeLogs } from '../../api/timeLogService';
import TimeLogStats from '../TimeLog/TimeLogStats';
import TimeLogList from '../TimeLog/TimeLogList';
import { deleteTimeLog } from '../../api/timeLogService';
import { Link as RouterLink } from 'react-router-dom';
import { getProjectSpentTime } from '../../api/projects';
import { Task } from '../../types/task';
import { format } from 'date-fns';

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
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [spentTime, setSpentTime] = useState<number>(0);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  
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

  const AddMemberDialog: React.FC<{
    open: boolean;
    onClose: () => void;
    onSubmit: (userId: number) => void;
    existingMemberIds: number[];
  }> = ({ open, onClose, onSubmit, existingMemberIds }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number>(0);

    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const allUsers = await getUsers();
          const availableUsers = allUsers.filter(user => 
            !existingMemberIds.includes(user.id)
          );
          setUsers(availableUsers);
        } catch (error) {
          console.error('Failed to fetch users:', error);
        }
      };
      if (open) {
        fetchUsers();
      }
    }, [open, existingMemberIds]);

    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Add Project Member</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select User</InputLabel>
            <Select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              label="Select User"
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => {
              onSubmit(selectedUserId);
              onClose();
            }}
            disabled={!selectedUserId}
          >
            Add Member
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!project) return <Alert severity="error">Project not found</Alert>;

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4">{project.name}</Typography>
            <Typography variant="body1" color="text.secondary">{project.description}</Typography>
          </Box>
          <Button variant="contained" onClick={() => setEditDialogOpen(true)}>
            Edit Project
          </Button>
        </Box>

        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              aria-label="project tabs"
            >
              <Tab label="Overview" />
              <Tab label="Members" />
              <Tab label="Tasks" />
              <Tab label="Timeline" />
              <Tab label="Time Logs" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    <strong>Description:</strong> {project.description || 'No description provided'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Start Date:</strong> {new Date(project.start_date).toLocaleDateString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Due Date:</strong> {new Date(project.due_date).toLocaleDateString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Created By:</strong> {project.creator_name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Created On:</strong> {new Date(project.created_on).toLocaleString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography gutterBottom>
                    <strong>Progress:</strong> {project.progress || 0}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.progress || 0}
                    sx={{ height: 10, borderRadius: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography>
                    <strong>Total Time Spent:</strong> {spentTime} hours
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Subprojects
                  </Typography>
                  {project.subprojects && project.subprojects.length > 0 ? (
                    <List>
                      {project.subprojects.map((subproject) => (
                        <ListItem key={subproject.id}>
                          <Link 
                            component={RouterLink} 
                            to={`/projects/${subproject.id}`}
                            underline="hover"
                          >
                            {subproject.name}
                          </Link>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="textSecondary">
                      No subprojects found
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              {canManageMembers && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddMemberDialogOpen(true)}
                >
                  Add Member
                </Button>
              )}
            </Box>
            
            {members.length > 0 ? (
              <List>
                {members.map((member) => (
                  <ListItem
                    key={member.user_id}
                    secondaryAction={
                      canManageMembers && (
                        <Box>
                          <IconButton 
                            edge="end" 
                            onClick={() => handleMemberRemove(member.user_id)}
                            aria-label="delete"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )
                    }
                  >
                    <ListItemText
                      primary={`${member.name} ${member.surname}`}
                      secondary={`Role: ${member.role}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No members found</Typography>
            )}

            {/* Add Member Dialog */}
            <AddMemberDialog
              open={addMemberDialogOpen}
              onClose={() => setAddMemberDialogOpen(false)}
              onSubmit={handleAddMember}
              existingMemberIds={members.map(m => m.user_id)}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateTaskDialogOpen(true)}
              >
                Add Task
              </Button>
            </Box>
            
            {projectTasks.length > 0 ? (
              <List>
                {projectTasks.map((task) => (
                  <ListItem
                    key={task.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      p: 2
                    }}
                    component={RouterLink}
                    to={`/tasks/${task.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {task.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status: {task.status_name} | Priority: {task.priority_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          Start: {format(new Date(task.start_date), 'dd/MM/yyyy')}
                        </Typography>
                        <Typography variant="body2">
                          Due: {format(new Date(task.due_date), 'dd/MM/yyyy')}
                        </Typography>
                        <Typography variant="body2">
                          Holder: {task.holder_name}
                        </Typography>
                        <Typography variant="body2">
                          Assignee: {task.assignee_name || 'Unassigned'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No tasks found</Typography>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <ProjectGantt 
              projectId={Number(id)}
              tasks={tasks}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setTimeLogDialogOpen(true)}
              >
                Log Time
              </Button>
            </Box>
            <TimeLogStats timeLogs={timeLogs} />
            <TimeLogList
              timeLogs={timeLogs}
              onEdit={handleTimeLogEdit}
              onDelete={handleTimeLogDelete}
            />
          </TabPanel>
        </Box>

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
      </Paper>
    </Box>
  );
};

export default ProjectDetails; 