import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
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
import { mesCollectPointService as service } from '@/services/mesCollectService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_COLLECT_DATA_TYPE_LABEL,
  MES_COLLECT_DATA_TYPE_OPTIONS,
  MES_COLLECT_STATUS_LABEL,
  MES_COLLECT_STATUS_OPTIONS,
  type MesCollectPoint,
  type MesCollectPointQuery,
  type MesCollectPointSaveRequest,
} from '@/types/mesCollect';

const { Title } = Typography;

const MANAGE = 'mes:collect:point:manage';

export default function MesCollectPointPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MesCollectPointSaveRequest>();
  const [data, setData] = useState<MesCollectPoint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [pointStatus, setPointStatus] = useState<string | undefined>(undefined);
  const [dataType, setDataType] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = pointStatus,
      type = dataType,
    ) => {
      setLoading(true);
      try {
        const params: MesCollectPointQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          pointStatus: status,
          dataType: type,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, pointStatus, dataType],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ dataType: 'NUMERIC', pointStatus: 'OFFLINE' });
    setOpen(true);
  };

  const openEdit = (record: MesCollectPoint) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesCollectPointSaveRequest = { ...values };
      if (editId == null) {
        await service.create(payload);
        message.success('采集数据点已创建');
      } else {
        await service.update(editId, payload);
        message.success('采集数据点已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('采集数据点已删除');
    void loadData();
  };

  const columns: ColumnsType<MesCollectPoint> = [
    { title: '数据点编号', dataIndex: 'pointNo', width: 190, fixed: 'left', render: plain },
    { title: '数据点编码', dataIndex: 'pointCode', width: 160, render: plain },
    { title: '数据点名称', dataIndex: 'pointName', width: 170, render: plain },
    { title: '采集接口编号', dataIndex: 'interfaceNo', width: 190, render: plain },
    { title: '设备编码', dataIndex: 'deviceCode', width: 150, render: plain },
    { title: '点位地址', dataIndex: 'address', width: 140, render: plain },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      width: 120,
      render: (v) => statusTag(MES_COLLECT_DATA_TYPE_LABEL, v),
    },
    { title: '计量单位', dataIndex: 'uom', width: 110, render: plain },
    { title: '换算系数', dataIndex: 'scaleFactor', width: 110, render: plain },
    { title: '上限', dataIndex: 'upperLimit', width: 110, render: plain },
    { title: '下限', dataIndex: 'lowerLimit', width: 110, render: plain },
    {
      title: '数据点状态',
      dataIndex: 'pointStatus',
      width: 120,
      render: (v) => statusTag(MES_COLLECT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该采集数据点？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        采集数据点
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="数据点状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={pointStatus}
              onChange={(v) => setPointStatus(v)}
              options={[...MES_COLLECT_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="数据类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={dataType}
              onChange={(v) => setDataType(v)}
              options={[...MES_COLLECT_DATA_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="数据点编号 / 数据点编码 / 数据点名称 / 设备编码"
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
                  void loadData(1, pageSize, keyword, pointStatus, dataType);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setPointStatus(undefined);
                  setDataType(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建采集数据点</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`采集数据点（共 ${total} 条）`}>
        <Table<MesCollectPoint>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1990 }}
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
        title={editId == null ? '新建采集数据点' : '编辑采集数据点'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="pointNo" label="数据点编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="pointCode" label="数据点编码" rules={[{ required: true, message: '请输入数据点编码' }]}>
            <Input placeholder="请输入数据点编码" />
          </Form.Item>
          <Form.Item name="pointName" label="数据点名称">
            <Input placeholder="请输入数据点名称" />
          </Form.Item>
          <Form.Item name="interfaceNo" label="采集接口编号">
            <Input placeholder="请输入采集接口编号" />
          </Form.Item>
          <Form.Item name="deviceCode" label="设备编码">
            <Input placeholder="请输入设备编码" />
          </Form.Item>
          <Form.Item name="address" label="点位地址">
            <Input placeholder="请输入点位地址" />
          </Form.Item>
          <Form.Item name="dataType" label="数据类型">
            <Select placeholder="为空默认 NUMERIC" options={[...MES_COLLECT_DATA_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="uom" label="计量单位">
            <Input placeholder="请输入计量单位" />
          </Form.Item>
          <Form.Item name="scaleFactor" label="换算系数">
            <InputNumber style={{ width: '100%' }} placeholder="请输入换算系数" />
          </Form.Item>
          <Form.Item name="upperLimit" label="上限">
            <InputNumber style={{ width: '100%' }} placeholder="请输入上限" />
          </Form.Item>
          <Form.Item name="lowerLimit" label="下限">
            <InputNumber style={{ width: '100%' }} placeholder="请输入下限" />
          </Form.Item>
          <Form.Item name="pointStatus" label="数据点状态">
            <Select placeholder="为空默认 OFFLINE" options={[...MES_COLLECT_STATUS_OPTIONS]} />
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
