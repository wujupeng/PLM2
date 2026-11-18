import { Result } from 'antd';
import { useAuthStore } from '@/stores/authStore';

/**
 * 路由级权限校验：根据权限码判断，无权访问时展示 403 页面。
 * 管理员权限包含通配符 "*"，由 authStore.hasPermission 统一处理。
 */
export default function PermissionGuard({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  if (!hasPermission(permission)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问该页面"
      />
    );
  }

  return <>{children}</>;
}
