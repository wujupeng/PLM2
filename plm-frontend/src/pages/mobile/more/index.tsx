import { Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  BellOutlined,
  DesktopOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MailOutlined,
  MobileOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';

interface MoreEntry {
  key: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

/** 移动端更多：文档、通知、通讯录等次级入口与账号操作。 */
export default function MobileMorePage() {
  const navigate = useNavigate();
  const userInfo = useAuthStore((state) => state.userInfo);
  const logout = useAuthStore((state) => state.logout);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const entries: MoreEntry[] = [
    {
      key: 'docs',
      name: '文档中心',
      icon: <FileTextOutlined />,
      color: '#fa8c16',
      onClick: () => navigate('/m/docs'),
    },
    {
      key: 'notifications',
      name: '消息通知',
      icon: <BellOutlined />,
      color: '#eb2f96',
      onClick: () => navigate('/m/notifications'),
    },
    {
      key: 'mail',
      name: '内部邮件',
      icon: <MailOutlined />,
      color: '#13c2c2',
      onClick: () => navigate('/m/mail'),
    },
    {
      key: 'address-book',
      name: '通讯录',
      icon: <TeamOutlined />,
      color: '#52c41a',
      onClick: () => navigate('/oa/address-book'),
    },
    {
      key: 'desktop',
      name: '返回桌面版',
      icon: <DesktopOutlined />,
      color: '#1677ff',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'logout',
      name: '退出登录',
      icon: <LogoutOutlined />,
      color: '#ff4d4f',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  if (hasPermission('oa:mobile:manage')) {
    entries.splice(4, 0, {
      key: 'mobile-admin',
      name: '移动端配置',
      icon: <MobileOutlined />,
      color: '#722ed1',
      onClick: () => navigate('/oa/mobile-admin'),
    });
  }

  return (
    <div>
      <Card size="small" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          {userInfo?.displayName || userInfo?.username || '用户'}
        </div>
        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
          账号：{userInfo?.username || '-'}
        </div>
      </Card>

      <Card size="small" title="更多功能">
        <div className="mobile-quick-grid">
          {entries.map((entry) => (
            <div key={entry.key} className="mobile-quick-item" onClick={entry.onClick}>
              <span style={{ fontSize: 22, color: entry.color, lineHeight: 1 }}>{entry.icon}</span>
              <span style={{ fontSize: 12, color: '#595959' }}>{entry.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
