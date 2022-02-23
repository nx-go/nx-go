export function toPosixPath(osSpecificPath: string) {
  return osSpecificPath.replace(/^[A-Z]:/, '').split('\\').join('/')
}
