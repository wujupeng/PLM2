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
import { erpBarcodeScanService } from '@/services/erpBarcodeService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_BARCODE_SCAN_BIZ_TYPE_LABEL,
  ERP_BARCODE_SCAN_BIZ_TYPE_OPTIONS,
  ERP_BARCODE_SCAN_RESULT_LABEL,
  ERP_BARCODE_SCAN_RESULT_OPTIONS,
  type ErpBarcodeScan,
  type ErpBarcodeScanQuery,
  type ErpBarcodeScanSaveRequest,
} from '@/types/erpBarcode';

const { Title } = Typography;

const MANAGE = 'erp:barcode:scan:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpBarcodeScanSaveRequest, 'scanTime'> & {
  scanTime?: Dayjs;
};

export default function ErpBarcodeScanPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpBarcodeScan[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [scanType, setScanType] = useState<string | undefined>(undefined);
  const [scanResult, setScanResult] = useState<string | undefined>(undefined);
  const [barcodeNo, setBarcodeNo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = scanType,
      result = scanResult,
      barcode = barcodeNo,
    ) => {
      setLoading(true);
      try {
        const params: ErpBarcodeScanQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          scanType: type,
          scanResult: result,
          barcodeNo: barcode || undefined,
        };
        const res = await erpBarcodeScanService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, scanType, scanResult, barcodeNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ scanType: 'RECEIPT', scanResult: 'PASS', scanQty: 0 });
    setOpen(true);
  };

  const openEdit = (record: ErpBarcodeScan) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      scanTime: record.scanTime ? dayjs(record.scanTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpBarcodeScanSaveRequest = {
        ...values,
        scanTime: values.scanTime ? values.scanTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpBarcodeScanService.create(payload);
        message.success('扫描记录已创建');
      } else {
        await erpBarcodeScanService.update(editId, payload);
        message.success('扫描记录已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpBarcodeScanService.remove(id);
    message.success('扫描记录已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpBarcodeScan> = [
    { title: '扫描单号', dataIndex: 'scanNo', width: 170, fixed: 'left', render: plain },
    { title: '条码编号', dataIndex: 'barcodeNo', width: 150, render: plain },
    {
      title: '扫描类型',
      dataIndex: 'scanType',
      width: 120,
      render: (v) => statusTag(ERP_BARCODE_SCAN_BIZ_TYPE_LABEL, v),
    },
    { title: '业务单据号', dataIndex: 'bizNo', width: 150, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '扫描数量', dataIndex: 'scanQty', width: 110, render: plain },
    { title: '扫描时间', dataIndex: 'scanTime', width: 170, render: formatDateTime },
    { title: '扫描人', dataIndex: 'scanner', width: 120, render: plain },
    { title: '失败原因', dataIndex: 'failReason', width: 180, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '扫描结果',
      dataIndex: 'scanResult',
      width: 120,
      fixed: 'right',
      render: (v) => statusTag(ERP_BARCODE_SCAN_RESULT_LABEL, v),
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
              title="确认删除该扫描记录？"
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
        扫描校验
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="扫描类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={scanType}
              onChange={(v) => setScanType(v)}
              options={[...ERP_BARCODE_SCAN_BIZ_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="扫描结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={scanResult}
              onChange={(v) => setScanResult(v)}
              options={[...ERP_BARCODE_SCAN_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="条码编号">
            <Input
              placeholder="条码编号"
              allowClear
              style={{ width: 160 }}
              value={barcodeNo}
              onChange={(e) => setBarcodeNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="扫描单号 / 条码编号 / 物料编码 / 扫描人"
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
                  void loadData(1, pageSize, keyword, scanType, scanResult, barcodeNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setScanType(undefined);
                  setScanResult(undefined);
                  setBarcodeNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建扫描记录</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`扫描校验（共 ${total} 条）`}>
        <Table<ErpBarcodeScan>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2000 }}
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
        title={editId == null ? '新建扫描记录' : '编辑扫描记录'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="scanNo" label="扫描单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="barcodeNo" label="条码编号">
            <Input placeholder="请输入条码编号" />
          </Form.Item>
          <Form.Item name="scanType" label="扫描类型">
            <Select
              placeholder="为空默认 RECEIPT"
              options={[...ERP_BARCODE_SCAN_BIZ_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item name="bizNo" label="业务单据号">
            <Input placeholder="请输入业务单据号" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="scanQty" label="扫描数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入扫描数量" />
          </Form.Item>
          <Form.Item name="scanTime" label="扫描时间">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择扫描时间" />
          </Form.Item>
          <Form.Item name="scanner" label="扫描人">
            <Input placeholder="请输入扫描人" />
          </Form.Item>
          <Form.Item name="scanResult" label="扫描结果">
            <Select placeholder="为空默认 PASS" options={[...ERP_BARCODE_SCAN_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="failReason" label="失败原因">
            <Input.TextArea rows={2} placeholder="请输入失败原因" />
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
