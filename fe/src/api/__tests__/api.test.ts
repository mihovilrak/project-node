import axios from 'axios';
import { api } from '../api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create axios instance with correct configuration', () => {
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: '/api',
      withCredentials: true,
    });
  });

  it('should export configured axios instance', () => {
    expect(api).toBeDefined();
    expect(api.defaults.baseURL).toBe('/api');
    expect(api.defaults.withCredentials).toBe(true);
  });
});