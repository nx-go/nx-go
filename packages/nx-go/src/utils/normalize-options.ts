import { names, ProjectType, Tree } from '@nx/devkit';
import {
  determineProjectNameAndRootOptions,
  ProjectNameAndRootFormat,
} from '@nx/devkit/src/generators/project-name-and-root-utils';

export interface GeneratorSchema {
  name: string;
  directory?: string;
  projectNameAndRootFormat?: ProjectNameAndRootFormat;
  tags?: string;
  skipFormat?: boolean;
}

export interface GeneratorNormalizedSchema extends GeneratorSchema {
  moduleName: string;
  projectName: string;
  projectRoot: string;
  projectType: ProjectType;
  parsedTags: string[];
}

export const normalizeOptions = async (
  tree: Tree,
  options: GeneratorSchema,
  projectType: ProjectType,
  generator: string
): Promise<GeneratorNormalizedSchema> => {
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
    moduleName: names(projectName).propertyName.toLowerCase(),
    projectNameAndRootFormat,
    projectName,
    projectRoot,
    projectType,
    parsedTags,
  };
};
