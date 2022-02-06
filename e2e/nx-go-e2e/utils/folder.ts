import { directoryExists } from '@nrwl/nx-plugin/testing'
import { copyFileSync, mkdirSync, readdirSync, statSync, unlink, unlinkSync } from 'fs'
import { join } from 'path'

export const replaceFolder = (src: string, dest: string) => {
  if (directoryExists(dest)) {
    removeDirectory(dest)
  }
  copyDirectory(src, dest)
}

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
