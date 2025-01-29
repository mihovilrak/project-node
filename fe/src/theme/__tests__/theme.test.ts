import { lightTheme, darkTheme, createAppTheme } from '../theme';

describe('theme', () => {
  describe('lightTheme', () => {
    it('should have correct light mode configuration', () => {
      expect(lightTheme.palette?.mode).toBe('light');
      expect((lightTheme.palette?.primary as any).main).toBe('#1976d2');
      expect(lightTheme.palette?.background?.default).toBe('#f5f5f5');
      expect(lightTheme.palette?.background?.paper).toBe('#ffffff');
    });

    it('should include component overrides', () => {
      expect(lightTheme.components).toBeDefined();
    });
  });

  describe('darkTheme', () => {
    it('should have correct dark mode configuration', () => {
      expect(darkTheme.palette?.mode).toBe('dark');
      expect((darkTheme.palette?.primary as any).main).toBe('#90caf9');
      expect(darkTheme.palette?.background?.default).toBe('#303030');
      expect(darkTheme.palette?.background?.paper).toBe('#424242');
    });

    it('should include component overrides', () => {
      expect(darkTheme.components).toBeDefined();
    });
  });

  describe('createAppTheme', () => {
    it('should create light theme when mode is light', () => {
      const theme = createAppTheme('light');
      expect(theme.palette.mode).toBe('light');
    });

    it('should create dark theme when mode is dark', () => {
      const theme = createAppTheme('dark');
      expect(theme.palette.mode).toBe('dark');
    });
  });

  describe('component overrides', () => {
    it('should have correct MuiGrid overrides', () => {
      expect(lightTheme.components?.MuiGrid).toBeDefined();
      expect(lightTheme.components?.MuiGrid?.styleOverrides?.root).toBeDefined();
    });

    it('should have correct MuiCard overrides', () => {
      expect(lightTheme.components?.MuiCard).toBeDefined();
      expect(lightTheme.components?.MuiCard?.styleOverrides?.root).toBeDefined();
    });

    it('should have correct MuiCardContent overrides', () => {
      expect(lightTheme.components?.MuiCardContent).toBeDefined();
      expect(lightTheme.components?.MuiCardContent?.styleOverrides?.root).toBeDefined();
    });
  });
});