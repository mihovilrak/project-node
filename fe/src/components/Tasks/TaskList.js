import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import FilterPanel from '../common/FilterPanel';
import TaskTable from './TaskTable';
import { getTasks, getTaskStatuses, getPriorities } from '../../api/tasks';
import { getUsers } from '../../api/users';
import { getTaskTypes } from '../../api/taskTypes';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({});
  const [users, setUsers] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [usersData, typesData, statusesData, prioritiesData] = await Promise.all([
        getUsers(),
        getTaskTypes(),
        getTaskStatuses(),
        getPriorities()
      ]);
      setUsers(usersData);
      setTaskTypes(typesData);
      setStatuses(statusesData);
      setPriorities(prioritiesData);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await getTasks(filters);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    const processedFilters = {
      ...newFilters,
      status_id: newFilters.status_id ? parseInt(newFilters.status_id) : undefined,
      priority_id: newFilters.priority_id ? parseInt(newFilters.priority_id) : undefined,
      type_id: newFilters.type_id ? parseInt(newFilters.type_id) : undefined,
      assignee_id: newFilters.assignee_id ? parseInt(newFilters.assignee_id) : undefined,
      holder_id: newFilters.holder_id ? parseInt(newFilters.holder_id) : undefined
    };
    setFilters(processedFilters);
  };

  return (
    <Box>
      <FilterPanel
        type="tasks"
        filters={filters}
        onFilterChange={handleFilterChange}
        users={users}
        taskTypes={taskTypes}
        priorities={priorities.map(p => ({ id: p.id, name: p.priority }))}
        statuses={statuses.map(s => ({ id: s.id, name: s.status }))}
      />
      
      <TaskTable 
        tasks={tasks}
        loading={loading}
        priorities={priorities}
        statuses={statuses}
        users={users}
        taskTypes={taskTypes}
      />
    </Box>
  );
};

export default TaskList; 