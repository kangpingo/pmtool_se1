# PM System 部署指南

---

## 方式一：Vercel（推荐 - 快速上线）

### 前置准备
1. 注册 [Vercel](https://vercel.com) 账号
2. 准备好 PostgreSQL 数据库（推荐 [Neon](https://neon.tech) 免费额度）
3. 安装 Vercel CLI：`npm i -g vercel`

### 部署步骤

```bash
# 1. 登录 Vercel
vercel login

# 2. 在项目目录执行
vercel

# 3. 设置环境变量（在 Vercel Dashboard → Settings → Environment Variables）
DATABASE_URL=postgresql://user:password@host:5432/dbname

# 4. 部署生产环境
vercel --prod
```

### Vercel 配置文件
项目已包含 `vercel.json`，自动适配 Next.js 15 App Router。

---

## 方式二：Docker（自托管 / 完全控制）

### 前置准备
- Docker Desktop（Mac/Windows）或 Docker Engine（Linux）
- Docker Compose

### 部署步骤

```bash
# 1. 构建并启动所有服务
docker-compose up -d

# 2. 查看运行状态
docker-compose ps

# 3. 查看日志
docker-compose logs -f app
```

服务启动后：
- 应用：http://localhost:3000
- PostgreSQL：localhost:5432

### 常用命令

```bash
# 停止服务
docker-compose down

# 重新构建（代码更新后）
docker-compose up -d --build

# 查看数据库数据（进入 postgres 容器）
docker exec -it pm_postgres psql -U pmuser -d pmdb

# 备份数据库
docker exec -it pm_postgres pg_dump -U pmuser pmdb > backup.sql

# 恢复数据库
cat backup.sql | docker exec -i pm_postgres psql -U pmuser pmdb
```

### 数据持久化
数据库数据存储在 Docker volume `pm_postgres_data`，删除容器不会丢失数据。

---

## 环境变量说明

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://pmuser:pmassword@postgres:5432/pmdb` |
| `NODE_ENV` | 运行环境 | `production` |

---

## 生产环境注意事项

1. **修改默认数据库密码**：编辑 `docker-compose.yml` 中的 `POSTGRES_PASSWORD`
2. **配置 HTTPS**：生产环境务必使用 HTTPS，可通过 Nginx 反向代理或 Cloudflare
3. **定期备份数据库**：使用 `pg_dump` 定时备份
4. **日志管理**：生产环境建议收集容器日志到日志服务
