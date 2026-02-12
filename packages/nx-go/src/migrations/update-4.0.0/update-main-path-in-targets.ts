import {
  formatFiles,
  getProjects,
  type Tree,
  updateProjectConfiguration,
} from '@nx/devkit';

/**
 * Updates the `main` option in any targets using nx-go build or serve executors
 * to use relative paths instead of absolute paths. This is required because
 * executors now run from the project directory instead of the workspace root.
 *
 * For example:
 * - `{projectRoot}/main.go` → `main.go`
 * - `apps/backend/main.go` → `main.go`
 * - `libs/mylib/mylib.go` → `mylib.go`
 *
 * @param tree the project tree
 */
export default async function update(tree: Tree) {
  const projects = getProjects(tree);

  for (const [projectName, projectConfig] of projects) {
    if (!projectConfig.targets) continue;

    let hasChanges = false;

    // Iterate through all targets to find any using nx-go build or serve executors
    for (const [, target] of Object.entries(projectConfig.targets)) {
      const isNxGoBuildOrServe =
        target.executor === '@nx-go/nx-go:build' ||
        target.executor === '@nx-go/nx-go:serve';

      if (isNxGoBuildOrServe && target.options?.main) {
        const updatedMain = updateMainPath(
          target.options.main,
          projectConfig.root
        );
        if (updatedMain !== target.options.main) {
          target.options.main = updatedMain;
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      updateProjectConfiguration(tree, projectName, projectConfig);
    }
  }

  await formatFiles(tree);
}

/**
 * Updates a main path to be relative to the project root.
 *
 * @param mainPath the current main path
 * @param projectRoot the project root path
 * @returns the updated main path relative to the project root
 */
function updateMainPath(mainPath: string, projectRoot: string): string {
  // Replace {projectRoot} placeholder
  let normalizedPath = mainPath.replace('{projectRoot}/', '');

  // If the path starts with the project root, remove it
  if (projectRoot && normalizedPath.startsWith(projectRoot + '/')) {
    normalizedPath = normalizedPath.substring(projectRoot.length + 1);
  }

  // Handle edge case where project root is empty (workspace root)
  if (projectRoot === '' && normalizedPath.includes('/')) {
    // For workspace root projects, just get the filename
    normalizedPath = normalizedPath.split('/').at(-1);
  }

  return normalizedPath;
}
