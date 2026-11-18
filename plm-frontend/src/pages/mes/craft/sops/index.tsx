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
import { mesSopService as service } from '@/services/mesCraftService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_SOP_STATUS_LABEL,
  MES_SOP_STATUS_OPTIONS,
  type MesSop,
  type MesSopQuery,
  type MesSopSaveRequest,
} from '@/types/mesCraft';

const { Title } = Typography;

const MANAGE = 'mes:craft:sop:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesSopSaveRequest, 'effectiveDate' | 'publishTime'> & {
  effectiveDate?: Dayjs;
  publishTime?: Dayjs;
};

export default function MesSopPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesSop[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [sopStatus, setSopStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = sopStatus) => {
      setLoading(true);
      try {
        const params: MesSopQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          sopStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, sopStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ sopStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: MesSop) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
      publishTime: record.publishTime ? dayjs(record.publishTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesSopSaveRequest = {
        ...values,
        effectiveDate: values.effectiveDate ? values.effectiveDate.format(DATETIME_FORMAT) : undefined,
        publishTime: values.publishTime ? values.publishTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('SOP作业指导书已创建');
      } else {
        await service.update(editId, payload);
        message.success('SOP作业指导书已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('SOP作业指导书已删除');
    void loadData();
  };

  const columns: ColumnsType<MesSop> = [
    { title: 'SOP单号', dataIndex: 'sopNo', width: 190, fixed: 'left', render: plain },
    { title: 'SOP名称', dataIndex: 'sopName', width: 200, render: plain },
    { title: '工艺编码', dataIndex: 'processCode', width: 130, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: 'SOP版本', dataIndex: 'sopVersion', width: 110, render: plain },
    { title: '附件名称', dataIndex: 'fileName', width: 170, render: plain },
    { title: '生效日期', dataIndex: 'effectiveDate', width: 170, render: formatDateTime },
    {
      title: 'SOP状态',
      dataIndex: 'sopStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(MES_SOP_STATUS_LABEL, v),
    },
    { title: '编制人', dataIndex: 'author', width: 120, render: plain },
    { title: '发布时间', dataIndex: 'publishTime', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该SOP作业指导书？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        SOP作业指导书
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="SOP状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={sopStatus}
              onChange={(v) => setSopStatus(v)}
              options={[...MES_SOP_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="SOP单号 / SOP名称 / 工艺编码 / 物料编码"
              allowClear
              style={{ width: 360 }}
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
                  void loadData(1, pageSize, keyword, sopStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSopStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建SOP作业指导书</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`SOP作业指导书（共 ${total} 条）`}>
        <Table<MesSop>
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
        title={editId == null ? '新建SOP作业指导书' : '编辑SOP作业指导书'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="sopNo" label="SOP单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="sopName" label="SOP名称">
            <Input placeholder="请输入SOP名称" />
          </Form.Item>
          <Form.Item name="processCode" label="工艺编码">
            <Input placeholder="请输入工艺编码" />
          </Form.Item>
          <Form.Item
            name="materialCode"
            label="物料编码"
            rules={[{ required: true, message: '请输入物料编码' }]}
          >
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="规格">
            <Input placeholder="请输入规格" />
          </Form.Item>
          <Form.Item name="sopVersion" label="SOP版本">
            <Input placeholder="请输入SOP版本" />
          </Form.Item>
          <Form.Item name="fileName" label="附件名称">
            <Input placeholder="请输入附件名称" />
          </Form.Item>
          <Form.Item name="fileUrl" label="附件地址">
            <Input placeholder="请输入附件地址" />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sopStatus" label="SOP状态">
            <Select placeholder="为空默认 DRAFT" options={[...MES_SOP_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="author" label="编制人">
            <Input placeholder="请输入编制人" />
          </Form.Item>
          <Form.Item name="publishTime" label="发布时间">
            <DatePicker showTime style={{ width: '100%' }} />
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
