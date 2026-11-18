import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { wmsService } from '@/services/wmsService';
import {
  WMS_FIFO_RESULT_COLOR,
  WMS_FIFO_RESULT_LABEL,
  WMS_FIFO_RESULT_OPTIONS,
  WMS_PICK_RESULT_COLOR,
  WMS_PICK_RESULT_LABEL,
  WMS_PICK_RESULT_OPTIONS,
  type WmsPickRecordItem,
  type WmsPickQuery,
  type WmsPickVerifyParams,
} from '@/types/wms';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface VerifyFormValues {
  workOrderNo: string;
  materialCode: string;
  batchNo: string;
  locationCode?: string;
  containerCode?: string;
  qty: number;
  unit?: string;
  lineCode: string;
  workStation: string;
  operatorName?: string;
  relatedDeliveryNo?: string;
  remark?: string;
  authorizeException?: boolean;
  authorizedBy?: string;
  authorizeReason?: string;
}

interface SearchState {
  workOrderNo?: string;
  materialCode?: string;
  batchNo?: string;
  lineCode?: string;
  scanResult?: string;
  fifoResult?: string;
  mixCheckResult?: string;
  operatorName?: string;
}

const yesNo = (v?: number) => (v ? '是' : '否');

const alertType = (scanResult?: string) => {
  if (scanResult === 'PASS') return 'success';
  if (scanResult === 'WARN') return 'warning';
  return 'error';
};

