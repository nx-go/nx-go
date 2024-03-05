export interface TestExecutorSchema {
  skipCover?: boolean;
  skipRace?: boolean;
  packages: string[];
  buildTags: string[];
  verbose: boolean;
}
