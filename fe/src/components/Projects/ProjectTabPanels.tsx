import React, { useMemo } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add as AddIcon, Group as GroupIcon } from '@mui/icons-material';
import ProjectOverview from './tabs/ProjectOverview';
import ProjectTaskList from './tabs/ProjectTaskList';
import ProjectGantt from './ProjectGantt';
import ProjectMembersList from './tabs/ProjectMembersList';
import TimeLogList from '../TimeLog/TimeLogList';
import TabPanel from '../common/TabPanel';
import { ProjectTabPanelsProps } from '../../types/project';

// Memoize child components to prevent unnecessary re-renders
const MemoizedProjectOverview = React.memo(ProjectOverview);
const MemoizedProjectTaskList = React.memo(ProjectTaskList);
const MemoizedProjectGantt = React.memo(ProjectGantt);
const MemoizedProjectMembersList = React.memo(ProjectMembersList);
const MemoizedTimeLogList = React.memo(TimeLogList);

const ProjectTabPanels: React.FC<ProjectTabPanelsProps> = React.memo(
  ({
    activeTab,
    project,
    projectDetails,
    tasks,
    members,
    timeLogs,
    canManageMembers,
    canLogTime = true,
    onCreateTask,
    onManageMembers,
    onTimeLogCreate,
    onTimeLogEdit,
    onTimeLogDelete,
    onMemberRemove,
  }) => {
    // Memoize tab content to prevent re-computation on every render
    const overviewContent = useMemo(
      () => (
        <MemoizedProjectOverview
          project={project || null}
          projectDetails={projectDetails || null}
        />
      ),
      [project, projectDetails],
    );

    const tasksContent = useMemo(
      () => (
        <>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateTask}
            >
              Create Task
            </Button>
          </Box>
          <MemoizedProjectTaskList
            tasks={tasks || []}
            onTimeLogCreate={onTimeLogCreate}
          />
        </>
      ),
      [tasks, onCreateTask, onTimeLogCreate],
    );

    const membersContent = useMemo(
      () => (
        <>
          {canManageMembers && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                onClick={onManageMembers}
                startIcon={<GroupIcon />}
              >
                Manage Members
              </Button>
            </Box>
          )}
          <MemoizedProjectMembersList
            members={members || []}
            canManageMembers={canManageMembers}
            onMemberRemove={onMemberRemove}
          />
        </>
      ),
      [members, canManageMembers, onManageMembers, onMemberRemove],
    );

    const timeLogsContent = useMemo(
      () => (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6">Time Logs</Typography>
            {canLogTime && (
              <Button variant="contained" onClick={() => onTimeLogCreate()}>
                Log Time
              </Button>
            )}
          </Box>
          <MemoizedTimeLogList
            timeLogs={timeLogs || []}
            onEdit={onTimeLogEdit}
            onDelete={onTimeLogDelete}
          />
        </>
      ),
      [timeLogs, canLogTime, onTimeLogCreate, onTimeLogEdit, onTimeLogDelete],
    );

    const ganttContent = useMemo(
      () => (
        <MemoizedProjectGantt projectId={project?.id} tasks={tasks || []} />
      ),
      [project?.id, tasks],
    );

    return (
      <>
        <TabPanel value={activeTab} index={0} idPrefix="project">
          {overviewContent}
        </TabPanel>

        <TabPanel value={activeTab} index={1} idPrefix="project">
          {tasksContent}
        </TabPanel>

        <TabPanel value={activeTab} index={2} idPrefix="project">
          {membersContent}
        </TabPanel>

        <TabPanel value={activeTab} index={3} idPrefix="project">
          {timeLogsContent}
        </TabPanel>

        <TabPanel value={activeTab} index={4} idPrefix="project">
          {ganttContent}
        </TabPanel>
      </>
    );
  },
);
ProjectTabPanels.displayName = 'ProjectTabPanels';

export default ProjectTabPanels;
