import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { ApplicationGeneratorSchema } from './schema';

describe('application generator', () => {
  let appTree: Tree;
  const options: ApplicationGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it.only('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  })

  it.only('should use posix-style paths', async() => {
    await generator(appTree, options);
    const { targets } = readProjectConfiguration(appTree, 'test');
    expect(targets).toBeDefined();
    expect(targets.build?.options?.outputPath).toBe('dist/apps/test')
    expect(targets.build?.options?.main).toBe('apps/test/main.go')
    expect(targets.serve?.options?.main).toBe('apps/test/main.go')
  })
});
