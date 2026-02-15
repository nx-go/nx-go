import {
  formatFiles,
  getProjects,
  readNxJson,
  type Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  GO_MOD_FILE,
  GO_PROJECT_INPUTS,
  GO_WORK_FILE,
  NX_PLUGIN_NAME,
} from '../../constants';

/**
 * Adds target configurations for nx-go executors and removes Go files from sharedGlobals.
 *
 * This migration:
 * 1. Removes go.work and go.mod from sharedGlobals to prevent non-Go projects from being affected
 * 2. Adds golang named input if it doesn't exist
 * 3. Adds cache, inputs, and outputs configuration directly to project targets using @nx-go executors
 *
 * @param tree the project tree
 */
export default async function update(tree: Tree) {
  updateNamedInputs(tree);
  updateProjectTargetConfigurations(tree);

  await formatFiles(tree);
}

const updateNamedInputs = (tree: Tree) => {
  const nxJson = readNxJson(tree)!;
  let nxJsonUpdated = false;

  // Remove go.work and go.mod from sharedGlobals
  if (nxJson.namedInputs?.sharedGlobals) {
    const goWorkPattern = `{workspaceRoot}/${GO_WORK_FILE}`;
    const goModPattern = `{workspaceRoot}/${GO_MOD_FILE}`;
    const filtered = nxJson.namedInputs.sharedGlobals.filter(
      (item) => item !== goWorkPattern && item !== goModPattern
    );
    if (filtered.length !== nxJson.namedInputs.sharedGlobals.length) {
      nxJson.namedInputs.sharedGlobals = filtered;
      nxJsonUpdated = true;
    }
  }

  // Add golang named input if it doesn't exist
  if (!nxJson.namedInputs?.golang) {
    nxJson.namedInputs ??= {};
    nxJson.namedInputs.golang = GO_PROJECT_INPUTS;
    nxJsonUpdated = true;
  }

  if (nxJsonUpdated) {
    updateNxJson(tree, nxJson);
  }
};

const updateProjectTargetConfigurations = (tree: Tree) => {
  const projects = getProjects(tree);

  for (const [projectName, projectConfig] of projects) {
    let projectUpdated = false;

    for (const [, targetConfig] of Object.entries(
      projectConfig.targets ?? {}
    )) {
      if (targetConfig.executor?.startsWith(`${NX_PLUGIN_NAME}:`)) {
        const [, executorName] = targetConfig.executor.split(':');

        // Add cache if not already set (except for serve which is typically not cacheable)
        if (executorName !== 'serve' && targetConfig.cache === undefined) {
          targetConfig.cache = true;
          projectUpdated = true;
        }

        // Add inputs if not already set
        if (!targetConfig.inputs) {
          targetConfig.inputs = ['golang'];
          projectUpdated = true;
        }

        // Add specific outputs for build executor if not already set
        if (executorName === 'build' && !targetConfig.outputs) {
          targetConfig.outputs = ['{workspaceRoot}/dist/{projectRoot}*'];
          projectUpdated = true;
        }

        // Add specific outputs for tidy executor if not already set
        if (executorName === 'tidy' && !targetConfig.outputs) {
          targetConfig.outputs = [
            `{projectRoot}/${GO_MOD_FILE}`,
            '{projectRoot}/go.sum',
          ];
          projectUpdated = true;
        }

        // Add continuous config for serve executor if not already set
        if (executorName === 'serve' && targetConfig.continuous === undefined) {
          targetConfig.continuous = true;
          projectUpdated = true;
        }
      }
    }

    if (projectUpdated) {
      updateProjectConfiguration(tree, projectName, projectConfig);
    }
  }
};
