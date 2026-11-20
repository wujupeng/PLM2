#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertAllowedTarget } from '../tests/helpers/allowed-target.cjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const targets = {
  frontend: process.env.PLM_TEST_FRONTEND_URL ?? 'http://localhost:3000',
  gateway: process.env.PLM_TEST_GATEWAY_URL ?? 'http://localhost:8080',
  system: process.env.PLM_TEST_SYSTEM_URL ?? 'http://localhost:8082',
};

for (const [name, target] of Object.entries(targets)) {
  targets[name] = assertAllowedTarget(target, `${name} target`).origin;
}

const runId = `PLM2-DEEP-${new Date().toISOString().replaceAll(/[-:.TZ]/g, '').slice(0, 14)}-${process.pid}`;
const evidenceDir = join(root, 'reports/evidence', runId);
mkdirSync(evidenceDir, { recursive: true });

function walk(directory, extension) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path, extension);
    return entry.isFile() && path.endsWith(extension) ? [path] : [];
  });
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function writeCsv(path, headers, rows) {
  writeFileSync(path, [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n') + '\n');
}

function stringValues(annotationArgs) {
  return [...annotationArgs.matchAll(/"([^"]*)"/g)].map((match) => match[1]);
}

function joinRoute(prefix, path) {
  const joined = `${prefix.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  return joined === '/' ? '/' : joined.replace(/\/+/g, '/');
}

function domainFor(path) {
  const segments = path.split('/').filter(Boolean);
  const prefix = segments[0] ?? 'other';
  if (['oa'].includes(prefix)) return 'OA';
  if (prefix === 'erp' && segments[1] === 'sales') return 'ERP Sales';
  if (prefix === 'erp' && segments[1] === 'purchase') return 'ERP Purchase';
  if (['erp'].includes(prefix)) return 'ERP';
  if (['srm'].includes(prefix)) return 'SRM';
  if (['wms'].includes(prefix)) return 'WMS';
  if (['mes'].includes(prefix)) return 'MES';
  if (['mfg'].includes(prefix)) return 'Manufacturing';
  if (['mig'].includes(prefix)) return 'Migration';
  if (['int', 'intg', 'edi'].includes(prefix)) return 'Integration';
  if (['quality', 'inspection'].includes(prefix)) return 'Quality';
  if (['product-data', 'bom', 'document', 'cad', 'eco', 'spec', 'harness', 'compliance', 'packaging', 'process', 'code', 'label', 'relabel'].includes(prefix)) return 'PLM';
  if (['auth', 'system', 'platform', 'admin', 'notification', 'search'].includes(prefix)) return 'Platform';
  return 'Other';
}

function scanControllers() {
  const controllerRoot = join(root, 'plm-backend/plm-system/src/main/java');
  const files = walk(controllerRoot, '.java');
  const routes = [];
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const classIndex = source.search(/\bclass\s+\w+/);
    if (classIndex < 0 || !source.slice(0, classIndex).includes('@RestController')) continue;
    const beforeClass = source.slice(0, classIndex);
    const requestMappings = [...beforeClass.matchAll(/@RequestMapping\s*\(([^)]*)\)/g)];
    const classMatch = requestMappings.at(-1);
    const classPrefix = classMatch ? (stringValues(classMatch[1])[0] ?? '') : '';
    const classMappingIndex = classMatch ? classMatch.index : -1;
    const mappingPattern = /@(GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping|RequestMapping)\s*(?:\(([^)]*)\))?/g;
    for (const match of source.matchAll(mappingPattern)) {
      if (match.index === classMappingIndex) continue;
      const annotationArgs = match[2] ?? '';
      let methods = {
        GetMapping: ['GET'],
        PostMapping: ['POST'],
        PutMapping: ['PUT'],
        PatchMapping: ['PATCH'],
        DeleteMapping: ['DELETE'],
        RequestMapping: [],
      }[match[1]];
      if (match[1] === 'RequestMapping') {
        methods = [...annotationArgs.matchAll(/RequestMethod\.(GET|POST|PUT|PATCH|DELETE)/g)].map((item) => item[1]);
        if (methods.length === 0) methods = ['ANY'];
      }
      const paths = stringValues(annotationArgs);
      if (paths.length === 0) paths.push('');
      const afterAnnotation = source.slice(match.index + match[0].length);
      const methodMatch = afterAnnotation.match(/(?:public|protected|private)\s+[\w<>?,.\[\] ]+\s+(\w+)\s*\(/);
      const methodName = methodMatch?.[1] ?? '';
      const methodOffset = methodMatch?.index ?? 0;
      const precedingAnnotations = afterAnnotation.slice(0, methodOffset);
      const permission = precedingAnnotations.match(/@RequirePermission\s*\(\s*"([^"]+)"\s*\)/)?.[1] ?? '';
      const line = source.slice(0, match.index).split('\n').length;
      for (const method of methods) {
        for (const path of paths) {
          const fullPath = joinRoute(classPrefix, path);
          routes.push({
            domain: domainFor(fullPath),
            method,
            path: fullPath,
            permission,
            controller: relative(root, file),
            methodName,
            line,
          });
        }
      }
    }
  }
  return routes;
}

function normalizePath(path) {
  return path
    .replace(/\$\{([^}]+)\}/g, ':$1')
    .replace(/\{[^}]+\}/g, '{}')
    .replace(/:[A-Za-z_$][\w$]*/g, '{}')
    .replace(/^\/api(?=\/|$)/, '')
    .split('?')[0]
    .replace(/\/+/g, '/')
    .replace(/\/$/, '') || '/';
}

function scanFrontendCalls() {
  const serviceRoot = join(root, 'plm-frontend/src/services');
  const files = walk(serviceRoot, '.ts');
  const calls = [];
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const basePath = source.match(/(?:const|let)\s+BASE\s*=\s*['"`]([^'"`]+)['"`]/)?.[1] ?? '';
    for (const match of source.matchAll(/url\s*:\s*(['"`])([\s\S]*?)\1/g)) {
      const before = source.slice(Math.max(0, match.index - 500), match.index);
      const method = [...before.matchAll(/method\s*:\s*['"`](GET|POST|PUT|PATCH|DELETE)['"`]/g)].at(-1)?.[1] ?? '';
      let path = match[2].replaceAll('${BASE}', basePath).replace(/\$\{[^}]+\}/g, '{}');
      if (!path.startsWith('/')) path = `/${path}`;
      const line = source.slice(0, match.index).split('\n').length;
      calls.push({
        domain: domainFor(normalizePath(path)),
        method,
        path,
        normalizedPath: normalizePath(path),
        service: relative(root, file),
        line,
      });
    }
  }
  return calls;
}

function normalizeMethod(method) {
  return method.toUpperCase();
}

async function probe(name, url) {
  const started = performance.now();
  let response;
  try {
    response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(name.includes('openapi') ? 10000 : 4000),
    });
  } catch (error) {
    return {
      name,
      url,
      status: null,
      durationMs: Math.round(performance.now() - started),
      responseBytes: 0,
      error: error.message,
    };
  }
  try {
    const body = await response.text();
    const parsedBody = name.endsWith('health') || name.endsWith('-info') ? safeJson(body) : undefined;
    return {
      name,
      url,
      status: response.status,
      durationMs: Math.round(performance.now() - started),
      responseBytes: Buffer.byteLength(body),
      contentType: response.headers.get('content-type') ?? '',
      health: name.endsWith('health') ? redactLocalPaths(parsedBody) : undefined,
      infoKeys: name.endsWith('-info') && parsedBody && typeof parsedBody === 'object'
        ? Object.keys(parsedBody)
        : undefined,
      frontendChineseShell: ['frontend-root', 'frontend-dashboard'].includes(name) && body.includes('<html lang="zh-CN">'),
    };
  } catch (error) {
    return {
      name,
      url,
      status: response.status,
      durationMs: Math.round(performance.now() - started),
      responseBytes: 0,
      bodyError: error.message,
    };
  }
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { parseError: true };
  }
}

function redactLocalPaths(value) {
  if (!process.env.HOME || value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value).replaceAll(process.env.HOME, '$HOME'));
}

function commandOutput(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 5000 });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  return output || (result.error ? `${command}: unavailable` : '');
}

function serviceProcesses() {
  const output = commandOutput('lsof', ['-nP', '-iTCP:3000', '-iTCP:8080', '-iTCP:8082', '-iTCP:6379', '-sTCP:LISTEN']);
  const rows = output.split('\n').slice(1).filter(Boolean);
  return rows.map((row) => {
    const parts = row.trim().split(/\s+/);
    const pid = Number(parts[1]);
    const details = commandOutput('ps', ['-p', String(pid), '-o', 'lstart=,command='])
      .replace(/((?:password|token|secret|api[_-]?key)=)[^\s]+/gi, '$1[REDACTED]')
      .replaceAll(process.env.HOME ?? '', process.env.HOME ? '$HOME' : '');
    return {
      process: parts[0],
      pid,
      address: parts.slice(8).join(' '),
      details,
    };
  });
}

const endpoints = scanControllers();
const frontendCalls = scanFrontendCalls();
const backendKeys = new Set(endpoints.map((route) => `${normalizeMethod(route.method)} ${normalizePath(route.path)}`));
const callRows = frontendCalls.map((call) => {
  const key = `${normalizeMethod(call.method || 'GET')} ${call.normalizedPath}`;
  const found = backendKeys.has(key) || backendKeys.has(`ANY ${call.normalizedPath}`);
  return { ...call, backendMatch: found ? 'candidate-match' : 'no-static-match' };
});
const frontendKeys = new Set(callRows.map((call) => `${normalizeMethod(call.method || 'GET')} ${call.normalizedPath}`));
const routeIsUsed = (route) => {
  const path = normalizePath(route.path);
  if (route.method === 'ANY') return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].some((method) => frontendKeys.has(`${method} ${path}`));
  return frontendKeys.has(`${route.method} ${path}`);
};

