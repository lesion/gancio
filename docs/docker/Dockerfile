FROM node:buster
RUN yarn global remove gancio || true
RUN yarn cache clean gancio
RUN yarn global add --latest --production --silent https://gancio.org/latest.tgz 2> /dev/null
ADD entrypoint.sh /
RUN chmod 755 /entrypoint.sh
ENTRYPOINT [ "/bin/sh", "/entrypoint.sh" ]
