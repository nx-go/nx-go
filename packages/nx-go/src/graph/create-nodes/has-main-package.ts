import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PACKAGE_MAIN_REGEX = /^[ \t]*package[ \t]+main\b/m;
const popularMainFiles = ['main.go', 'cmd.go', 'app.go', 'server.go'];

/**
 * Checks if a file contains "package main" declaration
 *
 * @param filePath - The path to the Go source file
 * @return boolean - True if the file contains "package main", false otherwise
 */
const fileHasMainPackage = (filePath: string): boolean => {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return PACKAGE_MAIN_REGEX.test(content);
  } catch {
    return false;
  }
};

/**
 * Determines if a given project root contains a main package
 * by checking for common Go source files that declare "package main".
 *
 * @param workspaceRoot - The root directory of the workspace
 * @param projectRoot - The relative path to the project from the workspace root
 * @param projectName - The name of the project, used to check for {projectName}.go file
 * @return boolean - True if the project contains a main package, false otherwise
 */
export const hasMainPackage = (
  workspaceRoot: string,
  projectRoot: string,
  projectName: string | undefined
): boolean => {
  const projectPath = join(workspaceRoot, projectRoot);

  if (!existsSync(projectPath)) {
    return false;
  }

  // Check common patterns for main packages
  const commonPatterns = [
    ...popularMainFiles,
    ...(projectName ? [`${projectName}.go`, `cmd/${projectName}/main.go`] : []),
  ];

  for (const pattern of commonPatterns) {
    const filePath = join(projectPath, pattern);
    if (existsSync(filePath) && fileHasMainPackage(filePath)) {
      return true;
    }
  }

  return false;
};
