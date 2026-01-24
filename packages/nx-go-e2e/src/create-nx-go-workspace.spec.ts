import {
  checkFilesExist,
  cleanup,
  ensureNxProject,
  runNxCommand,
} from '@nx/plugin/testing';

describe('nx-go: create workspace', () => {
  beforeAll(() => {
    ensureNxProject('@nx-go/nx-go', 'dist/packages/nx-go');
    runNxCommand('generate @nx-go/nx-go:init');
  });
  afterAll(() => cleanup());

  it('should be able to convert the workspace to one Go module', () => {
    runNxCommand('generate @nx-go/nx-go:convert-to-one-mod');
    expect(() => checkFilesExist(`go.mod`)).not.toThrow();
    expect(() => checkFilesExist(`go.work`)).toThrow();
  });
});