writeCsv(join(root, 'reports/11-endpoints.csv'),
  ['domain', 'method', 'path', 'permission', 'controller', 'methodName', 'line', 'staticFrontendMatch'],
  endpoints.map((route) => [route.domain, route.method, route.path, route.permission, route.controller, route.methodName, route.line, routeIsUsed(route) ? 'candidate-match' : 'no-static-match']));
writeCsv(join(root, 'reports/12-frontend-calls.csv'),
  ['domain', 'method', 'path', 'service', 'line', 'staticBackendMatch'],
  callRows.map((call) => [call.domain, call.method, call.path, call.service, call.line, call.backendMatch]));

const probes = [
  await probe('system-health', `${targets.system}/actuator/health`),
  await probe('gateway-health', `${targets.gateway}/actuator/health`),
  await probe('system-info', `${targets.system}/actuator/info`),
  await probe('gateway-info', `${targets.gateway}/actuator/info`),
  await probe('system-actuator-root', `${targets.system}/actuator`),
  await probe('gateway-actuator-root', `${targets.gateway}/actuator`),
  await probe('system-swagger-ui', `${targets.system}/swagger-ui/index.html`),
  await probe('system-openapi-docs', `${targets.system}/v3/api-docs`),
  await probe('gateway-swagger-ui', `${targets.gateway}/swagger-ui/index.html`),
  await probe('gateway-openapi-docs', `${targets.gateway}/v3/api-docs`),
  await probe('frontend-root', `${targets.frontend}/`),
  await probe('frontend-dashboard', `${targets.frontend}/dashboard`),
];
const processes = serviceProcesses();
const redisListening = processes.some((item) => item.address.includes(':6379'));
const domains = [...new Set([...endpoints.map((row) => row.domain), ...callRows.map((row) => row.domain)])].sort();
const domainSummary = domains.map((domain) => {
  const backend = endpoints.filter((row) => row.domain === domain);
  const frontend = callRows.filter((row) => row.domain === domain);
  const unusedBackend = backend.filter((route) => !routeIsUsed(route)).length;
  return {
    domain,
    controllerRoutes: backend.length,
    getRoutes: backend.filter((row) => row.method === 'GET' || row.method === 'ANY').length,
    frontendCalls: frontend.length,
    staticMatches: frontend.filter((row) => row.backendMatch === 'candidate-match').length,
    unmatchedFrontendCalls: frontend.filter((row) => row.backendMatch === 'no-static-match').length,
    backendRoutesWithoutFrontendMatch: unusedBackend,
  };
});

