import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
  message,
} from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { oaFactoryParamService, oaI18nService } from '@/services/oaService';
import { useAuthStore } from '@/stores/authStore';
import { plain } from '@/pages/oa/biz/BizFlowTab';
import type { PageResult } from '@/types/common';
import {
  type OaBizFlowItem,
  type OaBizFlowQuery,
  type OaFactoryParamSaveParams,
  type OaI18nLocaleSaveParams,
  type OaI18nMessageSaveParams,
} from '@/types/oa';

const { Title } = Typography;

const I18N_MANAGE = 'oa:i18n:manage';

const STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '停用', value: 0 },
] as const;

/* ---------------- 通用无流程配置表（列表 + 新增/编辑 + 删除） ---------------- */

interface ConfigCrudTabProps<P, V> {
  title: string;
  columns: ColumnsType<OaBizFlowItem>;
  loadPage: (params: OaBizFlowQuery) => Promise<PageResult<OaBizFlowItem>>;
  create: (data: P) => Promise<number>;
  update: (id: number, data: P) => Promise<void>;
  remove: (id: number) => Promise<void>;
  renderFields: () => React.ReactNode;
  buildEditValues: (record: OaBizFlowItem) => V;
  buildPayload: (values: V) => P;
  initialValues?: Partial<V>;
  keywordPlaceholder?: string;
  typeFilter?: { label: string; options: readonly { label: string; value: string }[] };
}

function ConfigCrudTab<P, V extends object>({
  title,
  columns,
  loadPage,
  create,
  update,
  remove,
  renderFields,
  buildEditValues,
  buildPayload,
  initialValues,
  keywordPlaceholder,
  typeFilter,
}: ConfigCrudTabProps<P, V>) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<V>();

  const [data, setData] = useState<OaBizFlowItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<{ keyword?: string; typeCode?: string }>({});

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OaBizFlowItem | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const res = await loadPage({
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          typeCode: cond.typeCode || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [loadPage, pageNum, pageSize, search],
  );

  useEffect(() => {
    void loadData(1, pageSize, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue(initialValues as Parameters<typeof form.setFieldsValue>[0]);
    setOpen(true);
  };

  const openEdit = (record: OaBizFlowItem) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue(buildEditValues(record) as Parameters<typeof form.setFieldsValue>[0]);
    setOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const payload = buildPayload(values);
    setSaving(true);
    try {
      if (editing) {
        await update(editing.id, payload);
      } else {
        await create(payload);
      }
      message.success('保存成功');
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record: OaBizFlowItem) => {
    await remove(record.id);
    message.success('删除成功');
    void loadData();
  };

  const actionColumns: ColumnsType<OaBizFlowItem> = [
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(I18N_MANAGE) && (
          <Space size="small">
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该记录？" onConfirm={() => void handleDelete(record)}>
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
      <Card>
        <Form
          layout="inline"
          onFinish={(values: { keyword?: string; typeCode?: string }) => {
            setSearch({ ...values });
            setPageNum(1);
            void loadData(1, pageSize, values);
          }}
        >
          {typeFilter && (
            <Form.Item name="typeCode" label={typeFilter.label}>
              <Select placeholder="请选择" allowClear style={{ width: 160 }} options={[...typeFilter.options]} />
            </Form.Item>
          )}
          <Form.Item name="keyword" label="关键字">
            <Input placeholder={keywordPlaceholder || '关键字'} allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item>
            <Space wrap>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearch({});
                  setPageNum(1);
                  void loadData(1, pageSize, {});
                }}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`${title}（共 ${total} 条）`}
        extra={
          hasPermission(I18N_MANAGE) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增{title}
            </Button>
          )
        }
      >
        <Table<OaBizFlowItem>
          rowKey="id"
          loading={loading}
          columns={[...columns, ...actionColumns]}
          dataSource={data}
          scroll={{ x: 1200 }}
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
        title={editing ? `编辑${title}` : `新增${title}`}
        open={open}
        onOk={() => void handleSave()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          {renderFields()}
        </Form>
      </Modal>
    </Space>
  );
}

/* ---------------- 1. 语言区域 ---------------- */

interface LocaleFormValues {
  localeCode?: string;
  localeName?: string;
  languageCode?: string;
  countryCode?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  numberFormat?: string;
  currencyCode?: string;
  isDefault?: boolean;
  status?: number;
  remark?: string;
}

