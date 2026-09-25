import * as Icons from '@mui/icons-material';
import { SvgIconComponent } from '@mui/icons-material';

const iconMap = Icons as unknown as Record<
  string,
  SvgIconComponent | undefined
>;

/**
 * Look up a Material icon component by its export name.
 *
 * @param name Icon name, e.g. "Label"
 * @returns The icon component, or null when the name is empty or unknown.
 */
export const getMuiIcon = (name?: string | null): SvgIconComponent | null =>
  (name && iconMap[name]) || null;
