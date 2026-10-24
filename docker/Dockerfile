FROM node:24.22.1-slim AS base

ARG NPM_REGISTRY=https://registry.npmjs.org
ARG APT_MIRROR=http://deb.debian.org/debian
ARG APT_SECURITY_MIRROR=http://deb.debian.org/debian-security
ENV COREPACK_NPM_REGISTRY="${NPM_REGISTRY}" \
    NPM_CONFIG_REGISTRY="${NPM_REGISTRY}" \
    npm_config_registry="${NPM_REGISTRY}"

# SQLite CLI is used for consistent, online backups.
RUN sed -i \
    -e "s|http://deb.debian.org/debian-security|${APT_SECURITY_MIRROR}|g" \
    -e "s|http://deb.debian.org/debian|${APT_MIRROR}|g" \
    /etc/apt/sources.list.d/debian.sources
RUN apt-get update && apt-get install -y sqlite3 ca-certificates fontconfig --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*
COPY ["src/app/(frontend)/fonts/PressStart2P-Regular.ttf", "/usr/share/fonts/truetype/"]
RUN fc-cache -f

# 基础环境
ENV PNPM_HOME="/home/node/.pnpm-store"
ENV PATH="$PNPM_HOME:$PATH"

# 创建 pnpm store 并赋权
RUN mkdir -p /home/node/.pnpm-store && chown -R node:node /home/node/.pnpm-store

# Enable pnpm via the packageManager field in package.json.
RUN npm config set registry "${NPM_REGISTRY}" && corepack enable

# 依赖安装阶段
FROM base AS deps
WORKDIR /app
# 先创建目录并赋权
RUN mkdir -p /app/data && chown -R node:node /app
USER node
COPY --chown=node:node package.json pnpm-lock.yaml ./
# Keep the pnpm content-addressable store in a BuildKit cache instead of baking
# it into the deps layer. This reduces Docker build disk usage substantially.
RUN --mount=type=cache,id=pnpm-store,target=/home/node/.pnpm-store,uid=1000,gid=1000 \
    pnpm config set store-dir /home/node/.pnpm-store && \
    pnpm config set registry "${NPM_CONFIG_REGISTRY}" && \
    pnpm install --frozen-lockfile

# 运行阶段
FROM base AS runner
WORKDIR /app
RUN mkdir -p /app/data && chown -R node:node /app
USER node
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

EXPOSE 3000

CMD ["pnpm", "dev"]
