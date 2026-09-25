import { Project } from '../../types/project';
import { UserOption } from '../../types/user';
import { Task } from '../../types/task';
import { ActivityType, UseTimeLogDataProps } from '../../types/timeLog';
import { getProjectMembers, getProjects } from '../../api/projects';
import { getProjectTasks } from '../../api/tasks';
import { getActivityTypes } from '../../api/activityTypes';
import { useAsyncResource } from '../common/useAsyncResource';

const EMPTY_PROJECTS: Project[] = [];
const EMPTY_TASKS: Task[] = [];
const EMPTY_ACTIVITY_TYPES: ActivityType[] = [];
const EMPTY_USERS: UserOption[] = [];

/**
 * Load the option lists of the time log dialog while it is open. Tasks and
 * project members reload whenever `projectId` changes.
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
  // The API only accepts project members as the log owner, so there is no
  // user list until a project is known.
  const members = useAsyncResource<UserOption[]>(
    async (signal) =>
      (await getProjectMembers(projectId as number, signal)).map((member) => ({
        id: member.user_id,
        login: '',
        name: member.name,
        surname: member.surname,
      })),
    [projectId],
    {
      initialData: EMPTY_USERS,
      enabled: open && hasAdminPermission && Boolean(projectId),
      errorMessage: 'Failed to load project members',
    },
  );

  return {
    projects: projects.data,
    tasks: projectId ? tasks.data : EMPTY_TASKS,
    users: projectId ? members.data : EMPTY_USERS,
    activityTypes: activityTypes.data,
    isLoading:
      activityTypes.loading ||
      projects.loading ||
      tasks.loading ||
      (hasAdminPermission && Boolean(projectId) && members.loading),
    loadError:
      activityTypes.error || projects.error || tasks.error || members.error,
  };
};
