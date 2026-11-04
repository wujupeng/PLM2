import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function SystemManagement() {
  const navigate = useNavigate();
  return (
    <Result
      status="info"
      title="系统管理"
      subTitle="对应 S11 阶段 - 权限工作流与系统管理（TASK-S11-01 至 TASK-S11-11）"
      extra={<Button type="primary" onClick={() => navigate('/dashboard')}>返回工作台</Button>}
    />
  );
}