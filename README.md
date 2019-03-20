# gancio
an event manager for radical communities

:warning: Gancio is under heavy development,
if something is not working as expected, it's expected :D

#### Install
We provide a docker way to run **gancio**.
```
git clone https://git.lattuga.net/lesion/gancio.git
cd gancio 
docker-compose up -d
```

#### Development
both backend (`/app`) and frontend(`/client`) are in this repo.

backend stack: node.js, express, sequelize.  
frontend stack: vue, webpack, boostrap

```
git clone https://git.lattuga.net/lesion/gancio.git
cd gancio 
# install back-end dependencies
yarn
# run back-end in development mode
yarn dev

cd client
# install front-end dependencies
yarn
# run front-end in development mode
yarn dev
```

