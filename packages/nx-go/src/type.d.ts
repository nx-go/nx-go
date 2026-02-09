export interface NxGoPluginOptions {
  /**
   * If true, the plugin will not require
   * to have Go installed to compute a Nx workspace graph.
   *
   * Be aware that if Go is not installed, the plugin will not be able
   * to detect dependencies between Go projects and this is source of misunderstanding.
   */
  skipGoDependencyCheck?: boolean;
  /**
   * Custom target name for the build target.
   * Default is 'build'.
   */
  buildTargetName?: string;
  /**
   * Custom target name for the serve target.
   * Default is 'serve'.
   */
  serveTargetName?: string;
  /**
   * Custom target name for the test target.
   * Default is 'test'.
   */
  testTargetName?: string;
  /**
   * Custom target name for the lint target.
   * Default is 'lint'.
   */
  lintTargetName?: string;
  /**
   * Custom target name for the tidy target.
   * Default is 'tidy'.
   */
  tidyTargetName?: string;
  /**
   * Custom target name for the generate target.
   * Default is 'generate'.
   */
  generateTargetName?: string;
}
