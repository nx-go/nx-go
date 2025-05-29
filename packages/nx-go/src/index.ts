import { NxPlugin } from '@nx/devkit';
import { createDependencies } from './graph/create-dependencies';
import { createNodesV2 } from './graph/create-nodes';

const plugin: NxPlugin = {
  name: '@nx-go/nx-go',
  createDependencies,
  createNodesV2,
};

export = plugin;
