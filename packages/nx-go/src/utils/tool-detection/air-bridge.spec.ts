import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { hasAirConfig, shouldCreateAirTarget } from './air-bridge';

jest.mock('node:fs');
jest.mock('node:child_process');

const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;

describe('Air Detection', () => {
  let mockExecSync: jest.MockedFunction<typeof execSync>;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    const { execSync: execSyncFromModule } = require('node:child_process');
    mockExecSync = execSyncFromModule as jest.MockedFunction<typeof execSync>;
  });

  describe('hasAirConfig', () => {
    it('should return true when .air.toml exists', () => {
      mockExistsSync.mockImplementation((path) =>
        path.toString().endsWith('.air.toml')
      );

      expect(hasAirConfig('/workspace', 'apps/myapp')).toBe(true);
    });

    it('should return true when .air.yaml exists', () => {
      mockExistsSync.mockImplementation((path) =>
        path.toString().endsWith('.air.yaml')
      );

      expect(hasAirConfig('/workspace', 'apps/myapp')).toBe(true);
    });

    it('should return true when .air.yml exists', () => {
      mockExistsSync.mockImplementation((path) =>
        path.toString().endsWith('.air.yml')
      );

      expect(hasAirConfig('/workspace', 'apps/myapp')).toBe(true);
    });

    it('should return false when no air config exists', () => {
      mockExistsSync.mockReturnValue(false);

      expect(hasAirConfig('/workspace', 'apps/myapp')).toBe(false);
    });

    it('should check in the correct project path', () => {
      mockExistsSync.mockReturnValue(false);

      hasAirConfig('/workspace', 'apps/myapp');

      expect(mockExistsSync).toHaveBeenCalledWith(
        join('/workspace', 'apps/myapp', '.air.toml')
      );
    });
  });

  describe('isAirAvailable', () => {
    it('should return true when air command is available', () => {
      mockExecSync.mockReturnValue(Buffer.from('air version 1.0.0'));

      const { isAirAvailable } = require('./air-bridge');

      expect(isAirAvailable()).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith('air -v', { stdio: 'ignore' });
    });

    it('should return false when air command is not available', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });

      const { isAirAvailable } = require('./air-bridge');

      expect(isAirAvailable()).toBe(false);
    });

    it('should cache result and not re-execute command', () => {
      mockExecSync.mockReturnValue(Buffer.from('air version 1.0.0'));

      const { isAirAvailable } = require('./air-bridge');

      expect(isAirAvailable()).toBe(true);
      expect(isAirAvailable()).toBe(true); // Second call uses cache
      expect(mockExecSync).toHaveBeenCalledTimes(1); // Proves caching works
    });
  });

  describe('shouldCreateAirTarget', () => {
    it('should return true when both config exists and air is available', () => {
      mockExistsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue(Buffer.from(''));

      expect(shouldCreateAirTarget('/workspace', 'apps/myapp')).toBe(true);
    });

    it('should return false when config exists but air is not available', () => {
      mockExistsSync.mockReturnValue(true);
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });

      const { shouldCreateAirTarget } = require('./air-bridge');

      expect(shouldCreateAirTarget('/workspace', 'apps/myapp')).toBe(false);
    });

    it('should return false when air is available but config does not exist', () => {
      mockExistsSync.mockReturnValue(false);
      mockExecSync.mockReturnValue(Buffer.from(''));

      expect(shouldCreateAirTarget('/workspace', 'apps/myapp')).toBe(false);
    });

    it('should return false when neither config nor air is available', () => {
      mockExistsSync.mockReturnValue(false);
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });

      const { shouldCreateAirTarget } = require('./air-bridge');

      expect(shouldCreateAirTarget('/workspace', 'apps/myapp')).toBe(false);
    });
  });
});
