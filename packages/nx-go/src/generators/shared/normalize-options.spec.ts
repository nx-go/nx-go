import type { Tree } from '@nx/devkit';
import { normalizeOptions } from './normalize-options';

jest.mock('@nx/devkit', () => ({
  names: jest.fn().mockReturnValue({ fileName: 'backend-filename' }),
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
  it('should normalize basic options', async () => {
    const output = await normalizeOptions(
      {} as Tree,
      { name: 'backend', directory: 'backend-dir' },
      'application',
      'init'
    );
    expect(output.name).toBe('backend-filename');
    expect(output.projectName).toBe('backend');
    expect(output.projectRoot).toBe('/tmp');
    expect(output.projectType).toBe('application');
    expect(output.directory).toBe('backend-dir');
    expect(output.projectNameAndRootFormat).toBe('as-provided');
    expect(output.parsedTags).toEqual([]);
  });

  it('should extract npm scope from package.json', async () => {
    const output = await normalizeOptions(
      {} as Tree,
      { name: 'backend' },
      'application',
      'init'
    );
    expect(output.npmScope).toBe('nx-go');
  });

  it('should normalize tags', async () => {
    const output = await normalizeOptions(
      {} as Tree,
      { name: 'backend', tags: 'api,web' },
      'application',
      'init'
    );
    expect(output.parsedTags).toEqual(['api', 'web']);
  });
});
