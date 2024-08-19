# prepare dependencies
FROM node:20-slim AS dependencies

## test with 
# RUN apk add --update --no-cache vips-dev build-base vips
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile  --production  && \
    mv node_modules prod_node_modules && \
    yarn install --frozen-lockfile

## tests
# FROM dependencies AS test
# WORKDIR /usr/src/app
# COPY . .
# RUN  yarn test-sqlite

## build
FROM node:20-slim AS build
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN yarn build --production
RUN yarn pack --filename /tmp/package.tgz

## production
FROM node:20-slim
RUN mkdir -p /app
RUN --mount=type=bind,from=build,source=/tmp/package.tgz,target=/tmp/package.tgz \
    tar xf /tmp/package.tgz -C /app --strip-components 1
COPY --from=dependencies /app/prod_node_modules /app/node_modules


EXPOSE 13120
ENTRYPOINT ["/app/server/cli.js"]
