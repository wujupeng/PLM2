import { useCallback, useEffect, useState } from 'react';
import { Button, Card, DatePicker, Space, Statistic, Table, Tag, Typography } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { oaIntegrationMonitorService } from '@/services/oaService';
import { formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { flagText } from '@/pages/oa/integration/shared';
import type { OaApiCredentialItem } from '@/types/oa';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

/** 连接器同步明细指标。 */
interface ConnectorMetric {
  connectorId: number;
  connectorName?: string;
  systemCode?: string;
  syncTotal?: number;
  syncFail?: number;
  successRate?: number;
  lastSyncTime?: string;
}

export default function OaIntegrationMonitorPage() {
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [data, setData] = useState<Record<string, unknown>>({});

  const loadData = useCallback(async (r: [Dayjs, Dayjs] | null = range) => {
    setLoading(true);
    try {
      const res = await oaIntegrationMonitorService.overview({
        startDate: r ? r[0].format('YYYY-MM-DD') : undefined,
        endDate: r ? r[1].format('YYYY-MM-DD') : undefined,
      });
      setData((res || {}) as Record<string, unknown>);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void loadData(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const num = (key: string): number => Number(data[key] ?? 0);
  const metrics = (data.connectorMetrics as ConnectorMetric[] | undefined) || [];
  const credentials = (data.credentialExpiring as OaApiCredentialItem[] | undefined) || [];

  const metricColumns: ColumnsType<ConnectorMetric> = [
    { title: '连接器', dataIndex: 'connectorName', render: plain },
    { title: '系统', dataIndex: 'systemCode', width: 100, render: plain },
    { title: '同步次数', dataIndex: 'syncTotal', width: 100, render: plain },
    { title: '失败次数', dataIndex: 'syncFail', width: 100, render: plain },
    {
      title: '成功率',
      dataIndex: 'successRate',
      width: 100,
      render: (v) => `${plain(v)}%`,
    },
    { title: '最近同步', dataIndex: 'lastSyncTime', width: 170, render: formatDateTime },
  ];

  const credentialColumns: ColumnsType<OaApiCredentialItem> = [
    { title: '凭证编号', dataIndex: 'credentialNo', render: plain },
    { title: '凭证名称', dataIndex: 'credentialName', render: plain },
    { title: '归属系统', dataIndex: 'ownerSystem', width: 110, render: plain },
    { title: '到期日期', dataIndex: 'expireDate', width: 130, render: formatDate },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v) => (Number(v) === 1 ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>),
    },
    { title: '已告警', dataIndex: 'alertFlag', width: 90, render: flagText },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        接口监控台
      </Title>

      <Card>
        <Space wrap size="middle" align="center">
          <Text type="secondary">
            统计窗口：近 {num('windowDays')} 天（{formatDateTime(data.startTime as string)} ~{' '}
            {formatDateTime(data.endTime as string)}）
          </Text>
          <RangePicker
            value={range}
            onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)}
            allowClear
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            loading={loading}
            onClick={() => void loadData()}
          >
            查询
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setRange(null);
              void loadData(null);
            }}
          >
            重置
          </Button>
        </Space>
      </Card>

      <Card title="API 调用">
        <Space size="large" wrap>
          <Statistic title="调用总量" value={num('apiTotal')} />
          <Statistic
            title="失败次数"
            value={num('apiFail')}
            valueStyle={{ color: num('apiFail') > 0 ? '#cf1322' : undefined }}
          />
          <Statistic title="成功率" value={num('apiSuccessRate')} suffix="%" />
          <Statistic title="平均耗时" value={num('apiAvgCostMs')} suffix="ms" />
        </Space>
      </Card>

      <Card title="Webhook 投递">
        <Space size="large" wrap>
          <Statistic title="投递总量" value={num('webhookTotal')} />
          <Statistic
            title="死信"
            value={num('webhookDead')}
            valueStyle={{ color: num('webhookDead') > 0 ? '#cf1322' : undefined }}
          />
          <Statistic title="成功率" value={num('webhookSuccessRate')} suffix="%" />
        </Space>
      </Card>

      <Card title="消息任务">
        <Space size="large" wrap>
          <Statistic title="任务总量" value={num('taskTotal')} />
          <Statistic
            title="死信"
            value={num('taskDead')}
            valueStyle={{ color: num('taskDead') > 0 ? '#cf1322' : undefined }}
          />
          <Statistic title="成功率" value={num('taskSuccessRate')} suffix="%" />
        </Space>
      </Card>

      <Card title="连接器同步">
        <Space size="large" wrap style={{ marginBottom: 16 }}>
          <Statistic title="启用连接器" value={num('connectorTotal')} />
          <Statistic title="同步总量" value={num('syncTotal')} />
          <Statistic
            title="失败次数"
            value={num('syncFail')}
            valueStyle={{ color: num('syncFail') > 0 ? '#cf1322' : undefined }}
          />
          <Statistic title="成功率" value={num('syncSuccessRate')} suffix="%" />
        </Space>
        <Table<ConnectorMetric>
          rowKey="connectorId"
          size="small"
          loading={loading}
          columns={metricColumns}
          dataSource={metrics}
          pagination={false}
        />
      </Card>

      <Card title="EDI 通知">
        <Space size="large" wrap>
          <Statistic title="通知总量" value={num('ediTotal')} />
          <Statistic
            title="待处理"
            value={num('ediPending')}
            valueStyle={{ color: num('ediPending') > 0 ? '#d46b08' : undefined }}
          />
          <Statistic
            title="告警"
            value={num('ediAlert')}
            valueStyle={{ color: num('ediAlert') > 0 ? '#cf1322' : undefined }}
          />
        </Space>
      </Card>

      <Card title={`凭证到期提醒（共 ${num('credentialExpiringCount')} 个）`}>
        <Table<OaApiCredentialItem>
          rowKey="id"
          size="small"
          loading={loading}
          columns={credentialColumns}
          dataSource={credentials}
          pagination={false}
        />
      </Card>
    </Space>
  );
}
