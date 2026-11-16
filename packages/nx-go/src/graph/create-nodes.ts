import {
  createNodesFromFiles,
  type CreateNodesContext,
  type CreateNodesResult,
  type CreateNodesResultArray,
  type CreateNodes,
  type ProjectType,
} from '@nx/devkit';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { GO_MOD_FILE } from '../constants';
import type { NxGoPluginNodeOptions, NxGoPluginOptions } from '../type';
import { shouldCreateAirTarget, shouldUseReviveLinter } from '../utils';
import {
  findTestDependencies,
  readGoModules,
  type GoModule,
} from './create-nodes/find-test-dependencies';
import {
  generateTargets,
  type DetectedTools,
} from './create-nodes/generate-targets';
import { hasMainPackage } from './create-nodes/has-main-package';

export const createNodes: CreateNodes<NxGoPluginOptions> = [
  `**/${GO_MOD_FILE}`,
  async (
    configFiles: readonly string[],
    options: NxGoPluginOptions | undefined,
    context: CreateNodesContext,
  ): Promise<CreateNodesResultArray> => {
    const goModules = options?.testDependenciesAsInputs
      ? readGoModules(context.workspaceRoot, configFiles)
      : [];

    return createNodesFromFiles(
      (configFile, options = {}, context) =>
        createNodesInternal(
          configFile,
          normalizeOptions(options),
          context,
          goModules,
        ),
      configFiles,
      options ?? {},
      context,
    );
  },
];

const normalizeOptions = (
  options: NxGoPluginOptions,
): NxGoPluginNodeOptions => ({
  testDependenciesAsInputs: options.testDependenciesAsInputs ?? false,
  buildTargetName: options.buildTargetName ?? 'build',
  serveTargetName: options.serveTargetName ?? 'serve',
  serveAirTargetName: options.serveAirTargetName ?? 'serve:air',
  testTargetName: options.testTargetName ?? 'test',
  lintTargetName: options.lintTargetName ?? 'lint',
  tidyTargetName: options.tidyTargetName ?? 'tidy',
  generateTargetName: options.generateTargetName ?? 'generate',
});

const createNodesInternal = async (
  configFilePath: string,
  options: NxGoPluginNodeOptions,
  context: CreateNodesContext,
  goModules: GoModule[],
): Promise<CreateNodesResult> => {
  const projectRoot = dirname(configFilePath);

  // Skip creating a project if this is the workspace root and it doesn't have a project.json file
  // This prevents unnecessary project creation in single-module repositories
  if (
    projectRoot === '.' &&
    !existsSync(join(context.workspaceRoot, 'project.json'))
  ) {
    return { projects: {} };
  }

  // We assume that the project name is derived from the project root folder name
  // If needed, the user can still rename the project in the configuration file (project.json)
  const projectName =
    projectRoot === '.' ? undefined : projectRoot.split(/[/\\]/).pop();

  // Check if project is an application (has package main) or a library
  const isApplication = hasMainPackage(
    context.workspaceRoot,
    projectRoot,
    projectName,
  );
  const projectType: ProjectType = isApplication ? 'application' : 'library';

  const detectedTools: DetectedTools = {
    air:
      isApplication &&
      shouldCreateAirTarget(context.workspaceRoot, projectRoot),
    revive: shouldUseReviveLinter(context.workspaceRoot, projectRoot),
  };

  const testDependencies = options.testDependenciesAsInputs
    ? findTestDependencies(context.workspaceRoot, projectRoot, goModules)
    : [];

  return {
    projects: {
      [projectRoot]: {
        root: projectRoot,
        name: projectName,
        projectType,
        targets: generateTargets(
          options,
          isApplication,
          detectedTools,
          testDependencies,
        ),
      },
    },
  };
};
