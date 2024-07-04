FROM moonrailgun/tailchat-meeting-base:1.0

ENV DEBUG=tailchat-meeting*,mediasoup*

RUN npm install -g nodemon concurrently
RUN npm install -g pnpm@8

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml LICENSE .npmrc .eslintrc.js ./
COPY packages packages
COPY server server
COPY app app

RUN pnpm install

# PORTS for mediasoup
EXPOSE 40000-49999/udp


RUN cd app && NODE_OPTIONS="--max-old-space-size=2048" pnpm build
RUN cd server && pnpm build

CMD cd server && pnpm start
# CMD npx http-server .
