import { useCallback, useEffect, useState } from 'react';
import { Button, Empty, Input, Modal, Segmented, Space, Spin, Tag, message } from 'antd';
import dayjs from 'dayjs';
import { oaTaskService } from '@/services/oaService';
import {
  OA_TASK_ACTION_COLOR,
  OA_TASK_ACTION_LABEL,
  OA_TASK_STATUS_COLOR,
  OA_TASK_STATUS_LABEL,
  type OaTaskItem,
} from '@/types/oa';
import { useAuthStore } from '@/stores/authStore';

const DATETIME_FORMAT = 'MM-DD HH:mm';
const PAGE_SIZE = 10;

type TaskMode = 'todo' | 'done';

/** 我的待办/已办：支持在移动端直接进行同意、驳回等审批操作。 */
export default function MobileTasksPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const [mode, setMode] = useState<TaskMode>('todo');
  const [keyword, setKeyword] = useState<string | undefined>(undefined);
  const [list, setList] = useState<OaTaskItem[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState<OaTaskItem | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(
    async (nextMode: TaskMode, page: number, kw?: string, append = false) => {
      setLoading(true);
      try {
        const params = { pageNum: page, pageSize: PAGE_SIZE, keyword: kw || undefined };
        const res =
          nextMode === 'todo'
            ? await oaTaskService.todo(params)
            : await oaTaskService.done(params);
        setList((prev) => (append ? [...prev, ...(res.list || [])] : res.list || []));
        setTotal(res.total || 0);
        setPageNum(page);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadData('todo', 1, undefined, false);
  }, [loadData]);

  const switchMode = (value: TaskMode) => {
    setMode(value);
    setKeyword(undefined);
    void loadData(value, 1, undefined, false);
  };

  const onSearch = (value: string) => {
    const kw = value || undefined;
    setKeyword(kw);
    void loadData(mode, 1, kw, false);
  };

  const openApprove = (record: OaTaskItem) => {
    setCurrent(record);
    setComment('');
  };

  const handleApprove = async (action: 'APPROVE' | 'REJECT') => {
    if (!current) return;
    setSubmitting(true);
    try {
      await oaTaskService.approve(current.taskId, {
        action,
        commentText: comment || undefined,
      });
      message.success(action === 'APPROVE' ? '已同意' : '已驳回');
      setCurrent(null);
      void loadData(mode, 1, keyword, false);
    } finally {
      setSubmitting(false);
    }
  };

  const loadMore = () => {
    if (list.length >= total) return;
    void loadData(mode, pageNum + 1, keyword, true);
  };

  return (
    <div>
      <Segmented
        block
        value={mode}
        onChange={(value) => switchMode(value as TaskMode)}
        options={[
          { label: '待办任务', value: 'todo' },
          { label: '已办任务', value: 'done' },
        ]}
        style={{ marginBottom: 12 }}
      />

      <Input.Search
        allowClear
        placeholder="实例编号 / 标题 / 流程"
        onSearch={onSearch}
        style={{ marginBottom: 12 }}
      />

      <Spin spinning={loading}>
        {list.length === 0 && !loading ? (
          <Empty description="暂无任务" style={{ marginTop: 48 }} />
        ) : (
          <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
            {list.map((item) => (
              <div key={item.taskId} className="mobile-list-item">
                <div className="mobile-row">
                  <span className="mobile-ellipsis" style={{ fontWeight: 500 }}>
                    {item.title || item.instanceNo || `任务 ${item.taskId}`}
                  </span>
                  <Tag
                    color={
                      mode === 'todo'
                        ? OA_TASK_STATUS_COLOR[item.taskStatus || ''] || 'default'
                        : OA_TASK_ACTION_COLOR[item.action || ''] || 'default'
                    }
                  >
                    {mode === 'todo'
                      ? OA_TASK_STATUS_LABEL[item.taskStatus || ''] || item.taskStatus || '-'
                      : OA_TASK_ACTION_LABEL[item.action || ''] || item.action || '-'}
                  </Tag>
                </div>
                <div
                  className="mobile-row"
                  style={{ marginTop: 4, fontSize: 12, color: '#8c8c8c' }}
                >
                  <span className="mobile-ellipsis">
                    {item.processName || '-'} · {item.applicantName || '-'}
                  </span>
                  <span>
                    {item.createdAt ? dayjs(item.createdAt).format(DATETIME_FORMAT) : '-'}
                  </span>
                </div>
                {mode === 'todo' &&
                  item.taskStatus === 'PENDING' &&
                  hasPermission('oa:task:approve') && (
                    <Space size="small" style={{ marginTop: 8 }}>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => openApprove(item)}
                      >
                        审批处理
                      </Button>
                    </Space>
                  )}
              </div>
            ))}
          </div>
        )}

        {list.length > 0 && list.length < total && (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Button size="small" onClick={loadMore} loading={loading}>
              加载更多
            </Button>
          </div>
        )}
      </Spin>

      <Modal
        title="处理审批任务"
        open={!!current}
        onCancel={() => setCurrent(null)}
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={() => setCurrent(null)}>
            取消
          </Button>,
          <Button
            key="reject"
            danger
            loading={submitting}
            onClick={() => void handleApprove('REJECT')}
          >
            驳回
          </Button>,
          <Button
            key="approve"
            type="primary"
            loading={submitting}
            onClick={() => void handleApprove('APPROVE')}
          >
            同意
          </Button>,
        ]}
      >
        {current && (
          <div style={{ marginBottom: 12, fontSize: 13, color: '#595959' }}>
            <div style={{ fontWeight: 500, color: '#262626', marginBottom: 6 }}>
              {current.title || current.instanceNo}
            </div>
            <div>
              流程：{current.processName || '-'} ｜ 申请人：{current.applicantName || '-'}
            </div>
            <div>当前节点：{current.nodeName || current.nodeCode || '-'}</div>
          </div>
        )}
        <Input.TextArea
          rows={3}
          placeholder="请输入审批意见"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Modal>
    </div>
  );
}
