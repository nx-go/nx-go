<div align="center">
  <h1>nx-go</h1>
  <p>Nx plugin to use <a href="https://go.dev">Go</a> in a <a href="https://nx.dev">Nx</a> workspace.</p>
  <img src="nx-go-logo.png" title="nx-go" alt="nx-go logo">
</div>

## Getting started

First, make sure you have a Nx Workspace. 

Create a new one using the following command: 

```bash
yarn create nx-workspace go-playground --preset=empty --cli=nx --nx-cloud true
cd go-playground
```

Next, install the nx-go plugin:

```bash
yarn add -D @nx-go/nx-go
```

Create a new application:

```bash
nx g @nx-go/nx-go:app api
```

## Usage

You can now run the Nx workspace commands:

### Building the application

This command builds the application using the `go build` command, and stores the output in the `dist/<app-name>/` directory.

```bash
nx build api
```

### Linting the application

Lint the application using the `go fmt` command.

```bash
nx lint api
```

### Serving the application

Serves the application using the `go run` command.

```bash
nx serve api
```

### Testing the application

Test the application using the `go test` command.

```bash
nx test api
```

## MIT License

Created by [Bram Borggreve](https://github.com/beeman). 
