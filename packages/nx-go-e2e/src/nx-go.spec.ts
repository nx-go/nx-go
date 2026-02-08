import {
  checkFilesExist,
  cleanup,
  ensureNxProject,
  readFile,
  readJson,
  runNxCommandAsync,
  tmpProjPath,
  uniq,
  updateFile,
} from '@nx/plugin/testing';

describe('nx-go', () => {
  const appName = uniq('app');
  const libName = uniq('lib');

  beforeAll(() => ensureNxProject('@nx-go/nx-go', 'dist/packages/nx-go'));
  afterAll(() => cleanup());

  it('should initialize the workspace', async () => {
    await runNxCommandAsync(`generate @nx-go/nx-go:init`);
    expect(() => checkFilesExist(`go.work`)).not.toThrow();
  });

  it('should create an application', async () => {
    await runNxCommandAsync(`generate @nx-go/nx-go:application ${appName}`);

    expect(() => checkFilesExist(`${appName}/main.go`)).not.toThrow();
    expect(() => checkFilesExist(`${appName}/go.mod`)).not.toThrow();
    expect(readFile(`${appName}/go.mod`)).toContain(`module ${appName}`);
    expect(readFile(`go.work`)).toContain(`use ./${appName}`);

    const projectConfig = readJson(`${appName}/project.json`);
    expect(projectConfig.name).toEqual(appName);
    expect(projectConfig.projectType).toEqual('application');
    // Targets should not be explicitly defined since they are inferred
    expect(projectConfig.targets).toBeUndefined();
  });

  it('should infer targets for application', async () => {
    // Verify that inferred targets are available by running show project command
    const result = await runNxCommandAsync(`show project ${appName} --json`);
    const projectDetails = JSON.parse(result.stdout);

    // Applications should have build, serve, test, lint, and tidy targets inferred
    expect(projectDetails.targets).toEqual({
      build: expect.objectContaining({ executor: '@nx-go/nx-go:build' }),
      serve: expect.objectContaining({ executor: '@nx-go/nx-go:serve' }),
      test: expect.objectContaining({ executor: '@nx-go/nx-go:test' }),
      lint: expect.objectContaining({ executor: '@nx-go/nx-go:lint' }),
      tidy: expect.objectContaining({ executor: '@nx-go/nx-go:tidy' }),
    });
  });

  it('should create a library', async () => {
    await runNxCommandAsync(`generate @nx-go/nx-go:library ${libName}`);

    expect(() => checkFilesExist(`${libName}/${libName}.go`)).not.toThrow();
    expect(() => checkFilesExist(`${libName}/go.mod`)).not.toThrow();
    expect(readFile(`${libName}/go.mod`)).toContain(`module ${libName}`);
    expect(readFile(`go.work`)).toContain(
      `use (\n\t./${appName}\n\t./${libName}\n)`
    );

    const projectConfig = readJson(`${libName}/project.json`);
    expect(projectConfig.name).toEqual(libName);
    expect(projectConfig.projectType).toEqual('library');
    // Targets should not be explicitly defined since they are inferred
    expect(projectConfig.targets).toBeUndefined();
  });

  it('should infer targets for library', async () => {
    // Verify that inferred targets are available by running show project command
    const result = await runNxCommandAsync(`show project ${libName} --json`);
    const projectDetails = JSON.parse(result.stdout);

    // Libraries should only have test, lint, and tidy targets inferred (no build/serve)
    expect(projectDetails.targets).toEqual({
      build: undefined,
      serve: undefined,
      test: expect.objectContaining({ executor: '@nx-go/nx-go:test' }),
      lint: expect.objectContaining({ executor: '@nx-go/nx-go:lint' }),
      tidy: expect.objectContaining({ executor: '@nx-go/nx-go:tidy' }),
    });
  });

  it('should create an application in a sub directory', async () => {
    const name = uniq('app');
    await runNxCommandAsync(`g @nx-go/nx-go:application apps/${name}`);

    expect(() => checkFilesExist(`apps/${name}/main.go`)).not.toThrow();
    expect(() => checkFilesExist(`apps/${name}/go.mod`)).not.toThrow();
  });

  describe('Building', () => {
    const ext = process.platform === 'win32' ? '.exe' : '';

    it('should build the application', async () => {
      const result = await runNxCommandAsync(`build ${appName}`);
      expect(result.stdout).toContain(
        `Executing command: go build -o ../dist/${appName}${ext} .`
      );
      expect(() => checkFilesExist(`dist/${appName}${ext}`)).not.toThrow();
    });

    it('should build the application from a different folder', async () => {
      const result = await runNxCommandAsync(`build ${appName}`, {
        cwd: tmpProjPath(appName),
      });
      expect(result.stdout).toContain(
        `Executing command: go build -o ../dist/${appName}${ext} .`
      );
      expect(() => checkFilesExist(`dist/${appName}${ext}`)).not.toThrow();
    });

    it('should build the application with specifying main file', async () => {
      // Update project.json to add custom build target options
      // This tests that custom target configuration in project.json overrides inferred configuration
      updateFile(`${appName}/project.json`, (content) => {
        const json = JSON.parse(content);
        json.targets = {
          build: {
            executor: '@nx-go/nx-go:build',
            options: { main: 'main.go' },
          },
        };
        return JSON.stringify(json);
      });

      const result = await runNxCommandAsync(`build ${appName}`);
      expect(result.stdout).toContain(
        `Executing command: go build -o ../dist/${appName}${ext} main.go`
      );
      expect(() => checkFilesExist(`dist/${appName}${ext}`)).not.toThrow();
    });
  });

  describe('Linting', () => {
    it('should execute the default linter', async () => {
      const result = await runNxCommandAsync(`lint ${appName}`);
      expect(result.stdout).toContain(`Executing command: go fmt ./...`);
    });

    it('should execute the linter from a different folder', async () => {
      const result = await runNxCommandAsync(`lint ${appName}`, {
        cwd: tmpProjPath(appName),
      });
      expect(result.stdout).toContain(`Executing command: go fmt ./...`);
    });

    it('should use a custom linter', async () => {
      const result = await runNxCommandAsync(
        `lint ${appName} --linter="go vet"`
      );
      expect(result.stdout).toContain(`Executing command: go vet ./...`);
    });
  });

  describe('Tidy', () => {
    it('should execute go mod tidy', async () => {
      const result = await runNxCommandAsync(`tidy ${appName}`);
      expect(result.stdout).toContain(`Executing command: go mod tidy`);
    });
  });

  describe('Generate', () => {
    beforeAll(() => {
      // Test that custom targets can be added to project.json
      // Generate is not inferred by default, so we add it as a custom target
      updateFile(`${appName}/project.json`, (content) => {
        const json = JSON.parse(content);
        json.targets = json.targets || {};
        json.targets.generate = { executor: '@nx-go/nx-go:generate' };
        return JSON.stringify(json);
      });
    });

    it('should execute go generate', async () => {
      const result = await runNxCommandAsync(`run ${appName}:generate`);
      expect(result.stdout).toContain(`Executing command: go generate`);
    });
  });

  describe('Serve', () => {
    it('should serve the application', async () => {
      const result = await runNxCommandAsync(`serve ${appName}`);
      expect(result.stdout).toContain(`Executing command: go run .`);
    });

    it('should serve the application with specifying main file', async () => {
      // Test that custom target configuration overrides inferred configuration
      // Update project.json to add custom serve options
      updateFile(`${appName}/project.json`, (content) => {
        const json = JSON.parse(content);
        json.targets = json.targets || {};
        json.targets.serve = {
          executor: '@nx-go/nx-go:serve',
          options: { main: 'main.go' },
        };
        return JSON.stringify(json);
      });

      const result = await runNxCommandAsync(`serve ${appName}`);
      expect(result.stdout).toContain(`Executing command: go run main.go`);
    });
  });

  it('should test the application', async () => {
    const result = await runNxCommandAsync(`test ${appName} --cover --verbose`);
    expect(result.stdout).toContain(
      `Executing command: go test -v -cover ./...`
    );
  });

  describe('Project graph', () => {
    it('should create graph with dependencies', async () => {
      const captilizedLibName = libName[0].toUpperCase() + libName.substring(1);
      updateFile(
        `${appName}/main.go`,
        `package main

        import (
          "fmt"
          "${libName}"
        )

        func main() {
          fmt.Println(${libName}.${captilizedLibName}("${appName}"))
        }`
      );

      await runNxCommandAsync('dep-graph --file=graph.json');
      const { graph } = readJson('graph.json');

      expect(graph).toBeDefined();
      expect(graph.dependencies).toBeDefined();
      expect(graph.dependencies[appName]).toBeDefined();

      const appDependencies = graph.dependencies[appName];
      expect(appDependencies.length).toBe(1);
      expect(appDependencies[0].target).toBe(libName);
    });

    it('should work with packages with import in the name', async () => {
      const dataimportLib = 'dataimport';
      await runNxCommandAsync(`generate @nx-go/nx-go:library ${dataimportLib}`);

      expect(() =>
        checkFilesExist(`${dataimportLib}/${dataimportLib}.go`)
      ).not.toThrow();

      const captilizedDataImportName =
        dataimportLib[0].toUpperCase() + dataimportLib.substring(1);
      const captilizedLibName = libName[0].toUpperCase() + libName.substring(1);
      updateFile(
        `${dataimportLib}/${dataimportLib}.go`,
        `package ${dataimportLib}

        import (
          "${libName}"
        )

        func ${captilizedDataImportName}() string {
          return ${libName}.${captilizedLibName}("${appName}")
        }`
      );

      updateFile(
        `${appName}/main.go`,
        `package main

        import (
          "fmt"
          "${dataimportLib}"
        )

        func main() {
          fmt.Println(${dataimportLib}.${captilizedDataImportName}("${appName}"))
        }`
      );

      await runNxCommandAsync('dep-graph --file=graph.json');
      const { graph } = readJson('graph.json');

      expect(graph).toBeDefined();
      expect(graph.dependencies).toBeDefined();
      expect(graph.dependencies[dataimportLib]).toBeDefined();

      const dataimportDependencies = graph.dependencies[dataimportLib];
      expect(dataimportDependencies.length).toBe(1);
      expect(dataimportDependencies[0].target).toBe(libName);
    });
  });

  describe('convert-to-inferred', () => {
    it('should convert explicit targets to inferred targets', async () => {
      const explicitApp = uniq('app');

      // Create a new application
      await runNxCommandAsync(
        `generate @nx-go/nx-go:application ${explicitApp}`
      );

      // Manually add explicit targets to project.json (simulating old-style configuration)
      updateFile(`${explicitApp}/project.json`, (content) => {
        const json = JSON.parse(content);
        json.targets = {
          build: { executor: '@nx-go/nx-go:build', options: {} },
          serve: { executor: '@nx-go/nx-go:serve', options: {} },
          test: { executor: '@nx-go/nx-go:test', options: {} },
          lint: { executor: '@nx-go/nx-go:lint', options: {} },
          tidy: { executor: '@nx-go/nx-go:tidy', options: {} },
        };
        return JSON.stringify(json, null, 2);
      });

      // Run convert-to-inferred generator
      await runNxCommandAsync(
        `generate @nx-go/nx-go:convert-to-inferred --project=${explicitApp}`
      );

      // Verify explicit targets are removed from project.json
      const projectConfig = readJson(`${explicitApp}/project.json`);
      expect(projectConfig.targets).toEqual({});

      // Verify targets are still available through inference
      const result = await runNxCommandAsync(
        `show project ${explicitApp} --json`
      );
      const projectDetails = JSON.parse(result.stdout);

      expect(projectDetails.targets).toEqual({
        build: expect.objectContaining({ executor: '@nx-go/nx-go:build' }),
        serve: expect.objectContaining({ executor: '@nx-go/nx-go:serve' }),
        test: expect.objectContaining({ executor: '@nx-go/nx-go:test' }),
        lint: expect.objectContaining({ executor: '@nx-go/nx-go:lint' }),
        tidy: expect.objectContaining({ executor: '@nx-go/nx-go:tidy' }),
      });
    });
  });
});
