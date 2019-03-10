
FROM node:10

WORKDIR /usr/src/app

COPY package.json .
COPY pm2.json .

# install backend dependencies
RUN yarn

# copy source
COPY app app/
COPY client client/

# install nodemon
RUN yarn global add pm2

WORKDIR /usr/src/app/client

# install frontend dependencies
RUN yarn

# build frontend
RUN yarn build

WORKDIR /usr/src/app

EXPOSE 12300

CMD [ "pm2-runtime", "start", "pm2.json" ]
