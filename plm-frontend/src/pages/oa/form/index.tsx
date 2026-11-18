import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
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
import { oaFormService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import {
  OA_FIELD_DATA_SOURCE_OPTIONS,
  OA_FIELD_TYPE_OPTIONS,
  OA_FORM_STATUS_COLOR,
  OA_FORM_STATUS_LABEL,
  OA_FORM_STATUS_OPTIONS,
  OA_YES_NO_OPTIONS,
  type OaFormDefinitionItem,
  type OaFormFieldItem,
  type OaFormQuery,
  type OaFormSaveParams,
} from '@/types/oa';

const { Title } = Typography;
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

interface FormFieldValues {
  fieldCode?: string;
  fieldName?: string;
  fieldType?: string;
  requiredFlag?: number;
  dataSource?: string;
  sourceValue?: string;
  optionsJson?: string;
  rulesJson?: string;
  placeholder?: string;
  sortNo?: number;
  remark?: string;
}

interface FormDesignerValues {
  formCode?: string;
  formName?: string;
  category?: string;
  status?: string;
  description?: string;
  remark?: string;
  schemaJson?: string;
  fields?: FormFieldValues[];
}

interface SearchState {
  keyword?: string;
  category?: string;
  status?: string;
}

export default function OaFormDesignerPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormDesignerValues>();

  const [data, setData] = useState<OaFormDefinitionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OaFormDefinitionItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaFormQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          category: cond.category || undefined,
          status: cond.status || undefined,
        };
        const res = await oaFormService.page(params);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    form.setFieldsValue({ status: 'DRAFT', fields: [] });
    setModalOpen(true);
  };

  const openEdit = async (record: OaFormDefinitionItem) => {
    setEditing(record);
    form.resetFields();
    const detail = await oaFormService.detail(record.id);
    const target = detail.form || record;
    form.setFieldsValue({
      formCode: target.formCode,
      formName: target.formName,
      category: target.category,
      status: target.status,
      description: target.description,
      remark: target.remark,
      schemaJson: target.schemaJson,
      fields: (detail.fields || []).map((f) => ({
        fieldCode: f.fieldCode,
        fieldName: f.fieldName,
        fieldType: f.fieldType,
        requiredFlag: f.requiredFlag,
        dataSource: f.dataSource,
        sourceValue: f.sourceValue,
        optionsJson: f.optionsJson,
        rulesJson: f.rulesJson,
        placeholder: f.placeholder,
        sortNo: f.sortNo,
        remark: f.remark,
      })),
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const fields: OaFormFieldItem[] = (values.fields || []).map((f, index) => ({
      fieldCode: f.fieldCode || '',
      fieldName: f.fieldName || '',
      fieldType: f.fieldType,
      requiredFlag: f.requiredFlag,
      dataSource: f.dataSource,
      sourceValue: f.sourceValue,
      optionsJson: f.optionsJson,
      rulesJson: f.rulesJson,
      placeholder: f.placeholder,
      sortNo: f.sortNo ?? index + 1,
      remark: f.remark,
    }));
    const payload: OaFormSaveParams = {
      formCode: values.formCode || '',
      formName: values.formName || '',
      category: values.category,
      status: values.status,
      description: values.description,
      remark: values.remark,
      schemaJson: values.schemaJson,
      fields,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await oaFormService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await oaFormService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (record: OaFormDefinitionItem) => {
    await oaFormService.publish(record.id);
    message.success('发布成功');
    void loadData();
  };

  const handleDelete = async (record: OaFormDefinitionItem) => {
    await oaFormService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const columns: ColumnsType<OaFormDefinitionItem> = [
    { title: '表单编码', dataIndex: 'formCode', width: 170, fixed: 'left', render: (v) => v || '-' },
    { title: '表单名称', dataIndex: 'formName', width: 180, render: (v) => v || '-' },
    { title: '分类', dataIndex: 'category', width: 130, render: (v) => v || '-' },
    { title: '版本', dataIndex: 'versionNo', width: 80, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) => (v ? <Tag color={OA_FORM_STATUS_COLOR[v]}>{OA_FORM_STATUS_LABEL[v] || v}</Tag> : '-'),
    },
    { title: '说明', dataIndex: 'description', width: 260, render: (v) => v || '-' },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          {hasPermission('oa:form:save') && (
            <Button type="link" size="small" onClick={() => void openEdit(record)}>
              设计
            </Button>
          )}
          {hasPermission('oa:form:publish') && (
            <Popconfirm title="确认发布该表单？发布后版本号将递增。" onConfirm={() => handlePublish(record)}>
              <Button type="link" size="small">
                发布
              </Button>
            </Popconfirm>
          )}
          {hasPermission('oa:form:delete') && (
            <Popconfirm title="确认删除该表单？" onConfirm={() => handleDelete(record)}>
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
        表单设计器
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="表单编码 / 名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input placeholder="请输入分类" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear style={{ width: 120 }} options={OA_FORM_STATUS_OPTIONS} />
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
        title={`表单列表（共 ${total} 条）`}
        extra={
          hasPermission('oa:form:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增表单
            </Button>
          )
        }
      >
        <Table<OaFormDefinitionItem>
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
        title={editing ? '编辑表单' : '新增表单'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={960}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="formCode" label="表单编码" rules={[{ required: true, message: '请输入表单编码' }]}>
                <Input placeholder="如 OA_LEAVE，全局唯一" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="formName" label="表单名称" rules={[{ required: true, message: '请输入表单名称' }]}>
                <Input placeholder="如 请假申请单" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="category" label="分类">
                <Input placeholder="如 人事行政" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择" options={OA_FORM_STATUS_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="description" label="说明">
                <Input placeholder="表单用途说明" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="表单字段" required>
            <Form.List name="fields">
              {(items, { add, remove }) => (
                <>
                  {items.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      size="small"
                      style={{ marginBottom: 12 }}
                      title={`字段 ${name + 1}`}
                      extra={
                        <Button type="link" size="small" danger onClick={() => remove(name)}>
                          删除
                        </Button>
                      }
                    >
                      <Row gutter={12}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'fieldCode']}
                            label="字段编码"
                            rules={[{ required: true, message: '请输入字段编码' }]}
                          >
                            <Input placeholder="如 leaveType" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'fieldName']}
                            label="字段名称"
                            rules={[{ required: true, message: '请输入字段名称' }]}
                          >
                            <Input placeholder="如 请假类型" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item {...restField} name={[name, 'fieldType']} label="字段类型">
                            <Select placeholder="请选择" options={OA_FIELD_TYPE_OPTIONS} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col span={6}>
                          <Form.Item {...restField} name={[name, 'requiredFlag']} label="是否必填">
                            <Select placeholder="请选择" options={OA_YES_NO_OPTIONS} />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item {...restField} name={[name, 'dataSource']} label="数据来源">
                            <Select placeholder="请选择" options={OA_FIELD_DATA_SOURCE_OPTIONS} />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item {...restField} name={[name, 'sourceValue']} label="来源参数">
                            <Input placeholder="如字典类型 oa_leave_type" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item {...restField} name={[name, 'sortNo']} label="排序">
                            <InputNumber style={{ width: '100%' }} min={1} placeholder="排序号" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col span={8}>
                          <Form.Item {...restField} name={[name, 'placeholder']} label="输入提示">
                            <Input placeholder="请输入提示文案" />
                          </Form.Item>
                        </Col>
                        <Col span={16}>
                          <Form.Item
                            {...restField}
                            name={[name, 'optionsJson']}
                            label="下拉选项（JSON）"
                            tooltip='仅下拉类型需要，如 [{"label":"事假","value":"PERSONAL"}]'
                          >
                            <Input placeholder='[{"label":"事假","value":"PERSONAL"}]' />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => add({ fieldType: 'TEXT', requiredFlag: 0, dataSource: 'MANUAL' })}
                  >
                    添加字段
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item name="schemaJson" label="表单结构（JSON）" tooltip="保留设计器布局与组件配置，可留空">
            <Input.TextArea rows={3} placeholder="表单设计器完整结构 JSON，可留空" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
