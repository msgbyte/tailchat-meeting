# tailchat-meeting
Tailchat 视频会议

基于 [edumeet](https://github.com/edumeet/edumeet) 进行二次开发。

> 不在原项目的fork上进行开发是因为会进行很多深度的改造，并适配Tailchat，因此并不准备回归到原项目.


### 安装优化

可以使用 `MEDIASOUP_WORKER_BIN` 指定之前编译好的二进制文件, 来阻止`mediasoup`的编译行为

```
MEDIASOUP_WORKER_BIN=/path/to/mediasoup-worker
```