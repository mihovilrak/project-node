import {
  getSafeImageUrl,
  getSafeNextPath,
  isSafeRelativePath,
} from '../urlSafety';

describe('urlSafety', () => {
  describe('isSafeRelativePath', () => {
    it.each(['/', '/tasks/1', '/projects?x=1#y'])('accepts %s', (value) => {
      expect(isSafeRelativePath(value)).toBe(true);
    });

    it.each([
      null,
      undefined,
      '',
      'tasks/1',
      '//evil.example',
      '/\\evil.example',
      'https://evil.example',
      'javascript:alert(1)',
      '/tasks\n/1',
    ])('rejects %p', (value) => {
      expect(isSafeRelativePath(value)).toBe(false);
    });
  });

  describe('getSafeNextPath', () => {
    it('returns safe paths unchanged', () => {
      expect(getSafeNextPath('/tasks/1')).toBe('/tasks/1');
    });

    it('falls back for unsafe paths', () => {
      expect(getSafeNextPath('//evil.example')).toBe('/');
      expect(getSafeNextPath(null, '/home')).toBe('/home');
    });
  });

  describe('getSafeImageUrl', () => {
    it('accepts https and same-origin urls', () => {
      expect(getSafeImageUrl('https://cdn.example/a.png')).toBe(
        'https://cdn.example/a.png',
      );
      expect(getSafeImageUrl('/avatars/1.png')).toBe(
        `${window.location.origin}/avatars/1.png`,
      );
    });

    it.each([
      null,
      '',
      'javascript:alert(1)',
      'http://insecure.example/a.png',
      'data:image/svg+xml,<svg onload=alert(1)>',
    ])('rejects %p', (value) => {
      expect(getSafeImageUrl(value)).toBeUndefined();
    });
  });
});
