package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"go/parser"
	"go/token"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	"golang.org/x/tools/go/ast/astutil"
)

type FileImportsInfo struct {
	Path    string   `json:"path"`
	Imports []string `json:"imports,"`
}

func main() {

	if len(os.Args) == 1 {
		println("no argument given, requires the directoy as an argument")
		return
	}

	dirPath := os.Args[1]
	info, err := os.Stat(dirPath)

	if os.IsNotExist(err) || !info.IsDir() {
		println("could not find directory:", dirPath)
		return
	}

	goFiles, err := getGoFilesInDirectory(dirPath)

	if err != nil {
		println("bail out, error reading dir")
		return
	}

	var fset = token.NewFileSet()
	//var fileImportsInfo []FileImportsInfo
	fileImportsMap := map[string][]string{}
	for _, path := range goFiles {
		goImports, err := getImportsFromFile(fset, path)
		if err != nil {
			println("error reading imports from file:", err)
			return
		}
		fileImportsMap[path] = goImports

		//fileImportsInfo = append(
		//	fileImportsInfo, FileImportsInfo{
		//		Path:    path,
		//		Imports: goImports,
		//	},
		//)
	}

	bytes, err := json.Marshal(fileImportsMap)
	if err != nil {
		println("Error marshalling", err)
	}
	fmt.Print(string(bytes))
}

// Given the directory path returns all the .go files in the directory or sub directory
func getGoFilesInDirectory(dirpath string) ([]string, error) {
	var goFiles []string

	err := filepath.Walk(
		dirpath, func(path string, info fs.FileInfo, err error) error {
			if err != nil {
				return err
			}
			if !info.IsDir() && strings.HasSuffix(path, ".go") {
				goFiles = append(goFiles, path)
			}
			return nil
		},
	)
	if err != nil {
		return nil, errors.New("error reading dir")
	}

	return goFiles, nil
}

// Parses the file for imports and returns them.
func getImportsFromFile(fset *token.FileSet, filepath string) ([]string, error) {
	var goImports = make([]string, 0)

	file, err := parser.ParseFile(fset, filepath, nil, parser.ImportsOnly)
	if err != nil {
		return nil, err
	}

	imports := astutil.Imports(fset, file)

	for _, group := range imports {
		for _, imp := range group {
			path := strings.Trim(imp.Path.Value, `"`)
			goImports = append(goImports, path)
		}
	}

	return goImports, nil
}
