import { formatFiles, readWorkspaceConfiguration, Tree, updateWorkspaceConfiguration } from '@nrwl/devkit'

export default async function (tree: Tree) {
  const workspaceConfig = readWorkspaceConfiguration(tree)
  if (workspaceConfig.plugins?.includes('@nx-go/nx-go')) {
    return
  }
  if (workspaceConfig.plugins) {
    workspaceConfig.plugins.push('@nx-go/nx-go')
  } else {
    workspaceConfig.plugins = ['@nx-go/nx-go']
  }
  updateWorkspaceConfiguration(tree, workspaceConfig)
  await formatFiles(tree)
}
