build: build-base build-cli

build-base:
	docker build tools/docker/base/. -f tools/docker/base/Dockerfile -t nxgo/base:latest

build-cli:
	docker build tools/docker/cli/. -f tools/docker/cli/Dockerfile -t nxgo/cli:latest


push: push-base push-cli

push-base:
	docker push nxgo/base:latest
push-cli:
	docker push nxgo/cli:latest

run-base:
	docker run -it --rm --name nxgo-base -t nxgo/base:latest

all: build push
