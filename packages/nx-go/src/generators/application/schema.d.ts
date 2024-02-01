import { GeneratorSchema } from '../shared';

export interface ApplicationGeneratorSchema extends GeneratorSchema {
  skipFormat?: boolean;
  skipGoMod?: boolean;
}
