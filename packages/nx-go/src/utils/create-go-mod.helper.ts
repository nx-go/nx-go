import { Tree } from '@nrwl/devkit'
import { ensureGoModDependency } from './ensureGoModDependency'
import { NormalizedSchema } from './normalized-schema.interface'
import * as path from 'path'
import { GO_MOD_FILE } from './constants'

export function createGoMod(tree: Tree, { skipGoMod, useGoWork, projectRoot, npmScope }: NormalizedSchema) {
  if (skipGoMod === false) {
    const filePath = useGoWork ? path.join(projectRoot, GO_MOD_FILE) : GO_MOD_FILE
    const moduleName = useGoWork ? projectRoot : npmScope

    if (!tree.exists(filePath)) {
      tree.write(filePath, `module ${moduleName}\n`)
    }
    if (!useGoWork) {
      ensureGoModDependency(tree)
    }
  }
}
