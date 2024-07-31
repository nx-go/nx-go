export interface TestExecutorSchema {
  cover?: boolean;
  coverProfile?: string;
  race?: boolean;
  run?: string;
  verbose?: boolean;
  count?: number;
  timeout?: string;
}
