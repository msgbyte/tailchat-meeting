# tailchat-meeting

Tailchat video conferencing

Secondary development based on [edumeet](https://github.com/edumeet/edumeet).

> The reason for not developing on the fork of the original project is that there will be a lot of in-depth transformations and adaptation to **Tailchat**, so it is not ready to return to the original project.

## start with docker

To view the full documentation, please visit: [Deployment Video Meeting](https://tailchat.msgbyte.com/docs/meeting/deployment)

#### Build Docker Image
```bash
cd compose
docker-compose build
```

#### Configuration and Startup
```bash
cd compose
cp docker-compose.env.example docker-compose.env
vim docker-compose.env # Modify the environment variable to the actual situation, see the notes for the specific environment variable content (you need to configure the domain name to automatically apply for the https certificate. The rtc service relies on the https protocol)
docker-compose up -d
```

Just access the server address. The nginx configured by docker-compose has been bound to port 443 by default.

### Installation optimization

You can use `MEDIASOUP_WORKER_BIN` to specify a previously compiled binary file to prevent `mediasoup` from compiling

```
MEDIASOUP_WORKER_BIN=/path/to/mediasoup-worker
```

### i18n

```
cd app
pnpm i18n:extract -- './src/**/*.{ts,tsx,js}' --ignore='**/*.d.ts' --out-file src/intl/translations/en.json --format simple
```
