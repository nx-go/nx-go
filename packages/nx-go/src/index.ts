import type { NxPlugin } from '@nx/devkit';
import { createDependencies } from './graph/create-dependencies';
import { createNodes } from './graph/create-nodes';
import type { NxGoPluginOptions } from './type';

const plugin: NxPlugin<NxGoPluginOptions> = {
  name: '@nx-go/nx-go',
  createDependencies,
  createNodes,
};

export = plugin;
