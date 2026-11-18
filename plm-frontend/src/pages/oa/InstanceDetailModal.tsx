import { useEffect, useState } from 'react';
import { Descriptions, Empty, Modal, Space, Table, Tag, Timeline, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { oaFormService, oaInstanceService } from '@/services/oaService';
import {
  OA_INSTANCE_STATUS_COLOR,
  OA_INSTANCE_STATUS_LABEL,
  OA_TASK_ACTION_COLOR,
  OA_TASK_ACTION_LABEL,
  OA_TASK_STATUS_COLOR,
  OA_TASK_STATUS_LABEL,
  type OaInstanceDetail,
  type OaPendingTaskItem,
} from '@/types/oa';

const { Text } = Typography;
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/** 时间线节点颜色仅取 antd 预设值，避免使用未定义的样式类。 */
const TIMELINE_COLOR: Record<string, string> = {
  SUBMIT: 'blue',
  APPROVE: 'green',
  REJECT: 'red',
  CANCEL: 'gray',
  TRANSFER: 'blue',
  CC: 'blue',
  SKIP: 'gray',
};

/** 展示单个填报值：空值占位，对象与数组转为 JSON 文本。 */
const renderValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

/** 解析实例的表单填报数据，非对象结构一律按空处理。 */
const parseFormData = (formDataJson?: string): Record<string, unknown> => {
  if (!formDataJson) return {};
  try {
    const parsed: unknown = JSON.parse(formDataJson);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
};

interface InstanceDetailModalProps {
  open: boolean;
  instanceId?: number;
  onClose: () => void;
}

/** 流程实例详情弹窗：实例信息 + 表单填报数据 + 当前待办 + 审批轨迹。 */
export default function InstanceDetailModal({ open, instanceId, onClose }: InstanceDetailModalProps) {
  const [detail, setDetail] = useState<OaInstanceDetail | null>(null);
  const [fieldLabels, setFieldLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !instanceId) {
      setDetail(null);
      setFieldLabels({});
      return;
    }
    setLoading(true);
    setFieldLabels({});
    void oaInstanceService
      .detail(instanceId)
      .then((res) => {
        setDetail(res);
        const formId = res.instance?.formId;
        if (!formId) return;
        void oaFormService
          .detail(formId)
          .then((formDetail) => {
            const map: Record<string, string> = {};
            (formDetail.fields || []).forEach((f) => {
              map[f.fieldCode] = f.fieldName;
            });
            setFieldLabels(map);
          })
          .catch(() => setFieldLabels({}));
      })
      .finally(() => setLoading(false));
  }, [open, instanceId]);

  const instance = detail?.instance;
  const formData = parseFormData(instance?.formDataJson);
  const formEntries = Object.entries(formData);
  const records = detail?.records || [];
  const pendingTasks = detail?.pendingTasks || [];

  const pendingColumns: ColumnsType<OaPendingTaskItem> = [
    { title: '节点', dataIndex: 'nodeName', width: 160, render: (v, r) => v || r.nodeCode || '-' },
    {
      title: '处理人',
      dataIndex: 'assigneeName',
      width: 140,
      render: (v, r) => v || r.assigneeUserId || '-',
    },
    {
      title: '状态',
      dataIndex: 'taskStatus',
      width: 100,
      render: (v?: string) =>
        v ? <Tag color={OA_TASK_STATUS_COLOR[v]}>{OA_TASK_STATUS_LABEL[v] || v}</Tag> : '-',
    },
    {
      title: '处理时限',
      dataIndex: 'dueAt',
      width: 170,
      render: (v?: string) => (v ? dayjs(v).format(DATETIME_FORMAT) : '-'),
    },
  ];

  return (
    <Modal
      title="流程实例详情"
      open={open}
      onCancel={onClose}
      footer={null}
      loading={loading}
      destroyOnClose
      width={900}
    >
      {instance ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Descriptions bordered size="small" column={2} title="实例信息">
            <Descriptions.Item label="实例编号">{instance.instanceNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="流程名称">{instance.processName || '-'}</Descriptions.Item>
            <Descriptions.Item label="标题" span={2}>
              {instance.title || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="申请人">{instance.applicantName || '-'}</Descriptions.Item>
            <Descriptions.Item label="状态">
              {instance.instanceStatus ? (
                <Tag color={OA_INSTANCE_STATUS_COLOR[instance.instanceStatus]}>
                  {OA_INSTANCE_STATUS_LABEL[instance.instanceStatus] || instance.instanceStatus}
                </Tag>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="当前节点">{instance.currentNodeCode || '-'}</Descriptions.Item>
            <Descriptions.Item label="提交时间">
              {instance.submittedAt ? dayjs(instance.submittedAt).format(DATETIME_FORMAT) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="结束时间">
              {instance.finishedAt ? dayjs(instance.finishedAt).format(DATETIME_FORMAT) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {instance.remark || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Descriptions bordered size="small" column={2} title="表单填报数据">
            {formEntries.length ? (
              formEntries.map(([key, value]) => (
                <Descriptions.Item key={key} label={fieldLabels[key] || key}>
                  {renderValue(value)}
                </Descriptions.Item>
              ))
            ) : (
              <Descriptions.Item label="填报数据">-</Descriptions.Item>
            )}
          </Descriptions>

          <div>
            <Text strong>当前待办任务</Text>
            <Table<OaPendingTaskItem>
              rowKey="id"
              style={{ marginTop: 8 }}
              size="small"
              columns={pendingColumns}
              dataSource={pendingTasks}
              pagination={false}
              locale={{ emptyText: '暂无待办任务' }}
            />
          </div>

          <div>
            <Text strong>审批轨迹</Text>
            <div style={{ marginTop: 12 }}>
              {records.length ? (
                <Timeline
                  items={records.map((r) => ({
                    color: TIMELINE_COLOR[r.action || ''] || 'gray',
                    children: (
                      <div>
                        <Space size="small" wrap>
                          <Text strong>{r.operatorName || r.operatorUserId || '-'}</Text>
                          <Tag color={OA_TASK_ACTION_COLOR[r.action || ''] || 'default'}>
                            {OA_TASK_ACTION_LABEL[r.action || ''] || r.action || '-'}
                          </Tag>
                          <Text type="secondary">{r.nodeName || r.nodeCode || '-'}</Text>
                        </Space>
                        {r.commentText ? (
                          <div style={{ marginTop: 4 }}>意见：{r.commentText}</div>
                        ) : null}
                        <div>
                          <Text type="secondary">
                            {r.operatedAt ? dayjs(r.operatedAt).format(DATETIME_FORMAT) : ''}
                          </Text>
                        </div>
                      </div>
                    ),
                  }))}
                />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无审批轨迹" />
              )}
            </div>
          </div>
        </Space>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
      )}
    </Modal>
  );
}
