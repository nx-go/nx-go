export interface BuildExecutorSchema {
  main: string;
  compiler?: 'go' | 'tinygo';
  outputPath?: string;
  buildMode?: string;
  env?: { [key: string]: string };
  flags?: string[];
}
