# @nx-go/nx-go:serve-air

Runs a Go application with [Air](https://github.com/air-verse/air) live reload.

> Air must be installed and available in your PATH. An Air config file is automatically detected when present.

## Inferred task conditions

This target is automatically created for Go applications when:

- The project is an application (has `package main`)
- An Air config file exists in the project root (`.air.toml`, `.air.yaml`, `.air.yml`, or `.air.conf`)
- The `air` executable is available in PATH

The default target name is `serve:air`. This can be customized using the `serveAirTargetName` plugin option (see [plugin options](../options.md)).

## Options

### config

- (string): Path to Air config file, default is .air.toml

### cmd

- (string): Name of the air binary to use, default is air

### cwd

- (string): Working directory from which to run the application

### args

- (array): Extra args to pass to air
