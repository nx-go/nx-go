const normalizeOptions = {
  name: 'my-api',
  moduleName: 'myapi',
  projectRoot: 'apps/my-api',
  projectName: 'my-api',
  projectType: 'application',
  parsedTags: ['api', 'backend'],
};

import type { Tree } from '@nx/devkit';
import * as nxDevkit from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { join } from 'path';
import * as shared from '../../utils';
import applicationGenerator, { defaultTargets } from './generator';
import type { ApplicationGeneratorSchema } from './schema';

jest.mock('@nx/devkit');
jest.mock('../../utils', () => ({
  addGoWorkDependency: jest.fn(),
  createGoMod: jest.fn(),
  isGoWorkspace: jest.fn().mockReturnValue(false),
  normalizeOptions: jest.fn().mockImplementation((_, { skipFormat }) => ({
    ...normalizeOptions,
    skipFormat,
  })),
}));

describe('application generator', () => {
  let tree: Tree;
  const options: ApplicationGeneratorSchema = { name: 'my-api' };

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));
  afterEach(() => jest.clearAllMocks());

  it('should write project configuration', async () => {
    await applicationGenerator(tree, options);
    expect(nxDevkit.addProjectConfiguration).toHaveBeenCalledWith(
      tree,
      'my-api',
      {
        root: 'apps/my-api',
        name: 'my-api',
        projectType: 'application',
        sourceRoot: 'apps/my-api',
        targets: defaultTargets,
        tags: ['api', 'backend'],
      }
    );
    expect(nxDevkit.updateProjectConfiguration).not.toHaveBeenCalled();
  });

  it('should generate files', async () => {
    await applicationGenerator(tree, options);
    expect(nxDevkit.generateFiles).toHaveBeenCalledWith(
      tree,
      join(__dirname, './files'),
      'apps/my-api',
      normalizeOptions
    );
  });

  it('should create Go mod for project if in a Go workspace', async () => {
    jest.spyOn(shared, 'isGoWorkspace').mockReturnValueOnce(true);
    await applicationGenerator(tree, options);
    expect(shared.createGoMod).toHaveBeenCalledWith(
      tree,
      'apps/my-api',
      'apps/my-api'
    );
  });

  it('should add tidy executor for project if in a Go workspace', async () => {
    jest.spyOn(shared, 'isGoWorkspace').mockReturnValueOnce(true);
    await applicationGenerator(tree, options);
    expect(nxDevkit.updateProjectConfiguration).toHaveBeenCalledWith(
      tree,
      'my-api',
      {
        root: 'apps/my-api',
        name: 'my-api',
        projectType: 'application',
        sourceRoot: 'apps/my-api',
        targets: {
          ...defaultTargets,
          tidy: {
            executor: '@nx-go/nx-go:tidy',
          },
        },
        tags: ['api', 'backend'],
      }
    );
  });

  it('should not create Go mod for project if not in a Go workspace', async () => {
    await applicationGenerator(tree, options);
    expect(shared.createGoMod).not.toHaveBeenCalled();
  });

  it('should add Go work dependency if in a Go workspace', async () => {
    jest.spyOn(shared, 'isGoWorkspace').mockReturnValueOnce(true);
    await applicationGenerator(tree, options);
    expect(shared.addGoWorkDependency).toHaveBeenCalledWith(
      tree,
      'apps/my-api'
    );
  });

  it('should not add Go work dependency if not in a Go workspace', async () => {
    await applicationGenerator(tree, options);
    expect(shared.addGoWorkDependency).not.toHaveBeenCalled();
  });

  it('should format files', async () => {
    await applicationGenerator(tree, options);
    expect(nxDevkit.formatFiles).toHaveBeenCalledWith(tree);
  });

  it('should not format files if skipped', async () => {
    await applicationGenerator(tree, { ...options, skipFormat: true });
    expect(nxDevkit.formatFiles).not.toHaveBeenCalled();
  });
});
