import { type Tree } from '@nx/devkit';
import { execSync } from 'child_process';
import { join } from 'path';
import {
  GO_MOD_FILE,
  GO_WORK_FILE,
  GO_WORK_MINIMUM_VERSION,
} from '../constants';

const REGEXS = {
  /**
   * Regex patterns for parsing Go import statements.
   * @see https://go.dev/ref/spec#ImportPath
   */
  import: {
    single: /import\s+(?:[.\w]+\s+)?"([^"]+)"/g,
    block: /import\s+\(([\s\S]*?)\)/g,
    path: /(?:[.\w]+\s+)?"([^"]+)"/g,
  },
  /**
   * Regex patterns for parsing Go use directives in go.work files.
   * @see https://go.dev/ref/mod#go-work-file-use
   */
  use: {
    single: /use\s+(?!\()(\S+)/g,
    block: /use\s+\(([\s\S]*?)\)/g,
    path: /\S+/g,
    // Combined pattern for replacing entire use directive
    all: /use\s+(?:\([\s\S]*?\)|\S+)/g,
  },
  version: /go(?<version>\S+) /,
  versionDirective: /^go\s+(?<version>\d+\.\d+)/m,
} as const;

/**
 * Retrieves the current Go version using its CLI.
 * @todo: improve error handling of execSync
 */
export const getGoVersion = (): string => {
  const rawVersion = execSync('go version');
  if (rawVersion != null) {
    return REGEXS.version.exec(rawVersion.toString())!.groups!.version;
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
 * Gets the Go version to use for new go.mod files.
 * If go.work exists, uses its version. Otherwise, uses the installed Go version.
 *
 * @param tree the project tree
 * @returns The Go version to use (major.minor format)
 */
export const getGoVersionForNewMod = (tree: Tree): string => {
  if (tree.exists(GO_WORK_FILE)) {
    const goWorkContent = tree.read(GO_WORK_FILE)!.toString();
    const version =
      REGEXS.versionDirective.exec(goWorkContent)?.groups?.version;
    if (version) {
      return version;
    }
  }
  return getGoShortVersion();
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
 * Parses a Go list (also support list with only one item or multiple blocks).
 *
 * @param listType type of list to parse
 * @param content list to parse as a string
 */
export const parseGoList = (
  listType: 'import' | 'use',
  content: string
): string[] => {
  const patterns = REGEXS[listType];
  const paths: string[] = [];

  // Extract from single declarations
  for (const [, path] of content.matchAll(patterns.single)) {
    paths.push(path);
  }

  // Extract from block declarations
  for (const [, blockContent] of content.matchAll(patterns.block)) {
    for (const [single, group] of blockContent.matchAll(patterns.path)) {
      paths.push(group ?? single);
    }
  }

  return paths;
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
    const goVersion = getGoVersionForNewMod(tree);
    tree.write(filePath, `module ${name}\n\ngo ${goVersion}\n`);
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
  const goWorkContent = tree.read(GO_WORK_FILE)!.toString();
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

  // Remove all existing use blocks and append the new consolidated one
  const contentWithoutUse =
    exisitingModules.length > 0
      ? goWorkContent.replace(REGEXS.use.all, '')
      : goWorkContent;

  tree.write(GO_WORK_FILE, `${contentWithoutUse.trimEnd()}\n\n${use}\n`);
};
