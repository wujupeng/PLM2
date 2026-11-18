import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { codeService } from '@/services/codeService';
import {
  CODE_DICT_TYPE_OPTIONS,
  type CodeDictionaryItem,
  type CodeDictionarySaveParams,
} from '@/types/label';
import { useAuthStore } from '@/stores/authStore';

const { Title } = Typography;

/** 码表类型中文名映射（取自 CODE_DICT_TYPE_OPTIONS，找不到时回退类型码） */
const DICT_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  CODE_DICT_TYPE_OPTIONS.map((item) => [item.value, item.label]),
);

/** 状态选项 */
const DICT_STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
];

interface CodeDictFormValues {
  dictType: string;
  dictCode: string;
  dictName: string;
  extValue?: string;
  extText?: string;
  sortNo?: number;
  status?: number;
  remark?: string;
}

interface SearchState {
  keyword?: string;
  dictType?: string;
  status?: number;
}

export default function CodeDictPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<CodeDictFormValues>();

  const [data, setData] = useState<CodeDictionaryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  // 码表类型选项（接口动态获取，为空时回退本地常量）
  const [dictTypeList, setDictTypeList] = useState<string[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CodeDictionaryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadDictTypes = useCallback(async () => {
    const types = await codeService.dictTypes();
    setDictTypeList(types || []);
  }, []);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await codeService.dictPage({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          dictType: cond.dictType || undefined,
          status: cond.status,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    void loadDictTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 查询/表单共用的码表类型选项：接口为空时回退 CODE_DICT_TYPE_OPTIONS */
  const dictTypeSelectOptions = useMemo(() => {
    const typeCodes = dictTypeList.length ? dictTypeList : CODE_DICT_TYPE_OPTIONS.map((item) => item.value);
    return typeCodes.map((code) => ({ label: DICT_TYPE_LABEL[code] || code, value: code }));
  }, [dictTypeList]);

  const onSearch = (values: SearchState) => {
    const cond = { ...values };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 1 });
    setModalOpen(true);
  };

  const openEdit = (record: CodeDictionaryItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      dictType: record.dictType,
      dictCode: record.dictCode,
      dictName: record.dictName,
      extValue: record.extValue,
      extText: record.extText,
      sortNo: record.sortNo,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: CodeDictionarySaveParams = {
      dictType: values.dictType,
      dictCode: values.dictCode,
      dictName: values.dictName,
      extValue: values.extValue,
      extText: values.extText,
      sortNo: values.sortNo,
      status: values.status,
      remark: values.remark,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await codeService.dictUpdate(editing.id, payload);
        message.success('更新成功');
      } else {
        await codeService.dictCreate(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: CodeDictionaryItem) => {
    await codeService.dictRemove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<CodeDictionaryItem> = [
    {
      title: '码表类型',
      dataIndex: 'dictType',
      width: 180,
      render: (v?: string) => (v ? DICT_TYPE_LABEL[v] || v : '-'),
    },
    { title: '取值编码', dataIndex: 'dictCode', width: 140, render: (v) => v || '-' },
    { title: '取值名称', dataIndex: 'dictName', width: 160, render: (v) => v || '-' },
    { title: '扩展取值', dataIndex: 'extValue', width: 130, render: (v) => v || '-' },
    { title: '扩展文本', dataIndex: 'extText', width: 150, render: (v) => v || '-' },
    { title: '排序', dataIndex: 'sortNo', width: 80, render: (v) => (v ?? '-') },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: number) =>
        v === 1 ? <Tag color="success">启用</Tag> : v === 0 ? <Tag color="error">停用</Tag> : '-',
    },
    { title: '备注', dataIndex: 'remark', width: 180, render: (v) => v || '-' },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('code:dict:save') && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission('code:dict:delete') && (
            <Popconfirm title="确认删除该码表项？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        统一码表
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="取值编码 / 名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="dictType" label="码表类型">
            <Select
              placeholder="请选择"
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: 220 }}
              options={dictTypeSelectOptions}
            />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 130 }} options={DICT_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`统一码表列表（共 ${total} 条）`}
        extra={
          hasPermission('code:dict:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增码表项
            </Button>
          )
        }
      >
        <Table<CodeDictionaryItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1500 }}
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

      {/* 新增/编辑码表项 */}
      <Modal
        title={editing ? '编辑码表项' : '新增码表项'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="dictType" label="码表类型" rules={[{ required: true, message: '请选择码表类型' }]}>
            <Select
              placeholder="请选择"
              showSearch
              optionFilterProp="label"
              disabled={!!editing}
              options={dictTypeSelectOptions}
            />
          </Form.Item>
          <Form.Item name="dictCode" label="取值编码" rules={[{ required: true, message: '请输入取值编码' }]}>
            <Input placeholder="请输入取值编码" />
          </Form.Item>
          <Form.Item name="dictName" label="取值名称" rules={[{ required: true, message: '请输入取值名称' }]}>
            <Input placeholder="请输入取值名称" />
          </Form.Item>
          <Form.Item name="extValue" label="扩展取值">
            <Input placeholder="请输入扩展取值" />
          </Form.Item>
          <Form.Item name="extText" label="扩展文本">
            <Input placeholder="请输入扩展文本" />
          </Form.Item>
          <Form.Item name="sortNo" label="排序">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear options={DICT_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
