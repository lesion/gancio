# gancio
#### a shared agenda for local communities

> :warning: WARNING :warning:
> Gancio is under heavy development, if something is not working as expected, it's expected :D
Please be patient and open an [issue](/cisti/gancio/issues)!

### Current live instances:

- https://gancio.cisti.org
- https://lapunta.org

## Installation

##### Install node
```bash
# source https://github.com/nodesource/distributions/blob/master/README.md
curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt-get install -y nodejs
```

##### Install postgres
```bash
apt install postgresql
```
##### Create database
```bash
sudo -u postgres psql
postgres=# create database gancio;
postgres=# create user gancio with encrypted password 'gancio';
postgres=# grant all privileges on database gancio to gancio;
```
##### Install gancio
```bash
npm install --global gancio
```

##### Create a new user
```bash
adduser gancio
su gancio
```

##### Setup & test
```bash
gancio --help
gancio setup
gancio start
```




### Hacking

``` bash
# clone this repo
git clone https://git.lattuga.net/cisti/gancio.git
cd gancio

# install dependencies
yarn install

# testing with sqlite db
yarn dev

# build for production and launch server
yarn build
yarn start

```

Made with :heart: by [underscore hacklab](https://autistici.org/underscore)
