# P1 测试基础设施与执行记录

## 已建立

- `tests/api/smoke.test.mjs`：Node 内置测试运行器，对本机 system、gateway、frontend 做 HTTP 冒烟，并验证匿名访问拒绝和空登录字段的中文校验。目标 URL 默认只能是 loopback；禁止用它连接生产/外网。
- `tests/e2e/af1000-closed-loop.spec.ts`：Playwright 真浏览器登录页检查；S01–S20 各自显示为独立的 BLOCKED 测试，不用模拟数据冒充业务闭环。
- `tests/helpers/business-invariants.mjs`：数量守恒及审计状态流转断言 helper，要求提供库存变动、前态/动作/后态/操作者/时间/单据/审计引用。
- `scripts/start-dev.sh`：开发服务启动/就绪检查。遇到已占用且不健康的端口时拒绝终止或替换现有进程。
- `scripts/run-all-tests.sh`：唯一运行入口，生成唯一运行 ID，运行启动检查、API 冒烟、lint、前端构建、Playwright 和（可用时）离线 Maven 测试。
- `playwright.config.ts`：启用失败截图、视频、trace 和 HTML 报告。
- `.github/workflows/test-draft.yml`：仅手工触发的 CI 草稿；尚未在 GitHub Actions 执行或验收。
- 前端新增 `test:smoke`、`test:e2e` 命令。测试账号模板只包含环境变量名，没有密码值。

Playwright HTML 报告：本机 `reports/playwright/html/index.html`（自动生成文件，不纳入 Git）；每轮用例明细保存在被 `.gitignore` 忽略的 `reports/test-runs/<run-id>/`。

## P1 基线执行结果

- 运行 ID：`PLM2-20261120-082851-58121`
- 分支/起始提交：`main` / `2b82cd9`（P0 盘点提交）
- `scripts/start-dev.sh`：FAIL。8080 端口上已有进程但 gateway health 返回 DOWN；脚本安全拒绝替换该进程。
- API 冒烟：5 项，4 PASS、1 FAIL。system H2 health、前端中文 shell、匿名 API 401、空登录字段中文校验通过；gateway health 为 HTTP 503 / DOWN。
- Playwright：21 项，1 PASS、20 BLOCKED（Playwright 显示为 skipped）。登录页真实 UI 的标题、用户名、密码和登录按钮可见；AF1000 主业务步骤因前置账号/业务数据及服务健康条件缺失而阻塞。
- 前端构建：PASS。现有 Vite 构建仍报告 `vendor` / `antd` 循环 chunk 警告。
- ESLint：BLOCKED，ESLint 9 找不到 `eslint.config.*`；没有为绕过失败而跳过 lint。
- 后端 Maven：BLOCKED，本机无 `mvn`，仓库无 Maven wrapper。
- `npm audit`：13 项依赖公告（4 high、9 moderate、0 critical）。包括当前前端依赖树中的 `@ant-design/pro-components`、`vite`、`react-router-dom`；部分修复建议涉及主要版本升级。本轮未自动执行可能有破坏性的升级。
- 种子脚本因本机未提供 provisioner 凭据而安全停止；未写入公司、部门、用户或业务数据。

## 后续复验

- 运行 ID：`PLM2-20261120-084104-76174`
- `scripts/start-dev.sh`：PASS。检查系统服务、网关、前端均 ready；脚本在本机 Redis 未运行时启动仅内存、禁用持久化的 Redis，网关 health 随后为 UP。
- API 冒烟：6 项 PASS、0 FAIL。
- Playwright：21 项，1 PASS、20 BLOCKED。
- 前端构建：PASS。
- Java 17 离线 Maven：`mvn -o -pl plm-system -am test` 为 2 PASS；聚合模块构建成功。此前全工程没有测试类，现已新增这 2 项真实 H2/Spring 集成测试。
- ESLint 仍因缺少 flat config 阻塞；总测脚本因此返回非零。后端其余业务域自动化及完整业务闭环仍未通过验收。

## P1 结论

测试工具链已建立且能够报告真实环境结果；P2 实际组织/用户数据创建、P3 其余模块 API、P4 业务闭环和 P5 全量异常场景仍须按最终报告中的 BLOCKED 项处理。
