# @nx-go/nx-go options

The plugin allows to configure its behavior with global options.

## Usage

Import the plugin with an object instead of a simple string in your `nx.json` file.

Here is an example:

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "plugins": [
    {
      "plugin": "@nx-go/nx-go",
      "options": { "skipGoDependencyCheck": true }
    }
  ]
}
```

## Options

### skipGoDependencyCheck

- (boolean): if true, the plugin will not require to have Go installed to compute a Nx workspace graph. Be aware that if Go is not installed, the plugin will not be able to detect dependencies between Go projects and this is source of misunderstanding.

### modulePrefix

- (string): Common Go module path prefix (e.g. `github.com/org/repo`) used when generating `go.mod` files for new libraries/applications in a Go workspace. If not set, nx-go tries to auto-detect it from sibling projects' existing `go.mod` files.

### projectGlobs

- (array): Glob patterns of the directories to turn into projects when a single `go.mod` file is located at the workspace root. Each matching directory with Go files becomes a project named after its path. Default is no pattern, projects are only created from `go.mod` files.

```json
{
  "plugin": "@nx-go/nx-go",
  "options": { "projectGlobs": ["apps/*", "libs/*"] }
}
```

With this configuration `apps/api` and `libs/shared` are two projects, and an import of `libs/shared` from `apps/api` is a dependency in the graph. Use `["**"]` to get one project per Go package.

A project can be located inside another one, for example `libs/shared` and `libs/shared/sub` with `["libs/*", "libs/*/sub"]`. The `test` and `lint` targets of the parent project then skip the packages of the nested one. These projects have no `tidy` target as they share the `go.mod` file of the workspace root.

Go files outside of the patterns are not part of any project, unless the workspace root is a project itself (with a `project.json` file).

Directories named `vendor`, `testdata` or `node_modules`, the ones starting with `.` or `_` and the ones with their own `go.mod` file are not visited. A nested `go.mod` file still creates a project as usual.

### buildTargetName

- (string): Custom target name for the build target. Default is `build`.

### serveTargetName

- (string): Custom target name for the serve target. Default is `serve`.

### serveAirTargetName

- (string): Custom target name for the serve-air target. When an Air config file exists and air is available, an Air serve target will be automatically created. Default is `serve:air`.

### testTargetName

- (string): Custom target name for the test target. Default is `test`.

### lintTargetName

- (string): Custom target name for the lint target. Default is `lint`.

### tidyTargetName

- (string): Custom target name for the tidy target. Default is `tidy`.

### generateTargetName

- (string): Custom target name for the generate target. Default is `generate`.
