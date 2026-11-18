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
import { QrcodeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { scanLogService } from '@/services/mobileService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { boolTag, statusTag } from '@/pages/platform/mobile/shared';
import {
  SCAN_RESULT_LABEL,
  SCAN_RESULT_OPTIONS,
  SCAN_TYPE_LABEL,
  SCAN_TYPE_OPTIONS,
  type MobileScanLogItem,
  type MobileScanLogSaveParams,
  type MobileScanParams,
} from '@/types/mobile';

const { Title } = Typography;

const SCANLOG_MANAGE = 'platform:mobile:scanlog:manage';

export default function MobileScanLogPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MobileScanLogSaveParams>();
  const [scanForm] = Form.useForm<MobileScanParams>();
  const [data, setData] = useState<MobileScanLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [sceneCode, setSceneCode] = useState('');
  const [scanType, setScanType] = useState<string | undefined>(undefined);
  const [scanResult, setScanResult] = useState<string | undefined>(undefined);
  const [barcode, setBarcode] = useState('');
  const [deviceNo, setDeviceNo] = useState('');
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanSaving, setScanSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      sCode = sceneCode,
      sType = scanType,
      sResult = scanResult,
      bar = barcode,
      dNo = deviceNo,
      rg = range,
    ) => {
      setLoading(true);
      try {
        const res = await scanLogService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          sceneCode: sCode || undefined,
          scanType: sType,
          scanResult: sResult,
          barcode: bar || undefined,
          deviceNo: dNo || undefined,
          startDate: rg ? rg[0].format(DATE_FORMAT) : undefined,
          endDate: rg ? rg[1].format(DATE_FORMAT) : undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, sceneCode, scanType, scanResult, barcode, deviceNo, range],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined, undefined, '', '', null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ scanType: 'RECEIVE', scanResult: 'SUCCESS', labelValid: 1 });
    setOpen(true);
  };

  const openEdit = (record: MobileScanLogItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MobileScanLogSaveParams = { ...values };
      if (editId == null) {
        await scanLogService.create(payload);
        message.success('扫码日志已创建');
      } else {
        await scanLogService.update(editId, payload);
        message.success('扫码日志已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await scanLogService.remove(id);
    message.success('扫码日志已删除');
    void loadData();
  };

  const openScan = () => {
    scanForm.resetFields();
    scanForm.setFieldsValue({ scanType: 'RECEIVE' });
    setScanOpen(true);
  };

  const submitScan = async () => {
    const values = await scanForm.validateFields();
    setScanSaving(true);
    try {
      const res = await scanLogService.scan({
        barcode: values.barcode,
        sceneCode: values.sceneCode || undefined,
        scanType: values.scanType,
        deviceNo: values.deviceNo || undefined,
      });
      const resultLabel = SCAN_RESULT_LABEL[String(res.scanResult)] || res.scanResult || '';
      const tip = `扫码结果：${resultLabel}；标签有效：${Number(res.labelValid) === 1 ? '是' : '否'}`;
      if (res.scanResult === 'SUCCESS') {
        message.success(tip);
      } else {
        message.warning(tip);
      }
      if (res.message) {
        message.info(res.message);
      }
      setScanOpen(false);
      setPageNum(1);
      void loadData(1, pageSize);
    } finally {
      setScanSaving(false);
    }
  };

  const columns: ColumnsType<MobileScanLogItem> = [
    { title: '日志编号', dataIndex: 'logNo', width: 160, fixed: 'left', render: plain },
    { title: '条码', dataIndex: 'barcode', width: 180, render: plain },
    { title: '场景编码', dataIndex: 'sceneCode', width: 140, render: plain },
    { title: '扫码类型', dataIndex: 'scanType', width: 120, render: (v) => statusTag(SCAN_TYPE_LABEL, v) },
    { title: '扫码结果', dataIndex: 'scanResult', width: 100, render: (v) => statusTag(SCAN_RESULT_LABEL, v) },
    { title: '标签有效', dataIndex: 'labelValid', width: 90, render: boolTag },
    { title: '业务键', dataIndex: 'bizKey', width: 160, ellipsis: true, render: plain },
    { title: '单据号', dataIndex: 'docNo', width: 160, render: plain },
    { title: '设备编号', dataIndex: 'deviceNo', width: 140, render: plain },
    { title: '提示信息', dataIndex: 'message', width: 200, ellipsis: true, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(SCANLOG_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该扫码日志？" onConfirm={() => void remove(record.id)}>
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
        扫码日志
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="场景编码">
            <Input
              placeholder="请输入场景编码"
              allowClear
              style={{ width: 160 }}
              value={sceneCode}
              onChange={(e) => setSceneCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="扫码类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={scanType}
              onChange={(v) => setScanType(v)}
              options={[...SCAN_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="扫码结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={scanResult}
              onChange={(v) => setScanResult(v)}
              options={[...SCAN_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="条码">
            <Input
              placeholder="请输入条码"
              allowClear
              style={{ width: 160 }}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="设备编号">
            <Input
              placeholder="请输入设备编号"
              allowClear
              style={{ width: 160 }}
              value={deviceNo}
              onChange={(e) => setDeviceNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="创建日期">
            <DatePicker.RangePicker value={range} onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)} />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="日志编号 / 条码"
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
                  void loadData(
                    1,
                    pageSize,
                    keyword,
                    sceneCode,
                    scanType,
                    scanResult,
                    barcode,
                    deviceNo,
                    range,
                  );
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSceneCode('');
                  setScanType(undefined);
                  setScanResult(undefined);
                  setBarcode('');
                  setDeviceNo('');
                  setRange(null);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined, undefined, '', '', null);
                }}
              >
                重置
              </Button>
              {hasPermission(SCANLOG_MANAGE) && (
                <Button type="primary" icon={<QrcodeOutlined />} onClick={openScan}>
                  扫码
                </Button>
              )}
              {hasPermission(SCANLOG_MANAGE) && <Button onClick={openCreate}>新建扫码日志</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`扫码日志（共 ${total} 条）`}>
        <Table<MobileScanLogItem>
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
        title={editId == null ? '新建扫码日志' : '编辑扫码日志'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="logNo" label="日志编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="barcode" label="条码">
            <Input placeholder="请输入条码" />
          </Form.Item>
          <Form.Item name="sceneCode" label="场景编码">
            <Input placeholder="请输入场景编码" />
          </Form.Item>
          <Form.Item name="scanType" label="扫码类型">
            <Select placeholder="请选择" options={[...SCAN_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="scanResult" label="扫码结果">
            <Select placeholder="请选择" options={[...SCAN_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="labelValid" label="标签有效">
            <InputNumber min={0} max={1} style={{ width: '100%' }} placeholder="1=是，0=否" />
          </Form.Item>
          <Form.Item name="bizKey" label="业务键">
            <Input placeholder="请输入业务键" />
          </Form.Item>
          <Form.Item name="docNo" label="单据号">
            <Input placeholder="请输入单据号" />
          </Form.Item>
          <Form.Item name="deviceNo" label="设备编号">
            <Input placeholder="请输入设备编号" />
          </Form.Item>
          <Form.Item name="message" label="提示信息">
            <Input.TextArea rows={2} placeholder="请输入提示信息" />
          </Form.Item>
          <Form.Item name="orgName" label="组织名称">
            <Input placeholder="请输入组织名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="扫码"
        open={scanOpen}
        onOk={() => void submitScan()}
        confirmLoading={scanSaving}
        onCancel={() => setScanOpen(false)}
        destroyOnClose
        width={560}
      >
        <Form form={scanForm} layout="vertical" preserve={false}>
          <Form.Item name="barcode" label="条码" rules={[{ required: true, message: '请输入条码' }]}>
            <Input placeholder="请输入或扫描条码" />
          </Form.Item>
          <Form.Item name="sceneCode" label="场景编码">
            <Input placeholder="请输入场景编码" />
          </Form.Item>
          <Form.Item name="scanType" label="扫码类型">
            <Select placeholder="请选择" options={[...SCAN_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="deviceNo" label="设备编号">
            <Input placeholder="请输入设备编号" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
