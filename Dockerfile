FROM moonrailgun/tailchat-meeting-base:1.0

ENV DEBUG=tailchat-meeting*,mediasoup*

RUN npm install -g nodemon concurrently

COPY ./app app
COPY ./server server
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./LICENSE ./.npmrc ./

RUN pnpm install

# Web PORTS
EXPOSE 80 443
EXPOSE 40000-49999/udp

CMD concurrently --names "server,app" \
    "cd server && pnpm build && start dev" \
    "cd app && pnpm build"
