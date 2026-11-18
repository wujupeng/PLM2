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
import { govTraceLinkService } from '@/services/governanceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  GOV_LINK_STATUS_LABEL,
  GOV_LINK_STATUS_OPTIONS,
  GOV_LINK_TYPE_LABEL,
  GOV_LINK_TYPE_OPTIONS,
  type GovTraceLinkItem,
  type GovTraceLinkSaveParams,
} from '@/types/governance';

const { Title } = Typography;

const MANAGE = 'platform:gov:tracelink:manage';

export default function GovTraceLinkPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<GovTraceLinkSaveParams>();
  const [data, setData] = useState<GovTraceLinkItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [reqCode, setReqCode] = useState('');
  const [linkType, setLinkType] = useState<string | undefined>(undefined);
  const [linkStatus, setLinkStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      rCode = reqCode,
      lType = linkType,
      lStatus = linkStatus,
    ) => {
      setLoading(true);
      try {
        const res = await govTraceLinkService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          reqCode: rCode || undefined,
          linkType: lType,
          linkStatus: lStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, reqCode, linkType, linkStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ linkType: 'FUNCTION', linkStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: GovTraceLinkItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: GovTraceLinkSaveParams = { ...values };
      if (editId == null) {
        await govTraceLinkService.create(payload);
        message.success('追踪链接已创建');
      } else {
        await govTraceLinkService.update(editId, payload);
        message.success('追踪链接已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await govTraceLinkService.remove(id);
    message.success('追踪链接已删除');
    void loadData();
  };

  const columns: ColumnsType<GovTraceLinkItem> = [
    { title: '链接编号', dataIndex: 'linkNo', width: 160, fixed: 'left', render: plain },
    { title: '关联需求编码', dataIndex: 'reqCode', width: 150, render: plain },
    { title: '链接类型', dataIndex: 'linkType', width: 120, render: (v) => statusTag(GOV_LINK_TYPE_LABEL, v) },
    { title: '目标引用', dataIndex: 'targetRef', width: 180, ellipsis: true, render: plain },
    { title: '目标名称', dataIndex: 'targetName', width: 180, ellipsis: true, render: plain },
    { title: '链接说明', dataIndex: 'linkDesc', width: 200, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'linkStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(GOV_LINK_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该追踪链接？" onConfirm={() => void remove(record.id)}>
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
        需求追踪矩阵
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="关联需求编码">
            <Input
              placeholder="请输入需求编码"
              allowClear
              style={{ width: 180 }}
              value={reqCode}
              onChange={(e) => setReqCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="链接类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={linkType}
              onChange={(v) => setLinkType(v)}
              options={[...GOV_LINK_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="链接状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={linkStatus}
              onChange={(v) => setLinkStatus(v)}
              options={[...GOV_LINK_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="链接编号 / 目标引用 / 目标名称"
              allowClear
              style={{ width: 220 }}
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
                  void loadData(1, pageSize, keyword, reqCode, linkType, linkStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setReqCode('');
                  setLinkType(undefined);
                  setLinkStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建追踪链接</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`需求追踪矩阵（共 ${total} 条）`}>
        <Table<GovTraceLinkItem>
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
        title={editId == null ? '新建追踪链接' : '编辑追踪链接'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="linkNo" label="链接编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="reqCode" label="关联需求编码" rules={[{ required: true, message: '请输入关联需求编码' }]}>
            <Input placeholder="请输入关联需求编码" />
          </Form.Item>
          <Form.Item name="linkType" label="链接类型">
            <Select placeholder="请选择" options={[...GOV_LINK_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="targetRef" label="目标引用">
            <Input placeholder="如功能编码、接口路径、用例编号" />
          </Form.Item>
          <Form.Item name="targetName" label="目标名称">
            <Input placeholder="请输入目标名称" />
          </Form.Item>
          <Form.Item name="linkDesc" label="链接说明">
            <Input.TextArea rows={2} placeholder="请输入链接说明" />
          </Form.Item>
          <Form.Item name="linkStatus" label="链接状态">
            <Select placeholder="请选择" options={[...GOV_LINK_STATUS_OPTIONS]} />
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
