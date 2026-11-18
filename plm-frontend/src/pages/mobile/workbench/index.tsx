import { useCallback, useEffect, useState } from 'react';
import { Card, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  AuditOutlined,
  BellOutlined,
  CheckSquareOutlined,
  FileTextOutlined,
  MailOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { oaMobileConfigService } from '@/services/oaService';
import type { OaMobileWorkbench } from '@/types/oa';
import { useAuthStore } from '@/stores/authStore';

interface QuickEntry {
  key: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const QUICK_ENTRIES: QuickEntry[] = [
  { key: '/m/tasks', name: '待办', icon: <CheckSquareOutlined />, color: '#1677ff' },
  { key: '/m/approvals', name: '审批', icon: <AuditOutlined />, color: '#722ed1' },
  { key: '/m/mail', name: '邮件', icon: <MailOutlined />, color: '#13c2c2' },
  { key: '/m/docs', name: '文档', icon: <FileTextOutlined />, color: '#fa8c16' },
  { key: '/m/notifications', name: '通知', icon: <BellOutlined />, color: '#eb2f96' },
  { key: '/m/more', name: '更多', icon: <MoreOutlined />, color: '#8c8c8c' },
];

/** 移动工作台：个人问候、待办/未读汇总、常用功能入口与移动端菜单。 */
export default function MobileWorkbenchPage() {
  const navigate = useNavigate();
  const userInfo = useAuthStore((state) => state.userInfo);

  const [data, setData] = useState<OaMobileWorkbench | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await oaMobileConfigService.workbench();
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const stats = [
    { key: '/m/tasks', title: '待办任务', value: data?.pendingTaskCount ?? 0 },
    { key: '/m/notifications', title: '未读通知', value: data?.unreadNotificationCount ?? 0 },
    { key: '/m/mail', title: '未读邮件', value: data?.unreadMailCount ?? 0 },
  ];

  return (
    <Spin spinning={loading}>
      <Card
        size="small"
        style={{
          marginBottom: 12,
          border: 'none',
          background: 'linear-gradient(135deg, #1677ff, #4096ff)',
        }}
      >
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
          你好，{userInfo?.displayName || userInfo?.username || '同事'}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 }}>
          欢迎使用移动办公 · 待办与审批可随时处理
        </div>
      </Card>

      <Card size="small" style={{ marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {stats.map((item) => (
            <div
              key={item.key}
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => navigate(item.key)}
            >
              <div style={{ fontSize: 20, fontWeight: 600, color: '#1677ff' }}>{item.value}</div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{item.title}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card size="small" title="常用功能" style={{ marginBottom: 12 }}>
        <div className="mobile-quick-grid">
          {QUICK_ENTRIES.map((entry) => (
            <div key={entry.key} className="mobile-quick-item" onClick={() => navigate(entry.key)}>
              <span style={{ fontSize: 22, color: entry.color, lineHeight: 1 }}>{entry.icon}</span>
              <span style={{ fontSize: 12, color: '#595959' }}>{entry.name}</span>
            </div>
          ))}
        </div>
      </Card>

      {(data?.menus?.length ?? 0) > 0 && (
        <Card size="small" title="移动端菜单">
          {data?.menus.map((menu) => (
            <div key={menu.id} className="mobile-list-item" style={{ cursor: 'default' }}>
              <div className="mobile-row">
                <span>{menu.configName}</span>
                <span className="mobile-ellipsis" style={{ color: '#8c8c8c', fontSize: 12 }}>
                  {menu.configValue || menu.configKey}
                </span>
              </div>
            </div>
          ))}
        </Card>
      )}
    </Spin>
  );
}
