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
import { erpNetRequirementService } from '@/services/erpDemandPlanService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_NET_REQUIREMENT_STATUS_LABEL,
  ERP_NET_REQUIREMENT_STATUS_OPTIONS,
  type ErpNetRequirement,
  type ErpNetRequirementQuery,
  type ErpNetRequirementSaveRequest,
} from '@/types/erpDemandPlan';

const { Title } = Typography;

const MANAGE = 'erp:demand-plan:netreq:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpNetRequirementSaveRequest, 'requiredDate'> & {
  requiredDate?: Dayjs;
};

export default function ErpNetRequirementPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpNetRequirement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [requirementStatus, setRequirementStatus] = useState<string | undefined>(undefined);
  const [materialCode, setMaterialCode] = useState('');
  const [runNo, setRunNo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = requirementStatus,
      material = materialCode,
      run = runNo,
    ) => {
      setLoading(true);
      try {
        const params: ErpNetRequirementQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          requirementStatus: status,
          materialCode: material || undefined,
          runNo: run || undefined,
        };
        const res = await erpNetRequirementService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, requirementStatus, materialCode, runNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ uom: 'PCS', requirementStatus: 'OPEN' });
    setOpen(true);
  };

  const openEdit = (record: ErpNetRequirement) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      requiredDate: record.requiredDate ? dayjs(record.requiredDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpNetRequirementSaveRequest = {
        ...values,
        requiredDate: values.requiredDate ? values.requiredDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpNetRequirementService.create(payload);
        message.success('净需求已创建');
      } else {
        await erpNetRequirementService.update(editId, payload);
        message.success('净需求已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpNetRequirementService.remove(id);
    message.success('净需求已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpNetRequirement> = [
    { title: '净需求单号', dataIndex: 'requirementNo', width: 170, fixed: 'left', render: plain },
    { title: '运算单号', dataIndex: 'runNo', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '毛需求', dataIndex: 'grossQty', width: 100, render: plain },
    { title: '现有库存', dataIndex: 'onHandQty', width: 100, render: plain },
    { title: '在途数量', dataIndex: 'inTransitQty', width: 110, render: plain },
    { title: '已分配量', dataIndex: 'allocatedQty', width: 110, render: plain },
    { title: '安全库存', dataIndex: 'safetyStock', width: 100, render: plain },
    { title: '净需求', dataIndex: 'netQty', width: 100, render: plain },
    { title: '损耗率', dataIndex: 'lossRate', width: 90, render: plain },
    { title: '提前期(天)', dataIndex: 'leadTimeDays', width: 110, render: plain },
    { title: '需求日期', dataIndex: 'requiredDate', width: 170, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '需求状态',
      dataIndex: 'requirementStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_NET_REQUIREMENT_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该净需求？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        净需求
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="需求状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={requirementStatus}
              onChange={(v) => setRequirementStatus(v)}
              options={[...ERP_NET_REQUIREMENT_STATUS_OPTIONS]}
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
          <Form.Item label="运算单号">
            <Input
              placeholder="请输入运算单号"
              allowClear
              style={{ width: 160 }}
              value={runNo}
              onChange={(e) => setRunNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="净需求单号 / 物料名称"
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
                  void loadData(1, pageSize, keyword, requirementStatus, materialCode, runNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRequirementStatus(undefined);
                  setMaterialCode('');
                  setRunNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建净需求</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`净需求（共 ${total} 条）`}>
        <Table<ErpNetRequirement>
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
        title={editId == null ? '新建净需求' : '编辑净需求'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="requirementNo" label="净需求单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="runNo" label="运算单号">
            <Input placeholder="请输入运算单号" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码" rules={[{ required: true, message: '请输入物料编码' }]}>
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="规格型号">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
          <Form.Item name="uom" label="单位">
            <Input placeholder="为空默认 PCS" />
          </Form.Item>
          <Form.Item name="grossQty" label="毛需求">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入毛需求" />
          </Form.Item>
          <Form.Item name="onHandQty" label="现有库存">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入现有库存" />
          </Form.Item>
          <Form.Item name="inTransitQty" label="在途数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入在途数量" />
          </Form.Item>
          <Form.Item name="allocatedQty" label="已分配量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入已分配量" />
          </Form.Item>
          <Form.Item name="safetyStock" label="安全库存">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入安全库存" />
          </Form.Item>
          <Form.Item name="netQty" label="净需求">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入净需求" />
          </Form.Item>
          <Form.Item name="lossRate" label="损耗率">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="请输入损耗率" />
          </Form.Item>
          <Form.Item name="leadTimeDays" label="提前期(天)">
            <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="请输入提前期天数" />
          </Form.Item>
          <Form.Item name="requiredDate" label="需求日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择需求日期" />
          </Form.Item>
          <Form.Item name="requirementStatus" label="需求状态">
            <Select placeholder="为空默认 OPEN" options={[...ERP_NET_REQUIREMENT_STATUS_OPTIONS]} />
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
