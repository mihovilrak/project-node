import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add as AddIcon, Group as GroupIcon } from '@mui/icons-material';
import ProjectOverview from './tabs/ProjectOverview';
import ProjectTaskList from './tabs/ProjectTaskList';
import ProjectGantt from './ProjectGantt';
import ProjectMembersList from './tabs/ProjectMembersList';
import TimeLogList from '../TimeLog/TimeLogList';
import {
  TabPanelProps,
  ProjectTabPanelsProps
} from '../../types/project';

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const ProjectTabPanels: React.FC<ProjectTabPanelsProps> = ({
  activeTab,
  project,
  projectDetails,
  tasks,
  members,
  timeLogs,
  canManageMembers,
  projectId,
  onCreateTask,
  onManageMembers,
  onTimeLogCreate,
  onTimeLogEdit,
  onTimeLogDelete,
  onMemberRemove
}) => {
  return (
    <>
      <TabPanel value={activeTab} index={0}>
        <ProjectOverview project={project} projectDetails={projectDetails} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateTask}
          >
            Create Task
          </Button>
        </Box>
        <ProjectTaskList
          tasks={tasks}
          onTimeLogCreate={onTimeLogCreate}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            onClick={onManageMembers}
            startIcon={<GroupIcon />}
          >
            Manage Members
          </Button>
        </Box>
        <ProjectMembersList
          projectId={Number(projectId)}
          members={members}
          canManageMembers={canManageMembers}
          onMemberRemove={onMemberRemove}
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
            onClick={() => onTimeLogCreate(0)}
          >
            Log Time
          </Button>
        </Box>
        <TimeLogList
          timeLogs={timeLogs}
          onEdit={onTimeLogEdit}
          onDelete={onTimeLogDelete}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <ProjectGantt projectId={project.id} tasks={tasks} />
      </TabPanel>
    </>
  );
};

export default ProjectTabPanels;
