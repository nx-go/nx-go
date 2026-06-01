import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { hasReviveConfig, shouldUseReviveLinter } from './revive-bridge';

jest.mock('node:fs');
jest.mock('node:child_process');

const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;

describe('Revive Detection', () => {
  let mockExecSync: jest.MockedFunction<typeof execSync>;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    const { execSync: execSyncFromModule } = require('node:child_process');
    mockExecSync = execSyncFromModule as jest.MockedFunction<typeof execSync>;
  });

  describe('hasReviveConfig', () => {
    it('should return true when revive.toml exists', () => {
      mockExistsSync.mockImplementation((path) =>
        path.toString().endsWith('revive.toml')
      );

      expect(hasReviveConfig('/workspace', 'apps/myapp')).toBe(true);
    });

    it('should return true when .revive.toml exists', () => {
      mockExistsSync.mockImplementation((path) =>
        path.toString().endsWith('.revive.toml')
      );

      expect(hasReviveConfig('/workspace', 'apps/myapp')).toBe(true);
    });

    it('should return false when no revive config exists', () => {
      mockExistsSync.mockReturnValue(false);

      expect(hasReviveConfig('/workspace', 'apps/myapp')).toBe(false);
    });

    it('should check in the correct project path', () => {
      mockExistsSync.mockReturnValue(false);

      hasReviveConfig('/workspace', 'apps/myapp');

      expect(mockExistsSync).toHaveBeenCalledWith(
        join('/workspace', 'apps/myapp', 'revive.toml')
      );
    });
  });

  describe('isReviveAvailable', () => {
    it('should return true when revive command is available', () => {
      mockExecSync.mockReturnValue(Buffer.from('version 1.5.0'));

      const { isReviveAvailable } = require('./revive-bridge');

      expect(isReviveAvailable()).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith('revive -version', {
        stdio: 'ignore',
      });
    });

    it('should return false when revive command is not available', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });

      const { isReviveAvailable } = require('./revive-bridge');

      expect(isReviveAvailable()).toBe(false);
    });

    it('should cache result and not re-execute command', () => {
      mockExecSync.mockReturnValue(Buffer.from('version 1.5.0'));

      const { isReviveAvailable } = require('./revive-bridge');

      expect(isReviveAvailable()).toBe(true);
      expect(isReviveAvailable()).toBe(true); // Second call uses cache
      expect(mockExecSync).toHaveBeenCalledTimes(1); // Proves caching works
    });
  });

  describe('shouldUseReviveLinter', () => {
    it('should return true when both config exists and revive is available', () => {
      mockExistsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue(Buffer.from(''));

      expect(shouldUseReviveLinter('/workspace', 'apps/myapp')).toBe(true);
    });

    it('should return false when config exists but revive is not available', () => {
      mockExistsSync.mockReturnValue(true);
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });

      const { shouldUseReviveLinter } = require('./revive-bridge');

      expect(shouldUseReviveLinter('/workspace', 'apps/myapp')).toBe(false);
    });

    it('should return false when revive is available but config does not exist', () => {
      mockExistsSync.mockReturnValue(false);
      mockExecSync.mockReturnValue(Buffer.from(''));

      expect(shouldUseReviveLinter('/workspace', 'apps/myapp')).toBe(false);
    });

    it('should return false when neither config nor revive is available', () => {
      mockExistsSync.mockReturnValue(false);
      mockExecSync.mockImplementation(() => {
        throw new Error('Command not found');
      });

      expect(shouldUseReviveLinter('/workspace', 'apps/myapp')).toBe(false);
    });
  });
});
