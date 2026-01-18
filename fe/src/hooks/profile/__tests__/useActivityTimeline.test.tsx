import { renderHook } from '@testing-library/react';
import { useActivityTimeline } from '../useActivityTimeline';
import {
  Task as TaskIcon,
  Comment as CommentIcon,
  InsertDriveFile as FileIcon,
  Edit as EditIcon
} from '@mui/icons-material';

describe('useActivityTimeline', () => {
  it('should return getActivityIcon and getActivityColor functions', () => {
    const { result } = renderHook(() => useActivityTimeline());

    expect(result.current.getActivityIcon).toBeDefined();
    expect(result.current.getActivityColor).toBeDefined();
  });

  describe('getActivityIcon', () => {
    it('should return correct icon for each activity type', () => {
      const { result } = renderHook(() => useActivityTimeline());
      const { getActivityIcon } = result.current;

      expect(getActivityIcon('task')).toBe(TaskIcon);
      expect(getActivityIcon('comment')).toBe(CommentIcon);
      expect(getActivityIcon('file')).toBe(FileIcon);
      expect(getActivityIcon('edit')).toBe(EditIcon);
    });

    it('should return TaskIcon for unknown activity type', () => {
      const { result } = renderHook(() => useActivityTimeline());
      const { getActivityIcon } = result.current;

      expect(getActivityIcon('unknown' as any)).toBe(TaskIcon);
    });
  });

  describe('getActivityColor', () => {
    it('should return correct color for each activity type', () => {
      const { result } = renderHook(() => useActivityTimeline());
      const { getActivityColor } = result.current;

      expect(getActivityColor('task')).toBe('primary');
      expect(getActivityColor('comment')).toBe('success');
      expect(getActivityColor('file')).toBe('info');
      expect(getActivityColor('edit')).toBe('warning');
    });

    it('should return primary color for unknown activity type', () => {
      const { result } = renderHook(() => useActivityTimeline());
      const { getActivityColor } = result.current;

      expect(getActivityColor('unknown' as any)).toBe('primary');
    });
  });
});
