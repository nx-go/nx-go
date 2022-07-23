import { ProjectGraph, ProjectGraphBuilder, ProjectGraphProcessorContext } from '@nrwl/devkit'
import { basename, dirname, extname } from 'path'
import { execSync } from 'child_process'
import { findNxWorkspaceRootPath } from '../utils/find-workspace-root-path'

export const processProjectGraph = (graph: ProjectGraph, context: ProjectGraphProcessorContext) => {
  const workspaceRootPath = findNxWorkspaceRootPath()
  const goModules = getGoModules(workspaceRootPath)

  const projectRootLookupMap: Map<string, string> = new Map()
  for (const projectName in graph.nodes) {
    projectRootLookupMap.set(graph.nodes[projectName].data.root, projectName)
  }

  const builder = new ProjectGraphBuilder(graph)
  // Define dependencies using the context of files that were changed to minimize work
  // between each run.
  for (const projectName in context.filesToProcess) {
    context.filesToProcess[projectName]
      .filter((f) => extname(f.file) === '.go')
      .map(({ file }) => ({
        projectName,
        file,
        dependencies: getGoDependencies(workspaceRootPath, goModules, projectRootLookupMap, file),
      }))
      .filter((data) => data.dependencies && data.dependencies.length > 0)
      .forEach(({ projectName, file, dependencies }) =>
        dependencies.forEach((dependency) => builder.addExplicitDependency(projectName, file, dependency)),
      )
  }

  return builder.getUpdatedProjectGraph()
}

/**
 * getGoDependencies will use `go list` to get dependency information from a go file
 * @param workspaceRootPath
 * @param goModules
 * @param projectRootLookup
 * @param file
 * @returns
 */
const getGoDependencies = (
  workspaceRootPath: string,
  goModules: GoModule[],
  projectRootLookup: Map<string, string>,
  file: string,
) => {
  try {
    const goPackageDataJson = execSync('go list -json ./' + file, { encoding: 'utf-8', cwd: workspaceRootPath })
    const goPackage: GoPackage = JSON.parse(goPackageDataJson)
    const isTestFile = basename(file, '.go').endsWith('_test')

    // Use the correct imports list even if the file is a test file.
    const listOfImports = (!isTestFile ? goPackage.Imports : goPackage.TestImports) ?? []

    return listOfImports
      .map((goImport) => ({ goImport, goModule: goModules.find((m) => goImport.startsWith(m.Path)) }))
      .filter((importInfo) => importInfo.goModule)
      .map(({ goImport, goModule }) =>
        getProjectNameForGoImport(workspaceRootPath, goImport, goModule, projectRootLookup),
      )
      .filter((projectName) => projectName)
  } catch (ex) {
    console.error(`Error processing ${file}`)
    console.error(ex)
    return [] // Return an empty array so that we can process other files
  }
}
/**
 * Parses go modules in a way that work with Go workspaces if they are used.
 * @param workspaceRootPath
 */
const getGoModules = (workspaceRootPath: string): GoModule[] => {
  const goModuleJSON = execSync('go list -m -json', { encoding: 'utf-8', cwd: workspaceRootPath })

  // Sort and reverse the modules so when looking up a go import we will encounter the most specific path first
  return goModuleJSON
    .split('}')
    .filter((block) => block.trim().length > 0)
    .map((toParse) => JSON.parse(toParse + '}'))
    .sort((a, b) => a.Path.localeCompare(b.Path))
    .reverse()
}
/**
 * Gets the project name for the go import by getting the relative path for the import with in the go module system
 * then uses that to calculate the relative path on disk and looks up which project in the workspace the import is a part
 * of.
 * @param workspaceRootPath
 * @param importPath
 * @param module
 * @param projectRootLookup
 */
const getProjectNameForGoImport = (
  workspaceRootPath: string,
  importPath: string,
  module: GoModule,
  projectRootLookup: Map<string, string>,
) => {
  const relativeImportPath = importPath.substring(module.Path.length + 1)
  const relativeModuleDir = module.Dir.substring(workspaceRootPath.length + 1)
  let projectPath = relativeModuleDir ? relativeModuleDir + '/' + relativeImportPath : relativeImportPath
  while (projectPath !== '.') {
    if (projectPath.endsWith('/')) {
      projectPath = projectPath.slice(0, -1)
    }

    const projectName = projectRootLookup.get(projectPath)
    if (projectName) {
      return projectName
    }
    projectPath = dirname(projectPath)
  }
  return null
}

/**
 * GoPackage shape needed by the code
 */
interface GoPackage {
  Deps?: string[]
  Module?: {
    Path?: string
  }
  Imports?: string[]
  TestImports?: string[]
}

interface GoModule {
  Path: string
  Dir: string
}
