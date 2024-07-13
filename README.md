# tailchat-meeting

Tailchat video conferencing

Secondary development based on [edumeet](https://github.com/edumeet/edumeet).

> The reason for not developing on the fork of the original project is that there will be a lot of in-depth transformations and adaptation to **Tailchat**, so it is not ready to return to the original project.

## Start with docker
To view the full documentation, please visit: [Deployment Video Meeting](https://tailchat.msgbyte.com/docs/meeting/deployment)

#### Clone Repo
```bash
git clone https://github.com/msgbyte/tailchat-meeting --depth=1
```

#### Configuration
```bash
cd tailchat-meeting/compose
cp docker-compose.env.example docker-compose.env
vim docker-compose.env # Modify the environment variable to the actual situation, see the notes for the specific environment variable content (you need to configure the domain name to automatically apply for the https certificate. The rtc service relies on the https protocol)
```

The ports that need to be reserved by the server are as follows:

- swag (server gateway, nginx enhanced version, the port can be modified through the configuration file tailchat-meeting/compose/nginx.conf)
  - 80
  - 443
- tailchat-meeting
  - 13001
  - 40000-49999 (for RTC service, dynamic occupancy) -redis
  - 6379


- If you only deploy on a single machine, `MEDIASOUP_IP` and `MEDIASOUP_ANNOUNCED_IP` can both fill in the public network ip of the server, **But for service providers with flexible deployment networks (such as domestic AWS, Tencent Cloud, Alibaba Cloud, etc.) must strictly follow the notes to fill in the internal IP and public network IP** (because the external network IP provided by this type of service provider is not bound to the network card)
- `tailchat-meeting` is based on **webrtc** service, so it strongly depends on https/wss protocol. The swag service can automatically apply for an https certificate for you, but you must assign a valid domain name and ensure that the dns point has been pointed to the server.
- More related documents can be viewed [README](https://github.com/linuxserver/docker-letsencrypt/blob/master/README.md)
- Sample configuration:
```
URL=meeting.example.com # Sample domain
SUBDOMAINS= # Used for multi-domain cert
```

#### Build Docker Image
```bash
docker-compose build
```

#### Startup
```bash
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
