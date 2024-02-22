import type { CreateNodes } from '@nx/devkit';
import { dirname } from 'path';
import { GO_MOD_FILE } from '../constants';

export const createNodes: CreateNodes = [
  `**/${GO_MOD_FILE}`,
  (file) => {
    const root = dirname(file);
    const parts = root.split(/[/\\]/g);
    const name = parts[parts.length - 1].toLowerCase();

    // We cannot create nodes if go.mod is in the workspace root folder
    // in this case we let Nx use project.json files (by default)
    if (root === '.') {
      return {};
    }

    return {
      projects: {
        [name]: {
          name,
          root,
          // TODO provide default targets for non-project.json workspaces
          targets: {},
        },
      },
    };
  },
];
