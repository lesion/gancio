FROM  node:17-slim
RUN bash -c "apt update -y && apt install git -y && apt clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp"
RUN yarn global remove gancio || true
RUN yarn cache clean
RUN yarn global add --latest --production --silent https://gancio.org/latest.tgz
ADD entrypoint.sh /
RUN chmod 755 /entrypoint.sh
ENTRYPOINT [ "/bin/sh", "/entrypoint.sh" ]
