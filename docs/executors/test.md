# @nx-go/nx-go:test

Uses `go test` command to run tests of a Go project.

## Options

### cover

- (boolean): Enable coverage analysis

### coverProfile

- (string): Write a coverage profile to the file after all tests have passed

### race

- (boolean): Enable race detector

### run

- (string): Run only tests matching this regular expression

### verbose

- (boolean): Enable verbose test output

### count

- (number): Run test $N times matching this count

### timeout

- (string): If a test binary runs longer than duration d, panic. If d is 0, the timeout is disabled. The default is 10 minutes (10m).
