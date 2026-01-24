import { names, ProjectType, Tree } from '@nx/devkit';
import { determineProjectNameAndRootOptions } from '@nx/devkit/src/generators/project-name-and-root-utils';

export interface GeneratorSchema {
  /**
   * TODO major: this property is optional in Nx 20
   */
  name: string;
  /**
   * TODO major: this property is provided by default in Nx 20
   */
  directory?: string;
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
  projectType: ProjectType
): Promise<GeneratorNormalizedSchema> => {
  const { projectName, projectRoot } = await determineProjectNameAndRootOptions(
    tree,
    {
      name: options.name,
      projectType: projectType,
      directory: options.directory,
    }
  );

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    name: names(options.name).fileName,
    moduleName: names(projectName).propertyName.toLowerCase(),
    projectName,
    projectRoot,
    projectType,
    parsedTags,
  };
};
