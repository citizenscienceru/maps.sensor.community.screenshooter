FROM node:16-buster

RUN mkdir -p /opt/cs
WORKDIR /opt/cs

RUN apt-get update
RUN apt-get install -y libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev
RUN apt-get install -y libasound2

COPY . .

RUN npm install
RUN cd ./node_modules/puppeteer && npm install

ENTRYPOINT [ "node", "index.js" ]
