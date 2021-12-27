FROM node:16.13.1-alpine

WORKDIR /workspace

RUN yarn config set cache-folder ~/.yarn

RUN apk add --update --no-cache git tar curl vim zsh the_silver_searcher shadow

RUN sh -c "$(curl -fsSL https://raw.github.com/beeman/server-shell/master/tools/install.sh)"

RUN usermod -s /bin/zsh root

RUN apk add --no-cache git make musl-dev go

# Configure Go
ENV GOROOT /usr/lib/go
ENV GOPATH /go
ENV PATH /go/bin:$PATH

RUN mkdir -p ${GOPATH}/src ${GOPATH}/bin

ENTRYPOINT ["/bin/zsh"]
