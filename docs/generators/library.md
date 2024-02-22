# @nx-go/nx-go:library

Creates a Go library.

## Examples

Create an library named **data-access**:

```shell
nx g @nx-go/nx-go:library data-access
```

## Options

### name (required)

- (string): The name of the library

### directory

- (string): The directory of the new library

### projectNameAndRootFormat

- (string): Whether to generate the project name and root directory as provided (as-provided) or generate them composing their values and taking the configured layout into account (derived)
- accepted values: **as-provided**, **derived**

### tags

- (string): Add tags to the library

### skipFormat

- (boolean): Skip formatting files
