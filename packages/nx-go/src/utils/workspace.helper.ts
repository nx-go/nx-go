import { getGoVersion, isVersionAfter } from './go-version'

export const canUseWorkspaces = () => {
  const version = getGoVersion()
  return isVersionAfter(version, '1.18')
}
