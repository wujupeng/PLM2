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
import { erpProcessStandardService } from '@/services/erpProcessService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_PROCESS_STANDARD_STATUS_LABEL,
  ERP_PROCESS_STANDARD_STATUS_OPTIONS,
  type ErpProcessStandard,
  type ErpProcessStandardQuery,
  type ErpProcessStandardSaveRequest,
} from '@/types/erpProcess';

const { Title } = Typography;

const MANAGE = 'erp:process:standard:manage';

type FormValues = Omit<ErpProcessStandardSaveRequest, 'effectiveDate' | 'expireDate'> & {
  effectiveDate?: Dayjs;
  expireDate?: Dayjs;
};

export default function ErpProcessStandardPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpProcessStandard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [standardStatus, setStandardStatus] = useState<string | undefined>(undefined);
  const [materialCode, setMaterialCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = standardStatus,
      material = materialCode,
    ) => {
      setLoading(true);
      try {
        const params: ErpProcessStandardQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          standardStatus: status,
          materialCode: material || undefined,
        };
        const res = await erpProcessStandardService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, standardStatus, materialCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ standardStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpProcessStandard) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
      expireDate: record.expireDate ? dayjs(record.expireDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpProcessStandardSaveRequest = {
        ...values,
        effectiveDate: values.effectiveDate ? values.effectiveDate.format(DATE_FORMAT) : undefined,
        expireDate: values.expireDate ? values.expireDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpProcessStandardService.create(payload);
        message.success('标准工艺已创建');
      } else {
        await erpProcessStandardService.update(editId, payload);
        message.success('标准工艺已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpProcessStandardService.remove(id);
    message.success('标准工艺已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpProcessStandard> = [
    { title: '标准工艺编码', dataIndex: 'standardCode', width: 170, fixed: 'left', render: plain },
    { title: '标准工艺名称', dataIndex: 'standardName', width: 180, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '版本号', dataIndex: 'versionNo', width: 100, render: plain },
    { title: '工艺路线编码', dataIndex: 'routeCode', width: 140, render: plain },
    { title: '标准工时', dataIndex: 'standardHours', width: 110, render: plain },
    { title: '准备工时', dataIndex: 'setupHours', width: 110, render: plain },
    { title: '工序数', dataIndex: 'operationCount', width: 90, render: plain },
    { title: '生效日期', dataIndex: 'effectiveDate', width: 120, render: formatDate },
    { title: '失效日期', dataIndex: 'expireDate', width: 120, render: formatDate },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '标准状态',
      dataIndex: 'standardStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_PROCESS_STANDARD_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该标准工艺？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        标准工艺
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="标准状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={standardStatus}
              onChange={(v) => setStandardStatus(v)}
              options={[...ERP_PROCESS_STANDARD_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="物料编码">
            <Input
              placeholder="请输入物料编码"
              allowClear
              style={{ width: 160 }}
              value={materialCode}
              onChange={(e) => setMaterialCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="标准工艺编码 / 名称 / 物料编码 / 物料名称"
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
                  void loadData(1, pageSize, keyword, standardStatus, materialCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setStandardStatus(undefined);
                  setMaterialCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建标准工艺</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`标准工艺（共 ${total} 条）`}>
        <Table<ErpProcessStandard>
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
        title={editId == null ? '新建标准工艺' : '编辑标准工艺'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="standardCode"
            label="标准工艺编码"
            rules={[{ required: true, message: '请输入标准工艺编码' }]}
          >
            <Input placeholder="请输入标准工艺编码" />
          </Form.Item>
          <Form.Item name="standardName" label="标准工艺名称">
            <Input placeholder="请输入标准工艺名称" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="versionNo" label="版本号">
            <Input placeholder="为空默认 V1.0" />
          </Form.Item>
          <Form.Item name="routeCode" label="工艺路线编码">
            <Input placeholder="请输入工艺路线编码" />
          </Form.Item>
          <Form.Item name="standardHours" label="标准工时">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入标准工时" />
          </Form.Item>
          <Form.Item name="setupHours" label="准备工时">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入准备工时" />
          </Form.Item>
          <Form.Item name="operationCount" label="工序数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入工序数" />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择生效日期" />
          </Form.Item>
          <Form.Item name="expireDate" label="失效日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择失效日期" />
          </Form.Item>
          <Form.Item name="standardStatus" label="标准状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_PROCESS_STANDARD_STATUS_OPTIONS]} />
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
