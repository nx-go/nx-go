<p align="center"><img src="https://github.com/nx-go.png" alt="nx-go logo" height="230"/></p>

<div align="center">

# Go Nx plugin

**First-class support of [Go](https://go.dev) in a [Nx](https://nx.dev) workspace**

[![GitHub release](https://img.shields.io/github/v/release/nx-go/nx-go)](https://github.com/nx-go/nx-go/releases/latest)
[![Nx version](https://img.shields.io/npm/dependency-version/%40nx-go%2Fnx-go/%40nx%2Fdevkit?label=Nx&logo=nx)](https://nx.dev)
[![npm Downloads](https://img.shields.io/npm/dt/@nx-go/nx-go?color=eb2f06&logo=npm)](https://npmjs.com/package/@nx-go/nx-go)
[![LICENSE](https://img.shields.io/github/license/nx-go/nx-go)](https://github.com/nx-go/nx-go/blob/main/LICENSE)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=nx-go_nx-go&metric=alert_status)](https://sonarcloud.io/dashboard?id=nx-go_nx-go)

</div>

## ✨ Features

- Generate Go applications and libraries **in seconds** within your Nx workspace
- Execute, build, format and test projects with a customizable configuration
- Efficient caching and dependency graph tools for Go projects
- Use official Go commands in the background

## 🚀 Getting started

You need to have a [stable version of Go](https://go.dev/dl/) installed on your machine. And.. you are ready!

### Generate a Nx workspace with Go support

```shell
npx create-nx-workspace go-workspace --preset=@nx-go/nx-go
```

### Add to an exisiting workspace

```shell
nx add @nx-go/nx-go
```

### Migrate to latest version

```shell
nx migrate @nx-go/nx-go
```

### Don't want to use a multi-module Go workspace?

The plugin configures a [multi-module Go workspace](https://go.dev/doc/tutorial/workspaces) by default, to simplify project management and improve the quality of the Nx graph. If you don't want to take advantage of this feature, you can use generator `convert-to-one-mod` after the plugin installation. Generators will automatically adapt to your configuration.

```shell
nx g @nx-go/nx-go:convert-to-one-mod
```

## 📖 Generators & executors

### Generators

- `application`: [Generate a Go application](./docs/generators/application.md)
- `library`: [Generate a Go library](./docs/generators/library.md)

### Executors

- `build`: [Build a Go project](./docs/executors/build.md)
- `lint`: [Format and lint a Go project](./docs/executors/lint.md)
- `serve`: [Run a Go application](./docs/executors/serve.md)
- `test`: [Run tests of a Go project](./docs/executors/test.md)
- `tidy`: [Ensures go.mod file matches a project source code](./docs/executors/tidy.md)

> [!TIP]
> You can use `nx list @nx-go/nx-go` to see list capabilities.

Want to try out these capabilities quickly? Visit our [playground](https://github.com/nx-go/nx-go-playground)!

## 🧩 Compatibility

| nx-go version | Nx version   |
|---------------|--------------|
| 3.x           | 17.x to 19.x |
| 2.x           | 13.x to 16.x |
| 1.x           | < 13.x       |

This plugin is only tested on [stable versions of Go](https://go.dev/dl/), older versions does not receive support. However, you can expect a fair degree of compatibility. Please note that multi-module Go workspaces require Go 1.18 or later.

## Contributors

<table>
  <tbody>
    <tr>
      <td align="center" valign="top"><a href="https://github.com/beeman"><img src="https://github.com/beeman.png" width="100" alt="Utarwyn"/><br /><b>Bram Borggreve</b></a><br />Creator</td>
      <td align="center" valign="top"><a href="https://github.com/utarwyn"><img src="https://github.com/utarwyn.png" width="100" alt="Utarwyn"/><br /><b>Maxime Malgorn</b></a><br />Maintainer</td>
    </tr>
  </tbody>
</table>

Licensed under MIT
