import { formatFiles, readNxJson, Tree, updateNxJson } from '@nx/devkit'

export default async function (tree: Tree) {
  const workspaceConfig = readNxJson(tree)
  if (workspaceConfig.plugins?.includes('@nx-go/nx-go')) {
    return
  }
  if (workspaceConfig.plugins) {
    workspaceConfig.plugins.push('@nx-go/nx-go')
  } else {
    workspaceConfig.plugins = ['@nx-go/nx-go']
  }
  updateNxJson(tree, workspaceConfig)
  await formatFiles(tree)
}
