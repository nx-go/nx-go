# @nx-go/nx-go:lint

Formats and lints a project using the [go fmt](https://go.dev/blog/gofmt) tool by default.

You can use a custom linter/formatter if you want.

## Exemples

Usage with [revive](https://github.com/mgechev/revive) (need to be installed before) and a configuration file.

```json
{
  "lint": {
    "executor": "@nx-go/nx-go:lint",
    "options": {
      "linter": "revive",
      "args": [
        "-config",
        "revive.toml"
      ]
    }
  }
}
```

## Options

### linter

- (string): The command to execute when running the lint executor instead of go fmt.

### args

- (array): Extra args when linting the project
