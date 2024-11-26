import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert
} from '@mui/material';
import { updateProfile } from '../../api/profile';
import { ProfileEditDialogProps, FormData } from '../../types/profile';


const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({ 
  open, 
  onClose, 
  profile, 
  onProfileUpdate 
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: profile?.name || '',
    surname: profile?.surname || '',
    email: profile?.email || '',
    timezone: profile?.timezone || '',
    language: profile?.language || ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedProfile = await updateProfile(formData);
      await onProfileUpdate(updatedProfile);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            name="name"
            label="First Name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            name="surname"
            label="Last Name"
            fullWidth
            margin="normal"
            value={formData.surname}
            onChange={handleChange}
            required
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProfileEditDialog; 