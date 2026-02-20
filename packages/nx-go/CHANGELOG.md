# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [4.0.0-beta.0](https://github.com/nx-go/nx-go/compare/v3.3.1...v4.0.0-beta.0) (2026-02-20)


### ⚠ BREAKING CHANGES

* build executor is now running from project folder
* require Nx 20+

### Features

* add Air live reload executor ([#174](https://github.com/nx-go/nx-go/issues/174)) ([5ead589](https://github.com/nx-go/nx-go/commit/5ead589454f668e9df8cd17c6eb856d3dc666e3d))
* add flags property to serve executor ([#149](https://github.com/nx-go/nx-go/issues/149)) ([0df9805](https://github.com/nx-go/nx-go/commit/0df98057ab86f3915090c190c0f712e27c168955))
* add Nx 21+ support ([#161](https://github.com/nx-go/nx-go/issues/161)) ([1732d2e](https://github.com/nx-go/nx-go/commit/1732d2edcbfad58b8cd39ae4c5d7c6d8f519d0e8))
* add support for inferred tasks ([#169](https://github.com/nx-go/nx-go/issues/169)) ([92b08f0](https://github.com/nx-go/nx-go/commit/92b08f0a3e9e030bf77bdd89abb963050e12433f))
* allow optional main file in executors ([#168](https://github.com/nx-go/nx-go/issues/168)) ([cb4a729](https://github.com/nx-go/nx-go/commit/cb4a72900a07ed5a1164b3d46a5ccfd8c47a3035))
* improve default task configuration ([#170](https://github.com/nx-go/nx-go/issues/170)) ([2fb178b](https://github.com/nx-go/nx-go/commit/2fb178be7e86841233989feb8a6114fb7fa40d58))


### Bug Fixes

* better path handling when executing Go commands ([#155](https://github.com/nx-go/nx-go/issues/155)) ([dfb29b1](https://github.com/nx-go/nx-go/commit/dfb29b12d8a22c493ee80470bcad891eaf65fd6a))
* respect GOOS environment variable in build executor ([#160](https://github.com/nx-go/nx-go/issues/160)) ([a0f4d7c](https://github.com/nx-go/nx-go/commit/a0f4d7c6666afccbc817757eb070187801bb24c3))
* skip project creation for workspace root without project.json ([#177](https://github.com/nx-go/nx-go/issues/177)) ([851d962](https://github.com/nx-go/nx-go/commit/851d962aa9333663fd360a02a652bb0b2cdadfee))
* support multiple import/use blocks in Go files ([#173](https://github.com/nx-go/nx-go/issues/173)) ([faad139](https://github.com/nx-go/nx-go/commit/faad1397a9248faf972b0cc6971f899275dbcb1f))
* use Go version from go.work if exists ([#166](https://github.com/nx-go/nx-go/issues/166)) ([2e7df46](https://github.com/nx-go/nx-go/commit/2e7df46bbe6578879179d7ac37d16d5a69b58065))

## [3.3.1](https://github.com/nx-go/nx-go/compare/v3.3.0...v3.3.1) (2024-12-11)


### Bug Fixes

* update generators to support Nx 20 ([#147](https://github.com/nx-go/nx-go/issues/147)) ([54f74f5](https://github.com/nx-go/nx-go/commit/54f74f5975fa3ffe711cc9ef160209c1cd694714))

## [3.3.0](https://github.com/nx-go/nx-go/compare/v3.2.0...v3.3.0) (2024-11-17)


### Features

* add an option to skip Go dependency check ([#143](https://github.com/nx-go/nx-go/issues/143)) ([cf725d7](https://github.com/nx-go/nx-go/commit/cf725d71a284f5374d7daa74bef41e3a0e63d2c4))
* add support of Nx 20 ([#142](https://github.com/nx-go/nx-go/issues/142)) ([2919f4d](https://github.com/nx-go/nx-go/commit/2919f4d6acf03f7a585ea8559240dd9c6a9b1901))
* add support of TinyGo ([#94](https://github.com/nx-go/nx-go/issues/94)) ([3b6a5a5](https://github.com/nx-go/nx-go/commit/3b6a5a57482f1db9ea40991254057f1526239456))
* add timeout property to test executor ([#132](https://github.com/nx-go/nx-go/issues/132)) ([c79e2de](https://github.com/nx-go/nx-go/commit/c79e2deaef250e50f7b8533f52ca2201be0ce468))


### Bug Fixes

* improve regular expression for parsing import statements ([#139](https://github.com/nx-go/nx-go/issues/139)) ([1715cc7](https://github.com/nx-go/nx-go/commit/1715cc75736c7014096128c3d80f4af2836e8069))

## [3.2.0](https://github.com/nx-go/nx-go/compare/v3.1.0...v3.2.0) (2024-07-11)


### Features

* add a generate executor ([#123](https://github.com/nx-go/nx-go/issues/123)) ([892ec5e](https://github.com/nx-go/nx-go/commit/892ec5e4b81feee9e0fe7e562d264a824443e81c))
* add buildMode property to build executor ([#126](https://github.com/nx-go/nx-go/issues/126)) ([11512c3](https://github.com/nx-go/nx-go/commit/11512c3dc56477328992ba145b95e49407f045ca))
* add count property to test executor ([#125](https://github.com/nx-go/nx-go/issues/125)) ([67753fa](https://github.com/nx-go/nx-go/commit/67753fa4980ff3c3d9c2c7a1b714aadc55e36a17))

## [3.1.0](https://github.com/nx-go/nx-go/compare/v3.0.0...v3.1.0) (2024-06-03)


### Features

* add a tidy executor ([#117](https://github.com/nx-go/nx-go/issues/117)) ([722f1ed](https://github.com/nx-go/nx-go/commit/722f1ede0f3804786c3326db53d55835f497bf7f))
* add coverProfile to test executor ([#116](https://github.com/nx-go/nx-go/issues/116)) ([90eeac4](https://github.com/nx-go/nx-go/commit/90eeac45f6c5eab132a6eacf675ed30c963c5454))
* add run property to test executor ([#119](https://github.com/nx-go/nx-go/issues/119)) ([d1c3224](https://github.com/nx-go/nx-go/commit/d1c3224372b30f31bcaef570cc549d2d435e2a4b))
* add support of Nx 19 ([#120](https://github.com/nx-go/nx-go/issues/120)) ([09547bb](https://github.com/nx-go/nx-go/commit/09547bb0e4a0927f0fcf9905b3ea93760a628f9b))


### Bug Fixes

* do not strip away special characters from project names ([#121](https://github.com/nx-go/nx-go/issues/121)) ([7d03eda](https://github.com/nx-go/nx-go/commit/7d03edaaf2abc4f12ac47e2f9abf535ce114c4d3))

## [3.0.0](https://github.com/nx-go/nx-go/compare/v3.0.0-beta.1...v3.0.0) (2024-04-03)

## [3.0.0-beta.1](https://github.com/nx-go/nx-go/compare/v3.0.0-beta.0...v3.0.0-beta.1) (2024-03-19)


### Features

* add migration for executors options ([#108](https://github.com/nx-go/nx-go/issues/108)) ([81544df](https://github.com/nx-go/nx-go/commit/81544df0296f6b94e17cf9e6cd1dfe25a386d562))
* update test executor options ([#111](https://github.com/nx-go/nx-go/issues/111)) ([0ba55ff](https://github.com/nx-go/nx-go/commit/0ba55ffcf7a7e8473a1338673124e2667e934523))

## [3.0.0-beta.0](https://github.com/nx-go/nx-go/compare/v2.8.0...v3.0.0-beta.0) (2024-02-22)

### ⚠ BREAKING CHANGES

* require Nx 17+

### Features

* move to nx-go v3 ([#103](https://github.com/nx-go/nx-go/issues/103)) ([a5bee36](https://github.com/nx-go/nx-go/commit/a5bee36f78fd4c820fdece8d8e59e82e5ebf3472))
