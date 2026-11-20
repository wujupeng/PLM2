# PLM2 制造业研发供应链生产一体化平台

面向制造业研发、物料、供应链、生产和协同业务的全栈管理平台。仓库当前包含 React 前端和基于 Spring Boot 的后端多模块工程，涵盖 PLM、ERP、MES、WMS、SRM、OA、系统集成与数据迁移等业务页面和服务能力。

> **部署说明：** 当前后端聚合工程直接构建的模块为 `plm-common`、`plm-gateway` 和 `plm-system`。网关配置中还包含其他业务服务的路由；只有在对应服务已部署并完成服务发现配置时，这些路由才可用。生产部署前请在目标环境验证所需业务范围。

## 功能范围

- **PLM 研发管理：** 产品与物料主数据、BOM、图文档、CAD 关联、工程变更、规格、工艺、检验与质量。
- **制造与供应链：** ERP、MES、WMS、SRM、EDI、条码标签、生产执行、库存和发货追溯等业务入口。
- **协同与平台：** OA、组织与权限、流程协同、数据字典、配置、审计和运营看板。
- **集成与迁移：** 外部系统接口、迁移批次、映射、回执、异常补偿及对账等管理能力。

功能页面的完整度取决于当前部署的后端服务、数据库迁移和外部系统配置；菜单可见不代表相应外部依赖已经接通。

## 架构与技术栈

| 层次 | 技术与位置 |
| --- | --- |
| Web 前端 | React 18、TypeScript、Vite、Ant Design 5，位于 `plm-frontend/` |
| API 网关 | Spring Boot 3.2、Spring Cloud Gateway，默认监听 `8080` |
| 系统服务 | Spring Boot 3.2、MyBatis-Plus、Flyway，默认监听 `8082` |
| 公共模块 | `plm-common/`，由后端服务依赖 |
| 生产数据库 | PostgreSQL；通过 Flyway 管理 `plm-system` 数据库迁移 |
| 本地开发数据库 | H2（PostgreSQL 兼容模式），由 `dev` profile 配置 |

前端默认访问同源 `/api`，Vite 开发服务器将其转发到 `http://localhost:8080`。生产静态站点也应将 `/api` 反向代理到 API 网关。

## 仓库结构

```text
.
├── README.md
├── docs/
│   └── 运维手册.md
├── plm-backend/
│   ├── pom.xml
│   ├── plm-common/
│   ├── plm-gateway/
│   └── plm-system/
│       └── src/main/resources/db/migration/
└── plm-frontend/
    ├── package.json
    └── src/
```

## 快速开始

### 环境要求

- Java 17
- Maven 3.8+
- Node.js 20 LTS（建议）及 npm
- 生产环境：PostgreSQL；网关启用 Redis 相关功能时需提供可达的 Redis 实例

### 本地启动

网关本地开发使用独立的 loopback Redis（端口 `6381`），启用认证及 AOF/RDB 持久化。先启动 Redis 并在同一个终端导出其本地密码：

   ```bash
   bash scripts/test-redis.sh start
   export PLM_REDIS_PASSWORD="$(<.local/redis-test/password)"
   ```

本地 Redis 数据和密码仅写入 Git 忽略的 `.local/redis-test/`。不要删除或覆盖该目录来“重置”数据；如需清理，请先确认其中仅有可丢弃的本地测试数据。

首次启动本地系统服务前，需提供至少 32 字节的随机 JWT 密钥。若尚无 `.env.local`，在仓库根目录仅执行一次：

```bash
if [ ! -e .env.local ]; then
  umask 077
  printf 'PLM_JWT_SECRET=%s\n' "$(openssl rand -hex 64)" > .env.local
  chmod 600 .env.local
else
  printf '.env.local exists; preserving it.\n'
fi
```

不要覆盖已有 `.env.local`；该文件包含本地凭据并已被 Git 忽略。每次启动系统服务前，在同一终端加载它：

```bash
set -a
. ./.env.local
set +a
```

