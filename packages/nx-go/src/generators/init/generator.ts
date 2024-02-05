import { formatFiles, Tree } from '@nx/devkit';
import { GO_WORK_MINIMUM_VERSION } from '../../constants';
import {
  addNxPlugin,
  createGoMod,
  createGoWork,
  ensureGoConfigInSharedGlobals,
  getProjectScope,
  supportsGoWorkspace,
} from '../../utils';
import { InitGeneratorSchema } from './schema';

export default async function initGenerator(
  tree: Tree,
  options: InitGeneratorSchema
) {
  if (options.skipGoWorkspace) {
    createGoMod(tree, getProjectScope(tree));
  } else {
    if (!supportsGoWorkspace()) {
      throw new Error(
        `Go workspaces are not supported. You need Go >= ${GO_WORK_MINIMUM_VERSION}`
      );
    }
    createGoWork(tree);
  }

  addNxPlugin(tree);
  ensureGoConfigInSharedGlobals(tree);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}
