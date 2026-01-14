# 📖

## Develop

```bash
# .env
APP_CMD=dev
```

### Start server

```bash
docker-compose up -d
```

### initial account

- email: admin@local.host
- password: 123456

---

## Deploy

### Docker Compose 部署（推荐）

```bash
# Required files
docker-compose.prod.yml
.env
postgres/**

# Optional files
scripts/**

# postgres 修改 volume name
docker run --rm -v FROM_NAME_pgdata:/from -v TO_NAME_pgdata:/to alpine sh -c "cd /from && cp -a . /to"
```

#### product image

> 通常情况下，server 端应该使用此镜像

```bash
public.ecr.aws/umcai/xc2f/payload:latest
```

main 分支 push 后，GitHub CI build standalone 模式 image，推送到 ECR

#### production image with dev environment

```bash
public.ecr.aws/umcai/xc2f/payload:dev-latest
```

可运行 npn scripts 的镜像，如`pnpm payload migrate`，需在 CI 手动 dispatch `Build and Push Dev Image`

### Docker + build 分支部署

```bash
# .env
APP_CMD=start
```

1. 在 CI 手动 dispatch `Build and Push to Build Branch`
2. server 需要拉取项目的代码，无需下载依赖
3. 构建 local image: `docker-compose build`
4. server端部署：`pnpm run deploy:build`

### build 分支部署

1. 在 CI 手动 dispatch `Build and Push to Build Branch`
2. server 需要拉取项目的代码并下载依赖
3. server端部署：`pnpm run deploy:build`

## Troubleshoots

- 第一次启动或有新增表结构时，进入payload容器，执行`pnpm payload migrate:create` 和 `pnpm payload migrate`

## Command

### docker-compose

- build: `docker-compose build`
- 终止：`docker-compose down`
- 启动：`docker-compose up -d`
- 进入payload容器：`docker-compose exec payload sh`

### git 暂存某个文件

```bash
git stash push -- docker-compose.yml
```

### postgres 修改密码

```bash
docker-compose exec postgres sh
psql -U postgres
ALTER USER postgres WITH PASSWORD 'postgres';
# 注：密码postgres要用引号引起来; 命令最后有分号
```

### DB migration

```bash
# 进入payload容器
docker-compose exec payload sh

# create migration
pnpm payload migrate:create

# exec migration
pnpm payload migrate

# 退出容器
exec

# 确认生成的迁移文件名
docker exec -it payload ls /app/src/migrations

# 拷贝到宿主机
docker cp payload:/app/src/migrations/. ./migrations/

# 合并提交
cd ~/www-code
cp -r ~/www/migrations/* ./src/migrations/
git status
git add -A
git commit -m "create migrations"
git push
```
