import React from 'react';

// Mock the createRoot functionality
const mockCreateRoot = jest.fn();
const mockRender = jest.fn();

jest.mock('react-dom/client', () => ({
  createRoot: (...args: unknown[]) => {
    mockCreateRoot(...args);
    return {
      render: mockRender
    };
  }
}));

// Mock the App component
jest.mock('../App', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked App</div>
  };
});

describe('Index', () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockCreateRoot.mockClear();
    mockRender.mockClear();

    // Mock getElementById
    document.getElementById = jest.fn().mockReturnValue(document.createElement('div'));
  });

  it('should render App component inside root element', () => {
    // Import and execute the index file
    require('./index');

    // Check if createRoot was called with the root element
    expect(mockCreateRoot).toHaveBeenCalledWith(
      expect.any(HTMLElement)
    );

    // Check if render was called with App wrapped in StrictMode
    expect(mockRender).toHaveBeenCalledWith(
      expect.objectContaining({
        type: React.StrictMode,
        props: expect.objectContaining({
          children: expect.objectContaining({
            type: expect.any(Function)
          })
        })
      })
    );
  });
});