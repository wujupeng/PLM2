import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Form, Input, Space, Table, Tag, TreeSelect, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { oaAddressBookService } from '@/services/oaService';
import { organizationService } from '@/services/systemService';
import type { Organization } from '@/types/system';
import {
  OA_EMPLOYMENT_STATUS_COLOR,
  OA_EMPLOYMENT_STATUS_LABEL,
  OA_EMPLOYMENT_TYPE_LABEL,
  type OaAddressBookItem,
  type OaAddressBookQuery,
} from '@/types/oa';

const { Title } = Typography;

interface AddressBookSearchState {
  keyword?: string;
  orgId?: number;
}

export default function OaAddressBookPage() {
  const [form] = Form.useForm<AddressBookSearchState>();

  const [data, setData] = useState<OaAddressBookItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<AddressBookSearchState>({});
  const [orgTree, setOrgTree] = useState<Organization[]>([]);

  const loadData = useCallback(
    async (page = pageNum, size = pageSize, cond = search) => {
      setLoading(true);
      try {
        const params: OaAddressBookQuery = {
          pageNum: page,
          pageSize: size,
          keyword: cond.keyword || undefined,
          orgId: cond.orgId,
        };
        const res = await oaAddressBookService.page(params);
        setData(res.list || []);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [pageNum, pageSize, search],
  );

  const loadOrgTree = useCallback(async () => {
    const tree = await organizationService.tree();
    setOrgTree(tree || []);
  }, []);

  useEffect(() => {
    void loadData(1, pageSize, {});
    void loadOrgTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (values: AddressBookSearchState) => {
    const cond = { ...values };
    setSearch(cond);
    setPageNum(1);
    void loadData(1, pageSize, cond);
  };

  const onReset = () => {
    form.resetFields();
    setSearch({});
    setPageNum(1);
    void loadData(1, pageSize, {});
  };

  const columns: ColumnsType<OaAddressBookItem> = [
    { title: '姓名', dataIndex: 'displayName', width: 130, fixed: 'left', render: (v) => v || '-' },
    { title: '工号', dataIndex: 'employeeNo', width: 130, render: (v) => v || '-' },
    { title: '账号', dataIndex: 'username', width: 130, render: (v) => v || '-' },
    { title: '组织', dataIndex: 'orgName', width: 180, render: (v) => v || '-' },
    { title: '岗位', dataIndex: 'positionName', width: 150, render: (v) => v || '-' },
    {
      title: '用工性质',
      dataIndex: 'employmentType',
      width: 110,
      render: (v?: string) => (v ? OA_EMPLOYMENT_TYPE_LABEL[v] || v : '-'),
    },
    {
      title: '在职状态',
      dataIndex: 'employmentStatus',
      width: 110,
      render: (v?: string) =>
        v ? (
          <Tag color={OA_EMPLOYMENT_STATUS_COLOR[v]}>{OA_EMPLOYMENT_STATUS_LABEL[v] || v}</Tag>
        ) : (
          '-'
        ),
    },
    { title: '邮箱', dataIndex: 'email', width: 200, render: (v) => v || '-' },
    { title: '电话', dataIndex: 'phone', width: 150, render: (v) => v || '-' },
    { title: '直属上级', dataIndex: 'managerName', width: 130, render: (v) => v || '-' },
    { title: '工作地点', dataIndex: 'workLocation', width: 140, render: (v) => v || '-' },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        通讯录
      </Title>

      <Card>
        <Form form={form} layout="inline" onFinish={onSearch}>
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="姓名 / 工号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="orgId" label="所属组织">
            <TreeSelect
              placeholder="请选择"
              allowClear
              style={{ width: 220 }}
              treeData={orgTree}
              fieldNames={{ label: 'orgName', value: 'orgId', children: 'children' }}
              treeDefaultExpandAll
            />
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

      <Card title={`通讯录（共 ${total} 条）`}>
        <Table<OaAddressBookItem>
          rowKey="userId"
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
    </Space>
  );
}
