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
