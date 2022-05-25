# tailchat-meeting
Tailchat 视频会议

基于 [edumeet](https://github.com/edumeet/edumeet) 进行二次开发。

> 不在原项目的fork上进行开发是因为会进行很多深度的改造，并适配**Tailchat**，因此并不准备回归到原项目.

## start with docker

#### 构建镜像
```bash
cd compose
docker-compose build
```

#### 配置与启动
```bash
cd compose
cp docker-compose.env.example docker-compose.env
vim docker-compose.env # 修改环境变量至实际情况，具体环境变量内容见注释(需要配置域名以自动申请https证书。rtc服务依赖https协议)
docker-compose up -d
```

访问服务器地址即可，docker-compose 配置的 nginx 已经默认绑定443端口

### 安装优化

可以使用 `MEDIASOUP_WORKER_BIN` 指定之前编译好的二进制文件, 来阻止`mediasoup`的编译行为

```
MEDIASOUP_WORKER_BIN=/path/to/mediasoup-worker
```

### 翻译

```
cd app
pnpm i18n:extract -- './src/**/*.{ts,tsx,js}' --ignore='**/*.d.ts' --out-file src/intl/translations/en.json --format simple
```
