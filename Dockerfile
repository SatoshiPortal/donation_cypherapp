FROM node:14.11.0-alpine3.11 as build-base

WORKDIR /donation

COPY package.json /donation

RUN apk add --update --no-cache --virtual .gyp \
  python \
  make \
  g++
RUN npm install
# RUN apk del .gyp

#---------------------------------------------------

#FROM build-base as base-slim
#WORKDIR /donation

#RUN apk del .gyp

#---------------------------------------------------

#FROM base-slim
FROM node:14.11.0-alpine3.11
WORKDIR /donation

COPY --from=build-base /donation/node_modules/ /donation/node_modules/
COPY package.json /donation
COPY tsconfig.json /donation
COPY src /donation/src

RUN npm run build

EXPOSE 9229 3000

ENTRYPOINT [ "npm", "run", "start" ]
