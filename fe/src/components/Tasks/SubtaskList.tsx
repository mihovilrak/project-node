import React, { useState, useCallback } from 'react';
import {
  Typography,
  Link,
  Box,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  ChevronRight as ChevronRightIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { deleteTask, getSubtasks } from '../../api/tasks';
import { SubtaskListProps } from '../../types/task';
import { Task } from '../../types/task';
import { chipPropsForPriority, chipPropsForStatus } from '../../utils/taskUtils';
import logger from '../../utils/logger';

const COLUMNS = [
  '#',
  'Title',
  'Type',
  'Status',
  'Priority',
  'Estimated',
  'Spent',
  'Progress',
  'Holder',
  'Assignee',
  'Due',
  'Actions'
] as const;

const SubtaskList: React.FC<SubtaskListProps> = ({
  subtasks,
  parentTaskId,
  onSubtaskDeleted,
  onSubtaskUpdated
}) => {
  const navigate = useNavigate();
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [childrenMap, setChildrenMap] = useState<Map<number, Task[]>>(new Map());
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

  const handleDelete = async (subtaskId: number): Promise<void> => {
    try {
      await deleteTask(subtaskId);
      onSubtaskDeleted(subtaskId);
      setChildrenMap((prev) => {
        const next = new Map(prev);
        for (const [parentId, list] of next) {
          if (list.some((t) => t.id === subtaskId)) {
            next.set(parentId, list.filter((t) => t.id !== subtaskId));
            break;
          }
        }
        return next;
      });
    } catch (error) {
      logger.error('Failed to delete subtask', error);
    }
  };

  const toggleExpanded = useCallback((subtaskId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(subtaskId)) next.delete(subtaskId);
      else next.add(subtaskId);
      return next;
    });
    if (!childrenMap.has(subtaskId)) {
      setLoadingIds((p) => new Set(p).add(subtaskId));
      getSubtasks(subtaskId)
        .then((data) => {
          setChildrenMap((prev) => new Map(prev).set(subtaskId, data || []));
        })
        .catch((err) => logger.error('Failed to fetch nested subtasks', err))
        .finally(() => setLoadingIds((p) => { const s = new Set(p); s.delete(subtaskId); return s; }));
    }
  }, [childrenMap]);

  const renderSubtaskRows = (taskList: Task[], indent: number): React.ReactNode => {
    return taskList.map((subtask) => {
      const children = childrenMap.get(subtask.id) ?? [];
      const hasFetched = childrenMap.has(subtask.id);
      const hasChildren = hasFetched && children.length > 0;
      const isExpanded = expandedIds.has(subtask.id);
      const isLoading = loadingIds.has(subtask.id);

      return (
        <React.Fragment key={subtask.id}>
          <TableRow
            sx={{
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
              borderBottom: 1,
              borderColor: 'divider',
              backgroundColor: subtask.status_name === 'Done' ? 'action.hover' : 'inherit'
            }}
          >
            <TableCell sx={{ py: 0.75, px: 1, pl: 1 + indent * 3, whiteSpace: 'nowrap', width: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <IconButton
                  size="small"
                  onClick={() => toggleExpanded(subtask.id)}
                  disabled={isLoading}
                  sx={{ p: 0.25 }}
                  aria-label={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
                >
                  {isLoading ? (
                    <Typography variant="caption">...</Typography>
                  ) : isExpanded ? (
                    <KeyboardArrowDownIcon fontSize="small" />
                  ) : (
                    <ChevronRightIcon fontSize="small" />
                  )}
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  #{subtask.id}
                </Typography>
              </Box>
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1 }}>
              <Typography
                component={RouterLink}
                to={`/tasks/${subtask.id}`}
                sx={{
                  fontWeight: 600,
                  textDecoration: subtask.status_name === 'Done' ? 'line-through' : 'none',
                  color: subtask.status_name === 'Done' ? 'text.secondary' : 'inherit',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {subtask.name}
              </Typography>
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1 }}>
              <Chip
                label={subtask.type_name || '—'}
                size="small"
                sx={{ backgroundColor: subtask.type_color || '#666', color: 'white', fontSize: '0.75rem' }}
              />
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1 }}>
              <Chip label={subtask.status_name || '—'} size="small" sx={{ fontSize: '0.75rem' }} {...chipPropsForStatus(subtask.status_name, subtask.status_color)} />
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1 }}>
              <Chip label={subtask.priority_name || '—'} size="small" sx={{ fontSize: '0.75rem' }} {...chipPropsForPriority(subtask.priority_name, subtask.priority_color)} />
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1, whiteSpace: 'nowrap' }}>{subtask.estimated_time ?? 0}h</TableCell>
            <TableCell sx={{ py: 0.75, px: 1, whiteSpace: 'nowrap' }}>{subtask.spent_time ?? 0}h</TableCell>
            <TableCell sx={{ py: 0.75, px: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 80 }}>
                <LinearProgress variant="determinate" value={Math.min(100, subtask.progress ?? 0)} sx={{ height: 6, borderRadius: 1, flex: 1 }} />
                <Typography variant="caption">{subtask.progress ?? 0}%</Typography>
              </Box>
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1 }}>
              {subtask.holder_id ? (
                <Link component={RouterLink} to={`/users/${subtask.holder_id}`} variant="body2" onClick={(e) => e.stopPropagation()}>
                  {subtask.holder_name || '—'}
                </Link>
              ) : (
                '—'
              )}
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1 }}>
              {subtask.assignee_id ? (
                <Link component={RouterLink} to={`/users/${subtask.assignee_id}`} variant="body2" onClick={(e) => e.stopPropagation()}>
                  {subtask.assignee_name || '—'}
                </Link>
              ) : (
                '—'
              )}
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1, whiteSpace: 'nowrap' }}>
              {subtask.due_date ? new Date(subtask.due_date).toLocaleDateString() : '—'}
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1 }} align="right">
              <Box sx={{ display: 'flex', gap: 0, justifyContent: 'flex-end' }}>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => navigate(`/tasks/${subtask.id}/edit`)} aria-label="Edit subtask">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDelete(subtask.id)} color="error" aria-label="Delete subtask">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>
          </TableRow>
          {isExpanded && hasFetched && children.length > 0 && renderSubtaskRows(children, indent + 1)}
        </React.Fragment>
      );
    });
  };

  if (subtasks.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
        No subtasks found
      </Typography>
    );
  }

  return (
    <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.75, px: 1 } }}>
      <TableHead>
        <TableRow>
          {COLUMNS.map((col) => (
            <TableCell key={col} sx={{ fontWeight: 600 }} align={col === 'Actions' ? 'right' : 'left'}>
              {col}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>{renderSubtaskRows(subtasks, 0)}</TableBody>
    </Table>
  );
};

export default SubtaskList;
