import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import TaskTypesTable from './TaskTypesTable';
import ActivityTypesTable from './ActivityTypesTable';
import RolesTable from './RolesTable';
import TaskTypeDialog from './TaskTypeDialog';
import ActivityTypeDialog from './ActivityTypeDialog';
import RoleDialog from './RoleDialog';
import { 
  getTaskTypes, 
  getActivityTypes, 
  getRoles 
} from '../../api/admin';

const TypesAndRolesManager = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [taskTypes, setTaskTypes] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [taskTypesData, activityTypesData, rolesData] = await Promise.all([
        getTaskTypes(),
        getActivityTypes(),
        getRoles()
      ]);
      setTaskTypes(taskTypesData);
      setActivityTypes(activityTypesData);
      setRoles(rolesData);
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  const handleSaved = () => {
    handleDialogClose();
    fetchData();
  };

  const getActiveDialog = () => {
    switch (activeTab) {
      case 0:
        return (
          <TaskTypeDialog
            open={dialogOpen}
            taskType={selectedItem}
            onClose={handleDialogClose}
            onSaved={handleSaved}
          />
        );
      case 1:
        return (
          <ActivityTypeDialog
            open={dialogOpen}
            activityType={selectedItem}
            onClose={handleDialogClose}
            onSaved={handleSaved}
          />
        );
      case 2:
        return (
          <RoleDialog
            open={dialogOpen}
            role={selectedItem}
            onClose={handleDialogClose}
            onSaved={handleSaved}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h5">Types & Roles Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Create {activeTab === 0 ? 'Task Type' : activeTab === 1 ? 'Activity Type' : 'Role'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Task Types" />
        <Tab label="Activity Types" />
        <Tab label="Roles" />
      </Tabs>

      {activeTab === 0 && (
        <TaskTypesTable
          taskTypes={taskTypes}
          onEdit={handleEdit}
          loading={loading}
        />
      )}
      {activeTab === 1 && (
        <ActivityTypesTable
          activityTypes={activityTypes}
          onEdit={handleEdit}
          loading={loading}
        />
      )}
      {activeTab === 2 && (
        <RolesTable
          roles={roles}
          onEdit={handleEdit}
          loading={loading}
        />
      )}

      {getActiveDialog()}
    </Paper>
  );
};

export default TypesAndRolesManager; 