1. 启动系统服务（默认 `dev` profile 使用内存 H2 数据库）：

   ```bash
   cd plm-backend
   mvn -pl plm-system -am package
   java -jar plm-system/target/plm-system-1.0.0-SNAPSHOT.jar
   ```

2. 另开终端加载本机 JWT 密钥并导出测试 Redis 密码，再启动网关：

   ```bash
   # 在仓库根目录执行
   set -a
   . ./.env.local
   set +a
   export PLM_REDIS_PASSWORD="$(<.local/redis-test/password)"
   cd plm-backend
   mvn -pl plm-gateway -am package
   java -jar plm-gateway/target/plm-gateway-1.0.0-SNAPSHOT.jar
   ```

3. 另开终端启动前端：

   ```bash
   cd plm-frontend
   npm ci
   npm run dev
   ```

4. 打开 Vite 输出的本地地址（默认 `http://localhost:3000`）。前端 API 经由网关 `8080` 转发到系统服务 `8082`。

首次启动系统服务时，Flyway 会执行数据库迁移。H2 为内存数据库，进程停止后数据不保留；不要将其用于生产环境。
完成本地联调并停止网关后，可在终端运行 `bash scripts/test-redis.sh stop` 停止 Redis；正常停止会保留 Redis 数据。
隔离测试管理员及测试账号的初始化步骤见[运维手册](./docs/运维手册.md#隔离测试账号初始化)；脚本只允许 loopback H2，不要将生成的 `.env.local` 提交或发送到聊天/工单。

`admin123` 仅是全新 dev H2 数据库中 Flyway 初始管理员的密码。运行隔离管理员初始化后，`admin` 密码会被轮换为随机值并保存在被 Git 忽略的 `.env.local` 的 `PLM_PROVISIONER_PASSWORD` 项中；之后不能再用 `admin123` 登录。不要把该值发送到聊天、工单或提交到仓库。

### 构建

```bash
# 从 Git 仓库根目录构建并注入版本、commit 与构建时间
bash scripts/build-versioned.sh

# 后端聚合工程
cd plm-backend
mvn clean package

# 前端类型检查及生产构建
cd ../plm-frontend
npm ci
npm run build
```

构建产物分别位于各后端模块的 `target/` 和前端 `plm-frontend/dist/`。运维部署步骤、环境变量、备份恢复和故障排查见[详细运维手册](docs/运维手册.md)。
第三轮 WBS 的当前开发状态和验证边界见[开发进度报告](reports/00-development-progress.md)。
版本化构建脚本会将 Git commit 写入后端 `/actuator/info` 与前端主布局页脚；发布制品必须从干净的已提交工作区构建，不能发布标记为 `-dirty` 或 `unknown` 的制品。

## API 与运行状态

- API 统一入口：`http://<网关地址>:8080/api`
- 网关健康检查：`http://<网关地址>:8080/actuator/health`
- 系统服务健康检查：`http://<系统服务地址>:8082/actuator/health`

Actuator 端点只应在可信网络内开放；请在负载均衡、防火墙或 API 网关层限制访问。

## 安全与运维提示

- 生产环境必须设置独立、随机且保密的 `PLM_JWT_SECRET`，并通过密钥管理系统或受限环境变量注入；不得沿用仓库中的开发默认值。
- 生产数据库密码、令牌密钥和外部系统凭据不得提交到 Git，也不要写入镜像或日志。
- 生产环境使用 `SPRING_PROFILES_ACTIVE=prod` 并显式配置数据库连接。
- 数据库和本地文件存储都需要纳入备份。文档及邮件附件默认位于后端工作目录下的 `data/` 子目录。
- 数据库迁移会在系统服务启动时执行。升级前应先备份，并在预生产环境验证迁移和回滚方案。

## 详细文档

- [详细运维手册](docs/运维手册.md)：部署、配置、启动/停止、健康检查、数据库迁移、备份恢复、升级、监控、安全和故障处置。
