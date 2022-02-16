import { ProjectGraph, ProjectGraphBuilder, ProjectGraphProcessorContext } from '@nrwl/devkit'
import { basename, extname } from 'path'
import { execSync } from 'child_process'
import { findNxWorkspaceRootPath } from '../utils/find-workspace-root-path'

export const processProjectGraph = (graph: ProjectGraph, context: ProjectGraphProcessorContext) => {
  const workspaceRootPath = findNxWorkspaceRootPath()

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
        dependencies: getGoDependencies(workspaceRootPath, projectRootLookupMap, file),
      }))
      .filter((data) => data.dependencies && data.dependencies.length > 0)
      .forEach(({ projectName, file, dependencies }) => {
        for (const dependency of dependencies) {
          builder.addExplicitDependency(projectName, file, dependency)
        }
      })
  }

  return builder.getUpdatedProjectGraph()
}

/**
 * getGoDependencies will use `go list` to get dependency information from a go file
 * @param projectRootLookup
 * @param file
 * @returns
 */
const getGoDependencies = (workspaceRootPath: string, projectRootLookup: Map<string, string>, file: string) => {
  const goPackageDataJson = execSync('go list -json ./' + file, { encoding: 'utf-8', cwd: workspaceRootPath })
  const goPackage: GoPackage = JSON.parse(goPackageDataJson)
  const isTestFile = basename(file, '.go').endsWith('_test')

  // Use the correct imports list depending if the file is a test file.
  const listOfImports = (!isTestFile ? goPackage.Imports : goPackage.TestImports) ?? []

  return listOfImports
    .filter((d) => d.startsWith(goPackage.Module.Path))
    .map((d) => d.substring(goPackage.Module.Path.length + 1))
    .map((rootDir) => projectRootLookup.get(rootDir))
    .filter((projectName) => projectName)
}

/**
 * GoPackage shape needed by the code
 */
interface GoPackage {
  Deps?: string[]
  Module: {
    Path: string
  }
  Imports?: string[]
  TestImports?: string[]
}
