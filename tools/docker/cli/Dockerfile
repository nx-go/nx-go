FROM nxgo/base:latest

ENV ANGULAR_CLI_VERSION=13.1.2
ENV NX_CLI_VERSION=13.4.1
ENV NXPM_CLI_VERSION=1.18.0

RUN yarn global add \
    @angular/cli@$ANGULAR_CLI_VERSION \
    @nrwl/cli@$NX_CLI_VERSION \
    nxpm@$NXPM_CLI_VERSION

RUN git config --global user.name "nxpm-bot" && \
    git config --global user.email "65595296+nxpm-bot@users.noreply.github.com"
