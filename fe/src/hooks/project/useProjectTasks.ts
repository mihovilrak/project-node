import { Task } from '../../types/task';
import { ProjectTasksHook } from '../../types/project';
import { getProjectTasks } from '../../api/tasks';
import { useAsyncResource } from '../common/useAsyncResource';

const EMPTY_TASKS: Task[] = [];

/**
 * Load the tasks of a project.
 *
 * @param projectId The project identifier to load tasks for
 */
export const useProjectTasks = (projectId: string): ProjectTasksHook => {
  const { data, error, refetch } = useAsyncResource<Task[]>(
    async (signal) =>
      (await getProjectTasks(Number(projectId), {}, signal)) || [],
    [projectId],
    {
      initialData: EMPTY_TASKS,
      enabled: Boolean(projectId),
      errorMessage: 'Failed to load project tasks',
    },
  );

  return { tasks: data, tasksError: error, loadTasks: refetch };
};
