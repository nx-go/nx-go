import { Tree } from '@nrwl/devkit'
import { GO_MOD_FILE, GO_WORK_FILE } from './constants'

export function shouldUseGoWork(tree: Tree, option: boolean) {
  if (tree.exists(GO_WORK_FILE)) {
    return true
  }
  if (tree.exists(GO_MOD_FILE)) {
    return false
  }
  return option
}
