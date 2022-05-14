FROM moonrailgun/tailchat-meeting-base:1.0

ENV DEBUG=tailchat-meeting*,mediasoup*

RUN npm install -g nodemon concurrently

COPY ./app app
COPY ./server server
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./LICENSE ./.npmrc ./

RUN pnpm install

# PORTS for mediasoup
EXPOSE 40000-49999/udp

CMD bash

# RUN cd app && pnpm build
# RUN cd server && pnpm build

# CMD pnpm start
