import { names, NX_VERSION, ProjectType, Tree } from '@nx/devkit';
import {
  determineProjectNameAndRootOptions,
  ProjectNameAndRootFormat,
} from '@nx/devkit/src/generators/project-name-and-root-utils';

export interface GeneratorSchema {
  name: string;
  directory?: string;
  /**
   * Removed in Nx 20, to be removed in next major
   */
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
      ...buildNameAndDirectoryOptions(options),
      projectType: projectType,
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

const buildNameAndDirectoryOptions = ({
  name,
  directory,
}: GeneratorSchema): { name: string; directory: string } => {
  const isNx20 = NX_VERSION?.startsWith('20.');
  // swap name and directory with Nx 20+ due to a breaking change in the CLI
  // should be removed in the next major release of the plugin
  return isNx20 ? { name: directory, directory: name } : { name, directory };
};
