# @nx-go/nx-go:build

Builds a project with `go build` cli command.

## Options

### main (required)

- (string): Path to the file containing the main() function

### outputPath

- (string): The output path of the resulting executable

### env

- (object): Environment variables to set when running the executor

### flags

- (array): Flags to pass to the go compiler
