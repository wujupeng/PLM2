import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
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
import { srmEightDReportService as service } from '@/services/srmQualityService';
import { useAuthStore } from '@/stores/authStore';
import { DATE_FORMAT, formatDate, formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  SRM_EIGHTD_STATUS_LABEL,
  SRM_EIGHTD_STATUS_OPTIONS,
  type SrmEightDReport,
  type SrmEightDReportQuery,
  type SrmEightDReportSaveRequest,
} from '@/types/srmQuality';

const { Title } = Typography;

const MANAGE = 'srm:quality:eightd:manage';

type FormValues = Omit<SrmEightDReportSaveRequest, 'issueDate' | 'closeDate'> & {
  issueDate?: Dayjs;
  closeDate?: Dayjs;
};

export default function SrmEightDReportPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<SrmEightDReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [eightdStatus, setEightdStatus] = useState<string | undefined>(undefined);
  const [materialCode, setMaterialCode] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, kw = keyword, status = eightdStatus, mat = materialCode) => {
      setLoading(true);
      try {
        const params: SrmEightDReportQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          eightdStatus: status,
          materialCode: mat,
        };
        const res = await service.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, eightdStatus, materialCode],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', undefined, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ eightdStatus: 'DRAFT' });
    setOpen(true);
  };

  const openEdit = (record: SrmEightDReport) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      issueDate: record.issueDate ? dayjs(record.issueDate) : undefined,
      closeDate: record.closeDate ? dayjs(record.closeDate) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: SrmEightDReportSaveRequest = {
        ...values,
        issueDate: values.issueDate ? values.issueDate.format(DATE_FORMAT) : undefined,
        closeDate: values.closeDate ? values.closeDate.format(DATE_FORMAT) : undefined,
      };
      if (editId == null) {
        await service.create(payload);
        message.success('8D报告已创建');
      } else {
        await service.update(editId, payload);
        message.success('8D报告已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await service.remove(id);
    message.success('8D报告已删除');
    void loadData();
  };

  const columns: ColumnsType<SrmEightDReport> = [
    { title: '8D编号', dataIndex: 'eightdNo', width: 170, fixed: 'left', render: plain },
    { title: '供应商编码', dataIndex: 'supplierCode', width: 150, render: plain },
    { title: '供应商名称', dataIndex: 'supplierName', width: 160, render: plain },
    { title: '物料编码', dataIndex: 'materialCode', width: 150, render: plain },
    { title: '物料名称', dataIndex: 'materialName', width: 160, render: plain },
    { title: '规格型号', dataIndex: 'spec', width: 150, render: plain },
    { title: '问题来源', dataIndex: 'problemSource', width: 130, render: plain },
    { title: '问题描述', dataIndex: 'problemDesc', width: 200, render: plain },
    { title: 'D1小组成员', dataIndex: 'd1Team', width: 160, render: plain },
    { title: 'D2问题说明', dataIndex: 'd2Problem', width: 160, render: plain },
    { title: 'D3临时遏制', dataIndex: 'd3Containment', width: 160, render: plain },
    { title: 'D4根本原因', dataIndex: 'd4RootCause', width: 160, render: plain },
    { title: 'D5永久纠正', dataIndex: 'd5Corrective', width: 160, render: plain },
    { title: 'D6措施实施', dataIndex: 'd6Implement', width: 160, render: plain },
    { title: 'D7预防再发', dataIndex: 'd7Prevent', width: 160, render: plain },
    { title: 'D8团队祝贺', dataIndex: 'd8Congratulate', width: 160, render: plain },
    { title: '发生日期', dataIndex: 'issueDate', width: 120, render: formatDate },
    { title: '关闭日期', dataIndex: 'closeDate', width: 120, render: formatDate },
    { title: '负责人', dataIndex: 'owner', width: 100, render: plain },
    {
      title: '报告状态',
      dataIndex: 'eightdStatus',
      width: 110,
      fixed: 'right',
      render: (v) => statusTag(SRM_EIGHTD_STATUS_LABEL, v),
    },
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
            <Popconfirm title="确认删除该8D报告？" onConfirm={() => record.id != null && void remove(record.id)}>
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
        8D报告
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="报告状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 130 }}
              value={eightdStatus}
              onChange={(v) => setEightdStatus(v)}
              options={[...SRM_EIGHTD_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="物料编码">
            <Input
              placeholder="请输入物料编码"
              allowClear
              style={{ width: 200 }}
              value={materialCode}
              onChange={(e) => setMaterialCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="8D编号 / 供应商编码 / 供应商名称 / 问题来源"
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
                  void loadData(1, pageSize, keyword, eightdStatus, materialCode);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setEightdStatus(undefined);
                  setMaterialCode('');
                  setPageNum(1);
                  void loadData(1, pageSize, '', undefined, '');
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建8D报告</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`8D报告（共 ${total} 条）`}>
        <Table<SrmEightDReport>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 3600 }}
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
        title={editId == null ? '新建8D报告' : '编辑8D报告'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={820}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="eightdNo" label="8D编号">
            <Input placeholder="为空自动生成" />
          </Form.Item>
          <Form.Item name="supplierCode" label="供应商编码">
            <Input placeholder="请输入供应商编码" />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商名称">
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入物料编码" />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item name="spec" label="规格型号">
            <Input placeholder="请输入规格型号" />
          </Form.Item>
          <Form.Item name="problemSource" label="问题来源">
            <Input placeholder="请输入问题来源" />
          </Form.Item>
          <Form.Item name="problemDesc" label="问题描述">
            <Input.TextArea rows={3} placeholder="请输入问题描述" />
          </Form.Item>
          <Form.Item name="d1Team" label="D1 小组成员">
            <Input.TextArea rows={2} placeholder="请输入D1 小组成员" />
          </Form.Item>
          <Form.Item name="d2Problem" label="D2 问题说明">
            <Input.TextArea rows={2} placeholder="请输入D2 问题说明" />
          </Form.Item>
          <Form.Item name="d3Containment" label="D3 临时遏制措施">
            <Input.TextArea rows={2} placeholder="请输入D3 临时遏制措施" />
          </Form.Item>
          <Form.Item name="d4RootCause" label="D4 根本原因">
            <Input.TextArea rows={2} placeholder="请输入D4 根本原因" />
          </Form.Item>
          <Form.Item name="d5Corrective" label="D5 永久纠正措施">
            <Input.TextArea rows={2} placeholder="请输入D5 永久纠正措施" />
          </Form.Item>
          <Form.Item name="d6Implement" label="D6 措施实施">
            <Input.TextArea rows={2} placeholder="请输入D6 措施实施" />
          </Form.Item>
          <Form.Item name="d7Prevent" label="D7 预防再发">
            <Input.TextArea rows={2} placeholder="请输入D7 预防再发" />
          </Form.Item>
          <Form.Item name="d8Congratulate" label="D8 团队祝贺">
            <Input.TextArea rows={2} placeholder="请输入D8 团队祝贺" />
          </Form.Item>
          <Form.Item name="issueDate" label="发生日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="closeDate" label="关闭日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="owner" label="负责人">
            <Input placeholder="请输入负责人" />
          </Form.Item>
          <Form.Item name="eightdStatus" label="报告状态">
            <Select placeholder="为空默认 DRAFT" options={[...SRM_EIGHTD_STATUS_OPTIONS]} />
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
