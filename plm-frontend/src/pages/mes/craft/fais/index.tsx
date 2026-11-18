import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
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
import { mesFaiService as service } from '@/services/mesCraftService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_FAI_RESULT_LABEL,
  MES_FAI_RESULT_OPTIONS,
  MES_FAI_STATUS_LABEL,
  MES_FAI_STATUS_OPTIONS,
  type MesFai,
  type MesFaiQuery,
  type MesFaiSaveRequest,
} from '@/types/mesCraft';

const { Title } = Typography;

const MANAGE = 'mes:craft:fai:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesFaiSaveRequest, 'inspectTime'> & {
  inspectTime?: Dayjs;
};

export default function MesFaiPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesFai[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [faiStatus, setFaiStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = faiStatus) => {
      setLoading(true);
      try {
        const params: MesFaiQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          faiStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, faiStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ faiResult: 'PASS', faiStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: MesFai) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      inspectTime: record.inspectTime ? dayjs(record.inspectTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesFaiSaveRequest = {
        ...values,
        inspectTime: values.inspectTime ? values.inspectTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('首件确认已创建');
      } else {
        await service.update(editId, payload);
        message.success('首件确认已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('首件确认已删除');
    void loadData();
  };

  const columns: ColumnsType<MesFai> = [
    { title: '首件确认单号', dataIndex: 'faiNo', width: 190, fixed: 'left', render: plain },
    { title: '工单号', dataIndex: 'workOrderNo', width: 170, render: plain },
    { title: '工序编码', dataIndex: 'processCode', width: 120, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '设备编码', dataIndex: 'equipmentCode', width: 120, render: plain },
    { title: '检验人', dataIndex: 'inspector', width: 120, render: plain },
    { title: '检验时间', dataIndex: 'inspectTime', width: 170, render: formatDateTime },
    {
      title: '首件结果',
      dataIndex: 'faiResult',
      width: 110,
      render: (v) => statusTag(MES_FAI_RESULT_LABEL, v),
    },
    {
      title: '首件状态',
      dataIndex: 'faiStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(MES_FAI_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该首件确认？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        首件确认
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="首件状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={faiStatus}
              onChange={(v) => setFaiStatus(v)}
              options={[...MES_FAI_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="首件确认单号 / 工单号 / 工序编码 / 物料编码"
              allowClear
              style={{ width: 380 }}
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
                  void loadData(1, pageSize, keyword, faiStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setFaiStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建首件确认</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`首件确认（共 ${total} 条）`}>
        <Table<MesFai>
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
        title={editId == null ? '新建首件确认' : '编辑首件确认'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="faiNo" label="首件确认单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="workOrderNo" label="工单号">
            <Input placeholder="请输入工单号" />
          </Form.Item>
          <Form.Item name="processCode" label="工序编码">
            <Input placeholder="请输入工序编码" />
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
          <Form.Item name="equipmentCode" label="设备编码">
            <Input placeholder="请输入设备编码" />
          </Form.Item>
          <Form.Item name="inspector" label="检验人">
            <Input placeholder="请输入检验人" />
          </Form.Item>
          <Form.Item name="inspectTime" label="检验时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="faiResult" label="首件结果">
            <Select placeholder="为空默认 PASS" options={[...MES_FAI_RESULT_OPTIONS]} />
          </Form.Item>
          <Form.Item name="faiStatus" label="首件状态">
            <Select placeholder="为空默认 PENDING" options={[...MES_FAI_STATUS_OPTIONS]} />
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
