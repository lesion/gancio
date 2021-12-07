RELEASE=v$(cat package.json | jq ".version" | sed -e 's/"//g')
echo "Releasing $RELEASE"
yarn build
yarn pack
yarn publish
yarn doc
gpg --detach-sign --local-user 5DAC477D5441B7A15ACBF680BBEB4DD39AC6CCA9 gancio-$RELEASE.tgz
cp gancio-$RELEASE.tgz releases/
mv gancio-$RELEASE.tgz releases/latest.tgz
cp gancio-$RELEASE.tgz.sig releases/
mv gancio-$RELEASE.tgz.sig releases/latest.tgz.sig
rsync -a docs/_site/ gancio.org:/var/www/gancio/