import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Form, Input, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { oaInstanceService } from '@/services/oaService';
import InstanceDetailModal from '@/pages/oa/InstanceDetailModal';
import {
  OA_INSTANCE_STATUS_COLOR,
  OA_INSTANCE_STATUS_LABEL,
  OA_INSTANCE_STATUS_OPTIONS,
  type OaInstanceQuery,
  type OaProcessInstanceItem,
} from '@/types/oa';

const { Title } = Typography;
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

interface SearchState {
  keyword?: string;
  instanceStatus?: string;
}

/** 审批查询：按条件检索流程实例并查看审批轨迹。 */
export default function OaApprovalPage() {
  const [data, setData] = useState<OaProcessInstanceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [detailId, setDetailId] = useState<number | undefined>(undefined);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaInstanceQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          instanceStatus: cond.instanceStatus || undefined,
        };
        const res = await oaInstanceService.monitor(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: SearchState) => {
    const cond = { ...values };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openDetail = (record: OaProcessInstanceItem) => {
    setDetailId(record.id);
    setDetailOpen(true);
  };

  const columns: ColumnsType<OaProcessInstanceItem> = [
    { title: '实例编号', dataIndex: 'instanceNo', width: 180, fixed: 'left', render: (v) => v || '-' },
    { title: '流程名称', dataIndex: 'processName', width: 170, render: (v) => v || '-' },
    { title: '标题', dataIndex: 'title', width: 200, render: (v) => v || '-' },
    { title: '申请人', dataIndex: 'applicantName', width: 120, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'instanceStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={OA_INSTANCE_STATUS_COLOR[v]}>{OA_INSTANCE_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '当前节点', dataIndex: 'currentNodeCode', width: 110, render: (v) => v || '-' },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '结束时间',
      dataIndex: 'finishedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => openDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        审批查询
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="实例编号 / 标题 / 流程" allowClear style={{ width: 220 }} />
          </Form.Item>
          <Form.Item name="instanceStatus" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={OA_INSTANCE_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`审批记录（共 ${total} 条）`}>
        <Table<OaProcessInstanceItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1300 }}
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

      <InstanceDetailModal
        open={detailOpen}
        instanceId={detailId}
        onClose={() => setDetailOpen(false)}
      />
    </Space>
  );
}
