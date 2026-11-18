import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { mfgService } from '@/services/mfgService';
import {
  MFG_IMPACT_STATUS_COLOR,
  MFG_IMPACT_STATUS_LABEL,
  MFG_IMPACT_TYPE_LABEL,
  MFG_RECALL_STATUS_COLOR,
  MFG_RECALL_STATUS_LABEL,
  MFG_RECALL_STATUS_OPTIONS,
  MFG_RECALL_TYPE_LABEL,
  MFG_RECALL_TYPE_OPTIONS,
  MFG_RISK_LEVEL_COLOR,
  MFG_RISK_LEVEL_LABEL,
  MFG_RISK_LEVEL_OPTIONS,
  type MfgRecallDetailResponse,
  type MfgRecallOrderItem,
  type MfgRecallQuery,
  type MfgRecallSaveParams,
} from '@/types/mfg';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface RecallFormValues {
  recallNo?: string;
  recallType: string;
  triggerSource?: string;
  targetValue: string;
  riskLevel?: string;
  owner?: string;
  reason?: string;
  remark?: string;
}

interface CloseFormValues {
  closeEvidence: string;
  remark?: string;
}

export default function MfgRecallPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const username = useAuthStore((state) => state.userInfo?.username);
  const [form] = Form.useForm<RecallFormValues>();
  const [closeForm] = Form.useForm<CloseFormValues>();

  const [data, setData] = useState<MfgRecallOrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<{
    recallNo?: string;
    recallType?: string;
    recallStatus?: string;
    riskLevel?: string;
  }>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [closeOpen, setCloseOpen] = useState(false);
  const [closeTarget, setCloseTarget] = useState<MfgRecallOrderItem | null>(null);
  const [closing, setClosing] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<MfgRecallDetailResponse | null>(null);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: MfgRecallQuery = {
          pageNum: page,
          pageSize: size,
          recallNo: cond.recallNo || undefined,
          recallType: cond.recallType || undefined,
          recallStatus: cond.recallStatus || undefined,
          riskLevel: cond.riskLevel || undefined,
        };
        const res = await mfgService.recallPage(params);
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

  const onSearch = (values: typeof search) => {
    setSearch(values);
    setPageNum(1);
    void loadData(1, pageSize, values);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ recallType: 'MATERIAL_BATCH', riskLevel: 'MEDIUM', owner: username });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: MfgRecallSaveParams = { ...values };
    setSubmitting(true);
    try {
      await mfgService.recallCreate(payload);
      message.success('召回单已发起');
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleIsolate = async (record: MfgRecallOrderItem) => {
    const res = await mfgService.recallIsolate(record.recallNo);
    message.success(`批次隔离完成，影响数量：${res.affectedCount ?? 0}`);
    void loadData();
  };

  const openClose = (record: MfgRecallOrderItem) => {
    setCloseTarget(record);
    closeForm.resetFields();
    setCloseOpen(true);
  };

  const handleClose = async () => {
    if (!closeTarget) return;
    const values = await closeForm.validateFields();
    setClosing(true);
    try {
      await mfgService.recallClose(closeTarget.recallNo, {
        closeEvidence: values.closeEvidence,
        remark: values.remark,
      });
      message.success('召回单已关闭');
      setCloseOpen(false);
      void loadData();
    } finally {
      setClosing(false);
    }
  };

  const handleDelete = async (record: MfgRecallOrderItem) => {
    await mfgService.recallRemove(record.recallNo);
    message.success('删除成功');
    void loadData();
  };

  const openDetail = async (record: MfgRecallOrderItem) => {
    const res = await mfgService.recallDetail(record.recallNo);
    setDetail(res);
    setDetailOpen(true);
  };

  const columns: ColumnsType<MfgRecallOrderItem> = [
    { title: '召回单号', dataIndex: 'recallNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    {
      title: '召回类型',
      dataIndex: 'recallType',
      width: 110,
      render: (v?: string) => (v ? MFG_RECALL_TYPE_LABEL[v] || v : '-'),
    },
    { title: '目标值', dataIndex: 'targetValue', width: 180, render: (v) => v || '-' },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={MFG_RISK_LEVEL_COLOR[v]}>{MFG_RISK_LEVEL_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '召回状态',
      dataIndex: 'recallStatus',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={MFG_RECALL_STATUS_COLOR[v]}>{MFG_RECALL_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    { title: '影响数量', dataIndex: 'affectedCount', width: 100, render: (v) => (v ?? '-') },
    { title: '责任人', dataIndex: 'owner', width: 110, render: (v) => v || '-' },
    {
      title: '发起时间',
      dataIndex: 'openedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => openDetail(record)}>
            影响清单
          </Button>
          {hasPermission('mfg:recall:isolate') && ['OPEN', 'ISOLATING'].includes(record.recallStatus || '') && (
            <Popconfirm title="确认执行批次隔离与库存冻结？" onConfirm={() => handleIsolate(record)}>
              <Button type="link" size="small">
                隔离
              </Button>
            </Popconfirm>
          )}
          {hasPermission('mfg:recall:close') && record.recallStatus !== 'CLOSED' && (
            <Button type="link" size="small" onClick={() => openClose(record)}>
              关闭
            </Button>
          )}
          {hasPermission('mfg:recall:create') && record.recallStatus === 'OPEN' && (
            <Popconfirm title="确认删除该召回单？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        召回与隔离
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="recallNo" label="召回单号">
            <Input placeholder="请输入召回单号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="recallType" label="召回类型">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={MFG_RECALL_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="recallStatus" label="召回状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={MFG_RECALL_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="riskLevel" label="风险等级">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={MFG_RISK_LEVEL_OPTIONS} />
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

      <Card
        title={`召回单列表（共 ${total} 条）`}
        extra={
          hasPermission('mfg:recall:create') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              发起召回
            </Button>
          )
        }
      >
        <Table<MfgRecallOrderItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1500 }}
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

      {/* 发起召回 */}
      <Modal
        title="发起召回"
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="recallType" label="召回类型" rules={[{ required: true, message: '请选择召回类型' }]}>
            <Select placeholder="请选择" options={MFG_RECALL_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item
            name="targetValue"
            label="目标值"
            rules={[{ required: true, message: '请输入目标值' }]}
            extra="物料批次/生产批次填批次号；客户填客户编码；日期范围填 yyyy-MM-dd~yyyy-MM-dd"
          >
            <Input placeholder="请输入召回目标值" />
          </Form.Item>
          <Form.Item name="triggerSource" label="触发来源">
            <Input placeholder="如 客户投诉 / 内部检验" />
          </Form.Item>
          <Form.Item name="riskLevel" label="风险等级">
            <Select placeholder="请选择" options={MFG_RISK_LEVEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="owner" label="责任人">
            <Input placeholder="请输入责任人" />
          </Form.Item>
          <Form.Item name="reason" label="召回原因">
            <Input.TextArea rows={2} placeholder="请输入召回原因" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 关闭召回 */}
      <Modal
        title={`关闭召回${closeTarget ? `：${closeTarget.recallNo}` : ''}`}
        open={closeOpen}
        onOk={handleClose}
        confirmLoading={closing}
        onCancel={() => setCloseOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={closeForm} layout="vertical" preserve={false}>
          <Form.Item
            name="closeEvidence"
            label="关闭证据"
            rules={[{ required: true, message: '关闭召回单必须提供关闭证据' }]}
          >
            <Input.TextArea rows={4} placeholder="请填写关闭证据（处置结论、验证记录、审批单号等）" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 影响清单 */}
      <Modal
        title={`召回影响清单${detail?.recall?.recallNo ? `：${detail.recall.recallNo}` : ''}`}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button type="primary" onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={900}
      >
        {detail?.recall && (
          <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="召回类型">
              {detail.recall.recallType
                ? MFG_RECALL_TYPE_LABEL[detail.recall.recallType] || detail.recall.recallType
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="目标值">{detail.recall.targetValue || '-'}</Descriptions.Item>
            <Descriptions.Item label="风险等级">
              {detail.recall.riskLevel
                ? MFG_RISK_LEVEL_LABEL[detail.recall.riskLevel] || detail.recall.riskLevel
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="召回状态">
              {detail.recall.recallStatus
                ? MFG_RECALL_STATUS_LABEL[detail.recall.recallStatus] || detail.recall.recallStatus
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="影响数量">{detail.recall.affectedCount ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="责任人">{detail.recall.owner || '-'}</Descriptions.Item>
            <Descriptions.Item label="关闭证据" span={2}>
              {detail.recall.closeEvidence || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
        <Table
          rowKey="id"
          size="small"
          dataSource={detail?.impacts || []}
          pagination={false}
          columns={[
            {
              title: '影响类型',
              dataIndex: 'impactType',
              width: 100,
              render: (v?: string) => (v ? MFG_IMPACT_TYPE_LABEL[v] || v : '-'),
            },
            { title: '影响对象', dataIndex: 'impactRefNo', render: (v) => v || '-' },
            { title: '产品编码', dataIndex: 'productCode', render: (v) => v || '-' },
            { title: '生产批次号', dataIndex: 'batchNo', render: (v) => v || '-' },
            { title: '物料批次号', dataIndex: 'materialBatchNo', render: (v) => v || '-' },
            { title: '数量', dataIndex: 'qty', width: 80, render: (v) => (v ?? '-') },
            {
              title: '影响状态',
              dataIndex: 'impactStatus',
              width: 100,
              render: (v?: string) =>
                v ? (
                  <Tag color={MFG_IMPACT_STATUS_COLOR[v]}>{MFG_IMPACT_STATUS_LABEL[v] || v}</Tag>
                ) : (
                  '-'
                ),
            },
          ]}
        />
      </Modal>
    </Space>
  );
}
