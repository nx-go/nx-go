export interface NxGoPluginOptions {
  /**
   * If true, the plugin will not require
   * to have Go installed to compute a Nx workspace graph.
   *
   * Be aware that if Go is not installed, the plugin will not be able
   * to detect dependencies between Go projects and this is source of misunderstanding.
   */
  skipGoDependencyCheck?: boolean;
}
