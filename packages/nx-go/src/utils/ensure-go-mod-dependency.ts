import { readNxJson, Tree, updateNxJson } from '@nx/devkit'
import { GO_MOD_FILE } from './constants'

/**
 * Ensures that go.mod is included as a sharedGlobal, so that changes to go.mod triggers
 * projects to be flagged as affected
 */
export function ensureGoModDependency(tree: Tree) {
  if (!tree.exists(GO_MOD_FILE)) {
    return
  }

  const goModSharedGlobalsEntry = `{workspaceRoot}/${GO_MOD_FILE}`
  const workspaceConfig = readNxJson(tree)

  const namedInputs = workspaceConfig.namedInputs
  if (!(namedInputs?.['sharedGlobals'] ?? []).find((dep) => dep === goModSharedGlobalsEntry)) {
    workspaceConfig.namedInputs = {
      ...namedInputs,
      sharedGlobals: [...(namedInputs?.['sharedGlobals'] ?? []), goModSharedGlobalsEntry],
    }
    updateNxJson(tree, workspaceConfig)
  }
}
