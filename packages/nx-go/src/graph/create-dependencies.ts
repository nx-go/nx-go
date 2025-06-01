import {
  CreateDependencies,
  CreateDependenciesContext,
  DependencyType,
  FileData,
  RawProjectGraphDependency,
  workspaceRoot,
} from '@nx/devkit';
import { readFileSync } from 'fs';
import { dirname, extname } from 'path';
import type { NxGoPluginOptions } from '../type';
import { getGoModules, parseGoList } from '../utils';

type ProjectRootMap = Map<string, string>;

interface GoModule {
  Path: string;
  Dir: string;
}

interface GoImportWithModule {
  import: string;
  module: GoModule;
}

/**
 * Computes a list of go modules.
 *
 * @param failSilently if true, the function will not throw an error if it fails
 */
const computeGoModules = (failSilently = false): GoModule[] => {
  const blocks = getGoModules(workspaceRoot, failSilently);
  if (blocks != null) {
    return blocks
      .split('}')
      .filter((block) => block.trim().length > 0)
      .map((block) => JSON.parse(`${block}}`) as GoModule)
      .sort((module1, module2) => module1.Path.localeCompare(module2.Path))
      .reverse();
  }
  throw new Error('Cannot get list of Go modules');
};

/**
 * Extracts a map of project root to project name based on context.
 *
 * @param context the Nx graph context
 */
const extractProjectRootMap = (
  context: CreateDependenciesContext
): ProjectRootMap =>
  Object.keys(context.projects).reduce((map, name) => {
    map.set(context.projects[name].root, name);
    return map;
  }, new Map<string, string>());

/**
 * Gets a list of go imports with associated module in the file.
 *
 * @param fileData file object computed by Nx
 * @param modules list of go modules
 */
const getFileModuleImports = (
  fileData: FileData,
  modules: GoModule[]
): GoImportWithModule[] => {
  const content = readFileSync(fileData.file, 'utf-8')?.toString();
  if (content == null) {
    return [];
  }
  return parseGoList('import', content)
    .map((item) => (item.includes('"') ? item.split('"')[1] : item))
    .filter((item) => item != null)
    .map((item) => ({
      import: item,
      module: modules.find((mod) => item.startsWith(mod.Path)),
    }))
    .filter((item) => item.module);
};

/**
 * Gets the project name for the go import by getting the relative path for the import with in the go module system
 * then uses that to calculate the relative path on disk and looks up which project in the workspace the import is a part
 * of.
 *
 * @param projectRootMap map with project roots in the workspace
 * @param import the go import
 * @param module the go module
 */
const getProjectNameForGoImport = (
  projectRootMap: ProjectRootMap,
  { import: goImport, module }: GoImportWithModule
): string | null => {
  const relativeImportPath = goImport.substring(module.Path.length + 1);
  const relativeModuleDir = module.Dir.substring(
    workspaceRoot.length + 1
  ).replace(/\\/g, '/');
  let projectPath = relativeModuleDir
    ? `${relativeModuleDir}/${relativeImportPath}`
    : relativeImportPath;

  while (projectPath !== '.') {
    if (projectPath.endsWith('/')) {
      projectPath = projectPath.slice(0, -1);
    }

    const projectName = projectRootMap.get(projectPath);
    if (projectName) {
      return projectName;
    }
    projectPath = dirname(projectPath);
  }
  return null;
};

export const createDependencies: CreateDependencies<NxGoPluginOptions> = async (
  options,
  context
) => {
  const dependencies: RawProjectGraphDependency[] = [];

  let goModules: GoModule[] = null;
  let projectRootMap: ProjectRootMap = null;

  for (const projectName in context.filesToProcess.projectFileMap) {
    const files = context.filesToProcess.projectFileMap[projectName].filter(
      (file) => extname(file.file) === '.go'
    );

    if (files.length > 0 && goModules == null) {
      goModules = computeGoModules(options?.skipGoDependencyCheck);
      projectRootMap = extractProjectRootMap(context);
    }

    for (const file of files) {
      dependencies.push(
        ...getFileModuleImports(file, goModules)
          .map((goImport) =>
            getProjectNameForGoImport(projectRootMap, goImport)
          )
          .filter((target) => target != null)
          .map((target) => ({
            type: DependencyType.static,
            source: projectName,
            target: target,
            sourceFile: file.file,
          }))
      );
    }
  }
  return dependencies;
};