export default function WmsPickPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const username = useAuthStore((state) => state.userInfo?.username);
  const [form] = Form.useForm<VerifyFormValues>();
  const authorizeException = Form.useWatch('authorizeException', form);

  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<WmsPickRecordItem | null>(null);

  const [data, setData] = useState<WmsPickRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<WmsPickRecordItem | null>(null);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: WmsPickQuery = {
          pageNum: page,
          pageSize: size,
          workOrderNo: cond.workOrderNo || undefined,
          materialCode: cond.materialCode || undefined,
          batchNo: cond.batchNo || undefined,
          lineCode: cond.lineCode || undefined,
          scanResult: cond.scanResult || undefined,
          fifoResult: cond.fifoResult || undefined,
          mixCheckResult: cond.mixCheckResult || undefined,
          operatorName: cond.operatorName || undefined,
        };
        const res = await wmsService.pickPage(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: SearchState) => {
    const cond = { ...values };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const handleVerify = async () => {
    const values = await form.validateFields();
    const payload: WmsPickVerifyParams = {
      workOrderNo: values.workOrderNo,
      materialCode: values.materialCode,
      batchNo: values.batchNo,
      lineCode: values.lineCode,
      workStation: values.workStation,
      qty: values.qty,
      locationCode: values.locationCode,
      containerCode: values.containerCode,
      unit: values.unit,
      operatorName: values.operatorName,
      relatedDeliveryNo: values.relatedDeliveryNo,
      remark: values.remark,
      authorizeException: values.authorizeException,
      authorizedBy: values.authorizeException ? values.authorizedBy : undefined,
      authorizeReason: values.authorizeException ? values.authorizeReason : undefined,
    };
    setVerifying(true);
    try {
      const res = await wmsService.pickVerify(payload);
      setResult(res);
      message.success('校验完成');
      void loadData(1, pageSize, search);
    } finally {
      setVerifying(false);
    }
  };

  const openDetail = (record: WmsPickRecordItem) => {
    setDetail(record);
    setDetailOpen(true);
  };

  const columns: ColumnsType<WmsPickRecordItem> = [
    { title: '领料单号', dataIndex: 'pickNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    { title: '工单号', dataIndex: 'workOrderNo', width: 150, render: (v) => v || '-' },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: (v) => v || '-' },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: (v) => v || '-' },
    { title: '批次号', dataIndex: 'batchNo', width: 130, render: (v) => v || '-' },
    { title: '库位', dataIndex: 'locationCode', width: 110, render: (v) => v || '-' },
    { title: '容器', dataIndex: 'containerCode', width: 110, render: (v) => v || '-' },
    { title: '数量', dataIndex: 'qty', width: 90, render: (v) => (v ?? '-') },
    { title: '单位', dataIndex: 'unit', width: 80, render: (v) => v || '-' },
    { title: '产线', dataIndex: 'lineCode', width: 100, render: (v) => v || '-' },
    { title: '工位', dataIndex: 'workStation', width: 100, render: (v) => v || '-' },
    { title: '操作员', dataIndex: 'operatorName', width: 110, render: (v) => v || '-' },
    {
      title: '校验结果',
      dataIndex: 'scanResult',
      width: 110,
      render: (v?: string) =>
        v ? <Tag color={WMS_PICK_RESULT_COLOR[v]}>{WMS_PICK_RESULT_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: 'FIFO 结果',
      dataIndex: 'fifoResult',
      width: 130,
      render: (v?: string) =>
        v ? <Tag color={WMS_FIFO_RESULT_COLOR[v]}>{WMS_FIFO_RESULT_LABEL[v] || v}</Tag> : '-',
    },
    { title: '混料校验', dataIndex: 'mixCheckResult', width: 110, render: (v) => v || '-' },
    { title: '期望批次', dataIndex: 'expectedBatchNo', width: 130, render: (v) => v || '-' },
    {
      title: '例外授权',
      dataIndex: 'exceptionAuthorized',
      width: 100,
      render: (v?: number) => yesNo(v),
    },
    { title: '阻断原因', dataIndex: 'blockReason', width: 160, render: (v) => v || '-' },
    {
      title: '领料时间',
      dataIndex: 'pickAt',
      width: 170,
      render: (v?: string) => v || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => openDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        扫码领料
      </Title>

      <Card title="扫码领料校验">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleVerify}
          initialValues={{ operatorName: username }}
        >
          <Form.Item
            name="workOrderNo"
            label="工单号"
            rules={[{ required: true, message: '请输入工单号' }]}
          >
            <Input placeholder="请输入工单号" />
          </Form.Item>
          <Form.Item
            name="materialCode"
            label="物料编码"
            rules={[{ required: true, message: '请输入物料编码' }]}
          >
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号" rules={[{ required: true, message: '请输入批次号' }]}>
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="locationCode" label="库位">
            <Input placeholder="请输入库位" />
          </Form.Item>
          <Form.Item name="containerCode" label="容器编码">
            <Input placeholder="请输入容器编码" />
          </Form.Item>
          <Form.Item name="qty" label="数量" rules={[{ required: true, message: '请输入数量' }]}>
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入数量" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="请输入单位" />
          </Form.Item>
          <Form.Item name="lineCode" label="产线" rules={[{ required: true, message: '请输入产线' }]}>
            <Input placeholder="请输入产线" />
          </Form.Item>
          <Form.Item name="workStation" label="工位" rules={[{ required: true, message: '请输入工位' }]}>
            <Input placeholder="请输入工位" />
          </Form.Item>
          <Form.Item name="operatorName" label="操作员">
            <Input placeholder="请输入操作员" />
          </Form.Item>
          <Form.Item name="relatedDeliveryNo" label="关联配送任务号">
            <Input placeholder="请输入关联配送任务号" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
          <Form.Item name="authorizeException" valuePropName="checked">
            <Checkbox>申请 FIFO 例外授权</Checkbox>
          </Form.Item>
          {authorizeException && (
            <>
              <Form.Item
                name="authorizedBy"
                label="授权人"
                rules={[{ required: true, message: '请输入授权人' }]}
              >
                <Input placeholder="请输入授权人" />
              </Form.Item>
              <Form.Item
                name="authorizeReason"
                label="授权原因"
                rules={[{ required: true, message: '请输入授权原因' }]}
              >
                <Input.TextArea rows={2} placeholder="请输入授权原因" />
              </Form.Item>
            </>
          )}
          <Form.Item>
            <Space>
              {hasPermission('wms:pick:verify') && (
                <Button type="primary" htmlType="submit" loading={verifying}>
                  提交校验
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>

        {result && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Alert
              showIcon
              type={alertType(result.scanResult)}
              message={`校验结果：${
                result.scanResult ? WMS_PICK_RESULT_LABEL[result.scanResult] || result.scanResult : '-'
              }`}
              description={result.blockReason || undefined}
            />
            <Descriptions
              bordered
              size="small"
              column={2}
              items={[
                { key: 'pickNo', label: '领料单号', children: result.pickNo || '-' },
                { key: 'materialName', label: '物料名称', children: result.materialName || '-' },
                {
                  key: 'fifoResult',
                  label: 'FIFO 结果',
                  children: result.fifoResult
                    ? WMS_FIFO_RESULT_LABEL[result.fifoResult] || result.fifoResult
                    : '-',
                },
                { key: 'expectedBatchNo', label: '期望批次', children: result.expectedBatchNo || '-' },
                { key: 'mixCheckResult', label: '混料校验', children: result.mixCheckResult || '-' },
                { key: 'exceptionAuthorized', label: '例外授权', children: yesNo(result.exceptionAuthorized) },
                { key: 'blockReason', label: '阻断原因', children: result.blockReason || '-' },
              ]}
            />
          </Space>
        )}
      </Card>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="workOrderNo" label="工单号">
            <Input placeholder="请输入工单号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" allowClear style={{ width: 130 }} />
          </Form.Item>
          <Form.Item name="lineCode" label="产线">
            <Input placeholder="请输入产线" allowClear style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="scanResult" label="校验结果">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={WMS_PICK_RESULT_OPTIONS} />
          </Form.Item>
          <Form.Item name="fifoResult" label="FIFO 结果">
            <Select placeholder="请选择" allowClear style={{ width: 150 }} options={WMS_FIFO_RESULT_OPTIONS} />
          </Form.Item>
          <Form.Item name="mixCheckResult" label="混料校验">
            <Input placeholder="请输入混料校验" allowClear style={{ width: 130 }} />
          </Form.Item>
          <Form.Item name="operatorName" label="操作员">
            <Input placeholder="请输入操作员" allowClear style={{ width: 130 }} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`领料记录（共 ${total} 条）`}>
        <Table<WmsPickRecordItem>
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

      <Drawer
        title="领料记录详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={640}
      >
        {detail && (
          <Descriptions
            bordered
            size="small"
            column={1}
            items={[
              { key: 'pickNo', label: '领料单号', children: detail.pickNo || '-' },
              { key: 'workOrderNo', label: '工单号', children: detail.workOrderNo || '-' },
              { key: 'materialCode', label: '物料编码', children: detail.materialCode || '-' },
              { key: 'materialName', label: '物料名称', children: detail.materialName || '-' },
              { key: 'batchNo', label: '批次号', children: detail.batchNo || '-' },
              { key: 'locationCode', label: '库位', children: detail.locationCode || '-' },
              { key: 'containerCode', label: '容器编码', children: detail.containerCode || '-' },
              { key: 'qty', label: '数量', children: detail.qty ?? '-' },
              { key: 'unit', label: '单位', children: detail.unit || '-' },
              { key: 'lineCode', label: '产线', children: detail.lineCode || '-' },
              { key: 'workStation', label: '工位', children: detail.workStation || '-' },
              { key: 'operatorName', label: '操作员', children: detail.operatorName || '-' },
              {
                key: 'scanResult',
                label: '校验结果',
                children: detail.scanResult
                  ? WMS_PICK_RESULT_LABEL[detail.scanResult] || detail.scanResult
                  : '-',
              },
              {
                key: 'fifoResult',
                label: 'FIFO 结果',
                children: detail.fifoResult
                  ? WMS_FIFO_RESULT_LABEL[detail.fifoResult] || detail.fifoResult
                  : '-',
              },
              { key: 'mixCheckResult', label: '混料校验', children: detail.mixCheckResult || '-' },
              { key: 'expectedBatchNo', label: '期望批次', children: detail.expectedBatchNo || '-' },
              { key: 'exceptionAuthorized', label: '例外授权', children: yesNo(detail.exceptionAuthorized) },
              { key: 'authorizedBy', label: '授权人', children: detail.authorizedBy || '-' },
              { key: 'authorizeReason', label: '授权原因', children: detail.authorizeReason || '-' },
              { key: 'blockReason', label: '阻断原因', children: detail.blockReason || '-' },
              { key: 'relatedDeliveryNo', label: '关联配送任务号', children: detail.relatedDeliveryNo || '-' },
              { key: 'pickAt', label: '领料时间', children: detail.pickAt || '-' },
              { key: 'remark', label: '备注', children: detail.remark || '-' },
            ]}
          />
        )}
      </Drawer>
    </Space>
  );
}
