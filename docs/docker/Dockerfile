FROM node:buster
RUN yarn global add --silent https://gancio.org/latest.tgz 2> /dev/null

ADD entrypoint.sh /
RUN chmod 755 /entrypoint.sh
ENTRYPOINT [ "/bin/sh", "/entrypoint.sh" ]
