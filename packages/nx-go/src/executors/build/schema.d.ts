export interface BuildExecutorSchema {
  main: string;
  outputPath?: string;
  env?: { [key: string]: string };
  flags?: string[];
}
