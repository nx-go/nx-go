import { createProjectGraphAsync, formatFiles, type Tree } from '@nx/devkit';
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
      },
      [
        {
          executors: ['@nx-go/nx-go:build'],
          postTargetTransformer: (target) => target,
          targetPluginOptionMapper: (target) => ({ buildTargetName: target }),
        },
        {
          executors: ['@nx-go/nx-go:serve'],
          postTargetTransformer: (target) => target,
          targetPluginOptionMapper: (target) => ({ serveTargetName: target }),
        },
        {
          executors: ['@nx-go/nx-go:test'],
          postTargetTransformer: (target) => target,
          targetPluginOptionMapper: (target) => ({ testTargetName: target }),
        },
        {
          executors: ['@nx-go/nx-go:lint'],
          postTargetTransformer: (target) => target,
          targetPluginOptionMapper: (target) => ({ lintTargetName: target }),
        },
        {
          executors: ['@nx-go/nx-go:tidy'],
          postTargetTransformer: (target) => target,
          targetPluginOptionMapper: (target) => ({ tidyTargetName: target }),
        },
      ],
      options.project
    );

  if (migratedProjects.size === 0) {
    throw new NoTargetsToMigrateError();
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}
