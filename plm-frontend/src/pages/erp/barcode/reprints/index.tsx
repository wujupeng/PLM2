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
import { erpBarcodeReprintService } from '@/services/erpBarcodeService';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, plain } from '@/pages/oa/biz/BizFlowTab';
import { statusTag } from '@/pages/platform/approval/shared';
import {
  ERP_BARCODE_REPRINT_APPROVAL_STATUS_LABEL,
  ERP_BARCODE_REPRINT_APPROVAL_STATUS_OPTIONS,
  type ErpBarcodeReprint,
  type ErpBarcodeReprintQuery,
  type ErpBarcodeReprintSaveRequest,
} from '@/types/erpBarcode';

const { Title } = Typography;

const MANAGE = 'erp:barcode:reprint:manage';

/** 日期时间提交格式。 */
const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

type FormValues = Omit<ErpBarcodeReprintSaveRequest, 'reprintTime'> & {
  reprintTime?: Dayjs;
};

export default function ErpBarcodeReprintPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [form] = Form.useForm<FormValues>();
  const [data, setData] = useState<ErpBarcodeReprint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [barcodeNo, setBarcodeNo] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<string | undefined>(undefined);
  const [editId, setEditId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(
    async (
      page = pageNum,
      size = pageSize,
      kw = keyword,
      barcode = barcodeNo,
      status = approvalStatus,
    ) => {
      setLoading(true);
      try {
        const params: ErpBarcodeReprintQuery = {
          pageNum: page,
          pageSize: size,
          keyword: kw || undefined,
          barcodeNo: barcode || undefined,
          approvalStatus: status,
        };
        const res = await erpBarcodeReprintService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, keyword, barcodeNo, approvalStatus],
  );

  useEffect(() => {
    void loadData(1, pageSize, '', '', undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    form.resetFields();
    form.setFieldsValue({ reprintCount: 1, approvalStatus: 'NONE' });
    setOpen(true);
  };

  const openEdit = (record: ErpBarcodeReprint) => {
    setEditId(record.id ?? null);
    form.setFieldsValue({
      ...record,
      reprintTime: record.reprintTime ? dayjs(record.reprintTime) : undefined,
    });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: ErpBarcodeReprintSaveRequest = {
        ...values,
        reprintTime: values.reprintTime ? values.reprintTime.format(DATETIME_FORMAT) : undefined,
      };
      if (editId == null) {
        await erpBarcodeReprintService.create(payload);
        message.success('补打记录已创建');
      } else {
        await erpBarcodeReprintService.update(editId, payload);
        message.success('补打记录已更新');
      }
      setOpen(false);
      void loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await erpBarcodeReprintService.remove(id);
    message.success('补打记录已删除');
    void loadData();
  };

  const columns: ColumnsType<ErpBarcodeReprint> = [
    { title: '补打单号', dataIndex: 'reprintNo', width: 170, fixed: 'left', render: plain },
    { title: '条码编号', dataIndex: 'barcodeNo', width: 150, render: plain },
    { title: '补打原因', dataIndex: 'reprintReason', width: 180, ellipsis: true, render: plain },
    { title: '补打次数', dataIndex: 'reprintCount', width: 110, render: plain },
    { title: '补打时间', dataIndex: 'reprintTime', width: 170, render: formatDateTime },
    { title: '操作人', dataIndex: 'operatorName', width: 120, render: plain },
    { title: '组织名称', dataIndex: 'orgName', width: 140, render: plain },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: formatDateTime },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      width: 120,
      fixed: 'right',
      render: (v) => statusTag(ERP_BARCODE_REPRINT_APPROVAL_STATUS_LABEL, v),
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
              title="确认删除该补打记录？"
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
        补打记录
      </Title>

      <Card>
        <Form layout="inline">
          <Form.Item label="条码编号">
            <Input
              placeholder="条码编号"
              allowClear
              style={{ width: 160 }}
              value={barcodeNo}
              onChange={(e) => setBarcodeNo(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="审批状态">
            <Select
              placeholder="请选择"
              allowClear
              style={{ width: 120 }}
              value={approvalStatus}
              onChange={(v) => setApprovalStatus(v)}
              options={[...ERP_BARCODE_REPRINT_APPROVAL_STATUS_OPTIONS]}
            />
          </Form.Item>
          <Form.Item label="关键字">
            <Input
              placeholder="补打单号 / 条码编号 / 操作人"
              allowClear
              style={{ width: 260 }}
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
                  void loadData(1, pageSize, keyword, barcodeNo, approvalStatus);
                }}
              >
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setKeyword('');
                  setBarcodeNo('');
                  setApprovalStatus(undefined);
                  setPageNum(1);
                  void loadData(1, pageSize, '', '', undefined);
                }}
              >
                重置
              </Button>
              {hasPermission(MANAGE) && <Button onClick={openCreate}>新建补打记录</Button>}
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title={`补打记录（共 ${total} 条）`}>
        <Table<ErpBarcodeReprint>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1600 }}
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
        title={editId == null ? '新建补打记录' : '编辑补打记录'}
        open={open}
        onOk={() => void submit()}
        confirmLoading={saving}
        onCancel={() => setOpen(false)}
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="reprintNo" label="补打单号">
            <Input placeholder="留空自动生成" />
          </Form.Item>
          <Form.Item name="barcodeNo" label="条码编号">
            <Input placeholder="请输入条码编号" />
          </Form.Item>
          <Form.Item name="reprintReason" label="补打原因">
            <Input.TextArea rows={2} placeholder="请输入补打原因" />
          </Form.Item>
          <Form.Item name="reprintCount" label="补打次数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入补打次数" />
          </Form.Item>
          <Form.Item name="reprintTime" label="补打时间">
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择补打时间" />
          </Form.Item>
          <Form.Item name="operatorName" label="操作人">
            <Input placeholder="请输入操作人" />
          </Form.Item>
          <Form.Item name="approvalStatus" label="审批状态">
            <Select
              placeholder="为空默认 NONE"
              options={[...ERP_BARCODE_REPRINT_APPROVAL_STATUS_OPTIONS]}
            />
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
