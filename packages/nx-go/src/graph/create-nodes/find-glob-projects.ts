import { minimatch } from 'minimatch';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { GO_MOD_FILE } from '../../constants';

const ignoredDirectories = ['vendor', 'testdata', 'node_modules'];

/**
 * A project found in the Go module located at the workspace root.
 */
export interface GlobProject {
  /** The relative path to the project from the workspace root. */
  root: string;
  /** Go packages left to the project when some of its directories are other projects. */
  packages?: string[];
}

/**
 * Finds the directories of the root Go module that match one of the glob patterns
 * and contain Go files. Nested modules are not visited, as well as directories ignored by the Go tool.
 *
 * @param workspaceRoot - The root directory of the workspace
 * @param patterns - The glob patterns, relative to the workspace root
 * @return GlobProject[] - The projects, nested ones first and the module itself last
 */
export const findGlobProjects = (
  workspaceRoot: string,
  patterns: string[],
): GlobProject[] => {
  const projects: GlobProject[] = [];

  const visit = (directory: string) => {
    const entries = readdirSync(join(workspaceRoot, directory), {
      withFileTypes: true,
    });
    const packages: string[] = [];
    let hasNestedProjects = false;

    if (
      directory !== '.' &&
      entries.some((entry) => entry.name === GO_MOD_FILE)
    ) {
      return { packages, hasNestedProjects };
    }
    if (entries.some((entry) => entry.isFile() && entry.name.endsWith('.go'))) {
      packages.push('.');
    }

    for (const { name } of entries.filter((entry) => entry.isDirectory())) {
      if (ignoredDirectories.includes(name) || /^[._]/.test(name)) {
        continue;
      }

      const nested = visit(directory === '.' ? name : `${directory}/${name}`);
      if (nested.hasNestedProjects) {
        hasNestedProjects = true;
        packages.push(
          ...nested.packages.map((path) =>
            path === '.' ? `./${name}` : `./${name}/${path.slice(2)}`,
          ),
        );
      } else if (nested.packages.length > 0) {
        packages.push(`./${name}/...`);
      }
    }

    const isProject =
      directory === '.' ||
      (packages.length > 0 &&
        patterns.some((pattern) => minimatch(directory, pattern)));
    if (isProject) {
      projects.push({
        root: directory,
        ...(hasNestedProjects ? { packages } : {}),
      });
    }
    return isProject
      ? { packages: [], hasNestedProjects: true }
      : { packages, hasNestedProjects };
  };

  visit('.');
  return projects;
};
