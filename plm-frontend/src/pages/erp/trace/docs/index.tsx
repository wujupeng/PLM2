import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
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
import { erpDocTrackService } from '@/services/erpTraceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_DOC_APPROVAL_STATUS_LABEL,
  ERP_DOC_APPROVAL_STATUS_OPTIONS,
  ERP_DOC_TRACK_BIZ_STATUS_LABEL,
  ERP_DOC_TRACK_BIZ_STATUS_OPTIONS,
  ERP_DOC_TRACK_TYPE_LABEL,
  ERP_DOC_TRACK_TYPE_OPTIONS,
  type ErpDocTrack,
  type ErpDocTrackQuery,
  type ErpDocTrackSaveRequest,
} from '@/types/erpTrace';

const { Title } = Typography;

const MANAGE = 'erp:trace:doc:manage';

export default function ErpDocTrackPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ErpDocTrackSaveRequest>();
  const [data, setData] = useState<ErpDocTrack[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [docType, setDocType] = useState<string | undefined>(undefined);
  const [bizStatus, setBizStatus] = useState<string | undefined>(undefined);
  const [approvalStatus, setApprovalStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = docType,
      biz = bizStatus,
      approval = approvalStatus,
    ) => {
      setLoading(true);
      try {
        const params: ErpDocTrackQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          docType: type,
          bizStatus: biz,
          approvalStatus: approval,
        };
        const res = await erpDocTrackService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, docType, bizStatus, approvalStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ bizStatus: 'OPEN', approvalStatus: 'NONE' });
    setOpen(true);
  };

  const openEdit = (record: ErpDocTrack) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editId == null) {
        await erpDocTrackService.create(values);
        message.success('追溯记录已创建');
      } else {
        await erpDocTrackService.update(editId, values);
        message.success('追溯记录已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpDocTrackService.remove(id);
    message.success('追溯记录已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpDocTrack> = [
    { title: '追溯号', dataIndex: 'traceNo', width: 160, fixed: 'left', render: plain },
    {
      title: '单据类型',
      dataIndex: 'docType',
      width: 120,
      render: (v) => statusTag(ERP_DOC_TRACK_TYPE_LABEL, v),
    },
    { title: '单据编号', dataIndex: 'docNo', width: 150, render: plain },
    { title: '单据标题', dataIndex: 'docTitle', width: 180, ellipsis: true, render: plain },
    {
      title: '来源单据类型',
      dataIndex: 'sourceDocType',
      width: 130,
      render: (v) => statusTag(ERP_DOC_TRACK_TYPE_LABEL, v),
    },
    { title: '来源单据编号', dataIndex: 'sourceDocNo', width: 150, render: plain },
    {
      title: '目标单据类型',
      dataIndex: 'targetDocType',
      width: 130,
      render: (v) => statusTag(ERP_DOC_TRACK_TYPE_LABEL, v),
    },
    { title: '目标单据编号', dataIndex: 'targetDocNo', width: 150, render: plain },
    { title: '追溯层级', dataIndex: 'trackLevel', width: 110, render: plain },
    { title: '审批实例编号', dataIndex: 'approvalInstanceNo', width: 170, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '业务状态',
      dataIndex: 'bizStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_DOC_TRACK_BIZ_STATUS_LABEL, v),
    },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_DOC_APPROVAL_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该追溯记录？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        单据追溯
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="单据类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={docType}
              onChange={(v) => setDocType(v)}
              options={[...ERP_DOC_TRACK_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="业务状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={bizStatus}
              onChange={(v) => setBizStatus(v)}
              options={[...ERP_DOC_TRACK_BIZ_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="审批状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={approvalStatus}
              onChange={(v) => setApprovalStatus(v)}
              options={[...ERP_DOC_APPROVAL_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="追溯号 / 单据编号 / 单据标题 / 来源单据编号"
              allowClear
              style={{ width: 260 }}
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
                  void loadData(1, pageSize, keyword, docType, bizStatus, approvalStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setDocType(undefined);
                  setBizStatus(undefined);
                  setApprovalStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建追溯记录</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`单据追溯（共 ${total} 条）`}>
        <Table<ErpDocTrack>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2200 }}
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
        title={editId == null ? '新建追溯记录' : '编辑追溯记录'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="traceNo" label="追溯号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="docType"
            label="单据类型"
            rules={[{ required: true, message: '请选择单据类型' }]}
          >
            <Select placeholder="请选择单据类型" options={[...ERP_DOC_TRACK_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item
            name="docNo"
            label="单据编号"
            rules={[{ required: true, message: '请输入单据编号' }]}
          >
            <Input placeholder="请输入单据编号" />
          </Form.Item>
          <Form.Item name="docTitle" label="单据标题">
            <Input placeholder="请输入单据标题" />
          </Form.Item>
          <Form.Item name="sourceDocType" label="来源单据类型">
            <Select placeholder="请选择来源单据类型" options={[...ERP_DOC_TRACK_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sourceDocNo" label="来源单据编号">
            <Input placeholder="请输入来源单据编号" />
          </Form.Item>
          <Form.Item name="targetDocType" label="目标单据类型">
            <Select placeholder="请选择目标单据类型" options={[...ERP_DOC_TRACK_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="targetDocNo" label="目标单据编号">
            <Input placeholder="请输入目标单据编号" />
          </Form.Item>
          <Form.Item name="trackLevel" label="追溯层级">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入追溯层级" />
          </Form.Item>
          <Form.Item name="bizStatus" label="业务状态">
            <Select placeholder="为空默认 OPEN" options={[...ERP_DOC_TRACK_BIZ_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="approvalStatus" label="审批状态">
            <Select placeholder="为空默认 NONE" options={[...ERP_DOC_APPROVAL_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="approvalInstanceNo" label="审批实例编号">
            <Input placeholder="请输入审批实例编号" />
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
