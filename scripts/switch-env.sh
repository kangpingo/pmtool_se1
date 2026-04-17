#!/bin/bash
# 切换开发（SQLite）和生产（PostgreSQL）环境
# 用法：bash scripts/switch-env.sh dev | prod

MODE=$1

if [ "$MODE" = "prod" ]; then
  echo "切换到生产环境（PostgreSQL）..."
  cp prisma/schema.prod.prisma prisma/schema.prisma
  cat > .env << 'EOF'
# 生产环境（PostgreSQL via Docker）
DB_PROVIDER="postgresql"
DATABASE_URL="postgresql://pmuser:pmpassword@localhost:5432/pmdb"
EOF
  echo "✓ 已切换到 PostgreSQL"
  echo "→ 确保 Docker 运行后执行：npx prisma db push && npm run build"

elif [ "$MODE" = "dev" ]; then
  echo "切换到开发环境（SQLite）..."
  cat > prisma/schema.prisma << 'SCHEMA'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Project {
  id          String   @id @default(cuid())
  name        String
  startDate   DateTime
  duration    Int
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  tasks       Task[]
}

model Task {
  id             String   @id @default(cuid())
  name           String
  startDate      DateTime
  endDate        DateTime
  includeWeekend Boolean  @default(false)
  duration       Int      @default(3)
  keyPoints      String?
  status         String   @default("TODO")
  projectId      String
  project        Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
SCHEMA
  cat > .env << 'EOF'
# 开发环境（SQLite）
DATABASE_URL="file:./dev.db"
EOF
  echo "✓ 已切换到 SQLite"
  echo "→ 执行：npx prisma generate && npm run dev"

else
  echo "用法：bash scripts/switch-env.sh [dev|prod]"
  exit 1
fi
