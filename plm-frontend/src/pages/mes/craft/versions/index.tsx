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
import { mesProcessVersionService as service } from '@/services/mesCraftService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_PROCESS_VERSION_STATUS_LABEL,
  MES_PROCESS_VERSION_STATUS_OPTIONS,
  type MesProcessVersion,
  type MesProcessVersionQuery,
  type MesProcessVersionSaveRequest,
} from '@/types/mesCraft';

const { Title } = Typography;

const MANAGE = 'mes:craft:version:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesProcessVersionSaveRequest, 'effectiveDate' | 'expireDate' | 'approveTime'> & {
  effectiveDate?: Dayjs;
  expireDate?: Dayjs;
  approveTime?: Dayjs;
};

export default function MesProcessVersionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesProcessVersion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [versionStatus, setVersionStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = versionStatus) => {
      setLoading(true);
      try {
        const params: MesProcessVersionQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          versionStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, versionStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ versionStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: MesProcessVersion) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
      expireDate: record.expireDate ? dayjs(record.expireDate) : undefined,
      approveTime: record.approveTime ? dayjs(record.approveTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesProcessVersionSaveRequest = {
        ...values,
        effectiveDate: values.effectiveDate ? values.effectiveDate.format(DATETIME_FORMAT) : undefined,
        expireDate: values.expireDate ? values.expireDate.format(DATETIME_FORMAT) : undefined,
        approveTime: values.approveTime ? values.approveTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('工艺版本已创建');
      } else {
        await service.update(editId, payload);
        message.success('工艺版本已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('工艺版本已删除');
    void loadData();
  };

  const columns: ColumnsType<MesProcessVersion> = [
    { title: '工艺版本号', dataIndex: 'processVersionNo', width: 190, fixed: 'left', render: plain },
    { title: '工艺编码', dataIndex: 'processCode', width: 130, render: plain },
    { title: '工艺名称', dataIndex: 'processName', width: 160, render: plain },
    { title: '版本号', dataIndex: 'versionNo', width: 100, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '工艺路线编码', dataIndex: 'routeCode', width: 130, render: plain },
    { title: '工艺路线名称', dataIndex: 'routeName', width: 160, render: plain },
    { title: '生效日期', dataIndex: 'effectiveDate', width: 170, render: formatDateTime },
    { title: '失效日期', dataIndex: 'expireDate', width: 170, render: formatDateTime },
    {
      title: '版本状态',
      dataIndex: 'versionStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(MES_PROCESS_VERSION_STATUS_LABEL, v),
    },
    { title: '审批人', dataIndex: 'approver', width: 120, render: plain },
    { title: '审批时间', dataIndex: 'approveTime', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该工艺版本？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        工艺版本
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="版本状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={versionStatus}
              onChange={(v) => setVersionStatus(v)}
              options={[...MES_PROCESS_VERSION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="工艺版本号 / 工艺编码 / 物料编码 / 物料名称"
              allowClear
              style={{ width: 380 }}
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
                  void loadData(1, pageSize, keyword, versionStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setVersionStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建工艺版本</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`工艺版本（共 ${total} 条）`}>
        <Table<MesProcessVersion>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2500 }}
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
        title={editId == null ? '新建工艺版本' : '编辑工艺版本'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="processVersionNo" label="工艺版本号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="processCode" label="工艺编码">
            <Input placeholder="请输入工艺编码" />
          </Form.Item>
          <Form.Item name="processName" label="工艺名称">
            <Input placeholder="请输入工艺名称" />
          </Form.Item>
          <Form.Item name="versionNo" label="版本号">
            <Input placeholder="请输入版本号" />
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
          <Form.Item name="routeCode" label="工艺路线编码">
            <Input placeholder="请输入工艺路线编码" />
          </Form.Item>
          <Form.Item name="routeName" label="工艺路线名称">
            <Input placeholder="请输入工艺路线名称" />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expireDate" label="失效日期">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="versionStatus" label="版本状态">
            <Select placeholder="为空默认 DRAFT" options={[...MES_PROCESS_VERSION_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="approver" label="审批人">
            <Input placeholder="请输入审批人" />
          </Form.Item>
          <Form.Item name="approveTime" label="审批时间">
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
