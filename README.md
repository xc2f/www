# 📖

## Develop

```bash
# .env
APP_CMD=dev
```

### initial account

- email: admin@local.host
- password: 123456

## Deploy

```bash
# .env
APP_CMD=start
```

1. 代码push后触发CI, build分支更新
2. server端部署：`pnpm run deploy`
3. 第一次启动或有新增表结构时，进入payload容器，执行`pnpm payload migrate:create` 和 `pnpm payload migrate`

## Command

### docker-compose

- build: `docker-compose build`
- 终止：`docker-compose down`
- 启动：`docker-compose up -d`
- 进入payload容器：`docker-compose exec payload sh`

### git

### 暂存某个文件

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

### postgres 修改volume name

```bash
docker run --rm   -v FROM_NAME_pgdata:/from   -v TO_NAME_pgdata:/to   alpine   sh -c "cd /from && cp -a . /to"
```