function LocaleTab() {
  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '区域代码', dataIndex: 'localeCode', width: 120, fixed: 'left', render: plain },
    { title: '区域名称', dataIndex: 'localeName', width: 140, render: plain },
    { title: '语言代码', dataIndex: 'languageCode', width: 100, render: plain },
    { title: '国家代码', dataIndex: 'countryCode', width: 100, render: plain },
    { title: '时区', dataIndex: 'timezone', width: 140, render: plain },
    { title: '日期格式', dataIndex: 'dateFormat', width: 120, render: plain },
    { title: '时间格式', dataIndex: 'timeFormat', width: 110, render: plain },
    { title: '数字格式', dataIndex: 'numberFormat', width: 110, render: plain },
    { title: '币种', dataIndex: 'currencyCode', width: 90, render: plain },
    { title: '默认', dataIndex: 'isDefault', width: 80, render: (v) => (Number(v) === 1 ? '是' : '否') },
    { title: '状态', dataIndex: 'status', width: 90, render: (v) => (Number(v) === 1 ? '启用' : '停用') },
    { title: '备注', dataIndex: 'remark', render: plain },
  ];

  return (
    <ConfigCrudTab<OaI18nLocaleSaveParams, LocaleFormValues>
      title="语言区域"
      columns={columns}
      loadPage={oaI18nService.pageLocales}
      create={oaI18nService.createLocale}
      update={oaI18nService.updateLocale}
      remove={oaI18nService.removeLocale}
      keywordPlaceholder="区域代码 / 名称"
      initialValues={{ status: 1, isDefault: false, timezone: 'Asia/Shanghai', currencyCode: 'CNY' }}
      renderFields={() => (
        <>
          <Form.Item name="localeCode" label="区域代码" rules={[{ required: true, message: '请输入区域代码' }]}>
            <Input placeholder="如 zh-CN" />
          </Form.Item>
          <Form.Item name="localeName" label="区域名称">
            <Input placeholder="如 简体中文（中国）" />
          </Form.Item>
          <Form.Item name="languageCode" label="语言代码">
            <Input placeholder="如 zh" />
          </Form.Item>
          <Form.Item name="countryCode" label="国家代码">
            <Input placeholder="如 CN" />
          </Form.Item>
          <Form.Item name="timezone" label="时区">
            <Input placeholder="如 Asia/Shanghai" />
          </Form.Item>
          <Form.Item name="dateFormat" label="日期格式">
            <Input placeholder="如 YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="timeFormat" label="时间格式">
            <Input placeholder="如 HH:mm:ss" />
          </Form.Item>
          <Form.Item name="numberFormat" label="数字格式">
            <Input placeholder="如 #,##0.00" />
          </Form.Item>
          <Form.Item name="currencyCode" label="币种">
            <Input placeholder="如 CNY" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={[...STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="isDefault" label="默认区域" valuePropName="checked">
            <Checkbox>设为默认区域</Checkbox>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        localeCode: r.localeCode,
        localeName: r.localeName,
        languageCode: r.languageCode,
        countryCode: r.countryCode,
        timezone: r.timezone,
        dateFormat: r.dateFormat,
        timeFormat: r.timeFormat,
        numberFormat: r.numberFormat,
        currencyCode: r.currencyCode,
        isDefault: Number(r.isDefault) === 1,
        status: r.status,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        localeCode: v.localeCode,
        localeName: v.localeName,
        languageCode: v.languageCode,
        countryCode: v.countryCode,
        timezone: v.timezone,
        dateFormat: v.dateFormat,
        timeFormat: v.timeFormat,
        numberFormat: v.numberFormat,
        currencyCode: v.currencyCode,
        isDefault: v.isDefault,
        status: v.status,
        remark: v.remark,
      })}
    />
  );
}

/* ---------------- 2. 语言包 ---------------- */

interface MessageFormValues {
  localeCode?: string;
  messageKey?: string;
  messageValue?: string;
  module?: string;
  remark?: string;
}

function MessageTab() {
  const [localeOptions, setLocaleOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await oaI18nService.listEnabledLocales();
      setLocaleOptions(
        (res || []).map((l) => ({
          label: l.localeName ? `${l.localeName}（${l.localeCode}）` : String(l.localeCode),
          value: String(l.localeCode),
        })),
      );
    })();
  }, []);

  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '区域代码', dataIndex: 'localeCode', width: 130, fixed: 'left', render: plain },
    { title: '消息键', dataIndex: 'messageKey', width: 220, render: plain },
    { title: '消息内容', dataIndex: 'messageValue', width: 280, render: plain },
    { title: '模块', dataIndex: 'module', width: 140, render: plain },
    { title: '备注', dataIndex: 'remark', render: plain },
  ];

  return (
    <ConfigCrudTab<OaI18nMessageSaveParams, MessageFormValues>
      title="语言包"
      columns={columns}
      loadPage={oaI18nService.pageMessages}
      create={oaI18nService.createMessage}
      update={oaI18nService.updateMessage}
      remove={oaI18nService.removeMessage}
      keywordPlaceholder="消息键 / 内容"
      typeFilter={{ label: '区域', options: localeOptions }}
      renderFields={() => (
        <>
          <Form.Item name="localeCode" label="区域代码" rules={[{ required: true, message: '请选择区域' }]}>
            <Select placeholder="请选择区域" showSearch optionFilterProp="label" options={localeOptions} />
          </Form.Item>
          <Form.Item name="messageKey" label="消息键" rules={[{ required: true, message: '请输入消息键' }]}>
            <Input placeholder="如 oa.asset.repair.title" />
          </Form.Item>
          <Form.Item name="messageValue" label="消息内容">
            <Input.TextArea rows={2} placeholder="请输入消息内容" />
          </Form.Item>
          <Form.Item name="module" label="模块">
            <Input placeholder="请输入模块" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        localeCode: r.localeCode,
        messageKey: r.messageKey,
        messageValue: r.messageValue,
        module: r.module,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        localeCode: v.localeCode,
        messageKey: v.messageKey,
        messageValue: v.messageValue,
        module: v.module,
        remark: v.remark,
      })}
    />
  );
}

