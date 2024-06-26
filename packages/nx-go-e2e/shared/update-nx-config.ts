import { updateFile } from '@nx/plugin/testing';
import { join } from 'path';

export const addNxTarget = (
  directory: string,
  target: string,
  targetConfig: object
): void =>
  updateFile(join(directory, 'project.json'), (content) => {
    const json = JSON.parse(content);
    json['targets'][target] = targetConfig;
    return JSON.stringify(json);
  });
