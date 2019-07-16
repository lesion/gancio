FROM node:latest
EXPOSE 13120
WORKDIR /
#COPY config/default.json /data/gancio/config/gancio_config.json
RUN yarn global add gancio
ENTRYPOINT ["gancio", "start", "--config",  "/data/gancio/gancio_config.json"]
#CMD ["gancio", "start", "--config",  "/data/gancio/gancio_config.json"]
