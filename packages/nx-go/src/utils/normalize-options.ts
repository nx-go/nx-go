import { names, NX_VERSION, ProjectType, Tree } from '@nx/devkit';
import {
  determineProjectNameAndRootOptions,
  ProjectNameAndRootFormat,
} from '@nx/devkit/src/generators/project-name-and-root-utils';

export interface GeneratorSchema {
  /**
   * TODO major: this property is optional in Nx 20
   */
  name: string;
  /**
   * TODO major: this property is provided by default in Nx 20
   */
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
  ensureProjectDirectory(options);

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

const ensureProjectDirectory = (options: GeneratorSchema) => {
  // Nx 20 BREAKING CHANGE: `directory` is now mandatory and `name` is optional
  if (NX_VERSION.startsWith('20') && options.directory === undefined) {
    options.directory = options.name;
  }
};
