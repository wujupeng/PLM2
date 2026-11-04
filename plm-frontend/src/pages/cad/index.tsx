import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function CadIntegration() {
  const navigate = useNavigate();
  return (
    <Result
      status="info"
      title="CAD 集成"
      subTitle="对应 S4 阶段 - CAD 集成与技术验证（TASK-S4-01 至 TASK-S4-10）"
      extra={<Button type="primary" onClick={() => navigate('/dashboard')}>返回工作台</Button>}
    />
  );
}