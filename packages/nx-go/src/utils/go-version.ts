import { execSync } from 'child_process'

const GO_VERSION_REGEX = /go(?<version>\S+) /

export const getGoVersion = () => {
  const versionCli = execSync('go version')
  return GO_VERSION_REGEX.exec(versionCli.toString()).groups.version
}

const versionAsNum = (version: string | undefined) => {
  return parseInt(version) || 0
}

export const isVersionAfter = (version: string, refVersion: string) => {
  const [sMajor, sMinor, sPatch] = version.split('.')
  const [sRefMajor, sRefMinor, sRefPatch] = refVersion.split('.')

  const major = versionAsNum(sMajor)
  const refMajor = versionAsNum(sRefMajor)

  if (major != refMajor) {
    return major > refMajor
  }

  const minor = versionAsNum(sMinor)
  const refMinor = versionAsNum(sRefMinor)

  if (minor != refMinor) {
    return minor > refMinor
  }

  const patch = versionAsNum(sPatch)
  const refPatch = versionAsNum(sRefPatch)

  return patch >= refPatch
}
