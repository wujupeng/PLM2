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
import { mesRecipeService as service } from '@/services/mesCraftService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  MES_RECIPE_STATUS_LABEL,
  MES_RECIPE_STATUS_OPTIONS,
  type MesRecipe,
  type MesRecipeQuery,
  type MesRecipeSaveRequest,
} from '@/types/mesCraft';

const { Title } = Typography;

const MANAGE = 'mes:craft:recipe:manage';
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<MesRecipeSaveRequest, 'effectiveDate'> & {
  effectiveDate?: Dayjs;
};

export default function MesRecipePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<MesRecipe[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [recipeStatus, setRecipeStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = recipeStatus) => {
      setLoading(true);
      try {
        const params: MesRecipeQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          recipeStatus: status,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, recipeStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ recipeStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: MesRecipe) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      effectiveDate: record.effectiveDate ? dayjs(record.effectiveDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MesRecipeSaveRequest = {
        ...values,
        effectiveDate: values.effectiveDate ? values.effectiveDate.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('参数配方已创建');
      } else {
        await service.update(editId, payload);
        message.success('参数配方已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('参数配方已删除');
    void loadData();
  };

  const columns: ColumnsType<MesRecipe> = [
    { title: '配方单号', dataIndex: 'recipeNo', width: 190, fixed: 'left', render: plain },
    { title: '配方名称', dataIndex: 'recipeName', width: 180, render: plain },
    { title: '工艺编码', dataIndex: 'processCode', width: 130, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 160, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 170, render: plain },
    { title: '规格', dataIndex: 'spec', width: 130, render: plain },
    { title: '参数编码', dataIndex: 'paramCode', width: 120, render: plain },
    { title: '参数名称', dataIndex: 'paramName', width: 140, render: plain },
    { title: '参数值', dataIndex: 'paramValue', width: 120, render: plain },
    { title: '参数单位', dataIndex: 'paramUnit', width: 110, render: plain },
    { title: '上限值', dataIndex: 'upperLimit', width: 110, render: plain },
    { title: '下限值', dataIndex: 'lowerLimit', width: 110, render: plain },
    {
      title: '配方状态',
      dataIndex: 'recipeStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(MES_RECIPE_STATUS_LABEL, v),
    },
    { title: '生效日期', dataIndex: 'effectiveDate', width: 170, render: formatDateTime },
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
            <Popconfirm title="确认删除该参数配方？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        参数配方
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="配方状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={recipeStatus}
              onChange={(v) => setRecipeStatus(v)}
              options={[...MES_RECIPE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="配方单号 / 配方名称 / 工艺编码 / 物料编码"
              allowClear
              style={{ width: 360 }}
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
                  void loadData(1, pageSize, keyword, recipeStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setRecipeStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建参数配方</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`参数配方（共 ${total} 条）`}>
        <Table<MesRecipe>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 2500 }}
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
        title={editId == null ? '新建参数配方' : '编辑参数配方'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={760}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="recipeNo" label="配方单号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="recipeName" label="配方名称">
            <Input placeholder="请输入配方名称" />
          </Form.Item>
          <Form.Item name="processCode" label="工艺编码">
            <Input placeholder="请输入工艺编码" />
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
          <Form.Item name="paramCode" label="参数编码">
            <Input placeholder="请输入参数编码" />
          </Form.Item>
          <Form.Item name="paramName" label="参数名称">
            <Input placeholder="请输入参数名称" />
          </Form.Item>
          <Form.Item name="paramValue" label="参数值">
            <Input placeholder="请输入参数值" />
          </Form.Item>
          <Form.Item name="paramUnit" label="参数单位">
            <Input placeholder="请输入参数单位" />
          </Form.Item>
          <Form.Item name="upperLimit" label="上限值">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="lowerLimit" label="下限值">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="recipeStatus" label="配方状态">
            <Select placeholder="为空默认 DRAFT" options={[...MES_RECIPE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="effectiveDate" label="生效日期">
            <DatePicker showTime style={{ width: '100%' }} />
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
