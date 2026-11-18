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
import { srmSourcingRequestService as service } from '@/services/srmSourcingService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_CURRENCY_LABEL,
  SRM_CURRENCY_OPTIONS,
  SRM_SOURCING_STATUS_LABEL,
  SRM_SOURCING_STATUS_OPTIONS,
  SRM_SOURCING_TYPE_LABEL,
  SRM_SOURCING_TYPE_OPTIONS,
  type SrmSourcingRequest,
  type SrmSourcingRequestQuery,
  type SrmSourcingRequestSaveRequest,
} from '@/types/srmSourcing';

const { Title } = Typography;

const MANAGE = 'srm:sourcing:request:manage';

type FormValues = Omit<SrmSourcingRequestSaveRequest, 'demandDate'> & {
  demandDate?: Dayjs;
};

export default function SrmSourcingRequestPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmSourcingRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [sourcingType, setSourcingType] = useState<string | undefined>(undefined);
  const [sourcingStatus, setSourcingStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = sourcingType,
      status = sourcingStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmSourcingRequestQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          sourcingType: type,
          sourcingStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, sourcingType, sourcingStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ sourcingType: 'RFQ', sourcingStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: SrmSourcingRequest) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      demandDate: record.demandDate ? dayjs(record.demandDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmSourcingRequestSaveRequest = {
        ...values,
        demandDate: values.demandDate ? values.demandDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('采购需求寻源已创建');
      } else {
        await service.update(editId, payload);
        message.success('采购需求寻源已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('采购需求寻源已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmSourcingRequest> = [
    { title: '寻源单号', dataIndex: 'sourcingNo', width: 170, fixed: 'left', render: plain },
    { title: '寻源标题', dataIndex: 'sourcingTitle', width: 200, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 140, render: plain },
    { title: '需求数量', dataIndex: 'demandQty', width: 110, render: plain },
    { title: '单位', dataIndex: 'unit', width: 80, render: plain },
    { title: '需求日期', dataIndex: 'demandDate', width: 120, render: formatDate },
    { title: '需求部门', dataIndex: 'demandDept', width: 140, render: plain },
    { title: '申请人', dataIndex: 'applicant', width: 100, render: plain },
    {
      title: '寻源方式',
      dataIndex: 'sourcingType',
      width: 120,
      render: (v) => statusTag(SRM_SOURCING_TYPE_LABEL, v),
    },
    { title: '预算金额', dataIndex: 'budgetAmount', width: 120, render: plain },
    {
      title: '币种',
      dataIndex: 'currency',
      width: 100,
      render: (v) => statusTag(SRM_CURRENCY_LABEL, v),
    },
    {
      title: '寻源状态',
      dataIndex: 'sourcingStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_SOURCING_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该采购需求寻源？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        采购需求寻源
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="寻源方式">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={sourcingType}
              onChange={(v) => setSourcingType(v)}
              options={[...SRM_SOURCING_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="寻源状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={sourcingStatus}
              onChange={(v) => setSourcingStatus(v)}
              options={[...SRM_SOURCING_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="寻源单号 / 寻源标题 / 物料编码 / 物料名称"
              allowClear
              style={{ width: 320 }}
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
                  void loadData(1, pageSize, keyword, sourcingType, sourcingStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSourcingType(undefined);
                  setSourcingStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建采购需求寻源</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`采购需求寻源（共 ${total} 条）`}>
        <Table<SrmSourcingRequest>
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
        title={editId == null ? '新建采购需求寻源' : '编辑采购需求寻源'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="sourcingNo" label="寻源单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="sourcingTitle" label="寻源标题">
            <Input placeholder="请输入寻源标题" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="规格型号">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
          <Form.Item name="demandQty" label="需求数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入需求数量" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="demandDate" label="需求日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择需求日期" />
          </Form.Item>
          <Form.Item name="demandDept" label="需求部门">
            <Input placeholder="请输入需求部门" />
          </Form.Item>
          <Form.Item name="applicant" label="申请人">
            <Input placeholder="请输入申请人" />
          </Form.Item>
          <Form.Item name="sourcingType" label="寻源方式">
            <Select placeholder="为空默认 RFQ" options={[...SRM_SOURCING_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="budgetAmount" label="预算金额">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入预算金额" />
          </Form.Item>
          <Form.Item name="currency" label="币种">
            <Select placeholder="为空默认 CNY" options={[...SRM_CURRENCY_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sourcingStatus" label="寻源状态">
            <Select placeholder="为空默认 DRAFT" options={[...SRM_SOURCING_STATUS_OPTIONS]} />
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
