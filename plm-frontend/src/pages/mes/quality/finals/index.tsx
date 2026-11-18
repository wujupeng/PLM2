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
import { mesFinalInspectionService as service } from '@/services/mesQualityService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_INSPECTION_RESULT_LABEL,
  MES_INSPECTION_RESULT_OPTIONS,
  MES_INSPECTION_STATUS_LABEL,
  MES_INSPECTION_STATUS_OPTIONS,
  type MesFinalInspection,
  type MesFinalInspectionQuery,
  type MesFinalInspectionSaveRequest,
} from '@/types/mesQuality';

const { Title } = Typography;

const MANAGE = 'mes:quality:final:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesFinalInspectionSaveRequest, 'inspectionTime'> & {
  inspectionTime?: Dayjs;
};

export default function MesFinalInspectionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesFinalInspection[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [inspectionStatus, setInspectionStatus] = useState<string | undefined>(undefined);
  const [inspectionResult, setInspectionResult] = useState<string | undefined>(undefined);
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
    ) => {
      setLoading(true);
      try {
        const params: MesFinalInspectionQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          inspectionStatus: status,
          inspectionResult: result,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, inspectionStatus, inspectionResult],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ inspectionStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: MesFinalInspection) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      inspectionTime: record.inspectionTime ? dayjs(record.inspectionTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesFinalInspectionSaveRequest = {
        ...values,
        inspectionTime: values.inspectionTime ? values.inspectionTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('终检记录已创建');
      } else {
        await service.update(editId, payload);
        message.success('终检记录已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('终检记录已删除');
    void loadData();
  };

  const columns: ColumnsType<MesFinalInspection> = [
    { title: '终检单号', dataIndex: 'finalNo', width: 190, fixed: 'left', render: plain },
    { title: '工单号', dataIndex: 'workOrderNo', width: 170, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 150, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '批次号', dataIndex: 'batchNo', width: 130, render: plain },
    { title: '检验数量', dataIndex: 'inspectionQty', width: 110, render: plain },
    { title: '抽样数量', dataIndex: 'sampleQty', width: 110, render: plain },
    { title: '合格数量', dataIndex: 'qualifiedQty', width: 110, render: plain },
    { title: '不合格数量', dataIndex: 'unqualifiedQty', width: 120, render: plain },
    {
      title: '检验结果',
      dataIndex: 'inspectionResult',
      width: 110,
      render: (v) => statusTag(MES_INSPECTION_RESULT_LABEL, v),
    },
    { title: '检验员', dataIndex: 'inspector', width: 110, render: plain },
    { title: '检验时间', dataIndex: 'inspectionTime', width: 170, render: formatDateTime },
    { title: '判定单号', dataIndex: 'judgeNo', width: 170, render: plain },
    { title: '客户编码', dataIndex: 'customerCode', width: 140, render: plain },
    {
      title: '检验状态',
      dataIndex: 'inspectionStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(MES_INSPECTION_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该终检记录？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        终检记录
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="检验状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={inspectionStatus}
              onChange={(v) => setInspectionStatus(v)}
              options={[...MES_INSPECTION_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="检验结果">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={inspectionResult}
              onChange={(v) => setInspectionResult(v)}
              options={[...MES_INSPECTION_RESULT_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="单号 / 工单号 / 物料编码 / 客户编码"
              allowClear
              style={{ width: 400 }}
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
                  void loadData(1, pageSize, keyword, inspectionStatus, inspectionResult);
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
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建终检</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`终检记录（共 ${total} 条）`}>
        <Table<MesFinalInspection>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2650 }}
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
        title={editId == null ? '新建终检' : '编辑终检'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="finalNo" label="终检单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="workOrderNo" label="工单号">
            <Input placeholder="请输入工单号" />
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
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item name="inspectionQty" label="检验数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入检验数量" />
          </Form.Item>
          <Form.Item name="sampleQty" label="抽样数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入抽样数量" />
          </Form.Item>
          <Form.Item name="qualifiedQty" label="合格数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入合格数量" />
          </Form.Item>
          <Form.Item name="unqualifiedQty" label="不合格数量">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入不合格数量" />
          </Form.Item>
          <Form.Item name="inspectionResult" label="检验结果">
            <Select placeholder="请选择" options={[...MES_INSPECTION_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="inspector" label="检验员">
            <Input placeholder="请输入检验员" />
          </Form.Item>
          <Form.Item name="inspectionTime" label="检验时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="judgeNo" label="判定单号">
            <Input placeholder="请输入判定单号" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="请输入客户编码" />
          </Form.Item>
          <Form.Item name="inspectionStatus" label="检验状态">
            <Select placeholder="为空默认 PENDING" options={[...MES_INSPECTION_STATUS_OPTIONS]} />
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