writeFileSync(join(evidenceDir, 'environment.json'), JSON.stringify({
  runId,
  targets,
  probes,
  processes,
  runtime: {
    node: commandOutput('node', ['--version']),
    java: commandOutput('java', ['-version']),
    maven: commandOutput('mvn', ['-version']),
    docker: commandOutput('docker', ['ps', '--format', '{{.Names}} {{.Image}}']),
    systemctl: commandOutput('systemctl', ['list-units', '--type=service', '--no-pager']),
  },
  scan: { controllerRoutes: endpoints.length, frontendCalls: callRows.length, domains: domainSummary },
}, null, 2) + '\n');

const getRoutes = endpoints.filter((route) => route.method === 'GET');
writeCsv(join(root, 'reports/13-endpoint-probe.csv'),
  ['domain', 'method', 'path', 'probeStatus', 'httpStatus', 'durationMs', 'responseBytes', 'reason'],
  getRoutes.map((route) => [
    route.domain,
    route.method,
    route.path,
    'BLOCKED',
    '',
    '',
    '',
    'Admin credentials and seeded record identifiers are not configured; no business request was sent.',
  ]));

const maturityRows = domainSummary.map((row) =>
  `| ${row.domain} | ${row.controllerRoutes} | 0 | 0 | 0 | 0 | 0 | 0 | 0 | ${row.controllerRoutes} |`,
).join('\n');
writeFileSync(join(root, 'reports/15-maturity-matrix.md'), `# 第二轮成熟度矩阵（证据门槛口径）

本表以静态 Controller 路由数作为待验证候选点，不把路由/页面/service 文件存在当作 L1–L6 成熟度证据。此轮只做了 P0 只读健康探测和 A1 源码静态匹配；A2 业务接口、登录后 UI、持久化、规则、跨模块联动和闭环均未实测。故 L0–L6 计数均为**已证实数量**，候选点仍列在“未评级”列；这不表示功能不存在，也不应把未评级解释为 L0。

| 业务域 | 静态路由候选数 | L0 | L1 | L2 | L3 | L4 | L5 | L6 | 未评级 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${maturityRows}
| **合计** | **${endpoints.length}** | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **${endpoints.length}** |

热力图：L0–L6 暂无任何达到对应级别的业务功能点证据（空白/0 = 未证实，不等于缺少代码）。全部 ${endpoints.length} 个静态 Controller 路由候选点等待在线探测与角色测试。

逐路由候选证据见 [11-endpoints.csv](./11-endpoints.csv) 和 [12-frontend-calls.csv](./12-frontend-calls.csv)。方法/路径静态匹配只是请求对照，不证明 HTTP 成功或输入变异有效；没有把任何接口判为 STUB，因未运行变异检查。
`);

