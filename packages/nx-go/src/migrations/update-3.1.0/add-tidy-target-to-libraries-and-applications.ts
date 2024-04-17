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

    if (
      !projectConfig.targets.tidy &&
      projectConfig.targets.tidy?.executor !== '@nx-go/nx-go:tidy'
    ) {
      projectConfig.targets.tidy = {
        executor: '@nx-go/nx-go:tidy',
      };
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      updateProjectConfiguration(tree, projectName, projectConfig);
    }
  }

  await formatFiles(tree);
}
