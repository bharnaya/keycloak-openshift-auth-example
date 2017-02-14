FROM node:7.4.0

ENV APP_DIR /usr/src/app

RUN mkdir -p $APP_DIR
WORKDIR $APP_DIR

COPY package.json $APP_DIR
RUN npm install

COPY proxy.js $APP_DIR

ADD docker-entrypoint.sh $APP_DIR

EXPOSE 9009

ENTRYPOINT [ "/usr/src/app/docker-entrypoint.sh" ]