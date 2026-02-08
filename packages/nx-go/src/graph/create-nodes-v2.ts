import {
  CreateNodesContextV2,
  createNodesFromFiles,
  CreateNodesV2,
  ProjectType,
  type CreateNodesResultV2,
} from '@nx/devkit';
import { dirname } from 'node:path';
import { GO_MOD_FILE } from '../constants';
import { NxGoPluginOptions } from '../type';
import { generateTargets } from './create-nodes/generate-targets';
import { hasMainPackage } from './create-nodes/has-main-package';

export const createNodesV2: CreateNodesV2<NxGoPluginOptions> = [
  `**/${GO_MOD_FILE}`,
  async (
    configFiles: string[],
    options: NxGoPluginOptions | undefined,
    context: CreateNodesContextV2
  ): Promise<CreateNodesResultV2> =>
    createNodesFromFiles(
      (configFile, options, context) =>
        createNodesInternal(configFile, normalizeOptions(options), context),
      configFiles,
      options ?? {},
      context
    ),
];

const normalizeOptions = (options: NxGoPluginOptions) => ({
  buildTargetName: options.buildTargetName ?? 'build',
  serveTargetName: options.serveTargetName ?? 'serve',
  testTargetName: options.testTargetName ?? 'test',
  lintTargetName: options.lintTargetName ?? 'lint',
  tidyTargetName: options.tidyTargetName ?? 'tidy',
});

const createNodesInternal = async (
  configFilePath: string,
  options: NxGoPluginOptions,
  context: CreateNodesContextV2
) => {
  const projectRoot = dirname(configFilePath);

  // We assume that the project name is derived from the project root folder name
  // If needed, the user can still rename the project in the configuration file (project.json)
  const projectName = projectRoot.split(/[/\\]/).pop();

  // We cannot create nodes if go.mod is in the workspace root folder
  // in this case we let Nx use project.json files (by default)
  if (projectRoot === '.') {
    return {};
  }

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
        name: projectName,
        projectType,
        targets: generateTargets(options, isApplication),
      },
    },
  };
};
