import fs from 'fs';
import os from 'os';
import path from 'path';
import { AppSettingsRow } from '../types/config.types';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-config-'));
let secretCount = 0;
const writeSecret = (value: string): string => {
  const file = path.join(tmpDir, `secret-${secretCount++}.txt`);
  fs.writeFileSync(file, value);
  return file;
};

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const loadConfig = async () => {
  jest.resetModules();
  return import('../config');
};

const row = (overrides: Partial<AppSettingsRow> = {}): AppSettingsRow => ({
  sender_email: 'no-reply@example.com',
  app_base_url: 'https://app.example.com',
  email_enabled: true,
  email_host: 'smtp.example.com',
  email_port: 2525,
  email_secure: true,
  ...overrides,
});

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('applySettings', () => {
    it('should take SMTP settings from the database row', async () => {
      const { config, applySettings } = await loadConfig();

      expect(applySettings(row())).toBe(true);
      expect(config.email.host).toBe('smtp.example.com');
      expect(config.email.port).toBe(2525);
      expect(config.email.secure).toBe(true);
      expect(config.email.from).toBe('no-reply@example.com');
      expect(config.app.emailEnabled).toBe(true);
    });

    it('should keep credentials in the environment', async () => {
      process.env.EMAIL_USER = 'user@example.com';
      process.env.EMAIL_PASSWORD = 'secret';

      const { config, applySettings } = await loadConfig();
      applySettings(row());

      expect(config.email.auth).toEqual({
        user: 'user@example.com',
        pass: 'secret',
      });
    });

    it('should fall back to defaults for an unusable port', async () => {
      const { config, applySettings } = await loadConfig();

      applySettings(row({ email_port: 0 }));

      expect(config.email.port).toBe(587);
    });

    it('should strip trailing slashes from the base URL', async () => {
      const { config, applySettings } = await loadConfig();

      applySettings(row({ app_base_url: 'https://app.example.com///' }));

      expect(config.appBaseUrl).toBe('https://app.example.com');
    });

    it('should read the password from EMAIL_PASSWORD_FILE', async () => {
      process.env.EMAIL_USER = 'user@example.com';
      delete process.env.EMAIL_PASSWORD;
      process.env.EMAIL_PASSWORD_FILE = writeSecret('file-secret\n');

      const { config, applySettings } = await loadConfig();
      applySettings(row());

      expect(config.email.auth.pass).toBe('file-secret');
    });

    it('should report no change when only the sender differs', async () => {
      const { applySettings } = await loadConfig();
      applySettings(row());

      expect(applySettings(row({ sender_email: 'other@example.com' }))).toBe(
        false,
      );
    });

    it('should report a change when the credentials differ', async () => {
      const { applySettings } = await loadConfig();
      applySettings(row());
      process.env.EMAIL_PASSWORD = 'rotated';

      expect(applySettings(row())).toBe(true);
    });

    it('should report no change when only non-SMTP fields differ', async () => {
      const { applySettings } = await loadConfig();
      applySettings(row());

      expect(
        applySettings(row({ app_base_url: 'https://other.example.com' })),
      ).toBe(false);
    });

    it('should fall back to defaults when there is no row', async () => {
      const { config, applySettings } = await loadConfig();
      applySettings(row());

      applySettings(null);

      expect(config.email.host).toBe('smtp.gmail.com');
      expect(config.app.emailEnabled).toBe(false);
      expect(config.appBaseUrl).toBe('http://localhost:3000');
    });
  });

  describe('validateConfig', () => {
    it('should pass when everything required is present', async () => {
      const { validateConfig } = await loadConfig();

      expect(() => validateConfig()).not.toThrow();
    });

    it('should list the missing database variables', async () => {
      delete process.env.POSTGRES_HOST;
      delete process.env.POSTGRES_DB;

      const { validateConfig } = await loadConfig();

      expect(() => validateConfig()).toThrow(/POSTGRES_HOST, POSTGRES_DB/);
    });

    it('should accept a password from POSTGRES_PASSWORD_FILE', async () => {
      delete process.env.POSTGRES_PASSWORD;
      process.env.POSTGRES_PASSWORD_FILE = writeSecret('db-secret');

      const { config, validateConfig } = await loadConfig();

      expect(config.db.password).toBe('db-secret');
      expect(() => validateConfig()).not.toThrow();
    });

    it('should fail when POSTGRES_PASSWORD_FILE is unreadable', async () => {
      delete process.env.POSTGRES_PASSWORD;
      process.env.POSTGRES_PASSWORD_FILE = path.join(tmpDir, 'missing.txt');

      await expect(loadConfig()).rejects.toThrow(/POSTGRES_PASSWORD_FILE/);
    });

    it('should fail when both POSTGRES_PASSWORD and its _FILE are set', async () => {
      process.env.POSTGRES_PASSWORD = 'plain';
      process.env.POSTGRES_PASSWORD_FILE = writeSecret('db-secret');

      await expect(loadConfig()).rejects.toThrow(/use only one/);
    });

    it('should reject an invalid port', async () => {
      process.env.POSTGRES_PORT = 'abc';

      const { validateConfig } = await loadConfig();

      expect(() => validateConfig()).toThrow(/POSTGRES_PORT/);
    });
  });
});
