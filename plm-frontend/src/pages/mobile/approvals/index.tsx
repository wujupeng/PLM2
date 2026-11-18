import { useCallback, useEffect, useState } from 'react';
import { Button, Empty, Input, Segmented, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import { oaInstanceService } from '@/services/oaService';
import {
  OA_INSTANCE_STATUS_COLOR,
  OA_INSTANCE_STATUS_LABEL,
  type OaProcessInstanceItem,
} from '@/types/oa';

const DATETIME_FORMAT = 'MM-DD HH:mm';
const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  { label: '全部', value: '' },
  { label: '审批中', value: 'RUNNING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
];

/** 我的审批：查看本人发起流程的审批进度与结果。 */
export default function MobileApprovalsPage() {
  const [status, setStatus] = useState('');
  const [keyword, setKeyword] = useState<string | undefined>(undefined);
  const [list, setList] = useState<OaProcessInstanceItem[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(
    async (nextStatus: string, page: number, kw?: string, append = false) => {
      setLoading(true);
      try {
        const res = await oaInstanceService.my({
          pageNum: page,
          pageSize: PAGE_SIZE,
          keyword: kw || undefined,
          instanceStatus: nextStatus || undefined,
        });
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
    void loadData('', 1, undefined, false);
  }, [loadData]);

  const switchStatus = (value: string) => {
    setStatus(value);
    void loadData(value, 1, keyword, false);
  };

  const onSearch = (value: string) => {
    const kw = value || undefined;
    setKeyword(kw);
    void loadData(status, 1, kw, false);
  };

  const loadMore = () => {
    if (list.length >= total) return;
    void loadData(status, pageNum + 1, keyword, true);
  };

  return (
    <div>
      <Segmented
        block
        value={status}
        onChange={(value) => switchStatus(value as string)}
        options={STATUS_FILTERS}
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
          <Empty description="暂无申请记录" style={{ marginTop: 48 }} />
        ) : (
          <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
            {list.map((item) => (
              <div key={item.id} className="mobile-list-item">
                <div className="mobile-row">
                  <span className="mobile-ellipsis" style={{ fontWeight: 500 }}>
                    {item.title || item.instanceNo}
                  </span>
                  <Tag color={OA_INSTANCE_STATUS_COLOR[item.instanceStatus || ''] || 'default'}>
                    {OA_INSTANCE_STATUS_LABEL[item.instanceStatus || ''] ||
                      item.instanceStatus ||
                      '-'}
                  </Tag>
                </div>
                <div
                  className="mobile-row"
                  style={{ marginTop: 4, fontSize: 12, color: '#8c8c8c' }}
                >
                  <span className="mobile-ellipsis">
                    {item.processName || '-'} · {item.instanceNo}
                  </span>
                  <span>
                    {item.createdAt ? dayjs(item.createdAt).format(DATETIME_FORMAT) : '-'}
                  </span>
                </div>
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
    </div>
  );
}
