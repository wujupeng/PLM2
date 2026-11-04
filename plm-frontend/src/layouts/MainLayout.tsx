import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ProLayout } from '@ant-design/pro-components';
import { Dropdown } from 'antd';
import { LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';

const menuRoute = {
  path: '/',
  routes: [
    { path: '/dashboard', name: '工作台', icon: 'SmileOutlined' },
    { path: '/material', name: '物料管理', icon: 'DatabaseOutlined' },
    { path: '/bom', name: 'BOM 管理', icon: 'ApartmentOutlined' },
    { path: '/eco', name: '工程变更', icon: 'SwapOutlined' },
    { path: '/document', name: '文档图纸', icon: 'FileTextOutlined' },
    { path: '/cad', name: 'CAD 集成', icon: 'BlockOutlined' },
    { path: '/manufacturing', name: '制造协同', icon: 'ToolOutlined' },
    { path: '/system', name: '系统管理', icon: 'SettingOutlined' },
  ],
};

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, setCollapsed } = useAppStore();
  const { userInfo, logout } = useAuthStore();

  return (
    <ProLayout
      title="PLM 系统"
      logo={null}
      layout="mix"
      fixSiderbar
      fixedHeader
      collapsed={collapsed}
      onCollapse={setCollapsed}
      location={{ pathname: location.pathname }}
      route={menuRoute}
      menuItemRender={(item, dom) => (
        <div onClick={() => item.path && navigate(item.path)}>{dom}</div>
      )}
      avatarProps={{
        src: userInfo?.avatar,
        size: 'small',
        title: userInfo?.displayName || userInfo?.username || '用户',
        render: (_, dom) => (
          <Dropdown
            menu={{
              items: [
                { key: 'settings', icon: <SettingOutlined />, label: '个人设置' },
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
            {dom}
          </Dropdown>
        ),
      }}
      footerRender={() => (
        <div style={{ textAlign: 'center', padding: '8px 0', color: 'rgba(0,0,0,0.45)' }}>
          华为云团队交付版 · 制造业 PLM 系统 ©2024
        </div>
      )}
    >
      <Outlet />
    </ProLayout>
  );
}