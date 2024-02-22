import { formatFiles, logger, Tree } from '@nx/devkit';
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
  if (supportsGoWorkspace()) {
    createGoWork(tree);
  } else {
    createGoMod(tree, getProjectScope(tree));
    logger.warn(
      `Go workspaces are not supported. You need Go >= ${GO_WORK_MINIMUM_VERSION}. Fallback to a single Go module.`
    );
  }

  addNxPlugin(tree);
  ensureGoConfigInSharedGlobals(tree);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}
