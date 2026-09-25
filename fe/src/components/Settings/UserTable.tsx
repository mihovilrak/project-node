import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Tooltip,
  Chip,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import logger from '../../utils/logger';
import getApiErrorMessage, {
  getApiErrorStatus,
} from '../../utils/getApiErrorMessage';
import { User } from '../../types/user';
import { changeUserStatus, deleteUser } from '../../api/users';
import { UserTableProps } from '../../types/setting';
import { UserStatusId } from '../../constants/statusIds';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditUser,
  onUserDeleted,
  onUserUpdated = onUserDeleted,
  currentUserId,
}) => {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  // Deleting the last row of the last page would otherwise leave an empty page.
  const lastPage = Math.max(0, Math.ceil(users.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, lastPage);

  const handleChangePage = (_event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (user: User): void => {
    setUserToDelete(user);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      setDeleteError(null);
      await deleteUser(userToDelete.id);
      // Only refresh list and close dialog on success
      onUserDeleted();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error: unknown) {
      if (getApiErrorStatus(error) === 404) {
        onUserDeleted();
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        return;
      }
      logger.error('Failed to delete user:', error);
      setDeleteError(
        getApiErrorMessage(error, 'Failed to delete user. Please try again.'),
      );
      // Keep dialog open so user can see the error
    } finally {
      setDeleting(false);
    }
  };

  const setStatus = async (user: User, status: number): Promise<void> => {
    try {
      setStatusError(null);
      await changeUserStatus(user.id, status);
      onUserUpdated();
    } catch (error: unknown) {
      logger.error('Failed to change user status:', error);
      setStatusError(
        getApiErrorMessage(error, 'Failed to change the user status.'),
      );
    }
  };

  const handleDeleteCancel = (): void => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
    setDeleteError(null);
  };

  return (
    <>
      {statusError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setStatusError(null)}
        >
          {statusError}
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table data-testid="user-table">
          <TableHead>
            <TableRow>
              <TableCell>Login</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .slice(
                currentPage * rowsPerPage,
                currentPage * rowsPerPage + rowsPerPage,
              )
              .map((user) => {
                const isSelf = user.id === currentUserId;
                const isActive = user.status_id === UserStatusId.Active;
                const fullName = `${user.name} ${user.surname}`;
                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.login}</TableCell>
                    <TableCell>{`${user.name} ${user.surname}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role_name || 'No Role'}
                        size="small"
                        color={
                          user.role_name === 'Admin' ? 'primary' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status_name || 'Unknown'}
                        size="small"
                        {...(user.status_color
                          ? {
                              sx: {
                                backgroundColor: user.status_color,
                                color: '#fff',
                              },
                            }
                          : {
                              color:
                                user.status_id === UserStatusId.Active
                                  ? 'success'
                                  : user.status_id === UserStatusId.Deleted
                                    ? 'error'
                                    : 'default',
                            })}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          data-testid={`edit-user-${user.id}`}
                          onClick={() => onEditUser(user)}
                          aria-label="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {/* The API rejects status changes and deletion of your own account. */}
                      {!isSelf && (
                        <>
                          <Tooltip title={isActive ? 'Deactivate' : 'Activate'}>
                            <IconButton
                              data-testid={`status-user-${user.id}`}
                              onClick={() =>
                                isActive
                                  ? setUserToDeactivate(user)
                                  : setStatus(user, UserStatusId.Active)
                              }
                              aria-label={`${isActive ? 'Deactivate' : 'Activate'} ${fullName}`}
                            >
                              {isActive ? <BlockIcon /> : <CheckCircleIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              data-testid={`delete-user-${user.id}`}
                              onClick={() => handleDeleteClick(user)}
                              aria-label="Delete"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={users.length}
        page={currentPage}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        data-testid="pagination"
      />

      <DeleteConfirmDialog
        open={Boolean(userToDeactivate)}
        title="Deactivate user"
        content={`Deactivate ${userToDeactivate?.name ?? ''} ${userToDeactivate?.surname ?? ''}? They will be signed out and cannot log in until reactivated.`}
        confirmLabel="Deactivate"
        onClose={() => setUserToDeactivate(null)}
        onConfirm={async () => {
          if (userToDeactivate) {
            await setStatus(userToDeactivate, UserStatusId.Inactive);
          }
        }}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        data-testid="delete-dialog"
        aria-labelledby="user-table-title"
      >
        <DialogTitle id="user-table-title">Confirm Delete</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }} data-testid="delete-error">
              {deleteError}
            </Alert>
          )}
          <Typography data-testid="delete-confirmation-text">
            Are you sure you want to delete user {userToDelete?.name}? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            data-testid="cancel-delete-button"
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            data-testid="confirm-delete-button"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserTable;
