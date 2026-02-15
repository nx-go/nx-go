import type { NxPluginV2 } from '@nx/devkit';
import { createDependencies } from './graph/create-dependencies';
import { createNodesV2 } from './graph/create-nodes-v2';
import type { NxGoPluginOptions } from './type';

const plugin: NxPluginV2<NxGoPluginOptions> = {
  name: '@nx-go/nx-go',
  createDependencies,
  createNodesV2,
};

export = plugin;
