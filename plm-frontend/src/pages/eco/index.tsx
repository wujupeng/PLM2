import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function EcoManagement() {
  const navigate = useNavigate();
  return (
    <Result
      status="info"
      title="工程变更管理"
      subTitle="对应 S5 阶段 - 工程变更闭环管理（TASK-S5-01 至 TASK-S5-12）"
      extra={<Button type="primary" onClick={() => navigate('/dashboard')}>返回工作台</Button>}
    />
  );
}