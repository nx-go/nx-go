import type { Tree } from '@nx/devkit';
import { execSync } from 'child_process';
import { join } from 'path';
import {
  GO_MOD_FILE,
  GO_WORK_FILE,
  GO_WORK_MINIMUM_VERSION,
} from '../../constants';

const GO_VERSION_REGEX = /go(?<version>\S+) /;
const GO_USE_REGEX = /use\s+(\(([^)]*)\)|(\S*))/;

/**
 * Retrieves the current Go version using its CLI.
 */
export const getGoVersion = (): string => {
  const rawVersion = execSync('go version');
  if (rawVersion != null) {
    return GO_VERSION_REGEX.exec(rawVersion.toString()).groups.version;
  }
  throw new Error('Cannot retrieve current Go version');
};

/**
 * Checks if the current Go version supports workspaces.
 */
export const supportsGoWorkspace = (): boolean => {
  const toNumbers = (s: string) => s.split('.').map((v) => parseInt(v) || 0);
  const [major, minor] = toNumbers(getGoVersion());
  const [miniMajor, miniMinor] = toNumbers(GO_WORK_MINIMUM_VERSION);
  return major > miniMajor || (major === miniMajor && minor >= miniMinor);
};

/**
 * Checks if the current project uses a Go multi-modules workspace.
 *
 * @param tree the project tree
 */
export const isGoWorkspace = (tree: Tree): boolean => tree.exists(GO_WORK_FILE);

/**
 * Creates a go.mod file in the project.
 *
 * @param tree the project tree
 * @param name the module name
 * @param folder the project folder
 */
export const createGoMod = (
  tree: Tree,
  name: string,
  folder?: string
): void => {
  const filePath = folder ? join(folder, GO_MOD_FILE) : GO_MOD_FILE;
  if (!tree.exists(filePath)) {
    tree.write(filePath, `module ${name}/${folder}\n\ngo ${getGoVersion()}\n`);
  }
};

/**
 * Creates a go.work file in the project.
 *
 * @param tree the project tree
 */
export const createGoWork = (tree: Tree): void => {
  if (!tree.exists(GO_WORK_FILE)) {
    tree.write(GO_WORK_FILE, `go ${getGoVersion()}\n`);
  }
};

/**
 * Adds a dependency to the go.work file.
 *
 * @param tree the project tree
 * @param projectRoot root of the dependency to add
 */
export const addGoWorkDependency = (tree: Tree, projectRoot: string): void => {
  const goWorkContent = tree.read(GO_WORK_FILE).toString();
  const useExec = GO_USE_REGEX.exec(goWorkContent);
  const exisitingModules =
    (useExec?.[2] ?? useExec?.[3])?.trim().split(/\s+/) ?? [];
  const modules = [
    ...new Set([...exisitingModules, `./${projectRoot}`]),
  ].sort();
  if (modules.every((m) => exisitingModules.includes(m))) {
    return;
  }

  const use =
    modules.length > 1
      ? `use (\n${modules.map((m) => `\t${m}\n`).join('')})`
      : `use ${modules[0]}`;

  tree.write(
    GO_WORK_FILE,
    useExec
      ? goWorkContent.replace(GO_USE_REGEX, use)
      : `${goWorkContent}\n${use}\n`
  );
};
