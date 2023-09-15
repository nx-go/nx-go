# @nx-go/nx-go:build

Builds a project with `go build` cli command.

## Options

### main (required)

- (string): Path to the file containing the main() function

### compiler

- (string): The Go compiler to use (possible values: 'go', 'tinygo')

### outputPath

- (string): The output path of the resulting executable

### buildMode

- (string): Build mode to use

### env

- (object): Environment variables to set when running the executor

### flags

- (array): Flags to pass to the go compiler