/* ---------------- 3. 工厂参数 ---------------- */

interface FactoryParamFormValues {
  factoryCode?: string;
  factoryName?: string;
  countryCode?: string;
  timezone?: string;
  localeCode?: string;
  paramKey?: string;
  paramValue?: string;
  status?: number;
  remark?: string;
}

function FactoryParamTab() {
  const columns: ColumnsType<OaBizFlowItem> = [
    { title: '工厂编码', dataIndex: 'factoryCode', width: 130, fixed: 'left', render: plain },
    { title: '工厂名称', dataIndex: 'factoryName', width: 160, render: plain },
    { title: '国家代码', dataIndex: 'countryCode', width: 100, render: plain },
    { title: '时区', dataIndex: 'timezone', width: 140, render: plain },
    { title: '区域代码', dataIndex: 'localeCode', width: 120, render: plain },
    { title: '参数键', dataIndex: 'paramKey', width: 200, render: plain },
    { title: '参数值', dataIndex: 'paramValue', width: 200, render: plain },
    { title: '状态', dataIndex: 'status', width: 90, render: (v) => (Number(v) === 1 ? '启用' : '停用') },
    { title: '备注', dataIndex: 'remark', render: plain },
  ];

  return (
    <ConfigCrudTab<OaFactoryParamSaveParams, FactoryParamFormValues>
      title="工厂参数"
      columns={columns}
      loadPage={oaFactoryParamService.page}
      create={oaFactoryParamService.create}
      update={oaFactoryParamService.update}
      remove={oaFactoryParamService.remove}
      keywordPlaceholder="工厂 / 参数键"
      initialValues={{ status: 1, timezone: 'Asia/Shanghai', localeCode: 'zh-CN' }}
      renderFields={() => (
        <>
          <Form.Item name="factoryCode" label="工厂编码" rules={[{ required: true, message: '请输入工厂编码' }]}>
            <Input placeholder="如 CN-SZ" />
          </Form.Item>
          <Form.Item name="factoryName" label="工厂名称">
            <Input placeholder="请输入工厂名称" />
          </Form.Item>
          <Form.Item name="countryCode" label="国家代码">
            <Input placeholder="如 CN" />
          </Form.Item>
          <Form.Item name="timezone" label="时区">
            <Input placeholder="如 Asia/Shanghai" />
          </Form.Item>
          <Form.Item name="localeCode" label="区域代码">
            <Input placeholder="如 zh-CN" />
          </Form.Item>
          <Form.Item name="paramKey" label="参数键" rules={[{ required: true, message: '请输入参数键' }]}>
            <Input placeholder="如 oa.factory.work.hours" />
          </Form.Item>
          <Form.Item name="paramValue" label="参数值">
            <Input placeholder="请输入参数值" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" options={[...STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </>
      )}
      buildEditValues={(r) => ({
        factoryCode: r.factoryCode,
        factoryName: r.factoryName,
        countryCode: r.countryCode,
        timezone: r.timezone,
        localeCode: r.localeCode,
        paramKey: r.paramKey,
        paramValue: r.paramValue,
        status: r.status,
        remark: r.remark,
      })}
      buildPayload={(v) => ({
        factoryCode: v.factoryCode,
        factoryName: v.factoryName,
        countryCode: v.countryCode,
        timezone: v.timezone,
        localeCode: v.localeCode,
        paramKey: v.paramKey,
        paramValue: v.paramValue,
        status: v.status,
        remark: v.remark,
      })}
    />
  );
}

export default function OaI18nPage() {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        国际化与多工厂
      </Title>

      <Tabs
        items={[
          { key: 'locales', label: '语言区域', children: <LocaleTab /> },
          { key: 'messages', label: '语言包', children: <MessageTab /> },
          { key: 'factory-params', label: '工厂参数', children: <FactoryParamTab /> },
        ]}
      />
    </Space>
  );
}
