import { names, ProjectType, readJson, Tree } from '@nx/devkit';
import {
  determineProjectNameAndRootOptions,
  ProjectNameAndRootFormat,
} from '@nx/devkit/src/generators/project-name-and-root-utils';

export interface GeneratorSchema {
  name: string;
  directory?: string;
  projectNameAndRootFormat?: ProjectNameAndRootFormat;
  tags?: string;
}

export interface GeneratorNormalizedSchema extends GeneratorSchema {
  npmScope: string;
  projectName: string;
  projectRoot: string;
  parsedTags: string[];
}

export const normalizeOptions = async (
  tree: Tree,
  options: GeneratorSchema,
  projectType: ProjectType,
  generator: string
): Promise<GeneratorNormalizedSchema> => {
  const { name: packageName } = readJson(tree, 'package.json');
  const { projectName, projectRoot, projectNameAndRootFormat } =
    await determineProjectNameAndRootOptions(tree, {
      name: options.name,
      projectType: projectType,
      directory: options.directory,
      projectNameAndRootFormat: options.projectNameAndRootFormat,
      callingGenerator: generator,
    });

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    name: names(options.name).fileName,
    npmScope: packageName.split('/')[0].replace('@', ''),
    projectNameAndRootFormat,
    projectName,
    projectRoot,
    parsedTags,
  };
};
