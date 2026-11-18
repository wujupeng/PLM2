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
import { sceneService } from '@/services/mobileService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { boolTag, statusTag } from '@/pages/platform/mobile/shared';
import {
  SCAN_TYPE_LABEL,
  SCAN_TYPE_OPTIONS,
  SCENE_STATUS_LABEL,
  SCENE_STATUS_OPTIONS,
  type MobileSceneItem,
  type MobileSceneSaveParams,
} from '@/types/mobile';

const { Title } = Typography;

const SCENE_MANAGE = 'platform:mobile:scene:manage';

const REQUIRE_OFFLINE_OPTIONS = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
];

export default function MobileScenePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<MobileSceneSaveParams>();
  const [data, setData] = useState<MobileSceneItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [scanType, setScanType] = useState<string | undefined>(undefined);
  const [sceneStatus, setSceneStatus] = useState<string | undefined>(undefined);
  const [bizModule, setBizModule] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      sType = scanType,
      sStatus = sceneStatus,
      bModule = bizModule,
    ) => {
      setLoading(true);
      try {
        const res = await sceneService.page({
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          scanType: sType,
          sceneStatus: sStatus,
          bizModule: bModule || undefined,
        });
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, scanType, sceneStatus, bizModule],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ scanType: 'RECEIVE', sceneStatus: 'ACTIVE', requireOffline: 0, sortNo: 0 });
    setOpen(true);
  };

  const openEdit = (record: MobileSceneItem) => {
    setEditId(record.id);
    form.setFieldsValue({ ...record });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: MobileSceneSaveParams = { ...values };
      if (editId == null) {
        await sceneService.create(payload);
        message.success('移动场景已创建');
      } else {
        await sceneService.update(editId, payload);
        message.success('移动场景已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await sceneService.remove(id);
    message.success('移动场景已删除');
    void loadData();
  };

  const columns: ColumnsType<MobileSceneItem> = [
    { title: '场景编号', dataIndex: 'sceneNo', width: 160, fixed: 'left', render: plain },
    { title: '场景编码', dataIndex: 'sceneCode', width: 160, render: plain },
    { title: '场景名称', dataIndex: 'sceneName', width: 180, render: plain },
    { title: '扫码类型', dataIndex: 'scanType', width: 120, render: (v) => statusTag(SCAN_TYPE_LABEL, v) },
    { title: '业务模块', dataIndex: 'bizModule', width: 140, render: plain },
    { title: '需离线', dataIndex: 'requireOffline', width: 90, render: boolTag },
    { title: '排序号', dataIndex: 'sortNo', width: 90, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '描述', dataIndex: 'description', width: 180, ellipsis: true, render: plain },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 160, render: formatDateTime },
    {
      title: '状态',
      dataIndex: 'sceneStatus',
      width: 100,
      fixed: 'right',
      render: (v) => statusTag(SCENE_STATUS_LABEL, v),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) =>
        hasPermission(SCENE_MANAGE) && (
          <Space size="small" wrap>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除该移动场景？" onConfirm={() => void remove(record.id)}>
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
        移动场景
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="扫码类型">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={scanType}
              onChange={(v) => setScanType(v)}
              options={[...SCAN_TYPE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="场景状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 140 }}
              value={sceneStatus}
              onChange={(v) => setSceneStatus(v)}
              options={[...SCENE_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="业务模块">
            <Input
              placeholder="请输入业务模块"
              allowClear
              style={{ width: 160 }}
              value={bizModule}
              onChange={(e) => setBizModule(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="场景编码 / 名称"
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
                  void loadData(1, pageSize, keyword, scanType, sceneStatus, bizModule);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setScanType(undefined);
                  setSceneStatus(undefined);
                  setBizModule('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(SCENE_MANAGE) && <Button onClick={openCreate}>新建移动场景</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`移动场景（共 ${total} 条）`}>
        <Table<MobileSceneItem>
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
        title={editId == null ? '新建移动场景' : '编辑移动场景'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={680}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="sceneNo" label="场景编号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="sceneCode" label="场景编码" rules={[{ required: true, message: '请输入场景编码' }]}>
            <Input placeholder="请输入场景编码" />
          </Form.Item>
          <Form.Item name="sceneName" label="场景名称" rules={[{ required: true, message: '请输入场景名称' }]}>
            <Input placeholder="请输入场景名称" />
          </Form.Item>
          <Form.Item name="scanType" label="扫码类型">
            <Select placeholder="请选择" options={[...SCAN_TYPE_OPTIONS]} />
          </Form.Item>
          <Form.Item name="bizModule" label="业务模块">
            <Input placeholder="请输入业务模块" />
          </Form.Item>
          <Form.Item name="requireOffline" label="需离线">
            <Select placeholder="请选择" options={REQUIRE_OFFLINE_OPTIONS} />
          </Form.Item>
          <Form.Item name="sortNo" label="排序号">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入排序号" />
          </Form.Item>
          <Form.Item name="sceneStatus" label="场景状态">
            <Select placeholder="请选择" options={[...SCENE_STATUS_OPTIONS]} />
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
