insert into task_types (name, color, icon, description) values 
    ('Task', '#2196f3', 'TaskAlt', 'A task is a unit of work that needs to be completed.'),
    ('Bug', '#f44336', 'BugReport', 'A bug is an error or issue in a program.'),
    ('Work Package', '#4caf50', 'WorkOutline', 'A work package is a collection of tasks.'),
    ('Code Review', '#9c27b0', 'Code', 'A code review process.'),
    ('Feature', '#ff9800', 'NewReleases', 'A new or improved functionality.'),
    ('Documentation', '#795548', 'Description', 'Documentation work.'),
    ('Testing', '#607d8b', 'Science', 'Testing and verification work.'),
    ('Research', '#673ab7', 'Search', 'Research and investigation work.')
    on conflict (name) do nothing;