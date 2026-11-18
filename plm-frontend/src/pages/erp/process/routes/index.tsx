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
import { erpProcessRouteService } from '@/services/erpProcessService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_PROCESS_ROUTE_STATUS_LABEL,
  ERP_PROCESS_ROUTE_STATUS_OPTIONS,
  ERP_PROCESS_ROUTE_TYPE_LABEL,
  ERP_PROCESS_ROUTE_TYPE_OPTIONS,
  type ErpProcessRoute,
  type ErpProcessRouteQuery,
  type ErpProcessRouteSaveRequest,
} from '@/types/erpProcess';

const { Title } = Typography;

const MANAGE = 'erp:process:route:manage';

export default function ErpProcessRoutePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ErpProcessRouteSaveRequest>();
  const [data, setData] = useState<ErpProcessRoute[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [routeType, setRouteType] = useState<string | undefined>(undefined);
  const [routeStatus, setRouteStatus] = useState<string | undefined>(undefined);
  const [materialCode, setMaterialCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      type = routeType,
      status = routeStatus,
      material = materialCode,
    ) => {
      setLoading(true);
      try {
        const params: ErpProcessRouteQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          routeType: type,
          routeStatus: status,
          materialCode: material || undefined,
        };
        const res = await erpProcessRouteService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, routeType, routeStatus, materialCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ routeType: 'MAIN', routeStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: ErpProcessRoute) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editId == null) {
        await erpProcessRouteService.create(values);
        message.success('工艺路线已创建');
      } else {
        await erpProcessRouteService.update(editId, values);
        message.success('工艺路线已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpProcessRouteService.remove(id);
    message.success('工艺路线已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpProcessRoute> = [
    { title: '工艺路线编码', dataIndex: 'routeCode', width: 180, fixed: 'left', render: plain },
    { title: '工艺路线名称', dataIndex: 'routeName', width: 180, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '版本号', dataIndex: 'versionNo', width: 100, render: plain },
    {
      title: '路线类型',
      dataIndex: 'routeType',
      width: 110,
      render: (v) => statusTag(ERP_PROCESS_ROUTE_TYPE_LABEL, v),
    },
    {
      title: '路线状态',
      dataIndex: 'routeStatus',
      width: 110,
      render: (v) => statusTag(ERP_PROCESS_ROUTE_STATUS_LABEL, v),
    },
    { title: '工序数', dataIndex: 'operationCount', width: 100, render: plain },
    { title: '标准工艺编码', dataIndex: 'standardCode', width: 150, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
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
            <Popconfirm title="确认删除该工艺路线？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        工艺路线
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="路线类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={routeType}
              onChange={(v) => setRouteType(v)}
              options={[...ERP_PROCESS_ROUTE_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="路线状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={routeStatus}
              onChange={(v) => setRouteStatus(v)}
              options={[...ERP_PROCESS_ROUTE_STATUS_OPTIONS]}
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
              placeholder="工艺路线编码 / 名称 / 物料编码 / 物料名称"
              allowClear
              style={{ width: 280 }}
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
                  void loadData(1, pageSize, keyword, routeType, routeStatus, materialCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRouteType(undefined);
                  setRouteStatus(undefined);
                  setMaterialCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建工艺路线</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`工艺路线（共 ${total} 条）`}>
        <Table<ErpProcessRoute>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1900 }}
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
        title={editId == null ? '新建工艺路线' : '编辑工艺路线'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="routeCode"
            label="工艺路线编码"
            rules={[{ required: true, message: '请输入工艺路线编码' }]}
          >
            <Input placeholder="请输入工艺路线编码" />
          </Form.Item>
          <Form.Item name="routeName" label="工艺路线名称">
            <Input placeholder="请输入工艺路线名称" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="versionNo" label="版本号">
            <Input placeholder="为空默认 V1.0" />
          </Form.Item>
          <Form.Item name="routeType" label="路线类型">
            <Select placeholder="为空默认 MAIN" options={[...ERP_PROCESS_ROUTE_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="routeStatus" label="路线状态">
            <Select placeholder="为空默认 DRAFT" options={[...ERP_PROCESS_ROUTE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="operationCount" label="工序数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入工序数" />
          </Form.Item>
          <Form.Item name="standardCode" label="标准工艺编码">
            <Input placeholder="请输入标准工艺编码" />
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
