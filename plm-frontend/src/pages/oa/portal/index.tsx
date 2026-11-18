import { useCallback, useEffect, useState } from 'react';
import { Card, Col, Empty, Row, Space, Spin, Statistic, Tag, Typography } from 'antd';
import {
  ApiOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { oaPortalService } from '@/services/oaService';
import {
  OA_APPLICATION_TYPE_LABEL,
  type OaPortalApplicationItem,
  type OaPortalHome,
} from '@/types/oa';

const { Title, Text, Paragraph } = Typography;

/** 应用图标映射：按应用登记的 icon 名称解析，未登记时回退通用图标。 */
const APP_ICON_MAP: Record<string, React.ReactNode> = {
  HomeOutlined: <HomeOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  ToolOutlined: <ToolOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
  ApiOutlined: <ApiOutlined />,
};

export default function OaPortalPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<OaPortalHome | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await oaPortalService.home();
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openApplication = (app: OaPortalApplicationItem) => {
    if (!app.entryUrl) return;
    if (app.entryUrl.startsWith('http')) {
      window.open(app.entryUrl, '_blank', 'noopener,noreferrer');
    } else if (app.entryUrl.startsWith('/')) {
      navigate(app.entryUrl);
    }
  };

  return (
    <Spin spinning={loading}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Card>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>
              您好，{data?.displayName || data?.username || '用户'}
            </Title>
            <Text type="secondary">
              账号：{data?.username || '-'}
              {data?.organization ? ` · 组织：${data.organization}` : ''}
            </Text>
            <Space size="small" wrap>
              {(data?.roles || []).length > 0 ? (
                (data?.roles || []).map((role) => (
                  <Tag key={role} color="blue">
                    {role}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">暂无角色</Text>
              )}
            </Space>
          </Space>
        </Card>

        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="我已授权他人代理"
                value={data?.myDelegationCount ?? 0}
                suffix="项"
                prefix={<SwapOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="他人授权我代理"
                value={data?.delegatedToMeCount ?? 0}
                suffix="项"
                prefix={<SwapOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="可访问应用"
                value={data?.applications?.length ?? 0}
                suffix="个"
                prefix={<AppstoreOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card title="应用中心">
          {(data?.applications || []).length === 0 ? (
            <Empty description="暂无可访问的应用" />
          ) : (
            <Row gutter={[16, 16]}>
              {(data?.applications || []).map((app) => (
                <Col key={app.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable={!!app.entryUrl}
                    onClick={() => openApplication(app)}
                    style={{ cursor: app.entryUrl ? 'pointer' : 'default' }}
                  >
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Space size="middle">
                        <span style={{ fontSize: 24, color: '#1677ff' }}>
                          {APP_ICON_MAP[app.icon || ''] || <AppstoreOutlined />}
                        </span>
                        <Text strong>{app.appName}</Text>
                      </Space>
                      <Space size="small" wrap>
                        {app.appType && (
                          <Tag>{OA_APPLICATION_TYPE_LABEL[app.appType] || app.appType}</Tag>
                        )}
                        {app.appCategory && <Tag color="geekblue">{app.appCategory}</Tag>}
                        {app.ssoEnabled === 1 && <Tag color="green">SSO</Tag>}
                      </Space>
                      {!app.entryUrl && (
                        <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
                          暂未配置访问地址
                        </Paragraph>
                      )}
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>
      </Space>
    </Spin>
  );
}
