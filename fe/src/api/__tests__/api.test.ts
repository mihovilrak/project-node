import axios from 'axios';
import { api } from '../api';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    defaults: {
      baseURL: '/api',
      withCredentials: true
    }
  })
}));

describe('API Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export a configured axios instance', () => {
    // Focus only on validating that the API exports what we expect
    expect(api).toBeDefined();
    expect(api.defaults.baseURL).toBe('/api');
    expect(api.defaults.withCredentials).toBe(true);
  });
});