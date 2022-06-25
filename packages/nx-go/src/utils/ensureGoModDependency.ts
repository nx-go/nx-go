import { readWorkspaceConfiguration, Tree, updateWorkspaceConfiguration } from '@nrwl/devkit'
import { GO_MOD_FILE } from './constants'

/**
 * Ensures that go.mod is an implicit dependency so that changes to go.mod triggers
 * projects to be flagged as affected
 */
export const ensureGoModDependency = (tree: Tree) => {
  if (!tree.exists(GO_MOD_FILE)) {
    return
  }
  const workspaceConfig = readWorkspaceConfiguration(tree)
  const dependencies = workspaceConfig.implicitDependencies ?? {}
  if (!dependencies[GO_MOD_FILE]) {
    dependencies[GO_MOD_FILE] = '*'
    workspaceConfig.implicitDependencies = dependencies
    updateWorkspaceConfiguration(tree, workspaceConfig)
  }
}
