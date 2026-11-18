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
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { mfgService } from '@/services/mfgService';
import {
  MFG_TEST_RESULT_COLOR,
  MFG_TEST_RESULT_LABEL,
  MFG_TEST_RESULT_OPTIONS,
  MFG_TEST_TYPE_LABEL,
  MFG_TEST_TYPE_OPTIONS,
  type MfgTestQuery,
  type MfgTestResultItem,
  type MfgTestSaveParams,
} from '@/types/mfg';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

interface TestFormValues {
  resultNo?: string;
  batchNo: string;
  serialNo?: string;
  productCode?: string;
  operationCode?: string;
  operationName?: string;
  testType?: string;
  testItemCode: string;
  testItemName?: string;
  standardValue?: string;
  lowerLimit?: number;
  upperLimit?: number;
  actualValue?: number;
  actualText?: string;
  unit?: string;
  result?: string;
  equipmentCode?: string;
  tester?: string;
  testedAt?: dayjs.Dayjs;
  sourceSystem?: string;
  attachmentUrl?: string;
  remark?: string;
}

interface SearchState {
  resultNo?: string;
  batchNo?: string;
  serialNo?: string;
  testType?: string;
  result?: string;
}

export default function MfgTestPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<TestFormValues>();

  const [data, setData] = useState<MfgTestResultItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MfgTestResultItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: MfgTestQuery = {
          pageNum: page,
          pageSize: size,
          resultNo: cond.resultNo || undefined,
          batchNo: cond.batchNo || undefined,
          serialNo: cond.serialNo || undefined,
          testType: cond.testType || undefined,
          result: cond.result || undefined,
        };
        const res = await mfgService.testPage(params);
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

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ testType: 'ELECTRICAL', sourceSystem: 'MES' });
    setModalOpen(true);
  };

  const openEdit = (record: MfgTestResultItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      ...record,
      testedAt: record.testedAt ? dayjs(record.testedAt) : undefined,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: MfgTestSaveParams = {
      resultNo: values.resultNo,
      batchNo: values.batchNo,
      serialNo: values.serialNo,
      productCode: values.productCode,
      operationCode: values.operationCode,
      operationName: values.operationName,
      testType: values.testType,
      testItemCode: values.testItemCode,
      testItemName: values.testItemName,
      standardValue: values.standardValue,
      lowerLimit: values.lowerLimit,
      upperLimit: values.upperLimit,
      actualValue: values.actualValue,
      actualText: values.actualText,
      unit: values.unit,
      result: values.result,
      equipmentCode: values.equipmentCode,
      tester: values.tester,
      testedAt: values.testedAt ? values.testedAt.format('YYYY-MM-DD HH:mm:ss') : undefined,
      sourceSystem: values.sourceSystem,
      attachmentUrl: values.attachmentUrl,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await mfgService.testUpdate(editing.id, payload);
        message.success('更新成功');
      } else {
        await mfgService.testCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: MfgTestResultItem) => {
    await mfgService.testRemove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<MfgTestResultItem> = [
    { title: '结果编号', dataIndex: 'resultNo', width: 160, fixed: 'left', render: (v) => v || '-' },
    { title: '生产批次号', dataIndex: 'batchNo', width: 150, render: (v) => v || '-' },
    { title: '序列号', dataIndex: 'serialNo', width: 140, render: (v) => v || '-' },
    { title: '产品编码', dataIndex: 'productCode', width: 120, render: (v) => v || '-' },
    {
      title: '测试类型',
      dataIndex: 'testType',
      width: 110,
      render: (v?: string) => (v ? MFG_TEST_TYPE_LABEL[v] || v : '-'),
    },
    { title: '测试项编码', dataIndex: 'testItemCode', width: 130, render: (v) => v || '-' },
    { title: '测试项名称', dataIndex: 'testItemName', width: 140, render: (v) => v || '-' },
    { title: '标准值', dataIndex: 'standardValue', width: 110, render: (v) => v || '-' },
    { title: '下限', dataIndex: 'lowerLimit', width: 90, render: (v) => (v ?? '-') },
    { title: '上限', dataIndex: 'upperLimit', width: 90, render: (v) => (v ?? '-') },
    { title: '实测值', dataIndex: 'actualValue', width: 100, render: (v) => (v ?? '-') },
    { title: '单位', dataIndex: 'unit', width: 80, render: (v) => v || '-' },
    {
      title: '结果',
      dataIndex: 'result',
      width: 90,
      render: (v?: string) =>
        v ? <Tag color={MFG_TEST_RESULT_COLOR[v]}>{MFG_TEST_RESULT_LABEL[v] || v}</Tag> : '-',
    },
    { title: '测试人员', dataIndex: 'tester', width: 100, render: (v) => v || '-' },
    {
      title: '测试时间',
      dataIndex: 'testedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('mfg:test:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('mfg:test:save') && (
            <Popconfirm title="确认删除该测试结果？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        测试数据
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="resultNo" label="结果编号">
            <Input placeholder="请输入结果编号" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="batchNo" label="生产批次号">
            <Input placeholder="请输入批次号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="serialNo" label="序列号">
            <Input placeholder="请输入序列号" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="testType" label="测试类型">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={MFG_TEST_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="result" label="结果">
            <Select placeholder="请选择" allowClear style={{ width: 110 }} options={MFG_TEST_RESULT_OPTIONS} />
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

      <Card
        title={`测试结果列表（共 ${total} 条）`}
        extra={
          hasPermission('mfg:test:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              录入测试结果
            </Button>
          )
        }
      >
        <Table<MfgTestResultItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1850 }}
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
        title={editing ? '编辑测试结果' : '录入测试结果'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="resultNo" label="结果编号" extra="留空将自动生成">
            <Input placeholder="请输入结果编号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="batchNo" label="生产批次号" rules={[{ required: true, message: '请输入生产批次号' }]}>
            <Input placeholder="请输入生产批次号" />
          </Form.Item>
          <Form.Item name="serialNo" label="序列号">
            <Input placeholder="请输入序列号" />
          </Form.Item>
          <Form.Item name="productCode" label="产品编码">
            <Input placeholder="请输入产品编码" />
          </Form.Item>
          <Form.Item name="operationCode" label="工序编码">
            <Input placeholder="请输入工序编码" />
          </Form.Item>
          <Form.Item name="testType" label="测试类型">
            <Select placeholder="请选择" options={MFG_TEST_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="testItemCode" label="测试项编码" rules={[{ required: true, message: '请输入测试项编码' }]}>
            <Input placeholder="请输入测试项编码" />
          </Form.Item>
          <Form.Item name="testItemName" label="测试项名称">
            <Input placeholder="请输入测试项名称" />
          </Form.Item>
          <Form.Item name="standardValue" label="标准值（文本）">
            <Input placeholder="请输入标准值描述" />
          </Form.Item>
          <Form.Item name="lowerLimit" label="下限">
            <InputNumber style={{ width: '100%' }} placeholder="请输入下限" />
          </Form.Item>
          <Form.Item name="upperLimit" label="上限">
            <InputNumber style={{ width: '100%' }} placeholder="请输入上限" />
          </Form.Item>
          <Form.Item name="actualValue" label="实测值（数值）">
            <InputNumber style={{ width: '100%' }} placeholder="请输入实测值" />
          </Form.Item>
          <Form.Item name="actualText" label="实测值（文本）">
            <Input placeholder="请输入实测值文本" />
          </Form.Item>
          <Form.Item name="unit" label="单位">
            <Input placeholder="如 V / mm / Ω" />
          </Form.Item>
          <Form.Item name="result" label="结果" extra="留空时按上下限及配置自动判定">
            <Select placeholder="请选择" allowClear options={MFG_TEST_RESULT_OPTIONS} />
          </Form.Item>
          <Form.Item name="equipmentCode" label="设备编码">
            <Input placeholder="请输入设备编码" />
          </Form.Item>
          <Form.Item name="tester" label="测试人员">
            <Input placeholder="请输入测试人员" />
          </Form.Item>
          <Form.Item name="testedAt" label="测试时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sourceSystem" label="来源系统">
            <Input placeholder="如 MES / QMS" />
          </Form.Item>
          <Form.Item name="attachmentUrl" label="附件地址">
            <Input placeholder="请输入附件地址" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
