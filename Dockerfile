
FROM node:10

WORKDIR /usr/src/app

COPY package.json .

# install backend dependencies
RUN yarn install

# copy source
COPY . .

# install nodemon
RUN yarn global add nodemon

WORKDIR /usr/src/app/client

# install frontend dependencies
RUN yarn

# build frontend
RUN yarn build

WORKDIR /usr/src/app

EXPOSE 12300

CMD [ "yarn", "run", "serve" ]
