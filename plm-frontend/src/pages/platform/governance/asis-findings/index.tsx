import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { govAsisFindingService } from '@/services/governanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  GOV_FINDING_STATUS_LABEL,
  GOV_FINDING_STATUS_OPTIONS,
  GOV_FINDING_TYPE_LABEL,
  GOV_FINDING_TYPE_OPTIONS,
  GOV_SEVERITY_LABEL,
  GOV_SEVERITY_OPTIONS,
  type GovAsisFindingItem,
  type GovAsisFindingSaveParams,
} from '@/types/governance';

const { Title } = Typography;

const MANAGE = 'platform:gov:asisfinding:manage';

export default function GovAsisFindingPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<GovAsisFindingSaveParams>();
  const [data, setData] = useState<GovAsisFindingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [systemCode, setSystemCode] = useState('');
  const [findingType, setFindingType] = useState<string | undefined>(undefined);
  const [findingStatus, setFindingStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      sCode = systemCode,
      fType = findingType,
      fStatus = findingStatus,
    ) => {
      setLoading(true);
      try {
        const res = await govAsisFindingService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          systemCode: sCode || undefined,
          findingType: fType,
          findingStatus: fStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, systemCode, findingType, findingStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ findingType: 'PAIN_POINT', severity: 'MEDIUM', findingStatus: 'OPEN' });
    setOpen(true);
  };

  const openEdit = (record: GovAsisFindingItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: GovAsisFindingSaveParams = { ...values };
      if (editId == null) {
        await govAsisFindingService.create(payload);
        message.success('盘点发现已创建');
      } else {
        await govAsisFindingService.update(editId, payload);
        message.success('盘点发现已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await govAsisFindingService.remove(id);
    message.success('盘点发现已删除');
    void loadData();
  };

  const columns: ColumnsType<GovAsisFindingItem> = [
    { title: '发现编号', dataIndex: 'findingNo', width: 160, fixed: 'left', render: plain },
    { title: '关联系统编码', dataIndex: 'systemCode', width: 150, render: plain },
    { title: '发现标题', dataIndex: 'findingTitle', width: 220, render: plain },
    {
      title: '发现类型',
      dataIndex: 'findingType',
      width: 110,
      render: (v) => statusTag(GOV_FINDING_TYPE_LABEL, v),
    },
    { title: '严重程度', dataIndex: 'severity', width: 100, render: (v) => statusTag(GOV_SEVERITY_LABEL, v) },
    { title: '发现描述', dataIndex: 'findingDesc', width: 200, ellipsis: true, render: plain },
    { title: '处置建议', dataIndex: 'suggestion', width: 200, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'findingStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(GOV_FINDING_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该盘点发现？" onConfirm={() => void remove(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        盘点发现
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="关联系统编码">
            <Input
              placeholder="请输入系统编码"
              allowClear
              style={{ width: 180 }}
              value={systemCode}
              onChange={(e) => setSystemCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="发现类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={findingType}
              onChange={(v) => setFindingType(v)}
              options={[...GOV_FINDING_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="发现状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={findingStatus}
              onChange={(v) => setFindingStatus(v)}
              options={[...GOV_FINDING_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="发现编号 / 标题"
              allowClear
              style={{ width: 180 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  setPageNum(1);
                  void loadData(1, pageSize, keyword, systemCode, findingType, findingStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSystemCode('');
                  setFindingType(undefined);
                  setFindingStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建盘点发现</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`盘点发现（共 ${total} 条）`}>
        <Table<GovAsisFindingItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1900 }}
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

      <Modal
        title={editId == null ? '新建盘点发现' : '编辑盘点发现'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="findingNo" label="发现编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="systemCode" label="关联存量系统编码">
            <Input placeholder="请输入关联存量系统编码" />
          </Form.Item>
          <Form.Item name="findingType" label="发现类型">
            <Select placeholder="请选择" options={[...GOV_FINDING_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="findingTitle" label="发现标题" rules={[{ required: true, message: '请输入发现标题' }]}>
            <Input placeholder="请输入发现标题" />
          </Form.Item>
          <Form.Item name="findingDesc" label="发现描述">
            <Input.TextArea rows={2} placeholder="请输入发现描述" />
          </Form.Item>
          <Form.Item name="severity" label="严重程度">
            <Select placeholder="请选择" options={[...GOV_SEVERITY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="suggestion" label="处置建议">
            <Input.TextArea rows={2} placeholder="请输入处置建议" />
          </Form.Item>
          <Form.Item name="findingStatus" label="发现状态">
            <Select placeholder="请选择" options={[...GOV_FINDING_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
