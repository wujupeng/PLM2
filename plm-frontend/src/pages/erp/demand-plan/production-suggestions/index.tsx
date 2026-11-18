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
import { erpProductionSuggestionService } from '@/services/erpDemandPlanService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_PRODUCTION_SUGGESTION_STATUS_LABEL,
  ERP_PRODUCTION_SUGGESTION_STATUS_OPTIONS,
  type ErpProductionSuggestion,
  type ErpProductionSuggestionQuery,
  type ErpProductionSuggestionSaveRequest,
} from '@/types/erpDemandPlan';

const { Title } = Typography;

const MANAGE = 'erp:demand-plan:productionsuggestion:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpProductionSuggestionSaveRequest, 'requiredDate'> & {
  requiredDate?: Dayjs;
};

export default function ErpProductionSuggestionPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpProductionSuggestion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [suggestionStatus, setSuggestionStatus] = useState<string | undefined>(undefined);
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
      status = suggestionStatus,
      material = materialCode,
      run = runNo,
    ) => {
      setLoading(true);
      try {
        const params: ErpProductionSuggestionQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          suggestionStatus: status,
          materialCode: material || undefined,
          runNo: run || undefined,
        };
        const res = await erpProductionSuggestionService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, suggestionStatus, materialCode, runNo],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ uom: 'PCS', suggestionStatus: 'OPEN' });
    setOpen(true);
  };

  const openEdit = (record: ErpProductionSuggestion) => {
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
      const payload: ErpProductionSuggestionSaveRequest = {
        ...values,
        requiredDate: values.requiredDate ? values.requiredDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpProductionSuggestionService.create(payload);
        message.success('生产建议已创建');
      } else {
        await erpProductionSuggestionService.update(editId, payload);
        message.success('生产建议已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpProductionSuggestionService.remove(id);
    message.success('生产建议已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpProductionSuggestion> = [
    { title: '建议单号', dataIndex: 'suggestionNo', width: 170, fixed: 'left', render: plain },
    { title: '运算单号', dataIndex: 'runNo', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 140, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, ellipsis: true, render: plain },
    { title: '单位', dataIndex: 'uom', width: 80, render: plain },
    { title: '净需求', dataIndex: 'netQty', width: 100, render: plain },
    { title: '建议数量', dataIndex: 'suggestQty', width: 110, render: plain },
    { title: 'BOM版本', dataIndex: 'bomVersion', width: 120, render: plain },
    { title: '仓库编码', dataIndex: 'warehouseCode', width: 120, render: plain },
    { title: '需求日期', dataIndex: 'requiredDate', width: 170, render: formatDateTime },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '建议状态',
      dataIndex: 'suggestionStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(ERP_PRODUCTION_SUGGESTION_STATUS_LABEL, v),
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
            <Popconfirm title="确认删除该生产建议？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        生产建议
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="建议状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={suggestionStatus}
              onChange={(v) => setSuggestionStatus(v)}
              options={[...ERP_PRODUCTION_SUGGESTION_STATUS_OPTIONS]}
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
              placeholder="建议单号 / 物料名称"
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
                  void loadData(1, pageSize, keyword, suggestionStatus, materialCode, runNo);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSuggestionStatus(undefined);
                  setMaterialCode('');
                  setRunNo('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '', '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建生产建议</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`生产建议（共 ${total} 条）`}>
        <Table<ErpProductionSuggestion>
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
        title={editId == null ? '新建生产建议' : '编辑生产建议'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="suggestionNo" label="建议单号">
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
          <Form.Item name="netQty" label="净需求">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入净需求" />
          </Form.Item>
          <Form.Item name="suggestQty" label="建议数量">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入建议数量" />
          </Form.Item>
          <Form.Item name="bomVersion" label="BOM版本">
            <Input placeholder="请输入BOM版本" />
          </Form.Item>
          <Form.Item name="warehouseCode" label="仓库编码">
            <Input placeholder="请输入仓库编码" />
          </Form.Item>
          <Form.Item name="requiredDate" label="需求日期">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择需求日期" />
          </Form.Item>
          <Form.Item name="suggestionStatus" label="建议状态">
            <Select placeholder="为空默认 OPEN" options={[...ERP_PRODUCTION_SUGGESTION_STATUS_OPTIONS]} />
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
