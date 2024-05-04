import {
  formatFiles,
  getProjects,
  type Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { isGoWorkspace, isProjectUsingNxGo } from '../../utils';

/**
 * Add tidy executor to existing nx-go projects
 *
 * @param tree the project tree
 */
export default async function update(tree: Tree) {
  // When it's not a go workspace we don't add it to any project
  if (!isGoWorkspace(tree)) {
    return;
  }

  const projects = getProjects(tree);

  for (const [projectName, projectConfig] of projects) {
    let shouldUpdate = false;

    if (!projectConfig.targets) continue;
    if (!isProjectUsingNxGo(projectConfig)) continue;

    if (
      !projectConfig.targets.tidy ||
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
