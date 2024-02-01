import { GeneratorSchema } from '../shared';

export interface LibraryGeneratorSchema extends GeneratorSchema {
  skipGoMod?: boolean;
}
