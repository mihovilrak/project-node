import { useLocation } from 'react-router-dom';

export type NavTab =
  '/' | '/projects' | '/tasks' | '/calendar' | '/users' | '/settings';

export const ADMIN_TABS: NavTab[] = ['/users', '/settings'];

const SECTION_PREFIXES: NavTab[] = [
  '/projects',
  '/tasks',
  '/calendar',
  '/users',
  '/settings',
];

/**
 * Map the current route to the top-level tab it belongs to, or `false` when no
 * tab matches (e.g. /profile).
 */
export const getNavTab = (pathname: string): NavTab | false => {
  if (pathname === '/' || pathname === '/home') return '/';
  // Project time-log calendars live under /projects, not /calendar.
  return (
    SECTION_PREFIXES.find(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) ?? false
  );
};

export const useNavigation = () => {
  const location = useLocation();
  return { activeTab: getNavTab(location.pathname) };
};
