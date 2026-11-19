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

1. 启动系统服务（默认 `dev` profile 使用内存 H2 数据库）：

   ```bash
   cd plm-backend
   mvn -pl plm-system -am spring-boot:run
   ```

2. 另开终端启动网关：

   ```bash
   cd plm-backend
   mvn -pl plm-gateway -am spring-boot:run
   ```

3. 另开终端启动前端：

   ```bash
   cd plm-frontend
   npm ci
   npm run dev
   ```

4. 打开 Vite 输出的本地地址（默认 `http://localhost:3000`）。前端 API 经由网关 `8080` 转发到系统服务 `8082`。

首次启动系统服务时，Flyway 会执行数据库迁移。H2 为内存数据库，进程停止后数据不保留；不要将其用于生产环境。

### 构建

```bash
# 后端聚合工程
cd plm-backend
mvn clean package

# 前端类型检查及生产构建
cd ../plm-frontend
npm ci
npm run build
```

构建产物分别位于各后端模块的 `target/` 和前端 `plm-frontend/dist/`。运维部署步骤、环境变量、备份恢复和故障排查见[详细运维手册](docs/运维手册.md)。

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
