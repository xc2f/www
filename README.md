# Payload CMS

## Develop

### initial account

- email: admin@local.host
- password: 123456

### env

- 取消`docker-compose.yml`注释: `command: sh -c "npm install -g pnpm && pnpm install && pnpm dev"`

### build

- 取消`docker-compose.yml`注释: `command: sh -c "npm install -g pnpm && pnpm install && pnpm build`

## Deploy

1. 代码push后触发CI，.next push到build分支
2. server端拉取main和build分支代码
3. 取消`docker-compose.yml`注释: `command: sh -c "npm install -g pnpm && pnpm install && pnpm start"`
4. 启动服务: `docker-compose up -d`
5. 第一次启动或有新增表结构时，进入payload容器，`npm install -g pnpm`，然后执行`pnpm payload migrate:create`和`pnpm payload migrate`

### 服务端更新代码

```bash
# 暂存修改
git stash push -- docker-compose.yml

# 更新 main 分支
git pull

# 拉取 build 分支最新
git fetch origin build

# 只恢复 .next 文件到当前工作目录，不加入暂存区
git restore --source origin/build .next
# git restore --source origin/build --staged --worktree .next

# 恢复修改
git stash pop
```

## Command

### docker-compose

- 终止：`docker-compose down`
- 重启：`docker-compose up -d`
- 进入payload容器：`docker-compose exec payload sh`

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
