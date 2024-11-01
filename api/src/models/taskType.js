const taskTypeQueries = {
  getAllTaskTypes: `
    SELECT * FROM task_types 
    WHERE is_active = true 
    ORDER BY name ASC
  `,
  
  getTaskTypeById: `
    SELECT * FROM task_types 
    WHERE id = $1
  `,
  
  createTaskType: `
    INSERT INTO task_types (name, description, color, icon, is_active) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *
  `,
  
  updateTaskType: `
    UPDATE task_types 
    SET name = $1, 
        description = $2, 
        color = $3, 
        icon = $4, 
        is_active = $5, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = $6 
    RETURNING *
  `,
  
  deleteTaskType: `
    UPDATE task_types 
    SET is_active = false, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1 
    RETURNING *
  `
};

module.exports = taskTypeQueries; 