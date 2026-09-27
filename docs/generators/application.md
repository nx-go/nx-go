# @nx-go/nx-go:application

Creates a Go application.

## Examples

Create an application named **api**:

```shell
nx g @nx-go/nx-go:application api
```

## Module naming

In a Go workspace (`go.work`), the generated `go.mod` module path is prefixed automatically with the `modulePrefix` [plugin option](../options.md#moduleprefix) if configured, otherwise nx-go tries to detect it from other projects' existing `go.mod` files. If neither is available, the module path defaults to the project root.

## Options

### name (required)

- (string): The name of the application

### directory

- (string): The directory of the new application

### projectNameAndRootFormat

- (string): Whether to generate the project name and root directory as provided (as-provided) or generate them composing their values and taking the configured layout into account (derived)
- accepted values: **as-provided**, **derived**

### tags

- (string): Add tags to the application

### skipFormat

- (boolean): Skip formatting files
