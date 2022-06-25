import { getGoVersion, isVersionAfter } from './go-version'

export const canUseWokspaces = () => {
  const version = getGoVersion()
  return isVersionAfter(version, '1.18')
}