const tableRows = domainSummary.map((row) =>
  `| ${row.domain} | ${row.controllerRoutes} | ${row.getRoutes} | ${row.frontendCalls} | ${row.staticMatches} | ${row.unmatchedFrontendCalls} | ${row.backendRoutesWithoutFrontendMatch} |`,
).join('\n');
const probeRows = probes.map((item) => {
  const summary = item.health !== undefined
    ? JSON.stringify(item.health)
    : item.infoKeys !== undefined
      ? JSON.stringify({ keys: item.infoKeys })
      : item.frontendChineseShell
        ? 'Chinese SPA shell'
        : item.bodyError ?? item.error ?? 'Response received; body not retained';
  return `| ${item.name} | ${item.url} | ${item.status ?? 'no response'} | ${item.durationMs} | ${item.responseBytes} | ${summary} |`;
}).join('\n');
const processRows = processes.map((item) =>
  `| ${item.process} | ${item.pid} | ${item.address} | ${item.details.replaceAll('|', '\\|')} |`,
).join('\n');

writeFileSync(join(root, 'reports/10-env-discovery.md'), `# 第二轮 P0 环境发现

- 运行：${runId}
- 目标：隔离 localhost 测试环境；允许 origin 严格来自 [allowed-hosts.json](../test-data/allowed-hosts.json)。
- 用户给定前端入口：\`http://localhost:3000/dashboard\`；本次只读取 SPA、健康/版本和公开 API 文档入口，不登录、不写数据、不重启服务。
- 数据库：源码开发配置声明 H2 内存库（\`DB_CLOSE_DELAY=-1\`，仅进程生命周期内保持）；本轮未取得只读数据库账号，运行时表数及 Flyway 当前版本未做 SQL 核验。
- Flyway：源码迁移最高版本 V172；运行库当前迁移版本及实际表数未通过只读 SQL 核验。Node/Java/Maven 命令行版本及 Docker/systemctl 可用性见证据 JSON 的 \`runtime\` 字段；Maven 版本探测因 \`JAVA_HOME\` 配置不正确而失败，不能据此比较部署构建版本。
- 注册中心目标：网关源码含 \`lb://plm-manufacturing\`、\`plm-integration\`、\`plm-auth-workflow\`、\`plm-admin\`、\`plm-notification\`、\`plm-search\`；本机无注册中心访问配置，实例在线状态未验证。当前聚合工程不包含这些服务模块。
- 管理员：没有从开发记录取得管理员凭据；未尝试猜测/默认密码。登录及角色菜单验证阻塞。
- 中间件：${redisListening ? '发现本地 Redis :6379 监听进程' : '未发现本地 Redis :6379 监听进程'}；本次发现阶段未启动 Redis、消息队列或其他服务。消息队列、附件存储、邮件/短信配置和生产版本无法仅凭本地进程清单确认。
- 本机三个服务端口均由通配地址监听（\`*:3000\`、\`*:8080\`、\`*:8082\`）；本轮只连 loopback，未验证局域网/公网可达性或防火墙策略。

## 监听服务与进程

| 进程 | PID | 监听地址 | 启动时间/命令 |
|---|---:|---|---|
${processRows || '| 未发现 | — | — | — |'}

ss、docker 和 systemd 清单工具在当前 macOS 环境不可用；使用 \`lsof\` 与 \`ps\` 记录进程。命令版本/可用性见同目录的 \`evidence/${runId}/environment.json\`。

## 网关服务发现目标

| lb:// 目标 | 聚合工程含对应模块 | 注册实例状态 |
|---|---|---|
| plm-manufacturing | 否 | 未验证（本机无注册中心访问配置） |
| plm-integration | 否 | 未验证（本机无注册中心访问配置） |
| plm-auth-workflow | 否 | 未验证（本机无注册中心访问配置） |
| plm-admin | 否 | 未验证（本机无注册中心访问配置） |
| plm-notification | 否 | 未验证（本机无注册中心访问配置） |
| plm-search | 否 | 未验证（本机无注册中心访问配置） |

“聚合工程不含”仅是本仓库构建范围，不代表部署环境不存在实例；未拿到服务注册中心凭据或访问地址，所以不将它们误记为离线。

## HTTP 只读探测

| 探测 | URL | HTTP | 耗时(ms) | 响应字节 | 结果摘要 |
|---|---|---:|---:|---:|---|
${probeRows}

所有 HTTP 访问均为健康、版本、Actuator 根索引、Swagger/OpenAPI 暴露面和 SPA shell 的只读 GET；没有调用业务 API。Actuator 版本端点不可用时，不以源码版本代替部署版本；当前无镜像标签/部署包提交号可比对。

## A1 静态接口对照（候选，不是功能通过）

Controller 方法映射与前端 service literal URL 对照如下。路径/方法匹配只代表源码候选关系，不能证明目标服务在线、请求成功、返回非桩数据或业务可用。

| 业务域 | Controller 路由 | GET 路由 | 前端调用 | 静态匹配 | 前端无后端静态匹配 | 后端无前端静态匹配 |
|---|---:|---:|---:|---:|---:|---:|
${tableRows}

- 详细清单：[Controller 端点](./11-endpoints.csv)、[前端调用](./12-frontend-calls.csv)。
- [在线 GET 探测](./13-endpoint-probe.csv) 中所有业务接口均为 BLOCKED；没有管理员凭据和有效记录 ID，因此没有请求业务 API。
- 静态解析结果不覆盖动态拼接 URL、Gateway 转换、服务发现在线性等运行行为；匹配结果不能提升至 L2。
- [成熟度矩阵](./15-maturity-matrix.md)按证据门槛将所有静态候选点列为未评级，没有用代码数量虚报业务成熟度。

## P0 结论与阻塞

- 当前运行基线仅能识别本机监听进程；不能代表外部测试机/生产部署。
- H2 内存库意味着重启持久性和跨进程数据对账无法通过本轮只读探测判定；本轮未重启。
- 注册中心、最近错误日志、数据库元数据/只读账号及部署 commit 均未取证。
- P1 数据创建、A2 在线业务接口探测、A3 页面遍历、A4/A5、闭环与强度测试均 BLOCKED：缺少管理员/业务角色账号、只读数据库凭据和业务授权。只能在本地 \`.env.local\` 配置凭据后再继续，并保持白名单限制。
`);

console.log(`Run ${runId}`);
console.log(`Java controller routes: ${endpoints.length}; frontend service calls: ${callRows.length}`);
console.log(`Reports: reports/10-env-discovery.md, reports/11-endpoints.csv, reports/12-frontend-calls.csv`);
