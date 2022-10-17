import { getGoVersion, isVersionAfter } from './go-version'

export function canUseGoWork() {
  const version = getGoVersion()
  return isVersionAfter(version, '1.18')
}
