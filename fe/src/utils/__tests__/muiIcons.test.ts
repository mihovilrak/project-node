import { getMuiIcon } from '../muiIcons';

describe('getMuiIcon', () => {
  it('returns the icon component for a known name', () => {
    expect(getMuiIcon('Label')).toBeTruthy();
  });

  it('returns null for empty or unknown names', () => {
    expect(getMuiIcon(undefined)).toBeNull();
    expect(getMuiIcon(null)).toBeNull();
    expect(getMuiIcon('')).toBeNull();
    expect(getMuiIcon('NotARealIcon')).toBeNull();
  });
});
