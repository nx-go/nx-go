import type { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { createGoMod } from './create-go-mod';
import { GeneratorNormalizedSchema } from './normalize-options';
import * as updateNxJsonFunctions from './update-nx-json';

jest.mock('./update-nx-json');

describe('createGoMod', () => {
  let tree: Tree;

  beforeEach(() => (tree = createTreeWithEmptyWorkspace()));

  it('should write go.mod if not exists', async () => {
    const spyWrite = jest.spyOn(tree, 'write');
    jest.spyOn(tree, 'exists').mockReturnValue(false);
    await createGoMod(tree, { npmScope: 'pkg' } as GeneratorNormalizedSchema);
    expect(spyWrite).toHaveBeenCalledWith('go.mod', 'module pkg\n');
  });

  it('should not write go.mod if exists', async () => {
    const spyWrite = jest.spyOn(tree, 'write');
    jest.spyOn(tree, 'exists').mockReturnValue(true);
    await createGoMod(tree, { npmScope: 'pkg' } as GeneratorNormalizedSchema);
    expect(spyWrite).not.toHaveBeenCalled();
  });

  it('should add go.mod to shared globals', async () => {
    await createGoMod(tree, { npmScope: 'pkg' } as GeneratorNormalizedSchema);
    expect(updateNxJsonFunctions.addGoModToSharedGlobals).toHaveBeenCalledWith(
      tree
    );
  });
});
