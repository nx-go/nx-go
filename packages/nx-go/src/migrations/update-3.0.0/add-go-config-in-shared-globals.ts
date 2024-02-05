import { formatFiles, Tree } from '@nx/devkit';
import { ensureGoConfigInSharedGlobals } from '../../utils';

/**
 * Ensure Go config is in shared globals of Nx workspace configuration.
 *
 * @param tree the project tree
 */
export default async function update(tree: Tree) {
  ensureGoConfigInSharedGlobals(tree);
  await formatFiles(tree);
}
