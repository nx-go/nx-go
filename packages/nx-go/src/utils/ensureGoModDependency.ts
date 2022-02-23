import { readWorkspaceConfiguration, Tree, updateWorkspaceConfiguration, WorkspaceConfiguration } from '@nrwl/devkit'

/**
 * Ensures that gp.mod is an implicit dependency so that changes to go.mod triggers
 * projects to be flagged as affeceted
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
