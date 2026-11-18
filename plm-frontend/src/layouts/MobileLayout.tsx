import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown } from 'antd';
import {
  AppstoreOutlined,
  AuditOutlined,
  CheckSquareOutlined,
  DesktopOutlined,
  LogoutOutlined,
  MailOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';

interface MobileTab {
  key: string;
  name: string;
  icon: React.ReactNode;
}

const TABS: MobileTab[] = [
  { key: '/m/workbench', name: '工作台', icon: <AppstoreOutlined /> },
  { key: '/m/tasks', name: '待办', icon: <CheckSquareOutlined /> },
  { key: '/m/approvals', name: '审批', icon: <AuditOutlined /> },
  { key: '/m/mail', name: '邮件', icon: <MailOutlined /> },
  { key: '/m/more', name: '更多', icon: <MoreOutlined /> },
];

const TITLE_MAP: Record<string, string> = {
  '/m/workbench': '移动工作台',
  '/m/tasks': '我的待办',
  '/m/approvals': '我的审批',
  '/m/mail': '内部邮件',
  '/m/docs': '文档中心',
  '/m/notifications': '消息通知',
  '/m/more': '更多功能',
};

/**
 * 移动端门户外壳（OA-DEV-061）：顶部标题栏 + 内容区 + 底部标签栏。
 * 采用流式布局与安全区适配，主流手机分辨率下可直接操作并进行移动审批。
 */
export default function MobileLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useAuthStore((state) => state.userInfo);
  const logout = useAuthStore((state) => state.logout);

  const activeTab = TABS.find((tab) => location.pathname.startsWith(tab.key))?.key ?? '/m/workbench';
  const title =
    TITLE_MAP[location.pathname] || TABS.find((tab) => tab.key === activeTab)?.name || '移动办公';

  return (
    <div className="mobile-viewport">
      <div className="mobile-shell">
        <header className="mobile-header">
          <span className="mobile-header-title">{title}</span>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'desktop',
                  icon: <DesktopOutlined />,
                  label: '返回桌面版',
                  onClick: () => navigate('/dashboard'),
                },
                { type: 'divider' as const },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: () => {
                    logout();
                    navigate('/login');
                  },
                },
              ],
            }}
          >
            <span className="mobile-header-user">
              {userInfo?.displayName || userInfo?.username || '用户'}
            </span>
          </Dropdown>
        </header>

        <main className="mobile-content">
          <Outlet />
        </main>

        <nav className="mobile-tabbar">
          {TABS.map((tab) => (
            <div
              key={tab.key}
              className={`mobile-tabbar-item${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => navigate(tab.key)}
            >
              <span className="mobile-tabbar-icon">{tab.icon}</span>
              <span>{tab.name}</span>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
