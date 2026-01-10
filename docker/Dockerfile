FROM node:24-alpine

# 1️⃣ 用 root 启用 corepack & pnpm
RUN corepack enable \
  && corepack prepare pnpm@latest --activate

# 2️⃣ 创建 pnpm 需要的目录并授权给 node
RUN mkdir -p /app /home/node/.pnpm-store \
  && chown -R node:node /app /home/node

# 3️⃣ 切换用户
USER node
WORKDIR /app

# 4️⃣ 拷贝依赖文件
COPY --chown=node:node package.json pnpm-lock.yaml ./

# 5️⃣ 指定 pnpm store 位置（关键）
ENV PNPM_STORE_PATH=/home/node/.pnpm-store

RUN pnpm install --frozen-lockfile

# 6️⃣ 拷贝源码
COPY --chown=node:node . .

