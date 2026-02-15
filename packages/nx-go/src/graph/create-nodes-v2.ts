import {
  type CreateNodesContextV2,
  createNodesFromFiles,
  type CreateNodesResult,
  type CreateNodesResultV2,
  type CreateNodesV2,
  type ProjectType,
} from '@nx/devkit';
import { dirname } from 'node:path';
import { GO_MOD_FILE } from '../constants';
import type { NxGoPluginNodeOptions, NxGoPluginOptions } from '../type';
import { generateTargets } from './create-nodes/generate-targets';
import { hasMainPackage } from './create-nodes/has-main-package';

export const createNodesV2: CreateNodesV2<NxGoPluginOptions> = [
  `**/${GO_MOD_FILE}`,
  async (
    configFiles: readonly string[],
    options: NxGoPluginOptions | undefined,
    context: CreateNodesContextV2
  ): Promise<CreateNodesResultV2> =>
    createNodesFromFiles(
      (configFile, options = {}, context) =>
        createNodesInternal(configFile, normalizeOptions(options), context),
      configFiles,
      options ?? {},
      context
    ),
];

const normalizeOptions = (
  options: NxGoPluginOptions
): NxGoPluginNodeOptions => ({
  buildTargetName: options.buildTargetName ?? 'build',
  serveTargetName: options.serveTargetName ?? 'serve',
  testTargetName: options.testTargetName ?? 'test',
  lintTargetName: options.lintTargetName ?? 'lint',
  tidyTargetName: options.tidyTargetName ?? 'tidy',
  generateTargetName: options.generateTargetName ?? 'generate',
});

const createNodesInternal = async (
  configFilePath: string,
  options: NxGoPluginNodeOptions,
  context: CreateNodesContextV2
): Promise<CreateNodesResult> => {
  const projectRoot = dirname(configFilePath);

  // We assume that the project name is derived from the project root folder name
  // If needed, the user can still rename the project in the configuration file (project.json)
  const projectName =
    projectRoot === '.' ? undefined : projectRoot.split(/[/\\]/).pop();

  // Check if project is an application (has package main) or a library
  const isApplication = hasMainPackage(
    context.workspaceRoot,
    projectRoot,
    projectName
  );
  const projectType: ProjectType = isApplication ? 'application' : 'library';

  return {
    projects: {
      [projectRoot]: {
        root: projectRoot,
        name: projectName,
        projectType,
        targets: generateTargets(options, isApplication),
      },
    },
  };
};
