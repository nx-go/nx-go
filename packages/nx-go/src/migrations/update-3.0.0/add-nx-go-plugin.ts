import { formatFiles, Tree } from '@nx/devkit';
import { addNxPlugin } from '../../utils';

/**
 * Adds Nx Go plugin to Nx workspace configuration if it doesn't exist yet.
 *
 * @param tree the project tree
 */
export default async function update(tree: Tree) {
  addNxPlugin(tree);
  await formatFiles(tree);
}
