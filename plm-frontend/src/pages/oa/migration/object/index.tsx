import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { oaMigrationObjectService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import {
  BOOLEAN_FORM_OPTIONS,
  enableTag,
  enumTag,
  enumText,
  flagText,
} from '@/pages/oa/integration/shared';
import {
  OA_ENABLE_STATUS_OPTIONS,
  OA_MIGRATION_METHOD_LABEL,
  OA_MIGRATION_METHOD_OPTIONS,
  OA_MIGRATION_OBJECT_STATUS_LABEL,
  OA_MIGRATION_OBJECT_STATUS_OPTIONS,
  type OaMigrationFieldMappingItem,
  type OaMigrationFieldMappingSaveParams,
  type OaMigrationObjectItem,
  type OaMigrationObjectSaveParams,
  type OaMigrationQuery,
} from '@/types/oa';

const { Title } = Typography;

const OBJECT_MANAGE = 'oa:migration:object:manage';

/* ---------------- 1. 迁移对象目录 ---------------- */

function ObjectTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaMigrationObjectSaveParams>();
  const [markForm] = Form.useForm<{ migratedCount?: number; status?: string }>();
  const [data, setData] = useState<OaMigrationObjectItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [sourceType, setSourceType] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [detail, setDetail] = useState<OaMigrationObjectItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [markTarget, setMarkTarget] = useState<OaMigrationObjectItem | null>(null);
  const [markOpen, setMarkOpen] = useState(false);
  const [marking, setMarking] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, type = sourceType) => {
      setLoading(true);
      try {
        const params: OaMigrationQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          sourceType: type,
        };
        const res = await oaMigrationObjectService.pageObjects(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, sourceType],
  );

  const loadStats = useCallback(async () => {
    const res = await oaMigrationObjectService.overview();
    setStats((res || {}) as Record<string, unknown>);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ status: 'PENDING', migrateRequired: false });
    setOpen(true);
  };

  const openEdit = (record: OaMigrationObjectItem) => {
    setEditId(record.id);
    form.setFieldsValue({
      objectCode: record.objectCode,
      objectName: record.objectName,
      sourceSystem: record.sourceSystem,
      sourceType: record.sourceType,
      sourceLocation: record.sourceLocation,
      targetObject: record.targetObject,
      sourceCount: record.sourceCount,
      migrateRequired: record.migrateRequired === 1,
      status: record.status,
      remark: record.remark,
    });
    setOpen(true);
  };

  const openDetail = async (record: OaMigrationObjectItem) => {
    setDetailOpen(true);
    const res = await oaMigrationObjectService.objectDetail(record.id);
    setDetail(res);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaMigrationObjectSaveParams = { ...values };
      if (editId) {
        await oaMigrationObjectService.updateObject(editId, payload);
        message.success('迁移对象已更新');
      } else {
        await oaMigrationObjectService.createObject(payload);
        message.success('迁移对象已创建');
      }
      setOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await oaMigrationObjectService.removeObject(id);
    message.success('迁移对象已删除');
    void loadData();
    void loadStats();
  };

  const openMark = (record: OaMigrationObjectItem) => {
    setMarkTarget(record);
    markForm.resetFields();
    markForm.setFieldsValue({ migratedCount: record.sourceCount, status: 'DONE' });
    setMarkOpen(true);
  };

  const submitMark = async () => {
    if (!markTarget) return;
    const values = await markForm.validateFields();
    setMarking(true);
    try {
      await oaMigrationObjectService.markObjectMigrated(
        markTarget.id,
        values.migratedCount,
        values.status,
      );
      message.success('迁移对象已标记完成');
      setMarkOpen(false);
      void loadData();
      void loadStats();
    } finally {
      setMarking(false);
    }
  };

  const columns: ColumnsType<OaMigrationObjectItem> = [
    { title: '对象编码', dataIndex: 'objectCode', width: 150, fixed: 'left', render: plain },
    { title: '对象名称', dataIndex: 'objectName', width: 180, render: plain },
    { title: '源系统', dataIndex: 'sourceSystem', width: 130, render: plain },
    {
      title: '迁移方式',
      dataIndex: 'sourceType',
      width: 120,
      render: (v) => enumText(OA_MIGRATION_METHOD_LABEL, v),
    },
    { title: '源位置', dataIndex: 'sourceLocation', width: 180, render: plain },
    { title: '目标对象', dataIndex: 'targetObject', width: 160, render: plain },
    { title: '源记录数', dataIndex: 'sourceCount', width: 100, render: plain },
    { title: '已迁移数', dataIndex: 'migratedCount', width: 100, render: plain },
    { title: '必须迁移', dataIndex: 'migrateRequired', width: 90, render: flagText },
    {
      title: '迁移状态',
      dataIndex: 'status',
      width: 110,
      render: (v) => enumTag(OA_MIGRATION_OBJECT_STATUS_LABEL, v),
    },
    { title: '最近迁移时间', dataIndex: 'lastMigrateTime', width: 170, render: formatDateTime },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
          {hasPermission(OBJECT_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(OBJECT_MANAGE) && (
            <Button type="link" size="small" onClick={() => openMark(record)}>
              标记完成
            </Button>
          )}
          {hasPermission(OBJECT_MANAGE) && (
            <Popconfirm title="确认删除该迁移对象？" onConfirm={() => void remove(record.id)}>
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
      <Card>
        <Space size="large" wrap>
          <Statistic title="迁移对象总数" value={Number(stats.objectTotal ?? 0)} />
          <Statistic
            title="已完成"
            value={Number(stats.objectDone ?? 0)}
            valueStyle={{ color: '#389e0d' }}
          />
          <Statistic
            title="必须迁移"
            value={Number(stats.objectRequired ?? 0)}
            valueStyle={{ color: '#d46b08' }}
          />
          <Statistic title="字段映射总数" value={Number(stats.mappingTotal ?? 0)} />
          <Statistic title="必填映射" value={Number(stats.mappingRequired ?? 0)} />
          <Statistic title="源记录总数" value={Number(stats.sourceTotal ?? 0)} />
          <Statistic
            title="已迁移总数"
            value={Number(stats.migratedTotal ?? 0)}
            valueStyle={{ color: '#389e0d' }}
          />
        </Space>
      </Card>

      <Card>
        <Form layout="inline">
          <Form.Item label="迁移方式">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={sourceType}
              onChange={(v) => setSourceType(v)}
              options={[...OA_MIGRATION_METHOD_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="对象编码 / 名称 / 目标对象"
              allowClear
              style={{ width: 240 }}
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
                  void loadData(1, pageSize, keyword, sourceType);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setSourceType(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(OBJECT_MANAGE) && <Button onClick={openCreate}>新增对象</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`迁移对象目录（共 ${total} 条）`}>
        <Table<OaMigrationObjectItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1800 }}
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
        title="迁移对象详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detail ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="对象编码">{plain(detail.objectCode)}</Descriptions.Item>
            <Descriptions.Item label="对象名称">{plain(detail.objectName)}</Descriptions.Item>
            <Descriptions.Item label="源系统">{plain(detail.sourceSystem)}</Descriptions.Item>
            <Descriptions.Item label="迁移方式">
              {enumText(OA_MIGRATION_METHOD_LABEL, detail.sourceType)}
            </Descriptions.Item>
            <Descriptions.Item label="源位置">{plain(detail.sourceLocation)}</Descriptions.Item>
            <Descriptions.Item label="目标对象">{plain(detail.targetObject)}</Descriptions.Item>
            <Descriptions.Item label="源记录数">{plain(detail.sourceCount)}</Descriptions.Item>
            <Descriptions.Item label="已迁移数">{plain(detail.migratedCount)}</Descriptions.Item>
            <Descriptions.Item label="必须迁移">{flagText(detail.migrateRequired)}</Descriptions.Item>
            <Descriptions.Item label="迁移状态">
              {enumTag(OA_MIGRATION_OBJECT_STATUS_LABEL, detail.status)}
            </Descriptions.Item>
            <Descriptions.Item label="最近迁移时间">
              {formatDateTime(detail.lastMigrateTime)}
            </Descriptions.Item>
            <Descriptions.Item label="归属组织">{plain(detail.orgName)}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {plain(detail.remark)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={editId ? '编辑迁移对象' : '新增迁移对象'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="objectCode" label="对象编码">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="objectName"
            label="对象名称"
            rules={[{ required: true, message: '请输入对象名称' }]}
          >
            <Input placeholder="如历史订单 / 历史用户" />
          </Form.Item>
          <Form.Item name="sourceSystem" label="源系统">
            <Input placeholder="如老 OA / U8" />
          </Form.Item>
          <Form.Item name="sourceType" label="迁移方式">
            <Select placeholder="请选择" options={[...OA_MIGRATION_METHOD_OPTIONS]} />
          </Form.Item>
          <Form.Item name="sourceLocation" label="源位置">
            <Input placeholder="表名 / 接口地址 / 文件路径" />
          </Form.Item>
          <Form.Item name="targetObject" label="目标对象">
            <Input placeholder="迁移到的新对象" />
          </Form.Item>
          <Form.Item name="sourceCount" label="源记录数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="留空系统统计" />
          </Form.Item>
          <Form.Item name="migrateRequired" label="必须迁移">
            <Select options={[...BOOLEAN_FORM_OPTIONS]} />
          </Form.Item>
          <Form.Item name="status" label="迁移状态">
            <Select placeholder="请选择" options={[...OA_MIGRATION_OBJECT_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="标记迁移完成"
        open={markOpen}
        onOk={() => void submitMark()}
        confirmLoading={marking}
        onCancel={() => setMarkOpen(false)}
        destroyOnClose
        width={520}
      >
        <Descriptions column={1} size="small" style={{ marginBottom: 12 }}>
          <Descriptions.Item label="对象编码">{plain(markTarget?.objectCode)}</Descriptions.Item>
          <Descriptions.Item label="对象名称">{plain(markTarget?.objectName)}</Descriptions.Item>
        </Descriptions>
        <Form form={markForm} layout="vertical" preserve={false}>
          <Form.Item name="migratedCount" label="已迁移数">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="迁移状态">
            <Select placeholder="请选择" options={[...OA_MIGRATION_OBJECT_STATUS_OPTIONS]} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

/* ---------------- 2. 字段映射 ---------------- */

function MappingTab() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<OaMigrationFieldMappingSaveParams>();
  const [data, setData] = useState<OaMigrationFieldMappingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [objectCode, setObjectCode] = useState<string | undefined>(undefined);
  const [objects, setObjects] = useState<OaMigrationObjectItem[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, code = objectCode) => {
      setLoading(true);
      try {
        const params: OaMigrationQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          objectCode: code,
        };
        const res = await oaMigrationObjectService.pageMappings(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, objectCode],
  );

  const loadObjects = useCallback(async () => {
    const res = await oaMigrationObjectService.listAllObjects();
    setObjects(res || []);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, '', undefined);
    void loadObjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ status: 1, requiredFlag: false });
    setOpen(true);
  };

  const openEdit = (record: OaMigrationFieldMappingItem) => {
    setEditId(record.id);
    form.setFieldsValue({
      mappingNo: record.mappingNo,
      objectCode: record.objectCode,
      sourceField: record.sourceField,
      targetField: record.targetField,
      dataType: record.dataType,
      enumMapping: record.enumMapping,
      valueMapping: record.valueMapping,
      transformRule: record.transformRule,
      requiredFlag: record.requiredFlag === 1,
      status: record.status,
      remark: record.remark,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: OaMigrationFieldMappingSaveParams = { ...values };
      if (editId) {
        await oaMigrationObjectService.updateMapping(editId, payload);
        message.success('字段映射已更新');
      } else {
        await oaMigrationObjectService.createMapping(payload);
        message.success('字段映射已创建');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await oaMigrationObjectService.removeMapping(id);
    message.success('字段映射已删除');
    void loadData();
  };

  const columns: ColumnsType<OaMigrationFieldMappingItem> = [
    { title: '映射编号', dataIndex: 'mappingNo', width: 170, fixed: 'left', render: plain },
    { title: '对象编码', dataIndex: 'objectCode', width: 150, render: plain },
    { title: '源字段', dataIndex: 'sourceField', width: 160, render: plain },
    { title: '目标字段', dataIndex: 'targetField', width: 160, render: plain },
    { title: '数据类型', dataIndex: 'dataType', width: 110, render: plain },
    { title: '转换规则', dataIndex: 'transformRule', width: 200, ellipsis: true, render: plain },
    { title: '是否必填', dataIndex: 'requiredFlag', width: 90, render: flagText },
    { title: '状态', dataIndex: 'status', width: 90, render: enableTag },
    {
      title: '操作',
      key: 'action',
      width: 130,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {hasPermission(OBJECT_MANAGE) && (
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
          )}
          {hasPermission(OBJECT_MANAGE) && (
            <Popconfirm title="确认删除该字段映射？" onConfirm={() => void remove(record.id)}>
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
      <Card>
        <Form layout="inline">
          <Form.Item label="对象编码">
            <Select
              placeholder="请选择"
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: 200 }}
              value={objectCode}
              onChange={(v) => setObjectCode(v)}
              options={objects.map((o) => ({ label: o.objectName, value: o.objectCode }))}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="映射编号 / 源字段 / 目标字段"
              allowClear
              style={{ width: 240 }}
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
                  void loadData(1, pageSize, keyword, objectCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setObjectCode(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(OBJECT_MANAGE) && <Button onClick={openCreate}>新增映射</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`字段映射（共 ${total} 条）`}>
        <Table<OaMigrationFieldMappingItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1400 }}
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
        title={editId ? '编辑字段映射' : '新增字段映射'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="mappingNo" label="映射编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item
            name="objectCode"
            label="对象编码"
            rules={[{ required: true, message: '请选择对象编码' }]}
          >
            <Select
              placeholder="请选择"
              showSearch
              optionFilterProp="label"
              options={objects.map((o) => ({ label: o.objectName, value: o.objectCode }))}
            />
          </Form.Item>
          <Form.Item
            name="sourceField"
            label="源字段"
            rules={[{ required: true, message: '请输入源字段' }]}
          >
            <Input placeholder="源系统字段名" />
          </Form.Item>
          <Form.Item
            name="targetField"
            label="目标字段"
            rules={[{ required: true, message: '请输入目标字段' }]}
          >
            <Input placeholder="目标系统字段名" />
          </Form.Item>
          <Form.Item name="dataType" label="数据类型">
            <Input placeholder="如 STRING / NUMBER / DATE" />
          </Form.Item>
          <Form.Item name="enumMapping" label="枚举映射">
            <Input.TextArea rows={2} placeholder="枚举值映射，每行一条" />
          </Form.Item>
          <Form.Item name="valueMapping" label="取值映射">
            <Input.TextArea rows={2} placeholder="取值转换规则，每行一条" />
          </Form.Item>
          <Form.Item name="transformRule" label="转换规则">
            <Input placeholder="如 TRIM / DATE_FORMAT" />
          </Form.Item>
          <Form.Item name="requiredFlag" label="是否必填">
            <Select options={[...BOOLEAN_FORM_OPTIONS]} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={[...OA_ENABLE_STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default function OaMigrationObjectPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        迁移对象与字段映射
      </Title>

      <Tabs
        items={[
          { key: 'object', label: '迁移对象目录', children: <ObjectTab /> },
          { key: 'mapping', label: '字段映射', children: <MappingTab /> },
        ]}
      />
    </Space>
  );
}
