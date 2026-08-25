insert into notification_types (name, icon, color) values
    ('Task Due Soon', 'AccessTime', '#ff9800'),
    ('Task Assigned', 'Assignment', '#2196f3'),
    ('Task Updated', 'Update', '#4caf50'),
    ('Task Comment', 'Comment', '#9c27b0'),
    ('Task Completed', 'CheckCircle', '#4caf50'),
    ('Project Update', 'Folder', '#2196f3'),
    ('Task Created', 'AddTask', '#2196f3'),
    ('Added to Project', 'CreateNewFolder', '#4caf50')
on conflict (name) do nothing;