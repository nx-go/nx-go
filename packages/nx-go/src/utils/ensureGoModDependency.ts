import { readWorkspaceConfiguration, Tree, updateWorkspaceConfiguration } from '@nrwl/devkit'

/**
 * Ensures that go.mod is an implicit dependency so that changes to go.mod triggers
 * projects to be flagged as affected
 */
export const ensureGoModDependency = (tree: Tree) => {
  if (!tree.exists('go.mod')) {
    return
  }
  const workspaceConfig = readWorkspaceConfiguration(tree)
  const dependencies = workspaceConfig.implicitDependencies ?? {}
  if (!dependencies['go.mod']) {
    dependencies['go.mod'] = '*'
    workspaceConfig.implicitDependencies = dependencies
    updateWorkspaceConfiguration(tree, workspaceConfig)
  }
}
