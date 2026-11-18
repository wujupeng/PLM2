import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
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
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { srmRectificationService as service } from '@/services/srmQualityService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_RECTIFICATION_STATUS_LABEL,
  SRM_RECTIFICATION_STATUS_OPTIONS,
  type SrmRectification,
  type SrmRectificationQuery,
  type SrmRectificationSaveRequest,
} from '@/types/srmQuality';

const { Title } = Typography;

const MANAGE = 'srm:quality:rectification:manage';

type FormValues = Omit<SrmRectificationSaveRequest, 'planDate' | 'completeDate' | 'verifyDate'> & {
  planDate?: Dayjs;
  completeDate?: Dayjs;
  verifyDate?: Dayjs;
};

export default function SrmRectificationPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmRectification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [rectificationStatus, setRectificationStatus] = useState<string | undefined>(undefined);
  const [sourceNo, setSourceNo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = rectificationStatus, src = sourceNo) => {
      setLoading(true);
      try {
        const params: SrmRectificationQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          rectificationStatus: status,
          sourceNo: src,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, rectificationStatus, sourceNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ rectificationStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: SrmRectification) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      planDate: record.planDate ? dayjs(record.planDate) : undefined,
      completeDate: record.completeDate ? dayjs(record.completeDate) : undefined,
      verifyDate: record.verifyDate ? dayjs(record.verifyDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmRectificationSaveRequest = {
        ...values,
        planDate: values.planDate ? values.planDate.format(DATE_FORMAT) : undefined,
        completeDate: values.completeDate ? values.completeDate.format(DATE_FORMAT) : undefined,
        verifyDate: values.verifyDate ? values.verifyDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('整改跟踪已创建');
      } else {
        await service.update(editId, payload);
        message.success('整改跟踪已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('整改跟踪已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmRectification> = [
    { title: '整改单号', dataIndex: 'rectificationNo', width: 170, fixed: 'left', render: plain },
    { title: '来源单号', dataIndex: 'sourceNo', width: 150, render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 150, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '问题描述', dataIndex: 'issueDesc', width: 200, render: plain },
    { title: '整改措施', dataIndex: 'rectifyAction', width: 220, render: plain },
    { title: '责任人', dataIndex: 'responsible', width: 100, render: plain },
    { title: '计划完成日期', dataIndex: 'planDate', width: 130, render: formatDate },
    { title: '实际完成日期', dataIndex: 'completeDate', width: 130, render: formatDate },
    { title: '验证人', dataIndex: 'verifyBy', width: 100, render: plain },
    { title: '验证日期', dataIndex: 'verifyDate', width: 120, render: formatDate },
    { title: '验证结论', dataIndex: 'verifyResult', width: 180, render: plain },
    {
      title: '整改状态',
      dataIndex: 'rectificationStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_RECTIFICATION_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该整改跟踪？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        整改跟踪
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="整改状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={rectificationStatus}
              onChange={(v) => setRectificationStatus(v)}
              options={[...SRM_RECTIFICATION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="来源单号">
            <Input
              placeholder="请输入来源单号"
              allowClear
              style={{ width: 200 }}
              value={sourceNo}
              onChange={(e) => setSourceNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="整改单号 / 来源单号 / 供应商编码 / 供应商名称"
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
                  void loadData(1, pageSize, keyword, rectificationStatus, sourceNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRectificationStatus(undefined);
                  setSourceNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建整改跟踪</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`整改跟踪（共 ${total} 条）`}>
        <Table<SrmRectification>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 3000 }}
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
        title={editId == null ? '新建整改跟踪' : '编辑整改跟踪'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="rectificationNo" label="整改单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="sourceNo" label="来源单号">
            <Input placeholder="请输入来源单号" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="issueDesc" label="问题描述">
            <Input.TextArea rows={2} placeholder="请输入问题描述" />
          </Form.Item>
          <Form.Item name="rectifyAction" label="整改措施">
            <Input.TextArea rows={3} placeholder="请输入整改措施" />
          </Form.Item>
          <Form.Item name="responsible" label="责任人">
            <Input placeholder="请输入责任人" />
          </Form.Item>
          <Form.Item name="planDate" label="计划完成日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="completeDate" label="实际完成日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="verifyBy" label="验证人">
            <Input placeholder="请输入验证人" />
          </Form.Item>
          <Form.Item name="verifyDate" label="验证日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="verifyResult" label="验证结论">
            <Input.TextArea rows={2} placeholder="请输入验证结论" />
          </Form.Item>
          <Form.Item name="rectificationStatus" label="整改状态">
            <Select placeholder="为空默认 PENDING" options={[...SRM_RECTIFICATION_STATUS_OPTIONS]} />
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
