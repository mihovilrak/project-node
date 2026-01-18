import { render, screen } from '@testing-library/react';
import ProjectDetails from '../ProjectDetails';
import { useProjectDetails } from '../../../hooks/project/useProjectDetails';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useParams: jest.fn().mockReturnValue({ id: '1' })
}));

jest.mock('../../../hooks/project/useProjectDetails');
const mockUseProjectDetails = useProjectDetails as jest.Mock;

const mockProject = {
  id: 1,
  name: 'Test Project',
  description: 'Test Description'
};

const mockHookReturnValue = {
  project: mockProject,
  loading: false,
  error: null,
  canEdit: true,
  canDelete: true,
  setState: jest.fn()
};

describe('ProjectDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProjectDetails.mockReturnValue(mockHookReturnValue);
  });

  it('shows a loading indicator when loading is true', () => {
    mockUseProjectDetails.mockReturnValue({ ...mockHookReturnValue, loading: true });
    render(<ProjectDetails />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows an error message when there is an error', () => {
    mockUseProjectDetails.mockReturnValue({
      ...mockHookReturnValue,
      error: 'Error loading project'
    });
    render(<ProjectDetails />);
    expect(screen.getByText('Error loading project')).toBeInTheDocument();
  });

  it('shows project not found message when project is null', () => {
    mockUseProjectDetails.mockReturnValue({ ...mockHookReturnValue, project: null });
    render(<ProjectDetails />);
    expect(screen.getByText('Project not found')).toBeInTheDocument();
  });
});