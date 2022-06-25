/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tree } from '@nrwl/devkit'
import { ensureGoModDependency } from '../../utils/ensureGoModDependency'
import { GO_MOD_FILE } from '../../utils/constants'

export default function update(host: Tree) {
  if (host.exists(GO_MOD_FILE)) {
    ensureGoModDependency(host)
  }
}
