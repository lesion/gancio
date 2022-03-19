FROM  node:current-bullseye-slim
RUN yarn global remove gancio || true
RUN yarn cache clean
RUN yarn global add --latest --production --silent https://gancio.org/latest.tgz
ADD entrypoint.sh /
RUN chmod 755 /entrypoint.sh
ENTRYPOINT [ "/bin/sh", "/entrypoint.sh" ]
