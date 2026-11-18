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
import { erpUomService } from '@/services/erpBaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_ACTIVE_STATUS_LABEL,
  ERP_ACTIVE_STATUS_OPTIONS,
  ERP_UOM_TYPE_LABEL,
  ERP_UOM_TYPE_OPTIONS,
  type ErpUom,
  type ErpUomSaveRequest,
} from '@/types/erpBase';

const { Title } = Typography;

const MANAGE = 'erp:base:uom:manage';

export default function ErpUomPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ErpUomSaveRequest>();
  const [data, setData] = useState<ErpUom[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [uomType, setUomType] = useState<string | undefined>(undefined);
  const [uomStatus, setUomStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, uType = uomType, uStatus = uomStatus) => {
      setLoading(true);
      try {
        const res = await erpUomService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          uomType: uType,
          uomStatus: uStatus,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, uomType, uomStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ uomType: 'BASE', precisionDigits: 0, uomStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: ErpUom) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editId == null) {
        await erpUomService.create(values);
        message.success('计量单位已创建');
      } else {
        await erpUomService.update(editId, values);
        message.success('计量单位已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpUomService.remove(id);
    message.success('计量单位已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpUom> = [
    { title: '单位编号', dataIndex: 'uomNo', width: 160, fixed: 'left', render: plain },
    { title: '单位编码', dataIndex: 'uomCode', width: 140, render: plain },
    { title: '单位名称', dataIndex: 'uomName', width: 180, render: plain },
    { title: '单位类型', dataIndex: 'uomType', width: 120, render: (v) => statusTag(ERP_UOM_TYPE_LABEL, v) },
    { title: '小数位数', dataIndex: 'precisionDigits', width: 110, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '单位状态',
      dataIndex: 'uomStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ERP_ACTIVE_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该计量单位？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        计量单位
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="单位类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={uomType}
              onChange={(v) => setUomType(v)}
              options={[...ERP_UOM_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="单位状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={uomStatus}
              onChange={(v) => setUomStatus(v)}
              options={[...ERP_ACTIVE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="单位编号 / 编码 / 名称"
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
                  void loadData(1, pageSize, keyword, uomType, uomStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setUomType(undefined);
                  setUomStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建计量单位</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`计量单位（共 ${total} 条）`}>
        <Table<ErpUom>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1300 }}
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
        title={editId == null ? '新建计量单位' : '编辑计量单位'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="uomNo" label="单位编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="uomCode" label="单位编码" rules={[{ required: true, message: '请输入单位编码' }]}>
            <Input placeholder="请输入单位编码" />
          </Form.Item>
          <Form.Item name="uomName" label="单位名称" rules={[{ required: true, message: '请输入单位名称' }]}>
            <Input placeholder="请输入单位名称" />
          </Form.Item>
          <Form.Item name="uomType" label="单位类型">
            <Select placeholder="为空默认 BASE" options={[...ERP_UOM_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="precisionDigits" label="小数位数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="为空默认 0" />
          </Form.Item>
          <Form.Item name="uomStatus" label="单位状态">
            <Select placeholder="为空默认 ACTIVE" options={[...ERP_ACTIVE_STATUS_OPTIONS]} />
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
    </Space>
  );
}
