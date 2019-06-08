## gancio
### event manager for radical communities

> :warning: Gancio is under heavy development,
> if something is not working as expected, it's expected :D


## Install
You will need `npm` or `yarn` installed in your system.


``` bash
# clone this repo
git clone https://git.lattuga.net/cisti/gancio.git
cd gancio

# install dependencies
yarn install

# edit configuration
cp config.example.js config.js

# - migrate/create test sqlite db
yarn migrate:dev

# testing with sqlite db
yarn dev

# - migrate/create production db
yarn migrate

# build for production and launch server
yarn build
yarn start

```
