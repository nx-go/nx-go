import {
  formatFiles,
  getProjects,
  type Tree,
  updateProjectConfiguration,
} from '@nx/devkit';

/**
 * Update executor options to ensure a smooth transition to v3.
 *
 * @param tree the project tree
 */
export default async function update(tree: Tree) {
  const projects = getProjects(tree);

  for (const [projectName, projectConfig] of projects) {
    let shouldUpdate = false;

    if (!projectConfig.targets) continue;

    for (const target of Object.values(projectConfig.targets)) {
      // lint executor: args (string) -> args (array)
      if (
        target.executor === '@nx-go/nx-go:lint' &&
        target.options &&
        'args' in target.options &&
        typeof target.options['args'] === 'string'
      ) {
        target.options['args'] = target.options['args'].split(' ');
        shouldUpdate = true;
      }

      // serve executor: arguments (array) -> args (array)
      if (
        target.executor === '@nx-go/nx-go:serve' &&
        target.options &&
        'arguments' in target.options
      ) {
        target.options['args'] = target.options['arguments'];
        delete target.options['arguments'];
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      updateProjectConfiguration(tree, projectName, projectConfig);
    }
  }

  await formatFiles(tree);
}
