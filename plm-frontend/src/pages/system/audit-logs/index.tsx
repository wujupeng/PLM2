import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { auditLogService } from '@/services/systemService';
import type { AuditLogItem } from '@/types/system';

const { Title } = Typography;

const METHOD_COLOR: Record<string, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  DELETE: 'red',
};

export default function AuditLogsPage() {
  const [data, setData] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, extra?: { module?: string; username?: string; success?: boolean }) => {
      setLoading(true);
      try {
        const res = await auditLogService.page({
          pageNum: page,
          pageSize: size,
          module: extra?.module || undefined,
          username: extra?.username || undefined,
          success: extra?.success,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize],
  );

  useEffect(() => {
    void loadData(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: { module?: string; username?: string; success?: boolean }) => {
    setPageNum(1);
    void loadData(1, pageSize, values);
  };

  const columns: ColumnsType<AuditLogItem> = [
    { title: 'TraceId', dataIndex: 'traceId', width: 200, render: (v) => v || '-' },
    { title: '用户名', dataIndex: 'username', width: 130, render: (v) => v || '-' },
    { title: '模块', dataIndex: 'module', width: 130, render: (v) => v || '-' },
    {
      title: '请求方法',
      dataIndex: 'httpMethod',
      width: 100,
      render: (v: string) => (v ? <Tag color={METHOD_COLOR[v] || 'default'}>{v}</Tag> : '-'),
    },
    { title: 'URI', dataIndex: 'uri', width: 260, render: (v) => v || '-' },
    { title: 'IP', dataIndex: 'ip', width: 140, render: (v) => v || '-' },
    { title: '结果码', dataIndex: 'resultCode', width: 90 },
    {
      title: '成功',
      dataIndex: 'success',
      width: 90,
      render: (v: boolean) => (v ? <Tag color="success">成功</Tag> : <Tag color="error">失败</Tag>),
    },
    { title: '耗时(ms)', dataIndex: 'costMs', width: 100, render: (v) => (v ?? '-') },
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        审计日志
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="module" label="模块">
            <Input placeholder="请输入模块" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="username" label="用户名">
            <Input placeholder="请输入用户名" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="success" label="结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              options={[
                { value: true, label: '成功' },
                { value: false, label: '失败' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => void loadData(1, pageSize)}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`日志列表（共 ${total} 条）`}>
        <Table<AuditLogItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1600 }}
          expandable={{
            expandedRowRender: (record) => (
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="请求参数">{record.requestParams || '-'}</Descriptions.Item>
                <Descriptions.Item label="错误信息">{record.errorMessage || '-'}</Descriptions.Item>
              </Descriptions>
            ),
          }}
          pagination={{
            current: pageNum,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, size) => {
              setPageNum(page);
              setPageSize(size);
              void loadData(page, size);
            },
          }}
        />
      </Card>
    </Space>
  );
}
