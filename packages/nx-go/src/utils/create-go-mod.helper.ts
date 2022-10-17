import { Tree } from '@nrwl/devkit'
import { join } from 'path'
import { GO_MOD_FILE } from './constants'
import { ensureGoModDependency } from './ensure-go-mod-dependency'
import { NormalizedSchema } from './normalized-schema.interface'

export function createGoMod(tree: Tree, { skipGoMod, useGoWork, projectRoot, npmScope }: NormalizedSchema) {
  if (skipGoMod === false) {
    const filePath = useGoWork ? join(projectRoot, GO_MOD_FILE) : GO_MOD_FILE
    const moduleName = useGoWork ? projectRoot : npmScope

    if (!tree.exists(filePath)) {
      tree.write(filePath, `module ${moduleName}\n`)
    }
    if (!useGoWork) {
      ensureGoModDependency(tree)
    }
  }
}
