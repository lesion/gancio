RELEASE=v$(cat package.json | jq ".version" | sed -e 's/"//g')
echo "Releasing $RELEASE"
rm -fr node_modules
yarn
yarn build
yarn pack
yarn publish
gpg --pinentry-mode loopback --passphrase `pass underscore/pgp`  --detach-sign --local-user 5DAC477D5441B7A15ACBF680BBEB4DD39AC6CCA9 gancio-$RELEASE.tgz
cp gancio-$RELEASE.tgz releases/
mv gancio-$RELEASE.tgz releases/latest.tgz
cp gancio-$RELEASE.tgz.sig releases/
mv gancio-$RELEASE.tgz.sig releases/latest.tgz.sig
yarn doc
rsync -a docs/_site/ --chown=www-data:www-data cisti.web:/var/www/gancio/
git tag $RELEASE
git push --tags
cd docs