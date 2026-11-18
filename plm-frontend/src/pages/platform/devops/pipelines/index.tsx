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
import { devopsPipelineService } from '@/services/devopsService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  DEVOPS_PIPELINE_STATUS_LABEL,
  DEVOPS_PIPELINE_STATUS_OPTIONS,
  DEVOPS_PIPELINE_TRIGGER_LABEL,
  DEVOPS_PIPELINE_TRIGGER_OPTIONS,
  type DevopsPipelineItem,
  type DevopsPipelineSaveParams,
} from '@/types/devops';

const { Title } = Typography;

const MANAGE = 'platform:devops:pipeline:manage';

export default function DevopsPipelinePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<DevopsPipelineSaveParams>();
  const [data, setData] = useState<DevopsPipelineItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [repoCode, setRepoCode] = useState('');
  const [triggerType, setTriggerType] = useState<string | undefined>(undefined);
  const [pipelineStatus, setPipelineStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      rCode = repoCode,
      tType = triggerType,
      pStatus = pipelineStatus,
    ) => {
      setLoading(true);
      try {
        const res = await devopsPipelineService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          repoCode: rCode || undefined,
          triggerType: tType,
          pipelineStatus: pStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, repoCode, triggerType, pipelineStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ triggerType: 'PUSH', pipelineStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: DevopsPipelineItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: DevopsPipelineSaveParams = { ...values };
      if (editId == null) {
        await devopsPipelineService.create(payload);
        message.success('流水线已创建');
      } else {
        await devopsPipelineService.update(editId, payload);
        message.success('流水线已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await devopsPipelineService.remove(id);
    message.success('流水线已删除');
    void loadData();
  };

  const columns: ColumnsType<DevopsPipelineItem> = [
    { title: '流水线编号', dataIndex: 'pipelineNo', width: 160, fixed: 'left', render: plain },
    { title: '流水线编码', dataIndex: 'pipelineCode', width: 150, render: plain },
    { title: '流水线名称', dataIndex: 'pipelineName', width: 200, render: plain },
    { title: '关联仓库编码', dataIndex: 'repoCode', width: 150, render: plain },
    {
      title: '触发方式',
      dataIndex: 'triggerType',
      width: 120,
      render: (v) => statusTag(DEVOPS_PIPELINE_TRIGGER_LABEL, v),
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'pipelineStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(DEVOPS_PIPELINE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该流水线？" onConfirm={() => void remove(record.id)}>
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
        流水线
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="关联仓库编码">
            <Input
              placeholder="请输入仓库编码"
              allowClear
              style={{ width: 180 }}
              value={repoCode}
              onChange={(e) => setRepoCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="触发方式">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={triggerType}
              onChange={(v) => setTriggerType(v)}
              options={[...DEVOPS_PIPELINE_TRIGGER_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="流水线状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={pipelineStatus}
              onChange={(v) => setPipelineStatus(v)}
              options={[...DEVOPS_PIPELINE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="流水线编号 / 编码 / 名称"
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
                  void loadData(1, pageSize, keyword, repoCode, triggerType, pipelineStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRepoCode('');
                  setTriggerType(undefined);
                  setPipelineStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建流水线</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`流水线（共 ${total} 条）`}>
        <Table<DevopsPipelineItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1600 }}
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
        title={editId == null ? '新建流水线' : '编辑流水线'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="pipelineNo" label="流水线编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="pipelineCode"
            label="流水线编码"
            rules={[{ required: true, message: '请输入流水线编码' }]}
          >
            <Input placeholder="请输入流水线编码" />
          </Form.Item>
          <Form.Item
            name="pipelineName"
            label="流水线名称"
            rules={[{ required: true, message: '请输入流水线名称' }]}
          >
            <Input placeholder="请输入流水线名称" />
          </Form.Item>
          <Form.Item name="repoCode" label="关联仓库编码">
            <Input placeholder="请输入关联仓库编码" />
          </Form.Item>
          <Form.Item name="triggerType" label="触发方式">
            <Select placeholder="请选择" options={[...DEVOPS_PIPELINE_TRIGGER_OPTIONS]} />
          </Form.Item>
          <Form.Item name="pipelineStatus" label="流水线状态">
            <Select placeholder="请选择" options={[...DEVOPS_PIPELINE_STATUS_OPTIONS]} />
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
