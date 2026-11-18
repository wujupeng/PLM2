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
import { erpBarcodeService } from '@/services/erpBarcodeService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_BARCODE_PRINT_STATUS_LABEL,
  ERP_BARCODE_PRINT_STATUS_OPTIONS,
  ERP_BARCODE_TYPE_LABEL,
  ERP_BARCODE_TYPE_OPTIONS,
  type ErpBarcode,
  type ErpBarcodeQuery,
  type ErpBarcodeSaveRequest,
} from '@/types/erpBarcode';

const { Title } = Typography;

const MANAGE = 'erp:barcode:record:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpBarcodeSaveRequest, 'printTime'> & {
  printTime?: Dayjs;
};

export default function ErpBarcodePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpBarcode[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [barcodeType, setBarcodeType] = useState<string | undefined>(undefined);
  const [printStatus, setPrintStatus] = useState<string | undefined>(undefined);
  const [bizNo, setBizNo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = barcodeType,
      status = printStatus,
      biz = bizNo,
    ) => {
      setLoading(true);
      try {
        const params: ErpBarcodeQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          barcodeType: type,
          printStatus: status,
          bizNo: biz || undefined,
        };
        const res = await erpBarcodeService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, barcodeType, printStatus, bizNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ barcodeType: 'MATERIAL', printStatus: 'UNPRINTED', printCount: 0, qty: 0 });
    setOpen(true);
  };

  const openEdit = (record: ErpBarcode) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      printTime: record.printTime ? dayjs(record.printTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpBarcodeSaveRequest = {
        ...values,
        printTime: values.printTime ? values.printTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpBarcodeService.create(payload);
        message.success('条码记录已创建');
      } else {
        await erpBarcodeService.update(editId, payload);
        message.success('条码记录已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpBarcodeService.remove(id);
    message.success('条码记录已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpBarcode> = [
    { title: '条码号', dataIndex: 'barcodeNo', width: 170, fixed: 'left', render: plain },
    {
      title: '条码类型',
      dataIndex: 'barcodeType',
      width: 120,
      render: (v) => statusTag(ERP_BARCODE_TYPE_LABEL, v),
    },
    { title: '业务单号', dataIndex: 'bizNo', width: 150, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 140, render: plain },
    { title: '数量', dataIndex: 'qty', width: 100, render: plain },
    { title: '单位', dataIndex: 'unit', width: 80, render: plain },
    { title: '规则编码', dataIndex: 'ruleCode', width: 140, render: plain },
    { title: '标签模板', dataIndex: 'templateCode', width: 140, render: plain },
    { title: '打印次数', dataIndex: 'printCount', width: 110, render: plain },
    { title: '打印时间', dataIndex: 'printTime', width: 170, render: formatDateTime },
    { title: '打印机', dataIndex: 'printer', width: 130, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '打印状态',
      dataIndex: 'printStatus',
      width: 120,
      fixed: 'right',
      render: (v) => statusTag(ERP_BARCODE_PRINT_STATUS_LABEL, v),
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
            <Popconfirm
              title="确认删除该条码记录？"
              onConfirm={() => record.id != null && void remove(record.id)}
            >
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
        条码生成
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="条码类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={barcodeType}
              onChange={(v) => setBarcodeType(v)}
              options={[...ERP_BARCODE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="打印状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={printStatus}
              onChange={(v) => setPrintStatus(v)}
              options={[...ERP_BARCODE_PRINT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="业务单号">
            <Input
              placeholder="业务单号"
              allowClear
              style={{ width: 160 }}
              value={bizNo}
              onChange={(e) => setBizNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="条码号 / 业务单号 / 物料编码 / 物料名称"
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
                  void loadData(1, pageSize, keyword, barcodeType, printStatus, bizNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setBarcodeType(undefined);
                  setPrintStatus(undefined);
                  setBizNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建条码记录</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`条码生成（共 ${total} 条）`}>
        <Table<ErpBarcode>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2320 }}
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
        title={editId == null ? '新建条码记录' : '编辑条码记录'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="barcodeNo" label="条码号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="barcodeType" label="条码类型">
            <Select placeholder="为空默认 MATERIAL" options={[...ERP_BARCODE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="bizNo" label="业务单号">
            <Input placeholder="请输入业务单号" />
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
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="qty" label="数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入数量" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="ruleCode" label="规则编码">
            <Input placeholder="请输入规则编码" />
          </Form.Item>
          <Form.Item name="templateCode" label="标签模板编码">
            <Input placeholder="请输入标签模板编码" />
          </Form.Item>
          <Form.Item name="printStatus" label="打印状态">
            <Select placeholder="为空默认 UNPRINTED" options={[...ERP_BARCODE_PRINT_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="printCount" label="打印次数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入打印次数" />
          </Form.Item>
          <Form.Item name="printTime" label="打印时间">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择打印时间" />
          </Form.Item>
          <Form.Item name="printer" label="打印机">
            <Input placeholder="请输入打印机" />
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
