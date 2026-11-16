import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { GO_MOD_FILE } from '../../constants';
import { parseGoList, parseGoModulePath } from '../../utils';

const ignoredDirectories = ['vendor', 'testdata', 'node_modules'];

/**
 * A Go module of the workspace.
 */
export interface GoModule {
  /** The module path declared in its go.mod file. */
  path: string;
  /** The relative path to the module from the workspace root. */
  root: string;
}

/**
 * Reads the module path of each go.mod file of the workspace.
 *
 * @param workspaceRoot - The root directory of the workspace
 * @param goModFiles - The relative paths to the go.mod files from the workspace root
 * @return GoModule[] - The modules, the longest module paths first
 */
export const readGoModules = (
  workspaceRoot: string,
  goModFiles: readonly string[],
): GoModule[] =>
  goModFiles
    .map((file) => ({
      path: parseGoModulePath(readFileSync(join(workspaceRoot, file), 'utf-8')),
      root: dirname(file),
    }))
    .filter((module): module is GoModule => module.path != null)
    .sort((module1, module2) => module2.path.length - module1.path.length);

/**
 * Finds the directories of the workspace imported by the test files of a project,
 * with their parent directories as any of them can be the root of the imported project.
 * Nested modules are not visited, as well as directories ignored by the Go tool.
 *
 * @param workspaceRoot - The root directory of the workspace
 * @param projectRoot - The relative path to the project from the workspace root
 * @param modules - The Go modules of the workspace, the longest module paths first
 * @return string[] - The sorted relative paths to the directories from the workspace root
 */
export const findTestDependencies = (
  workspaceRoot: string,
  projectRoot: string,
  modules: GoModule[],
): string[] => {
  const directories = new Set<string>();

  const addImport = (goImport: string) => {
    const module = modules.find(
      ({ path }) => goImport === path || goImport.startsWith(`${path}/`),
    );
    if (module == null) {
      return;
    }

    let directory = join(module.root, goImport.substring(module.path.length))
      .replace(/\\/g, '/')
      .replace(/\/$/, '');
    while (directory !== '.' && directory !== projectRoot) {
      directories.add(directory);
      if (directory === module.root) {
        break;
      }
      directory = dirname(directory);
    }
  };

  const visit = (directory: string) => {
    const entries = readdirSync(join(workspaceRoot, directory), {
      withFileTypes: true,
    });
    if (
      directory !== projectRoot &&
      entries.some((entry) => entry.name === GO_MOD_FILE)
    ) {
      return;
    }

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('_test.go')) {
        const content = readFileSync(
          join(workspaceRoot, directory, entry.name),
          'utf-8',
        );
        parseGoList('import', content).forEach(addImport);
      } else if (
        entry.isDirectory() &&
        !ignoredDirectories.includes(entry.name) &&
        !/^[._]/.test(entry.name)
      ) {
        visit(directory === '.' ? entry.name : `${directory}/${entry.name}`);
      }
    }
  };

  visit(projectRoot);
  return [...directories].sort();
};
