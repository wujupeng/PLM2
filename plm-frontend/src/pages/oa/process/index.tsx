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
import { oaFormService, oaProcessService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import {
  OA_APPROVER_TYPE_OPTIONS,
  OA_APPROVER_VALUE_HINT,
  OA_FORM_STATUS_COLOR,
  OA_FORM_STATUS_LABEL,
  OA_FORM_STATUS_OPTIONS,
  OA_NODE_TYPE_OPTIONS,
  OA_YES_NO_OPTIONS,
  type OaProcessDefinitionItem,
  type OaProcessNodeItem,
  type OaProcessQuery,
  type OaProcessSaveParams,
} from '@/types/oa';

const { Title } = Typography;
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

interface ProcessNodeValues {
  nodeCode?: string;
  nodeName?: string;
  nodeType?: string;
  approverType?: string;
  approverValue?: string;
  allowDelegate?: number;
  sortNo?: number;
  remark?: string;
}

interface ProcessDesignerValues {
  processCode?: string;
  processName?: string;
  formId?: number;
  category?: string;
  status?: string;
  description?: string;
  remark?: string;
  definitionJson?: string;
  nodes?: ProcessNodeValues[];
}

interface SearchState {
  keyword?: string;
  status?: string;
}

export default function OaProcessDesignerPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<ProcessDesignerValues>();

  const [data, setData] = useState<OaProcessDefinitionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<SearchState>({});

  const [formOptions, setFormOptions] = useState<{ value: number; label: string }[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OaProcessDefinitionItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadForms = useCallback(async () => {
    const res = await oaFormService.page({ pageNum: 1, pageSize: 200 });
    setFormOptions((res.list || []).map((f) => ({ value: f.id, label: `${f.formName}（${f.formCode}）` })));
  }, []);

  useEffect(() => {
    void loadForms();
  }, [loadForms]);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaProcessQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          status: cond.status || undefined,
        };
        const res = await oaProcessService.page(params);
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
    form.setFieldsValue({ status: 'DRAFT', nodes: [] });
    setModalOpen(true);
  };

  const openEdit = async (record: OaProcessDefinitionItem) => {
    setEditing(record);
    form.resetFields();
    const detail = await oaProcessService.detail(record.id);
    const target = detail.process || record;
    form.setFieldsValue({
      processCode: target.processCode,
      processName: target.processName,
      formId: target.formId,
      category: target.category,
      status: target.status,
      description: target.description,
      remark: target.remark,
      definitionJson: target.definitionJson,
      nodes: (detail.nodes || []).map((n) => ({
        nodeCode: n.nodeCode,
        nodeName: n.nodeName,
        nodeType: n.nodeType,
        approverType: n.approverType,
        approverValue: n.approverValue,
        allowDelegate: n.allowDelegate,
        sortNo: n.sortNo,
        remark: n.remark,
      })),
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const nodes: OaProcessNodeItem[] = (values.nodes || []).map((n, index) => ({
      nodeCode: n.nodeCode || '',
      nodeName: n.nodeName || '',
      nodeType: n.nodeType,
      approverType: n.approverType,
      approverValue: n.approverValue,
      allowDelegate: n.allowDelegate,
      sortNo: n.sortNo ?? index + 1,
      remark: n.remark,
    }));
    const payload: OaProcessSaveParams = {
      processCode: values.processCode || '',
      processName: values.processName || '',
      formId: values.formId,
      category: values.category,
      status: values.status,
      description: values.description,
      remark: values.remark,
      definitionJson: values.definitionJson,
      nodes,
    };
    setSubmitting(true);
    try {
      if (editing) {
        await oaProcessService.update(editing.id, payload);
        message.success('更新成功');
      } else {
        await oaProcessService.create(payload);
        message.success('新增成功');
      }
      setModalOpen(false);
      void loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (record: OaProcessDefinitionItem) => {
    await oaProcessService.publish(record.id);
    message.success('发布成功');
    void loadData();
  };

  const handleDelete = async (record: OaProcessDefinitionItem) => {
    await oaProcessService.remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const formNameOf = (formId?: number) =>
    formId ? formOptions.find((o) => o.value === formId)?.label || `表单 ${formId}` : '-';

  const columns: ColumnsType<OaProcessDefinitionItem> = [
    { title: '流程编码', dataIndex: 'processCode', width: 180, fixed: 'left', render: (v) => v || '-' },
    { title: '流程名称', dataIndex: 'processName', width: 180, render: (v) => v || '-' },
    { title: '关联表单', dataIndex: 'formId', width: 200, render: (v?: number) => formNameOf(v) },
    { title: '分类', dataIndex: 'category', width: 130, render: (v) => v || '-' },
    { title: '版本', dataIndex: 'versionNo', width: 80, render: (v) => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v?: string) => (v ? <Tag color={OA_FORM_STATUS_COLOR[v]}>{OA_FORM_STATUS_LABEL[v] || v}</Tag> : '-'),
    },
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
          {hasPermission('oa:process:save') && (
            <Button type="link" size="small" onClick={() => void openEdit(record)}>
              设计
            </Button>
          )}
          {hasPermission('oa:process:publish') && (
            <Popconfirm title="确认发布该流程？发布后版本号将递增。" onConfirm={() => handlePublish(record)}>
              <Button type="link" size="small">
                发布
              </Button>
            </Popconfirm>
          )}
          {hasPermission('oa:process:delete') && (
            <Popconfirm title="确认删除该流程？" onConfirm={() => handleDelete(record)}>
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
        流程设计器
      </Title>

      <Card>
        <Form layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="流程编码 / 名称" allowClear style={{ width: 200 }} />
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
        title={`流程列表（共 ${total} 条）`}
        extra={
          hasPermission('oa:process:save') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增流程
            </Button>
          )
        }
      >
        <Table<OaProcessDefinitionItem>
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
        title={editing ? '编辑流程' : '新增流程'}
        open={modalOpen}
        onOk={handleSubmit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={1000}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="processCode" label="流程编码" rules={[{ required: true, message: '请输入流程编码' }]}>
                <Input placeholder="如 OA_LEAVE_FLOW，全局唯一" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="processName" label="流程名称" rules={[{ required: true, message: '请输入流程名称' }]}>
                <Input placeholder="如 请假审批流程" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="formId" label="关联表单" tooltip="发起流程时按该表单渲染填报字段">
                <Select placeholder="请选择表单" allowClear showSearch optionFilterProp="label" options={formOptions} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="category" label="分类">
                <Input placeholder="如 人事行政" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择" options={OA_FORM_STATUS_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="description" label="说明">
                <Input placeholder="流程用途说明" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="流程节点" required>
            <Form.List name="nodes">
              {(items, { add, remove }) => (
                <>
                  {items.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      size="small"
                      style={{ marginBottom: 12 }}
                      title={`节点 ${name + 1}`}
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
                            name={[name, 'nodeCode']}
                            label="节点编码"
                            rules={[{ required: true, message: '请输入节点编码' }]}
                          >
                            <Input placeholder="如 N1" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'nodeName']}
                            label="节点名称"
                            rules={[{ required: true, message: '请输入节点名称' }]}
                          >
                            <Input placeholder="如 部门主管审批" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item {...restField} name={[name, 'nodeType']} label="节点类型">
                            <Select placeholder="请选择" options={OA_NODE_TYPE_OPTIONS} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col span={8}>
                          <Form.Item {...restField} name={[name, 'approverType']} label="审批人类型">
                            <Select placeholder="请选择" options={OA_APPROVER_TYPE_OPTIONS} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            noStyle
                            shouldUpdate={(prev: ProcessDesignerValues, cur: ProcessDesignerValues) =>
                              prev.nodes?.[name]?.approverType !== cur.nodes?.[name]?.approverType
                            }
                          >
                            {({ getFieldValue }) => {
                              const approverType = getFieldValue(['nodes', name, 'approverType']) as
                                | string
                                | undefined;
                              return (
                                <Form.Item
                                  {...restField}
                                  name={[name, 'approverValue']}
                                  label="审批人参数"
                                  tooltip={approverType ? OA_APPROVER_VALUE_HINT[approverType] : undefined}
                                >
                                  <Input
                                    placeholder={
                                      approverType
                                        ? OA_APPROVER_VALUE_HINT[approverType]
                                        : '请先选择审批人类型'
                                    }
                                    disabled={
                                      approverType === 'ORG_MANAGER' ||
                                      approverType === 'APPLICANT_MANAGER' ||
                                      approverType === 'PROCESS_STARTER'
                                    }
                                  />
                                </Form.Item>
                              );
                            }}
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item {...restField} name={[name, 'allowDelegate']} label="允许代理">
                            <Select placeholder="请选择" options={OA_YES_NO_OPTIONS} />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item {...restField} name={[name, 'sortNo']} label="排序">
                            <InputNumber style={{ width: '100%' }} min={1} placeholder="排序号" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col span={24}>
                          <Form.Item {...restField} name={[name, 'remark']} label="备注">
                            <Input placeholder="节点备注" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() =>
                      add({ nodeType: 'APPROVAL', approverType: 'ROLE', allowDelegate: 1 })
                    }
                  >
                    添加节点
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item name="definitionJson" label="流程图结构（JSON）" tooltip="保留设计器连线与节点坐标，可留空">
            <Input.TextArea rows={3} placeholder="流程设计器完整结构 JSON，可留空" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
