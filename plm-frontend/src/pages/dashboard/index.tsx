import { Card, Col, Row, Statistic, Typography, Space, Tag } from 'antd';
import {
  DatabaseOutlined,
  ApartmentOutlined,
  SwapOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

export default function Dashboard() {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4}>工作台</Title>
      </div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="物料总数"
              value={0}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="BOM 数量"
              value={0}
              prefix={<ApartmentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在途变更"
              value={0}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="文档总数"
              value={0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Card title="系统状态">
        <Space size="large">
          <Tag color="green">API Gateway: 在线</Tag>
          <Tag color="blue">阶段: S1 项目启动</Tag>
          <Tag color="orange">阶段门: G1 待评审</Tag>
        </Space>
      </Card>
      <Card title="开发进度">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>S1 项目启动与需求确认 - <Tag color="processing">进行中</Tag></div>
          <div>S2 产品数据模型建立 - <Tag>待开始</Tag></div>
          <div>S3 物料与 BOM 管理 - <Tag>待开始</Tag></div>
          <div>S4 CAD 集成与技术验证 - <Tag>待开始</Tag></div>
          <div>S5 工程变更闭环管理 - <Tag>待开始</Tag></div>
          <div>... 共 12 个开发阶段</div>
        </Space>
      </Card>
    </Space>
  );
}