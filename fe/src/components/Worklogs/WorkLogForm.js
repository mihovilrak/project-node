import React, { useState } from 'react';
import axios from 'axios';

const WorkLogForm = ({ userId, tasks, projects }) => {
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');
  const [logDate, setLogDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const logData = {
      user_id: userId,
      task_id: selectedTask || null, // Log either a task or project
      project_id: selectedProject || null,
      hours_worked: hoursWorked,
      log_date: logDate,
    };

    try {
      await axios.post('/api/worklogs', logData); // Post work log to the backend
      alert('Work log added successfully');
    } catch (error) {
      console.error('Error logging work hours:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Task:</label>
        <select onChange={(e) => setSelectedTask(e.target.value)}>
          <option value="">Select Task</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>{task.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Project:</label>
        <select onChange={(e) => setSelectedProject(e.target.value)}>
          <option value="">Select Project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Hours Worked:</label>
        <input
          type="number"
          value={hoursWorked}
          onChange={(e) => setHoursWorked(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Log Date:</label>
        <input
          type="date"
          value={logDate}
          onChange={(e) => setLogDate(e.target.value)}
          required
        />
      </div>
      <button type="submit">Log Hours</button>
    </form>
  );
};

export default WorkLogForm;
