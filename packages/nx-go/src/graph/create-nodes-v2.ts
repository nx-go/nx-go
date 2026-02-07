import { CreateNodesV2, type CreateNodesResultV2 } from '@nx/devkit';
import { dirname } from 'path';
import { GO_MOD_FILE } from '../constants';

export const createNodesV2: CreateNodesV2 = [
  `**/${GO_MOD_FILE}`,
  (files: string[]): CreateNodesResultV2 => {
    const toReturn = [];

    for (const file of files) {
      const root = dirname(file);
      const parts = root.split(/[/\\]/g);
      const name = parts[parts.length - 1].toLowerCase();

      // We cannot create nodes if go.mod is in the workspace root folder
      // in this case we let Nx use project.json files (by default)
      if (root === '.') {
        toReturn.push([file, {}]);
        return toReturn;
      }

      toReturn.push([
        file,
        {
          projects: {
            [name]: {
              name,
              root,
              // TODO provide default targets for non-project.json workspaces
              targets: {},
            },
          },
        },
      ]);
    }
    return toReturn;
  },
];
