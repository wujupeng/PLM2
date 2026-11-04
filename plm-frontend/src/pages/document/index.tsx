import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function DocumentManagement() {
  const navigate = useNavigate();
  return (
    <Result
      status="info"
      title="文档与图纸管理"
      subTitle="对应 S6 阶段 - 文档与图纸管理（TASK-S6-01 至 TASK-S6-08）"
      extra={<Button type="primary" onClick={() => navigate('/dashboard')}>返回工作台</Button>}
    />
  );
}