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
import { govRequirementService } from '@/services/governanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  GOV_PRIORITY_LABEL,
  GOV_PRIORITY_OPTIONS,
  GOV_REQ_STATUS_LABEL,
  GOV_REQ_STATUS_OPTIONS,
  GOV_REQ_TYPE_LABEL,
  GOV_REQ_TYPE_OPTIONS,
  type GovRequirementItem,
  type GovRequirementSaveParams,
} from '@/types/governance';

const { Title } = Typography;

const MANAGE = 'platform:gov:requirement:manage';

export default function GovRequirementPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<GovRequirementSaveParams>();
  const [data, setData] = useState<GovRequirementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [reqType, setReqType] = useState<string | undefined>(undefined);
  const [reqStatus, setReqStatus] = useState<string | undefined>(undefined);
  const [reqPriority, setReqPriority] = useState<string | undefined>(undefined);
  const [bizModule, setBizModule] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      rType = reqType,
      rStatus = reqStatus,
      rPriority = reqPriority,
      bModule = bizModule,
    ) => {
      setLoading(true);
      try {
        const res = await govRequirementService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          reqType: rType,
          reqStatus: rStatus,
          reqPriority: rPriority,
          bizModule: bModule || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, reqType, reqStatus, reqPriority, bizModule],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ reqType: 'BUSINESS', reqPriority: 'P1', reqStatus: 'PROPOSED' });
    setOpen(true);
  };

  const openEdit = (record: GovRequirementItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: GovRequirementSaveParams = { ...values };
      if (editId == null) {
        await govRequirementService.create(payload);
        message.success('需求已创建');
      } else {
        await govRequirementService.update(editId, payload);
        message.success('需求已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await govRequirementService.remove(id);
    message.success('需求已删除');
    void loadData();
  };

  const columns: ColumnsType<GovRequirementItem> = [
    { title: '需求编号', dataIndex: 'reqNo', width: 160, fixed: 'left', render: plain },
    { title: '需求编码', dataIndex: 'reqCode', width: 140, render: plain },
    { title: '需求名称', dataIndex: 'reqName', width: 220, render: plain },
    { title: '需求类型', dataIndex: 'reqType', width: 110, render: (v) => statusTag(GOV_REQ_TYPE_LABEL, v) },
    { title: '需求来源', dataIndex: 'source', width: 140, render: plain },
    { title: '业务模块', dataIndex: 'bizModule', width: 120, render: plain },
    { title: '责任人', dataIndex: 'ownerName', width: 120, render: plain },
    { title: '验收标准', dataIndex: 'acceptanceCriteria', width: 200, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '优先级',
      dataIndex: 'reqPriority',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(GOV_PRIORITY_LABEL, v),
    },
    {
      title: '状态',
      dataIndex: 'reqStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(GOV_REQ_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该需求？" onConfirm={() => void remove(record.id)}>
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
        需求台账
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="需求类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={reqType}
              onChange={(v) => setReqType(v)}
              options={[...GOV_REQ_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="需求状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={reqStatus}
              onChange={(v) => setReqStatus(v)}
              options={[...GOV_REQ_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="优先级">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={reqPriority}
              onChange={(v) => setReqPriority(v)}
              options={[...GOV_PRIORITY_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="业务模块">
            <Input
              placeholder="请输入业务模块"
              allowClear
              style={{ width: 150 }}
              value={bizModule}
              onChange={(e) => setBizModule(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="需求编号 / 编码 / 名称"
              allowClear
              style={{ width: 200 }}
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
                  void loadData(1, pageSize, keyword, reqType, reqStatus, reqPriority, bizModule);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setReqType(undefined);
                  setReqStatus(undefined);
                  setReqPriority(undefined);
                  setBizModule('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建需求</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`需求台账（共 ${total} 条）`}>
        <Table<GovRequirementItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2100 }}
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
        title={editId == null ? '新建需求' : '编辑需求'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="reqNo" label="需求编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="reqCode" label="需求编码">
            <Input placeholder="请输入需求编码" />
          </Form.Item>
          <Form.Item name="reqName" label="需求名称" rules={[{ required: true, message: '请输入需求名称' }]}>
            <Input placeholder="请输入需求名称" />
          </Form.Item>
          <Form.Item name="reqType" label="需求类型">
            <Select placeholder="请选择" options={[...GOV_REQ_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="source" label="需求来源">
            <Input placeholder="请输入需求来源" />
          </Form.Item>
          <Form.Item name="bizModule" label="业务模块">
            <Input placeholder="请输入业务模块" />
          </Form.Item>
          <Form.Item name="reqPriority" label="需求优先级">
            <Select placeholder="请选择" options={[...GOV_PRIORITY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="reqStatus" label="需求状态">
            <Select placeholder="请选择" options={[...GOV_REQ_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="acceptanceCriteria" label="验收标准">
            <Input.TextArea rows={2} placeholder="请输入验收标准" />
          </Form.Item>
          <Form.Item name="ownerName" label="责任人">
            <Input placeholder="请输入责任人" />
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
