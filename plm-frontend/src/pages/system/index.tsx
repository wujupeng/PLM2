import { Outlet } from 'react-router-dom';

/**
 * 系统管理容器页：仅承载 /system/* 下属子路由。
 * 具体功能由 users / organizations / roles / dictionaries / configs / audit-logs 子页面实现。
 */
export default function SystemManagement() {
  return <Outlet />;
}
