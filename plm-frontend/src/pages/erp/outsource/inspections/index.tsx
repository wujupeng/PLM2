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
import { erpOutsourceInspectionService } from '@/services/erpOutsourceService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_OUTSOURCE_INSPECTION_RESULT_LABEL,
  ERP_OUTSOURCE_INSPECTION_RESULT_OPTIONS,
  ERP_OUTSOURCE_INSPECTION_STATUS_LABEL,
  ERP_OUTSOURCE_INSPECTION_STATUS_OPTIONS,
  ERP_OUTSOURCE_INSPECTION_TYPE_LABEL,
  ERP_OUTSOURCE_INSPECTION_TYPE_OPTIONS,
  type ErpOutsourceInspection,
  type ErpOutsourceInspectionSaveRequest,
} from '@/types/erpOutsource';

const { Title } = Typography;

const MANAGE = 'erp:outsource:inspection:manage';

type FormValues = Omit<ErpOutsourceInspectionSaveRequest, 'inspectionDate'> & {
  inspectionDate?: Dayjs;
};

export default function ErpOutsourceInspectionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpOutsourceInspection[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [inspectionStatus, setInspectionStatus] = useState<string | undefined>(undefined);
  const [inspectionResult, setInspectionResult] = useState<string | undefined>(undefined);
  const [receiptNo, setReceiptNo] = useState('');
  const [materialCode, setMaterialCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = inspectionStatus,
      result = inspectionResult,
      no = receiptNo,
      material = materialCode,
    ) => {
      setLoading(true);
      try {
        const res = await erpOutsourceInspectionService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          inspectionStatus: status,
          inspectionResult: result,
          receiptNo: no || undefined,
          materialCode: material || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, inspectionStatus, inspectionResult, receiptNo, materialCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ inspectionType: 'FULL', inspectionResult: 'PENDING', inspectionStatus: 'OPEN' });
    setOpen(true);
  };

  const openEdit = (record: ErpOutsourceInspection) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      inspectionDate: record.inspectionDate ? dayjs(record.inspectionDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        ...values,
        inspectionDate: values.inspectionDate
          ? values.inspectionDate.format('YYYY-MM-DDTHH:mm:ss')
          : undefined,
      };
      if (editId == null) {
        await erpOutsourceInspectionService.create(payload);
        message.success('委外报检已创建');
      } else {
        await erpOutsourceInspectionService.update(editId, payload);
        message.success('委外报检已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpOutsourceInspectionService.remove(id);
    message.success('委外报检已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpOutsourceInspection> = [
    { title: '报检单号', dataIndex: 'inspectionNo', width: 160, fixed: 'left', render: plain },
    { title: '到货单号', dataIndex: 'receiptNo', width: 160, render: plain },
    { title: '委外订单号', dataIndex: 'orderNo', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    {
      title: '报检类型',
      dataIndex: 'inspectionType',
      width: 110,
      render: (v) => statusTag(ERP_OUTSOURCE_INSPECTION_TYPE_LABEL, v),
    },
    { title: '报检数量', dataIndex: 'inspectionQty', width: 110, render: plain },
    { title: '合格数量', dataIndex: 'qualifiedQty', width: 110, render: plain },
    { title: '不合格数量', dataIndex: 'rejectedQty', width: 110, render: plain },
    {
      title: '检验结果',
      dataIndex: 'inspectionResult',
      width: 110,
      render: (v) => statusTag(ERP_OUTSOURCE_INSPECTION_RESULT_LABEL, v),
    },
    { title: '检验员', dataIndex: 'inspector', width: 120, render: plain },
    { title: '检验日期', dataIndex: 'inspectionDate', width: 170, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '报检状态',
      dataIndex: 'inspectionStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ERP_OUTSOURCE_INSPECTION_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该委外报检？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        委外报检
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="报检状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={inspectionStatus}
              onChange={(v) => setInspectionStatus(v)}
              options={[...ERP_OUTSOURCE_INSPECTION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="检验结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={inspectionResult}
              onChange={(v) => setInspectionResult(v)}
              options={[...ERP_OUTSOURCE_INSPECTION_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="到货单号">
            <Input
              placeholder="请输入到货单号"
              allowClear
              style={{ width: 160 }}
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
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
              placeholder="报检单号 / 物料名称"
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
                  void loadData(1, pageSize, keyword, inspectionStatus, inspectionResult, receiptNo, materialCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setInspectionStatus(undefined);
                  setInspectionResult(undefined);
                  setReceiptNo('');
                  setMaterialCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建报检</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`委外报检（共 ${total} 条）`}>
        <Table<ErpOutsourceInspection>
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
        title={editId == null ? '新建报检' : '编辑报检'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="inspectionNo" label="报检单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="receiptNo" label="到货单号">
            <Input placeholder="请输入到货单号" />
          </Form.Item>
          <Form.Item name="orderNo" label="委外订单号">
            <Input placeholder="请输入委外订单号" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="inspectionType" label="报检类型">
            <Select placeholder="为空默认 FULL" options={[...ERP_OUTSOURCE_INSPECTION_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="inspectionQty" label="报检数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入报检数量" />
          </Form.Item>
          <Form.Item name="qualifiedQty" label="合格数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入合格数量" />
          </Form.Item>
          <Form.Item name="rejectedQty" label="不合格数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入不合格数量" />
          </Form.Item>
          <Form.Item name="inspectionResult" label="检验结果">
            <Select placeholder="为空默认 PENDING" options={[...ERP_OUTSOURCE_INSPECTION_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="inspector" label="检验员">
            <Input placeholder="请输入检验员" />
          </Form.Item>
          <Form.Item name="inspectionDate" label="检验日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择检验日期" />
          </Form.Item>
          <Form.Item name="inspectionStatus" label="报检状态">
            <Select placeholder="为空默认 OPEN" options={[...ERP_OUTSOURCE_INSPECTION_STATUS_OPTIONS]} />
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
