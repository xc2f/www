# Payload CMS

## Deploy

> 不在服务端build

1. 本地build后，将.next提交
2. server端拉取代码
3. 取消`docker-compose.yml`注释: `command: sh -c "npm install -g pnpm && pnpm install && pnpm start"`
4. 启动服务: `docker-compose up -d`
5. 第一次启动时，`docker-compose exec payload sh`进入payload容器，`npm install -g pnpm`，然后执行`pnpm payload migrate:create`和`pnpm payload migrate`

## Command

### docker-compose

- 终止：`docker-compose down`
- 重启：`docker-compose up -d`

### git

### 暂存某个文件

```bash
git stash push -- docker-compose.yml
```

### 丢弃本地更新

```bash
# 先移除所有未跟踪的文件和目录
git clean -fd

# 再重置已跟踪文件
git reset --hard HEAD
```
