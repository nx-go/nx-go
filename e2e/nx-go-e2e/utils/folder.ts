import { copyFileSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs'
import { join } from 'path'

const removeDirectory = (dirPath: string) => {
  const names = readdirSync(dirPath)
  for (const name of names) {
    const fpath = join(dirPath, name)
    const stat = statSync(fpath)
    if (stat.isDirectory()) {
      removeDirectory(fpath)
    } else {
      unlinkSync(fpath)
    }
  }
  unlinkSync(dirPath)
}

const copyDirectory = (src: string, dest: string) => {
  mkdirSync(dest)
  const names = readdirSync(src)
  for (const name of names) {
    const srcPath = join(src, name)
    const stat = statSync(srcPath)
    if (stat.isDirectory()) {
      copyDirectory(srcPath, join(dest, name))
    } else {
      copyFileSync(srcPath, join(dest, name))
    }
  }
}
