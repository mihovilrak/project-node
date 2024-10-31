import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import FilterPanel from '../common/FilterPanel';
import { getTasks } from '../../api/tasks';
import { getUsers } from '../../api/users';
import { getTaskTypes } from '../../api/taskTypes';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({});
  const [users, setUsers] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [usersData, typesData] = await Promise.all([
        getUsers(),
        getTaskTypes()
      ]);
      setUsers(usersData);
      setTaskTypes(typesData);
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
    setFilters(newFilters);
  };

  return (
    <Box>
      <FilterPanel
        type="tasks"
        filters={filters}
        onFilterChange={handleFilterChange}
        users={users}
        taskTypes={taskTypes}
        priorities={['High', 'Medium', 'Low']}
        statuses={['Not Started', 'In Progress', 'Completed']}
      />

      {/* Your existing task list rendering code */}
    </Box>
  );
};

export default TaskList; 