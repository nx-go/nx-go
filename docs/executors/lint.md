# @nx-go/nx-go:lint

Formats and lints a project using the [go fmt](https://go.dev/blog/gofmt) tool by default.

You can use a custom linter/formatter if you want.

## Inferred revive linter

When a Revive configuration is detected, the lint target automatically uses [revive](https://github.com/mgechev/revive) as the linter.

### Conditions for automatic revive detection

The revive linter is automatically configured when:

- A Revive config file exists in the project root (`revive.toml` or `.revive.toml`)
- The `revive` executable is available in PATH

When these conditions are met, the lint target will automatically include Revive configuration files in its inputs and set `linter: revive` in the options.

## Examples

Usage with [revive](https://github.com/mgechev/revive) (need to be installed before) and a configuration file.

```json
{
  "lint": {
    "executor": "@nx-go/nx-go:lint",
    "options": {
      "linter": "revive",
      "args": ["-config", "revive.toml"]
    }
  }
}
```

## Options

### linter

- (string): The command to execute when running the lint executor instead of go fmt.

### args

- (array): Extra args when linting the project
