import { getPriorityColor } from '../taskUtils';

describe('taskUtils', () => {
  describe('getPriorityColor', () => {
    it('should return error color for very high priority', () => {
      expect(getPriorityColor('very high/must')).toBe('error');
    });

    it('should return warning color for high priority', () => {
      expect(getPriorityColor('high/should')).toBe('warning');
    });

    it('should return info color for normal priority', () => {
      expect(getPriorityColor('normal/could')).toBe('info');
    });

    it('should return success color for low priority', () => {
      expect(getPriorityColor('low/wont')).toBe('success');
    });

    it('should return default color for undefined priority', () => {
      expect(getPriorityColor(undefined)).toBe('default');
    });

    it('should return default color for unknown priority', () => {
      expect(getPriorityColor('invalid-priority')).toBe('default');
    });

    it('should be case insensitive', () => {
      expect(getPriorityColor('VERY HIGH/MUST')).toBe('error');
      expect(getPriorityColor('High/Should')).toBe('warning');
    });
  });
});