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
import { erpMaterialService } from '@/services/erpBaseService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_MATERIAL_STATUS_LABEL,
  ERP_MATERIAL_STATUS_OPTIONS,
  ERP_VALUATION_METHOD_LABEL,
  ERP_VALUATION_METHOD_OPTIONS,
  type ErpMaterial,
  type ErpMaterialSaveRequest,
} from '@/types/erpBase';

const { Title } = Typography;

const MANAGE = 'erp:base:material:manage';

export default function ErpMaterialPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ErpMaterialSaveRequest>();
  const [data, setData] = useState<ErpMaterial[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [materialGroup, setMaterialGroup] = useState('');
  const [materialStatus, setMaterialStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      group = materialGroup,
      status = materialStatus,
    ) => {
      setLoading(true);
      try {
        const res = await erpMaterialService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          materialGroup: group || undefined,
          materialStatus: status,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, materialGroup, materialStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ valuationMethod: 'MOVING_AVG', materialStatus: 'ACTIVE' });
    setOpen(true);
  };

  const openEdit = (record: ErpMaterial) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editId == null) {
        await erpMaterialService.create(values);
        message.success('物料业务档案已创建');
      } else {
        await erpMaterialService.update(editId, values);
        message.success('物料业务档案已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpMaterialService.remove(id);
    message.success('物料业务档案已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpMaterial> = [
    { title: '物料编号', dataIndex: 'materialNo', width: 160, fixed: 'left', render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 180, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 160, ellipsis: true, render: plain },
    { title: '物料组', dataIndex: 'materialGroup', width: 120, render: plain },
    { title: '基本单位', dataIndex: 'baseUom', width: 100, render: plain },
    { title: '采购单位', dataIndex: 'purchaseUom', width: 100, render: plain },
    { title: '销售单位', dataIndex: 'saleUom', width: 100, render: plain },
    {
      title: '计价方式',
      dataIndex: 'valuationMethod',
      width: 110,
      render: (v) => statusTag(ERP_VALUATION_METHOD_LABEL, v),
    },
    { title: '安全库存', dataIndex: 'safetyStock', width: 110, render: plain },
    { title: '标准成本', dataIndex: 'stdCost', width: 110, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '物料状态',
      dataIndex: 'materialStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(ERP_MATERIAL_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该物料业务档案？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        物料业务档案
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="物料组">
            <Input
              placeholder="请输入物料组"
              allowClear
              style={{ width: 160 }}
              value={materialGroup}
              onChange={(e) => setMaterialGroup(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="物料状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={materialStatus}
              onChange={(v) => setMaterialStatus(v)}
              options={[...ERP_MATERIAL_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="物料编号 / 编码 / 名称"
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
                  void loadData(1, pageSize, keyword, materialGroup, materialStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setMaterialGroup('');
                  setMaterialStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建物料业务档案</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`物料业务档案（共 ${total} 条）`}>
        <Table<ErpMaterial>
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
        title={editId == null ? '新建物料业务档案' : '编辑物料业务档案'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="materialNo" label="物料编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称" rules={[{ required: true, message: '请输入物料名称' }]}>
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="规格型号">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
          <Form.Item name="materialGroup" label="物料组">
            <Input placeholder="请输入物料组" />
          </Form.Item>
          <Form.Item name="baseUom" label="基本单位">
            <Input placeholder="请输入基本单位" />
          </Form.Item>
          <Form.Item name="purchaseUom" label="采购单位">
            <Input placeholder="请输入采购单位" />
          </Form.Item>
          <Form.Item name="saleUom" label="销售单位">
            <Input placeholder="请输入销售单位" />
          </Form.Item>
          <Form.Item name="valuationMethod" label="计价方式">
            <Select placeholder="为空默认 MOVING_AVG" options={[...ERP_VALUATION_METHOD_OPTIONS]} />
          </Form.Item>
          <Form.Item name="defaultWarehouseCode" label="默认仓库编码">
            <Input placeholder="请输入默认仓库编码" />
          </Form.Item>
          <Form.Item name="defaultTaxCode" label="默认税码">
            <Input placeholder="请输入默认税码" />
          </Form.Item>
          <Form.Item name="safetyStock" label="安全库存">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入安全库存" />
          </Form.Item>
          <Form.Item name="stdCost" label="标准成本">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入标准成本" />
          </Form.Item>
          <Form.Item name="materialStatus" label="物料状态">
            <Select placeholder="为空默认 ACTIVE" options={[...ERP_MATERIAL_STATUS_OPTIONS]} />
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
