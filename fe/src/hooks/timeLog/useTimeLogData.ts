import { Project } from '../../types/project';
import { Task } from '../../types/task';
import { ActivityType, UseTimeLogDataProps } from '../../types/timeLog';
import { getProjects } from '../../api/projects';
import { getProjectTasks } from '../../api/tasks';
import { getActivityTypes } from '../../api/activityTypes';
import { useAsyncResource } from '../common/useAsyncResource';
import { useLookup } from '../../context/LookupsContext';

const EMPTY_PROJECTS: Project[] = [];
const EMPTY_TASKS: Task[] = [];
const EMPTY_ACTIVITY_TYPES: ActivityType[] = [];

/**
 * Load the option lists of the time log dialog while it is open. Tasks reload
 * whenever `projectId` changes.
 *
 * @param root0 Configuration object with open state, optional project ID, and
 *   admin permission flag.
 */
export const useTimeLogData = ({
  open,
  projectId,
  hasAdminPermission,
}: UseTimeLogDataProps) => {
  const activityTypes = useAsyncResource<ActivityType[]>(
    async (signal) => (await getActivityTypes(signal)) || [],
    [],
    {
      initialData: EMPTY_ACTIVITY_TYPES,
      enabled: open,
      errorMessage: 'Failed to load activity types',
    },
  );
  const projects = useAsyncResource<Project[]>(
    async (signal) => (await getProjects(undefined, signal)) || [],
    [],
    {
      initialData: EMPTY_PROJECTS,
      enabled: open,
      errorMessage: 'Failed to load projects',
    },
  );
  const tasks = useAsyncResource<Task[]>(
    async (signal) =>
      (await getProjectTasks(projectId as number, {}, signal)) || [],
    [projectId],
    {
      initialData: EMPTY_TASKS,
      enabled: open && Boolean(projectId),
      errorMessage: 'Failed to load tasks',
    },
  );
  const users = useLookup('users', open && hasAdminPermission);

  return {
    projects: projects.data,
    tasks: projectId ? tasks.data : EMPTY_TASKS,
    users: users.data,
    activityTypes: activityTypes.data,
    isLoading:
      activityTypes.loading ||
      projects.loading ||
      tasks.loading ||
      (hasAdminPermission && users.loading),
    loadError:
      activityTypes.error || projects.error || tasks.error || users.error,
  };
};
