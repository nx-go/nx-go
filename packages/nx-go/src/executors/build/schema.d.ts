export interface BuildExecutorSchema {
  main: string;
  outputPath?: string;
  buildMode?: string;
  env?: { [key: string]: string };
  flags?: string[];
}
