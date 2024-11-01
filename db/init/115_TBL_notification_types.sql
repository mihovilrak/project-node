create table if not exists notification_types (
    id serial primary key not null,
    name varchar(50) not null,
    icon varchar(50) not null,
    color varchar(7) not null,
    created_on timestamptz default current_timestamp not null
);

-- Insert default notification types
insert into notification_types (name, icon, color) values 
    ('Task Due Soon', 'AccessTime', '#ff9800'),
    ('Task Assigned', 'Assignment', '#2196f3'),
    ('Task Updated', 'Update', '#4caf50'),
    ('Task Comment', 'Comment', '#9c27b0'),
    ('Task Completed', 'CheckCircle', '#4caf50'),
    ('Project Update', 'Folder', '#2196f3'); 