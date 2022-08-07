FROM node:16-slim AS nodejs-base
RUN apt-get -q update && \
    env DEBIAN_FRONTEND=noninteractive apt-get -y install git && \
    apt-get clean && rm -fr /var/lib/apt/lists/*

FROM nodejs-base AS build
RUN yarnpkg global add --network-timeout 1000000000 --latest --production --silent https://gancio.org/latest.tgz && \
    apt-get clean && rm -fr /var/lib/apt/lists/* && \
    yarnpkg cache clean

FROM nodejs-base
COPY --from=build /usr/local/share/.config/yarn/ /usr/local/share/.config/yarn/
RUN ln -s ../share/.config/yarn/global/node_modules/.bin/gancio /usr/local/bin/gancio

ENTRYPOINT ["/usr/local/bin/gancio"]


