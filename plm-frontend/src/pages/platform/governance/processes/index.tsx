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
import { govProcessService } from '@/services/governanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  GOV_PROCESS_LEVEL_LABEL,
  GOV_PROCESS_LEVEL_OPTIONS,
  GOV_PROCESS_STATUS_LABEL,
  GOV_PROCESS_STATUS_OPTIONS,
  GOV_PROCESS_TYPE_LABEL,
  GOV_PROCESS_TYPE_OPTIONS,
  type GovProcessItem,
  type GovProcessSaveParams,
} from '@/types/governance';

const { Title } = Typography;

const MANAGE = 'platform:gov:process:manage';

export default function GovProcessPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<GovProcessSaveParams>();
  const [data, setData] = useState<GovProcessItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [processType, setProcessType] = useState<string | undefined>(undefined);
  const [processLevel, setProcessLevel] = useState<string | undefined>(undefined);
  const [processStatus, setProcessStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      pType = processType,
      pLevel = processLevel,
      pStatus = processStatus,
    ) => {
      setLoading(true);
      try {
        const res = await govProcessService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          processType: pType,
          processLevel: pLevel,
          processStatus: pStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, processType, processLevel, processStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ processType: 'O2C', processLevel: 'L1', processStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: GovProcessItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: GovProcessSaveParams = { ...values };
      if (editId == null) {
        await govProcessService.create(payload);
        message.success('端到端流程已创建');
      } else {
        await govProcessService.update(editId, payload);
        message.success('端到端流程已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await govProcessService.remove(id);
    message.success('端到端流程已删除');
    void loadData();
  };

  const columns: ColumnsType<GovProcessItem> = [
    { title: '流程编号', dataIndex: 'processNo', width: 160, fixed: 'left', render: plain },
    { title: '流程编码', dataIndex: 'processCode', width: 150, render: plain },
    { title: '流程名称', dataIndex: 'processName', width: 200, render: plain },
    {
      title: '流程类型',
      dataIndex: 'processType',
      width: 130,
      render: (v) => statusTag(GOV_PROCESS_TYPE_LABEL, v),
    },
    {
      title: '流程层级',
      dataIndex: 'processLevel',
      width: 120,
      render: (v) => statusTag(GOV_PROCESS_LEVEL_LABEL, v),
    },
    { title: '负责部门', dataIndex: 'ownerDept', width: 140, render: plain },
    { title: '描述', dataIndex: 'description', width: 220, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'processStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(GOV_PROCESS_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该端到端流程？" onConfirm={() => void remove(record.id)}>
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
        流程建模
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="流程类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 150 }}
              value={processType}
              onChange={(v) => setProcessType(v)}
              options={[...GOV_PROCESS_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="流程层级">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={processLevel}
              onChange={(v) => setProcessLevel(v)}
              options={[...GOV_PROCESS_LEVEL_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="流程状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={processStatus}
              onChange={(v) => setProcessStatus(v)}
              options={[...GOV_PROCESS_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="流程编号 / 编码 / 名称"
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
                  void loadData(1, pageSize, keyword, processType, processLevel, processStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setProcessType(undefined);
                  setProcessLevel(undefined);
                  setProcessStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建端到端流程</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`流程建模（共 ${total} 条）`}>
        <Table<GovProcessItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1800 }}
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
        title={editId == null ? '新建端到端流程' : '编辑端到端流程'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="processNo" label="流程编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="processCode" label="流程编码" rules={[{ required: true, message: '请输入流程编码' }]}>
            <Input placeholder="请输入流程编码" />
          </Form.Item>
          <Form.Item name="processName" label="流程名称" rules={[{ required: true, message: '请输入流程名称' }]}>
            <Input placeholder="请输入流程名称" />
          </Form.Item>
          <Form.Item name="processType" label="流程类型">
            <Select placeholder="请选择" options={[...GOV_PROCESS_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="processLevel" label="流程层级">
            <Select placeholder="请选择" options={[...GOV_PROCESS_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="ownerDept" label="负责部门">
            <Input placeholder="请输入负责部门" />
          </Form.Item>
          <Form.Item name="processStatus" label="流程状态">
            <Select placeholder="请选择" options={[...GOV_PROCESS_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
