export const GO_MOD_FILE = 'go.mod';
export const GO_WORK_FILE = 'go.work';
export const GO_WORK_MINIMUM_VERSION = '1.18';
export const NX_PLUGIN_NAME = '@nx-go/nx-go';

/**
 * Contains all files that are common inputs for Go projects.
 * Used in multiple targets (build, test, lint, tidy) to ensure proper caching and invalidation.
 */
export const GO_PROJECT_INPUTS = [
  '{projectRoot}/go.mod',
  '{projectRoot}/go.sum',
  '{projectRoot}/**/*.go',
  '{workspaceRoot}/go.mod',
  '{workspaceRoot}/go.sum',
  '{workspaceRoot}/go.work',
  '{workspaceRoot}/go.work.sum',
];

/**
 * Go files of the projects a project depends on.
 * Used in targets that compile them (build, test), so a change in a dependency invalidates their cache.
 */
export const GO_DEPENDENCIES_INPUTS = [
  { fileset: '{projectRoot}/**/*.go', dependencies: true },
  { fileset: '{projectRoot}/go.mod', dependencies: true },
];
