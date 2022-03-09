FROM node:14-bullseye

COPY . /zero2ckb-server/.
RUN cd /zero2ckb-server && yarn && yarn build

RUN npm install pm2 -g

RUN echo "Finished installing dependencies"

EXPOSE 3000
