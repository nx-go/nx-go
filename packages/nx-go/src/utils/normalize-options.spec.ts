import type { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { normalizeOptions } from './normalize-options';

jest.mock('@nx/devkit', () => ({
  names: jest.fn().mockReturnValue({
    fileName: 'backend-filename',
    propertyName: 'backendFilename',
  }),
  readJson: jest.fn().mockReturnValue({ name: '@nx-go/backend' }),
}));
jest.mock('@nx/devkit/src/generators/project-name-and-root-utils', () => ({
  determineProjectNameAndRootOptions: jest.fn().mockReturnValue({
    projectName: 'backend',
    projectRoot: '/tmp',
    projectNameAndRootFormat: 'as-provided',
  }),
}));

describe('normalizeOptions', () => {
  let tree: Tree;

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));

  it('should normalize basic options', async () => {
    const output = await normalizeOptions(
      tree,
      { name: 'backend', directory: 'backend-dir' },
      'application',
      'init'
    );
    expect(output.name).toBe('backend-filename');
    expect(output.moduleName).toBe('backendfilename');
    expect(output.projectName).toBe('backend');
    expect(output.projectRoot).toBe('/tmp');
    expect(output.projectType).toBe('application');
    expect(output.directory).toBe('backend-dir');
    expect(output.projectNameAndRootFormat).toBe('as-provided');
    expect(output.parsedTags).toEqual([]);
  });

  it('should normalize tags', async () => {
    const output = await normalizeOptions(
      tree,
      { name: 'backend', tags: 'api,web' },
      'application',
      'init'
    );
    expect(output.parsedTags).toEqual(['api', 'web']);
  });
});
