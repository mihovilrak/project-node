import React, { useMemo, useState, useCallback } from 'react';
import {
  Typography,
  Link,
  Box,
  IconButton,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import dayjs from 'dayjs';
import { ProjectTaskListProps } from '../../../types/project';
import { Task } from '../../../types/task';
import { chipPropsForPriority, chipPropsForStatus } from '../../../utils/taskUtils';

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
  'Due'
] as const;

const ProjectTaskList: React.FC<ProjectTaskListProps> = ({ tasks }) => {
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<number>>(new Set());

  const roots = useMemo(
    () => tasks.filter((t) => t?.parent_id == null),
    [tasks]
  );

  const childrenByParentId = useMemo(() => {
    const map = new Map<number, Task[]>();
    tasks.forEach((t) => {
      if (t?.parent_id != null) {
        const list = map.get(t.parent_id) ?? [];
        list.push(t);
        map.set(t.parent_id, list);
      }
    });
    return map;
  }, [tasks]);

  const toggleExpanded = useCallback((taskId: number) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  const renderTaskRows = (taskList: Task[], indent: number): React.ReactNode => {
    return taskList.map((task) => {
      const subtasks = childrenByParentId.get(task?.id ?? 0) ?? [];
      const hasSubtasks = subtasks.length > 0;
      const isExpanded = expandedTaskIds.has(task?.id ?? 0);

      return (
        <React.Fragment key={task?.id}>
          <TableRow
            sx={{
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
              borderBottom: 1,
              borderColor: 'divider'
            }}
          >
            <TableCell sx={{ py: 0.75, px: 1, pl: 1 + indent * 3, whiteSpace: 'nowrap', width: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                {hasSubtasks && (
                  <IconButton
                    size="small"
                    onClick={() => toggleExpanded(task?.id ?? 0)}
                    aria-label={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
                    sx={{ p: 0.25 }}
                  >
                    {isExpanded ? <KeyboardArrowDownIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                  </IconButton>
                )}
                <Typography variant="body2" color="text.secondary">
                  #{task?.id}
                </Typography>
              </Box>
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1 }}>
              <Typography
                component={RouterLink}
                to={`/tasks/${task?.id}`}
                sx={{ fontWeight: 600, textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }}
              >
                {task?.name || 'Unnamed Task'}
              </Typography>
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1 }}>
              <Chip
                label={task?.type_name || '—'}
                size="small"
                sx={{ backgroundColor: task?.type_color || '#666', color: 'white', fontSize: '0.75rem' }}
              />
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1 }}>
              <Chip label={task?.status_name || '—'} size="small" sx={{ fontSize: '0.75rem' }} {...chipPropsForStatus(task?.status_name, task?.status_color)} />
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1 }}>
              <Chip label={task?.priority_name || '—'} size="small" sx={{ fontSize: '0.75rem' }} {...chipPropsForPriority(task?.priority_name, task?.priority_color)} />
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1, whiteSpace: 'nowrap' }}>{task?.estimated_time ?? 0}h</TableCell>
            <TableCell sx={{ py: 0.75, px: 1, whiteSpace: 'nowrap' }}>{task?.spent_time ?? 0}h</TableCell>
            <TableCell sx={{ py: 0.75, px: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 80 }}>
                <LinearProgress variant="determinate" value={Math.min(100, task?.progress ?? 0)} sx={{ height: 6, borderRadius: 1, flex: 1 }} />
                <Typography variant="caption">{task?.progress ?? 0}%</Typography>
              </Box>
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1 }}>
              {task?.holder_id ? (
                <Link component={RouterLink} to={`/users/${task.holder_id}`} variant="body2" onClick={(e) => e.stopPropagation()}>
                  {task?.holder_name || '—'}
                </Link>
              ) : (
                '—'
              )}
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1 }}>
              {task?.assignee_id ? (
                <Link component={RouterLink} to={`/users/${task.assignee_id}`} variant="body2" onClick={(e) => e.stopPropagation()}>
                  {task?.assignee_name || '—'}
                </Link>
              ) : (
                '—'
              )}
            </TableCell>
            <TableCell sx={{ py: 0.75, px: 1, whiteSpace: 'nowrap' }}>
              {task?.due_date ? dayjs(task.due_date).format('MMM D') : '—'}
            </TableCell>
          </TableRow>
          {hasSubtasks && isExpanded && renderTaskRows(subtasks, indent + 1)}
        </React.Fragment>
      );
    });
  };

  if (tasks.length === 0) {
    return <Typography>No tasks found.</Typography>;
  }

  return (
    <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.75, px: 1 } }}>
      <TableHead>
        <TableRow>
          {COLUMNS.map((col) => (
            <TableCell key={col} sx={{ fontWeight: 600 }}>
              {col}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>{renderTaskRows(roots, 0)}</TableBody>
    </Table>
  );
};

export default ProjectTaskList;
