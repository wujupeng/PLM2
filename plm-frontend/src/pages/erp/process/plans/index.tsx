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
import { erpProcessPlanService } from '@/services/erpProcessService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_PROCESS_PLAN_STATUS_LABEL,
  ERP_PROCESS_PLAN_STATUS_OPTIONS,
  type ErpProcessPlan,
  type ErpProcessPlanQuery,
  type ErpProcessPlanSaveRequest,
} from '@/types/erpProcess';

const { Title } = Typography;

const MANAGE = 'erp:process:plan:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpProcessPlanSaveRequest, 'plannedStartTime' | 'plannedEndTime'> & {
  plannedStartTime?: Dayjs;
  plannedEndTime?: Dayjs;
};

export default function ErpProcessPlanPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpProcessPlan[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [planStatus, setPlanStatus] = useState<string | undefined>(undefined);
  const [productionOrderNo, setProductionOrderNo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      status = planStatus,
      orderNo = productionOrderNo,
    ) => {
      setLoading(true);
      try {
        const params: ErpProcessPlanQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          planStatus: status,
          productionOrderNo: orderNo || undefined,
        };
        const res = await erpProcessPlanService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, planStatus, productionOrderNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ planStatus: 'PENDING' });
    setOpen(true);
  };

  const openEdit = (record: ErpProcessPlan) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      plannedStartTime: record.plannedStartTime ? dayjs(record.plannedStartTime) : undefined,
      plannedEndTime: record.plannedEndTime ? dayjs(record.plannedEndTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpProcessPlanSaveRequest = {
        ...values,
        plannedStartTime: values.plannedStartTime
          ? values.plannedStartTime.format(DATETIME_FORMAT)
          : undefined,
        plannedEndTime: values.plannedEndTime
          ? values.plannedEndTime.format(DATETIME_FORMAT)
          : undefined,
      };
      if (editId == null) {
        await erpProcessPlanService.create(payload);
        message.success('工序计划已创建');
      } else {
        await erpProcessPlanService.update(editId, payload);
        message.success('工序计划已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpProcessPlanService.remove(id);
    message.success('工序计划已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpProcessPlan> = [
    { title: '计划单号', dataIndex: 'planNo', width: 170, fixed: 'left', render: plain },
    { title: '生产订单号', dataIndex: 'productionOrderNo', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '工艺路线编码', dataIndex: 'routeCode', width: 140, render: plain },
    { title: '工序号', dataIndex: 'operationNo', width: 100, render: plain },
    { title: '工序名称', dataIndex: 'operationName', width: 140, render: plain },
    { title: '资源编码', dataIndex: 'resourceCode', width: 130, render: plain },
    { title: '计划数量', dataIndex: 'planQty', width: 110, render: plain },
    { title: '计划开始时间', dataIndex: 'plannedStartTime', width: 170, render: formatDateTime },
    { title: '计划结束时间', dataIndex: 'plannedEndTime', width: 170, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '计划状态',
      dataIndex: 'planStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_PROCESS_PLAN_STATUS_LABEL, v),
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
            <Popconfirm
              title="确认删除该工序计划？"
              onConfirm={() => record.id != null && void remove(record.id)}
            >
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
        工序计划
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="计划状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={planStatus}
              onChange={(v) => setPlanStatus(v)}
              options={[...ERP_PROCESS_PLAN_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="生产订单号">
            <Input
              placeholder="请输入生产订单号"
              allowClear
              style={{ width: 160 }}
              value={productionOrderNo}
              onChange={(e) => setProductionOrderNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="计划单号 / 生产订单号 / 物料编码 / 工序名称"
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
                  void loadData(1, pageSize, keyword, planStatus, productionOrderNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setPlanStatus(undefined);
                  setProductionOrderNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建工序计划</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`工序计划（共 ${total} 条）`}>
        <Table<ErpProcessPlan>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2400 }}
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
        title={editId == null ? '新建工序计划' : '编辑工序计划'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="planNo" label="计划单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="productionOrderNo" label="生产订单号">
            <Input placeholder="请输入生产订单号" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="routeCode" label="工艺路线编码">
            <Input placeholder="请输入工艺路线编码" />
          </Form.Item>
          <Form.Item name="operationNo" label="工序号">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入工序号" />
          </Form.Item>
          <Form.Item name="operationName" label="工序名称">
            <Input placeholder="请输入工序名称" />
          </Form.Item>
          <Form.Item name="resourceCode" label="资源编码">
            <Input placeholder="请输入资源编码" />
          </Form.Item>
          <Form.Item name="planQty" label="计划数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入计划数量" />
          </Form.Item>
          <Form.Item name="plannedStartTime" label="计划开始时间">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择计划开始时间" />
          </Form.Item>
          <Form.Item name="plannedEndTime" label="计划结束时间">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择计划结束时间" />
          </Form.Item>
          <Form.Item name="planStatus" label="计划状态">
            <Select placeholder="为空默认 PENDING" options={[...ERP_PROCESS_PLAN_STATUS_OPTIONS]} />
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
