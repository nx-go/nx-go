/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tree } from '@nrwl/devkit'
import { ensureGoModDependency } from '../../utils/ensureGoModDependency'

export default function update(host: Tree) {
  ensureGoModDependency(host)
}
