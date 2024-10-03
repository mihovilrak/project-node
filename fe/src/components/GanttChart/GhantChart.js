import React, { useEffect } from 'react';
import gantt from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import axios from 'axios';

const GanttChart = ({ userId }) => {
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`/api/tasks/user/${userId}`);
        const tasks = response.data.map((task) => ({
          id: task.id,
          text: task.name,
          start_date: task.start_date,
          end_date: task.due_date,
        }));
        gantt.parse({ data: tasks });
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
    gantt.init('gantt_here');
  }, [userId]);

  return <div id="gantt_here" style={{ width: '100%', height: '500px' }}></div>;
};

export default GanttChart;
