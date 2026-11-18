import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
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
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { srmPortalAttachmentService as service } from '@/services/srmPortalService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_PORTAL_ATTACHMENT_STATUS_LABEL,
  SRM_PORTAL_ATTACHMENT_STATUS_OPTIONS,
  SRM_PORTAL_BIZ_TYPE_LABEL,
  SRM_PORTAL_BIZ_TYPE_OPTIONS,
  type SrmPortalAttachment,
  type SrmPortalAttachmentQuery,
  type SrmPortalAttachmentSaveRequest,
} from '@/types/srmPortal';

const { Title } = Typography;

const MANAGE = 'srm:portal:attachment:manage';

type FormValues = Omit<SrmPortalAttachmentSaveRequest, 'uploadDate'> & {
  uploadDate?: Dayjs;
};

export default function SrmPortalAttachmentPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmPortalAttachment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [bizType, setBizType] = useState<string | undefined>(undefined);
  const [attachmentStatus, setAttachmentStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, biz = bizType, status = attachmentStatus) => {
      setLoading(true);
      try {
        const params: SrmPortalAttachmentQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          bizType: biz,
          attachmentStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, bizType, attachmentStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ bizType: 'MESSAGE', attachmentStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: SrmPortalAttachment) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      uploadDate: record.uploadDate ? dayjs(record.uploadDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmPortalAttachmentSaveRequest = {
        ...values,
        uploadDate: values.uploadDate ? values.uploadDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('门户附件已创建');
      } else {
        await service.update(editId, payload);
        message.success('门户附件已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('门户附件已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmPortalAttachment> = [
    { title: '附件编号', dataIndex: 'attachmentNo', width: 170, fixed: 'left', render: plain },
    {
      title: '业务类型',
      dataIndex: 'bizType',
      width: 120,
      render: (v) => statusTag(SRM_PORTAL_BIZ_TYPE_LABEL, v),
    },
    { title: '关联单号', dataIndex: 'bizNo', width: 150, render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '文件名', dataIndex: 'fileName', width: 220, render: plain },
    { title: '文件类型', dataIndex: 'fileType', width: 100, render: plain },
    { title: '文件大小', dataIndex: 'fileSize', width: 110, render: plain },
    { title: '上传人', dataIndex: 'uploader', width: 100, render: plain },
    { title: '上传日期', dataIndex: 'uploadDate', width: 120, render: formatDate },
    {
      title: '附件状态',
      dataIndex: 'attachmentStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_PORTAL_ATTACHMENT_STATUS_LABEL, v),
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该门户附件？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        门户附件
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="业务类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={bizType}
              onChange={(v) => setBizType(v)}
              options={[...SRM_PORTAL_BIZ_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="附件状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={attachmentStatus}
              onChange={(v) => setAttachmentStatus(v)}
              options={[...SRM_PORTAL_ATTACHMENT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="附件编号 / 关联单号 / 文件名 / 供应商编码"
              allowClear
              style={{ width: 280 }}
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
                  void loadData(1, pageSize, keyword, bizType, attachmentStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setBizType(undefined);
                  setAttachmentStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建门户附件</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`门户附件（共 ${total} 条）`}>
        <Table<SrmPortalAttachment>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2400 }}
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
        title={editId == null ? '新建门户附件' : '编辑门户附件'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="attachmentNo" label="附件编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="bizType" label="业务类型">
            <Select placeholder="为空默认 MESSAGE" options={[...SRM_PORTAL_BIZ_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="bizNo" label="关联单号">
            <Input placeholder="请输入关联单号" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="fileName" label="文件名">
            <Input placeholder="请输入文件名" />
          </Form.Item>
          <Form.Item name="filePath" label="文件路径">
            <Input placeholder="请输入文件路径" />
          </Form.Item>
          <Form.Item name="fileType" label="文件类型">
            <Input placeholder="如 pdf/docx" />
          </Form.Item>
          <Form.Item name="fileSize" label="文件大小(字节)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="uploader" label="上传人">
            <Input placeholder="请输入上传人" />
          </Form.Item>
          <Form.Item name="uploadDate" label="上传日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="attachmentStatus" label="附件状态">
            <Select placeholder="为空默认 PENDING" options={[...SRM_PORTAL_ATTACHMENT_STATUS_OPTIONS]} />
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
