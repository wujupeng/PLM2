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
import { srmIncomingQualityService as service } from '@/services/srmQualityService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_IQC_RESULT_LABEL,
  SRM_IQC_RESULT_OPTIONS,
  SRM_IQC_STATUS_LABEL,
  SRM_IQC_STATUS_OPTIONS,
  type SrmIncomingQuality,
  type SrmIncomingQualityQuery,
  type SrmIncomingQualitySaveRequest,
} from '@/types/srmQuality';

const { Title } = Typography;

const MANAGE = 'srm:quality:iqc:manage';

type FormValues = Omit<SrmIncomingQualitySaveRequest, 'inspectDate'> & {
  inspectDate?: Dayjs;
};

export default function SrmIncomingQualityPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmIncomingQuality[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [inspectionResult, setInspectionResult] = useState<string | undefined>(undefined);
  const [iqcStatus, setIqcStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      result = inspectionResult,
      status = iqcStatus,
    ) => {
      setLoading(true);
      try {
        const params: SrmIncomingQualityQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          inspectionResult: result,
          iqcStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, inspectionResult, iqcStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ inspectionResult: 'PENDING', iqcStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: SrmIncomingQuality) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      inspectDate: record.inspectDate ? dayjs(record.inspectDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmIncomingQualitySaveRequest = {
        ...values,
        inspectDate: values.inspectDate ? values.inspectDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('来料检验单已创建');
      } else {
        await service.update(editId, payload);
        message.success('来料检验单已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('来料检验单已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmIncomingQuality> = [
    { title: '来料检验单号', dataIndex: 'iqcNo', width: 170, fixed: 'left', render: plain },
    { title: '采购订单号', dataIndex: 'poNo', width: 150, render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 150, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 130, render: plain },
    { title: '收货数量', dataIndex: 'receiveQty', width: 100, render: plain },
    { title: '单位', dataIndex: 'unit', width: 80, render: plain },
    { title: '抽检数量', dataIndex: 'sampleQty', width: 100, render: plain },
    { title: '不良数量', dataIndex: 'defectQty', width: 100, render: plain },
    { title: '不良率%', dataIndex: 'defectRate', width: 100, render: plain },
    {
      title: '检验结果',
      dataIndex: 'inspectionResult',
      width: 110,
      render: (v) => statusTag(SRM_IQC_RESULT_LABEL, v),
    },
    { title: '不良描述', dataIndex: 'defectDesc', width: 180, render: plain },
    { title: '检验员', dataIndex: 'inspector', width: 100, render: plain },
    { title: '检验日期', dataIndex: 'inspectDate', width: 120, render: formatDate },
    {
      title: '检验状态',
      dataIndex: 'iqcStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_IQC_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该来料检验单？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        来料质量
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="检验结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={inspectionResult}
              onChange={(v) => setInspectionResult(v)}
              options={[...SRM_IQC_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="检验状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={iqcStatus}
              onChange={(v) => setIqcStatus(v)}
              options={[...SRM_IQC_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="来料检验单号 / 采购订单号 / 供应商编码 / 供应商名称"
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
                  void loadData(1, pageSize, keyword, inspectionResult, iqcStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setInspectionResult(undefined);
                  setIqcStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建来料检验单</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`来料质量（共 ${total} 条）`}>
        <Table<SrmIncomingQuality>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 3200 }}
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
        title={editId == null ? '新建来料检验单' : '编辑来料检验单'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="iqcNo" label="来料检验单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="poNo" label="采购订单号">
            <Input placeholder="请输入采购订单号" />
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
          <Form.Item name="spec" label="规格型号">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="receiveQty" label="收货数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="sampleQty" label="抽检数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="defectQty" label="不良数量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="defectRate" label="不良率%">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="inspectionResult" label="检验结果">
            <Select placeholder="为空默认 PENDING" options={[...SRM_IQC_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="defectDesc" label="不良描述">
            <Input.TextArea rows={2} placeholder="请输入不良描述" />
          </Form.Item>
          <Form.Item name="inspector" label="检验员">
            <Input placeholder="请输入检验员" />
          </Form.Item>
          <Form.Item name="inspectDate" label="检验日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="iqcStatus" label="检验状态">
            <Select placeholder="为空默认 DRAFT" options={[...SRM_IQC_STATUS_OPTIONS]} />
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
