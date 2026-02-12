import {
  createProjectGraphAsync,
  formatFiles,
  readNxJson,
  TargetConfiguration,
  updateNxJson,
  type Tree,
} from '@nx/devkit';
import {
  migrateProjectExecutorsToPlugin,
  NoTargetsToMigrateError,
} from '@nx/devkit/src/generators/plugin-migrations/executor-to-plugin-migrator';
import { createNodesV2 } from '../../graph/create-nodes-v2';
import type { NxGoPluginOptions } from '../../type';
import type { ConvertToInferredSchema } from './schema';

export default async function convertToInferredGenerator(
  tree: Tree,
  options: ConvertToInferredSchema
) {
  const projectGraph = await createProjectGraphAsync();

  const migratedProjects =
    await migrateProjectExecutorsToPlugin<NxGoPluginOptions>(
      tree,
      projectGraph,
      '@nx-go/nx-go',
      createNodesV2,
      {
        buildTargetName: 'build',
        serveTargetName: 'serve',
        testTargetName: 'test',
        lintTargetName: 'lint',
        tidyTargetName: 'tidy',
        generateTargetName: 'generate',
      },
      [
        {
          executors: ['@nx-go/nx-go:build'],
          postTargetTransformer,
          targetPluginOptionMapper: (target) => ({ buildTargetName: target }),
        },
        {
          executors: ['@nx-go/nx-go:serve'],
          postTargetTransformer,
          targetPluginOptionMapper: (target) => ({ serveTargetName: target }),
        },
        {
          executors: ['@nx-go/nx-go:test'],
          postTargetTransformer,
          targetPluginOptionMapper: (target) => ({ testTargetName: target }),
        },
        {
          executors: ['@nx-go/nx-go:lint'],
          postTargetTransformer,
          targetPluginOptionMapper: (target) => ({ lintTargetName: target }),
        },
        {
          executors: ['@nx-go/nx-go:tidy'],
          postTargetTransformer,
          targetPluginOptionMapper: (target) => ({ tidyTargetName: target }),
        },
        {
          executors: ['@nx-go/nx-go:generate'],
          postTargetTransformer,
          targetPluginOptionMapper: (target) => ({
            generateTargetName: target,
          }),
        },
      ],
      options.project
    );

  if (migratedProjects.size === 0) {
    throw new NoTargetsToMigrateError();
  }

  // Remove the old plugin reference from nx.json
  const nxJson = readNxJson(tree);
  const initialPluginCount = nxJson.plugins?.length ?? 0;
  nxJson.plugins = (nxJson.plugins ?? []).filter(
    (plugin) => plugin !== '@nx-go/nx-go'
  );
  if (initialPluginCount !== nxJson.plugins.length) {
    updateNxJson(tree, nxJson);
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

const postTargetTransformer = (target: TargetConfiguration) => {
  // If the target only had the 'golang' named input,
  // remove it to fall back to the default named inputs configuration
  if (target.inputs?.length === 1 && target.inputs[0] === 'golang') {
    delete target.inputs;
  }
  return target;
};
