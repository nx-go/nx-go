import { type Tree } from '@nx/devkit';
import { execSync } from 'child_process';
import { join } from 'path';
import {
  GO_MOD_FILE,
  GO_WORK_FILE,
  GO_WORK_MINIMUM_VERSION,
} from '../constants';

export type GoListType = 'import' | 'use';

const REGEXS: Record<GoListType | 'version', RegExp> = {
  import: /import\s+(?:(\w+)\s+)?"([^"]+)"|\(([\s\S]*?)\)/,
  use: /use\s+(\(([^)]*)\)|([^\n]*))/,
  version: /go(?<version>\S+) /,
};

/**
 * Retrieves the current Go version using its CLI.
 */
export const getGoVersion = (): string => {
  const rawVersion = execSync('go version');
  if (rawVersion != null) {
    return REGEXS.version.exec(rawVersion.toString()).groups.version;
  }
  throw new Error('Cannot retrieve current Go version');
};

/**
 * Retrieves the current Go version without the patch number.
 */
export const getGoShortVersion = (): string => {
  const [major, minor] = getGoVersion().split('.');
  return `${major}.${minor}`;
};

/**
 * Executes the `go list -m -json` command in the
 * specified directory and returns the output as a string.
 *
 * @param cwd the current working directory where the command should be executed.
 * @param failSilently if true, the function will return an empty string instead of throwing an error when the command fails.
 * @returns The output of the `go list -m -json` command as a string.
 * @throws Will throw an error if the command fails and `failSilently` is false.
 */
export const getGoModules = (cwd: string, failSilently: boolean): string => {
  try {
    return execSync('go list -m -json', {
      encoding: 'utf-8',
      cwd,
      stdio: ['ignore'],
      windowsHide: true,
    });
  } catch (error) {
    if (failSilently) {
      return '';
    } else {
      throw error;
    }
  }
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
 * Parses a Go list (also support list with only one item).
 *
 * @param listType type of list to parse
 * @param content list to parse as a string
 */
export const parseGoList = (
  listType: GoListType,
  content: string
): string[] => {
  const exec = REGEXS[listType].exec(content);
  return (
    (exec?.[2] ?? exec?.[3])
      ?.trim()
      .split(/\n+/)
      .map((line) => line.trim()) ?? []
  );
};

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
    tree.write(filePath, `module ${name}\n\ngo ${getGoShortVersion()}\n`);
  }
};

/**
 * Creates a go.work file in the project.
 *
 * @param tree the project tree
 */
export const createGoWork = (tree: Tree): void => {
  if (!tree.exists(GO_WORK_FILE)) {
    tree.write(GO_WORK_FILE, `go ${getGoShortVersion()}\n`);
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
  const exisitingModules = parseGoList('use', goWorkContent);
  const modules = [...new Set([...exisitingModules, `./${projectRoot}`])].sort(
    (m1, m2) => m1.localeCompare(m2)
  );
  if (modules.every((m) => exisitingModules.includes(m))) {
    return;
  }

  const use =
    modules.length > 1
      ? 'use (\n' + modules.map((m) => `\t${m}\n`).join('') + ')'
      : `use ${modules[0]}`;

  tree.write(
    GO_WORK_FILE,
    exisitingModules.length > 0
      ? goWorkContent.replace(REGEXS['use'], use)
      : `${goWorkContent}\n${use}\n`
  );
};
