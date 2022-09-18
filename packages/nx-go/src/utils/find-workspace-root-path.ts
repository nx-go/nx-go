import { existsSync } from 'fs'
import { dirname, join } from 'path'

/**
 * Finds the absolute path for the root path of the workspace.
 *
 * This is useful when modules are executed from Nx processes in the node_modules
 * folder like when running as a graph plugin
 */
export function findNxWorkspaceRootPath() {
  let workingDirectory = process.cwd()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (existsSync(join(workingDirectory, 'nx.json'))) {
      return workingDirectory
    } else if (workingDirectory === dirname(workingDirectory)) {
      throw new Error('At the root of the filesystem')
    }
    workingDirectory = dirname(workingDirectory)
  }
}
