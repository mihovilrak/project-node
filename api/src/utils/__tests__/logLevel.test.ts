import { Pool } from 'pg';
import { applyStoredLogLevel, setLogLevel } from '../logLevel';
import { getSystemSettings } from '../../models/settingsModel';
import logger from '../logger';

jest.mock('../../models/settingsModel');
jest.mock('../logger', () => ({
  __esModule: true,
  default: {
    level: 'info',
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const pool = {} as Pool;

describe('logLevel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logger.level = 'info';
  });

  it('applies the stored level on startup', async () => {
    (getSystemSettings as jest.Mock).mockResolvedValue({ log_level: 'debug' });

    await applyStoredLogLevel(pool);

    expect(logger.level).toBe('debug');
    expect(logger.info).toHaveBeenCalledWith(
      { from: 'info', to: 'debug' },
      'Log level changed',
    );
  });

  it('keeps the env level when no settings row exists', async () => {
    (getSystemSettings as jest.Mock).mockResolvedValue(null);

    await applyStoredLogLevel(pool);

    expect(logger.level).toBe('info');
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('keeps the env level and warns when the read fails', async () => {
    const err = new Error('db down');
    (getSystemSettings as jest.Mock).mockRejectedValue(err);

    await expect(applyStoredLogLevel(pool)).resolves.toBeUndefined();

    expect(logger.level).toBe('info');
    expect(logger.warn).toHaveBeenCalledWith({ err }, expect.any(String));
  });

  it('ignores unknown levels', () => {
    expect(setLogLevel('trace')).toBe(false);
    expect(setLogLevel(undefined)).toBe(false);
    expect(logger.level).toBe('info');
  });

  it('does nothing when the level is unchanged', () => {
    expect(setLogLevel('info')).toBe(false);
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('logs the change before raising the level past info', () => {
    let levelAtAudit: string | undefined;
    (logger.info as jest.Mock).mockImplementation(() => {
      levelAtAudit = logger.level;
    });
    expect(setLogLevel('error')).toBe(true);
    expect(logger.level).toBe('error');
    expect(levelAtAudit).toBe('info');
    expect(logger.info).toHaveBeenCalledWith(
      { from: 'info', to: 'error' },
      'Log level changed',
    );
  });

  it('logs at the more verbose level when both are above info', () => {
    logger.level = 'error';
    expect(setLogLevel('warn')).toBe(true);
    expect(logger.warn).toHaveBeenCalledWith(
      { from: 'error', to: 'warn' },
      'Log level changed',
    );
    expect(logger.info).not.toHaveBeenCalled();
  });
});
