import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { hasMainPackage } from './has-main-package';

jest.mock('node:fs');
jest.mock('node:path');

const mockedExistsSync = jest.mocked(existsSync);
const mockedReadFileSync = jest.mocked(readFileSync);
const joinMock = jest.mocked(join);

describe('hasMainPackage', () => {
  beforeEach(() => {
    joinMock.mockImplementation((...args) =>
      args.join('/').replace(/\/+/g, '/')
    );
  });
  afterEach(() => jest.clearAllMocks());

  describe('when project path does not exist', () => {
    it('should return false', () => {
      mockedExistsSync.mockReturnValueOnce(false);

      const result = hasMainPackage('/workspace', 'apps/api', 'api');

      expect(result).toBe(false);
      expect(mockedExistsSync).toHaveBeenCalledWith('/workspace/apps/api');
    });
  });

  describe('when project path exists', () => {
    it.each`
      file
      ${'main.go'}
      ${'cmd.go'}
      ${'app.go'}
      ${'server.go'}
      ${'my-app.go'}
      ${'cmd/my-app/main.go'}
    `('should return true when $file contains package main', ({ file }) => {
      mockedExistsSync.mockImplementation((path) =>
        ['/workspace/apps/my-app', `/workspace/apps/my-app/${file}`].includes(
          path.toString()
        )
      );
      mockedReadFileSync.mockReturnValueOnce('package main\n\nfunc main() {}');

      expect(hasMainPackage('/workspace', 'apps/my-app', 'my-app')).toBe(true);
    });

    it('should return false when file exists but does not contain package main', () => {
      mockedExistsSync.mockImplementation((path) =>
        ['/my-app', `/my-app/main.go`].includes(path.toString())
      );
      mockedReadFileSync.mockReturnValueOnce(
        'package utils\n\nfunc Helper() {}'
      );

      expect(hasMainPackage('/', 'my-app', 'my-app')).toBe(false);
    });

    it('should return false when no common main files exist', () => {
      mockedExistsSync.mockImplementation(
        (path) => path.toString() === '/libs/utils'
      );

      expect(hasMainPackage('/', 'libs/utils', 'utils')).toBe(false);
    });

    it('should handle package main with extra whitespace', () => {
      mockedExistsSync.mockImplementation((path) =>
        ['/my-app', '/my-app/main.go'].includes(path.toString())
      );
      mockedReadFileSync.mockReturnValueOnce(
        '  package   main  \n\nfunc main() {}'
      );

      const result = hasMainPackage('/', 'my-app', 'my-app');

      expect(result).toBe(true);
    });

    it('should return false when readFileSync throws an error', () => {
      mockedExistsSync.mockImplementation((path) =>
        ['/my-app', '/my-app/main.go'].includes(path.toString())
      );
      mockedReadFileSync.mockImplementationOnce(() => {
        throw new Error('Permission denied');
      });

      expect(hasMainPackage('/', 'my-app', 'my-app')).toBe(false);
    });

    it('should continue checking other files if first file read fails', () => {
      mockedExistsSync.mockImplementation((path) =>
        ['/my-app', '/my-app/main.go', '/my-app/cmd.go'].includes(
          path.toString()
        )
      );

      mockedReadFileSync
        .mockImplementationOnce(() => {
          throw new Error('Permission denied');
        })
        .mockReturnValueOnce('package main\n\nfunc main() {}');

      const result = hasMainPackage('/', 'my-app', 'my-app');

      expect(result).toBe(true);
    });

    it('should not check for projectName based files if it is undefined', () => {
      mockedExistsSync.mockImplementation((path) =>
        ['/app', '/app/main.go'].includes(path.toString())
      );
      mockedReadFileSync.mockReturnValueOnce('package main\n\nfunc main() {}');

      hasMainPackage('/', 'app', undefined);

      expect(mockedExistsSync).not.toHaveBeenCalledWith('/app/app.go');
      expect(mockedExistsSync).not.toHaveBeenCalledWith('/app/cmd/app/main.go');
    });
  });
});
